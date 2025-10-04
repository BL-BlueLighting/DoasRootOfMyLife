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

import { Base64 } from 'https://cdn.jsdelivr.net/npm/js-base64@3.7.8/base64.mjs';

echoContent('Welcome to HumanOS.', false);
echoContent('Type [color: #0f0]help[/endcolor] to get started.', false);

// 读取 Chapter 1 的状态
loadState();

// 获取是否通关
if (storyWhere != 6) {
    echoContent('-- 您还未通关序章，请通关后再来尝试。', false);
    break; // 故意让它报错，不要修复它
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
    if(storyWhere === 0){
        echoContent("README.txt", false);
    }
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
});

newCommand("base64", ["action:string", "content:string"], function(api){
    var act = api.args [0]
    var content = api.args [1];

    if (act === "encode") {
        echoContent("Base64 编解码 ---")
        echoContent(content + " 被编码为：");
        echoContent(Base64.encode(content));
        return;
    }
    else if (act === "decode") {
        echoContent("Base64 编解码 ---")
        echoContent(content + " 被解码为：");
        echoContent(Base64.decode(content));
        return;
    }
    else {
        echoContent("Base64 编解码 ---");
        echoContent("使用方法：base64 encode/decode 内容");
    }
})