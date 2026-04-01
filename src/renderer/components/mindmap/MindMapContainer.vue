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

    <!-- 节点编辑器 -->
    <NodeEditor
      v-if="editingNode"
      :node="editingNode"
      :position="editingPosition"
      @save="handleSaveEdit"
      @cancel="handleCancelEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import MindMap from 'simple-mind-map';
import Drag from 'simple-mind-map/src/plugins/Drag';
import Select from 'simple-mind-map/src/plugins/Select';
import Export from 'simple-mind-map/src/plugins/Export';
import { useMindMapStore, useFileListStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { toSimpleMindMapFormat, fromSimpleMindMapFormat } from '@/utils/mindMapHelper';
import type { MindMapNode, MultiRootMindMapData } from '@/types';
import ContextMenu from '../common/ContextMenu.vue';
import NodeEditor from './NodeEditor.vue';

// 注册插件
MindMap.usePlugin(Drag);
MindMap.usePlugin(Select);
MindMap.usePlugin(Export);

const mindMapRef = ref<HTMLElement | null>(null);
const mindMapStore = useMindMapStore();
const fileListStore = useFileListStore();
const { activeFile } = storeToRefs(fileListStore);

// 右键菜单状态
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const selectedNodeData = ref<any>(null);

// 编辑状态
const editingNode = ref<MindMapNode | null>(null);
const editingPosition = ref({ x: 0, y: 0 });

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

  const initialData = activeFile.value?.data;

  mindMapInstance = new MindMap({
    el: mindMapRef.value,
    data: initialData ? toSimpleMindMapFormat(initialData) : undefined,
    layout: 'mindMap',
    theme: 'default',
    initRootNodePosition: ['center', 'center'],
    enableFreeDrag: true,
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

  // 节点双击事件
  mindMapInstance.on('node_dblclick', (node: any, e: MouseEvent) => {
    e.stopPropagation();
    startEditing(node);
  });

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
      startEditing(nodeData);
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
  mindMapInstance?.execCommand('INSERT_CHILD_NODE', false, [], parentNode);
  mindMapStore.recordHistory('添加子节点');
}

function addSiblingNode(node: any) {
  mindMapInstance?.execCommand('INSERT_NODE', false, [], node);
  mindMapStore.recordHistory('添加同级节点');
}

function deleteNode(node: any) {
  mindMapInstance?.execCommand('REMOVE_NODE', node);
  mindMapStore.recordHistory('删除节点');
}

function addRootNode() {
  mindMapInstance?.execCommand('ADD_ROOT_NODE');
  mindMapStore.recordHistory('添加根节点');
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
  mindMapInstance?.execCommand('INSERT_CHILD_NODE', false, newNode, targetNode);
  mindMapStore.recordHistory('粘贴节点');
}

function startEditing(node: any) {
  editingNode.value = node.nodeData || node;
  // 获取节点位置用于定位编辑器
  const rect = mindMapRef.value?.getBoundingClientRect();
  if (rect && node) {
    editingPosition.value = {
      x: rect.width / 2,
      y: rect.height / 2,
    };
  }
}

function handleSaveEdit(newText: string) {
  if (editingNode.value) {
    mindMapInstance?.execCommand('SET_NODE_TEXT', editingNode.value, newText);
    mindMapStore.recordHistory('编辑节点');
  }
  editingNode.value = null;
}

function handleCancelEdit() {
  editingNode.value = null;
}

// 暴露方法给父组件
defineExpose({
  export: async (format: string, options?: any) => {
    return mindMapInstance?.export(format, options);
  },
  getData: () => {
    return mindMapInstance?.getData();
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
