// doas story — Complex script hooks
// Ported from first.ts and second.ts chapter logic

import { GameEngine } from '../engine/engine.js';

export interface ScriptContext {
  engine: GameEngine;
  config: Record<string, string>;
}

// ============================================================
// Pre chapter scripts
// ============================================================

export function runCountdown(ctx: ScriptContext): void {
  const { engine, config } = ctx;
  const duration = parseFloat(config['duration'] || '360');
  const tickInterval = parseFloat(config['tickInterval'] || '100');
  const onEndSw = parseInt(config['onEndStoryWhere'] || '350501');

  if (engine.storyWhere !== 3504) return;

  engine.echoContent(`[ WARNING ] 倒计时开始，${duration} 秒后身体也许将永久损坏。`, true);

  let remaining = duration;

  const tick = () => {
    if (remaining <= 0) {
      engine.echoContent('[color:red]倒计时结束！[/endcolor]', true);
      engine.echoContent('倒计时结束。manAI 来查看结果。', true);
      engine.storyWhere = onEndSw;
    } else {
      engine.echoContent(`[color:green]倒计时剩余：${remaining.toFixed(1)} 秒[/endcolor]`, true);
      remaining -= tickInterval / 1000;
      setTimeout(tick, tickInterval);
    }
  };
  tick();
}

// ============================================================
// First chapter scripts
// ============================================================

// Flags for first chapter
let firstNextStepOfMPM = '';
let firstPanboxHydraEnable = false;

export function resetFirstChapter(): void {
  firstNextStepOfMPM = '';
  firstPanboxHydraEnable = false;
}

// base64 encode/decode
export function runBase64(engine: GameEngine, args: string[]): void {
  const act = args[0];
  const content = args.slice(1).join(' ');

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
}

// permission command
export function runPermission(engine: GameEngine): void {
  if (engine.storyWhere === 3501) {
    engine.echoContent('Successfully to give manAI permission.\nNow he/she is in wheel.\n! 继续和 manAI 对话。 !', true);
    engine.storyWhere = 3502;
  }
}

// pandorabox — hydra attack system
export function runPandorabox(engine: GameEngine, args: string[]): void {
  const act = args[0] || '';
  const act2 = args[1] || '';
  const act3 = args[2] || '';

  if (act === '' || !act) {
    engine.echoContent('PANDORA BOX - RE-ATTACK - SAFE YOUR HUMANOS', true);
    engine.echoContent('Usage: pandorabox [action] [action2] [action3]', true);
    engine.echoContent('Example:', true);
    engine.echoContent('    pandorabox enable', true);
    engine.echoContent('    pandorabox hydra re-attack', true);
    engine.echoContent('! manAI UPDATED !', true);
    engine.storyWhere = 1001;
    return;
  }

  if (act === 'enable') {
    engine.echoContent('PANDORA BOX - AUTO SAFING SERVICE - ENABLED.\nPANDORA BOX - ALL COMMANDS - GRANTED', true);
    return;
  }

  if (act === 'hydra' && act2 === 're-attack') {
    engine.echoContent('PANDORA BOX - SKILL', true);
    engine.echoContent('Hydra - LAUNCHING RE-ATTACK-SYSTEM', true);
    engine.echoContent('Hold on, it will take a while...', false, 900);
    engine.echoContent('SERVICE ENABLED.', true);
    engine.echoContent('Running re-attack...', true);
    engine.echoContent('Failed to re-attack: You cannot attack your self.', true);
    return;
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
          firstPanboxHydraEnable = true;
        }
      }, 3000);
    }
    return;
  }

  if (act === 'hydra' && act2 === 'shell') {
    if (!firstPanboxHydraEnable) {
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
      return;
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
      return;
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
      return;
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
      return;
    }
  }
}

// capture — NetworkCapturer
export function runCapture(engine: GameEngine, args: string[]): void {
  const act = args[0] || '';

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
    return;
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
}

// mpm — Memory Package Manager
export function runMpm(engine: GameEngine, args: string[]): void {
  const act = args[0] || '';
  const more = args[1] || '';

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
      firstNextStepOfMPM = more;
    } else if (more.toLowerCase() === 'us-english-language-package') {
      engine.echoContent('Packages:', true);
      engine.echoContent('    us-english-language-package (Version v911.0.2)', true);
      engine.echoContent(':: To continue next action, use `mpm next`.', true);
      firstNextStepOfMPM = more;
    } else if (more.toLowerCase() === 'maths-all-knows') {
      engine.echoContent('Packages:', true);
      engine.echoContent('    maths-all-knows (Version v114.5.14)', true);
      engine.echoContent(':: To continue next action, use `mpm next`.', true);
      firstNextStepOfMPM = more;
    }

    engine.echoContent('! Memory Package Manager 有些项目，比如 maths-all-knows 之类的... !', true);
    return;
  }

  if (act === 'next' && firstNextStepOfMPM !== '') {
    if (firstNextStepOfMPM === 'us-english-language-package') {
      engine.echoContent(
        ':: Failed to install `us-english-language-package` because your body language is chinese.',
        true,
      );
      return;
    }

    engine.echoContent(':: Getting ready...', true);
    engine.echoContent(
      ':: Downloading files from `huhttps://mirrors.tuna.tsinghua.edu.cn/' +
        firstNextStepOfMPM +
        '/humanos',
      true,
    );
    engine.echoContent(':: Please hold on.', true);

    setTimeout(() => {
      engine.echoContent(':: Files downloaded.', true);
      engine.echoContent(':: ' + firstNextStepOfMPM + ' installed.', true);

      if (engine.storyWhere === 6) {
        engine.storyWhere = 601;
        engine.echoContent('! 召唤 manAI 吧。 !', true);
      }
    }, Math.random() * 10);
  }
}

// debug — Debug commands
export function runDebug(engine: GameEngine, args: string[]): void {
  const act = args[0] || '';
  const setvalue = args[1] || '';

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
}

// webtry — dynamically added command
export function runWebtry(engine: GameEngine, args: string[]): void {
  // This is called from the dynamically registered webtry command
  // The actual webtry logic is handled in pandorabox's hydra shell webtry
  engine.echoContent('Use: pandorabox hydra shell webtry [target]', true);
}

// check — simple storyWhere check
export function runCheck(engine: GameEngine): void {
  if (engine.storyWhere === 5) {
    engine.storyWhere = 501;
  }
}

// 1534852388 — decryption key
export function runDecryptKey(engine: GameEngine): void {
  if (engine.storyWhere === 3) {
    engine.echoContent('如果你没有关注我赶紧关注😡', true);
    engine.echoContent('UNLOCKED - Status: Success', true);
    engine.echoContent('--------------------------', true);
    engine.echoContent('NEXT STORY - UNLOCKED FOR Y.', true);
    engine.storyWhere = 4;
  }
}

// ============================================================
// Second chapter scripts
// ============================================================

// Corrupted manAI
export function runManAICorrupted(engine: GameEngine): void {
  if (
    engine.storyWhere === 0 ||
    engine.storyWhere === 1 ||
    engine.storyWhere === 2 ||
    engine.storyWhere === 201
  ) {
    engine.echoContent('[ ERROR ] Failed to call manAI server.', true);
    engine.echoContent('[ ERROR ] It seems like the manAI core was corrupted.', true);
  }
}

// Auth-gated ls (second chapter)
export function runLsAuth(engine: GameEngine): void {
  if (engine.storyWhere === 0) {
    engine.echoContent('Please authentication first.', true);
    engine.ask('[sudo] password for owner-body: ', (answer: string) => {
      if (answer === 'rickroll') {
        engine.echoContent('https://nggyu.latingtude-studios.icu', true);
      } else if (answer === '%%%humanOS&&&defaultpwd&&&3912499594768843') {
        engine.echoContent('Authentication successfully. Welcome back, owner-body.', true);
        engine.storyWhere = 1;
      } else {
        engine.echoContent('Sorry, password wrong. Please retry.', true);
      }
    });
    return;
  }

  if (
    engine.storyWhere === 1 ||
    engine.storyWhere === 2 ||
    engine.storyWhere === 201
  ) {
    const cur = engine.currentDir === '~'
      ? `/home/${engine.username}`
      : engine.currentDir;
    if (engine.isRestrictedDir(cur)) {
      engine.echoContent('Permission denied.', true);
      return;
    }
    const entries = engine.ls();
    if (entries.length === 0) {
      engine.echoContent('(empty)', true);
    } else {
      engine.echoContent(entries.join('  '), true);
    }
  }
}

// Auth-gated cd (second chapter)
export function runCdAuth(engine: GameEngine, args: string[]): void {
  if (
    engine.storyWhere === 1 ||
    engine.storyWhere === 2 ||
    engine.storyWhere === 201
  ) {
    const dir = args[0] || '~';
    const dirs = ['manAI', 'log', 'var', 'home'];
    if (dirs.indexOf(dir) < 0 && dir !== '..') {
      engine.echoContent('No such file or directory.', true);
      return;
    }
    const result = engine.cd(dir);
    if (result === null) {
      engine.echoContent('No such file or directory.', true);
    } else {
      engine.echoContent(result, true);
    }
  }
}

// chmod (second chapter)
export function runChmod(engine: GameEngine, args: string[]): void {
  if (engine.storyWhere === 2) {
    const cur = engine.currentDir === '~'
      ? `/home/${engine.username}`
      : engine.currentDir;
    if (cur !== '/manAI') {
      engine.echoContent('No such file or directory.', true);
      return;
    }
    if (args[1] !== 'manAIcore.model') {
      engine.echoContent('Invalid file.', true);
      return;
    }
    if (args[0] !== '777') {
      return;
    }
    engine.storyWhere = 201;
  }
}

// checkdata (second chapter)
export function runCheckdata(engine: GameEngine): void {
  if (engine.storyWhere === 1) {
    engine.echoContent('Checking file data...', true);
    engine.gocountdown(() => {
      engine.echoContent(
        '[ [color: green]FOUND[/endcolor] ] A file named "/manAI/manAIcore.model" was corrupted.\n[ [color: skyblue]FINFO[/endcolor] ] Fix it now?',
        true,
      );
      engine.ask('[Y/n]', (ans: string) => {
        if (ans !== 'n') {
          engine.echoContent('Hold on, running fix process...', true);
          engine.gocountdown(() => {
            engine.echoContent(
              '[ [color: red]FAILED[/endcolor] ] File named "/manAI/manAIcore.model" fix failed. Please check its permission then retry.',
              true,
            );
            engine.storyWhere = 2;
          }, 100);
        }
      });
    }, 100);
  } else if (engine.storyWhere === 201) {
    engine.echoContent('Checking file data...', true);
    engine.gocountdown(() => {
      engine.echoContent(
        '[ [color: green]FOUND[/endcolor] ] A file named "/manAI/manAIcore.model" was corrupted.\n[ [color: skyblue]FINFO[/endcolor] ] Fix it now?',
        true,
      );
      engine.ask('[Y/n]', (ans: string) => {
        if (ans !== 'n') {
          engine.echoContent('Hold on, running fix process...', true);
          engine.gocountdown(() => {
            engine.echoContent(
              '[ [color: green]SUCCESS[/endcolor] ] File named "/manAI/manAIcore.model" fix successfully. Used space 20.8Gigabytes.',
              true,
            );
            engine.storyWhere = 3;
          }, 100);
        }
      });
    }, 100);
  }
}
