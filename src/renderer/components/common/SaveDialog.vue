<template>
  <el-dialog
    v-model="dialogVisible"
    title="保存思维导图"
    width="400px"
    :close-on-click-modal="false"
  >
    <el-form @submit.prevent="handleConfirm">
      <el-form-item label="文件名称">
        <el-input
          v-model="fileName"
          placeholder="请输入文件名称"
          ref="inputRef"
          @keyup.enter="handleConfirm"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

interface Props {
  visible: boolean;
  defaultName: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'confirm', name: string): void;
}>();

const dialogVisible = ref(props.visible);
const fileName = ref(props.defaultName);
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.visible,
  async (val) => {
    dialogVisible.value = val;
    if (val) {
      fileName.value = props.defaultName;
      await nextTick();
      inputRef.value?.focus();
      inputRef.value?.select();
    }
  }
);

watch(dialogVisible, (val) => {
  emit('update:visible', val);
});

function handleConfirm() {
  const name = fileName.value.trim();
  if (!name) {
    return;
  }
  emit('confirm', name);
  dialogVisible.value = false;
}

function handleCancel() {
  dialogVisible.value = false;
}
</script>
