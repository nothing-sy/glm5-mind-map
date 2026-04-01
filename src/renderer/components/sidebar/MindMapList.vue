<template>
  <div class="mind-map-list">
    <div
      v-for="file in files"
      :key="file.id"
      class="list-item"
      :class="{ active: file.id === activeFileId, dirty: file.isDirty }"
      @click="$emit('select', file.id)"
    >
      <div class="item-content">
        <el-icon class="item-icon"><Document /></el-icon>
        <span class="item-name" :title="file.name">
          {{ file.name }}
          <span v-if="file.isDirty" class="dirty-mark">*</span>
        </span>
      </div>
      <el-button
        class="close-btn"
        type="info"
        :icon="Close"
        size="small"
        text
        @click.stop="$emit('close', file.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, Close } from '@element-plus/icons-vue';
import type { MindMapFile } from '@/types';

interface Props {
  files: MindMapFile[];
  activeFileId: string | null;
}

defineProps<Props>();

defineEmits<{
  (e: 'select', fileId: string): void;
  (e: 'close', fileId: string): void;
}>();
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
</style>
