# GLM5 Mind Map

> 一款完全使用 [Claude Code](https://claude.ai/code) 和智谱 [GLM-5.0](https://www.zhipuai.cn/) 模型开发的思维导图桌面应用

本项目是 AI 辅助编程的实践案例，从架构设计到代码实现，全程由 Claude Code + GLM-5.0 协作完成。

**作者有话说：本项目我只负责了以下几件事**
- 使用 npx create-electron-app@latest my-new-app --template=vite-typescript 创建项目 （由于electron的坑太多了，AI完全无法自主搭建成功基本框架，总会有各种各样的依赖或者版本或者其他问题，始终无法修复，所以选择electron自带的脚手架搭建）
- QA方式提需求，反馈问题，我没有任何代码review行为
- 写下这段话，其余内容均有AI生成，本人并不清楚任何代码内容，有兴趣的可以fork下来，根据个人需求优化。

## 功能特性

- 创建、编辑、删除思维导图节点
- 多种布局模式切换（逻辑结构图、思维导图、组织结构图、目录组织图）
- 节点样式自定义（颜色、字体、边框）
- 文件管理（新建、重命名、删除）
- 支持导出为图片
- 本地数据持久化存储

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | [Electron](https://www.electronjs.org/) 41 - 跨平台桌面应用 |
| 前端 | [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| 构建 | [Vite](https://vitejs.dev/) + [Electron Forge](https://www.electronforge.io/) |
| UI | [Element Plus](https://element-plus.org/) + [@element-plus/icons-vue](https://element-plus.org/zh-CN/component/icon.html) |
| 状态管理 | [Pinia](https://pinia.vuejs.org/) |
| 思维导图核心 | [simple-mind-map](https://github.com/wanglin2/mind-map) |

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
├── src/
│   ├── main.ts              # Electron 主进程
│   ├── preload.ts           # 预加载脚本
│   └── renderer/            # 渲染进程 (Vue 3 应用)
│       ├── main.ts          # Vue 应用入口
│       ├── App.vue          # 根组件
│       ├── components/      # 可复用组件
│       ├── views/           # 页面组件
│       ├── stores/          # Pinia 状态管理
│       ├── utils/           # 工具函数
│       └── types/           # TypeScript 类型定义
├── index.html               # HTML 入口
├── forge.config.ts          # Electron Forge 配置
├── vite.*.config.mts        # Vite 构建配置
└── tsconfig.json            # TypeScript 配置
```

## License

[MIT](LICENSE)

---

*本项目是 AI 辅助编程的探索实践，感谢 Claude Code 与智谱 GLM-5.0 的协作支持。*
