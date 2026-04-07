<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-show="visible"
        class="node-float-toolbar"
        :style="toolbarStyle"
        @mousedown.stop
      >
        <!-- 字体大小控制 -->
        <div class="toolbar-section">
          <el-dropdown trigger="click" @command="handleFontSizeChange">
            <el-button size="small" class="toolbar-btn" title="字体大小">
              <el-icon><EditPen /></el-icon>
              <span class="current-size">{{ currentFontSize }}</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="size in fontSizes"
                  :key="size"
                  :command="size"
                  :class="{ 'is-active': currentFontSize === size }"
                >
                  {{ size }}px
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="toolbar-divider"></div>

        <!-- 颜色选择器 -->
        <div class="toolbar-section">
          <el-popover trigger="click" placement="bottom" :width="280" role="tooltip">
            <template #reference>
              <el-button size="small" class="toolbar-btn" title="文字颜色">
                <div
                  class="color-indicator"
                  :style="{ backgroundColor: currentColor || '#333' }"
                ></div>
              </el-button>
            </template>

            <!-- 颜色选择面板 -->
            <div class="color-picker-panel">
              <div class="preset-colors">
                <div
                  v-for="color in presetColors"
                  :key="color"
                  class="color-item"
                  :class="{ 'is-active': currentColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="handleColorChange(color)"
                ></div>
              </div>
              <el-divider />
              <div class="custom-color">
                <span>自定义:</span>
                <el-color-picker v-model="customColor" @change="handleColorChange" />
              </div>
            </div>
          </el-popover>
        </div>

        <div class="toolbar-divider"></div>

        <!-- 图标选择器 -->
        <div class="toolbar-section">
          <el-popover trigger="click" placement="bottom" :width="340" role="tooltip">
            <template #reference>
              <el-button size="small" class="toolbar-btn" title="插入图标">
                <el-icon><Star /></el-icon>
              </el-button>
            </template>

            <!-- 图标选择面板 -->
            <div class="icon-picker-panel">
              <el-input
                v-model="iconSearchText"
                placeholder="搜索图标..."
                size="small"
                clearable
                class="icon-search"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <div class="icon-grid">
                <div
                  v-for="icon in filteredIcons"
                  :key="icon.name"
                  class="icon-item"
                  :title="icon.name"
                  @click="handleIconSelect(icon.name)"
                >
                  <el-icon :size="18">
                    <component :is="icon.component" />
                  </el-icon>
                </div>
              </div>

              <div v-if="currentIcons.length > 0" class="current-icons">
                <el-divider />
                <span class="current-icons-label">当前图标:</span>
                <div class="current-icons-list">
                  <el-tag
                    v-for="iconName in currentIcons"
                    :key="iconName"
                    closable
                    size="small"
                    class="icon-tag"
                    @close="handleIconRemove(iconName)"
                  >
                    {{ iconName }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-popover>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { EditPen, Star, Search } from '@element-plus/icons-vue';
import { searchIcons, registerIconToMindMap, type IconInfo } from '@/utils/elementIcons';
import { useMindMapStore } from '@/stores';

interface Props {
  visible: boolean;
  selectedNode: any;
  containerRef: HTMLElement | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const mindMapStore = useMindMapStore();

// 字体大小选项
const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

// 预设颜色
const presetColors = [
  '#333333',
  '#666666',
  '#999999',
  '#cccccc',
  '#f56c6c',
  '#e6a23c',
  '#e6c23c',
  '#67c23a',
  '#409eff',
  '#909399',
  '#b37feb',
  '#ff85c0',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
];

// 状态
const currentFontSize = ref(16);
const currentColor = ref('#333');
const currentIcons = ref<string[]>([]);
const customColor = ref('');
const iconSearchText = ref('');
const allIcons = ref<IconInfo[]>([]);

// 初始化图标列表
onMounted(() => {
  allIcons.value = searchIcons('');
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 过滤图标
const filteredIcons = computed(() => {
  return searchIcons(iconSearchText.value);
});

// 计算工具栏位置
const toolbarStyle = computed(() => {
  if (!props.visible || !props.selectedNode) {
    return { left: '-9999px', top: '-9999px' };
  }

  try {
    const rect = props.selectedNode.getRect();
    const toolbarWidth = 280;
    const toolbarHeight = 44;
    const gap = 8;
    const margin = 10;

    // 获取容器边界
    const containerRect = props.containerRef?.getBoundingClientRect();
    const minX = containerRect ? containerRect.left + margin : margin;
    const maxX = containerRect ? containerRect.right - toolbarWidth - margin : window.innerWidth - toolbarWidth - margin;
    const minY = containerRect ? containerRect.top + margin : margin;
    const maxY = containerRect ? containerRect.bottom - toolbarHeight - margin : window.innerHeight - toolbarHeight - margin;

    // rect 使用 x, y 而不是 left, top
    let left = rect.x + (rect.width - toolbarWidth) / 2;
    let top = rect.y - toolbarHeight - gap;

    // 边界检测 - 限制在画布容器内
    if (left < minX) left = minX;
    if (left > maxX) left = maxX;
    if (top < minY) {
      // 如果上方放不下，尝试放在节点下方
      top = rect.y + rect.height + gap;
      if (top > maxY) {
        top = maxY;
      }
    }
    if (top > maxY) top = maxY;

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  } catch {
    return { left: '-9999px', top: '-9999px' };
  }
});

// 监听节点变化，更新当前值
watch(
  () => props.selectedNode,
  (node) => {
    if (node) {
      // 获取当前字体大小
      const fontSize = node.getStyle('fontSize');
      currentFontSize.value = fontSize || 16;

      // 获取当前颜色
      const color = node.getStyle('color');
      currentColor.value = color || '#333';

      // 获取当前图标
      const icons = node.getData('icon') || [];
      currentIcons.value = [...icons];
    }
  },
  { immediate: true }
);

// 处理字体大小变化
function handleFontSizeChange(fontSize: number) {
  if (!props.selectedNode) return;
  props.selectedNode.setStyle('fontSize', fontSize);
  currentFontSize.value = fontSize;
}

// 处理颜色变化
function handleColorChange(color: string) {
  if (!props.selectedNode || !color) return;
  props.selectedNode.setStyle('color', color);
  currentColor.value = color;
}

// 处理图标选择
function handleIconSelect(iconName: string) {
  if (!props.selectedNode) return;

  // 注册图标到 simple-mind-map
  const mindMapInstance = mindMapStore.mindMapInstance;
  if (!mindMapInstance) return;

  const iconKey = registerIconToMindMap(mindMapInstance, iconName);

  const iconList = props.selectedNode.getData('icon') || [];
  if (!iconList.includes(iconKey)) {
    const newIconList = [...iconList, iconKey];
    props.selectedNode.setIcon(newIconList);
    currentIcons.value = newIconList;
  }
}

// 处理图标删除
function handleIconRemove(iconName: string) {
  if (!props.selectedNode) return;

  const iconList = props.selectedNode.getData('icon') || [];
  const newIconList = iconList.filter((name: string) => name !== iconName);
  props.selectedNode.setIcon(newIconList);
  currentIcons.value = newIconList;
}

// 点击外部关闭
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (
    !target.closest('.node-float-toolbar') &&
    !target.closest('.el-popover') &&
    !target.closest('.el-dropdown-menu')
  ) {
    emit('close');
  }
}
</script>

<style scoped>
.node-float-toolbar {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid #e4e7ed;
}

.toolbar-section {
  display: flex;
  align-items: center;
}

.toolbar-btn {
  padding: 6px 8px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn:hover {
  background: #f0f2f5;
}

.current-size {
  font-size: 12px;
  color: #606266;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #e4e7ed;
  margin: 0 4px;
}

.color-indicator {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  border: 1px solid #dcdfe6;
}

/* 颜色选择面板 */
.color-picker-panel {
  padding: 8px;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.color-item {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.is-active {
  border-color: #409eff;
}

.custom-color {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

/* 图标选择面板 */
.icon-picker-panel {
  max-height: 360px;
}

.icon-search {
  margin-bottom: 12px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.icon-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-item:hover {
  background: #f0f2f5;
  color: #409eff;
}

.current-icons {
  margin-top: 8px;
}

.current-icons-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  display: block;
}

.current-icons-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.icon-tag {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
