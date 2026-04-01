<template>
  <Teleport to="body">
    <div
      class="node-editor"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
    >
      <el-input
        ref="inputRef"
        v-model="editText"
        size="small"
        placeholder="请输入节点文本"
        @keyup.enter="handleSave"
        @keyup.escape="handleCancel"
        @blur="handleSave"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import type { MindMapNode } from '@/types';

interface Props {
  node: MindMapNode;
  position: { x: number; y: number };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'save', text: string): void;
  (e: 'cancel'): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const editText = ref(props.node.data.text || '');

onMounted(async () => {
  await nextTick();
  inputRef.value?.focus();
  inputRef.value?.select();
});

function handleSave() {
  const text = editText.value.trim();
  if (text) {
    emit('save', text);
  } else {
    emit('cancel');
  }
}

function handleCancel() {
  emit('cancel');
}
</script>

<style scoped>
.node-editor {
  position: fixed;
  z-index: 9999;
  transform: translate(-50%, -50%);
  min-width: 200px;
}

.node-editor :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 2px #409eff;
}
</style>
