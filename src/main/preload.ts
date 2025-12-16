import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Docker
  checkDocker: () => ipcRenderer.invoke('check-docker'),
  
  // File system
  selectProjectFolder: () => ipcRenderer.invoke('select-project-folder'),
  
  // License
  getLicenseStatus: () => ipcRenderer.invoke('get-license-status'),
  registerLicense: (licenseKey: string) => ipcRenderer.invoke('register-license', licenseKey),
  removeLicense: () => ipcRenderer.invoke('remove-license'),
  
  // Analysis
  startAnalysis: (config: {
    projectPath: string;
    imageName: string;
  }) => ipcRenderer.invoke('start-analysis', config),
  
  stopAnalysis: (analysisId: string) => ipcRenderer.invoke('stop-analysis', analysisId),
  getAnalysisLogs: (analysisId: string) => ipcRenderer.invoke('get-analysis-logs', analysisId),
  getAnalysisResults: (analysisId: string) => ipcRenderer.invoke('get-analysis-results', analysisId),
  
  // Events
  onAnalysisLog: (callback: (analysisId: string, log: string) => void) => {
    ipcRenderer.on('analysis-log', (_event, analysisId, log) => callback(analysisId, log));
  },
  
  onAnalysisComplete: (callback: (analysisId: string, results: unknown) => void) => {
    ipcRenderer.on('analysis-complete', (_event, analysisId, results) => callback(analysisId, results));
  },
  
  onAnalysisError: (callback: (analysisId: string, error: string) => void) => {
    ipcRenderer.on('analysis-error', (_event, analysisId, error) => callback(analysisId, error));
  },
  
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
  
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
  
  // File operations
  createTempProjectFolder: (code: string) => ipcRenderer.invoke('create-temp-project-folder', code),
  openFolder: (folderPath: string) => ipcRenderer.invoke('open-folder', folderPath),
  createZip: (folderPath: string) => ipcRenderer.invoke('create-zip', folderPath),
  
  // Settings
  getReportsPath: () => ipcRenderer.invoke('get-reports-path'),
  setReportsPath: (path: string) => ipcRenderer.invoke('set-reports-path', path),
  resetReportsPath: () => ipcRenderer.invoke('reset-reports-path'),
  getDefaultReportsPath: () => ipcRenderer.invoke('get-default-reports-path'),
  selectReportsFolder: () => ipcRenderer.invoke('select-reports-folder'),
});

