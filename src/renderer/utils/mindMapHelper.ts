import { v4 as uuidv4 } from 'uuid';
import type { MindMapNode, MindMapNodeData, MultiRootMindMapData } from '@/types';
import { VIRTUAL_ROOT_ID } from '@/types';

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * 创建默认根节点
 */
export function createDefaultRootNode(text: string = '中心主题'): MindMapNode {
  return {
    data: {
      id: generateId(),
      text,
    },
    children: [],
  };
}

/**
 * 创建空的思维导图数据
 */
export function createEmptyMindMapData(name: string = '未命名思维导图'): MultiRootMindMapData {
  const now = Date.now();
  return {
    id: generateId(),
    name,
    roots: [createDefaultRootNode()],
    created: now,
    updated: now,
  };
}

/**
 * 将多根节点数据转换为 simple-mind-map 可识别的格式
 * 创建一个隐藏的虚拟根节点包裹所有根节点
 */
export function toSimpleMindMapFormat(data: MultiRootMindMapData): MindMapNode {
  return {
    data: {
      id: VIRTUAL_ROOT_ID,
      text: '',
      style: {
        fontSize: 0,
      } as any,
    },
    children: data.roots,
  };
}

/**
 * 从 simple-mind-map 格式提取多根节点数据
 */
export function fromSimpleMindMapFormat(node: MindMapNode, originalData?: MultiRootMindMapData): MultiRootMindMapData {
  if (node.data.id === VIRTUAL_ROOT_ID) {
    return {
      id: originalData?.id || generateId(),
      name: originalData?.name || '未命名思维导图',
      roots: node.children,
      theme: originalData?.theme,
      layout: originalData?.layout,
      created: originalData?.created || Date.now(),
      updated: Date.now(),
    };
  }
  // 单根节点情况
  return {
    id: originalData?.id || generateId(),
    name: originalData?.name || '未命名思维导图',
    roots: [node],
    theme: originalData?.theme,
    layout: originalData?.layout,
    created: originalData?.created || Date.now(),
    updated: Date.now(),
  };
}

/**
 * 添加新根节点
 */
export function addRootNode(
  data: MultiRootMindMapData,
  text: string = '新根节点'
): MultiRootMindMapData {
  return {
    ...data,
    roots: [...data.roots, createDefaultRootNode(text)],
    updated: Date.now(),
  };
}

/**
 * 创建子节点
 */
export function createChildNode(text: string = '新节点'): MindMapNode {
  return {
    data: {
      id: generateId(),
      text,
    },
    children: [],
  };
}

/**
 * 在节点中查找并删除指定节点
 */
export function deleteNodeFromTree(node: MindMapNode, nodeId: string): boolean {
  const index = node.children.findIndex(child => child.data.id === nodeId);
  if (index !== -1) {
    node.children.splice(index, 1);
    return true;
  }
  for (const child of node.children) {
    if (deleteNodeFromTree(child, nodeId)) {
      return true;
    }
  }
  return false;
}

/**
 * 在多根节点结构中删除节点
 */
export function deleteNodeFromMultiRoot(data: MultiRootMindMapData, nodeId: string): MultiRootMindMapData {
  // 检查是否是根节点
  const rootIndex = data.roots.findIndex(root => root.data.id === nodeId);
  if (rootIndex !== -1) {
    const newRoots = [...data.roots];
    newRoots.splice(rootIndex, 1);
    return {
      ...data,
      roots: newRoots,
      updated: Date.now(),
    };
  }

  // 在子节点中查找并删除
  const newRoots = data.roots.map(root => {
    const newRoot = JSON.parse(JSON.stringify(root)) as MindMapNode;
    deleteNodeFromTree(newRoot, nodeId);
    return newRoot;
  });

  return {
    ...data,
    roots: newRoots,
    updated: Date.now(),
  };
}

/**
 * 在节点中查找指定节点
 */
export function findNodeInTree(node: MindMapNode, nodeId: string): MindMapNode | null {
  if (node.data.id === nodeId) {
    return node;
  }
  for (const child of node.children) {
    const found = findNodeInTree(child, nodeId);
    if (found) return found;
  }
  return null;
}

/**
 * 在多根节点结构中查找节点
 */
export function findNodeInMultiRoot(data: MultiRootMindMapData, nodeId: string): MindMapNode | null {
  for (const root of data.roots) {
    const found = findNodeInTree(root, nodeId);
    if (found) return found;
  }
  return null;
}

/**
 * 查找父节点
 */
export function findParentNode(node: MindMapNode, nodeId: string, parent: MindMapNode | null = null): MindMapNode | null {
  if (node.data.id === nodeId) {
    return parent;
  }
  for (const child of node.children) {
    const found = findParentNode(child, nodeId, node);
    if (found !== undefined) return found;
  }
  return null;
}

/**
 * 验证思维导图数据格式
 */
export function validateMindMapData(data: any): MultiRootMindMapData | null {
  if (!data || typeof data !== 'object') return null;
  if (!Array.isArray(data.roots)) return null;
  if (data.roots.length === 0) return null;

  // 验证每个根节点
  for (const root of data.roots) {
    if (!root.data || !root.data.id || typeof root.data.text !== 'string') {
      return null;
    }
  }

  return {
    id: data.id || generateId(),
    name: data.name || '导入的思维导图',
    roots: data.roots,
    theme: data.theme,
    layout: data.layout,
    created: data.created || Date.now(),
    updated: Date.now(),
  };
}
