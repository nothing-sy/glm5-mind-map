# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GLM5 Mind Map is an Electron desktop application built with Vue 3, TypeScript, and Vite. The project uses Electron Forge for build and packaging.

## Development Commands

```bash
# Start development server with hot reload
npm start

# Lint TypeScript and Vue files
npm run lint

# TypeScript type checking
npm run typecheck

# Package the application for distribution
npm run package

# Create distributable installers (Windows, macOS, Linux)
npm run make
```

## Architecture

This is a standard Electron multi-process application with Vue 3 frontend:

- **Main Process** ([src/main.ts](src/main.ts)) - Node.js environment, handles window creation, native APIs, and app lifecycle. Uses `electron-squirrel-startup` for Windows installer support.

- **Preload Script** ([src/preload.ts](src/preload.ts)) - Bridge between main and renderer processes with context isolation. Currently empty, add contextBridge APIs here when needed.

- **Renderer Process** ([src/renderer/](src/renderer/)) - Vue 3 application for UI:
  - [main.ts](src/renderer/main.ts) - Vue app entry point
  - [App.vue](src/renderer/App.vue) - Root component
  - `components/` - Reusable Vue components
  - `views/` - Page-level components
  - `assets/` - Static assets (images, fonts, etc.)
  - `styles/` - Global CSS styles
  - `utils/` - Utility functions
  - `types/` - TypeScript type definitions

- **Build Configuration** ([forge.config.ts](forge.config.ts)) - Configures Vite for bundling:
  - [vite.main.config.mts](vite.main.config.mts) - Main process bundling
  - [vite.preload.config.mts](vite.preload.config.mts) - Preload script bundling
  - [vite.renderer.config.mts](vite.renderer.config.mts) - Renderer/frontend bundling with Vue plugin

- Fuses are enabled for security (ASAR integrity, cookie encryption, disabled Node CLI flags)

## Path Aliases

The `@/` alias is configured to point to `src/renderer/` for clean imports:
```typescript
import MyComponent from '@/components/MyComponent.vue';
```
