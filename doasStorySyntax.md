# doasStory 语法参考

doasStory 是 `doas -su mylife.root` 的故事定义文件，使用自定义 DSL 语法。一个 `.doasStory` 文件包含条件、目录、文件、命令和对话的全部定义。

## 基本规则

- **注释**：`+` 开头为行注释，`++` 包围的块为多行注释
- **区块**：`[区块名 属性="值"]` 开始，`[/区块名]` 结束
- **动作**：`/动作 参数` 为行内动作，`- 动作` 为块动作（后跟缩进内容）
- **缩进**：块动作下的内容需要缩进（空格数不限，保持一致即可）

```
+ 这是行注释

++
这是多行注释
可以写很多行
++
```

## 条件 (Condition)

定义可在剧情中开关的标记，用于控制命令/文件的可见性。

```
[condition name="标记名" default=false]
```

- `name`：条件名称（在 require 中引用）
- `default`：默认值，可选 `true`、`false`、数字或字符串

示例：
```
[condition name="manAIInitialized" default=false]
[condition name="accessGiven" default=false]
```

## 目录 (Directory)

定义虚拟文件系统中的目录。

```
[dir path="/目录路径"]
```

限制目录（`ls` 和 `cd` 会显示 "Permission denied"）：

```
[restricted path="/var"]
```

## 文件 (File)

定义虚拟文件系统中的文件，可设置剧情进度要求（storyWhere）。

```
[file path="~/文件名.txt"]
[require]
storyWhere >= 0
[onRead]
+ 读取文件时触发的动作（可选）
/cond set 标记 be true
[/onRead]
[fileContent]
文件内容...
可以多行
[/file]
```

### require 语法

`[require]` 块内支持两种条件：

| 语法 | 说明 |
|---|---|
| `storyWhere >= N` | 剧情进度 >= N 时可见 |
| `storyWhere <= N` | 剧情进度 <= N 时可见 |
| `storyWhere == N` | 剧情进度等于 N 时可见 |
| `storyWhere != N` | 剧情进度不等于 N 时可见 |
| `storyWhere > N` | 剧情进度 > N 时可见 |
| `storyWhere < N` | 剧情进度 < N 时可见 |
| `标记名` | 指定条件为 true 时可见 |

### onRead 动作

文件被 `cat` 读取时可执行动作，例如设置条件、推进剧情等。动作列表见下文 [动作参考](#动作参考)。

## 命令 (Command)

定义玩家可输入的 CLI 命令。

```
[command name="命令名"]
[require]
storyWhere >= 0
[params]
参数1 参数2
[run]
[at value="0"]
- echo
    剧情进度为 0 时的输出...
/sw next
[/at]
[at value="default"]
- echo
    默认输出...
[/at]
[/run]
[/command]
```

### 命令块结构

| 子块 | 说明 |
|---|---|
| `[require]` | 命令可见条件（同文件的 require） |
| `[params]` | 命令参数列表（空格分隔） |
| `[run]` | 命令处理器块 |
| `[at value="N"]` | 仅在 storyWhere == N 时匹配 |
| `[at value="default"]` | 兜底处理器（以上都不匹配时） |

`[at]` 还支持以下属性：

| 属性 | 说明 |
|---|---|
| `value="N"` | 精确匹配 storyWhere |
| `value="default"` | 默认处理器 |
| `when="$1 == '值'"` | 附加条件：`$1` = 第一个参数，`$2` = 第二个参数 |

## manAI 对话 (manAI)

定义 AI 助手 manAI 的对话树。

```
[manAI]
[require]
storyWhere >= 0
manAIInitialized
[talk]
[at value="1"]
- echo
    (-_-) 你好。
    (awa) 我是你的 AI 助手。
/sw 3501
[/at]
[at value="default"]
- echo
    (-_-) 作者还没有写完剧情。
[/at]
[/talk]
[/manAI]
```

结构同命令的 `[at]` 处理器。

## WebTry

定义浏览器页面引用（配合引擎 webtry 功能）。

```
[webTry name="test"]
[filepath]
/1004.html
+ / 表示 ./public/webtries 目录
[/webTry]
```

## 触发器 (Trigger)

定义可被 `/trig` 动作触发的具名事件。

```
[trigger name="触发器名"]
[require]
storyWhere >= 0
[do]
- echo
    触发时输出的内容...
/sw next
[/trigger]
```

## 脚本 (Script)

定义需要 TypeScript 代码处理的复杂逻辑。在 `src/story/scripts.ts` 中实现。

```
[script name="countdown" type="countdown"]
duration=360
tickInterval=100
onEndStoryWhere=350501
[/script]
```

## 动作参考

### 行内动作 (`/动作 参数`)

| 动作 | 说明 | 示例 |
|---|---|---|
| `/sw next` | 剧情进度 +1 | `/sw next` |
| `/sw N` | 设置剧情进度为 N | `/sw 3501` |
| `/sw back` | 剧情进度 -1 | `/sw back` |
| `/cond set 名 be 值` | 设置条件标记 | `/cond set flag be true` |
| `/trig 名` | 触发指定触发器 | `/trig myTrigger` |
| `/wt go 名` | 打开 WebTry 页面 | `/wt go test` |
| `/wt exit` | 关闭 WebTry | `/wt exit` |
| `/capture ip sender more` | 打开抓包器 | `/capture 173.5.5.3 Chromium 等待数据...` |
| `/clear` | 清空终端输出 | `/clear` |
| `/exit` | 退出程序 | `/exit` |
| `/achieve 名 等级` | 解锁成就 | `/achieve 欢迎来到 Chapter 1！ Easy` |
| `/panel show` | 显示侧边栏 | `/panel show` |
| `/panel hide` | 隐藏侧边栏 | `/panel hide` |
| `/status ip ports mem extra` | 更新状态栏 | `/status 127.0.0.1 22,80 512MiB idle` |
| `/help 文本` | 更新帮助文本 | `/help 使用 ls 查看文件` |
| `/cmd add 命令名` | 动态注册新命令 | `/cmd add config.dd` |
| `/sleep N` | 等待 N 毫秒 | `/sleep 3000` |
| `/base64 encode 文本` | Base64 编码 | `/base64 encode hello` |
| `/base64 decode 文本` | Base64 解码 | `/base64 decode aGVsbG8=` |
| `/random` | 随机分支（脚本处理） | `/random` |

### 块动作 (`- 动作`)

#### `- echo` — 输出文本

```
- echo
    第一行文本
    第二行文本
    支持 [color: #00ff66]颜色标记[/endcolor]
```

#### `- ask` — 询问玩家输入

```
- ask 请输入你的名字：
    [on match="特定回答"]
    - echo
        匹配时的回复...
    /sw next
    [/on]
    [on empty="true"]
    - echo
        留空时的回复...
    [/on]
    [on default="true"]
    - echo
        其他回答的回复...
    [/on]
```

`[on]` 属性：

| 属性 | 说明 |
|---|---|
| `match="值"` | 精确匹配此回答 |
| `empty="true"` | 回答为空时匹配 |
| `default="true"` | 以上都不匹配时的兜底 |

## 完整示例

```
+ ================================
+ 序章示例
+ ================================

[condition name="awake" default=false]

[file path="~/note.txt"]
[require]
storyWhere >= 0
[fileContent]
你醒来后看到的第一张纸条。
[/file]

[command name="wake"]
[run]
[at value="0"]
- echo
    你慢慢睁开了眼睛...
    周围一片漆黑。
    ! 试试 ls 查看当前目录。 !
/sw next
[/at]
[/run]
[/command]

[manAI]
[require]
awake
[talk]
[at value="1"]
- echo
    (._.) 你终于醒了。
/sw 2
[/at]
[/talk]
[/manAI]
```

## 与引擎的关系

```
story.doasStory          ← 你用 DSL 写的故事文件
    ↓ parser.ts          ← 解析为 AST
    ↓ loader.ts          ← 注册到引擎（addFile, newCommand, ...）
    ↓ scripts.ts         ← 复杂逻辑的 TypeScript 实现
    ↓ engine.ts          ← 运行游戏
```
