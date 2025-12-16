"use strict";
/**
 * OS detection utilities
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatform = getPlatform;
exports.isWindows = isWindows;
exports.isMacOS = isMacOS;
exports.isLinux = isLinux;
exports.getOSInfo = getOSInfo;
exports.normalizeDockerPath = normalizeDockerPath;
exports.getDockerCommand = getDockerCommand;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
function getPlatform() {
    return process.platform;
}
function isWindows() {
    return process.platform === 'win32';
}
function isMacOS() {
    return process.platform === 'darwin';
}
function isLinux() {
    return process.platform === 'linux';
}
function getOSInfo() {
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
function normalizeDockerPath(filePath) {
    if (isWindows()) {
        // Convert Windows path to Docker Desktop compatible format
        // C:\Users\... -> /c/Users/...
        // Docker Desktop on Windows accepts Unix-style paths
        let normalized = filePath.replace(/\\/g, '/');
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
    // Ensure it's an absolute path
    if (!path.isAbsolute(filePath)) {
        throw new Error(`Path must be absolute: ${filePath}`);
    }
    return filePath;
}
/**
 * Get Docker command based on OS
 */
function getDockerCommand() {
    return 'docker';
}
