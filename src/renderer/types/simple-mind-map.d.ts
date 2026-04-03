declare module 'simple-mind-map' {
  interface MindMapOptions {
    el: HTMLElement;
    data?: any;
    layout?: string;
    theme?: string;
    initRootNodePosition?: string[];
    enableFreeDrag?: boolean;
    [key: string]: any;
  }

  interface MindMapInstance {
    setData(data: any): void;
    getData(): any;
    destroy(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    setTheme(theme: string): void;
    setLayout(layout: string): void;
    export(type: string, options?: any): Promise<any>;
    execCommand(command: string, ...args: any[]): void;
    renderer: {
      render(): void;
    };
  }

  class MindMap {
    constructor(options: MindMapOptions);
    static usePlugin(plugin: any): void;
    setData(data: any): void;
    getData(): any;
    destroy(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
    setTheme(theme: string): void;
    setLayout(layout: string): void;
    export(type: string, options?: any): Promise<any>;
    execCommand(command: string, ...args: any[]): void;
    renderer: {
      render(): void;
    };
  }

  export default MindMap;
}

declare module 'simple-mind-map/src/plugins/Drag' {
  const Drag: any;
  export default Drag;
}

declare module 'simple-mind-map/src/plugins/Select' {
  const Select: any;
  export default Select;
}

declare module 'simple-mind-map/src/plugins/Export' {
  const Export: any;
  export default Export;
}

declare module 'simple-mind-map/src/plugins/Search' {
  const Search: any;
  export default Search;
}
