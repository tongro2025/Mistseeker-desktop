# MistSeeker Desktop - Core Philosophy

## Principle

**MistSeeker Desktop is NOT a replacement for the Docker engine. It is a UX layer that makes Docker-based analysis accessible.**

## Design Rules

### 1. Orchestration over Computation
- The app **orchestrates** Docker commands
- The app does **NOT compute** analysis results
- All analysis logic lives in the Docker container
- The desktop app only: runs commands, tracks state, streams output

### 2. Scripts over Services
- Prefer explicit script execution over abstracted service layers
- Use `child_process.spawn` directly - no Docker API abstraction
- Build explicit `docker run` commands
- Execute them as scripts

### 3. Transparency over Abstraction
- All Docker commands are **visible and logged**
- All mount paths are **explicitly shown**
- Exit codes and errors are **preserved**
- No hidden behavior - you see exactly what runs

## Implementation Guidelines

### Features via Docker Arguments
If a feature can be implemented by adjusting `docker run` arguments, do it:
- Environment variables: `-e KEY=value`
- Volume mounts: `-v /host:/container`
- Working directory: `-w /path`
- Resource limits: `--memory`, `--cpus`

### Features via Mount Paths
If a feature can be implemented by changing mount paths, do it:
- Project mount: `/workspace` (read-only)
- Output mount: `/output` (writable)
- License mount: `/license/license.json` (optional, read-only)

### Features via UI Affordances
If a feature can be implemented in the UI, do it:
- Project selection (folder picker, drag & drop, code paste)
- Docker image name input
- Settings panel (output directory)
- Results visualization

### DO NOT Implement
- Analysis logic (that's in the Docker container)
- Result parsing/processing (just read JSON/PDF files)
- Business rules (let the engine handle it)
- Complex abstractions (keep it simple and visible)

## Code Structure

### Main Process
- **DockerService**: Script runner - builds and executes Docker commands
- **AnalysisService**: Orchestrator - tracks state, runs Docker, streams logs
- **SettingsService**: Path manager - manages output directory paths
- **LicenseService**: File manager - manages license.json file

### Renderer Process
- React UI components
- User interactions
- Results display (no processing, just visualization)

## Example: Adding a Feature

**Scenario**: User wants to set memory limit for analysis

**✅ Correct Approach**:
```typescript
// In DockerService.buildDockerRunCommand()
if (config.memoryLimit) {
  args.push('--memory', config.memoryLimit);
}
```

**❌ Wrong Approach**:
```typescript
// Don't create a MemoryManagerService
// Don't abstract it away
// Don't hide it from the user
```

## Verification Checklist

When adding code, ask:
- [ ] Can this be done via Docker arguments?
- [ ] Can this be done via mount paths?
- [ ] Can this be done via UI affordances?
- [ ] Is the Docker command visible to the user?
- [ ] Am I computing analysis results? (If yes, STOP)
- [ ] Am I abstracting Docker commands? (If yes, simplify)

## Current Implementation Status

✅ **DockerService**: Script runner - explicit commands, visible execution
✅ **AnalysisService**: Orchestrator - state tracking, Docker execution
✅ **SettingsService**: Path management - file I/O only
✅ **LicenseService**: File management - license.json handling
✅ **UI Components**: Pure presentation - no business logic

All services follow the philosophy. No computation, just orchestration.

