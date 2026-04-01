import type { MultiRootMindMapData } from './mindMap';

// 历史状态快照
export interface HistoryState {
  data: MultiRootMindMapData;
  timestamp: number;
  action: string;
}

// 历史管理器接口
export interface IHistoryManager {
  push(data: MultiRootMindMapData, action: string): void;
  undo(): HistoryState | null;
  redo(): HistoryState | null;
  canUndo(): boolean;
  canRedo(): boolean;
  getPresent(): HistoryState | null;
  clear(): void;
}
