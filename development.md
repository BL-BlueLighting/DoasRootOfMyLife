<div align="center">
  <img src="./README.logo.png" style="width: 100px; height: 100px;">
  <h1>doas -su mylife.root</h1>
  <p>- 别名 DoasRootOfMyLife -</p>
  <h2>二次开发须知</h2>
  <h3><a href="./development_struct">二次开发项目结构</a></h3>
</div>

# base.js - doas -su mylife.root Base Framework

## Variables
你也许在 base.js 里看到过这些东西：

<code>

const commands = new Map();

const history = [];

let historyIndex = null;

const context = { __vars: {} };

let storyWhere = 0;

let nextStory = false;

let accessGiven = false;

let asking = false;

let askCallback = null;

</code>

这些东西都是用来控制游戏进程的。

然而，你需要注意的仅有 `storyWhere`。

`storyWhere` 是整个游戏最重要的东西，用于控制故事流程。

这个是数值规范：

    ?/??: 单数字/双数字 为故事主线。
    1???: PandoraBox 故事主线内容。
    35??: manAI 相关故事内容，通常只在序章使用，同样为故事主线。

## newCommand 函数
`newCommand()` 函数为创建一个命令行函数的命令，参数如下：

    commandName: 命令名称
    params: 参数列表，["名称:类型"]
    handler: 函数
    storyWhereNeed: 必须的 storyWhere，判断条件为 storyWhere >= storyWhereNeed, 默认 0.

示例：`newCommand("test", ["test:string"], function(api) {echoContent(api.args [0])})`

## echoContent 函数
`echoContent` 函数为输出内容的函数，参数如下：

    content: 输出内容：
        raw:
            [color:(颜色昵称)/(Hex 色号)](内容)[/endcolor]
            [progress max=(最大进度) timeAdd(每秒增加的值)][/progress]
            [runCommand command=(函数名)](参数)[/endrunning]

## loadState 函数
`loadState` 函数用于加载用户在 localStorage 中存储的信息，**在每次加载游戏前，必须执行该命令。**

## saveState 函数
`saveState` 函数用于保存用户信息到 localStorage 中，**base.js 中已经添加了每次执行命令后保存的指令，若你需要修改存档，请手动保存。**

## parseEchoContent 函数
`parseEchoContent` 函数用于解析 `echoContent` 中富文本语法，**手动调用不会输出任何信息。**

## tokenize 函数
`tokenize` 函数用于解析用户输入的指令，提供 args 等。

## executeLine 函数
`executeLine` 函数在用户输入框按下 Enter 后自动执行的函数，调用 `tokenize` 解析参数和各种信息给予 Command。

## reset 函数
`reset` 函数用于清空 localStorage 信息，**为了防止误操作，没有添加相关函数。需要用户手动执行。**

## Command 利用须知
`newCommand` 的 handler，必须有最多一个参数，最好名叫 api;
api 提供了以下东西：

    args：一个列表，为参数内容，用 [] 访问。
    context: 变量列表。
    echo, save: 对应 echoContent 和 saveContent 函数（该函数已弃用）。
    setVar, getVar: 创建和获取变量。
    storyWhere, nextStory: storyWhere 代表目前进行到了哪里，nextStory 表示是否下一步故事（已弃用）。
    setStoryWhere, setNextStory: 设置 storyWhere 和 nextStory 的值。

## setStorageKeyForChapter 函数
`setStorageKeyForChapter` 函数**必须在游戏开始前被执行，在执行 loadState 前被执行**。

该函数用于设置 localStorageKey，提供 chapterId 作为唯一标识符。

**根据规定，所有自制的 doas -su mylife.root 必须在唯一标识符前加上 custom-，并给出改版昵称与章节。**

例：

    xxx 改版第一章使用 storageKey:
        setStorageKeyForChapter("custom-xxx-1");
        或
        setStorageKeyForChapter("custom-1-xxx");

**若你没有修改 storageKey 导致用户存档丢失，请自行尝试恢复。**

## ask 函数
`ask` 函数用于在游戏中询问玩家问题。格式如下：

    ask("[PROMPT]", function(response) {
        ...
    });

    其中，response 是玩家输入的内容。

**注意：PROMPT 可以留空，但不能不填。**

## echoContent 函数
`echoContent` 函数用于输出内容，但添加间隔，格式如下：

    echoContent(content, [输出内容的 element，请使用 output global var.], delay=30 (ms), callback=[回调函数，可以写为 function(){}，但不能为 undefined 或 null])

## loadWebTry 函数
`loadWebTry` 负责启动 WebTry，Webtry 是一个使用 webtry.html?pageid=[id] 来进行 webtry 的东西。
参数如下：

    page_id：即在游戏目录下 webtries/[page_id].html。

它会启动一个弹出窗口让用户交互。

## loadCapturer 函数
`loadCapturer` 负责启动 capturer GUI，其基于 `loadWebTry`，放在 webtries/capturer.html 目录下。
参数如下：

    ip: 即 capturer 抓到的 ip。
    sender: 即 capturer 抓到的 sender，推荐填写 'Chromium' 而不是 'Google Chrome'。
    more: 即包信息，推荐参照 Burpsuite 格式来写。

和 webtry 一样。
 
# achieve.js - doas -su mylife.root Achievement Framework

## a_setStorageKeyForGame 函数
`a_setStorageKeyForGame` 函数**必须在游戏开始前被执行，在执行 getAchieves 前被执行**。

该函数用于设置 localStorageKey，提供 gameId 作为唯一标识符。

**根据规定，所有自制的 doas -su mylife.root 必须在唯一标识符前加上 custom-，并给出改版昵称与章节。**

例：

    xxx 改版第一章使用 storageKey:
        setStorageKeyForGame("xxx-1");
        或
        setStorageKeyForGame("1-xxx");

**若你没有修改 storageKey 导致用户成就丢失，请自行尝试恢复。**

## getAchieves 函数
`getAchieves` 函数用于获得所有成就。**如果你的游戏需要成就系统，请在游戏正式开始前执行。**

## saveAchieve 函数
`saveAchieve` 函数用于保存所有成就。**该函数会被 addAchieve 在工作完后自动调用。**

## addAchieve 函数
`addAchieve` 函数用于获得成就，函数调用方法如下：

    addAchieve(成就名，成就等级)

官方定义的成就等级有 **Mythic, Master, Insane, Hard, Normal, Easy** 六个等级。

## lookAchieves 函数
`lookAchieve` 函数用于遍历并列出所有用户获得的成就。（仅限**该游戏**）

# webtryContact.js - doas -su mylife.root - Webtry Contact Service Framework.
## newContact 函数
`newContact` 函数用于创建网页通信，其参数如下：

    key: 通信昵称，即 localStorage Key。
    whenValue: 调用 callback 的时机（即 key 什么时候 == whenValue）。
    callback: 回调函数。

其原理：

    因为需要运行在网页前端，因此只能 localStorage 通信。
    newContact 会生成 interval，每秒查询 localStorage，当 webtry 页面更新时，第一时间便会调用 callback();

## setContact 函数
`setContact` 函数用于和 `newContact` 函数沟通，其参数如下：

    key: 参照 newContact。
    value: 即 whenValue，也可以不是这个。

其原理：

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


-- BL.BlueLighting，最后一次更新 2025 / 11 / 09。