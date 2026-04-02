import { app, BrowserWindow, ipcMain, dialog, globalShortcut, Menu } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // 隐藏菜单栏
  Menu.setApplicationMenu(null);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // 注册 IPC 处理器
  registerIpcHandlers();

  // 注册快捷键
  registerShortcuts();
};

// 注册 IPC 处理器
function registerIpcHandlers() {
  // 保存文件对话框
  ipcMain.handle('file:save', async (_, options: { defaultPath?: string; filters?: { name: string; extensions: string[] }[]; content: string; isBase64?: boolean }) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: options.defaultPath,
      filters: options.filters,
    });

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }

    try {
      if (options.isBase64) {
        const buffer = Buffer.from(options.content, 'base64');
        await fs.writeFile(result.filePath, buffer);
      } else {
        await fs.writeFile(result.filePath, options.content, 'utf-8');
      }
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '保存失败' };
    }
  });

  // 打开文件对话框
  ipcMain.handle('file:open', async (_, options: { filters?: { name: string; extensions: string[] }[]; multiple?: boolean }) => {
    const properties: ('openFile' | 'multiSelections')[] = ['openFile'];
    if (options.multiple) {
      properties.push('multiSelections');
    }
    const result = await dialog.showOpenDialog(mainWindow!, {
      filters: options.filters,
      properties,
    });
    return result;
  });

  // 读取文件
  ipcMain.handle('file:read', async (_, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '读取失败' };
    }
  });

  // 写入文件
  ipcMain.handle('file:write', async (_, filePath: string, content: string) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '写入失败' };
    }
  });

  // 检查文件是否存在
  ipcMain.handle('file:exists', async (_, filePath: string) => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  });

  // 重命名文件
  ipcMain.handle('file:rename', async (_, oldPath: string, newPath: string) => {
    try {
      await fs.rename(oldPath, newPath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '重命名失败' };
    }
  });
}

// 注册快捷键
function registerShortcuts() {
  // Ctrl+S 保存
  globalShortcut.register('CommandOrControl+S', () => {
    mainWindow?.webContents.send('shortcut:save');
  });

  // Ctrl+Z 撤销
  globalShortcut.register('CommandOrControl+Z', () => {
    mainWindow?.webContents.send('shortcut:undo');
  });

  // Ctrl+Shift+Z 或 Ctrl+Y 重做
  globalShortcut.register('CommandOrControl+Shift+Z', () => {
    mainWindow?.webContents.send('shortcut:redo');
  });

  globalShortcut.register('CommandOrControl+Y', () => {
    mainWindow?.webContents.send('shortcut:redo');
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
