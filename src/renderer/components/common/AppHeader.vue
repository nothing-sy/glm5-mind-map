<template>
  <div class="app-header">
    <div class="left-actions">
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
            :type="currentLayout === 'logicalStructure' ? 'primary' : 'default'"
            @click="handleLayoutChange('logicalStructure')"
          >
            <el-icon><DArrowRight /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="从上到下布局" placement="bottom">
          <el-button
            :type="currentLayout === 'organizationStructure' ? 'primary' : 'default'"
            @click="handleLayoutChange('organizationStructure')"
          >
            <el-icon><Bottom /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>

      <el-divider direction="vertical" />

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
    </div>

    <div class="center-info">
      <span class="file-name" v-if="activeFile">
        {{ activeFile.name }}
        <span v-if="activeFile.isDirty" class="dirty-mark">*</span>
      </span>
    </div>

    <div class="right-actions">
      <el-dropdown trigger="click" @command="handleImportCommand">
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

      <el-dropdown trigger="click" @command="handleExportCommand" :disabled="!activeFile">
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

    <!-- 保存对话框 -->
    <SaveDialog
      v-model:visible="saveDialogVisible"
      :default-name="defaultSaveName"
      @confirm="handleSaveConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Back,
  Right,
  DocumentChecked,
  FolderOpened,
  Upload,
  Download,
  ArrowDown,
  DArrowRight,
  Bottom,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useMindMapStore, useFileListStore } from '@/stores';
import { storeToRefs } from 'pinia';
import SaveDialog from './SaveDialog.vue';

const emit = defineEmits<{
  (e: 'import', format: string): void;
  (e: 'export', format: string): void;
  (e: 'save'): void;
  (e: 'saveAs', name: string): void;
}>();

const mindMapStore = useMindMapStore();
const fileListStore = useFileListStore();
const { activeFile } = storeToRefs(fileListStore);
const { canUndo, canRedo, layout: currentLayout } = storeToRefs(mindMapStore);

const saveDialogVisible = ref(false);
const defaultSaveName = ref('');
const isSaveAs = ref(false);

function handleUndo() {
  mindMapStore.undo();
}

function handleRedo() {
  mindMapStore.redo();
}

function handleLayoutChange(layout: 'logicalStructure' | 'organizationStructure') {
  mindMapStore.setLayout(layout);
}

function handleSave() {
  if (!activeFile.value) return;

  if (activeFile.value.path) {
    // 已有路径，直接保存
    emit('save');
  } else {
    // 新文件，弹出保存对话框
    isSaveAs.value = false;
    defaultSaveName.value = activeFile.value.name;
    saveDialogVisible.value = true;
  }
}

function handleSaveAs() {
  if (!activeFile.value) return;
  isSaveAs.value = true;
  defaultSaveName.value = activeFile.value.name;
  saveDialogVisible.value = true;
}

function handleSaveConfirm(name: string) {
  if (isSaveAs.value) {
    emit('saveAs', name);
  } else {
    emit('saveAs', name);
  }
}

function handleImportCommand(command: string) {
  emit('import', command);
}

function handleExportCommand(command: string) {
  emit('export', command);
}
</script>

<style scoped>
.app-header {
  height: 50px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-actions,
.right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.center-info {
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
</style>
