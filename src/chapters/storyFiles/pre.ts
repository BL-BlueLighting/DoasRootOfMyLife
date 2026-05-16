// Pre chapter (序章) — Script hooks
import { GameEngine } from '../../engine/engine.js';

export function registerScripts(engine: GameEngine): void {
  // Countdown — 360 second timer
  engine.newCommand('countdown', [], () => {
    if (engine.storyWhere !== 3504) return;

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
  }, 3504);
}
