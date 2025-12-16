import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { getDockerCommand, normalizeDockerPath } from '../../shared/os-detection';

const execAsync = promisify(exec);

/**
 * Docker run configuration matching MistSeeker engine contract
 * Just data - no logic
 */
export interface DockerRunConfig {
  imageName: string;
  projectPath: string; // Mounted as /workspace (read-only)
  outputPath: string; // Mounted as /output (writable)
  licensePath?: string; // Optional: Mounted as /license/license.json (read-only)
  containerName?: string;
  enableGeometric?: boolean; // Enable geometric engine (GSS)
  coiThreshold?: number; // COI threshold (0-1)
  oriThreshold?: number; // ORI threshold (0-1)
  gssThreshold?: number; // GSS threshold (0-1)
}

/**
 * Docker run result - just exit code and output
 */
export interface DockerRunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  containerName: string;
}

export interface ContainerProcess {
  containerName: string;
  process: ChildProcess;
  stdout: string;
  stderr: string;
}

/**
 * Docker Script Runner
 * 
 * Philosophy: Scripts over services, transparency over abstraction
 * - Builds explicit docker commands
 * - Executes them via child_process
 * - Streams output live
 * - No abstraction - you see exactly what runs
 */
export class DockerService {
  private dockerAvailable: boolean | null = null;
  private activeProcesses: Map<string, ContainerProcess> = new Map();

  /**
   * Check if Docker CLI is available
   * Just runs: docker info
   */
  async checkDockerAvailable(): Promise<{ available: boolean; error?: string; version?: string }> {
    if (this.dockerAvailable !== null) {
      return { available: this.dockerAvailable };
    }

    try {
      const dockerCmd = getDockerCommand();
      
      // Just run docker info
      await execAsync(`${dockerCmd} info`);
      
      // Get version
      let version: string | undefined;
      try {
        const versionResult = await execAsync(`${dockerCmd} --version`);
        version = versionResult.stdout.trim();
      } catch {
        // Version check failed, but Docker is available
      }
      
      this.dockerAvailable = true;
      return { available: true, version };
    } catch (error: any) {
      this.dockerAvailable = false;
      const errorMessage = error.message || error.stderr || 'Docker is not available';
      
      if (errorMessage.includes('Cannot connect') || 
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('Is the docker daemon running')) {
        return {
          available: false,
          error: 'Docker Desktop is installed but not running. Please start Docker Desktop and try again.',
        };
      }
      
      return {
        available: false,
        error: 'Docker CLI is not available or not accessible. Please install Docker Desktop and ensure it is in your PATH.',
      };
    }
  }

  /**
   * Pull Docker image
   * Just runs: docker pull <image>
   */
  async pullImage(imageName: string, onOutput?: (line: string) => void): Promise<void> {
    const dockerCmd = getDockerCommand();
    const command = `${dockerCmd} pull ${imageName}`;
    
    if (onOutput) {
      onOutput(`[Docker] ${command}\n`);
    }

    return new Promise((resolve, reject) => {
      const pullProcess = spawn(dockerCmd, ['pull', imageName], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      pullProcess.stdout?.on('data', (data: Buffer) => {
        const line = data.toString('utf-8');
        if (onOutput) {
          onOutput(line);
        }
      });

      pullProcess.stderr?.on('data', (data: Buffer) => {
        const line = data.toString('utf-8');
        if (onOutput) {
          onOutput(line);
        }
      });

      pullProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
          } else {
          reject(new Error(`docker pull failed with exit code ${code}`));
          }
        });

      pullProcess.on('error', (error) => {
        reject(new Error(`Failed to execute docker pull: ${error.message}`));
      });
    });
  }

  /**
   * Build docker run command explicitly
   * 
   * Contract:
   * docker run --rm \
   *   -v <PROJECT_PATH>:/workspace:ro \
   *   -v <OUTPUT_PATH>:/output \
   *   -v <LICENSE_JSON>:/license/license.json:ro \
   *   <IMAGE_NAME> \
   *   analyze --input-root /workspace \
   *     --output-json /output/result.json \
   *     --output-image /output/report.png
   * 
   * Returns command string for transparency
   */
  buildDockerRunCommand(config: DockerRunConfig): {
    command: string;
    args: string[];
    normalizedProjectPath: string;
    normalizedOutputPath: string;
    normalizedLicensePath?: string;
  } {
    const dockerCmd = getDockerCommand();
    const containerName = config.containerName || `mistseeker-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Normalize paths for Docker volume mounts (OS-specific)
    const normalizedProjectPath = normalizeDockerPath(config.projectPath);
    const normalizedOutputPath = normalizeDockerPath(config.outputPath);
    const normalizedLicensePath = config.licensePath ? normalizeDockerPath(config.licensePath) : undefined;

    // Build docker run command arguments - explicit and transparent
    const args: string[] = [
      'run',
      '--rm', // Auto-remove container when it stops
      '--name', containerName,
      '-v', `${normalizedProjectPath}:/workspace:ro`, // Read-only project mount
      '-v', `${normalizedOutputPath}:/output`, // Writable output mount
    ];

    // Add license mount and environment variable if provided (optional)
    console.log('[Docker] License check:');
    console.log('  normalizedLicensePath:', normalizedLicensePath);
    console.log('  config.licensePath:', config.licensePath);
    
    if (normalizedLicensePath && config.licensePath) {
      console.log('[Docker] License path provided, checking file existence...');
      const licenseFileExists = fs.existsSync(config.licensePath);
      console.log('  License file exists:', licenseFileExists);
      console.log('  License file path:', config.licensePath);
      
      // Verify license file exists
      if (licenseFileExists) {
        // Mount license file
        args.push('-v', `${normalizedLicensePath}:/license/license.json:ro`);
        console.log('[Docker] License file mounted to /license/license.json:ro');
        
        // Read license key from file and set as environment variable
        // MistSeeker expects MISTSEEKER_LICENSE_KEY environment variable
        try {
          const licenseContent = fs.readFileSync(config.licensePath, 'utf-8');
          console.log('[Docker] Reading license file:', config.licensePath);
          console.log('[Docker] License file content (first 200 chars):', licenseContent.substring(0, 200));
          
          const licenseData = JSON.parse(licenseContent);
          const licenseKey = licenseData.license_key || licenseData.licenseKey;
          
          console.log('[Docker] Extracted license key:', licenseKey ? licenseKey.substring(0, 10) + '...' : 'NOT FOUND');
          console.log('[Docker] License data keys:', Object.keys(licenseData));
          
          if (licenseKey) {
            args.push('-e', `MISTSEEKER_LICENSE_KEY=${licenseKey}`);
            console.log('[Docker] ✅ Added MISTSEEKER_LICENSE_KEY environment variable to docker args');
            console.log('[Docker] Current args after adding env var:', args.slice(-5));
          } else {
            console.warn('[Docker] ⚠️ License file exists but no license_key found in it');
            console.warn('[Docker] License data:', JSON.stringify(licenseData, null, 2));
          }
        } catch (error) {
          console.error('[Docker] ❌ Failed to read license file:', error);
        }
      } else {
        console.warn('[Docker] ⚠️ License path provided but file does not exist:', config.licensePath);
      }
    } else {
      console.log('[Docker] No license path provided - will run in Free mode');
    }

    // Add image name
    args.push(config.imageName);

    // Add MistSeeker engine command arguments
    // MistSeeker automatically detects license from MISTSEEKER_LICENSE_KEY env var or /license/license.json
    // So we always use 'analyze' and let MistSeeker decide the mode
    args.push('analyze', '--input-root', '/workspace');
    
    // Explicitly specify output paths to ensure files are written to /output volume
    // MistSeeker default names: mistseeker_report.json, mistseeker_report.png
    args.push('--output-json', '/output/mistseeker_report.json');
    args.push('--output-image', '/output/mistseeker_report.png');

    // Add optional flags
    if (config.enableGeometric) {
      args.push('--enable-geometric');
    }

    if (config.coiThreshold !== undefined) {
      args.push('--coi-threshold', config.coiThreshold.toString());
    }

    if (config.oriThreshold !== undefined) {
      args.push('--ori-threshold', config.oriThreshold.toString());
    }

    if (config.gssThreshold !== undefined) {
      args.push('--gss-threshold', config.gssThreshold.toString());
    }

    // Construct full command string for transparency
    const command = `${dockerCmd} ${args.join(' ')}`;

    // Debug logging
    console.log('[Docker] buildDockerRunCommand - Full args array:', args);
    console.log('[Docker] buildDockerRunCommand - Command string:', command);

    return {
      command,
      args,
      normalizedProjectPath,
      normalizedOutputPath,
      normalizedLicensePath,
    };
  }

  /**
   * Execute docker run command and stream output live
   * 
   * Philosophy: Transparency over abstraction
   * - You see the exact command
   * - You see all paths
   * - You see all output
   * - No hidden behavior
   */
  async runDockerCommand(
    config: DockerRunConfig,
    onStdout?: (line: string) => void,
    onStderr?: (line: string) => void
  ): Promise<DockerRunResult> {
    // Validate project path exists
    if (!fs.existsSync(config.projectPath)) {
      const errorMsg = `Project path does not exist: ${config.projectPath}`;
      if (onStderr) {
        onStderr(`[Error] ${errorMsg}\n`);
      }
      throw new Error(errorMsg);
    }

    // Ensure output directory exists (just file system setup)
    if (!fs.existsSync(config.outputPath)) {
      fs.mkdirSync(config.outputPath, { recursive: true });
    }
    
    // Validate output path is writable
    try {
      const testFile = path.join(config.outputPath, '.write-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (error: any) {
      const errorMsg = `Output path is not writable: ${config.outputPath}`;
      if (onStderr) {
        onStderr(`[Error] ${errorMsg}\n`);
      }
      throw new Error(errorMsg);
    }

    // Check if image exists, if not, pull it
    const imageExists = await this.imageExists(config.imageName);
    if (!imageExists) {
      if (onStdout) {
        onStdout(`[Docker] Image ${config.imageName} not found locally. Pulling...\n`);
      }
      try {
        await this.pullImage(config.imageName, onStdout);
        if (onStdout) {
          onStdout(`[Docker] Image ${config.imageName} pulled successfully.\n`);
        }
      } catch (error: any) {
        const errorMsg = `Failed to pull Docker image ${config.imageName}: ${error.message}`;
        if (onStderr) {
          onStderr(`[Error] ${errorMsg}\n`);
        } else if (onStdout) {
          onStdout(`[Error] ${errorMsg}\n`);
        }
        throw new Error(errorMsg);
      }
    }

    // Build the command explicitly
    const { command, args, normalizedProjectPath, normalizedOutputPath, normalizedLicensePath } = this.buildDockerRunCommand(config);
    const containerName = config.containerName || args[args.indexOf('--name') + 1];

    // Log the exact command being executed (transparency)
    const commandLog = `[Docker] Executing: ${command}\n`;
    if (onStdout) {
      onStdout(commandLog);
    }

    // Log all mount paths (transparency)
    let pathLog = `[Docker] Mounts:\n` +
                  `  Project: ${normalizedProjectPath} -> /workspace:ro\n` +
                  `  Output: ${normalizedOutputPath} -> /output\n`;
    if (normalizedLicensePath) {
      pathLog += `  License: ${normalizedLicensePath} -> /license/license.json:ro\n`;
    }
    if (onStdout) {
      onStdout(pathLog);
    }
    
    // Log paths for debugging
    console.log('[Docker] Original output path:', config.outputPath);
    console.log('[Docker] Normalized output path:', normalizedOutputPath);
    console.log('[Docker] Output path exists:', fs.existsSync(config.outputPath));
    console.log('[Docker] Output path is writable:', (() => {
      try {
        const testFile = path.join(config.outputPath, '.write-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        return true;
      } catch {
        return false;
      }
    })());

    const dockerCmd = getDockerCommand();

    // Debug: Log the actual args that will be passed to spawn
    console.log('[Docker] runDockerCommand - dockerCmd:', dockerCmd);
    console.log('[Docker] runDockerCommand - args array:', args);
    console.log('[Docker] runDockerCommand - args length:', args.length);
    console.log('[Docker] runDockerCommand - last few args:', args.slice(-10));

    return new Promise((resolve, reject) => {
      // Spawn docker run process - pure script execution
      console.log('[Docker] About to spawn docker process...');
      const dockerProcess = spawn(dockerCmd, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      console.log('[Docker] Docker process spawned, PID:', dockerProcess.pid);

      let stdout = '';
      let stderr = '';

      // Stream stdout live - pure passthrough
      dockerProcess.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString('utf-8');
        stdout += chunk;
        console.log('[Docker] Received stdout chunk:', chunk.substring(0, 100));
        if (onStdout) {
          onStdout(chunk);
        }
      });

      // Stream stderr live - pure passthrough
      dockerProcess.stderr?.on('data', (data: Buffer) => {
        const chunk = data.toString('utf-8');
        stderr += chunk;
        console.log('[Docker] Received stderr chunk:', chunk.substring(0, 100));
        if (onStderr) {
          onStderr(chunk);
        } else if (onStdout) {
          // If no stderr handler, send to stdout handler
          onStdout(chunk);
        }
      });

      // Log when streams are closed
      dockerProcess.stdout?.on('end', () => {
        console.log('[Docker] stdout stream ended');
      });

      dockerProcess.stderr?.on('end', () => {
        console.log('[Docker] stderr stream ended');
      });

      // Handle process completion
      dockerProcess.on('close', (code) => {
        const exitCode = code || 0;
        console.log('[Docker] Process closed with exit code:', exitCode);
        console.log('[Docker] Total stdout length:', stdout.length);
        console.log('[Docker] Total stderr length:', stderr.length);
        
        const result: DockerRunResult = {
          exitCode,
          stdout,
          stderr,
          containerName,
    };

        // MistSeeker may exit with code 1 when problems are found, but still generates reports
        // We'll let the caller (analysis.ts) decide if it's a success based on output files
        if (exitCode === 0) {
          console.log('[Docker] Process completed successfully');
          resolve(result);
        } else {
          console.log('[Docker] Process exited with code:', exitCode);
          // Check if stdout indicates report was saved (MistSeeker outputs "Report saved: ...")
          const reportSaved = stdout.includes('Report saved:') || stdout.includes('mistseeker_report.json');
          
          if (reportSaved) {
            console.log('[Docker] Report was saved despite exit code', exitCode, '- treating as success');
            // Resolve even with exit code 1 if report was saved
            resolve(result);
          } else {
            console.log('[Docker] Process failed with exit code:', exitCode, 'and no report found');
            // Provide more detailed error information
            const errorDetails = [
              `Docker command failed with exit code ${exitCode}`,
              `Command: ${command}`,
              `Container: ${containerName}`,
              stderr ? `Error output:\n${stderr}` : '',
              stdout ? `Standard output:\n${stdout}` : '',
            ].filter(Boolean).join('\n');
            
            reject(new Error(errorDetails));
          }
        }
      });

      // Handle process errors
      dockerProcess.on('error', (error) => {
        console.error('[Docker] Process error:', error);
        const errorDetails = [
          `Failed to execute docker run: ${error.message}`,
          `Command: ${command}`,
          `Container: ${containerName}`,
          `Make sure Docker is running and the image "${config.imageName}" is available.`,
        ].join('\n');
        
        reject(new Error(errorDetails));
      });

      // Store process for potential cleanup
      this.activeProcesses.set(containerName, {
        containerName,
        process: dockerProcess,
        stdout,
        stderr,
      });
    });
  }

  /**
   * Stop container - just runs: docker stop <name>
   */
  async stopContainer(containerName: string): Promise<void> {
    const dockerCmd = getDockerCommand();
    const command = `${dockerCmd} stop ${containerName}`;

    try {
      await execAsync(command);
    } catch (error: any) {
      // Container might already be stopped
      if (!error.message.includes('No such container') && 
          !error.message.includes('is not running')) {
        throw error;
      }
    } finally {
      this.activeProcesses.delete(containerName);
    }
  }

  /**
   * Remove container - just runs: docker rm -f <name>
   */
  async removeContainer(containerName: string): Promise<void> {
    const dockerCmd = getDockerCommand();
    const command = `${dockerCmd} rm -f ${containerName}`;

    try {
      await execAsync(command);
    } catch (error: any) {
      // Container might already be removed
      if (!error.message.includes('No such container')) {
        throw error;
      }
    } finally {
      this.activeProcesses.delete(containerName);
    }
  }

  /**
   * Kill container - sends SIGTERM then SIGKILL
   */
  async killContainer(containerName: string): Promise<void> {
    const containerProcess = this.activeProcesses.get(containerName);
    
    if (containerProcess && containerProcess.process) {
      // Kill the process
      containerProcess.process.kill('SIGTERM');
      
      // Wait a bit, then force kill if still running
      setTimeout(() => {
        if (!containerProcess.process.killed) {
          containerProcess.process.kill('SIGKILL');
        }
      }, 5000);
  }

    // Also try docker stop
    try {
      await this.stopContainer(containerName);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Get container logs - just runs: docker logs <name>
   */
  async getContainerLogs(containerName: string, tail: number = 100): Promise<string> {
    const dockerCmd = getDockerCommand();
    const command = `${dockerCmd} logs --tail ${tail} ${containerName}`;

    try {
      const { stdout, stderr } = await execAsync(command);
      return stdout + stderr;
    } catch (error: any) {
      throw new Error(`Failed to get container logs: ${error.message}`);
    }
  }

  /**
   * Check if image exists - just runs: docker image inspect <name>
   */
  async imageExists(imageName: string): Promise<boolean> {
    const dockerCmd = getDockerCommand();
    const command = `${dockerCmd} image inspect ${imageName}`;

    try {
      await execAsync(command);
      return true;
    } catch {
      return false;
  }
}
}
