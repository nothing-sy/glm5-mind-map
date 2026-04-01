import type { MultiRootMindMapData } from './mindMap';

// 思维导图文件
export interface MindMapFile {
  id: string;
  name: string;
  path: string | null;  // null 表示新文件，未保存过
  data: MultiRootMindMapData;
  isDirty: boolean;     // 是否有未保存的更改
  created: number;
  updated: number;
}

// 文件对话框过滤器
export interface FileFilter {
  name: string;
  extensions: string[];
}

// 打开文件选项
export interface OpenFileOptions {
  filters?: FileFilter[];
  multiple?: boolean;
}

// 保存文件选项
export interface SaveFileOptions {
  defaultPath?: string;
  filters?: FileFilter[];
  content: string;
  isBase64?: boolean;
}

// 导出选项
export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'json';
  quality?: number;
  transparent?: boolean;
  includeBackground?: boolean;
}

// 导入结果
export interface ImportResult {
  success: boolean;
  data?: MultiRootMindMapData;
  error?: string;
  fileName?: string;
  filePath?: string;
}
