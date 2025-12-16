/**
 * Shared types for MistSeeker Desktop
 */

export type Platform = 'win32' | 'darwin' | 'linux';

export interface DockerStatus {
  available: boolean;
  error?: string;
  version?: string;
}

export interface LicenseStatus {
  type: 'free' | 'pro';
}

export interface AnalysisConfig {
  projectPath: string;
  imageName: string;
  outputPath: string;
  env?: Record<string, string>;
}

export interface AnalysisResult {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  config: AnalysisConfig;
  logs: string[];
  results?: {
    json?: string;
    pdf?: string;
    errors?: string[];
  };
  startTime: Date;
  endTime?: Date;
  error?: string;
  containerId?: string;
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

