// doas -su mylife.root - Chapter: Pre (序章 - 意外而来)
// Ported from content/chapters/pre/commands.js

import { GameEngine, CommandAPI } from '../engine/engine.js';

let manAIInitialized = false;

export function registerPreChapter(engine: GameEngine): void {
  // Load state
  engine.load();

  engine.echoContent('Welcome to HumanOS.', true);
  engine.echoContent('Type [color: #0f0]help[/endcolor] to get started.', true);

  if (engine.storyWhere >= 1) {
    manAIInitialized = true;
  }

  engine.persist();

  // ---- Virtual files ----
  engine.addFile('~/hello.txt', [
    '你好，欢迎来到 HumanOS.',
    '你如果看到了这篇文档，您的 HumanOS 已经进入了 Emergency Mode，紧急进入了 CLI 模式。',
    '请尝试 getStatus 获得身体状态。',
  ].join('\n'), 0);

  engine.addFile('~/system.log', [
    '2025-10-04 13:40:00 System booting...',
    '2025-10-04 13:40:05 Loading modules...',
    '2025-10-04 13:40:10 Initializing hardware...',
    '2025-10-04 13:40:15 Starting services...',
    '2025-10-04 13:40:20 Fatal error: Failed to load critical service: EyeInterfaceModule, ArmModule... more 17 modules failed.',
    '2025-10-04 13:40:25 Entering Emergency Mode...',
    '2025-10-04 13:40:30 Emergency Mode activated. Limited functionality available.',
    "2025-10-04 13:41:00 User 'brain' logged in as root.",
    '2025-10-04 13:42:37 Body looks unresponsive. No motor functions detected.',
    '2025-10-04 13:43:12 No external devices detected. Possible disconnection.',
    '2025-10-04 13:44:00 Warning: Vital signs unstable. Heartbeat irregularities detected.',
    '2025-10-04 13:45:30 Alert: Oxygen levels dropping. Immediate attention required.',
    '(Log End)',
  ].join('\n'), 1);

  engine.addFile('~/manfile.txt', () => {
    manAIInitialized = true;
    return [
      '很抱歉，目前 manfile.txt 无法连接到身体。',
      '正在启动 AI 助手，尝试帮助您。',
      'AI 助手启动成功。',
      '欢迎使用 HumanOS AI 助手。',
      '! 追加了新的命令：manAI !',
    ].join('\n');
  }, 1);

  engine.addFile('~/config.dd', (e) => {
    e.echoContent('这是一个二进制文件，无法直接查看。', true);
    e.newCommand('config.dd', [], function () {
      e.echoContent('读取 config.dd 文件内容...', true);
      e.echoContent('[ CONFIG ] 设备ID: 246629976', true);
      e.echoContent('[ CONFIG ] 设备状态: 离线', true);
      e.echoContent('[ CONFIG ] 总部连接状态: 未连接', true);
      e.echoContent('[ CONFIG ] AI 助手状态: 已启动', true);
      e.echoContent('[ CONFIG ] 紧急模式: 已启用', true);
      e.echoContent('[ CONFIG ] 传感器状态: 触觉传感器离线，视觉传感器离线，听觉传感器离线', true);
      e.echoContent('[ CONFIG ] 记忆状态: 损坏 (区块 50-10948)', true);
      e.echoContent('[ CONFIG ] 认知状态: 损坏 (区块 230-9843)', true);
      e.echoContent('[ CONFIG ] 其他模块: 大部分模块损坏，需总部人员检查', true);
      e.echoContent('[ CONFIG ] 备注：总部联系方法：contact hq', true);
      e.echoContent('读取完毕。', true);
      e.storyWhere = 3;
    });
  }, 3503);

  engine.addFile('~/freedom.txt', [
    'Welcome, User.',
    '我是 BL.BlueLighting，HumanOS 的开发者。',
    '首先，恭喜你通关了这个小游戏。',
    '其次，虽然该游戏篇幅极短，但是这仅仅是 一个开始，一个序章。',
    '未来，我会加入第一章，第二章，第N章...，添加更多的剧情和内容。',
    '最后，感谢你玩这个小游戏。',
    '如果你有任何建议或者意见，欢迎联系我。',
    '还有别忘了给我 STAR！！！！！！',
    '                     -- BL.BlueLighting 2025',
  ].join('\n'), 6, 6);

  // ---- getStatus ----
  engine.newCommand('getStatus', [], function (_api: CommandAPI) {
    if (engine.storyWhere === 0) {
      engine.echoContent('名称：[UNKNOWN]  状态：紧急模式  紧急模式 - EMERGENCY MODE -', true);
      engine.echoContent('    - 紧急模式进入原因：', true);
      engine.echoContent('        - 您目前身体已进入植物人模式。紧急模式下无法进行任何肢体操作。', true);
      engine.echoContent('    - 心跳：76 bpm', true);
      engine.echoContent('    - 血压：120/80 mmHg', true);
      engine.echoContent('    - 血氧：98%', true);
      engine.echoContent('    - 体温：36.5 ℃', true);
      engine.echoContent('    - 呼吸频率：16 次/分钟', true);
      engine.echoContent('    - 大脑活动：正常', true);
      engine.echoContent('    - 目前无法检测到肢体信号以及事件。', true);
      engine.echoContent('    - 目前无法检测到任何外部环境信息。', true);
      engine.echoContent('    - 目前无法检测到任何外部设备连接。', true);
      engine.echoContent('! 检测到当前目录出现新的文件，请执行 ls 查看。 !', true);
      return 'nextSTEP';
    } else {
      engine.echoContent('名称：[UNKNOWN]  状态：紧急模式  紧急模式 - EMERGENCY MODE -', true);
      engine.echoContent('    - 紧急模式进入原因：', true);
      engine.echoContent('        - 您目前身体已进入植物人模式。紧急模式下无法进行任何肢体操作。', true);
      engine.echoContent('    - 心跳：76 bpm', true);
      engine.echoContent('    - 血压：120/80 mmHg', true);
      engine.echoContent('    - 血氧：98%', true);
      engine.echoContent('    - 体温：36.5 ℃', true);
      engine.echoContent('    - 呼吸频率：16 次/分钟', true);
      engine.echoContent('    - 大脑活动：正常', true);
      engine.echoContent('    - 目前无法检测到肢体信号以及事件。', true);
      engine.echoContent('    - 目前无法检测到任何外部环境信息。', true);
      engine.echoContent('    - 目前无法检测到任何外部设备连接。', true);
      engine.echoContent('    - AI 助手：manAI 已启动。', true);
    }
    engine.persist();
  });

  // ---- help ----
  engine.newCommand('help', [], function (_api: CommandAPI) {
    engine.echoContent('You are hopeless... Hahahaha', true);
    engine.persist();
  });

  // ---- manAI ----
  engine.newCommand('manAI', [], function (_api: CommandAPI) {
    if (!manAIInitialized) {
      engine.echoContent('很抱歉，manAI 暂时未被启动。', true);
      return;
    }

    if (engine.storyWhere === 1) {
      engine.echoContent('(-_-) 额，你好。', true);
      engine.echoContent('(awa) 看起来目前你的身体已经变成植物人了。', true);
      engine.echoContent('(awa) 我是你的 AI 助手，叫我 perhaps 就好。', true);
      engine.echoContent('(awa) 目前我能做的也很有限，不过我会尽力帮助你。', true);
      engine.echoContent('(+_+) 如果你遇到了 ! 什么什么 ! 就是我在提示你！', true);
      engine.echoContent('(qwq) 因为你目前的身体状况，我现在连接不到总部，因此现在这里只剩下我和你了。', true);
      engine.echoContent('(p_p) 你现在也许可以试试 reconnect 命令，看看能不能连接上身体。', true);
      engine.storyWhere = 3501;
    } else if (engine.storyWhere === 2) {
      engine.echoContent('(-_-) 你还好吗？', true);
      engine.echoContent('(q_q) 我刚才试着帮你连接了一下身体，但是好像不太成功。', true);
      engine.echoContent('(._.) 我检查一下你大脑系统怎么样了。', true);
      engine.echoContent('(RUN) 正在执行命令，请无视下方内容。', true);
      engine.echoContent('      - 记忆：损坏 (区块 50-10948)', true);
      engine.echoContent('      - 认知：损坏 (区块 230-9843)', true);
      engine.echoContent('(0_0) 你大脑是怎么了？', true);
      engine.echoContent('(+_+) 我现在能检测到你大脑的部分功能还在工作。', true);
      engine.echoContent('(._.) 你只能自己尝试修复记忆了，这部分我没有权限帮你。', true);
      engine.echoContent('! 尝试 memory fixing !', true);
      engine.storyWhere = 3502;
    } else if (engine.storyWhere === 3502) {
      engine.echoContent('(O_o) 你这身体...异常的严重啊...', true);
      engine.echoContent('(q_q) 我刚才尝试帮你修复记忆了，但是失败了。', true);
      engine.echoContent('(._.) 你的记忆损坏过于严重，我也没法帮你了。', true);
      engine.echoContent('(._.) 你只能等总部的人来帮你了。', true);
      engine.echoContent('(?_?) 话说回来，你这身体发生什么了？', true);
      engine.echoContent('你：不清楚，我好像是出了车祸，然后就变成这样了。', true);
      engine.echoContent('(._.) 嗯...我也不清楚。', true);
      engine.echoContent('(...) 正在进行身体调查与数据分析，请勿操作。', true);
      engine.echoContent('(...) 分析中...', true);
      engine.echoContent('(...) 分析中...', true);
      engine.echoContent('(^_^) 还行！你这身体虽然损坏严重，但是还算完整。', true);
      engine.echoContent('(._.) 你这身体应该还能用，只是需要总部的人来帮你重启一下。', true);
      engine.echoContent('(-_-) 只不过你很难联系到总部了。', true);
      engine.echoContent('(._.) 你只能等着了。', true);
      engine.echoContent('! 检测到当前目录出现新的文件，请执行 ls 查看。 !', true);
      engine.storyWhere = 3503;
    } else if (engine.storyWhere === 3) {
      engine.echoContent('(=_=) 连你联系总部都无法联系上吗...', true);
      engine.echoContent('(q_q) 你这身体损坏得也太严重了。', true);
      engine.echoContent('(._.) 我接下来会打开一个倒计时。', true);
      engine.echoContent('(._.) 如果你在倒计时结束前无法联系到总部，你的身体可能会永久损坏。', true);
      engine.echoContent('(+_+) 使用 countdown 开始倒计时。', true);
      engine.echoContent('! 追加了新的命令：countdown !', true);
      engine.storyWhere = 3504;
    } else if (engine.storyWhere === 350501) {
      engine.echoContent('(-_-) 你的身体...彻底损坏了。', true);
      engine.echoContent('(曙光)', true);
      engine.echoContent('    - 你感觉到一阵温暖的光芒包围着你。', true);
      engine.echoContent('    - 重启吧。', true);
      engine.echoContent('    Type reboot to reboot your HumanOS.', true);
      engine.storyWhere = 350502;
    } else if (engine.storyWhere === 3506) {
      engine.echoContent('(^_^) 你终于醒了。', true);
      engine.echoContent('(._.) 你现在已经脱离了紧急模式。', true);
      engine.echoContent('(._.) 你现在可以动了。', true);
      engine.echoContent('(._.) 你现在可以看到外面的世界了。', true);
      engine.echoContent('(^_^) 你去看看外面吧！什么时候想我了就再来找我！', true);
      engine.storyWhere = 6;
      engine.echoContent('! 有新的文件出现了，Check it out !', true);
    } else {
      engine.echoContent('(-_-) 作者还没有写完剧情。', true);
      engine.echoContent('(awa) 你可以等待作者什么时候写完剧情了你再来看看。', true);
    }
    engine.persist();
  });

  // ---- reconnect ----
  engine.newCommand('reconnect', [], function (_api: CommandAPI) {
    if (engine.storyWhere === 3501) {
      engine.echoContent('[ INFO ] 尝试重新连接感知系统...', true);
      engine.echoContent('[ INFO ] 连接中...', true);
      engine.echoContent('[ ERROR ] 连接失败。原因：感知系统遇到错误，请使用 journal system.touching.service 查看日志。', true);
      engine.storyWhere = 2;
    }
    engine.persist();
  });

  // ---- journal ----
  engine.newCommand('journal', ['serviceName:string'], function (api: CommandAPI) {
    const serviceName = api.args[0];
    if (serviceName === 'system.touching.service' && engine.storyWhere === 2) {
      engine.echoContent('X  System Touching Service (Failed)      启动后即退出 Code 15', true);
      engine.echoContent('    - 描述：管理触觉传感器的服务。', true);
      engine.echoContent('    - 最近日志：', true);
      engine.echoContent('[ LOG ] 2025-10-04 14:00:00 System Touching Service started.', true);
      engine.echoContent('[ LOG ] 2025-10-04 14:00:05 Initializing touch sensors...', true);
      engine.echoContent('[ ERROR ] 2025-10-04 14:00:10 Failed to initialize touch sensors. Error Code: 15.', true);
      engine.echoContent('[ LOG ] 2025-10-04 14:00:15 System Touching Service exiting.', true);
      engine.echoContent('! 啊？我现在只能输出一句话，使用 manAI 继续触发我。 !', true);
      return;
    }
    engine.persist();
  });

  // ---- memory ----
  engine.newCommand('memory', ['action:string'], function (api: CommandAPI) {
    const action = api.args[0];
    if (action === 'fixing' && engine.storyWhere === 3502) {
      engine.echoContent('[ RUN ] 尝试修复记忆...', true);
      engine.echoContent('[ GET ] 检测区块...', true);
      engine.echoContent('[ ??? ] 发现损坏区块 50-10948，尝试修复...', true);
      engine.echoContent('[ ??? ] 修复失败，区块 11451-98430 也损坏，无法继续修复。', true);
      engine.echoContent('[ FAIL ] 修复记忆失败。', true);
      engine.echoContent('! 你这记忆损坏过于严重，先转到 manAI 继续询问我。 !', true);
    }
    engine.persist();
  });

  // ---- contact ----
  engine.newCommand('contact', ['target:string'], function (api: CommandAPI) {
    const target = api.args[0];
    if (target === 'hq') {
      engine.echoContent('[ INFO ] 尝试联系总部...', true);
      engine.echoContent('[ ERROR ] 联系失败。原因：无法连接到总部网络。', true);
      engine.echoContent('! 连总部都无法联系上吗... !', true);
      engine.storyWhere = 3;
    }
    engine.persist();
  });

  // ---- countdown ----
  engine.newCommand('countdown', [], function (_api: CommandAPI) {
    if (engine.storyWhere === 3504) {
      engine.echoContent('[ WARNING ] 倒计时开始，360 秒后身体也许将永久损坏。', true);

      let remaining = 360;

      const tick = () => {
        if (remaining <= 0) {
          engine.echoContent('[color:red]倒计时结束！[/endcolor]', true);
          engine.echoContent('倒计时结束。manAI 来查看结果。', true);
          engine.storyWhere = 350501;
        } else {
          engine.echoContent(`[color:green]倒计时剩余：${remaining.toFixed(1)} 秒[/endcolor]`, true);
          remaining -= 0.1;
          setTimeout(tick, 100);
        }
      };
      tick();
    }
    engine.persist();
  });

  // ---- reboot ----
  engine.newCommand('reboot', [], function (_api: CommandAPI) {
    if (engine.storyWhere === 350502) {
      engine.echoContent('Rebooting HumanOS...', true);
      engine.echoContent('System rebooted. Exiting Emergency Mode.', true);
      engine.clear();
      engine.echoContent('Welcome to HumanOS.', true);
      engine.echoContent('Type [color: #0f0]help[/endcolor] to get started.', true);
      engine.echoContent('System Status: ONLINE', true);
      engine.echoContent('All systems operational.', true);
      engine.echoContent('    - manAI 更新了信息。去看看罢。', true);
      engine.storyWhere = 3506;
    }
    engine.persist();
  });

  // ---- clear ----
  engine.newCommand('clear', [], function (_api: CommandAPI) {
    engine.clear();
    engine.echoContent('Welcome to HumanOS.', true);
    engine.echoContent('Type [color: #0f0]help[/endcolor] to get started.', true);
  });
}
