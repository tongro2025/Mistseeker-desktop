import { DockerService } from './docker';
import { LicenseService } from './license';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

/**
 * Analysis configuration matching MistSeeker engine contract
 * This is just data - no computation
 */
export interface AnalysisConfig {
  projectPath: string; // Mounted as /workspace (read-only)
  imageName: string;
  outputPath: string; // Mounted as /output (writable)
}

/**
 * Analysis result - just state tracking
 */
export interface AnalysisResult {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  config: AnalysisConfig;
  logs: string[];
  results?: {
    json?: string; // From /output/result.json
    pdf?: string; // Path to /output/report.pdf
    log?: string; // From /output/run.log
    errors?: string[];
  };
  startTime: Date;
  endTime?: Date;
  error?: string;
  containerName?: string;
  exitCode?: number;
}

/**
 * Analysis Orchestrator
 * 
 * Philosophy: Orchestration over computation
 * - Just runs Docker commands
 * - Tracks state
 * - Streams logs
 * - No business logic
 */
export class AnalysisService extends EventEmitter {
  private analyses: Map<string, AnalysisResult> = new Map();
  private activeContainers: Map<string, string> = new Map(); // analysisId -> containerName

  constructor(
    private dockerService: DockerService,
    private licenseService: LicenseService
  ) {
    super();
  }

  /**
   * Start analysis - just orchestration, no computation
   */
  async startAnalysis(config: AnalysisConfig): Promise<string> {
    const analysisId = randomUUID();
    
    const analysis: AnalysisResult = {
      id: analysisId,
      status: 'running',
      config,
      logs: [],
      startTime: new Date(),
    };

    this.analyses.set(analysisId, analysis);

    // Run in background - pure orchestration
    this.runAnalysis(analysisId, config).catch((error) => {
      const analysis = this.analyses.get(analysisId);
      if (analysis) {
        analysis.status = 'failed';
        analysis.error = error.message;
        analysis.endTime = new Date();
        this.emit('analysis-error', analysisId, error.message);
      }
    });

    return analysisId;
  }

  /**
   * Run analysis - pure orchestration script
   * All logic is in Docker commands, not here
   */
  private async runAnalysis(analysisId: string, config: AnalysisConfig): Promise<void> {
    const analysis = this.analyses.get(analysisId);
    if (!analysis) {
      throw new Error('Analysis not found');
    }

    let containerName: string | undefined;

    try {
      // Ensure output directory exists (just file system setup)
      if (!fs.existsSync(config.outputPath)) {
        fs.mkdirSync(config.outputPath, { recursive: true });
      }

      // Check license file existence (just file check, no computation)
      let licensePath: string | undefined;
      const hasLicense = this.licenseService.hasLicense();
      const licenseFilePath = this.licenseService.getLicenseFilePath();
      
      console.log('[Analysis] License check:');
      console.log('  hasLicense():', hasLicense);
      console.log('  licenseFilePath:', licenseFilePath);
      console.log('  license file exists:', require('fs').existsSync(licenseFilePath));
      
      if (hasLicense) {
        licensePath = licenseFilePath;
        this.addLog(analysisId, '[Info] License file found - Pro mode enabled');
        console.log('[Analysis] Using Pro mode with license file:', licensePath);
      } else {
        this.addLog(analysisId, '[Info] No license file - Free mode');
        console.log('[Analysis] Using Free mode (no license file)');
      }
      
      // Generate container name (just ID generation)
      containerName = `mistseeker-${analysisId.substring(0, 8)}-${Date.now()}`;
      analysis.containerName = containerName;
      this.activeContainers.set(analysisId, containerName);

      // Execute docker run - this is the only real work
      // Everything else is just Docker orchestration
      this.addLog(analysisId, '[Info] Starting Docker container...');
      
      const result = await this.dockerService.runDockerCommand(
        {
        imageName: config.imageName,
        projectPath: config.projectPath,
        outputPath: config.outputPath,
          licensePath,
          containerName,
        },
        // Stream stdout live - pure passthrough
        (line: string) => {
          this.addLog(analysisId, line);
        },
        // Stream stderr live - pure passthrough
        (line: string) => {
          this.addLog(analysisId, line);
        }
      );

      // Capture exit code (just state tracking)
      analysis.exitCode = result.exitCode;

      // Read results from files
      this.addLog(analysisId, `[Info] Reading output files from: ${config.outputPath}`);
      const results = await this.readOutputFiles(config.outputPath);
      
      console.log('[Analysis] readOutputFiles returned:', {
        hasJson: !!results.json,
        hasPdf: !!results.pdf,
        errors: results.errors
      });
      
      // If we have JSON, it's a success
      if (results.json) {
        this.addLog(analysisId, '[Info] Analysis completed. Report file found.');
        analysis.status = 'completed';
        analysis.results = results;
        analysis.endTime = new Date();
        
        console.log('[Analysis] Emitting analysis-complete event for:', analysisId);
        console.log('[Analysis] Results:', {
          hasJson: !!results.json,
          hasPdf: !!results.pdf,
          jsonLength: results.json?.length
        });
        
        this.emit('analysis-complete', analysisId, results);
        console.log('[Analysis] Event emitted successfully');
      } else {
        // No JSON file found
        const errorMsg = `No report file found in output directory: ${config.outputPath}`;
        this.addLog(analysisId, `[Error] ${errorMsg}`);
        console.error('[Analysis] No JSON file found. Results:', results);
        throw new Error(errorMsg);
      }

      // Clean up
      this.activeContainers.delete(analysisId);

    } catch (error: any) {
      analysis.status = 'failed';
      analysis.error = error.message;
      analysis.endTime = new Date();
      this.addLog(analysisId, `[Error] ${error.message}`);
      this.emit('analysis-error', analysisId, error.message);
      
      // Clean up container on error (just Docker commands)
      if (containerName) {
        try {
          await this.dockerService.killContainer(containerName);
          await this.dockerService.removeContainer(containerName);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        this.activeContainers.delete(analysisId);
      }
    }
  }

  /**
   * Stop analysis - just Docker command orchestration
   */
  async stopAnalysis(analysisId: string): Promise<boolean> {
    const analysis = this.analyses.get(analysisId);
    if (!analysis || analysis.status !== 'running') {
      return false;
    }

    const containerName = this.activeContainers.get(analysisId);
    if (containerName) {
      try {
        // Just run Docker stop command
        await this.dockerService.killContainer(containerName);
        await this.dockerService.removeContainer(containerName);
        this.activeContainers.delete(analysisId);
        
        analysis.status = 'stopped';
        analysis.endTime = new Date();
        this.addLog(analysisId, '[Info] Analysis stopped by user');
        return true;
      } catch (error: any) {
        this.addLog(analysisId, `[Error] Failed to stop: ${error.message}`);
        return false;
      }
    }

    return false;
  }

  /**
   * Get logs - just state retrieval
   */
  getLogs(analysisId: string): string[] {
    const analysis = this.analyses.get(analysisId);
    return analysis?.logs || [];
  }

  /**
   * Get results - just state retrieval
   */
  getResults(analysisId: string): AnalysisResult | null {
    return this.analyses.get(analysisId) || null;
  }

  /**
   * Add log - just state update
   */
  private addLog(analysisId: string, log: string): void {
    const analysis = this.analyses.get(analysisId);
    if (analysis) {
      // Split multi-line logs
      const lines = log.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          analysis.logs.push(line);
        }
      }
      
      // Keep only last 10000 lines to prevent memory issues
      if (analysis.logs.length > 10000) {
        analysis.logs = analysis.logs.slice(-10000);
      }
      
      // Emit each line
      for (const line of lines) {
        if (line.trim()) {
          this.emit('analysis-log', analysisId, line);
    }
  }
    }
  }

  /**
   * Read output files - pure file I/O, no computation
   * Contract: /output/result.json, /output/report.pdf, /output/run.log
   */
  private async readOutputFiles(outputPath: string): Promise<{
    json?: string;
    pdf?: string;
    log?: string;
    errors?: string[];
  }> {
    const results: {
      json?: string;
      pdf?: string;
      log?: string;
      errors?: string[];
    } = {};

    const errors: string[] = [];

    // Log the output path being checked
    console.log('[Analysis] Reading output files from:', outputPath);
    console.log('[Analysis] Output directory exists:', fs.existsSync(outputPath));
    
    if (fs.existsSync(outputPath)) {
      const files = fs.readdirSync(outputPath);
      console.log('[Analysis] Files in output directory:', files);
      console.log('[Analysis] File count:', files.length);
      
      // List all files with their full paths
      files.forEach(file => {
        const filePath = path.join(outputPath, file);
        const stats = fs.statSync(filePath);
        console.log(`[Analysis]   - ${file} (${stats.size} bytes, ${stats.isFile() ? 'file' : 'directory'})`);
      });
    } else {
      console.error('[Analysis] Output directory does not exist!');
    }

    try {
      // Simple: Just find any .json file in the output directory
      if (fs.existsSync(outputPath)) {
        const files = fs.readdirSync(outputPath);
        console.log('[Analysis] All files in output directory:', files);
        
        // Find JSON file
        const jsonFile = files.find(f => f.endsWith('.json'));
        if (jsonFile) {
          const jsonPath = path.join(outputPath, jsonFile);
          results.json = fs.readFileSync(jsonPath, 'utf-8');
          console.log('[Analysis] Found JSON report:', jsonFile);
        } else {
          errors.push(`No JSON file found in output directory: ${outputPath}`);
          console.log('[Analysis] No JSON file found. Available files:', files);
        }
        
        // Find image/PDF file - check for common image formats
        const imageExtensions = ['.png', '.pdf', '.jpg', '.jpeg'];
        const imageFile = files.find(f => {
          const ext = path.extname(f).toLowerCase();
          return imageExtensions.includes(ext);
        });
        
        if (imageFile) {
          results.pdf = path.join(outputPath, imageFile);
          console.log('[Analysis] Found image/PDF report:', imageFile);
        } else {
          console.log('[Analysis] No image/PDF file found. Available files:', files);
          console.log('[Analysis] Looking for files with extensions:', imageExtensions);
        }
      } else {
        console.error('[Analysis] Output directory does not exist:', outputPath);
        errors.push(`Output directory does not exist: ${outputPath}`);
      }

      // Read run.log (contract: /output/run.log) - optional
      const runLogPath = path.join(outputPath, 'run.log');
      if (fs.existsSync(runLogPath)) {
        results.log = fs.readFileSync(runLogPath, 'utf-8');
        console.log('[Analysis] Found run.log');
      }

      // If no expected files found at all, that's an error
      if (!results.json && !results.pdf) {
        errors.push(`No output files found. Expected result.json and/or report.pdf in output directory: ${outputPath}`);
      }
    } catch (error: any) {
      errors.push(`Error reading output files: ${error.message}`);
      console.error('[Analysis] Error reading output files:', error);
    }

    if (errors.length > 0) {
      results.errors = errors;
      console.error('[Analysis] Errors reading output files:', errors);
    }

    return results;
  }

  getAllAnalyses(): AnalysisResult[] {
    return Array.from(this.analyses.values());
  }

  getAnalysis(analysisId: string): AnalysisResult | null {
    return this.analyses.get(analysisId) || null;
  }
}
