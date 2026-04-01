# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GLM5 Mind Map is an Electron desktop application built with TypeScript and Vite. The project uses Electron Forge for build and packaging.

## Development Commands

```bash
# Start development server with hot reload
npm start

# Lint TypeScript files
npm run lint

# Package the application for distribution
npm run package

# Create distributable installers (Windows, macOS, Linux)
npm run make

# Publish application to distributors
npm run publish
```

## Architecture

This is a standard Electron multi-process application:

- **Main Process** ([src/main.ts](src/main.ts)) - Node.js environment, handles window creation, native APIs, and app lifecycle. Uses `electron-squirrel-startup` for Windows installer support.

- **Preload Script** ([src/preload.ts](src/preload.ts)) - Bridge between main and renderer processes with context isolation. Currently empty, add contextBridge APIs here when needed.

- **Renderer Process** ([src/renderer.ts](src/renderer.ts)) - Browser environment for UI. Entry point for all frontend code. Node.js integration is disabled for security.

- **Build Configuration** ([forge.config.ts](forge.config.ts)) - Configures Vite for bundling main/preload/renderer, and sets up makers for Windows (Squirrel), macOS (ZIP), and Linux (deb/RPM).

## Build System

- Uses `@electron-forge/plugin-vite` with separate Vite configs:
  - [vite.main.config.ts](vite.main.config.ts) - Main process bundling
  - [vite.preload.config.ts](vite.preload.config.ts) - Preload script bundling
  - [vite.renderer.config.ts](vite.renderer.config.ts) - Renderer/frontend bundling

- Fuses are enabled for security (ASAR integrity, cookie encryption, disabled Node CLI flags)

## Key Files

- `index.html` - Entry HTML for renderer process
- [src/index.css](src/index.css) - Global styles for renderer
