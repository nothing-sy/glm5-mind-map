// Web shim for Electron API
// This file provides browser-based implementations of Electron APIs

// 保存文件（使用浏览器的下载功能）
function downloadFile(content: string, filename: string, isBase64 = false) {
  let blob: Blob;
  if (isBase64) {
    const byteCharacters = atob(content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    blob = new Blob([byteArray]);
  } else {
    blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 从 localStorage 获取文件列表
function getStoredFiles(): Record<string, { content: string; name: string }> {
  const stored = localStorage.getItem('mindmap-files');
  return stored ? JSON.parse(stored) : {};
}

// 保存到 localStorage
function saveToStorage(files: Record<string, { content: string; name: string }>) {
  localStorage.setItem('mindmap-files', JSON.stringify(files));
}

// 模拟 Electron API
export const electronAPI = {
  // 保存文件对话框 -> 直接下载
  saveFile: async (options: {
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
    content: string;
    isBase64?: boolean;
  }) => {
    try {
      const filename = options.defaultPath || 'untitled.json';
      downloadFile(options.content, filename, options.isBase64);
      return { success: true, path: filename };
    } catch (error) {
      return { success: false, error: '保存失败' };
    }
  },

  // 打开文件对话框 -> 使用 input[type=file]
  openFile: async (options?: {
    filters?: { name: string; extensions: string[] }[];
    multiple?: boolean;
  }) => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options?.multiple || false;

      if (options?.filters) {
        const accept = options.filters
          .map((f) => f.extensions.map((ext) => `.${ext}`))
          .flat()
          .join(',');
        input.accept = accept;
      }

      input.onchange = async () => {
        if (!input.files || input.files.length === 0) {
          resolve({ canceled: true, filePaths: [] });
          return;
        }

        const files = Array.from(input.files);
        const filePaths = files.map((f) => `web-storage://${f.name}`);

        // 存储文件内容到 localStorage
        for (const file of files) {
          const content = await file.text();
          const storedFiles = getStoredFiles();
          storedFiles[`web-storage://${file.name}`] = {
            content,
            name: file.name,
          };
          saveToStorage(storedFiles);
        }

        resolve({ canceled: false, filePaths });
      };

      input.click();
    });
  },

  // 读取文件
  readFile: async (filePath: string) => {
    try {
      const storedFiles = getStoredFiles();
      if (storedFiles[filePath]) {
        return { success: true, content: storedFiles[filePath].content };
      }
      return { success: false, error: '文件不存在' };
    } catch (error) {
      return { success: false, error: '读取失败' };
    }
  },

  // 写入文件
  writeFile: async (filePath: string, content: string) => {
    try {
      const storedFiles = getStoredFiles();
      const name = filePath.split('/').pop() || filePath;
      storedFiles[filePath] = { content, name };
      saveToStorage(storedFiles);
      return { success: true };
    } catch (error) {
      return { success: false, error: '写入失败' };
    }
  },

  // 检查文件是否存在
  fileExists: async (filePath: string) => {
    const storedFiles = getStoredFiles();
    return !!storedFiles[filePath];
  },

  // 重命名文件
  renameFile: async (oldPath: string, newPath: string) => {
    try {
      const storedFiles = getStoredFiles();
      if (storedFiles[oldPath]) {
        storedFiles[newPath] = {
          ...storedFiles[oldPath],
          name: newPath.split('/').pop() || newPath,
        };
        delete storedFiles[oldPath];
        saveToStorage(storedFiles);
        return { success: true };
      }
      return { success: false, error: '文件不存在' };
    } catch (error) {
      return { success: false, error: '重命名失败' };
    }
  },

  // 快捷键事件监听 -> 使用浏览器快捷键
  onSaveShortcut: (callback: () => void) => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  },

  onUndoShortcut: (callback: () => void) => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  },

  onRedoShortcut: (callback: () => void) => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ((e.key === 'z' && e.shiftKey) || e.key === 'y')
      ) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  },
};

// 注入到 window 对象
if (typeof window !== 'undefined') {
  (window as unknown as { electronAPI: typeof electronAPI }).electronAPI = electronAPI;
}
