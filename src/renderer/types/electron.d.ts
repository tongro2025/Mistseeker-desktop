export interface ElectronAPI {
  checkDocker: () => Promise<{ available: boolean; error?: string }>;
  selectProjectFolder: () => Promise<string | null>;
  getLicenseStatus: () => Promise<{
    type: 'free' | 'pro';
  }>;
  registerLicense: (licenseKey: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  removeLicense: () => Promise<{
    success: boolean;
    error?: string;
  }>;
  startAnalysis: (config: {
    projectPath: string;
    imageName: string;
  }) => Promise<string>;
  stopAnalysis: (analysisId: string) => Promise<boolean>;
  getAnalysisLogs: (analysisId: string) => Promise<string[]>;
  getAnalysisResults: (analysisId: string) => Promise<unknown>;
  onAnalysisLog: (callback: (analysisId: string, log: string) => void) => void;
  onAnalysisComplete: (callback: (analysisId: string, results: unknown) => void) => void;
  onAnalysisError: (callback: (analysisId: string, error: string) => void) => void;
  removeAllListeners: (channel: string) => void;
  openFile?: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  createTempProjectFolder?: (code: string) => Promise<string>;
  openFolder?: (folderPath: string) => Promise<{ success: boolean; error?: string }>;
  createZip?: (folderPath: string) => Promise<string>;
  
  // Settings
  getReportsPath?: () => Promise<string>;
  setReportsPath?: (path: string) => Promise<{ success: boolean }>;
  resetReportsPath?: () => Promise<{ success: boolean }>;
  getDefaultReportsPath?: () => Promise<string>;
  selectReportsFolder?: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}


