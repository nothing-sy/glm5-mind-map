<template>
  <Teleport to="body">
    <div
      class="floating-toolbar"
      :style="toolbarStyle"
      @mousedown="handleMouseDown"
    >
      <!-- 拖动手柄 -->
      <div class="drag-handle">
        <el-icon><Rank /></el-icon>
      </div>

      <!-- 工具按钮组 -->
      <div class="toolbar-buttons">
        <el-tooltip content="搜索" placement="right">
          <el-button class="tool-btn" @click.stop="handleTool1">
            <el-icon><Search /></el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip content="设置" placement="right">
          <el-button class="tool-btn" @click.stop="handleTool2">
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip content="全屏" placement="right">
          <el-button class="tool-btn" @click.stop="handleTool3">
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </el-tooltip>

        <el-tooltip content="网格" placement="right">
          <el-button class="tool-btn" @click.stop="handleTool4">
            <el-icon><Grid /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Rank, Search, Setting, FullScreen, Grid } from '@element-plus/icons-vue';

// 常量
const STORAGE_KEY = 'floating-toolbar-position';
const TOOLBAR_WIDTH = 48;
const TOOLBAR_HEIGHT = 200;
const DEFAULT_LEFT = 20;
const GAP = 10;

// 状态
const position = ref({ left: DEFAULT_LEFT, top: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0, left: 0, top: 0 });

// 计算样式
const toolbarStyle = computed(() => ({
  left: `${position.value.left}px`,
  top: `${position.value.top}px`,
}));

// 初始化位置
function initPosition() {
  // 尝试从 localStorage 恢复位置
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // 验证位置是否在可视区域内
      if (isValidPosition(parsed.left, parsed.top)) {
        position.value = parsed;
        return;
      }
    } catch {
      // 解析失败，使用默认位置
    }
  }
  // 使用默认位置：垂直居中
  position.value = {
    left: DEFAULT_LEFT,
    top: Math.floor((window.innerHeight - TOOLBAR_HEIGHT) / 2),
  };
}

// 验证位置是否有效
function isValidPosition(left: number, top: number): boolean {
  return (
    left >= 0 &&
    left <= window.innerWidth - TOOLBAR_WIDTH &&
    top >= 0 &&
    top <= window.innerHeight - TOOLBAR_HEIGHT
  );
}

// 保存位置到 localStorage
function savePosition() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(position.value));
}

// 鼠标按下：开始拖动
function handleMouseDown(e: MouseEvent) {
  // 只有点击拖动手柄才能拖动
  const target = e.target as HTMLElement;
  if (!target.closest('.drag-handle')) {
    return;
  }

  e.preventDefault();
  isDragging.value = true;
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    left: position.value.left,
    top: position.value.top,
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

// 鼠标移动：更新位置
function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;

  const deltaX = e.clientX - dragStart.value.x;
  const deltaY = e.clientY - dragStart.value.y;

  let newLeft = dragStart.value.left + deltaX;
  let newTop = dragStart.value.top + deltaY;

  // 边界检测
  newLeft = Math.max(GAP, Math.min(newLeft, window.innerWidth - TOOLBAR_WIDTH - GAP));
  newTop = Math.max(GAP, Math.min(newTop, window.innerHeight - TOOLBAR_HEIGHT - GAP));

  position.value = { left: newLeft, top: newTop };
}

// 鼠标释放：结束拖动
function handleMouseUp() {
  if (isDragging.value) {
    isDragging.value = false;
    savePosition();
  }
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}

// 工具按钮点击处理（占位符）
function handleTool1() {
  console.log('Tool 1 clicked: 搜索');
}

function handleTool2() {
  console.log('Tool 2 clicked: 设置');
}

function handleTool3() {
  console.log('Tool 3 clicked: 全屏');
}

function handleTool4() {
  console.log('Tool 4 clicked: 网格');
}

// 窗口大小变化时调整位置
function handleResize() {
  // 确保工具栏在可视区域内
  const { left, top } = position.value;
  if (!isValidPosition(left, top)) {
    position.value = {
      left: Math.min(left, window.innerWidth - TOOLBAR_WIDTH - GAP),
      top: Math.min(top, window.innerHeight - TOOLBAR_HEIGHT - GAP),
    };
  }
}

onMounted(() => {
  initPosition();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style scoped>
.floating-toolbar {
  position: fixed;
  z-index: 9998;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid #e4e7ed;
  user-select: none;
}

.drag-handle {
  width: 100%;
  padding: 4px;
  cursor: grab;
  display: flex;
  justify-content: center;
  color: #909399;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 4px;
  padding-bottom: 8px;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle:hover {
  color: #606266;
}

.toolbar-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tool-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:hover {
  background: #f0f2f5;
  color: #409eff;
}
</style>
