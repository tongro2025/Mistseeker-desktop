/**
 * MistSeeker Desktop - Main Process
 * 
 * Core Philosophy:
 * - This is a UX layer, NOT a replacement for the Docker engine
 * - Orchestration over computation
 * - Scripts over services
 * - Transparency over abstraction
 * 
 * All features are implemented via:
 * - Docker arguments (docker run flags)
 * - Mount paths (volume mounts)
 * - UI affordances (React components)
 * 
 * NO backend logic for analysis - that lives in the Docker container.
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';
import { DockerService } from './services/docker';
import { LicenseService } from './services/license';
import { AnalysisService } from './services/analysis';
import { SettingsService } from './services/settings';

const execAsync = promisify(exec);

let mainWindow: BrowserWindow | null = null;
const dockerService = new DockerService();
const licenseService = new LicenseService();
const settingsService = new SettingsService();
const analysisService = new AnalysisService(dockerService, licenseService);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // 창을 먼저 숨기고 로드 완료 후 표시
  });

  // 페이지 로드 완료 후 창 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Check if we're in development mode
  // app.isPackaged is false when running from source (npm run dev)
  const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // In development, use Vite dev server
    console.log('Development mode: Loading from http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from file
    console.log('Production mode: Loading from file');
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Set up analysis service event listeners
  analysisService.on('analysis-complete', (analysisId: string, results: any) => {
    console.log('[Main] Analysis complete event received:', analysisId);
    const analysisResult = analysisService.getResults(analysisId);
    if (analysisResult && analysisResult.config) {
      const outputPath = analysisResult.config.outputPath;
      // Auto-open results folder on completion
      shell.openPath(outputPath).catch((error) => {
        console.error('Failed to open results folder:', error);
      });
    }
    // Forward to renderer
    mainWindow?.webContents.send('analysis-complete', analysisId, results);
  });

  analysisService.on('analysis-error', (analysisId: string, error: string) => {
    console.log('[Main] Analysis error event received:', analysisId, error);
    mainWindow?.webContents.send('analysis-error', analysisId, error);
  });

  analysisService.on('analysis-log', (analysisId: string, log: string) => {
    mainWindow?.webContents.send('analysis-log', analysisId, log);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('check-docker', async () => {
  console.log('[Main] IPC: check-docker handler called');
  try {
    const result = await dockerService.checkDockerAvailable();
    console.log('[Main] IPC: check-docker result:', result);
    return result;
  } catch (error) {
    console.error('[Main] IPC: check-docker error:', error);
    throw error;
  }
});

ipcMain.handle('select-project-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('get-license-status', async () => {
  console.log('[Main] IPC: get-license-status handler called');
  try {
    const result = await licenseService.getLicenseStatus();
    console.log('[Main] IPC: get-license-status result:', result);
    return result;
  } catch (error) {
    console.error('[Main] IPC: get-license-status error:', error);
    throw error;
  }
});

ipcMain.handle('remove-license', async () => {
  console.log('[Main] IPC: remove-license handler called');
  try {
    licenseService.removeLicense();
    console.log('[Main] IPC: License removed successfully');
    return { success: true };
  } catch (error) {
    console.error('[Main] IPC: remove-license error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove license' };
  }
});

ipcMain.handle('register-license', async (_event, licenseKey: string) => {
  return await licenseService.registerLicense(licenseKey);
});

ipcMain.handle('start-analysis', async (_event, config: {
  projectPath: string;
  imageName: string;
}) => {
  // Generate user-friendly output path
  const reportsPath = settingsService.getReportsPath();
  const outputPath = settingsService.generateOutputPath(config.projectPath);
  
  // Log the paths for debugging
  console.log('[Analysis] Reports path:', reportsPath);
  console.log('[Analysis] Generated output path:', outputPath);
  console.log('[Analysis] Project path:', config.projectPath);
  
  return await analysisService.startAnalysis({
    ...config,
    outputPath,
  });
});

ipcMain.handle('stop-analysis', async (_event, analysisId: string) => {
  return await analysisService.stopAnalysis(analysisId);
});

ipcMain.handle('get-analysis-logs', async (_event, analysisId: string) => {
  return await analysisService.getLogs(analysisId);
});

ipcMain.handle('get-analysis-results', async (_event, analysisId: string) => {
  return await analysisService.getResults(analysisId);
});

// Event listeners are set up in app.whenReady() above

ipcMain.handle('open-file', async (_event, filePath: string) => {
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-folder', async (_event, folderPath: string) => {
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-temp-project-folder', async (_event, code: string) => {
  try {
    // Create a temporary directory
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'mistseeker-'));
    const codeFile = path.join(tempDir, 'code.txt');
    
    // Write code to file
    await fs.promises.writeFile(codeFile, code, 'utf-8');
    
    return tempDir;
  } catch (error: any) {
    throw new Error(`Failed to create temporary project folder: ${error.message}`);
  }
});

ipcMain.handle('create-zip', async (_event, folderPath: string) => {
  try {
    if (!fs.existsSync(folderPath)) {
      throw new Error('Output folder does not exist');
    }

    const folderName = path.basename(folderPath);
    const parentDir = path.dirname(folderPath);
    const zipPath = path.join(parentDir, `${folderName}.zip`);
    
    // Use native zip command (works on macOS and Linux)
    // For Windows, we'd need a different approach
    if (process.platform === 'win32') {
      // Windows: Use PowerShell Compress-Archive
      const escapedPath = folderPath.replace(/"/g, '""');
      const escapedZipPath = zipPath.replace(/"/g, '""');
      await execAsync(`powershell -Command "Compress-Archive -Path '${escapedPath}' -DestinationPath '${escapedZipPath}' -Force"`);
    } else {
      // macOS/Linux: Use zip command
      await execAsync(`cd "${parentDir}" && zip -r "${path.basename(zipPath)}" "${folderName}"`);
    }
    
    return zipPath;
  } catch (error: any) {
    throw new Error(`Failed to create ZIP file: ${error.message}`);
  }
});

// Settings IPC handlers
ipcMain.handle('get-reports-path', async () => {
  return settingsService.getReportsPath();
});

ipcMain.handle('set-reports-path', async (_event, reportsPath: string) => {
  settingsService.setReportsPath(reportsPath);
  return { success: true };
});

ipcMain.handle('reset-reports-path', async () => {
  settingsService.resetReportsPath();
  return { success: true };
});

ipcMain.handle('get-default-reports-path', async () => {
  return settingsService.getDefaultReportsPathValue();
});

ipcMain.handle('select-reports-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

