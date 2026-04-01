# GLM5 Mind Map

一个基于 Electron + Vue 3 + TypeScript + Vite 构建的思维导图桌面应用程序。

## 环境要求

- Node.js 20.x 或更高版本
- npm 9.x 或更高版本

## 安装

```bash
# 克隆项目
git clone <repository-url>
cd glm5-mind-map

# 安装依赖
npm install
```

## 开发

```bash
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
- Windows: `.exe` 安装包
- macOS: `.zip` 压缩包
- Linux: `.deb` 和 `.rpm` 安装包

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
│       ├── env.d.ts         # Vue 类型声明
│       ├── components/      # 可复用组件
│       ├── views/           # 页面组件
│       ├── assets/          # 静态资源
│       ├── styles/          # 全局样式
│       ├── utils/           # 工具函数
│       └── types/           # TypeScript 类型定义
├── index.html               # HTML 入口
├── forge.config.ts          # Electron Forge 配置
├── vite.*.config.mts        # Vite 构建配置
└── tsconfig.json            # TypeScript 配置
```

## 技术栈

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Electron Forge](https://www.electronforge.io/) - 应用打包与分发
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 超集

## License

MIT
