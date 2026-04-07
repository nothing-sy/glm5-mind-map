<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Back,
  Right,
  DocumentChecked,
  FolderOpened,
  Upload,
  Download,
  ArrowDown,
  Plus,
  DArrowRight,
  Bottom,
  Search,
} from '@element-plus/icons-vue';
import Sidebar from '@/components/sidebar/Sidebar.vue';
import MindMapContainer from '@/components/mindmap/MindMapContainer.vue';
import SaveDialog from '@/components/common/SaveDialog.vue';
import SearchPanel from '@/components/common/SearchPanel.vue';
import FloatingToolbar from '@/components/common/FloatingToolbar.vue';
import { useMindMapStore, useFileListStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { validateMindMapData, searchNodes } from '@/utils/mindMapHelper';
import type { MultiRootMindMapData, SearchResult } from '@/types';

const mindMapStore = useMindMapStore();
const fileListStore = useFileListStore();
const { activeFile, files } = storeToRefs(fileListStore);
const { canUndo, canRedo, layout } = storeToRefs(mindMapStore);

const mindMapContainerRef = ref<InstanceType<typeof MindMapContainer> | null>(null);
const mindmapAreaRef = ref<HTMLElement | null>(null);

// 保存对话框状态
const saveDialogVisible = ref(false);
const defaultSaveName = ref('');
const isSaveAs = ref(false);

// 搜索面板状态
const searchPanelVisible = ref(false);
const searchPanelRef = ref<InstanceType<typeof SearchPanel> | null>(null);

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

  // Ctrl+F 搜索快捷键
  const handleFindShortcut = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      if (activeFile.value) {
        handleOpenSearch();
      }
    }
  };
  window.addEventListener('keydown', handleFindShortcut);

  // 清理函数
  onUnmounted(() => {
    cleanupSave();
    cleanupUndo();
    cleanupRedo();
    window.removeEventListener('keydown', handleFindShortcut);
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
      // export 返回的是 Data URL 字符串 (data:image/png;base64,...)
      const dataUrl = await mindMapContainerRef.value?.export(format === 'png' ? 'png' : 'svg');
      if (dataUrl) {
        // 从 Data URL 中提取 base64 部分
        const base64 = dataUrl.split(',')[1];
        const result = await window.electronAPI.saveFile({
          defaultPath: `${activeFile.value!.name}.${format}`,
          filters: [{ name: format.toUpperCase(), extensions: [format] }],
          content: base64,
          isBase64: true,
        });

        if (result.success) {
          ElMessage.success('导出成功');
        }
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
  } else {
    // 新文件，弹出保存对话框
    isSaveAs.value = false;
    defaultSaveName.value = activeFile.value.name;
    saveDialogVisible.value = true;
  }
}

// 另存为
function handleSaveAs() {
  if (!activeFile.value) return;
  isSaveAs.value = true;
  defaultSaveName.value = activeFile.value.name;
  saveDialogVisible.value = true;
}

// 确认保存
function handleSaveConfirm(name: string) {
  doSaveAs(name);
}

async function doSaveAs(name: string) {
  if (!activeFile.value) return;

  try {
    // 将文件名写入到 JSON 数据中
    activeFile.value.data.name = name;
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

// 撤销
function handleUndo() {
  mindMapStore.undo();
}

// 重做
function handleRedo() {
  mindMapStore.redo();
}

// 切换布局
function handleLayoutChange(newLayout: 'logicalStructure' | 'organizationStructure') {
  mindMapStore.setLayout(newLayout);
}

// 打开搜索面板
function handleOpenSearch() {
  searchPanelVisible.value = true;
}

// 关闭搜索面板
function handleCloseSearch() {
  searchPanelVisible.value = false;
}

// 执行搜索
function handleSearch(keyword: string) {
  if (!activeFile.value || !keyword.trim()) {
    searchPanelRef.value?.setResults([]);
    return;
  }
  const results = searchNodes(activeFile.value.data, keyword);
  searchPanelRef.value?.setResults(results);
}

// 选中搜索结果，定位到节点
function handleSelectSearchResult(result: SearchResult) {
  mindMapContainerRef.value?.focusNode(result.nodeId);
}
</script>

<template>
  <div class="app-container">
    <Sidebar @create="handleCreate" @import="handleImportFromDrop" />

    <div class="right-panel">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button-group>
            <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
              <el-button :disabled="!canUndo" @click="handleUndo">
                <el-icon><Back /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="重做 (Ctrl+Y)" placement="bottom">
              <el-button :disabled="!canRedo" @click="handleRedo">
                <el-icon><Right /></el-icon>
              </el-button>
            </el-tooltip>
          </el-button-group>

          <el-divider direction="vertical" />

          <el-button-group>
            <el-tooltip content="从左到右布局" placement="bottom">
              <el-button
                :type="layout === 'logicalStructure' ? 'primary' : 'default'"
                @click="handleLayoutChange('logicalStructure')"
              >
                <el-icon><DArrowRight /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="从上到下布局" placement="bottom">
              <el-button
                :type="layout === 'organizationStructure' ? 'primary' : 'default'"
                @click="handleLayoutChange('organizationStructure')"
              >
                <el-icon><Bottom /></el-icon>
              </el-button>
            </el-tooltip>
          </el-button-group>

          <el-divider direction="vertical" />

          <el-tooltip content="新建" placement="bottom">
            <el-button @click="handleCreate">
              <el-icon><Plus /></el-icon>
            </el-button>
          </el-tooltip>

          <el-divider direction="vertical" />

          <el-tooltip content="搜索节点 (Ctrl+F)" placement="bottom">
            <el-button :disabled="!activeFile" @click="handleOpenSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </el-tooltip>
        </div>

        <div class="toolbar-center">
          <span class="file-name" v-if="activeFile">
            {{ activeFile.name }}
            <span v-if="activeFile.isDirty" class="dirty-mark">*</span>
          </span>
        </div>

        <div class="toolbar-right">
          <el-tooltip content="保存 (Ctrl+S)" placement="bottom">
            <el-button type="primary" :disabled="!activeFile" @click="handleSave">
              <el-icon><DocumentChecked /></el-icon>
              保存
            </el-button>
          </el-tooltip>

          <el-tooltip content="另存为" placement="bottom">
            <el-button :disabled="!activeFile" @click="handleSaveAs">
              <el-icon><FolderOpened /></el-icon>
              另存为
            </el-button>
          </el-tooltip>

          <el-divider direction="vertical" />

          <el-dropdown trigger="click" @command="handleImport">
            <el-button>
              <el-icon><Upload /></el-icon>
              导入
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="json">JSON 文件</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-dropdown trigger="click" @command="handleExport" :disabled="!activeFile">
            <el-button>
              <el-icon><Download /></el-icon>
              导出
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="json">JSON 文件</el-dropdown-item>
                <el-dropdown-item command="png">PNG 图片</el-dropdown-item>
                <el-dropdown-item command="svg">SVG 图片</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 思维导图区域 -->
      <div ref="mindmapAreaRef" class="mindmap-area">
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

    <!-- 保存对话框 -->
    <SaveDialog
      v-model:visible="saveDialogVisible"
      :default-name="defaultSaveName"
      @confirm="handleSaveConfirm"
    />

    <!-- 搜索面板 -->
    <SearchPanel
      ref="searchPanelRef"
      :visible="searchPanelVisible"
      @close="handleCloseSearch"
      @search="handleSearch"
      @select="handleSelectSearchResult"
    />

    <!-- 浮动工具栏 -->
    <FloatingToolbar :container-ref="mindmapAreaRef" />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  height: 50px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.dirty-mark {
  color: #f56c6c;
  margin-left: 2px;
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
