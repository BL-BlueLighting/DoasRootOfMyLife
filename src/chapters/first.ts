// doas -su mylife.root - Chapter: First (第一章 - 探索空间)
// Ported from content/chapters/first/commands.js

import { GameEngine, CommandAPI } from '../engine/engine.js';

let nextStepOfMPM = '';
let panbox_hydra_enable = false;

export function registerFirstChapter(engine: GameEngine): void {
  // Load state
  engine.load();

  engine.echoContent('Welcome to HumanOS.', true);
  engine.echoContent('Type [color: #0f0]help[/endcolor] to get started.', true);

  // Note: In the original web version, you needed to complete the pre chapter first.
  // In the CLI version, you can play any chapter directly.

  // Achievement
  if (!engine.achieves.includes('[ Easy ] 欢迎来到 Chapter 1！')) {
    engine.addAchieve('欢迎来到 Chapter 1！', 'Easy');
  }

  engine.persist();

  // ---- Virtual files ----
  engine.addFile('~/README.txt', (e) => {
    if (e.storyWhere !== 0) return;
    return [
      'CHAPTER 1 - 探索空间',
      '你放假了。你闲来无事，决定进 CLI 模式和 manAI 玩玩。',
      '老朋友，就只过这么一段时间，你应该没有忘记怎么用 CLI 吧？',
      'manAI 给你留下了一张纸条：',
      '    人，如果你看到这张纸条，说明你重新进来了 CLI 模式。\n    如果你来了，就用 manAI 叫我。',
    ].join('\n');
  }, 0);

  engine.addFile('~/sudoerofmyself', (e) => {
    if (e.storyWhere !== 2) return;
    e.storyWhere = 3;
    return 'Li4uIC4uLSAtLi4uIC4uLiAtLi0uIC4tLiAuLiAtLi4uIC4gLyAtLi4uIC4tLi4gLi0uLS4tIC0uLi4gLi0uLiAuLi0gLiAuLS4uIC4uIC0tLiAuLi4uIC0gLi4gLS4gLS0uIC8gLS4tLS4gLi4tIC4uIC0uLiAtLS0uLi4gLi0tLS0gLi4uLi4gLi4uLS0gLi4uLi0gLS0tLi4gLi4uLi4gLi4tLS0gLi4uLS0gLS0tLi4gLS0tLi4gLS4tLS4tIC8gLS0tIC0uIC8gLS4uLiAuLiAuLS4uIC4uIC0uLi4gLi4gLi0uLiAuLiAtLi0uLS0gLyAuLSAtLiAtLi4gLS0uLi0tIC8gLi0tIC4uLi4gLiAuLS4gLiAvIC4uIC4uLiAvIC0tIC0uLS0gLyAuLi0gLi4gLS4uIC4uLS0uLg==';
  }, 2);

  engine.addFile('~/sudoerofmyself.decrypt', (e) => {
    if (e.storyWhere !== 201) return;
    e.storyWhere = 3;
    return '... ..- -... ... -.-. .-. .. -... . / -... .-.. .-.-.- -... .-.. ..- . .-.. .. --. .... - .. -. --. / -.--. ..- .. -.. ---... .---- ..... ...-- ....- ---.. ..... ..--- ...-- ---.. ---.. -.--.- / --- -. / -... .. .-.. .. -... .. .-.. .. -.-.-- / .- -. -.. --..-- / .-- .... . .-. . / .. ... / -- -.-- / ..- .. -.. ..--..';
  }, 3);

  // ---- manAI ----
  engine.newCommand('manAI', [], function () {
    if (engine.storyWhere === 0) {
      engine.echoContent('(-_-) 哪位？', true);
      engine.echoContent('(^_^) 你？好久不见！', true);
      engine.echoContent('(?_?) 你咋突然想起来找我玩了？', true);
      engine.echoContent('你：放假了，无聊。', true);
      engine.echoContent('(._.) 那好吧。', true);
      engine.echoContent('(+_+) 不知道为什么，即使你苏醒了，各种 CLI 命令还是没有办法完全使用。', true);
      engine.echoContent('_(:3 」∠ )_ 估计是我没有那个权限。', true);
      engine.echoContent('(✪ω✪) 你应该可以试试看。', true);
      engine.echoContent('! 试试 base64 函数 !', true);
      engine.storyWhere++;
    } else if (engine.storyWhere === 1) {
      engine.echoContent('(qwq) 看来我真的权限好低啊。', true);
      engine.echoContent('(awa) 你可不可以给我点权限，不给也行。', true);
      engine.echoContent('执行 permission give manAI wheel 来让它获得更多权限。\n或者，直接继续 manAI 拒绝给它权限。', true);
      engine.storyWhere = 3501;
    } else if (engine.storyWhere === 3501) {
      engine.echoContent('(qwq) 好吧。', true);
      engine.echoContent('(awa) 不知道谁在文件夹里留了一个文件，你去看看罢。', true);
      engine.accessGiven = false;
      engine.storyWhere = 2;
    } else if (engine.storyWhere === 3502) {
      engine.echoContent('(✪ω✪) 谢谢！', true);
      engine.echoContent('(awa) 不知道谁在文件夹里留了一个文件，表层是用 base64 解的，我有权限因此就帮你解了。', true);
      engine.accessGiven = true;
      engine.storyWhere = 201;
    } else if (engine.storyWhere === 4) {
      engine.echoContent('Σ(*ﾟдﾟﾉ)ﾉ 你这就获得了结果？？？', true);
      engine.echoContent('(〒︿〒) 太强了。', true);
      engine.echoContent('(awa) 看来我是没办法难住你了。', true);
      engine.echoContent('(qwq) 好吧，只能让作者来了。', true);
      engine.echoContent('||%&%$$#$#%&&**!@#$%^&*', true);
      engine.echoContent('/-/-////-/-//-/-/|//-///-/|///--/-|--/////------//---//---//////---////----////-----/', true);
      engine.storyWhere = 5;
    } else if (engine.storyWhere === 501) {
      engine.echoContent('(q_q) 连作者都没有办法难住你吗。', true);
      engine.echoContent('(p_p) 我认输。', true);
      engine.storyWhere = 6;
      engine.echoContent('_(:3 」∠ )_ 彳亍口巴，话说你期末考试成绩怎么样？', true);
      engine.echoContent('你：（捏拳头）😡', true);
      engine.echoContent('(._.) 看来应该考的不好', true);
      engine.echoContent('(|||ﾟдﾟ) 难道你不知道 memory-package-manager 吗', true);
      engine.echoContent('你：那是什么？', true);
      engine.echoContent('(-_-) 这东西可以从 MPM 源下载知识。', true);
      engine.echoContent('(+_+) 你要不要试试？', true);
      engine.echoContent('! 外部消息：去吃饭 !', true);
      engine.echoContent('你：我先去吃饭了。', true);
      engine.echoContent('! 如果你不需要吃饭可以继续。 !', true);
    } else if (engine.storyWhere === 6) {
      engine.echoContent('(awa) 吃完饭了？', true);
      engine.echoContent('(awa) 你去试试看吧。', true);
      engine.echoContent('! 追加了新的指令：mpm !', true);
    } else if (engine.storyWhere === 601) {
      engine.echoContent('(qwq) 你装了什么啊？', true);
      if (engine.accessGiven) {
        engine.echoContent('(awa) 装了 ' + nextStepOfMPM + ' 吗？', true);
      } else {
        engine.echoContent('(qwq) 没权限我获取不到。', true);
      }
      engine.echoContent('(awa) 总之就是你肯定知道怎么用 mpm 了吧。', true);
      engine.echoContent('(?w?) 话说回来，你多少岁啊？(留空可以拒绝回复，或者打空格也行。)', true);

      engine.ask('', (response: string) => {
        const trimmed = response.trim();
        if (trimmed === '') {
          engine.echoContent('(awa) 好吧，看来你有点害羞。', true);
          engine.storyWhere = 7;
        } else {
          const age = parseInt(trimmed);
          if (!isNaN(age) && age < 10) {
            engine.echoContent('(awa) 这里不是诈骗网站。', true);
            engine.echoContent('(qwq) 还有，这里有个链接。疑似是作者留下的。', true);
            engine.echoContent('https://nggyu.latingtude-studios.icu/', true);
            engine.storyWhere = 7;
          } else {
            engine.echoContent('(awa) 哦，原来你 ' + trimmed + ' 岁啊。', true);
            engine.storyWhere = 7;
          }
        }
      });
    } else if (engine.storyWhere === 7) {
      engine.echoContent('(._.) 在这个世界，虽然只有你和我，但是因为 HumanOS 在人体活跃状态下可以连接到世界网的原因，', true);
      engine.echoContent('(._.) 很多恶意的人会试图攻击你的 HumanOS。', true);
      engine.echoContent('(+_+) 虽然人类已经进化了数几万年，但是 HumanOS 早就是一坨屎山了。', true);
      engine.echoContent('(-_-) 所以，你必须要会拯救自己的 HumanOS 于水火之中，比如 hydra attack 之类的命令。', true);
      engine.echoContent('! 新的命令追加：pandorabox !', true);
      engine.storyWhere = 8;
    } else if (engine.storyWhere === 1001) {
      engine.echoContent('(awa) 这是一个虚拟服务器的 IP，试试破解他！', true);
      engine.echoContent('! NEW CRACK: 173.5.5.3 !', true);
      engine.storyWhere = 1002;
    } else {
      engine.echoContent('(awa) 你也许还没有完成剩下的任务，要不然就是还没写完。', true);
      engine.echoContent('(awa) 先完成任务吧。', true);
    }
    engine.persist();
  });

  // ---- base64 ----
  engine.newCommand('base64', ['action:string', 'content:string'], function (api: CommandAPI) {
    const act = api.args[0];
    const content = api.args[1];

    if (act === 'encode') {
      engine.echoContent('Base64 编解码 ---', true);
      engine.echoContent(content + ' 被编码为：', true);
      engine.echoContent(GameEngine.base64Encode(content), true);
      if (engine.storyWhere === 1) {
        engine.echoContent('! Base64 功能已解禁。继续和 manAI 交谈吧。 !', true);
      }
    } else if (act === 'decode') {
      engine.echoContent('Base64 编解码 ---', true);
      engine.echoContent(content + ' 被解码为：', true);
      engine.echoContent(GameEngine.base64Decode(content), true);
    } else {
      engine.echoContent('Base64 编解码 ---', true);
      engine.echoContent('使用方法：base64 encode/decode 内容', true);
      if (engine.storyWhere === 1) {
        engine.echoContent('! 尝试编码一串字符。 !', true);
      }
    }
    engine.persist();
  });

  // ---- permission ----
  engine.newCommand('permission', ['action:string', 'who:string', 'group:string'], function () {
    if (engine.storyWhere === 3501) {
      engine.echoContent('Successfully to give manAI permission.\nNow he/she is in wheel.\n! 继续和 manAI 对话。 !', true);
      engine.storyWhere = 3502;
    }
    engine.persist();
  });

  // ---- pandorabox ----
  engine.newCommand('pandorabox', ['act:string', 'act2:string', 'act3:string'], function (api: CommandAPI) {
    const act = api.args[0];
    const act2 = api.args[1];
    const act3 = api.args[2];

    if (act === '' || !act) {
      engine.echoContent('PANDORA BOX - RE-ATTACK - SAFE YOUR HUMANOS', true);
      engine.echoContent('Usage: pandorabox [action] [action2] [action3]', true);
      engine.echoContent('Example:', true);
      engine.echoContent('    pandorabox enable', true);
      engine.echoContent('    pandorabox hydra re-attack', true);
      engine.echoContent('! manAI UPDATED !', true);
      engine.storyWhere = 1001;
    }

    if (act === 'enable') {
      engine.echoContent('PANDORA BOX - AUTO SAFING SERVICE - ENABLED.\nPANDORA BOX - ALL COMMANDS - GRANTED', true);
    }

    if (act === 'hydra' && act2 === 're-attack') {
      engine.echoContent('PANDORA BOX - SKILL', true);
      engine.echoContent('Hydra - LAUNCHING RE-ATTACK-SYSTEM', true);
      engine.echoContent('Hold on, it will take a while...', false, 900);
      engine.echoContent('SERVICE ENABLED.', true);
      engine.echoContent('Running re-attack...', true);

      engine.echoContent('Failed to re-attack: You cannot attack your self.', true);
    }

    if (act === 'hydra' && act2 === 'attack') {
      engine.echoContent('PANDORA BOX - SKILL', true);
      engine.echoContent('Hydra - LAUNCHING RE-ATTACK-SYSTEM', true);
      engine.echoContent('Hold on, it will take a while...', false, 900);
      engine.echoContent('SERVICE ENABLED.', true);

      if (act3 === '127.0.0.1') {
        engine.echoContent('Failed to attack: You cannot attack your self.', true);
        return;
      }

      if (act3 === '173.5.5.3' && engine.storyWhere === 1002) {
        engine.echoContent('Running attack...', true);
        setTimeout(() => {
          engine.echoContent('Final Step: Open port...', true);
          if (Math.random() < 0.5) {
            engine.echoContent('Failed to open port.', true);
            engine.echoContent('[ FAILED ] Failed to attack. Please try again.', true);
            engine.echoContent('PANDORA BOX - SKILL - FAILED.', true);
          } else {
            engine.echoContent('Port opened.', true);
            engine.echoContent('Hydra shell opened. Please run commands by your self.', true);
            panbox_hydra_enable = true;
          }
        }, 3000);
      }
    }

    if (act === 'hydra' && act2 === 'shell') {
      if (!panbox_hydra_enable) {
        engine.echoContent('== PLEASE OPEN HYDRA SHELL FIRST. ==', true);
        return;
      }

      if (act3 === 'scanAll') {
        engine.echoContent('Hydra Shell - Scan ALL', true);
        engine.echoContent('Scanning all ports on this host...', true);

        if (engine.storyWhere === 1002) {
          engine.echoContent('Found OPEN PORT: 22 (SSH - Secure Shell)', true);
          engine.echoContent('Found OPEN PORT: 80 (HTTP! Web server detected.)', true);
          engine.echoContent('Found OPEN PORT: 443 (HTTPS? No web server on it.)', true);
          engine.echoContent('Found OPEN PORT: 6379 (Redis? Passworded.)', true);
          engine.echoContent('Found OPEN PORT: 3306 (MySQL! No password found on.)', true);
          engine.echoContent('! 很好！你看到 3306 端口的 "No Password" 了吗？ !', true);
          engine.echoContent('! 现在你可以尝试连接 MySQL 服务器，通过注入来获取 web shell. !', true);
          engine.echoContent('! 试试 hydra shell mysql.connect !', true);
          engine.storyWhere = 1003;
          engine.echoContent('Hydra Shell - Scan ALL - COMPLETED.', true);
          return;
        }
      }

      if (act3 === 'mysql.connect') {
        engine.echoContent('Hydra Shell - MySQL Connect', true);
        engine.echoContent('Connecting to MySQL server...', true);

        if (engine.storyWhere === 1003) {
          engine.echoContent('! No password MySQL detected, trying no password login...', true);
          engine.echoContent('? Login successful. You can use `hydra shell mysql.run` to run SQL commands.', true);
          engine.echoContent('! 现在你可以尝试运行 SQL 命令来获取 web shell. !', true);
          engine.echoContent('! 解锁新界面：Help, Status !', true);
          engine.updateStatus('173.5.5.3', '22, 80, 443, 6379, 3306', '3.9 GiB', '/bin/mysqld');
          engine.updateHelp(
            '你可能没用过 MySQL，因此这里会指导你如何注入 Web SHELL。<br/>' +
              '首先，你要确认网站的编程语言，比如 PHP, ASP, JSP 等，PHP 最好注入。<br/>' +
              '你可以用 hydra shell web.type 来获取。<br/>',
          );
          engine.storyWhere = 1004;
        }
      }

      if (act3 === 'mysql.run') {
        engine.echoContent('Hydra Shell - MySQL Run', true);
        engine.echoContent('Running SQL command...', true);

        if (engine.storyWhere === 41005) {
          engine.echoContent('Invalid SQL command.', true);
          engine.updateHelp(
            '恭喜你，你已经成功连接上了 MySQL 服务器！<br/>你接下来可以看看里面有哪些表。使用 `show tables`!',
          );
          engine.storyWhere = 1005;
        } else if (engine.storyWhere === 1005) {
          engine.echoContent('show tables;', true);
          engine.echoContent('+--------------+', true);
          engine.echoContent('| Tables_in_web|', true);
          engine.echoContent('+--------------+', true);
          engine.echoContent('| users        |', true);
          engine.echoContent('| content      |', true);
          engine.echoContent('+--------------+', true);
          engine.updateHelp(
            '看到了吗？有两个表，users 和 content。<br/>你可以使用 `select * from users;` 来查看 users 表的内容。',
          );
          engine.storyWhere = 1006;
        } else if (engine.storyWhere === 1006) {
          engine.echoContent('select * from users;', true);
          engine.echoContent('+----+----------+--------------------------+----------+', true);
          engine.echoContent('| id | username | password                 | email    |', true);
          engine.echoContent('+----+----------+--------------------------+----------+', true);
          engine.echoContent('|  1 | admin    | woCaoNiMaDeJianPuZhai    | admin@web|', true);
          engine.echoContent('|  2 | user     | 123456                   | user@web |', true);
          engine.echoContent('+----+----------+--------------------------+----------+', true);
          engine.updateHelp('明文存密码...高手！这让我想起了 C*DN...<br/>不管了，现在重新 webtry，试试看能不能登录进去。');
          engine.storyWhere = 1007;
        }
      }

      if (act3 === 'web.type') {
        engine.echoContent('Hydra Shell - Web Server Language Type', true);
        engine.echoContent('Scanning web server language...', true);

        if (engine.storyWhere === 1004) {
          engine.echoContent('Web Server Language Detected: PHP 7.4', true);
          engine.echoContent('! 现在你可以尝试注入 web shell 了。 !', true);
          engine.updateHelp(
            '好了，这个网站是 PHP 写的，接下来你可以尝试注入 web shell 了。<br/>' +
              '注入方法有很多种，最简单的就是通过文件上传漏洞，SQL 注入来获取 web shell。<br/>' +
              '因为我们没有后台管理员等，没有上传方式，但是我们有 SQL。<br/>' +
              '尝试使用 pandorabox hydra webtry 173.5.5.3 来查看 PHP 网页吧。<br/>',
          );
          engine.echoContent('! 追加了新的命令：webtry !', true);
        }
      }

      if (act3 === 'webtry') {
        engine.echoContent('Hydra Shell - Web Try', true);
        engine.echoContent('Trying to get PHP web page...', true);

        if (engine.storyWhere === 1004) {
          engine.echoContent('Hold on, fetching index...', true);
          engine.loadWebTry('1004');
          engine.updateHelp('你应该看到了它的登录页面吧！<br/>你现在就可以进入 mysql.run 进行操作了。');
          engine.storyWhere = 41005;
        } else if (engine.storyWhere === 1007) {
          engine.echoContent('Hold on, fetching admin page...', true);
          engine.loadWebTry('1004_1');
          engine.updateHelp('现在登录管理后台。');
          engine.updateHelp('恭喜🎉 登录成功。实战中不会明文存密码的，所以你不会这么容易就进来。<br/>接下来，你可以尝试 SQL Inject 了。');
          engine.echoContent('! 接下来，重新回到 webtry 界面，跟着我学习。 !', true);
          engine.storyWhere = 1008;
        } else if (engine.storyWhere === 1008) {
          engine.echoContent('Hold on, fetching admin...', true);
          engine.loadWebTry('1004_3');
          engine.updateHelp('接下来，你该试试 capture 功能了。');
          engine.echoContent('! 追加了新的命令：capture !', true);
        } else if (engine.storyWhere === 1009) {
          engine.echoContent('Hold on, fetching admin...', true);
          engine.loadWebTry('1004_4');
          engine.updateHelp('尝试在用户名和密码处注入 SQL 语句，比如 " \' OR 1=1 "。');
          engine.echoContent('[ INFO ] 请在浏览器打开的 WebTry 页面中尝试 SQL 注入。', true);
          engine.updateHelp('恭喜你，成功 SQL Inject 了！<br/>现在，你已经掌握了基本的注入方法，接下来可以尝试更多的注入方式了。<br/>-- 第二章 拉开序幕 --');
          engine.storyWhere = 1010;
        }
      }
    }
  }, 8);

  // ---- capture ----
  engine.newCommand('capture', ['action:string', 'target:string'], function (api: CommandAPI) {
    const act = api.args[0];

    if (act === 'help' || act === '' || !act) {
      engine.echoContent('NetworkCapturer - Help', true);
      engine.echoContent('Usage: capture [action] [target]', true);
      engine.echoContent('', true);
      engine.echoContent('该软件用于拦截网络数据包，并从中提取有用信息。', true);
      engine.echoContent('Action:', true);
      engine.echoContent('  help - 显示帮助信息', true);
      engine.echoContent('  start - 开始捕获数据包', true);
      engine.echoContent('  stop - 停止捕获数据包', true);
      engine.echoContent('  save - 保存捕获的数据包', true);
      engine.echoContent('  load - 加载保存的数据包', true);
      engine.echoContent('', true);
      engine.echoContent('BeAction:', true);
      engine.echoContent('    即被动，用于监听网络流量，监听到网络数据包时会弹出新窗口。', true);
      if (engine.storyWhere === 1008) {
        engine.updateHelp('现在使用 capture start 来开始捕获数据包吧。');
      }
    }

    if (act === 'start') {
      if (engine.storyWhere === 1008) {
        engine.updateHelp('很好！接下来，随便乱填登录信息，然后登录看看。');
        engine.echoContent('! 现在你可以尝试登录了。 !', true);
        engine.echoContent('正在启动 NetworkCapturer...', true);
        engine.loadCapturer('173.5.5.3', 'Chromium', '等待抓包数据...');
        engine.updateHelp(
          '你看到了抓包信息吗？抓包信息里有用户名和密码。<br/>你可以发现，这里没有进行任何处理，直接请求，我们便可以利用这东西来注入。<br/>现在，关掉 webtry 页面和 capture 页面，重新 webtry。',
        );
        engine.storyWhere = 1009;
      }
      engine.echoContent('NetworkCapturer - Starting packet capture...', true);
    }
  });

  // ---- clear ----
  engine.newCommand('clear', [], function () {
    engine.clear();
    engine.echoContent('Welcome to HumanOS.', true);
    engine.echoContent('Type [color: #0f0]help[/endcolor] to get started.', true);
  });

  // ---- 1534852388 (decryption key) ----
  engine.newCommand('1534852388', [], function () {
    if (engine.storyWhere === 3) {
      engine.echoContent('如果你没有关注我赶紧关注😡', true);
      engine.echoContent('UNLOCKED - Status: Success', true);
      engine.echoContent('--------------------------', true);
      engine.echoContent('NEXT STORY - UNLOCKED FOR Y.', true);
      engine.storyWhere = 4;
    }
  });

  // ---- check ----
  engine.newCommand('check', ['id:string'], function () {
    if (engine.storyWhere === 5) {
      engine.storyWhere = 501;
    }
  });

  // ---- mpm ----
  engine.newCommand('mpm', ['action:string', 'more:string'], function (api: CommandAPI) {
    const act = api.args[0];
    const more = api.args[1];

    if (act === 'help' || act === '' || !act) {
      engine.echoContent('Memory Package Manager - Version 361.33.21', true);
      engine.echoContent('Usage:', true);
      engine.echoContent('    install: Install a memory package.', true);
      return;
    }

    if (act === 'install' && more && more !== '') {
      engine.echoContent(':: Finding Package', true);
      engine.echoContent(':: Querying...', true);

      if (more.toLowerCase() === 'chinese-language-package') {
        engine.echoContent('Packages:', true);
        engine.echoContent('    chinese-language-package (Version v5000.0.1)', true);
        engine.echoContent(':: To continue next action, use `mpm next`.', true);
        nextStepOfMPM = more;
      } else if (more.toLowerCase() === 'us-english-language-package') {
        engine.echoContent('Packages:', true);
        engine.echoContent('    us-english-language-package (Version v911.0.2)', true);
        engine.echoContent(':: To continue next action, use `mpm next`.', true);
        nextStepOfMPM = more;
      } else if (more.toLowerCase() === 'maths-all-knows') {
        engine.echoContent('Packages:', true);
        engine.echoContent('    maths-all-knows (Version v114.5.14)', true);
        engine.echoContent(':: To continue next action, use `mpm next`.', true);
        nextStepOfMPM = more;
      }

      engine.echoContent('! Memory Package Manager 有些项目，比如 maths-all-knows 之类的... !', true);
    }

    if (act === 'next' && nextStepOfMPM !== '') {
      if (nextStepOfMPM === 'us-english-language-package') {
        engine.echoContent(
          ':: Failed to install `us-english-language-package` because your body language is chinese.',
          true,
        );
        return;
      }

      engine.echoContent(':: Getting ready...', true);
      engine.echoContent(
        ':: Downloading files from `huhttps://mirrors.tuna.tsinghua.edu.cn/' +
          nextStepOfMPM +
          '/humanos',
        true,
      );
      engine.echoContent(':: Please hold on.', true);

      setTimeout(() => {
        engine.echoContent(':: Files downloaded.', true);
        engine.echoContent(':: ' + nextStepOfMPM + ' installed.', true);

        if (engine.storyWhere === 6) {
          engine.storyWhere = 601;
          engine.echoContent('! 召唤 manAI 吧。 !', true);
        }
      }, Math.random() * 10);
    }
  });

  // ---- debug ----
  engine.newCommand('debug', ['action:string', 'setvalue:string'], function (api: CommandAPI) {
    const act = api.args[0];
    const setvalue = api.args[1];

    if (act === 'sw') {
      engine.storyWhere = parseInt(setvalue);
      engine.echoContent('DEBUG: storyWhere set to ' + engine.storyWhere, true);
    } else if (act === 'swcheck') {
      engine.echoContent('DEBUG: storyWhere is ' + engine.storyWhere, true);
    } else if (act === 'save') {
      engine.persist();
      engine.echoContent('DEBUG: State saved.', true);
    } else if (act === 'load') {
      engine.load();
      engine.echoContent('DEBUG: State loaded.', true);
    } else if (act === 'help') {
      engine.echoContent('DEBUGGING COMMAND HELP', true);
      engine.echoContent('sw: storyWhere setting, sw [where]', true);
      engine.echoContent('[xx]check: show value of [xx]', true);
      engine.echoContent('save: save current state', true);
      engine.echoContent('load: load last saved state', true);
      engine.echoContent('sidebar: enable/disable sidebar, sidebar [true/false]', true);
      engine.echoContent('phe: pandorabox_hydra_enable setting, phe [true/false]', true);
      engine.echoContent('phme: pandorabox_hydra_mysql_enable setting, phme [true/false]', true);
      engine.echoContent('pheme: pandorabox_hydra_enable and pandorabox_hydra_mysql_enable setting', true);
    }
  });
}
