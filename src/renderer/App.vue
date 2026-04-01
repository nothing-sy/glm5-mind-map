<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import Sidebar from '@/components/sidebar/Sidebar.vue';
import MindMapContainer from '@/components/mindmap/MindMapContainer.vue';
import AppHeader from '@/components/common/AppHeader.vue';
import { useMindMapStore, useFileListStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { validateMindMapData } from '@/utils/mindMapHelper';
import type { MultiRootMindMapData } from '@/types';

const mindMapStore = useMindMapStore();
const fileListStore = useFileListStore();
const { activeFile, files } = storeToRefs(fileListStore);
const { canUndo, canRedo } = storeToRefs(mindMapStore);

const mindMapContainerRef = ref<InstanceType<typeof MindMapContainer> | null>(null);

// 初始化：创建第一个文件
onMounted(() => {
  if (files.value.length === 0) {
    handleCreate();
  }

  // 注册快捷键监听
  setupShortcutListeners();
});

onUnmounted(() => {
  mindMapStore.destroy();
});

// 设置快捷键监听
function setupShortcutListeners() {
  const cleanupSave = window.electronAPI.onSaveShortcut(() => {
    handleSave();
  });

  const cleanupUndo = window.electronAPI.onUndoShortcut(() => {
    if (canUndo.value) {
      mindMapStore.undo();
    }
  });

  const cleanupRedo = window.electronAPI.onRedoShortcut(() => {
    if (canRedo.value) {
      mindMapStore.redo();
    }
  });

  // 清理函数
  onUnmounted(() => {
    cleanupSave();
    cleanupUndo();
    cleanupRedo();
  });
}

// 创建新文件
function handleCreate() {
  fileListStore.createFile();
}

// 导入文件
async function handleImport(format: string) {
  if (format === 'json') {
    try {
      const result = await window.electronAPI.openFile({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        multiple: false,
      });

      if (result.canceled || result.filePaths.length === 0) {
        return;
      }

      const filePath = result.filePaths[0];
      const readResult = await window.electronAPI.readFile(filePath);

      if (!readResult.success || !readResult.content) {
        ElMessage.error('读取文件失败');
        return;
      }

      const data = JSON.parse(readResult.content);
      const validatedData = validateMindMapData(data);

      if (!validatedData) {
        ElMessage.error('无效的思维导图文件格式');
        return;
      }

      const fileName = filePath.split(/[/\\]/).pop()?.replace('.json', '') || '导入的思维导图';
      fileListStore.openFile(validatedData, filePath, fileName);
      ElMessage.success('导入成功');
    } catch (error) {
      ElMessage.error('导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  }
}

// 从拖拽导入
function handleImportFromDrop(data: MultiRootMindMapData, fileName: string) {
  fileListStore.openFile(data, undefined, fileName);
  ElMessage.success('导入成功');
}

// 导出文件
async function handleExport(format: string) {
  if (!activeFile.value) return;

  try {
    const exportData = activeFile.value.data;

    if (format === 'json') {
      const jsonContent = JSON.stringify(exportData, null, 2);
      const result = await window.electronAPI.saveFile({
        defaultPath: `${activeFile.value.name}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }],
        content: jsonContent,
      });

      if (result.success) {
        ElMessage.success('导出成功');
      }
    } else if (format === 'png' || format === 'svg') {
      // 使用 simple-mind-map 的导出功能
      const blob = await mindMapContainerRef.value?.export(format === 'png' ? 'png' : 'svg');
      if (blob) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const result = await window.electronAPI.saveFile({
            defaultPath: `${activeFile.value!.name}.${format}`,
            filters: [{ name: format.toUpperCase(), extensions: [format] }],
            content: base64,
            isBase64: true,
          });

          if (result.success) {
            ElMessage.success('导出成功');
          }
        };
        reader.readAsDataURL(blob);
      }
    }
  } catch (error) {
    ElMessage.error('导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
  }
}

// 保存文件
async function handleSave() {
  if (!activeFile.value) return;

  if (activeFile.value.path) {
    // 已有路径，直接保存
    try {
      const jsonContent = JSON.stringify(activeFile.value.data, null, 2);
      const result = await window.electronAPI.writeFile(activeFile.value.path, jsonContent);

      if (result.success) {
        fileListStore.markFileSaved(activeFile.value.id, activeFile.value.path);
        ElMessage.success('保存成功');
      } else {
        ElMessage.error('保存失败');
      }
    } catch (error) {
      ElMessage.error('保存失败');
    }
  }
}

// 另存为
async function handleSaveAs(name: string) {
  if (!activeFile.value) return;

  try {
    const jsonContent = JSON.stringify(activeFile.value.data, null, 2);
    const result = await window.electronAPI.saveFile({
      defaultPath: `${name}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
      content: jsonContent,
    });

    if (result.success && result.path) {
      fileListStore.markFileSaved(activeFile.value.id, result.path, name);
      ElMessage.success('保存成功');
    }
  } catch (error) {
    ElMessage.error('保存失败');
  }
}
</script>

<template>
  <div class="app-container">
    <AppHeader
      @import="handleImport"
      @export="handleExport"
      @save="handleSave"
      @save-as="handleSaveAs"
    />

    <div class="main-content">
      <Sidebar @create="handleCreate" @import="handleImportFromDrop" />

      <div class="mindmap-area">
        <MindMapContainer
          v-if="activeFile"
          ref="mindMapContainerRef"
          :key="activeFile.id"
        />

        <div v-else class="empty-state">
          <p>请创建或打开一个思维导图</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.mindmap-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.empty-state {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 16px;
}
</style>
