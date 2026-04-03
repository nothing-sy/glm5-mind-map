<template>
  <div class="mindmap-container">
    <div ref="mindMapRef" class="mindmap-canvas"></div>

    <!-- 右键菜单 -->
    <ContextMenu
      :visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :node-data="selectedNodeData"
      @action="handleContextMenuAction"
      @close="closeContextMenu"
    />

    <!-- 浮动工具栏 -->
    <NodeFloatToolbar
      :visible="floatToolbarVisible"
      :selected-node="selectedNode"
      @close="hideFloatToolbar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import MindMap from 'simple-mind-map';
import Drag from 'simple-mind-map/src/plugins/Drag';
import Select from 'simple-mind-map/src/plugins/Select';
import Export from 'simple-mind-map/src/plugins/Export';
import Search from 'simple-mind-map/src/plugins/Search';
import { useMindMapStore, useFileListStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { toSimpleMindMapFormat, fromSimpleMindMapFormat, createEmptyMindMapData } from '@/utils/mindMapHelper';
import type { MindMapNode } from '@/types';
import ContextMenu from '../common/ContextMenu.vue';
import NodeFloatToolbar from '../common/NodeFloatToolbar.vue';

// 注册插件
MindMap.usePlugin(Drag);
MindMap.usePlugin(Select);
MindMap.usePlugin(Export);
MindMap.usePlugin(Search);

const mindMapRef = ref<HTMLElement | null>(null);
const mindMapStore = useMindMapStore();
const fileListStore = useFileListStore();
const { activeFile } = storeToRefs(fileListStore);
const { layout, floatToolbarVisible, selectedNode } = storeToRefs(mindMapStore);
const { hideFloatToolbar } = mindMapStore;

// 右键菜单状态
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const selectedNodeData = ref<any>(null);

// 思维导图实例
let mindMapInstance: any = null;

// 监听当前文件变化
watch(activeFile, (newFile) => {
  if (newFile && mindMapInstance) {
    mindMapInstance.setData(toSimpleMindMapFormat(newFile.data));
  }
});

onMounted(() => {
  if (mindMapRef.value) {
    initMindMap();
  }
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  mindMapStore.destroy();
  window.removeEventListener('resize', handleResize);
});

// 处理窗口大小变化
function handleResize() {
  if (mindMapInstance) {
    mindMapInstance.resize();
  }
}

function initMindMap() {
  if (!mindMapRef.value) return;

  const initialData = activeFile.value?.data || createEmptyMindMapData();

  mindMapInstance = new MindMap({
    el: mindMapRef.value,
    data: toSimpleMindMapFormat(initialData),
    layout: layout.value,
    theme: 'default',
    initRootNodePosition: ['center', 'center'],
    enableFreeDrag: false,
    mousewheelAction: 'zoom', // 滚轮缩放
    mouseScaleCenterUseMousePosition: true, // 以鼠标位置为中心缩放
  });

  // 初始化 store
  mindMapStore.initMindMap(mindMapInstance, initialData);

  // 绑定事件
  bindEvents();
}

function bindEvents() {
  if (!mindMapInstance) return;

  // 节点右键菜单
  mindMapInstance.on('node_contextmenu', (e: MouseEvent, node: any) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, node);
  });

  // 画布点击关闭菜单
  mindMapInstance.on('draw_click', () => {
    closeContextMenu();
  });

  // 数据变化
  mindMapInstance.on('data_change', (data: MindMapNode) => {
    if (activeFile.value) {
      const multiRootData = fromSimpleMindMapFormat(data, activeFile.value.data);
      fileListStore.updateFileData(activeFile.value.id, multiRootData);
    }
  });
}

function showContextMenu(x: number, y: number, node: any) {
  contextMenuX.value = x;
  contextMenuY.value = y;
  selectedNodeData.value = node;
  contextMenuVisible.value = true;
}

function closeContextMenu() {
  contextMenuVisible.value = false;
  selectedNodeData.value = null;
}

function handleContextMenuAction(action: string, nodeData: any) {
  closeContextMenu();

  switch (action) {
    case 'addChild':
      addChildNode(nodeData);
      break;
    case 'addSibling':
      addSiblingNode(nodeData);
      break;
    case 'edit':
      // 使用 simple-mind-map 内置的编辑功能
      mindMapInstance?.renderer.textEdit.show({ node: nodeData });
      break;
    case 'delete':
      deleteNode(nodeData);
      break;
    case 'addRoot':
      addRootNode();
      break;
    case 'copy':
      copyNode(nodeData);
      break;
    case 'cut':
      cutNode(nodeData);
      break;
    case 'paste':
      pasteNode(nodeData);
      break;
  }
}

function addChildNode(parentNode: any) {
  mindMapStore.recordHistory('添加子节点');
  mindMapInstance?.execCommand('INSERT_CHILD_NODE', false, [parentNode]);
}

function addSiblingNode(node: any) {
  mindMapStore.recordHistory('添加同级节点');
  mindMapInstance?.execCommand('INSERT_NODE', false, [node]);
}

function deleteNode(node: any) {
  mindMapStore.recordHistory('删除节点');
  mindMapInstance?.execCommand('REMOVE_NODE', node);
}

function addRootNode() {
  mindMapStore.recordHistory('添加根节点');
  mindMapInstance?.execCommand('ADD_ROOT_NODE');
}

let clipboardNode: MindMapNode | null = null;

function copyNode(node: any) {
  clipboardNode = JSON.parse(JSON.stringify(node.nodeData));
}

function cutNode(node: any) {
  clipboardNode = JSON.parse(JSON.stringify(node.nodeData));
  deleteNode(node);
}

function pasteNode(targetNode: any) {
  if (!clipboardNode) return;
  const newNode = JSON.parse(JSON.stringify(clipboardNode));
  mindMapStore.recordHistory('粘贴节点');
  mindMapInstance?.execCommand('INSERT_CHILD_NODE', false, [targetNode], newNode);
}

// 暴露方法给父组件
defineExpose({
  export: async (format: string, options?: any) => {
    // simple-mind-map export 签名: export(type, isDownload = true, name = '思维导图')
    // 传递 isDownload = false 只获取 Data URL，不触发内部下载
    return mindMapInstance?.export(format, false, options?.name || activeFile.value?.name || '思维导图');
  },
  getData: () => {
    return mindMapInstance?.getData();
  },
  // 定位并激活指定节点
  focusNode: (nodeId: string) => {
    if (!mindMapInstance) return;

    // 使用 simple-mind-map 的 GO_TARGET_NODE 命令跳转到目标节点
    // 该命令会自动查找节点、激活节点并将视图移动到节点位置
    mindMapInstance.execCommand('GO_TARGET_NODE', nodeId);
  },
});

</script>

<style scoped>
.mindmap-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f0f2f5;
}

.mindmap-canvas {
  width: 100%;
  height: 100%;
}
</style>
