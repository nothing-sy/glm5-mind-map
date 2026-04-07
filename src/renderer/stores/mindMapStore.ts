import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MindMapNode, MultiRootMindMapData, MindMapInstance } from '@/types';
import { HistoryManager } from '@/utils/historyManager';
import {
  toSimpleMindMapFormat,
  fromSimpleMindMapFormat,
  createEmptyMindMapData,
} from '@/utils/mindMapHelper';

export const useMindMapStore = defineStore('mindMap', () => {
  // 思维导图实例
  const mindMapInstance = ref<MindMapInstance | null>(null);

  // 历史管理器
  const historyManager = ref<HistoryManager | null>(null);

  // 当前数据
  const currentData = ref<MultiRootMindMapData | null>(null);

  // 选中的节点
  const selectedNode = ref<MindMapNode | null>(null);

  // 浮动工具栏状态
  const floatToolbarVisible = ref(false);

  // 是否正在编辑
  const isEditing = ref(false);

  // 画布背景配置
  type BackgroundMode = 'dots' | 'grid' | 'gradient';
  const backgroundMode = ref<BackgroundMode>('dots');
  const gradientColors = ref<{ start: string; end: string }>({ start: '#e8f4f8', end: '#f0e6f6' });

  // 布局模式: 'logicalStructure' 从左到右, 'organizationStructure' 从上到下
  const layout = ref<'logicalStructure' | 'organizationStructure'>('logicalStructure');

  // 待记录的历史动作（用于在 data_change 事件中记录历史）
  let pendingHistoryAction: string | null = null;

  // 计算属性
  const canUndo = computed(() => historyManager.value?.canUndo() || false);
  const canRedo = computed(() => historyManager.value?.canRedo() || false);

  /**
   * 初始化思维导图
   */
  function initMindMap(instance: MindMapInstance, data?: MultiRootMindMapData): void {
    mindMapInstance.value = instance;

    // 初始化数据
    const initialData = data || createEmptyMindMapData();
    currentData.value = initialData;

    // 设置数据
    instance.setData(toSimpleMindMapFormat(initialData));

    // 初始化历史管理器
    historyManager.value = new HistoryManager(initialData);

    // 绑定事件
    bindEvents(instance);
  }

  /**
   * 绑定思维导图事件
   */
  function bindEvents(instance: MindMapInstance): void {
    // 数据变化事件
    instance.on('data_change', (data: MindMapNode) => {
      if (currentData.value) {
        const multiRootData = fromSimpleMindMapFormat(data, currentData.value);
        currentData.value = multiRootData;

        // 如果有待记录的历史动作，在数据更新后记录
        if (pendingHistoryAction) {
          historyManager.value?.push(multiRootData, pendingHistoryAction);
          pendingHistoryAction = null;
        }
      }
    });

    // 节点激活事件
    instance.on('node_active', (_node: any, activeNodeList: any[]) => {
      if (activeNodeList.length > 0) {
        selectedNode.value = activeNodeList[0];
        floatToolbarVisible.value = true;
      } else {
        selectedNode.value = null;
        floatToolbarVisible.value = false;
      }
    });
  }

  /**
   * 设置思维导图数据
   */
  function setData(data: MultiRootMindMapData, recordHistory: boolean = true): void {
    if (!mindMapInstance.value) return;

    currentData.value = data;
    mindMapInstance.value.setData(toSimpleMindMapFormat(data));

    if (recordHistory) {
      historyManager.value?.push(data, '数据变更');
    }
  }

  /**
   * 撤销
   */
  function undo(): void {
    const state = historyManager.value?.undo();
    if (state && mindMapInstance.value) {
      currentData.value = state.data;
      mindMapInstance.value.setData(toSimpleMindMapFormat(state.data));
    }
  }

  /**
   * 重做
   */
  function redo(): void {
    const state = historyManager.value?.redo();
    if (state && mindMapInstance.value) {
      currentData.value = state.data;
      mindMapInstance.value.setData(toSimpleMindMapFormat(state.data));
    }
  }

  /**
   * 记录历史（设置待记录动作，在下次 data_change 事件中实际记录）
   */
  function recordHistory(action: string): void {
    pendingHistoryAction = action;
  }

  /**
   * 获取导出数据
   */
  function getExportData(): MultiRootMindMapData | null {
    return currentData.value;
  }

  /**
   * 销毁实例
   */
  function destroy(): void {
    if (mindMapInstance.value) {
      mindMapInstance.value.destroy();
      mindMapInstance.value = null;
    }
    historyManager.value = null;
    currentData.value = null;
    selectedNode.value = null;
  }

  /**
   * 设置布局模式
   */
  function setLayout(newLayout: 'logicalStructure' | 'organizationStructure'): void {
    layout.value = newLayout;
    if (mindMapInstance.value) {
      mindMapInstance.value.setLayout(newLayout);
    }
  }

  /**
   * 隐藏浮动工具栏
   */
  function hideFloatToolbar(): void {
    floatToolbarVisible.value = false;
  }

  /**
   * 设置画布背景模式
   */
  function setBackgroundMode(mode: BackgroundMode): void {
    backgroundMode.value = mode;
  }

  /**
   * 设置渐变颜色
   */
  function setGradientColors(start: string, end: string): void {
    gradientColors.value = { start, end };
  }

  return {
    mindMapInstance,
    currentData,
    selectedNode,
    isEditing,
    layout,
    canUndo,
    canRedo,
    floatToolbarVisible,
    backgroundMode,
    gradientColors,
    initMindMap,
    setData,
    undo,
    redo,
    recordHistory,
    getExportData,
    destroy,
    setLayout,
    hideFloatToolbar,
    setBackgroundMode,
    setGradientColors,
  };
});
