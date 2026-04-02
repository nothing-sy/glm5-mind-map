import type { MultiRootMindMapData, HistoryState, IHistoryManager } from '@/types';

/**
 * 历史记录管理器
 * 用于实现撤销/重做功能
 */
export class HistoryManager implements IHistoryManager {
  private past: HistoryState[] = [];
  private present: HistoryState | null = null;
  private future: HistoryState[] = [];
  private maxHistory: number = 50;

  constructor(initialState?: MultiRootMindMapData) {
    if (initialState) {
      this.present = this.createState(initialState, '初始状态');
    }
  }

  private createState(data: MultiRootMindMapData, action: string): HistoryState {
    return {
      data: JSON.parse(JSON.stringify(data)), // 深拷贝
      timestamp: Date.now(),
      action,
    };
  }

  /**
   * 记录新状态
   */
  push(data: MultiRootMindMapData, action: string): void {
    // 防止短时间内重复记录相同数据
    if (this.present) {
      const currentDataStr = JSON.stringify(this.present.data);
      const newDataStr = JSON.stringify(data);
      if (currentDataStr === newDataStr) {
        // 数据相同，不记录
        return;
      }
      this.past.push(this.present);
    }
    this.present = this.createState(data, action);
    this.future = []; // 清空重做栈

    // 限制历史记录数量
    if (this.past.length > this.maxHistory) {
      this.past.shift();
    }
  }

  /**
   * 撤销
   */
  undo(): HistoryState | null {
    if (this.past.length === 0) return null;

    if (this.present) {
      this.future.unshift(this.present);
    }
    this.present = this.past.pop()!;
    return this.present;
  }

  /**
   * 重做
   */
  redo(): HistoryState | null {
    if (this.future.length === 0) return null;

    if (this.present) {
      this.past.push(this.present);
    }
    this.present = this.future.shift()!;
    return this.present;
  }

  /**
   * 是否可撤销
   */
  canUndo(): boolean {
    return this.past.length > 0;
  }

  /**
   * 是否可重做
   */
  canRedo(): boolean {
    return this.future.length > 0;
  }

  /**
   * 获取当前状态
   */
  getPresent(): HistoryState | null {
    return this.present;
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.past = [];
    this.future = [];
  }
}
