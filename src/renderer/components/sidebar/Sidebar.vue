<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <span class="title">思维导图列表</span>
    </div>

    <div
      class="sidebar-content"
      @dragover.prevent="handleDragOver"
      @drop.prevent="handleDrop"
      @dragleave="handleDragLeave"
      :class="{ 'drag-over': isDragOver }"
    >
      <MindMapList
        :files="files"
        :active-file-id="activeFileId"
        @select="handleSelect"
        @close="handleClose"
        @rename="handleRename"
      />

      <div v-if="files.length === 0" class="empty-tip">
        <p>暂无思维导图</p>
        <p>点击右侧"新建"按钮创建</p>
        <p>或拖入 JSON 文件导入</p>
      </div>
    </div>

    <div v-if="isDragOver" class="drop-overlay">
      <el-icon class="drop-icon"><Upload /></el-icon>
      <span>释放文件以导入</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import MindMapList from './MindMapList.vue';
import { useFileListStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { validateMindMapData } from '@/utils/mindMapHelper';

const emit = defineEmits<{
  (e: 'create'): void;
  (e: 'import', data: any, fileName: string): void;
}>();

const fileListStore = useFileListStore();
const { files, activeFileId } = storeToRefs(fileListStore);

const isDragOver = ref(false);

function handleSelect(fileId: string) {
  fileListStore.switchFile(fileId);
}

function handleClose(fileId: string) {
  fileListStore.closeFile(fileId);
}

async function handleRename(fileId: string, newName: string) {
  const file = files.value.find(f => f.id === fileId);
  if (!file) return;

  // 如果文件已保存到磁盘，需要重命名磁盘文件
  if (file.path) {
    const oldPath = file.path;
    const dir = oldPath.substring(0, oldPath.lastIndexOf('\\') || oldPath.lastIndexOf('/'));
    const newPath = `${dir}\\${newName}.json`;

    // 检查新文件名是否已存在
    const exists = await window.electronAPI.fileExists(newPath);
    if (exists) {
      ElMessage.error('文件名已存在');
      return;
    }

    // 重命名磁盘文件
    const result = await window.electronAPI.renameFile(oldPath, newPath);
    if (!result.success) {
      ElMessage.error('重命名文件失败: ' + result.error);
      return;
    }

    // 更新 store 中的文件路径和名称
    fileListStore.markFileSaved(fileId, newPath, newName);
    ElMessage.success('重命名成功');
  } else {
    // 文件未保存到磁盘，只更新名称
    fileListStore.renameFile(fileId, newName);
  }
}

function handleDragOver(e: DragEvent) {
  if (e.dataTransfer?.types.includes('Files')) {
    isDragOver.value = true;
  }
}

function handleDragLeave() {
  isDragOver.value = false;
}

async function handleDrop(e: DragEvent) {
  isDragOver.value = false;

  const droppedFiles = e.dataTransfer?.files;
  if (!droppedFiles || droppedFiles.length === 0) return;

  for (const file of Array.from(droppedFiles)) {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      try {
        const content = await file.text();
        const data = JSON.parse(content);
        const validatedData = validateMindMapData(data);

        if (validatedData) {
          emit('import', validatedData, file.name.replace('.json', ''));
        } else {
          ElMessage.error('无效的思维导图文件格式');
        }
      } catch (error) {
        ElMessage.error('文件解析失败');
      }
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100%;
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fff;
}

.title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.sidebar-content.drag-over {
  background-color: #ecf5ff;
}

.empty-tip {
  text-align: center;
  padding: 40px 16px;
  color: #909399;
  font-size: 13px;
  line-height: 1.8;
}

.drop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(64, 158, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 16px;
  z-index: 10;
}

.drop-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
</style>
