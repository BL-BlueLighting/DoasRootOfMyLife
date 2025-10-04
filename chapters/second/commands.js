/* 
* doas -su mylife.root Commands Javascript - 序章脚本

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

echoContent('Welcome to HumanOS.', false);
echoContent('Type [color: #0f0]help[/endcolor] to get started.', false);

// 读取 Chapter 1 的状态
loadState();

// 获取是否通关
if (storyWhere !== 6) {
    echoContent('-- 您还未通关序章，请通关后再来尝试。', false);
    cmdline.remove(); // cmdline 自爆
    throw SyntaxError("-- 没通关序章就来玩，呵呵");
}

// 创建新存档
setStorageKeyForChapter(1);

// 先尝试读取
loadState();

// 如果没有读取到任何进度，说明是新存档
if (storyWhere === 0) {
    saveState();
}

// 主要程序部分 //

newCommand("ls", [], function(api){
    // 列出当前目录下的文件
    if(storyWhere >= 0){
        echoContent("README.txt", false);
    }
    else if (storyWhere >= 2) {
        echoContent("sudoerofmyself", false);
    }
    else if (storyWhere > 2 && storyWhere === 201) {
        echoContent("sudoerofmyself", false);
        echoContent("sudoerofmyself.decrypt", false);
    }
    saveState();
});

newCommand("cat", ["filename"], function(api){
    const filename = api.args [0];
    if(storyWhere === 0 && filename === "README.txt"){
        echoContent("CHAPTER 1 - 探索空间", false);
        echoContent("你放假了。你闲来无事，决定进 CLI 模式和 manAI 玩玩。", false);
        echoContent("老朋友，就只过这么一段时间，你应该没有忘记怎么用 CLI 吧？", false);
        echoContent("manAI 给你留下了一张纸条：", false);
        echoContent("    人，如果你看到这张纸条，说明你重新进来了 CLI 模式。\n    如果你来了，就用 manAI 叫我。", false);
    }
    else if (storyWhere > 2 && filename == "sudoerofmyself") {
        storyWhere = 3;
        echoContent("Li4uIC4uLSAtLi4uIC4uLiAtLi0uIC4tLiAuLiAtLi4uIC4gLyAtLi4uIC4tLi4gLi0uLS4tIC0uLi4gLi0uLiAuLi0gLiAuLS4uIC4uIC0tLiAuLi4uIC0gLi4gLS4gLS0uIC8gLS4tLS4gLi4tIC4uIC0uLiAtLS0uLi4gLi0tLS0gLi4uLi4gLi4uLS0gLi4uLi0gLS0tLi4gLi4uLi4gLi4tLS0gLi4uLS0gLS0tLi4gLS0tLi4gLS4tLS4tIC8gLS0tIC0uIC8gLS4uLiAuLiAuLS4uIC4uIC0uLi4gLi4gLi0uLiAuLiAtLi0uLS0gLyAuLSAtLiAtLi4gLS0uLi0tIC8gLi0tIC4uLi4gLiAuLS4gLiAvIC4uIC4uLiAvIC0tIC0uLS0gLyAuLi0gLi4gLS4uIC4uLS0uLg==");
    }
    else if (storyWhere === 201 && filename == "sudoerofmyself.decrypt") {
        storyWhere = 3;
        echoContent("... ..- -... ... -.-. .-. .. -... . / -... .-.. .-.-.- -... .-.. ..- . .-.. .. --. .... - .. -. --. / -.--. ..- .. -.. ---... .---- ..... ...-- ....- ---.. ..... ..--- ...-- ---.. ---.. -.--.- / --- -. / -... .. .-.. .. -... .. .-.. .. -.-.-- / .- -. -.. --..-- / .-- .... . .-. . / .. ... / -- -.-- / ..- .. -.. ..--..");
    }
    saveState();
});

newCommand("manAI", [], function(api){
    if(storyWhere === 0){
        echoContent("(-_-) 哪位？");
        echoContent("(^_^) 你？好久不见！");
        echoContent("(?_?) 你咋突然想起来找我玩了？");
        echoContent("你：放假了，无聊。")
        echoContent("(._.) 那好吧。");
        echoContent("(+_+) 不知道为什么，即使你苏醒了，各种 CLI 命令还是没有办法完全使用。");
        echoContent("_(:3 」∠ )_ 估计是我没有那个权限。");
        echoContent("(✪ω✪) 你应该可以试试看。");
        echoContent("! 试试 base64 函数 !");
        storyWhere ++;
    }
    else if (storyWhere === 1) {
        echoContent("(qwq) 看来我真的权限好低啊。");
        echoContent("(awa) 你可不可以给我点权限，不给也行。");
        echoContent("执行 permission give manAI wheel 来让它获得更多权限。\n或者，直接继续 manAI 拒绝给它权限。");
        storyWhere = 3501;
    }
    else if (storyWhere === 3501) { // 不给权限
        echoContent("(qwq) 好吧。");
        echoContent("(awa) 不知道谁在文件夹里留了一个文件，你去看看罢。");
        storyWhere = 2;
    }
    else if (storyWhere === 3502) { // 给权限
        echoContent("(✪ω✪) 谢谢！");
        echoContent("(awa) 不知道谁在文件夹里留了一个文件，表层是用 base64 解的，我有权限因此就帮你解了。");
        storyWhere = 201;
    }
    else if (storyWhere === 4) {
        echoContent("Σ(*ﾟдﾟﾉ)ﾉ 你这就获得了结果？？？");
        echoContent("(〒︿〒) 太强了。");
        echoContent("(awa) 看来我是没办法难住你了。");
        echoContent("(qwq) 好吧，只能让作者来了。");
        echoContent("||%&%$$#$#%&&**!@#$%^&*");
        echoContent("/-/-////-/-//-/-/|//-///-/|///--/-|--/////------//---//---//////---////----////-----/");
        storyWhere = 5;
    }
    else if (storyWhere === 501) {
        echoContent("(q_q) 连作者都没有办法难住你吗。");
        echoContent("(p_p) 我认输。");
        storyWhere = 6;
    }
    else {
        echoContent("(awa) 你也许还没有完成剩下的任务。");
        echoContent("(awa) 先完成任务吧。");
    }
    saveState();
});

newCommand("base64", ["action:string", "content:string"], function(api){
    var act = api.args [0]
    var content = api.args [1];

    if (act === "encode") {
        echoContent("Base64 编解码 ---")
        echoContent(content + " 被编码为：");
        echoContent(Base64.encode(content));
        if (storyWhere === 1) {
            echoContent("! Base64 功能已解禁。继续和 manAI 交谈吧。 !")
            saveState();
        }
    }
    else if (act === "decode") {
        echoContent("Base64 编解码 ---")
        echoContent(content + " 被解码为：");
        echoContent(Base64.decode(content));
    }
    else {
        echoContent("Base64 编解码 ---");
        echoContent("使用方法：base64 encode/decode 内容");
        if (storyWhere === 1) {
            echoContent("! 尝试编码一串字符。 !")
        }
    }
    saveState();
});

newCommand("permission", ["action:string", "who:string", "group:string"], function(api){
    // 参数只是装个样子
    if (storyWhere === 3501) {
        echoContent("Successfully to give manAI permission.\nNow he/she is in wheel.\n! 继续和 manAI 对话。 !");
        storyWhere = 3502;
        saveState();
        return;
    }
    saveState();
});

// clear
newCommand("clear", [], function(api){
    // 清空输出
    output.innerHTML = "";
    echoContent('Welcome to HumanOS.', false);
    echoContent('Type [color: #0f0]help[/endcolor] to get started.', false);
});

// 解密，1534852388
newCommand("1534852388", [], function(api){
    if (storyWhere === 3) {
        echoContent("如果你没有关注我赶紧关注😡");
        echoContent("UNLOCKED - Status: Success");
        echoContent("--------------------------");
        echoContent("NEXT STORY - UNLOCKED FOR Y.");
        storyWhere = 4;
    }
});

// SPE: CHECKING
newCommand("check", ["id:string"], function(api) {
    if (storyWhere === 5) {
        // 请求 check 服务器
        const Http = new XMLHttpRequest();
        const url='https://airoj.latingtude-studios.icu/trrrricks/checking.php';
        Http.open("GET", url);
        Http.send();

        Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 200) {
                var content = JSON.stringify(Http.requestText);
                if (content.status == true) {
                    // 我去，这 b 通过了
                    storyWhere = 501;
                    echoContent("YOU CLEARED DOOR OF doas -su mylife.root，话说你真的好闲啊。");
                }
            }
        }
    }
});