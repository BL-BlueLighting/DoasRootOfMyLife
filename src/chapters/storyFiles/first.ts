// First chapter (第一章) — Script hooks
import { GameEngine } from '../../engine/engine.js';

let nextStepOfMPM = '';
let panboxHydraEnable = false;

export function registerScripts(engine: GameEngine): void {
  nextStepOfMPM = '';
  panboxHydraEnable = false;

  // ---- base64 ----
  engine.newCommand('base64', ['action', 'content'], (api) => {
    const act = api.args[0];
    const content = api.args.slice(1).join(' ');

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
  }, 0);

  // ---- permission ----
  engine.newCommand('permission', ['action', 'who', 'group'], () => {
    if (engine.storyWhere === 3501) {
      engine.echoContent('Successfully to give manAI permission.\nNow he/she is in wheel.\n! 继续和 manAI 对话。 !', true);
      engine.storyWhere = 3502;
    }
  }, 0);

  // ---- pandorabox (hydra attack system) ----
  engine.newCommand('pandorabox', ['act', 'act2', 'act3'], (api) => {
    const act = api.args[0] || '';
    const act2 = api.args[1] || '';
    const act3 = api.args[2] || '';

    if (!act) {
      engine.echoContent('PANDORA BOX - RE-ATTACK - SAFE YOUR HUMANOS', true);
      engine.echoContent('Usage: pandorabox [action] [action2] [action3]', true);
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
          } else {
            engine.echoContent('Port opened.', true);
            engine.echoContent('Hydra shell opened. Please run commands by your self.', true);
            panboxHydraEnable = true;
          }
        }, 3000);
      }
      return;
    }
    if (act === 'hydra' && act2 === 'shell') {
      if (!panboxHydraEnable) {
        engine.echoContent('== PLEASE OPEN HYDRA SHELL FIRST. ==', true);
        return;
      }

      if (act3 === 'scanAll' && engine.storyWhere === 1002) {
        engine.echoContent('Hydra Shell - Scan ALL', true);
        engine.echoContent('Scanning all ports on this host...', true);
        engine.echoContent('Found OPEN PORT: 22 (SSH)', true);
        engine.echoContent('Found OPEN PORT: 80 (HTTP)', true);
        engine.echoContent('Found OPEN PORT: 443 (HTTPS)', true);
        engine.echoContent('Found OPEN PORT: 6379 (Redis)', true);
        engine.echoContent('Found OPEN PORT: 3306 (MySQL! No password)', true);
        engine.echoContent('! 试试 hydra shell mysql.connect !', true);
        engine.storyWhere = 1003;
        return;
      }

      if (act3 === 'mysql.connect' && engine.storyWhere === 1003) {
        engine.echoContent('Hydra Shell - MySQL Connect', true);
        engine.echoContent('! No password MySQL detected, trying no password login...', true);
        engine.echoContent('? Login successful. Use `hydra shell mysql.run` to run SQL.', true);
        engine.updateStatus('173.5.5.3', '22, 80, 443, 6379, 3306', '3.9 GiB', '/bin/mysqld');
        engine.updateHelp('确认网站语言类型。使用 hydra shell web.type。');
        engine.storyWhere = 1004;
        return;
      }

      if (act3 === 'mysql.run') {
        engine.echoContent('Hydra Shell - MySQL Run', true);
        if (engine.storyWhere === 41005) {
          engine.echoContent('Invalid SQL command.', true);
          engine.updateHelp('使用 `show tables` 查看表。');
          engine.storyWhere = 1005;
        } else if (engine.storyWhere === 1005) {
          engine.echoContent('show tables;\n+--------------+\n| Tables_in_web|\n+--------------+\n| users        |\n| content      |\n+--------------+', true);
          engine.updateHelp('使用 `select * from users;` 查看 users 表。');
          engine.storyWhere = 1006;
        } else if (engine.storyWhere === 1006) {
          engine.echoContent('select * from users;\n+----+----------+--------------------------+\n| id | username | password                 |\n+----+----------+--------------------------+\n|  1 | admin    | woCaoNiMaDeJianPuZhai    |\n|  2 | user     | 123456                   |\n+----+----------+--------------------------+', true);
          engine.updateHelp('明文存密码！现在重新 webtry 登录。');
          engine.storyWhere = 1007;
        }
        return;
      }

      if (act3 === 'web.type' && engine.storyWhere === 1004) {
        engine.echoContent('Web Server Language Detected: PHP 7.4', true);
        engine.updateHelp('使用 pandorabox hydra shell webtry 173.5.5.3 查看网页。');
        engine.echoContent('! 追加了新的命令：webtry !', true);
        return;
      }

      if (act3 === 'webtry') {
        engine.echoContent('Hydra Shell - Web Try', true);
        if (engine.storyWhere === 1004) {
          engine.loadWebTry('1004');
          engine.updateHelp('查看登录页面后使用 mysql.run。');
          engine.storyWhere = 41005;
        } else if (engine.storyWhere === 1007) {
          engine.loadWebTry('1004_1');
          engine.updateHelp('登录管理后台。接下来学习 SQL Inject。');
          engine.storyWhere = 1008;
        } else if (engine.storyWhere === 1008) {
          engine.loadWebTry('1004_3');
          engine.updateHelp('试试 capture 功能抓包。');
          engine.echoContent('! 追加了新的命令：capture !', true);
        } else if (engine.storyWhere === 1009) {
          engine.loadWebTry('1004_4');
          engine.updateHelp("在登录框注入 SQL: ' OR 1=1 --");
          engine.storyWhere = 1010;
        }
        return;
      }
    }
  }, 8);

  // ---- capture ----
  engine.newCommand('capture', ['action', 'target'], (api) => {
    const act = api.args[0] || '';
    if (act === 'help' || !act) {
      engine.echoContent('NetworkCapturer - Help', true);
      engine.echoContent('Usage: capture [action] [target]', true);
      engine.echoContent('  start - 开始捕获数据包', true);
      if (engine.storyWhere === 1008) engine.updateHelp('使用 capture start 抓包。');
      return;
    }
    if (act === 'start') {
      if (engine.storyWhere === 1008) {
        engine.updateHelp('乱填登录信息，然后看抓包结果。');
        engine.loadCapturer('173.5.5.3', 'Chromium', '等待抓包数据...');
        engine.updateHelp('发现明文请求后可利用注入。关掉页面重新 webtry。');
        engine.storyWhere = 1009;
      }
      engine.echoContent('NetworkCapturer - Starting...', true);
    }
  }, 8);

  // ---- mpm ----
  engine.newCommand('mpm', ['action', 'more'], (api) => {
    const act = api.args[0] || '';
    const more = api.args[1] || '';
    if (act === 'help' || !act) {
      engine.echoContent('Memory Package Manager - Version 361.33.21', true);
      engine.echoContent('    install: Install a memory package.', true);
      return;
    }
    if (act === 'install' && more) {
      engine.echoContent(':: Finding Package', true);
      const pkg = more.toLowerCase();
      if (['chinese-language-package', 'us-english-language-package', 'maths-all-knows'].includes(pkg)) {
        engine.echoContent(`Packages:\n    ${more} (Version v5000.0.1)`, true);
        engine.echoContent(':: Use `mpm next`.', true);
        nextStepOfMPM = more;
      }
      return;
    }
    if (act === 'next' && nextStepOfMPM) {
      if (nextStepOfMPM === 'us-english-language-package') {
        engine.echoContent(':: Failed — your body language is chinese.', true);
        return;
      }
      engine.echoContent(':: Downloading...', true);
      setTimeout(() => {
        engine.echoContent(`:: ${nextStepOfMPM} installed.`, true);
        if (engine.storyWhere === 6) {
          engine.storyWhere = 601;
          engine.echoContent('! 召唤 manAI 吧。 !', true);
        }
      }, Math.random() * 10);
    }
  }, 6);

  // ---- debug ----
  engine.newCommand('debug', ['action', 'setvalue'], (api) => {
    const act = api.args[0] || '';
    const val = api.args[1] || '';
    if (act === 'sw') { engine.storyWhere = parseInt(val); engine.echoContent('DEBUG: sw=' + engine.storyWhere, true); }
    else if (act === 'swcheck') engine.echoContent('DEBUG: sw=' + engine.storyWhere, true);
    else if (act === 'save') { engine.persist(); engine.echoContent('DEBUG: saved.', true); }
    else if (act === 'load') { engine.load(); engine.echoContent('DEBUG: loaded.', true); }
    else engine.echoContent('DEBUG: sw/swcheck/save/load', true);
  }, 0);

  // ---- webtry ----
  engine.newCommand('webtry', [], () => {
    engine.echoContent('Use: pandorabox hydra shell webtry [target]', true);
  }, 0);

  // ---- 1534852388 ----
  engine.newCommand('1534852388', [], () => {
    if (engine.storyWhere === 3) {
      engine.echoContent('如果你没有关注我赶紧关注😡', true);
      engine.echoContent('UNLOCKED - Status: Success', true);
      engine.echoContent('NEXT STORY - UNLOCKED FOR Y.', true);
      engine.storyWhere = 4;
    }
  }, 0);

  // ---- check ----
  engine.newCommand('check', ['id'], () => {
    if (engine.storyWhere === 5) engine.storyWhere = 501;
  }, 0);
}
