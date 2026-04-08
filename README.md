# GLM5 Mind Map

> 一款完全使用 [Claude Code](https://claude.ai/code) 和智谱 [GLM-5.0](https://www.zhipuai.cn/) 模型开发的思维导图桌面应用

本项目是 AI 辅助编程的实践案例，从架构设计到代码实现，全程由 Claude Code + GLM-5.0 协作完成。

## 🌐 在线体验

> **在线演示地址**: [https://nothing-sy.github.io/glm5-mind-map/](https://nothing-sy.github.io/glm5-mind-map/)

无需安装，点击上方链接即可在浏览器中直接体验思维导图功能。

**注意**: 在线版本使用浏览器本地存储（localStorage）保存数据，数据仅保存在当前浏览器中。如需跨设备使用，请下载桌面版应用。

**作者有话说：本项目我只负责了以下几件事**
- 使用 npx create-electron-app@latest my-new-app --template=vite-typescript 创建项目 （由于electron的坑太多了，AI完全无法自主搭建成功基本框架，总会有各种各样的依赖或者版本或者其他问题，始终无法修复，所以选择electron自带的脚手架搭建）
- QA方式提需求，反馈问题，我没有任何代码review行为

## 功能特性

- 创建、编辑、删除思维导图节点
- 多种布局模式切换（逻辑结构图、思维导图、组织结构图、目录组织图）
- 节点样式自定义（颜色、字体、边框）
- 文件管理（新建、重命名、删除）
- 支持导出为图片
- 本地数据持久化存储
- **浮动工具栏**：可拖动的工具栏，支持背景切换、全屏模式、搜索等功能
- **画布背景切换**：支持点阵、网格、渐变三种背景模式，渐变支持自定义颜色
- **全屏模式**：一键进入全屏，专注编辑思维导图
- **节点搜索**：快速搜索并定位节点
- **本地图标**：使用 Noto 彩色图标，美观且无需网络加载

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | [Electron](https://www.electronjs.org/) 41 - 跨平台桌面应用 |
| 前端 | [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| 构建 | [Vite](https://vitejs.dev/) + [Electron Forge](https://www.electronforge.io/) |
| UI | [Element Plus](https://element-plus.org/) |
| 状态管理 | [Pinia](https://pinia.vuejs.org/) |
| 思维导图核心 | [simple-mind-map](https://github.com/wanglin2/mind-map) |
| 图标 | [Noto Color Emoji](https://fonts.google.com/noto/specimen/Noto+Color+Emoji) (本地 SVG) |

## 环境要求

- Node.js 20.x 或更高版本
- npm 9.x 或更高版本

## 安装与运行

```bash
# 克隆项目
git clone <repository-url>
cd glm5-mind-map

# 安装依赖
npm install

# 启动开发服务器（热重载）
npm start
```

启动后会自动打开应用窗口，修改代码后应用会自动刷新。

## 构建

```bash
# 打包应用（不生成安装包）
npm run package

# 生成可分发的安装包
npm run make
```

构建产物位于 `out/` 目录下：
- **Windows**: `.exe` 安装包
- **macOS**: `.zip` 压缩包
- **Linux**: `.deb` 和 `.rpm` 安装包

## 代码检查

```bash
# 运行 ESLint 检查
npm run lint

# TypeScript 类型检查
npm run typecheck
```

## 项目结构

```
glm5-mind-map/
├── .github/                    # GitHub 配置
│   └── workflows/              # GitHub Actions 工作流
│       └── release.yml         # 自动发布工作流
├── public/                     # 静态资源目录
│   └── favicon.svg             # 应用图标
├── src/                        # 源代码目录
│   ├── main.ts                 # Electron 主进程入口
│   ├── preload.ts              # 预加载脚本（主进程与渲染进程通信桥梁）
│   └── renderer/               # 渲染进程（Vue 3 前端应用）
│       ├── main.ts             # Vue 应用入口（Electron 版本）
│       ├── main.web.ts         # Vue 应用入口（Web 版本）
│       ├── App.vue             # 根组件
│       ├── webShim.ts          # Web 环境兼容层
│       ├── env.d.ts            # 环境类型声明
│       ├── components/         # Vue 组件目录
│       │   ├── common/         # 通用组件
│       │   │   ├── AppHeader.vue       # 应用顶部导航栏
│       │   │   ├── ContextMenu.vue     # 右键上下文菜单
│       │   │   ├── FloatingToolbar.vue # 浮动工具栏（背景切换、全屏、搜索）
│       │   │   ├── NodeFloatToolbar.vue # 节点浮动工具栏
│       │   │   ├── SearchPanel.vue     # 节点搜索面板
│       │   │   └── SaveDialog.vue      # 保存对话框
│       │   ├── mindmap/        # 思维导图相关组件
│       │   │   ├── MindMapContainer.vue # 思维导图容器（核心组件）
│       │   │   └── NodeEditor.vue      # 节点编辑器
│       │   └── sidebar/        # 侧边栏组件
│       │       ├── Sidebar.vue         # 侧边栏容器
│       │       └── MindMapList.vue     # 文件列表
│       ├── assets/             # 静态资源
│       │   └── icons/          # Noto 彩色图标（SVG）
│       ├── stores/             # Pinia 状态管理
│       │   ├── index.ts                # Store 导出入口
│       │   ├── mindMapStore.ts         # 思维导图状态（数据、历史、布局）
│       │   └── fileListStore.ts        # 文件列表状态（增删改查）
│       ├── utils/              # 工具函数
│       │   ├── index.ts                # 工具函数导出入口
│       │   ├── historyManager.ts       # 撤销/重做历史管理器
│       │   ├── mindMapHelper.ts        # 思维导图数据转换工具
│       │   └── elementIcons.ts         # Element Plus 图标注册工具
│       ├── types/              # TypeScript 类型定义
│       │   ├── index.ts                # 类型导出入口
│       │   ├── mindMap.ts              # 思维导图相关类型
│       │   ├── file.ts                 # 文件相关类型
│       │   ├── history.ts              # 历史记录相关类型
│       │   └── simple-mind-map.d.ts    # simple-mind-map 库类型声明
│       └── styles/             # 样式文件
│           └── main.css               # 全局样式
├── dist-web/                   # Web 版本构建输出目录
├── out/                        # Electron 构建输出目录
├── index.html                  # Electron 版本 HTML 入口
├── index.web.html              # Web 版本 HTML 入口
├── forge.config.ts             # Electron Forge 配置（打包、发布）
├── vite.main.config.mts        # Vite 配置 - 主进程
├── vite.preload.config.mts     # Vite 配置 - 预加载脚本
├── vite.renderer.config.mts    # Vite 配置 - 渲染进程（Electron）
├── vite.web.config.mts         # Vite 配置 - Web 版本
├── tsconfig.json               # TypeScript 配置
├── package.json                # 项目依赖与脚本配置
└── CLAUDE.md                   # Claude Code 项目指南
```

### 核心模块说明

| 模块 | 文件 | 说明 |
|------|------|------|
| **主进程** | `src/main.ts` | Electron 主进程，负责创建窗口、管理应用生命周期 |
| **预加载脚本** | `src/preload.ts` | 安全桥接主进程与渲染进程的通信 |
| **思维导图核心** | `components/mindmap/MindMapContainer.vue` | 封装 simple-mind-map，处理节点操作与事件 |
| **浮动工具栏** | `components/common/FloatingToolbar.vue` | 可拖动工具栏，支持背景切换、全屏模式、搜索 |
| **搜索面板** | `components/common/SearchPanel.vue` | 节点搜索功能，支持键盘导航 |
| **状态管理** | `stores/mindMapStore.ts` | 管理思维导图数据、撤销/重做历史、布局模式、背景设置 |
| **文件管理** | `stores/fileListStore.ts` | 管理文件列表的增删改查与本地存储 |
| **历史管理** | `utils/historyManager.ts` | 实现撤销/重做功能的状态栈管理 |
| **数据转换** | `utils/mindMapHelper.ts` | 多根节点数据与 simple-mind-map 格式互转 |

### 双版本支持

项目同时支持 **Electron 桌面版** 和 **Web 版本**：

- **Electron 版本**：入口 `src/renderer/main.ts`，HTML `index.html`
- **Web 版本**：入口 `src/renderer/main.web.ts`，HTML `index.web.html`
- **兼容层**：`src/renderer/webShim.ts` 提供 Web 环境下缺失的 Electron API 模拟

## License

[MIT](LICENSE)

---

*本项目是 AI 辅助编程的探索实践，感谢 Claude Code 与智谱 GLM-5.0 的协作支持。*
