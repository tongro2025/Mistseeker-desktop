# MistSeeker Desktop

A desktop application that serves as a GUI-based launcher and orchestrator for MistSeeker Docker analysis.

## Core Philosophy

**MistSeeker Desktop is NOT a replacement for the Docker engine. It is a UX layer that makes Docker-based analysis accessible.**

### Design Principles

- **Orchestration over Computation**: The app orchestrates Docker commands, it doesn't compute analysis results
- **Scripts over Services**: Prefer explicit script execution over abstracted service layers
- **Transparency over Abstraction**: All Docker commands are visible and debuggable
- **UX Layer Only**: Features are implemented via:
  - Docker arguments
  - Mount paths
  - UI affordances

**Rule**: If a feature can be implemented by adjusting docker arguments, changing mount paths, or adding UI affordances, we do NOT implement new backend logic.

See [PHILOSOPHY.md](./PHILOSOPHY.md) for detailed implementation guidelines.

## Overview

MistSeeker Desktop is **NOT** a code analysis engine itself. It is a desktop application that:

- Detects Docker Desktop on the user's machine
- Runs existing MistSeeker Docker images via `docker run`
- Mounts user-selected project folders into the container
- Collects analysis results (JSON/PDF) from the container output
- Displays logs and results in a desktop UI
- Manages license registration (Free vs Pro) via a remote license server

**Important**: The actual analysis logic lives ONLY inside the Docker image. This desktop app never reimplements analysis logic - it only executes Docker commands and visualizes results.

## Download

### 🚀 Quick Download

[![Download Latest Release](https://img.shields.io/badge/Download-Latest_Release-blue?style=for-the-badge)](https://github.com/tongro2025/Mistseeker-desktop/releases/latest)

Visit the [Releases page](https://github.com/tongro2025/Mistseeker-desktop/releases) to download the installer for your platform:
- **macOS**: `.dmg` file
- **Windows**: `.exe` installer
- **Linux**: `.AppImage` file

> **Note**: If you see a 404 error or "No releases found", create your first release by running:
> ```bash
> git tag v1.0.0
> git push origin v1.0.0
> ```
> This will trigger GitHub Actions to automatically build and publish the release for all platforms.

## Prerequisites

- **Node.js** 18+ and npm (development only)
- **Docker Desktop** installed and running
- **MistSeeker Docker image** (e.g., `mistseeker/mistseeker:latest` or `tongro2025/mistseeker:latest`)

## User Guide

For end-user documentation, see [USER_GUIDE.md](./USER_GUIDE.md) (Korean) or [USER_GUIDE_EN.md](./USER_GUIDE_EN.md) (English).

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Mistseeker-program
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

## Development

Run the application in development mode:

```bash
npm run dev
```

This will:
- Start the Vite dev server for the React frontend (http://localhost:3000)
- Launch Electron with hot-reload enabled

## Building for Production

### Automatic Build (Recommended)

The project includes GitHub Actions that automatically build and release when you create a git tag:

1. Create a version tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. GitHub Actions will automatically:
   - Build for macOS, Windows, and Linux
   - Create a GitHub Release
   - Upload the installers

### Manual Build

Build the application for your platform:

```bash
npm run build
```

This will:
- Compile TypeScript for both main and renderer processes
- Build the React frontend
- Package the application using electron-builder

The output will be in the `release/` directory:
- **macOS**: DMG file
- **Windows**: NSIS installer
- **Linux**: AppImage

### Publishing to GitHub Releases

To publish manually:

1. Build the application:
```bash
npm run build
```

2. Create a GitHub Release and upload the files from the `release/` directory

Or use electron-builder's publish feature (requires `GH_TOKEN` environment variable):
```bash
GH_TOKEN=your_github_token npm run build -- --publish always
```

## Usage

1. **Start Docker Desktop** - The app will detect if Docker is running
2. **Select a Project Folder** - Click "Browse" to select the project you want to analyze
3. **Configure Docker Image** - Enter the MistSeeker Docker image name (default: `mistseeker/mistseeker:latest`)
4. **Start Analysis** - Click "Start Analysis" to begin
5. **View Results** - Results (JSON/PDF) will be displayed in the Results Viewer panel

## License Management

The app supports license registration via a remote license server:

- **Free Tier**: Basic analysis features
- **Pro Tier**: Full feature access

To register a license:
1. Click "Register License" in the License panel
2. Enter your license key
3. The app will validate with the license server

## Project Structure

```
Mistseeker-program/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Main entry point
│   │   ├── preload.ts     # Preload script (IPC bridge)
│   │   └── services/      # Backend services
│   │       ├── docker.ts  # Docker operations
│   │       ├── license.ts # License management
│   │       └── analysis.ts # Analysis orchestration
│   └── renderer/          # React frontend
│       ├── components/    # UI components
│       ├── App.tsx        # Main app component
│       └── main.tsx       # React entry point
├── package.json
└── README.md
```

## Configuration

### License Server URL

By default, the app uses `https://license.mistseeker.com`. To change this, set the `LICENSE_SERVER_URL` environment variable:

```bash
export LICENSE_SERVER_URL=https://your-license-server.com
```

### Docker Image

The default Docker image is `mistseeker/mistseeker:latest`. You can change this in the UI or set it programmatically.

## Technical Details

### Docker Integration

The app uses Node.js `child_process` to execute Docker CLI commands directly. It:
- Checks Docker availability via `docker info`
- Builds explicit `docker run` commands with visible arguments
- Streams stdout/stderr live to the UI
- Reads output files (JSON/PDF) from mounted volumes

**All Docker commands are logged and visible** - there's no hidden abstraction. You can see exactly what Docker command is being executed.

### Architecture

**Main Process (Orchestration)**
- Executes Docker CLI commands via `child_process`
- Manages file system operations (reading results, creating directories)
- Tracks analysis state (running, completed, failed)
- Streams Docker output live to UI

**Renderer Process (UI Layer)**
- React-based user interface
- Project selection and configuration
- Live log display
- Results visualization

**No Business Logic**
- The app does NOT perform analysis
- The app does NOT parse or process analysis results (beyond reading JSON/PDF files)
- The app does NOT implement analysis features
- All analysis logic lives in the Docker container

### IPC Communication

Communication between the main process (Electron) and renderer process (React) uses Electron's IPC:
- `preload.ts` exposes a secure API to the renderer
- Main process handles all Docker and file system operations
- Renderer process only handles UI and user interactions

### Security

- Context isolation is enabled
- Node integration is disabled in the renderer
- All file system and Docker operations are restricted to the main process

## Troubleshooting

### Docker Not Detected

- Ensure Docker Desktop is installed and running
- Check that Docker is accessible from the command line: `docker info`
- Restart Docker Desktop if needed

### Analysis Fails

- Verify the Docker image exists: `docker images`
- Check that the project folder is accessible
- Review the logs in the Analysis Panel for detailed error messages

### License Registration Fails

- Check your internet connection
- Verify the license server URL is correct
- Ensure the license key is valid

## License

MIT


