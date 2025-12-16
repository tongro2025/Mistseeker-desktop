import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface LicenseStatus {
  type: 'free' | 'pro';
}

export class LicenseService {
  private licenseServerUrl: string;
  private licenseFilePath: string;

  constructor() {
    // License server base URL - always use convia.vip
    this.licenseServerUrl = 'https://convia.vip';
    this.licenseFilePath = path.join(app.getPath('userData'), 'license.json');
    console.log('[License] LicenseService initialized with URL:', this.licenseServerUrl);
  }

  /**
   * Get license status based on file existence
   * - license.json exists → Pro mode
   * - license.json doesn't exist → Free mode
   */
  async getLicenseStatus(): Promise<LicenseStatus> {
    if (fs.existsSync(this.licenseFilePath)) {
      return { type: 'pro' };
    }
    return { type: 'free' };
  }

  /**
   * Register license key with remote server
   * 1. Send license key to server
   * 2. Server returns signed license.json
   * 3. Store license.json locally
   */
  async registerLicense(licenseKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Use /api/license/verify endpoint for license registration/verification
      const licenseApiUrl = `${this.licenseServerUrl}/api/license/verify`;
      console.log('[License] ====== License Registration ======');
      console.log('[License] Server URL:', this.licenseServerUrl);
      console.log('[License] Full API URL:', licenseApiUrl);
      console.log('[License] License key (first 10 chars):', licenseKey.substring(0, 10) + '...');
      
      // Server expects 'license_key' field, not 'licenseKey'
      const response = await axios.post(
        licenseApiUrl,
        { license_key: licenseKey },
        { 
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('[License] Server response status:', response.status);
      console.log('[License] Server response data:', JSON.stringify(response.data, null, 2));

      // Check if the response indicates success
      if (response.data.valid === false) {
        // Server explicitly said license is invalid
        return {
          success: false,
          error: response.data.error || 'Invalid license key',
        };
      }

      // Handle different response formats from the server
      // The server might return the license data directly or wrapped in a property
      let licenseData = null;
      
      if (response.data.licenseJson) {
        // Format 1: { licenseJson: {...} }
        licenseData = response.data.licenseJson;
      } else if (response.data.license) {
        // Format 2: { license: {...} }
        licenseData = response.data.license;
      } else if (response.data.valid === true || response.data.success === true) {
        // Format 3: { valid: true, ... } or { success: true, ... }
        licenseData = {
          valid: true,
          registeredAt: new Date().toISOString(),
          licenseKey: licenseKey,
          ...response.data,
        };
      } else if (response.data && response.status === 200) {
        // Format 4: License data is the response itself (if status is 200)
        licenseData = {
          valid: true,
          registeredAt: new Date().toISOString(),
          licenseKey: licenseKey,
          ...response.data,
        };
      }

      if (licenseData) {
        // Store the license.json file
        fs.writeFileSync(
          this.licenseFilePath,
          JSON.stringify(licenseData, null, 2)
        );
        console.log('[License] License file saved to:', this.licenseFilePath);
        return { success: true };
      } else {
        console.error('[License] Unexpected response format:', response.data);
        return {
          success: false,
          error: response.data.error || response.data.message || 'Invalid server response format',
        };
      }
    } catch (error: unknown) {
      console.error('Error registering license:', error);
      const errorObj = error as { 
        code?: string; 
        message?: string; 
        response?: { data?: { error?: string } };
      };
      
      if (errorObj.code === 'ECONNREFUSED' || errorObj.code === 'ETIMEDOUT') {
        return {
          success: false,
          error: 'Cannot connect to license server. Please check your internet connection.',
        };
      }

      const errorMessage = errorObj.response?.data?.error || errorObj.message || 'Failed to register license';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if license.json exists (Pro mode)
   */
  hasLicense(): boolean {
    return fs.existsSync(this.licenseFilePath);
  }

  /**
   * Get the path to the license file
   */
  getLicenseFilePath(): string {
    return this.licenseFilePath;
  }

  /**
   * Remove license (downgrade to Free mode)
   */
  removeLicense(): void {
    if (fs.existsSync(this.licenseFilePath)) {
      fs.unlinkSync(this.licenseFilePath);
    }
  }
}
