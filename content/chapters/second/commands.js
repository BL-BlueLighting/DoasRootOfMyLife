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

let nextStepOfMPM = "";
let lastAttackIIP = "127.0.0.1";
let panbox_hydra_enable = false;
let panbox_hydra_mysql_enable = false;
let debug = false; // 通过控制台调节

echoContent('Welcome to HumanOS.', false);
echoContent('Type [color: #0f0]help[/endcolor] to get started.', false);
setStorageKeyForChapter(2);
a_setStorageKeyForGame(2);

getAchieves();

// 先尝试读取
loadState();

// 如果没有读取到任何进度，说明是新存档
if (storyWhere === 0) {
    saveState();
}

if (sideBarEnabled) {
    showPanel();
    updateStatus();
}

var nowDirectory = "/";

// 主要程序部分 //

newCommand("help", [], function(api) {
    echoContent("You're hopeless. haha.");
});

newCommand("manAI", [], function(api) {
    if (storyWhere == 0) 
        echoContent("[ ERROR ] Failed to call manAI server.\n[ ERROR ] It seems like the manAI core was corrupted.");
});

newCommand("ls", [], function(api) {
    if (storyWhere == 0) {
        echoContent("Please authentication first.");
        pwd = ask("[sudo] password for owner-body: ", function(answer) {
            if (answer == "rickroll") {
                window.location.href = "https://nggyu.latingtude-studios.icu";
            }
            else if (answer == "%%%humanOS&&&defaultpwd&&&3912499594768843") { // 如果你找到了这里，那么，证明了你有自己查找代码的能力。
                echoContent("Authentication successfully. Welcome back, owner-body.");
                storyWhere = 1;
            }
            else {
                echoContent("Sorry, password wrong. Please retry.");
            }
        });
    }
    else if (storyWhere == 1) {
        if (nowDirectory == "/")
            echoContent("/manAI /log /var /home");
        else if (nowDirectory == "/manAI")
            echoContent("manAIcore.model manAIdata.db manAImemory.db");
        else if (nowDirectory == "/log")
            echoContent("tcbk-manAI-2025-12-09-12h-24m-56s.log");
        else if (nowDirectory == "/var")
            echoContent("Permission denied.");
        else if (nowDirectory == "/home")
            echoContent("Permission denied.");
    }
})

newCommand("cd", ["dir:string"], function(api) {
    if (storyWhere == 1) {
        var dirs = ["manAI", "log", "var", "home"];
        if (dirs.indexOf(api.args [0]) < 0 && api.args [0] !== "..") {
            echoContent("File or directory not found.");
            return;
        }   
        else if (api.args [0] == "..") {
            nowDirectory = "/";
        }
        else
            nowDirectory += api.args [0];
    }
});

newCommand("checkdata", ["file:string"], function(api) {
    if (storyWhere == 1) {
        echoContent("Checking file data...");
        gocountdown(function() {
            echoContent("[ [color: green]FOUND[/endcolor] ] A file named '/manAI/manAIcore.model' was corrupted.\n[ [color: skyblue]FINFO[/endcolor] ] Fix it now?");
            ask("[Y/n]", function(ans) {
                if (ans !== "n") {
                    echoContent("Hold on, running fix process...");
                    gocountdown(function() {
                        echoContent("[ [color: red]FAILED[/endcolor] ] File named '/manAI/manAIcore.model' fix failed. Please check its permission then retry.");
                    }, 100);
                }
            });
        }, 100);
    }
});