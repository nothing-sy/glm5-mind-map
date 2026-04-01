<template>
  <Teleport to="body">
    <div
      v-show="visible"
      class="context-menu"
      :style="{ left: x + 'px', top: y + 'px' }"
    >
      <div class="menu-item" @click="handleAction('addChild')">
        <el-icon><Plus /></el-icon>
        <span>添加子节点</span>
        <span class="shortcut">Tab</span>
      </div>
      <div class="menu-item" @click="handleAction('addSibling')">
        <el-icon><DocumentCopy /></el-icon>
        <span>添加同级节点</span>
        <span class="shortcut">Enter</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item" @click="handleAction('edit')">
        <el-icon><Edit /></el-icon>
        <span>编辑节点</span>
        <span class="shortcut">F2</span>
      </div>
      <div class="menu-item" @click="handleAction('delete')">
        <el-icon><Delete /></el-icon>
        <span>删除节点</span>
        <span class="shortcut">Delete</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item" @click="handleAction('copy')">
        <el-icon><CopyDocument /></el-icon>
        <span>复制</span>
        <span class="shortcut">Ctrl+C</span>
      </div>
      <div class="menu-item" @click="handleAction('cut')">
        <el-icon><Scissor /></el-icon>
        <span>剪切</span>
        <span class="shortcut">Ctrl+X</span>
      </div>
      <div class="menu-item" @click="handleAction('paste')">
        <el-icon><Document /></el-icon>
        <span>粘贴</span>
        <span class="shortcut">Ctrl+V</span>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-item" @click="handleAction('addRoot')">
        <el-icon><CirclePlus /></el-icon>
        <span>添加根节点</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import {
  Plus,
  DocumentCopy,
  Edit,
  Delete,
  CopyDocument,
  Scissor,
  Document,
  CirclePlus,
} from '@element-plus/icons-vue';

interface Props {
  visible: boolean;
  x: number;
  y: number;
  nodeData?: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'action', action: string, nodeData: any): void;
  (e: 'close'): void;
}>();

function handleAction(action: string) {
  emit('action', action, props.nodeData);
  emit('close');
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.context-menu')) {
    emit('close');
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 10000;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 160px;
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

.menu-item span:nth-child(2) {
  flex: 1;
}

.menu-item .shortcut {
  font-size: 12px;
  color: #909399;
  margin-left: 16px;
}

.menu-divider {
  height: 1px;
  background-color: #e4e7ed;
  margin: 4px 0;
}
</style>
