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

console.log("    Commands Loaded.");
console.log("        by BL.BlueLighting 2025");
console.log("©️ Copyright 2025 BL.BlueLighting. All Rights Reserved.");
console.log("License: GPLv3");
console.log("THANKS FOR YOUR PLAYING!");

// 下面是 base.js 的相关内容，如果你需要二次开发可以参照
/**
 * @typedef {Object} FrameworkAPIType
 * @property {function(string,bool):void} echoContent - 输出内容到终端，支持富文本语法 ([color][/endcolor], [progress][/progress], [runCommand][/endrunning])，最后的 bool 值表示是否使用故事性输出
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
// storyWhere = 114514 表示没写完，后续剧情待补充

var manAIInitialized = false;
// 引导
echoContent('Welcome to HumanOS.', false);
echoContent('Type [color: #0f0]help[/endcolor] to get started.', false);

// 加载状态
loadState();

if (storyWhere >= 1) {
    manAIInitialized = true;
}

// 无论是初次还是第二次运行，都 save
saveState();

// list
newCommand('ls', [], function(api){
    echoContent("hello.txt", false);
    if (storyWhere >= 1){
        echoContent("system.log", false);
        echoContent("manfile.txt", false);
        nextStory = false;
    }
    else if (storyWhere >= 3503) {
        echoContent("config.dd", false);
    }
})

// cat
newCommand('cat', ['filename'], function(api){
    const filename = api.args [0];
    if(filename === 'hello.txt'){
        echoContent("你好，欢迎来到 HumanOS.", false);
        echoContent("你如果看到了这篇文档，您的 HumanOS 已经进入了 Emergency Mode，紧急进入了 CLI 模式。", false);
        echoContent("请尝试 getStatus 获得身体状态。", false);
    }
    else if (filename === 'system.log' && storyWhere >= 1){
        echoContent("2025-10-04 13:40:00 System booting...", false);
        echoContent("2025-10-04 13:40:05 Loading modules...", false);
        echoContent("2025-10-04 13:40:10 Initializing hardware...", false);
        echoContent("2025-10-04 13:40:15 Starting services...", false);
        echoContent("2025-10-04 13:40:20 Fatal error: Failed to load critical service: EyeInterfaceModule, ArmModule... more 17 modules failed.", false);
        echoContent("2025-10-04 13:40:25 Entering Emergency Mode...", false);
        echoContent("2025-10-04 13:40:30 Emergency Mode activated. Limited functionality available.", false);
        echoContent("2025-10-04 13:41:00 User 'brain' logged in as root.", false);
        echoContent("2025-10-04 13:42:37 Body looks unresponsive. No motor functions detected.", false);
        echoContent("2025-10-04 13:43:12 No external devices detected. Possible disconnection.", false);
        echoContent("2025-10-04 13:44:00 Warning: Vital signs unstable. Heartbeat irregularities detected.", false);
        echoContent("2025-10-04 13:45:30 Alert: Oxygen levels dropping. Immediate attention required.", false);
        echoContent("(Log End)")
    }
    else if (filename === 'manfile.txt' && storyWhere >= 1){
        echoContent("很抱歉，目前 manfile.txt 无法连接到身体。", false);
        echoContent("正在启动 AI 助手，尝试帮助您。", false);
        echoContent("AI 助手启动成功。", false);
        echoContent("欢迎使用 HumanOS AI 助手。", false);
        echoContent("! 追加了新的命令：manAI !", false)
        manAIInitialized = true;
    }
    else if (filename === 'config.dd' && storyWhere >= 3503) {
        echoContent("这是一个二进制文件，无法直接查看。", false);
        newCommand("config.dd", [], function(api){
            echoContent("读取 config.dd 文件内容...", false);
            echoContent("[ CONFIG ] 设备ID: 246629976", false);
            echoContent("[ CONFIG ] 设备状态: 离线", false);
            echoContent("[ CONFIG ] 总部连接状态: 未连接", false);
            echoContent("[ CONFIG ] AI 助手状态: 已启动", false);
            echoContent("[ CONFIG ] 紧急模式: 已启用", false);
            echoContent("[ CONFIG ] 传感器状态: 触觉传感器离线，视觉传感器离线，听觉传感器离线", false);
            echoContent("[ CONFIG ] 记忆状态: 损坏 (区块 50-10948)", false);
            echoContent("[ CONFIG ] 认知状态: 损坏 (区块 230-9843)", false);
            echoContent("[ CONFIG ] 其他模块: 大部分模块损坏，需总部人员检查", false);
            echoContent("[ CONFIG ] 备注：总部联系方法：contact hq", false);
            echoContent("读取完毕。", false);
            storyWhere = 3;
        });
    }
    else {
        echoContent(`cat: ${filename}: No such file or directory`, false);
    }
})

// getStatus
newCommand('getStatus', [], function(api){
    if(storyWhere === 0){
        echoContent("名称：[UNKNOWN]  状态：紧急模式  紧急模式 - EMERGENCY MODE -", false);
        echoContent("    - 紧急模式进入原因：");
        echoContent("        - 您目前身体已进入植物人模式。紧急模式下无法进行任何肢体操作。", false);
        echoContent("    - 心跳：76 bpm", false);
        echoContent("    - 血压：120/80 mmHg", false);
        echoContent("    - 血氧：98%", false);
        echoContent("    - 体温：36.5 ℃", false);
        echoContent("    - 呼吸频率：16 次/分钟", false);
        echoContent("    - 大脑活动：正常", false);
        echoContent("    - 目前无法检测到肢体信号以及事件。", false);
        echoContent("    - 目前无法检测到任何外部环境信息。", false);
        echoContent("    - 目前无法检测到任何外部设备连接。", false);
        echoContent("! 检测到当前目录出现新的文件，请执行 ls 查看。 !", false);
        return "nextSTEP";
    }
    else {
        echoContent("名称：[UNKNOWN]  状态：紧急模式  紧急模式 - EMERGENCY MODE -", false);
        echoContent("    - 紧急模式进入原因：");
        echoContent("        - 您目前身体已进入植物人模式。紧急模式下无法进行任何肢体操作。", false);
        echoContent("    - 心跳：76 bpm", false);
        echoContent("    - 血压：120/80 mmHg", false);
        echoContent("    - 血氧：98%", false);
        echoContent("    - 体温：36.5 ℃", false);
        echoContent("    - 呼吸频率：16 次/分钟", false);
        echoContent("    - 大脑活动：正常", false);
        echoContent("    - 目前无法检测到肢体信号以及事件。", false);
        echoContent("    - 目前无法检测到任何外部环境信息。", false);
        echoContent("    - 目前无法检测到任何外部设备连接。", false);
        echoContent("    - AI 助手：manAI 已启动。", false);
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
    else if (storyWhere == 3502) {
        echoContent("(O_o) 你这身体...异常的严重啊...");
        echoContent("(q_q) 我刚才尝试帮你修复记忆了，但是失败了。");
        echoContent("(._.) 你的记忆损坏过于严重，我也没法帮你了。");
        echoContent("(._.) 你只能等总部的人来帮你了。");
        echoContent("(?_?) 话说回来，你这身体发生什么了？");
        echoContent("你：不清楚，我好像是出了车祸，然后就变成这样了。");
        echoContent("(._.) 嗯...我也不清楚。");
        echoContent("(...) 正在进行身体调查与数据分析，请勿操作。");
        echoContent("(...) 分析中...");
        echoContent("(...) 分析中...");
        echoContent("(^_^) 还行！你这身体虽然损坏严重，但是还算完整。");
        echoContent("(._.) 你这身体应该还能用，只是需要总部的人来帮你重启一下。");
        echoContent("(-_-) 只不过你很难联系到总部了。");
        echoContent("(._.) 你只能等着了。");
        echoContent("! 检测到当前目录出现新的文件，请执行 ls 查看。 !")
        storyWhere = 3503;
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
        echoContent("X  System Touching Service (Failed)      启动后即退出 Code 15", false);
        echoContent("    - 描述：管理触觉传感器的服务。", false);
        echoContent("    - 最近日志：", false);
        echoContent("[ LOG ] 2025-10-04 14:00:00 System Touching Service started.", false);
        echoContent("[ LOG ] 2025-10-04 14:00:05 Initializing touch sensors...", false);
        echoContent("[ ERROR ] 2025-10-04 14:00:10 Failed to initialize touch sensors. Error Code: 15.", false);
        echoContent("[ LOG ] 2025-10-04 14:00:15 System Touching Service exiting.", false);
        echoContent("! 啊？我现在只能输出一句话，使用 manAI 继续触发我。 !", false)
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

// contact
newCommand('contact', ['target:string'], function(api){
    const target = api.args[0];
    if (target === 'hq') {
        echoContent("[ INFO ] 尝试联系总部...");
        echoContent("[ ERROR ] 联系失败。原因：无法连接到总部网络。");
        echoContent("! 连总部都无法联系上吗... !");
        storyWhere = 114514;
    }
});