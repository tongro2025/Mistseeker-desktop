/**
 * OS detection utilities
 */

import { Platform } from './types';
import * as os from 'os';
import * as path from 'path';

export function getPlatform(): Platform {
  return process.platform as Platform;
}

export function isWindows(): boolean {
  return process.platform === 'win32';
}

export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

export function isLinux(): boolean {
  return process.platform === 'linux';
}

export function getOSInfo(): {
  platform: Platform;
  arch: string;
  hostname: string;
  homedir: string;
} {
  return {
    platform: getPlatform(),
    arch: os.arch(),
    hostname: os.hostname(),
    homedir: os.homedir(),
  };
}

/**
 * Normalize path for Docker volume mounts
 * Windows paths need special handling for Docker Desktop
 * macOS/Linux paths are used as-is
 */
export function normalizeDockerPath(filePath: string): string {
  // Ensure absolute path first
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
  
  if (isWindows()) {
    // Convert Windows path to Docker Desktop compatible format
    // C:\Users\... -> /c/Users/...
    // Docker Desktop on Windows accepts Unix-style paths
    let normalized = absolutePath.replace(/\\/g, '/');
    
    // Handle absolute Windows paths (C:\Users\...)
    if (normalized.match(/^[A-Za-z]:/)) {
      const drive = normalized[0].toLowerCase();
      normalized = `/${drive}${normalized.substring(2)}`;
    }
    
    // Ensure absolute path (handle relative paths)
    if (!normalized.startsWith('/')) {
      // If it's a relative path, make it absolute
      // This shouldn't happen in practice, but handle it
      normalized = '/' + normalized;
    }
    
    return normalized;
  }
  
  // macOS and Linux: use path as-is (already Unix-style)
  // Return the absolute path
  return absolutePath;
}

/**
 * Get Docker command based on OS
 */
export function getDockerCommand(): string {
  return 'docker';
}

