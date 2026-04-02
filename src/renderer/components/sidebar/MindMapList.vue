<template>
  <div class="mind-map-list">
    <div
      v-for="file in files"
      :key="file.id"
      class="list-item"
      :class="{ active: file.id === activeFileId, dirty: file.isDirty }"
      @click="$emit('select', file.id)"
      @dblclick="startRename(file)"
      @contextmenu.prevent="showContextMenu($event, file)"
    >
      <div class="item-content">
        <el-icon class="item-icon"><Document /></el-icon>
        <template v-if="renamingFileId === file.id">
          <input
            ref="renameInputRef"
            v-model="newName"
            class="rename-input"
            @click.stop
            @keydown.enter="confirmRename(file)"
            @keydown.escape="cancelRename"
            @blur="confirmRename(file)"
          />
        </template>
        <template v-else>
          <span class="item-name" :title="file.name">
            {{ file.name }}
            <span v-if="file.isDirty" class="dirty-mark">*</span>
          </span>
        </template>
      </div>
      <el-button
        v-if="renamingFileId !== file.id"
        class="close-btn"
        type="info"
        :icon="Close"
        size="small"
        text
        @click.stop="$emit('close', file.id)"
      />
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-show="contextMenuVisible"
        class="context-menu"
        :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      >
        <div class="menu-item" @click="handleContextAction('rename')">
          <el-icon><Edit /></el-icon>
          <span>重命名</span>
        </div>
        <div class="menu-item" @click="handleContextAction('close')">
          <el-icon><Close /></el-icon>
          <span>关闭</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { Document, Close, Edit } from '@element-plus/icons-vue';
import type { MindMapFile } from '@/types';

interface Props {
  files: MindMapFile[];
  activeFileId: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'select', fileId: string): void;
  (e: 'close', fileId: string): void;
  (e: 'rename', fileId: string, newName: string): void;
}>();

// 重命名相关状态
const renamingFileId = ref<string | null>(null);
const newName = ref('');
const renameInputRef = ref<HTMLInputElement | null>(null);

// 右键菜单相关状态
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const contextMenuFile = ref<MindMapFile | null>(null);

// 开始重命名
function startRename(file: MindMapFile) {
  renamingFileId.value = file.id;
  newName.value = file.name;
  nextTick(() => {
    // 获取所有输入框，找到当前显示的那个
    const inputs = document.querySelectorAll('.rename-input');
    const input = inputs[0] as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
}

// 确认重命名
function confirmRename(file: MindMapFile) {
  if (renamingFileId.value && newName.value.trim()) {
    if (newName.value.trim() !== file.name) {
      emit('rename', renamingFileId.value, newName.value.trim());
    }
  }
  renamingFileId.value = null;
  newName.value = '';
}

// 取消重命名
function cancelRename() {
  renamingFileId.value = null;
  newName.value = '';
}

// 显示右键菜单
function showContextMenu(event: MouseEvent, file: MindMapFile) {
  contextMenuFile.value = file;
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  contextMenuVisible.value = true;
}

// 处理右键菜单操作
function handleContextAction(action: string) {
  if (!contextMenuFile.value) return;

  if (action === 'rename') {
    startRename(contextMenuFile.value);
  } else if (action === 'close') {
    emit('close', contextMenuFile.value.id);
  }

  contextMenuVisible.value = false;
}

// 点击外部关闭右键菜单
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.context-menu')) {
    contextMenuVisible.value = false;
  }
}

// 监听点击事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.mind-map-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fff;
}

.list-item:hover {
  background-color: #ecf5ff;
}

.list-item.active {
  background-color: #409eff;
  color: #fff;
}

.list-item.active .item-icon,
.list-item.active .close-btn {
  color: #fff;
}

.list-item.dirty .item-name::after {
  content: '*';
  color: #f56c6c;
  margin-left: 2px;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  flex: 1;
}

.item-icon {
  font-size: 16px;
  color: #909399;
  flex-shrink: 0;
}

.item-name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dirty-mark {
  color: #f56c6c;
  font-weight: bold;
}

.close-btn {
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.list-item:hover .close-btn {
  opacity: 1;
}

.rename-input {
  flex: 1;
  border: 1px solid #409eff;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 13px;
  outline: none;
  background: #fff;
  color: #303133;
}

.context-menu {
  position: fixed;
  z-index: 10000;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 120px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #303133;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f0f2f5;
}

.menu-item .el-icon {
  margin-right: 8px;
  font-size: 14px;
  color: #606266;
}
</style>
