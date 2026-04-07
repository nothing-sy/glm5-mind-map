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
        <!-- 背景切换 -->
        <el-popover trigger="click" placement="right" :width="280">
          <template #reference>
            <el-button class="tool-btn" @click.stop>
              <span class="icon-svg" v-html="layoutGridIcon"></span>
            </el-button>
          </template>

          <!-- 背景选择面板 -->
          <div class="background-picker-panel">
            <div class="background-options">
              <div
                class="bg-option"
                :class="{ 'is-active': currentBackgroundMode === 'dots' }"
                @click="handleBackgroundChange('dots')"
              >
                <div class="bg-preview dots-bg"></div>
                <span>点阵</span>
              </div>
              <div
                class="bg-option"
                :class="{ 'is-active': currentBackgroundMode === 'grid' }"
                @click="handleBackgroundChange('grid')"
              >
                <div class="bg-preview grid-bg"></div>
                <span>网格</span>
              </div>
              <div
                class="bg-option"
                :class="{ 'is-active': currentBackgroundMode === 'gradient' }"
                @click="handleBackgroundChange('gradient')"
              >
                <div class="bg-preview gradient-bg" :style="gradientPreviewStyle"></div>
                <span>渐变</span>
              </div>
            </div>

            <!-- 渐变颜色选择 -->
            <div v-if="currentBackgroundMode === 'gradient'" class="gradient-colors">
              <el-divider />
              <div class="color-row">
                <span>起始色:</span>
                <el-color-picker v-model="gradientStart" size="small" @change="updateGradient" />
              </div>
              <div class="color-row">
                <span>结束色:</span>
                <el-color-picker v-model="gradientEnd" size="small" @change="updateGradient" />
              </div>
            </div>
          </div>
        </el-popover>

        <el-tooltip content="设置" placement="right">
          <el-button class="tool-btn" @click.stop="handleTool2">
            <span class="icon-svg" v-html="gearIcon"></span>
          </el-button>
        </el-tooltip>

        <el-tooltip content="全屏" placement="right">
          <el-button class="tool-btn" @click.stop="handleTool3">
            <span class="icon-svg" v-html="desktopComputerIcon"></span>
          </el-button>
        </el-tooltip>

        <el-tooltip content="搜索" placement="right">
          <el-button class="tool-btn" @click.stop="handleTool4">
            <span class="icon-svg" v-html="magnifyingGlassIcon"></span>
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Rank } from '@element-plus/icons-vue';
import { useMindMapStore } from '@/stores';
import { storeToRefs } from 'pinia';

// 导入本地图标 (使用 ?raw 获取 SVG 内容)
import layoutGridIcon from '@/assets/icons/layout-grid.svg?raw';
import gearIcon from '@/assets/icons/gear.svg?raw';
import desktopComputerIcon from '@/assets/icons/desktop-computer.svg?raw';
import magnifyingGlassIcon from '@/assets/icons/magnifying-glass-tilted-left.svg?raw';

interface Props {
  containerRef?: HTMLElement | null;
}

const props = defineProps<Props>();

const mindMapStore = useMindMapStore();
const { backgroundMode, gradientColors } = storeToRefs(mindMapStore);

// 背景相关状态
const currentBackgroundMode = ref(backgroundMode.value);
const gradientStart = ref(gradientColors.value.start);
const gradientEnd = ref(gradientColors.value.end);

// 渐变预览样式
const gradientPreviewStyle = computed(() => ({
  background: `linear-gradient(135deg, ${gradientStart.value} 0%, ${gradientEnd.value} 100%)`,
}));

// 处理背景模式切换
function handleBackgroundChange(mode: 'dots' | 'grid' | 'gradient') {
  currentBackgroundMode.value = mode;
  mindMapStore.setBackgroundMode(mode);
  if (mode === 'gradient') {
    mindMapStore.setGradientColors(gradientStart.value, gradientEnd.value);
  }
}

// 更新渐变颜色
function updateGradient() {
  mindMapStore.setGradientColors(gradientStart.value, gradientEnd.value);
}

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

// 获取边界
function getBounds() {
  if (props.containerRef) {
    const rect = props.containerRef.getBoundingClientRect();
    return {
      minX: rect.left + GAP,
      maxX: rect.right - TOOLBAR_WIDTH - GAP,
      minY: rect.top + GAP,
      maxY: rect.bottom - TOOLBAR_HEIGHT - GAP,
    };
  }
  return {
    minX: GAP,
    maxX: window.innerWidth - TOOLBAR_WIDTH - GAP,
    minY: GAP,
    maxY: window.innerHeight - TOOLBAR_HEIGHT - GAP,
  };
}

// 计算样式
const toolbarStyle = computed(() => ({
  left: `${position.value.left}px`,
  top: `${position.value.top}px`,
}));

// 初始化位置
function initPosition() {
  const bounds = getBounds();
  // 尝试从 localStorage 恢复位置
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // 验证位置是否在容器区域内
      if (isValidPosition(parsed.left, parsed.top)) {
        position.value = parsed;
        return;
      }
    } catch {
      // 解析失败，使用默认位置
    }
  }
  // 使用默认位置：垂直居中
  const centerTop = Math.floor((bounds.maxY + bounds.minY) / 2);
  position.value = {
    left: bounds.minX,
    top: Math.max(bounds.minY, Math.min(centerTop, bounds.maxY)),
  };
}

// 验证位置是否有效
function isValidPosition(left: number, top: number): boolean {
  const bounds = getBounds();
  return (
    left >= bounds.minX &&
    left <= bounds.maxX &&
    top >= bounds.minY &&
    top <= bounds.maxY
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

  const bounds = getBounds();
  const deltaX = e.clientX - dragStart.value.x;
  const deltaY = e.clientY - dragStart.value.y;

  let newLeft = dragStart.value.left + deltaX;
  let newTop = dragStart.value.top + deltaY;

  // 边界检测 - 限制在容器范围内
  newLeft = Math.max(bounds.minX, Math.min(newLeft, bounds.maxX));
  newTop = Math.max(bounds.minY, Math.min(newTop, bounds.maxY));

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

// 工具按钮点击处理
function handleTool2() {
  console.log('Tool 2 clicked: 设置');
}

function handleTool3() {
  console.log('Tool 3 clicked: 全屏');
}

function handleTool4() {
  console.log('Tool 4 clicked: 搜索');
}

// 窗口大小变化时调整位置
function handleResize() {
  // 确保工具栏在容器区域内
  const bounds = getBounds();
  const { left, top } = position.value;
  if (!isValidPosition(left, top)) {
    position.value = {
      left: Math.max(bounds.minX, Math.min(left, bounds.maxX)),
      top: Math.max(bounds.minY, Math.min(top, bounds.maxY)),
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
  padding: 0 !important;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.tool-btn :deep(.el-icon) {
  margin: 0 !important;
}

.floating-toolbar :deep(.el-button + .el-button) {
  margin-left: 0 !important;
}

.tool-btn:hover {
  background: #f0f2f5;
  color: #409eff;
}

/* SVG 图标样式 */
.icon-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
}

.icon-svg :deep(svg) {
  width: 18px;
  height: 18px;
}

.tool-btn:hover .icon-svg {
  color: #409eff;
}

/* 背景选择面板 */
.background-picker-panel {
  padding: 8px;
}

.background-options {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.bg-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.bg-option:hover {
  background: #f0f2f5;
}

.bg-option.is-active {
  background: #ecf5ff;
}

.bg-option.is-active .bg-preview {
  border-color: #409eff;
}

.bg-option span {
  font-size: 12px;
  color: #606266;
}

.bg-preview {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 2px solid #dcdfe6;
  transition: border-color 0.2s;
}

.dots-bg {
  background: radial-gradient(circle, #d0d0d0 1px, transparent 1px);
  background-size: 8px 8px;
  background-color: #fff;
}

.grid-bg {
  background-image:
    linear-gradient(to right, #e0e0e0 1px, transparent 1px),
    linear-gradient(to bottom, #e0e0e0 1px, transparent 1px);
  background-size: 8px 8px;
  background-color: #fff;
}

.gradient-bg {
  background: linear-gradient(135deg, #e8f4f8 0%, #f0e6f6 100%);
}

.gradient-colors {
  margin-top: 8px;
}

.color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.color-row span {
  font-size: 13px;
  color: #606266;
}
</style>
