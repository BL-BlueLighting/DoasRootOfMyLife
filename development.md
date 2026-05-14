<div align="center">
  <img src="./README.logo.png" style="width: 100px; height: 100px;">
  <h1>doas -su mylife.root</h1>
  <p>- 别名 DoasRootOfMyLife -</p>
  <h2>二次开发须知</h2>
  <h3><a href="./development_struct">二次开发项目结构</a></h3>
</div>

## Start up
首先，您需要 Node.js (ver > 20)，并安装 npm。
然后：
```bash
npm install
npm run dev
```
(没啦)
国内玩家需要科学上网才能安装依赖，若您不想科学上网，请修改 npm 源或使用 cnpm，安装完成后就不需要了。

修改 npm 源:
```bash
npm config set registry https://registry.npmmirror.com
```

安装 cnpm:
```bash
npm install -g cnpm --registry=https://registry.npmmirror.com
```

# engine.ts - doas -su mylife.root 核心引擎

doas-cli 使用 **Ink**（终端版 React）+ **TypeScript** 构建，运行于 Node.js。与旧版 web 架构完全不同，请仔细阅读。

本版本大部分地方使用 deepseek 生成。

嘿嘿 Claude Code 配 deepseek 🤤🤤🤤

## 核心概念：storyWhere

`storyWhere` 是整个游戏最重要的东西——一个**数值状态机**，用于控制故事流程。

- 每个命令/handler 根据 `storyWhere` 值来控制可见性和流程。
- handler 返回 `'nextSTEP'` 会使其自动 +1。
- 无需手动管理 `setStoryWhere`，返回 `'nextSTEP'` 即可推进剧情。

storyWhere 数值规范：

    ?/??: 单数字/双数字 为故事主线。
    1???: PandoraBox 故事主线内容。
    35??: manAI 相关故事内容，通常只在序章使用，同样为故事主线。

## 所有函数在之前可以不带有前缀，但是在 CLI 版本里，请带上 `engine.` 前缀。 

## engine.newCommand(name, paramDefs, handler, storyWhereNeed)

注册一个 CLI 命令。

| 参数 | 说明 |
|------|------|
| `name` | 命令名称（玩家输入的命令） |
| `paramDefs` | 参数定义列表，如 `["target:string"]` |
| `handler` | 处理函数，接收 `CommandAPI` 对象 |
| `storyWhereNeed` | 命令可见所需的最小 `storyWhere` 值（低于此值显示"命令未找到"），默认 0 |

示例：
```typescript
engine.newCommand("scan", ["target:string"], (api) => {
    api.echo(`正在扫描 ${api.args[0]}...`);
    return 'nextSTEP';  // 推进剧情
}, 5);
```

## CommandAPI (handler 接收的 api 对象)

| 属性/方法 | 说明 |
|-----------|------|
| `api.args` | 参数列表（string[]），用索引访问 |
| `api.echo(content)` | 输出内容到终端 |
| `api.setVar(key, value)` | 设置变量 |
| `api.getVar(key)` | 获取变量 |
| `api.storyWhere` | 当前 storyWhere 值 |
| `api.setStoryWhere(n)` | 手动设置 storyWhere（一般用 `'nextSTEP'` 替代） |

**handler 返回值：**
- 返回 `'nextSTEP'`：storyWhere 自动 +1，推进剧情。
- 返回 `undefined` 或其他：storyWhere 不变。

## engine.echoContent(content, noSleep?, delay?)

输出文本到终端，经过 parser 解析标记语法。

| 参数 | 说明 |
|------|------|
| `content` | 要输出的内容字符串 |
| `noSleep` | `true` 即时打印，无打字机延迟（默认 `false`） |
| `delay` | 打字机延迟毫秒数 |

## engine.ask(prompt, callback)

在故事中提示玩家自由输入文本。UI 会切换到"询问模式"，直到玩家按下 Enter。

```typescript
engine.ask("请输入你的名字：", (response) => {
    engine.echoContent(`你好，${response}！`);
});
```

## engine.setCallbacks(write, ask, lock, clear)

将引擎输出连接到 React UI。引擎在回调设置完成前会缓冲所有输出。**通常在 App.tsx 初始化时调用，二次开发无需关心。**

## 标记语法（在 echoContent 中使用）

### 彩色文本
```
[color: #ff0000]红色文字[/endcolor]
[color: red]也可以用颜色昵称[/endcolor]
```

### 进度条
```
[progress max=100 timeAdd=5][/progress]
```
- `max`: 最大进度值
- `timeAdd`: 每秒增加的值

### 建议命令
```
[runCommand command=scan](target)[/endrunning]
```
- `command`: 建议执行的命令名
- 括号内为建议参数

## 输入流程

1. `App.tsx` 中的 `useInput` 捕获按键
2. 按下 Enter：调用 `engine.executeLine(rawLine)`
3. 引擎分词（支持带引号的字符串参数）
4. 查找命令，检查 `storyWhereNeed`（不够则显示"命令未找到"）
5. handler 接收 `CommandAPI`，调用 `api.echo()` 输出
6. 输出通过 `onWrite` 回调流入 React 状态，渲染到终端

---

# storage.ts - 状态持久化

与旧版使用 `localStorage` 不同，新版将游戏状态保存到**文件系统**。

存储路径：`~/.doas-root-of-mylife/`

| 文件 | 说明 |
|------|------|
| `save-{chapterId}.json` | 章节存档（storyWhere、变量、命令历史） |
| `achieves-{gameId}.json` | 成就存档 |

存档在每次执行命令后**自动保存**，无需手动调用。

---

# 如何添加新章节

1. 在 `src/chapters/` 下创建新文件，如 `third.ts`
2. 在文件中调用 `engine.newCommand()` 注册该章节的命令
3. 在 `src/index.tsx` 的章节菜单中添加入口

```typescript
// src/chapters/third.ts 示例
import { GameEngine } from '../engine/engine';

export function registerThirdChapter(engine: GameEngine) {
    engine.newCommand("look", [], (api) => {
        api.echo("你环顾四周，发现自己置身于一片黑暗之中...");
        return 'nextSTEP';
    }, 0);

    engine.newCommand("forward", [], (api) => {
        api.echo("你向前迈出一步。");
        return 'nextSTEP';
    }, 1);
}
```

---

# 构建与运行

```bash
npm run build       # 仅 tsc 编译
npm run start       # tsc + 运行
npm run dev         # tsc + 运行（同 start）
npm run bundle      # ncc 单文件打包
npm run exe         # 打包为 dist/doas.exe（Windows x64）
npm run make        # 完整流水线：tsc + bundle + exe
```

    参照 `newContact`。

# sidebar.js - doas -su mylife.root - Sidebar Service Framework.
## showPanel 函数
`showPanel` 函数用于启动网页右边的侧边栏，您可以在 github.io 上使用该命令显示。
无参数。

## updateStatus 函数
`updateStatus` 函数用于更新右边侧边栏的状态信息，和 showPanel 差不多。
参数如下：

    ip: 自定义，默认 127.0.0.1
    ports: 自定义，默认 22
    mem: 自定义，默认 739MiB（不会自动添加单位哦）
    cucontent: 其他信息，推荐填写 "" 而不是 undefined.

## updateHelp 函数
`updateHelp` 函数用于更新右边侧边栏的帮助信息。
参数如下：

    content: 帮助内容


-- BL.BlueLighting，最后一次更新 2026 / 05 / 14。