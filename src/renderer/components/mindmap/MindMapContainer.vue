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

    // 先取消所有节点的激活状态
    const activeNodes = mindMapInstance.renderer.activeNodeList || [];
    activeNodes.forEach((node: any) => {
      mindMapInstance.execCommand('SET_NODE_ACTIVE', node, false);
    });

    // 使用 renderer 的所有节点列表来查找目标节点
    const targetNode = findNodeById(nodeId);

    if (targetNode) {
      // 激活目标节点
      mindMapInstance.execCommand('SET_NODE_ACTIVE', targetNode, true);
      // 将视图移动到节点位置
      mindMapInstance.renderer.moveNodeToCenter(targetNode);
    }
  },
});

// 通过节点 ID 在渲染器中查找节点
function findNodeById(nodeId: string): any {
  if (!mindMapInstance?.renderer) return null;

  // 方法1: 尝试使用 renderer 的节点列表（某些版本）
  const renderer: any = mindMapInstance.renderer;

  // 检查是否有 allNode 或 nodeList 属性
  if (renderer.allNode && Array.isArray(renderer.allNode)) {
    for (const node of renderer.allNode) {
      const nodeData = node.getData ? node.getData() : null;
      if (nodeData && nodeData.id === nodeId) {
        return node;
      }
    }
  }

  // 方法2: 递归遍历渲染树
  const searchInTree = (node: any): any => {
    if (!node) return null;

    // 检查当前节点 - 尝试多种方式获取数据
    let nodeData = null;
    if (node.getData) {
      nodeData = node.getData();
    } else if (node.nodeData) {
      nodeData = node.nodeData;
    } else if (node.data) {
      nodeData = node.data;
    }

    if (nodeData && nodeData.id === nodeId) {
      return node;
    }

    // 遍历子节点 - 检查多种可能的属性名
    const childrenArrays = [
      node.children,
      node._children,
      node.childList,
      node.nodeChildren
    ];

    for (const children of childrenArrays) {
      if (children && Array.isArray(children)) {
        for (const child of children) {
          const found = searchInTree(child);
          if (found) return found;
        }
      }
    }

    return null;
  };

  // 从渲染树的根节点开始搜索
  if (renderer.root) {
    const result = searchInTree(renderer.root);
    if (result) return result;
  }

  // 方法3: 如果有 renderTree 属性
  if (renderer.renderTree) {
    const result = searchInTree(renderer.renderTree);
    if (result) return result;
  }

  return null;
}
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
