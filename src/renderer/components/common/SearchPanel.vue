<template>
  <div class="search-panel" v-if="visible">
    <div class="search-header">
      <el-input
        ref="searchInputRef"
        v-model="keyword"
        placeholder="搜索节点..."
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button text @click="handleClose">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <div class="search-results" v-if="results.length > 0">
      <div class="result-count">找到 {{ results.length }} 个结果</div>
      <div
        v-for="(result, index) in results"
        :key="result.nodeId"
        class="result-item"
        :class="{ active: index === activeIndex }"
        @click="handleSelectResult(result, index)"
      >
        <div class="result-text">{{ result.text }}</div>
        <div class="result-path">{{ result.path.join(' > ') }}</div>
      </div>
    </div>

    <div class="search-empty" v-else-if="keyword && !loading">
      <el-empty description="未找到匹配的节点" :image-size="60" />
    </div>

    <div class="search-footer" v-if="results.length > 0">
      <span class="shortcut-hint">
        按 <kbd>↑</kbd> <kbd>↓</kbd> 选择，<kbd>Enter</kbd> 跳转
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Search, Close } from '@element-plus/icons-vue';
import type { SearchResult } from '@/utils/mindMapHelper';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'search', keyword: string): void;
  (e: 'select', result: SearchResult): void;
}>();

const keyword = ref('');
const results = ref<SearchResult[]>([]);
const activeIndex = ref(0);
const loading = ref(false);
const searchInputRef = ref<any>(null);

// 搜索防抖
let searchTimer: ReturnType<typeof setTimeout> | null = null;

function handleSearch() {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    loading.value = true;
    emit('search', keyword.value);
    searchTimer = null;
    loading.value = false;
  }, 200);
}

function handleSelectResult(result: SearchResult, index: number) {
  activeIndex.value = index;
  emit('select', result);
}

function handleClose() {
  keyword.value = '';
  results.value = [];
  activeIndex.value = 0;
  emit('close');
}

// 更新搜索结果
function setResults(newResults: SearchResult[]) {
  results.value = newResults;
  activeIndex.value = 0;
}

// 键盘导航
function handleKeydown(e: KeyboardEvent) {
  if (!props.visible) return;

  if (e.key === 'Escape') {
    handleClose();
    return;
  }

  if (results.value.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % results.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length;
  } else if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    const selectedResult = results.value[activeIndex.value];
    if (selectedResult) {
      emit('select', selectedResult);
    }
  }
}

// 监听显示状态，自动聚焦
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 显示时重置状态
    keyword.value = '';
    results.value = [];
    activeIndex.value = 0;
    // 自动聚焦到输入框
    setTimeout(() => {
      searchInputRef.value?.focus();
    }, 100);
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
});

defineExpose({
  setResults,
});
</script>

<style scoped>
.search-panel {
  position: fixed;
  top: 60px;
  right: 20px;
  width: 360px;
  max-height: 480px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  gap: 8px;
}

.search-header .el-input {
  flex: 1;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.result-count {
  padding: 8px 12px;
  font-size: 12px;
  color: #909399;
}

.result-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover,
.result-item.active {
  background-color: #f5f7fa;
}

.result-item.active {
  background-color: #ecf5ff;
}

.result-text {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.result-text :deep(mark) {
  background-color: #ffd666;
  padding: 0 2px;
  border-radius: 2px;
}

.result-path {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-empty {
  padding: 20px;
}

.search-footer {
  padding: 8px 12px;
  border-top: 1px solid #e4e7ed;
  background-color: #fafafa;
}

.shortcut-hint {
  font-size: 12px;
  color: #909399;
}

.shortcut-hint kbd {
  display: inline-block;
  padding: 2px 6px;
  font-size: 11px;
  font-family: inherit;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  margin: 0 2px;
}
</style>
