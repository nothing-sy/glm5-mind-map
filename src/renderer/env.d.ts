/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

// Electron API 类型声明
interface SaveFileOptions {
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[];
  content: string;
  isBase64?: boolean;
}

interface SaveFileResult {
  success: boolean;
  canceled?: boolean;
  path?: string;
  error?: string;
}

interface OpenFileOptions {
  filters?: { name: string; extensions: string[] }[];
  multiple?: boolean;
}

interface OpenFileResult {
  canceled: boolean;
  filePaths: string[];
}

interface ReadFileResult {
  success: boolean;
  content?: string;
  error?: string;
}

interface WriteFileResult {
  success: boolean;
  error?: string;
}

interface RenameFileResult {
  success: boolean;
  error?: string;
}

interface ElectronAPI {
  saveFile: (options: SaveFileOptions) => Promise<SaveFileResult>;
  openFile: (options?: OpenFileOptions) => Promise<OpenFileResult>;
  readFile: (filePath: string) => Promise<ReadFileResult>;
  writeFile: (filePath: string, content: string) => Promise<WriteFileResult>;
  fileExists: (filePath: string) => Promise<boolean>;
  renameFile: (oldPath: string, newPath: string) => Promise<RenameFileResult>;
  onSaveShortcut: (callback: () => void) => () => void;
  onUndoShortcut: (callback: () => void) => () => void;
  onRedoShortcut: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
