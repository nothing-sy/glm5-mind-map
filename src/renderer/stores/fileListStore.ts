import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { MindMapFile, MultiRootMindMapData } from '@/types';
import { createEmptyMindMapData } from '@/utils/mindMapHelper';

export const useFileListStore = defineStore('fileList', () => {
  // 文件列表
  const files = ref<MindMapFile[]>([]);

  // 当前激活的文件 ID
  const activeFileId = ref<string | null>(null);

  // 计算属性：当前激活的文件
  const activeFile = computed(() =>
    files.value.find((f) => f.id === activeFileId.value) || null
  );

  // 计算属性：是否有未保存的文件
  const hasUnsavedFiles = computed(() =>
    files.value.some((f) => f.isDirty)
  );

  /**
   * 创建新文件
   */
  function createFile(name: string = '未命名思维导图'): MindMapFile {
    const now = Date.now();
    const newFile: MindMapFile = {
      id: uuidv4(),
      name,
      path: null,
      data: createEmptyMindMapData(name),
      isDirty: false,
      created: now,
      updated: now,
    };

    files.value.push(newFile);
    activeFileId.value = newFile.id;

    return newFile;
  }

  /**
   * 打开文件（导入或切换）
   */
  function openFile(data: MultiRootMindMapData, filePath?: string, fileName?: string): MindMapFile {
    const now = Date.now();
    const name = fileName || data.name || '导入的思维导图';

    const newFile: MindMapFile = {
      id: uuidv4(),
      name,
      path: filePath || null,
      data,
      isDirty: false,
      created: now,
      updated: now,
    };

    files.value.push(newFile);
    activeFileId.value = newFile.id;

    return newFile;
  }

  /**
   * 切换到指定文件
   */
  function switchFile(fileId: string): void {
    if (files.value.some((f) => f.id === fileId)) {
      activeFileId.value = fileId;
    }
  }

  /**
   * 关闭文件
   */
  function closeFile(fileId: string): boolean {
    const index = files.value.findIndex((f) => f.id === fileId);
    if (index === -1) return false;

    files.value.splice(index, 1);

    // 如果关闭的是当前激活的文件，切换到其他文件
    if (activeFileId.value === fileId) {
      activeFileId.value = files.value[0]?.id || null;
    }

    return true;
  }

  /**
   * 更新文件数据
   */
  function updateFileData(fileId: string, data: MultiRootMindMapData): void {
    const file = files.value.find((f) => f.id === fileId);
    if (file) {
      file.data = data;
      file.isDirty = true;
      file.updated = Date.now();
    }
  }

  /**
   * 标记文件为已保存
   */
  function markFileSaved(fileId: string, path: string, name?: string): void {
    const file = files.value.find((f) => f.id === fileId);
    if (file) {
      file.path = path;
      if (name) {
        file.name = name;
        file.data.name = name;
      }
      file.isDirty = false;
      file.updated = Date.now();
    }
  }

  /**
   * 重命名文件
   */
  function renameFile(fileId: string, newName: string): void {
    const file = files.value.find((f) => f.id === fileId);
    if (file) {
      file.name = newName;
      file.data.name = newName;
      file.isDirty = true;
      file.updated = Date.now();
    }
  }

  /**
   * 获取文件数量
   */
  function getFileCount(): number {
    return files.value.length;
  }

  return {
    files,
    activeFileId,
    activeFile,
    hasUnsavedFiles,
    createFile,
    openFile,
    switchFile,
    closeFile,
    updateFileData,
    markFileSaved,
    renameFile,
    getFileCount,
  };
});
