<div align="center">
  <img src="./README.logo.png" style="width: 100px; height: 100px;">
  <h1>doas -su mylife.root</h1>
  <p>- 别名 DoasRootOfMyLife -</p>
  <h2>二次开发项目结构</h2>
  <h3><a href="./development">二次开发须知</a></h3>
</div>

# 请完整阅读本文，否则您的游戏可能会出现奇奇怪怪的 bug。

## 项目结构

```
doas-cli/
├── src/
│   ├── index.tsx                  — 入口：章节菜单 → 创建 GameEngine → 渲染 <App>
│   ├── components/
│   │   └── App.tsx                — 终端 UI：启动动画、输出回滚、输入行、历史记录
│   ├── engine/
│   │   ├── engine.ts              — 核心引擎：命令注册、分词器、故事状态机、ask/echo/lock
│   │   ├── parser.ts              — 标记解析器：[color:]、[progress]、[runCommand] → OutputLine[]
│   │   └── storage.ts             — 文件持久化，存储于 ~/.doas-root-of-mylife/
│   └── chapters/
│       ├── pre.ts                 — 序章
│       ├── first.ts               — 第一章
│       └── second.ts              — 第二章
├── bundle/                        — ncc 打包产物
├── bundle-cjs/                    — ncc CJS 打包产物
├── package.json
├── tsconfig.json
├── launcher.cjs
└── sea-config.json
```

### 技术栈

- **运行时**：Node.js
- **语言**：TypeScript
- **UI 框架**：Ink（终端版 React）
- **构建**：tsc（编译）→ ncc（单文件打包）→ pkg（Windows .exe）

### 分层模型

```
src/index.tsx          — 入口：章节菜单 → 创建 GameEngine → 渲染 <App>
src/components/App.tsx  — 终端 UI：启动动画、输出回滚、输入行、历史记录
src/engine/engine.ts    — 核心引擎：命令注册、分词器、storyWhere 状态机、ask/echo/lock
src/engine/parser.ts    — 标记解析器：[color:]、[progress]、[runCommand] → OutputLine[]
src/engine/storage.ts   — 文件持久化，存储于 ~/.doas-root-of-mylife/
src/chapters/*.ts       — 章节定义：每个文件调用 engine.newCommand() 注册命令
```

### 构建命令

```bash
npm run build       # 仅 tsc 编译
npm run start       # tsc + 运行（等同于 dev）
npm run dev         # tsc + 运行
npm run bundle      # ncc 构建（单文件打包）
npm run exe         # pkg → dist/doas.exe（Windows x64）
npm run make        # tsc + bundle + exe（完整流水线）
```