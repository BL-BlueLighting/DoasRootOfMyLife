/* 
* doas -su mylife.root Commands Javascript

* by BL.BlueLighting
* (C) Copyright 2025 BL.BlueLighting. All Rights Reserved.
* License: GPLv3

* Do not distribute without permission.
* Do not remove this header.
*/

// import base.js
// This file depends on base.js
// Make sure base.js is loaded before this file

// 下面是 base.js 的相关内容，如果你需要二次开发可以参照
/**
 * @typedef {Object} FrameworkAPIType
 * @property {function(string):void} echoContent - 输出内容到终端，支持富文本语法 ([color][/endcolor], [progress][/progress], [runCommand][/endrunning])
 * @property {function(string,string[],function(api:any):any):void} newCommand - 注册新命令，参数：命令名，参数定义数组，处理函数
 * @property {function():void} saveContent - 保存命令历史和变量到 JSON 文件
 * @property {function():void} reset - 清空 LocalStorage 并刷新页面
 * @property {Object} context - 全局变量上下文对象
 * @property {Record<string, any>} context.__vars - 可存储脚本内变量
 * @property {number} storyWhere - 当前故事进度
 * @property {boolean} nextStory - 下一步故事状态
 * @property {Map<string, any>} commands - 已注册命令集合
 * @property {string[]} history - 历史命令数组
 * @property {number|null} historyIndex - 历史命令游标
 * @property {function():void} loadState - 从 LocalStorage 加载状态
 * @property {function():void} saveState - 保存状态到 LocalStorage
 * @property {function(string):string} parseEchoContent - 解析富文本语法为 HTML
 * @property {function(string):Promise<void>} executeLine - 执行一条命令行
 * @property {function(string):string[]} tokenize - 将命令行拆分成参数数组
 */

/** @type {typeof window.FrameworkAPI} */
const api = window.FrameworkAPI;
if(!api) throw new Error('FrameworkAPI is not available. Make sure base.js is loaded before commands.js');

// 主要内容 //

var manAIInitialized = false;

// 引导
echoContent('Welcome to HumanOS.')
echoContent('Type [color: #0f0]help[/endcolor] to get started.')

// 加载状态
loadState();

// 无论是初次还是第二次运行，都 save
saveState();

// list
newCommand('ls', [], function(api){
    echoContent("hello.txt");
    if (storyWhere === 1){
        echoContent("system.log");
        echoContent("manfile.txt");
        nextStory = false;
    }
})

// cat
newCommand('cat', ['filename'], function(api){
    const filename = api.args [0];
    if(filename === 'hello.txt'){
        echoContent("你好，欢迎来到 HumanOS.");
        echoContent("你如果看到了这篇文档，您的 HumanOS 已经进入了 Emergency Mode，紧急进入了 CLI 模式。");
        echoContent("请尝试 getStatus 获得身体状态。");
    }
    else if (filename === 'system.log' && storyWhere === 1){
        echoContent("2025-10-04 13:40:00 System booting...");
        echoContent("2025-10-04 13:40:05 Loading modules...");
        echoContent("2025-10-04 13:40:10 Initializing hardware...");
        echoContent("2025-10-04 13:40:15 Starting services...");
        echoContent("2025-10-04 13:40:20 Fatal error: Failed to load critical service: EyeInterfaceModule, ArmModule... more 17 modules failed.");
        echoContent("2025-10-04 13:40:25 Entering Emergency Mode...");
        echoContent("2025-10-04 13:40:30 Emergency Mode activated. Limited functionality available.");
        echoContent("2025-10-04 13:41:00 User 'brain' logged in as root.");
        echoContent("2025-10-04 13:42:37 Body looks unresponsive. No motor functions detected.");
        echoContent("2025-10-04 13:43:12 No external devices detected. Possible disconnection.");
        echoContent("2025-10-04 13:44:00 Warning: Vital signs unstable. Heartbeat irregularities detected.");
        echoContent("2025-10-04 13:45:30 Alert: Oxygen levels dropping. Immediate attention required.");
        echoContent("(Log End)")
    }
    else if (filename === 'manfile.txt' && storyWhere === 1){
        echoContent("很抱歉，目前 manfile.txt 无法连接到身体。");
        echoContent("正在启动 AI 助手，尝试帮助您。");
        echoContent("AI 助手启动成功。");
        echoContent("欢迎使用 HumanOS AI 助手。");
        echoContent("! 追加了新的命令：manAI !")
        manAIInitialized = true;
    }
    else {
        echoContent(`cat: ${filename}: No such file or directory`);
    }
})

// getStatus
newCommand('getStatus', [], function(api){
    if(storyWhere === 0){
        echoContent("名称：[UNKNOWN]  状态：紧急模式  紧急模式 - EMERGENCY MODE -");
        echoContent("    - 紧急模式进入原因：");
        echoContent("        - 您目前身体已进入植物人模式。紧急模式下无法进行任何肢体操作。");
        echoContent("    - 心跳：76 bpm");
        echoContent("    - 血压：120/80 mmHg");
        echoContent("    - 血氧：98%");
        echoContent("    - 体温：36.5 ℃");
        echoContent("    - 呼吸频率：16 次/分钟");
        echoContent("    - 大脑活动：正常");
        echoContent("    - 目前无法检测到肢体信号以及事件。");
        echoContent("    - 目前无法检测到任何外部环境信息。");
        echoContent("    - 目前无法检测到任何外部设备连接。");
        echoContent("! 检测到当前目录出现新的文件，请执行 ls 查看。 !");
        return "nextSTEP";
    }
});

// help
newCommand('help', [], function(api){
    echoContent("You are hopeless... Hahahaha");
})

// manai
newCommand('manAI', [], function(api){
    if (manAIInitialized === false) {
        echoContent("很抱歉，manAI 暂时未被启动。");
        return;
    }
    
    if (storyWhere === 1) {
        echoContent("(-_-) 额，你好。");
        echoContent("(awa) 看起来目前你的身体已经变成植物人了。");
        echoContent("(awa) 我是你的 AI 助手，叫我 perhaps 就好。");
        echoContent("(awa) 目前我能做的也很有限，不过我会尽力帮助你。");
        echoContent("(+_+) 如果你遇到了 ! 什么什么 ! 就是我在提示你！");
        echoContent("(qwq) 因为你目前的身体状况，我现在连接不到总部，因此现在这里只剩下我和你了。");
        echoContent("(p_p) 你现在也许可以试试 reconnect 命令，看看能不能连接上身体。");
        storyWhere = 3501; // 以 35 开头的数字均为 manAI 相关剧情
    }
    else if (storyWhere === 2) {
        echoContent("(-_-) 你还好吗？");
        echoContent("(q_q) 我刚才试着帮你连接了一下身体，但是好像不太成功。");
        echoContent("(._.) 我检查一下你大脑系统怎么样了。");
        echoContent("(RUN) 正在执行命令，请无视下方内容。");
        echoContent("      - 记忆：损坏 (区块 50-10948)");
        echoContent("      - 认知：损坏 (区块 230-9843)");
        echoContent("(0_0) 你大脑是怎么了？");
        echoContent("(+_+) 我现在能检测到你大脑的部分功能还在工作。");
        echoContent("(._.) 你只能自己尝试修复记忆了，这部分我没有权限帮你。");
        echoContent("! 尝试 memory fixing !");
        storyWhere = 3502;
    }
    else {
        echoContent("(-_-) 作者还没有写完剧情。");
        echoContent("(awa) 你可以等待作者什么时候写完剧情了你再来看看。");
    }
});

// reconnect
newCommand('reconnect', [], function(api){
    if (storyWhere === 3501) {
        echoContent("[ INFO ] 尝试重新连接感知系统...");
        echoContent("[ INFO ] 连接中...");
        echoContent("[ ERROR ] 连接失败。原因：感知系统遇到错误，请使用 journal system.touching.service 查看日志。");
        storyWhere = 2; 
    }
});

// journal
newCommand('journal', ['serviceName:string'], function(api){
    const serviceName = api.args[0];
    if (serviceName === 'system.touching.service' && storyWhere === 2) {
        echoContent("X  System Touching Service (Failed)      启动后即退出 Code 15");
        echoContent("    - 描述：管理触觉传感器的服务。");
        echoContent("    - 最近日志：");
        echoContent("[ LOG ] 2025-10-04 14:00:00 System Touching Service started.");
        echoContent("[ LOG ] 2025-10-04 14:00:05 Initializing touch sensors...");
        echoContent("[ ERROR ] 2025-10-04 14:00:10 Failed to initialize touch sensors. Error Code: 15.");
        echoContent("[ LOG ] 2025-10-04 14:00:15 System Touching Service exiting.");
        echoContent("! 啊？我现在只能输出一句话，使用 manAI 继续触发我。 !")
        return;
    }
});

// memory
newCommand('memory', ['action:string'], function(api){
    const action = api.args[0];
    if (action === 'fixing' && storyWhere === 3502) {
        echoContent("[ RUN ] 尝试修复记忆...");
        echoContent("[ GET ] 检测区块...");
        echoContent("[ ??? ] 发现损坏区块 50-10948，尝试修复...");
        echoContent("[ ??? ] 修复失败，区块 11451-98430 也损坏，无法继续修复。");
        echoContent("[ FAIL ] 修复记忆失败。");
        echoContent("! 你这记忆损坏过于严重，先转到 manAI 继续询问我。 !")
    }
});