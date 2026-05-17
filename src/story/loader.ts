// doas story DSL — Loader
// Takes parsed StoryFile and registers everything with GameEngine

import { GameEngine } from '../engine/engine.js';
import {
  StoryFile, Action, CommandStep, AskHandler, RequireEntry,
} from './types.js';

export function loadStory(engine: GameEngine, story: StoryFile): void {
  // Runtime condition flags — stored on engine so cheat commands can modify them
  engine.conditions.clear();
  for (const cond of story.conditions) {
    engine.conditions.set(cond.name, cond.default);
  }

  // ---- Helpers ----

  function checkRequire(reqs: RequireEntry[]): boolean {
    for (const r of reqs) {
      if (r.type === 'storyWhere') {
        const sw = engine.storyWhere;
        const val = r.value ?? 0;
        switch (r.op) {
          case '>=': if (!(sw >= val)) return false; break;
          case '<=': if (!(sw <= val)) return false; break;
          case '==': if (!(sw === val)) return false; break;
          case '!=': if (!(sw !== val)) return false; break;
          case '>': if (!(sw > val)) return false; break;
          case '<': if (!(sw < val)) return false; break;
          default: if (!(sw >= val)) return false; break;
        }
      } else if (r.type === 'condition') {
        const f = engine.conditions.get(r.name ?? '');
        if (!f) return false;
      }
    }
    return true;
  }

  function matchStep(steps: CommandStep[], matchDefault: boolean): CommandStep | null {
    const sw = engine.storyWhere;
    // First try exact matches
    for (const s of steps) {
      if (s.at !== undefined && s.at === sw) return s;
      if (s.atMin !== undefined && sw >= s.atMin && (s.atMax === undefined || sw <= s.atMax)) return s;
      if (s.when && evalWhen(s.when)) return s;
    }
    // Try default
    if (matchDefault) {
      for (const s of steps) {
        if (s.at === undefined && s.atMin === undefined && s.atMax === undefined && !s.when) return s;
      }
    }
    return null;
  }

  function evalWhen(expr: string): boolean {
    // Simple expression: $1 == 'value'
    // For now, just return true (will be evaluated at runtime by the command handler)
    return true;
  }

  async function runActions(acts: Action[], echo: string[], args: string[]): Promise<string | void> {
    let hasNext = false;

    for (const line of echo) {
      engine.echoContent(line, true);
    }

    for (const act of acts) {
      switch (act.kind) {
        case 'sw':
          if (act.value === 'next') hasNext = true;
          else if (act.value === 'back') engine.storyWhere--;
          else engine.storyWhere = act.value;
          break;
        case 'cond':
          engine.conditions.set(act.name, act.value);
          break;
        case 'trig':
          await runTrigger(act.name);
          break;
        case 'wt':
          if (act.action === 'exit') { /* close webtry */ }
          else if (act.name) {
            const wt = story.webTries.find(w => w.name === act.name);
            if (wt) await engine.loadWebTry(wt.filepath);
          }
          break;
        case 'capture':
          await engine.loadCapturer(act.ip, act.sender, act.more);
          break;
        case 'clear':
          engine.clear();
          break;
        case 'exit':
          engine._goExit();
          break;
        case 'achieve':
          engine.addAchieve(act.name, act.level);
          break;
        case 'panel':
          if (act.action === 'show' && !engine.sideBarEnabled) {
            engine.sideBarEnabled = true;
            engine.showPanel();
          } else if (act.action === 'hide' && engine.sideBarEnabled) {
            engine.sideBarEnabled = false;
            engine.showPanel();
          }
          break;
        case 'status':
          engine.updateStatus(act.ip, act.ports, act.mem, act.extra);
          break;
        case 'help':
          engine.updateHelp(act.text);
          break;
        case 'wait':
          await new Promise(r => setTimeout(r, act.ms));
          break;
        case 'cmdAdd': {
          // Look up the command definition from the story and register it
          const cmdDef = story.commands.find(c => c.name === act.name);
          if (cmdDef) {
            engine.newCommand(cmdDef.name, cmdDef.params, async (api) => {
              const st = matchStep(cmdDef.steps, true);
              if (st) {
                const result = await runActions(st.actions, st.echo, api.args);
                if (result === 'nextSTEP') return 'nextSTEP';
              }
            }, 0);
          }
          break;
        }
        case 'progress': {
          const targetSwStr = act.max === undefined ? 'unknown' : act.max.toString();
          const delayStr = act.timeAdd ? act.timeAdd.toString() : 'unknown';
          engine.echoContent(`[progress max=${targetSwStr} timeAdd=${delayStr}][/progress]`, true);
          break;
        }
        case 'sha256': {
          const hash = GameEngine.sha256(act.data);
          engine.echoContent(hash, true);
          break;
        }
        case 'ask': {
          await new Promise<void>((resolve) => {
            engine.ask(act.prompt, (response: string) => {
              const trimmed = response.trim();
              let handled = false;
              for (const h of act.handlers) {
                if (h.empty && trimmed === '') {
                  for (const l of h.echo) engine.echoContent(l, true);
                  handled = true;
                  break;
                }
                if (h.match && trimmed === h.match) {
                  for (const l of h.echo) engine.echoContent(l, true);
                  handled = true;
                  break;
                }
                if (h.default && !handled) {
                  for (const l of h.echo) engine.echoContent(l, true);
                  handled = true;
                  break;
                }
              }
              if (!handled) {
                const def = act.handlers.find(h => h.default);
                if (def) {
                  for (const l of def.echo) engine.echoContent(l, true);
                }
              }
              resolve();
            });
          });
          break;
        }
      }
    }
    if (hasNext) return 'nextSTEP';
  }

  async function runTrigger(name: string): Promise<void> {
    const trig = story.triggers.find(t => t.name === name);
    if (!trig) return;
    if (!checkRequire(trig.require)) return;
    await runActions(trig.actions, trig.echo, []);
  }

  // ---- Register directories ----
  for (const dir of story.dirs) {
    engine.addFile(dir.path + '/.dir', '', 0); // Creates the directory via mkdirP
  }

  // ---- Register restricted dirs ----
  for (const r of story.restricted) {
    engine.addRestrictedDir(r.path);
  }

  // ---- Register files ----
  for (const file of story.files) {
    const onRead = file.onRead;
    const content = file.content;

    if (onRead.length > 0) {
      // File with side effects → use callback
      engine.addFile(file.path, (e) => {
        runActions(onRead, [], []);
        return content;
      }, getMinSw(file.require), getMaxSw(file.require));
    } else {
      engine.addFile(file.path, content, getMinSw(file.require), getMaxSw(file.require));
    }
  }

  // ---- Register commands ----
  for (const cmd of story.commands) {
    const minSw = getMinSw(cmd.require);
    const condReqs = cmd.require.filter(r => r.type === 'condition');

    engine.newCommand(cmd.name, cmd.params, async (api) => {
      // Check condition requirements
      for (const r of condReqs) {
        if (r.name && !engine.conditions.get(r.name)) {
          engine.echoContent('很抱歉，该命令暂时未被启动。', true);
          return;
        }
      }

      // Check when conditions
      const step = matchStep(cmd.steps, true);
      if (step) {
        // Evaluate when condition if present
        if (step.when) {
          const sw = engine.storyWhere;
          if (step.at !== undefined && step.at !== sw) return;
        }
        const result = await runActions(step.actions, step.echo, api.args);
        if (result === 'nextSTEP') return 'nextSTEP';
      }
    }, minSw);
  }

  // ---- Register manAI (special command) ----
  for (const man of story.manAIs) {
    const minSw = getMinSw(man.require);
    const condReqs = man.require.filter(r => r.type === 'condition');

    engine.newCommand('manAI', [], async () => {
      // Check condition requirements
      for (const r of condReqs) {
        if (r.name && !engine.conditions.get(r.name)) {
          engine.echoContent('很抱歉，manAI 暂时未被启动。', true);
          return;
        }
      }

      const step = matchStep(man.steps as CommandStep[], true);
      if (step) {
        const result = await runActions(step.actions, step.echo, []);
        if (result === 'nextSTEP') return 'nextSTEP';
      }
    }, minSw);
  }

  // Mount hostProxy: real filesystem → virtual ~/hostProxy
  engine.mountHostProxy();
}

function getMinSw(reqs: RequireEntry[]): number {
  for (const r of reqs) {
    if (r.type === 'storyWhere' && r.op === '>=' && r.value !== undefined) return r.value;
    if (r.type === 'storyWhere' && r.op === '==' && r.value !== undefined) return r.value;
  }
  return 0;
}

function getMaxSw(reqs: RequireEntry[]): number | undefined {
  for (const r of reqs) {
    if (r.type === 'storyWhere' && r.op === '<=' && r.value !== undefined) return r.value;
    if (r.type === 'storyWhere' && r.op === '==' && r.value !== undefined) return r.value;
  }
  return undefined;
}
