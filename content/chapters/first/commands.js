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

// 读取 Chapter 1 的状态
loadState();

// 获取是否通关
if (storyWhere !== 6) {
    echoContent('-- 您还未通关序章，请通关后再来尝试。', false);
    cmdline.remove(); // cmdline 自爆
    throw SyntaxError("-- 没通关序章就来玩，呵呵");
}

setStorageKeyForChapter(1);
a_setStorageKeyForGame(1);

getAchieves();

if (achieves.indexOf("[ Easy ] 欢迎来到 Chapter 1！") == -1) {
    addAchieve("欢迎来到 Chapter 1！", "Easy");
}

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

// 主要程序部分 //

newCommand("ls", [], function(api){
    // 列出当前目录下的文件
    if(storyWhere >= 0){
        echoContent("README.txt", false);
    }
    if (storyWhere === 2) {
        echoContent("sudoerofmyself", false);
    }
    if (storyWhere > 2 || storyWhere === 201) {
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
    if (storyWhere === 2 && filename == "sudoerofmyself") {
        storyWhere = 3;
        echoContent("Li4uIC4uLSAtLi4uIC4uLiAtLi0uIC4tLiAuLiAtLi4uIC4gLyAtLi4uIC4tLi4gLi0uLS4tIC0uLi4gLi0uLiAuLi0gLiAuLS4uIC4uIC0tLiAuLi4uIC0gLi4gLS4gLS0uIC8gLS4tLS4gLi4tIC4uIC0uLiAtLS0uLi4gLi0tLS0gLi4uLi4gLi4uLS0gLi4uLi0gLS0tLi4gLi4uLi4gLi4tLS0gLi4uLS0gLS0tLi4gLS0tLi4gLS4tLS4tIC8gLS0tIC0uIC8gLS4uLiAuLiAuLS4uIC4uIC0uLi4gLi4gLi0uLiAuLiAtLi0uLS0gLyAuLSAtLiAtLi4gLS0uLi0tIC8gLi0tIC4uLi4gLiAuLS4gLiAvIC4uIC4uLiAvIC0tIC0uLS0gLyAuLi0gLi4gLS4uIC4uLS0uLg==");
    }
    if (storyWhere === 201 && filename == "sudoerofmyself.decrypt") {
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
        accessGiven = false; // 不给权限设置
        storyWhere = 2;
    }
    else if (storyWhere === 3502) { // 给权限
        echoContent("(✪ω✪) 谢谢！");
        echoContent("(awa) 不知道谁在文件夹里留了一个文件，表层是用 base64 解的，我有权限因此就帮你解了。");
        accessGiven = true; // 设置权限
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
        echoContent("_(:3 」∠ )_ 彳亍口巴，话说你期末考试成绩怎么样？");
        echoContent("你：（捏拳头）😡");
        echoContent("(._.) 看来应该考的不好");
        echoContent("(|||ﾟдﾟ) 难道你不知道 memory-package-manager 吗");
        echoContent("你：那是什么？");
        echoContent("(-_-) 这东西可以从 MPM 源下载知识。");
        echoContent("(+_+) 你要不要试试？")
        echoContent("! 外部消息：去吃饭 !")
        echoContent("你：我先去吃饭了。")
        echoContent("! 如果你不需要吃饭可以继续。 !")
    }
    else if (storyWhere === 6) {
        echoContent("(awa) 吃完饭了？")
        echoContent("(awa) 你去试试看吧。")
        echoContent("! 追加了新的指令：mpm !")
    }
    else if (storyWhere === 601) {
        echoContent("(qwq) 你装了什么啊？");
        if (accessGiven) {
            echoContent("(awa) 装了 " + nextStepOfMPM + " 吗？");
        }
        else {
            echoContent("(qwq) 没权限我获取不到。");
        }

        echoContent("(awa) 总之就是你肯定知道怎么用 mpm 了吧。");
        echoContent("(?w?) 话说回来，你多少岁啊？(留空可以拒绝回复，或者打空格也行。)");

        ask("", (response) => {
            if (response === "" || response === " ") {
                echoContent("(awa) 好吧，看来你有点害羞。")
                storyWhere = 7;
            }
            else {
                // 如果小于 10 岁，直接输出 Never gonna give you up
                if (parseInt(response) < 10) {
                    echoContent("(awa) 这里不是诈骗网站。");
                    echoContent("(qwq) 还有，这里有个链接。疑似是作者留下的。");
                    echoContent("https://nggyu.latingtude-studios.icu/");
                    storyWhere = 7;
                }
                else {
                    echoContent("(awa) 哦，原来你 " + response + " 岁啊。");
                    storyWhere = 7;
                }
            }
        });
    }
    else if (storyWhere === 7) {
        echoContent("(._.) 在这个世界，虽然只有你和我，但是因为 HumanOS 在人体活跃状态下可以连接到世界网的原因，");
        echoContent("(._.) 很多恶意的人会试图攻击你的 HumanOS。");
        echoContent("(+_+) 虽然人类已经进化了数几万年，但是 HumanOS 早就是一坨屎山了。");
        echoContent("(-_-) 所以，你必须要会拯救自己的 HumanOS 于水火之中，比如 hydra attack 之类的命令。");
        echoContent("! 新的命令追加：pandorabox !");
        storyWhere = 8;
    }
    else if (storyWhere === 1001) {
        echoContent("(awa) 这是一个虚拟服务器的 IP，试试破解他！");
        echoContent("! NEW CRACK: 173.5.5.3 !");
        storyWhere = 1002;

    }
    else {
        echoContent("(awa) 你也许还没有完成剩下的任务，要不然就是还没写完。");
        echoContent("(awa) 先完成任务吧。");
    }
    saveState();
});

newCommand("pandorabox", ["act:string", "act2:string", "act3:string"], function(api) {
    let act = api.args[0];
    let act2 = api.args[1];
    let act3 = api.args[2];

    if (act == "") {
        echoContent("PANDORA BOX - RE-ATTACK - SAFE YOUR HUMANOS");
        echoContent("Usage: pandorabox [action] [action2] [action3]");
        echoContent("Example:");
        echoContent("    pandorabox enable");
        echoContent("    pandorabox hydra re-attack");
        echoContent("! manAI UPDATED !");
        storyWhere = 1001; // 以 1 开头的均为 hack 相关内容
    }

    if (act == "enable") {
        echoContent("PANDORA BOX - AUTO SAFING SERVICE - ENABLED.\nPANDORA BOX - ALL COMMANDS - GRANTED");
    }

    if (act == "hydra" && act2 == "re-attack") {
        echoContent("PANDORA BOX - SKILL");
        echoContent("Hydra - LAUNCHING RE-ATTACK-SYSTEM");
        echoContent("Hold on, it will take a while...", output, 900);
        echoContent("SERVICE ENABLED.");
        echoContent("Running re-attack..."); // 没写完

        if (lastAttackIIP === "127.0.0.1") echoContent("Failed to re-attack: You cannot attack your self.");
        else {
            echoContent("Cracking a port for attacking...");
            cmdlineLock(true);
            var interval = setInterval(function(){
                cmdlineLock(false);
                echoContent("Final Step: Open port...");
                if (Math.random() < 0.5) {
                    echoContent("Failed to open port.");
                    echoContent("[ FAILED ] Failed to re-attack. Please try again.");
                    echoContent("PANDORA BOX - SKILL - FAILED.");
                    return;
                }
                else {
                    echoContent("Port opened.");
                    echoContent("Hydra shell opened. Please run commands by your self.");
                    panbox_hydra_enable = true;
                    return;
                }
            }, 3000);
            clearInterval(interval);
        }
    }

    if (act == "hydra" && act2 == "attack") {
        echoContent("PANDORA BOX - SKILL");
        echoContent("Hydra - LAUNCHING RE-ATTACK-SYSTEM");
        echoContent("Hold on, it will take a while...", output, 900);
        echoContent("SERVICE ENABLED.");

        if (act3 == "127.0.0.1") {
            echoContent("Failed to attack: You cannot attack your self.");
            return;
        }

        else if (act3 == "173.5.5.3" && storyWhere === 1002) {
            echoContent("Running attack...");
            cmdlineLock(true);
            var interval = setInterval(function(){
                cmdlineLock(false);
                clearInterval(interval);
                echoContent("Final Step: Open port...");
                if (Math.random() < 0.5){
                    echoContent("Failed to open port.");
                    echoContent("[ FAILED ] Failed to attack. Please try again.");
                    echoContent("PANDORA BOX - SKILL - FAILED.");
                    return;
                }
                else {
                    echoContent("Port opened.");
                    echoContent("Hydra shell opened. Please run commands by your self.");
                    panbox_hydra_enable = true;
                    return;
                }
                
            })
        }
    }

    if (act == "hydra" && act2 == "shell") {
        if (panbox_hydra_enable == false) {
            echoContent("== PLEASE OPEN HYDRA SHELL FIRST. ==");
            return;
        }

        if (act3 == "scanAll") {
            echoContent("Hydra Shell - Scan ALL");
            echoContent("Scanning all ports on this host...");
            cmdlineLock(true);

            if (storyWhere === 1002) {
                echoContent("Found OPEN PORT: 22 (SSH - Secure Shell)");
                echoContent("Found OPEN PORT: 80 (HTTP! Web server detected.)");
                echoContent("Found OPEN PORT: 443 (HTTPS? No web server on it.)");
                echoContent("Found OPEN PORT: 6379 (Redis? Passworded.)");
                echoContent("Found OPEN PORT: 3306 (MySQL! No password found on.)");
                echoContent("! 很好！你看到 3306 端口的 'No Password' 了吗？ !");
                echoContent("! 现在你可以尝试连接 MySQL 服务器，通过注入来获取 web shell. !");
                echoContent("! 试试 hydra shell mysql.connect !");
                storyWhere = 1003;
                cmdlineLock(false);
                echoContent("Hydra Shell - Scan ALL - COMPLETED.");
                return;
            }
        }

        else if (act3 == "mysql.connect") {
            echoContent("Hydra Shell - MySQL Connect");
            echoContent("Connecting to MySQL server...");
            
            if (storyWhere == 1003) {
                echoContent("! No password MySQL detected, trying no password login...");
                echoContent("? Login successful. You can use 'hydra shell mysql.run' to run SQL commands.");
                echoContent("! 现在你可以尝试运行 SQL 命令来获取 web shell. !");
                echoContent("! 解锁新界面：Help, Status !");
                showPanel();
                sideBarEnabled = true;
                updateStatus(
                    "173.5.5.3",
                    "22, 80, 443, 6379, 3306",
                    "3.9 GiB",
                    "/bin/mysqld",
                    "MySQL Cracking..."
                );
                updateHelp(
                    "你可能没用过 MySQL，因此这里会指导你如何注入 Web SHELL。<br/>" +
                    "首先，你要确认网站的编程语言，比如 PHP, ASP, JSP 等，PHP 最好注入。<br/>" +
                    "你可以用 hydra shell web.type 来获取。<br/>"
                )
                storyWhere = 1004;
            }
        }

        else if (act3 == "mysql.run") {
            echoContent("Hydra Shell - MySQL Run");
            echoContent("Running SQL command...");

            if (storyWhere == 41005) {
                echoContent("Invalid SQL command.");
                updateHelp("恭喜你，你已经成功连接上了 MySQL 服务器！<br/>你接下来可以看看里面有哪些表。使用 'show tables'!");
                storyWhere = 1005;
            }

            else if (storyWhere == 1005) {
                echoContent("show tables;");
                echoContent("+--------------+");
                echoContent("| Tables_in_web|");
                echoContent("+--------------+");
                echoContent("| users        |");
                echoContent("| content      |");
                echoContent("+--------------+");

                updateHelp("看到了吗？有两个表，users 和 content。<br/>你可以使用 'select * from users;' 来查看 users 表的内容。");
                storyWhere = 1006;
            }

            else if (storyWhere == 1006) {
                echoContent("select * from users;");
                echoContent("+----+----------+--------------------------+----------+");
                echoContent("| id | username | password                 | email    |");
                echoContent("+----+----------+--------------------------+----------+");
                echoContent("|  1 | admin    | woCaoNiMaDeJianPuZhai    | admin@web|");
                echoContent("|  2 | user     | 123456                   | user@web |");
                echoContent("+----+----------+--------------------------+----------+");

                updateHelp("明文存密码...高手！这让我想起了 C*DN...<br/>不管了，现在重新 webtry，试试看能不能登录进去。");
                storyWhere = 1007;
            }
        }

        else if (act3 == "web.type") {
            echoContent("Hydra Shell - Web Server Language Type");
            echoContent("Scanning web server language...");

            if (storyWhere == 1004) {
                echoContent("Web Server Language Detected: PHP 7.4");
                echoContent("! 现在你可以尝试注入 web shell 了。 !");
                updateHelp(
                    "好了，这个网站是 PHP 写的，接下来你可以尝试注入 web shell 了。<br/>" +
                    "注入方法有很多种，最简单的就是通过文件上传漏洞，SQL 注入来获取 web shell。<br/>" +
                    "因为我们没有后台管理员等，没有上传方式，但是我们有 SQL。<br/>"+
                    "尝试使用 pandorabox hydra webtry 173.5.5.3 来查看 PHP 网页吧。<br/>"
                );
                echoContent("! 追加了新的命令：webtry !");
            }
        }

        else if (act3 == "webtry") {
            echoContent("Hydra Shell - Web Try");
            echoContent("Trying to get PHP web page...");

            if (storyWhere == 1004) {
                echoContent("Hold on, fetching index...");
                loadWebTry("1004");
                updateHelp("你应该看到了它的登录页面吧！<br/>你现在就可以进入 mysql.run 进行操作了。");
                storyWhere = 41005;
            }

            else if (storyWhere == 1007) {
                echoContent("Hold on, fetching admin page...");
                loadWebTry("1004_1");
                updateHelp("现在登录管理后台。");
                newContact("drom-contact-locals-1", "true", function() {
                    updateHelp("恭喜🎉 登录成功。实战中不会明文存密码的，所以你不会这么容易就进来。<br/>接下来，你可以尝试 SQL Inject 了。");
                    echoContent("! 接下来，重新回到 webtry 界面，跟着我学习。 !")
                    storyWhere = 1008;
                });
            }

            else if (storyWhere == 1008) {
                echoContent("Hold on, fetching admin...");
                loadWebTry("1004_3");
                updateHelp("接下来，你该试试 capture 功能了。");
                echoContent("! 追加了新的命令：capture !");
            }

            else if (storyWhere == 1009) {
                echoContent("Hold on, fetching admin...");
                loadWebTry("1004_4");
                updateHelp("尝试在用户名和密码处注入 SQL 语句，比如 \" ' OR 1=1 \"。");
                newContact("drom-contact-locals-3", "true", function() {
                    updateHelp("恭喜你，成功 SQL Inject 了！<br/>现在，你已经掌握了基本的注入方法，接下来可以尝试更多的注入方式了。<br/>但由于作者不想写了，目前就到这里。");
                    storyWhere = 1010;
                });
            }
        }
    }
}, 8);

newCommand("capture", ["action:string", "target:string"], function(api) {
    let act = api.args[0];
    let target = api.args[1];

    if (act == "help" || act == "") {
        echoContent("NetworkCapturer - Help");
        echoContent("Usage: capture [action] [target]");
        echoContent("");
        echoContent("该软件用于拦截网络数据包，并从中提取有用信息。");
        echoContent("Action:");
        echoContent("  help - 显示帮助信息");
        echoContent("  start - 开始捕获数据包");
        echoContent("  stop - 停止捕获数据包");
        echoContent("  save - 保存捕获的数据包");
        echoContent("  load - 加载保存的数据包");
        echoContent("");
        echoContent("BeAction:");
        echoContent("    即被动，用于监听网络流量，监听到网络数据包时会弹出新窗口。");
        if (storyWhere === 1008) 
            updateHelp("现在使用 capture start 来开始捕获数据包吧。");
    }

    else if (act == "start") {
        if (storyWhere === 1008) {
            updateHelp("很好！接下来，随便乱填登录信息，然后登录看看。");
            echoContent("! 现在你可以尝试登录了。 !");
            newContact("drom-contact-locals-2", "true", function() {
                updateHelp("你看到了抓包信息吗？抓包信息里有用户名和密码。<br/>你可以发现，这里没有进行任何处理，直接请求，我们便可以利用这东西来注入。<br/>现在，关掉 webtry 页面和 capture 页面，重新 webtry。");
                storyWhere = 1009;
            });
        }

        echoContent("NetworkCapturer - Starting packet capture...");
        var capture_interval = setInterval(function() {
            let packInfo = localStorage.getItem("droml-webtry-captured-packet");
            if (packInfo) {
                echoContent("NetworkCapturer - Packet captured!");
                let ip = packInfo.ip || "127.0.0.1";
                let sender = packInfo.sender || "Chromium";
                let more = packInfo.more;

                loadCapturer(ip, sender, more);
                clearInterval(capture_interval);
            }
        }, 100);
    }
})

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
        /*
        const Http = new XMLHttpRequest();
        const url='https://airoj.latingtude-studios.icu/trrrricks/checking.php?id=' + api.args [0];
        Http.open("GET", url);
        Http.send();

        Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 200) {
                var content = JSON.stringify(Http.requestText);
                console.log(Http.requestText);
                console.log(content);
                if (content.status == true) {
                    // 我去，这 b 通过了
                    storyWhere = 501;
                    echoContent("YOU CLEARED DOOR OF doas -su mylife.root，话说你真的好闲啊。");
                }
            }
        }*/ // 旧请求方法，已弃用
        $.ajax({url: "https://airoj.latingtude-studios.icu/trrrricks/checking.php?id=" + api.args [0], success: function(result){
            if (result.indexOf("true") != -1) { // json 转化不生效，直接用 search 了
                storyWhere = 501; // wtf, he passed;
                echoContent("YOU CLEARED. - 你真的好闲啊，可以进行下一步了。");
            }
        }});
    }
});

function makePackageInstallInfo(package_name, version) {
    echoContent("Packages:");
    echoContent("    " + package_name + " (Version " + version + ")");
    echoContent(":: To continue next action, use `mpm next`.")
}

function randomTimer(callback, upperLimit) {
    var timerId = setTimeout(callback, Math.random() * upperLimit);
    return {
        cancel: function() {
            clearTimeout(timerId);
        }
    };
}

// mpm
newCommand("mpm", ["action:string", "more:string"], function(api){
    // mpm
    let act = api.args [0];
    let more = api.args [1];

    if (act === "help" || act === "") {
        echoContent("Memory Package Manager - Version 361.33.21");
        echoContent("Usage:")
        echoContent("    install: Install a memory package.")
        // 细节记忆卸载不了，没办法列出并且也不能查询。
        return;
    }

    if (act == "install" && more != "") {
        echoContent(":: Finding Package");
        echoContent(":: Querying...");

        // package list (sorry i only can do this things.)
        if (more.toLowerCase() === "chinese-language-package") {
            makePackageInstallInfo("chinese-language-package", "v5000.0.1"); // 细节中华上下五千年
            nextStepOfMPM = more;
        }
        else if (more.toLowerCase() === "us-english-language-package") {
            makePackageInstallInfo("us-english-language-package", "v911.0.2"); // 细节 911
            nextStepOfMPM = more;
        }
        else if (more.toLowerCase() === "maths-all-knows") {
            makePackageInstallInfo("maths-all-knows", "v114.5.14"); // 细节 114514... 哼哼饿啊啊啊
            nextStepOfMPM = more;
        }

        echoContent("! Memory Package Manager 有些项目，比如 maths-all-knows 之类的... !")
    }

    else if (act == "next" && nextStepOfMPM != "") {
        if (nextStepOfMPM == "us-english-language-package") {
            echoContent(":: Failed to install `us-english-language-package` because your body language is chinese.");
            return;
        }

        echoContent(":: Getting ready...")
        echoContent(":: Downloading files from `huhttps://mirrors.tuna.tsinghua.edu.cn/" + nextStepOfMPM + "/humanos");
        echoContent(":: Please hold on. Command line will be lock.");
        // 锁 cmdline
        cmdlineLock(true);
        let timer = randomTimer(function(){
            echoContent(":: Files downloaded.");
        }, 10);

        timer.cancel();

        // 解锁 cmdline
        cmdlineLock(false);
        echoContent(":: " + nextStepOfMPM + " installed.");

        // 下一步，如果等于 6 的话
        if (storyWhere === 6) {
            storyWhere = 601;
            echoContent("! 召唤 manAI 吧。 !");
        }
        return;
    }
});

newCommand("debug", ["action:string", "setvalue:string"], function(api){
    let act = api.args [0];
    let setvalue = api.args [1];

    if (act == "114514191981012251224") {
        debug = true;
        echoContent("YOU ARE NOW IN DEBUG MODE.");
    }

    if(!debug) {
        echoContent("DEBUGGING? NOT DEBUGGING. DEBUGGING? NOT DEBUGGING.");
        return;
    }

    if (act === "sw") {
        storyWhere = parseInt(setvalue);
        echoContent("DEBUG: storyWhere set to " + storyWhere);
    }

    else if (act === "swcheck") {
        echoContent("DEBUG: storyWhere is " + storyWhere);
    }

    else if (act === "phe") {
        panbox_hydra_enable = (setvalue.toLowerCase() === "true");
        echoContent("DEBUG: panbox_hydra_enable set to " + panbox_hydra_enable);
    }

    else if (act === "phecheck") {
        echoContent("DEBUG: panbox_hydra_enable is " + panbox_hydra_enable);
    }

    else if (act === "phme") {
        panbox_hydra_mysql_enable = (setvalue.toLowerCase() === "true");
        echoContent("DEBUG: panbox_hydra_mysql_enable set to " + panbox_hydra_mysql_enable);
    }

    else if (act === "phmecheck") {
        echoContent("DEBUG: panbox_hydra_mysql_enable is " + panbox_hydra_mysql_enable);
    }

    else if (act == "save") {
        saveState();
        echoContent("DEBUG: State saved.");
    }

    else if (act == "load") {
        loadState();

        echoContent("DEBUG: State loaded.");
    }

    else if (act == "sidebar") {
        sideBarEnabled = (setvalue.toLowerCase() === "true");
        echoContent("DEBUG: sideBarEnabled set to " + sideBarEnabled);
    }

    else if (act == "help") {
        echoContent("DEBUGGING COMMAND HELP");
        echoContent("sw: storyWhere setting, sw [where]");
        echoContent("[xx]check: show value of [xx]");
        echoContent("save: save current state");
        echoContent("load: load last saved state");
        echoContent("sidebar: enable/disable sidebar, sidebar [true/false]");
        echoContent("phe: pandorabox_hydra_enable setting, phe [true/false]");
        echoContent("phme: pandorabox_hydra_mysql_enable setting, phme [true/false]");
        echoContent("pheme: pandorabox_hydra_enable and pandorabox_hydra_mysql_enable setting, pheme [true/false]")
    }

    else if (act == "pheme") {
        panbox_hydra_enable = (setvalue.toLowerCase() === "true");
        panbox_hydra_mysql_enable = (setvalue.toLowerCase() === "true");
        echoContent("DEBUG: panbox_hydra_enable and panbox_hydra_mysql_enable set to " + panbox_hydra_enable);
    }
});