// 虚拟根节点 ID
export const VIRTUAL_ROOT_ID = '__virtual_root__';

// 思维导图节点数据
export interface MindMapNodeData {
  id: string;
  text: string;
  note?: string;
  hyperlink?: string;
  hyperlinkTitle?: string;
  image?: string;
  icon?: string[];
  tag?: string[];
  expand?: boolean;
  isActive?: boolean;
  style?: NodeStyle;
  [key: string]: any;
}

// 节点样式
export interface NodeStyle {
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderDasharray?: string;
  borderRadius?: number;
}

// 思维导图节点
export interface MindMapNode {
  data: MindMapNodeData;
  children: MindMapNode[];
}

// 多根节点思维导图数据
export interface MultiRootMindMapData {
  id: string;
  name: string;
  roots: MindMapNode[];
  theme?: string;
  layout?: string;
  created: number;
  updated: number;
}

// 搜索结果项
export interface SearchResult {
  nodeId: string;
  text: string;
  path: string[]; // 节点路径，从根节点到当前节点
}

// 思维导图实例类型
export interface MindMapInstance {
  setData: (data: MindMapNode) => void;
  getData: () => MindMapNode;
  destroy: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  setTheme: (theme: string) => void;
  setLayout: (layout: string) => void;
  export: (type: string, options?: any) => Promise<any>;
  renderer: {
    render: () => void;
  };
  command: {
    EXECUTING: string;
  };
}
