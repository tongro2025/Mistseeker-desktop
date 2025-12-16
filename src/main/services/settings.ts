import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class SettingsService {
  private settingsFilePath: string;
  private defaultReportsPath: string;

  constructor() {
    this.settingsFilePath = path.join(app.getPath('userData'), 'settings.json');
    this.defaultReportsPath = this.getDefaultReportsPath();
  }

  /**
   * Get default reports path based on OS
   * Windows: Documents/MistSeeker Reports
   * macOS: ~/Documents/MistSeeker Reports
   */
  private getDefaultReportsPath(): string {
    const documentsPath = app.getPath('documents');
    return path.join(documentsPath, 'MistSeeker Reports');
  }

  /**
   * Get current reports output directory
   */
  getReportsPath(): string {
    const settings = this.loadSettings();
    const reportsPath = settings.reportsPath || this.defaultReportsPath;
    console.log('[Settings] getReportsPath called:');
    console.log('  Settings file path:', this.settingsFilePath);
    console.log('  Loaded settings:', settings);
    console.log('  Default reports path:', this.defaultReportsPath);
    console.log('  Returning reports path:', reportsPath);
    return reportsPath;
  }

  /**
   * Set custom reports output directory
   */
  setReportsPath(reportsPath: string): void {
    const settings = this.loadSettings();
    settings.reportsPath = reportsPath;
    this.saveSettings(settings);
  }

  /**
   * Reset to default reports path
   */
  resetReportsPath(): void {
    const settings = this.loadSettings();
    settings.reportsPath = this.defaultReportsPath;
    this.saveSettings(settings);
  }

  /**
   * Generate output path for a scan
   * Format: <ReportsPath>/<ProjectName>/<Timestamp>/
   * Ensures output path is not inside the project directory
   */
  generateOutputPath(projectPath: string): string {
    // Always use the user-set reports path, don't override it
    const reportsPath = this.getReportsPath();
    const projectName = this.getProjectName(projectPath);
    const timestamp = new Date().toISOString()
      .replace(/T/, '_')
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    
    const outputPath = path.join(reportsPath, projectName, timestamp);
    
    console.log('[Settings] Generating output path:');
    console.log('  User-set reports path:', reportsPath);
    console.log('  Project name:', projectName);
    console.log('  Timestamp:', timestamp);
    console.log('  Final output path:', outputPath);
    
    // Ensure directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
      console.log('[Settings] Created output directory:', outputPath);
    }
    
    return outputPath;
  }

  /**
   * Extract project name from path
   */
  private getProjectName(projectPath: string): string {
    // Get the folder name from the path
    let projectName = path.basename(projectPath);
    
    // If it's a temp folder, use a generic name
    if (projectName.startsWith('mistseeker-')) {
      projectName = 'Pasted Code';
    }
    
    // Sanitize project name for filesystem
    projectName = projectName.replace(/[<>:"/\\|?*]/g, '_');
    
    // Limit length
    if (projectName.length > 50) {
      projectName = projectName.substring(0, 50);
    }
    
    return projectName || 'Untitled Project';
  }

  /**
   * Load settings from file
   */
  private loadSettings(): { reportsPath?: string } {
    try {
      if (fs.existsSync(this.settingsFilePath)) {
        const content = fs.readFileSync(this.settingsFilePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return {};
  }

  /**
   * Save settings to file
   */
  private saveSettings(settings: { reportsPath?: string }): void {
    try {
      fs.writeFileSync(
        this.settingsFilePath,
        JSON.stringify(settings, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Get default reports path (for UI display)
   */
  getDefaultReportsPathValue(): string {
    return this.defaultReportsPath;
  }
}

