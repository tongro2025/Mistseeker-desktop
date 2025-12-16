/**
 * Shared constants for MistSeeker Desktop
 */

export const DEFAULT_DOCKER_IMAGE = 'tongro2025/mistseeker:latest';

export const DEFAULT_LICENSE_SERVER_URL = 'https://convia.vip';

export const WORKSPACE_PATHS = {
  PROJECT: '/workspace',
  OUTPUT: '/output',
} as const;

export const IPC_CHANNELS = {
  // Docker
  CHECK_DOCKER: 'check-docker',
  // File system
  SELECT_PROJECT_FOLDER: 'select-project-folder',
  // License
  GET_LICENSE_STATUS: 'get-license-status',
  REGISTER_LICENSE: 'register-license',
  // Analysis
  START_ANALYSIS: 'start-analysis',
  STOP_ANALYSIS: 'stop-analysis',
  GET_ANALYSIS_LOGS: 'get-analysis-logs',
  GET_ANALYSIS_RESULTS: 'get-analysis-results',
  // Events
  ANALYSIS_LOG: 'analysis-log',
  ANALYSIS_COMPLETE: 'analysis-complete',
  ANALYSIS_ERROR: 'analysis-error',
  // File operations
  OPEN_FILE: 'open-file',
} as const;

