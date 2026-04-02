// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 保存文件对话框
  saveFile: (options: {
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
    content: string;
    isBase64?: boolean;
  }) => ipcRenderer.invoke('file:save', options),

  // 打开文件对话框
  openFile: (options?: {
    filters?: { name: string; extensions: string[] }[];
    multiple?: boolean;
  }) => ipcRenderer.invoke('file:open', options || {}),

  // 读取文件
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),

  // 写入文件（直接写入指定路径）
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:write', filePath, content),

  // 检查文件是否存在
  fileExists: (filePath: string) => ipcRenderer.invoke('file:exists', filePath),

  // 重命名文件
  renameFile: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke('file:rename', oldPath, newPath),

  // 快捷键事件监听
  onSaveShortcut: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('shortcut:save', handler);
    return () => ipcRenderer.removeListener('shortcut:save', handler);
  },

  onUndoShortcut: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('shortcut:undo', handler);
    return () => ipcRenderer.removeListener('shortcut:undo', handler);
  },

  onRedoShortcut: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('shortcut:redo', handler);
    return () => ipcRenderer.removeListener('shortcut:redo', handler);
  },
});
