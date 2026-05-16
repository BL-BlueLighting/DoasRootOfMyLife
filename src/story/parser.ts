// doas story DSL — Parser
// Converts .doasStory text → StoryFile AST

import {
  StoryFile, ChapterMeta, ConditionDef, DirDef, RestrictedDef, FileDef,
  CommandDef, CommandStep, ManAIDef, ManAIStep, WebTryDef,
  TriggerDef, ScriptDef, Action, AskDef, AskHandler, RequireEntry,
} from './types.js';

export function parseStory(source: string): StoryFile {
  const lines = source.split(/\r?\n/);
  let pos = 0;

  const result: StoryFile = {
    chapter: undefined,
    useScript: undefined,
    conditions: [], dirs: [], restricted: [], files: [],
    commands: [], manAIs: [], webTries: [], triggers: [], scripts: [],
  };

  function peek(): string { return lines[pos] ?? ''; }
  function advance(): string { return lines[pos++] ?? ''; }
  function eof(): boolean { return pos >= lines.length; }

  // Safety: prevent infinite loops
  let loopCount = 0;
  const MAX_LOOP = 10000;
  function tick(): void {
    if (++loopCount > MAX_LOOP) throw new Error('Parser stuck: infinite loop detected');
  }

  function skipBlank(): void {
    while (!eof() && peek().trim() === '') { tick(); advance(); }
  }

  function skipComment(): void {
    while (!eof()) {
      tick();
      const line = peek();
      const trimmed = line.trimStart();
      if (trimmed.startsWith('+') && !trimmed.startsWith('++')) {
        advance();
      } else if (trimmed.startsWith('++')) {
        advance();
        while (!eof()) {
          tick();
          const inner = advance();
          if (inner.trimStart().startsWith('++')) break;
        }
      } else {
        break;
      }
    }
  }

  function skipJunk(): void {
    let changed = true;
    while (changed) {
      tick();
      changed = false;
      const before = pos;
      skipBlank();
      skipComment();
      skipBlank();
      if (pos !== before) changed = true;
    }
  }

  // Get indent level (number of leading spaces)
  function indentOf(line: string): number {
    return line.length - line.trimStart().length;
  }

  // Read indented content block
  function readBlock(baseIndent: number): string[] {
    const result: string[] = [];
    while (!eof() && peek().trim() !== '') { tick();
      const line = peek();
      const trimmed = line.trimStart();
      if (trimmed.startsWith('+')) { advance(); continue; }
      if (trimmed.startsWith('++')) {
        advance();
        while (!eof() && !advance().trimStart().startsWith('++')) {}
        continue;
      }
      if (indentOf(line) < baseIndent && !trimmed.startsWith('[') && !trimmed.startsWith('/')) break;
      // Check for section close or action
      if (trimmed.startsWith('[/') || trimmed.startsWith('/') || trimmed.startsWith('- ') || trimmed.startsWith('[condition') || trimmed.startsWith('[dir') || trimmed.startsWith('[restricted') || trimmed.startsWith('[file') || trimmed.startsWith('[command') || trimmed.startsWith('[manAI]') || trimmed.startsWith('[webTry') || trimmed.startsWith('[trigger') || trimmed.startsWith('[script')) {
        break;
      }
      result.push(trimmed);
      advance();
    }
    return result;
  }

  // Parse a section header: [name] or [name key="value"]
  function parseHeader(line: string): { name: string; attrs: Record<string, string> } | null {
    const trimmed = line.trimStart();
    const m = trimmed.match(/^\[([\w\d]+)(.*)\]$/);
    if (!m) return null;
    const attrs: Record<string, string> = {};
    const attrRe = /(\w+)="([^"]*)"/g;
    let am;
    while ((am = attrRe.exec(trimmed)) !== null) {
      attrs[am[1]] = am[2];
    }
    return { name: m[1], attrs };
  }

  // Parse require entries
  function parseRequire(baseIndent: number): RequireEntry[] {
    const entries: RequireEntry[] = [];
    skipJunk();
    while (!eof()) {
      const line = peek();
      const trimmed = line.trimStart();
      if (trimmed.startsWith('[') || trimmed.startsWith('/') || trimmed.startsWith('- ')) break;
      if (indentOf(line) < baseIndent) break;
      if (trimmed === '' || trimmed.startsWith('+')) { advance(); continue; }

      // Parse: storyWhere >= N
      const swMatch = trimmed.match(/^storyWhere\s*(>=|<=|==|!=|>|<)\s*(-?\d+)/);
      if (swMatch) {
        entries.push({ type: 'storyWhere', op: swMatch[1] as RequireEntry['op'], value: parseInt(swMatch[2]) });
        advance();
        continue;
      }
      // Parse: condition name
      const condMatch = trimmed.match(/^(\w+)$/);
      if (condMatch) {
        entries.push({ type: 'condition', name: condMatch[1] });
        advance();
        continue;
      }
      advance();
    }
    return entries;
  }

  // Parse actions (/action, - action)
  function parseActions(baseIndent: number): { actions: Action[]; echo: string[] } {
    const actions: Action[] = [];
    const echo: string[] = [];
    skipJunk();
    while (!eof()) {
      const line = peek();
      const trimmed = line.trimStart();
      if (trimmed.startsWith('[') || (trimmed.startsWith('[/') && !trimmed.startsWith('[/at'))) break;
      if (indentOf(line) < baseIndent && !trimmed.startsWith('/') && !trimmed.startsWith('- ')) break;
      if (trimmed === '' || trimmed.startsWith('+')) { advance(); continue; }

      if (trimmed.startsWith('/')) {
        const act = parseActionLine(trimmed.slice(1));
        if (act) actions.push(act);
        advance();
      } else if (trimmed.startsWith('- ask')) {
        const ask = parseAskBlock(baseIndent);
        if (ask) actions.push({ kind: 'ask', prompt: ask.prompt, handlers: ask.on });
      } else if (trimmed.startsWith('- echo')) {
        advance();
        const text = readBlock(baseIndent + 4);
        echo.push(...text);
      } else if (trimmed.startsWith('- wait')) {
        const waitMatch = trimmed.match(/^- wait\s+(\d+)/);
        if (waitMatch) {
          actions.push({ kind: 'wait', ms: parseInt(waitMatch[1]) });
        }
        advance();
      } else {
        advance();
      }
    }
    return { actions, echo };
  }

  // Parse a /action line
  function parseActionLine(text: string): Action | null {
    const parts = text.split(/\s+/);
    const cmd = parts[0];
    const rest = parts.slice(1);

    if (cmd === 'sw') {
      if (rest[0] === 'next') return { kind: 'sw', value: 'next' };
      if (rest[0] === 'back') return { kind: 'sw', value: 'back' };
      const n = parseInt(rest[0]);
      if (!isNaN(n)) return { kind: 'sw', value: n };
    }
    if (cmd === 'cond' && rest[0] === 'set') {
      const name = rest[1];
      const beIdx = rest.indexOf('be');
      if (beIdx >= 0) {
        const valStr = rest.slice(beIdx + 1).join(' ');
        if (valStr === 'true') return { kind: 'cond', name, value: true };
        if (valStr === 'false') return { kind: 'cond', name, value: false };
        const n = parseInt(valStr);
        if (!isNaN(n)) return { kind: 'cond', name, value: n };
        return { kind: 'cond', name, value: valStr };
      }
    }
    if (cmd === 'trig') {
      return { kind: 'trig', name: rest[0] };
    }
    if (cmd === 'wt') {
      if (rest[0] === 'exit') return { kind: 'wt', action: 'exit' };
      return { kind: 'wt', action: 'go', name: rest.slice(1).join(' ') };
    }
    if (cmd === 'capture') {
      return { kind: 'capture', ip: rest[0] || '', sender: rest[1] || '', more: rest.slice(2).join(' ') || '' };
    }
    if (cmd === 'clear') return { kind: 'clear' };
    if (cmd === 'exit') return { kind: 'exit' };
    if (cmd === 'achieve') {
      return { kind: 'achieve', name: rest.slice(0, -1).join(' '), level: rest[rest.length - 1] };
    }
    if (cmd === 'panel') {
      return { kind: 'panel', action: rest[0] === 'show' ? 'show' : 'hide' };
    }
    if (cmd === 'status') {
      return { kind: 'status', ip: rest[0] || '', ports: rest[1] || '', mem: rest[2] || '', extra: rest.slice(3).join(' ') || '' };
    }
    if (cmd === 'help') {
      return { kind: 'help', text: rest.join(' ') };
    }
    if (cmd === 'wait') {
      const n = parseInt(rest[0]);
      if (!isNaN(n)) return { kind: 'wait', ms: n };
    }
    if (cmd === 'sleep') {
      const n = parseInt(rest[0]);
      if (!isNaN(n)) return { kind: 'wait', ms: n };
    }
    if (cmd === 'gocountdown') {
      const n = parseInt(rest[0]);
      if (!isNaN(n)) return { kind: 'wait', ms: n };
      return { kind: 'wait', ms: 100 };
    }
    if (cmd === 'cmd' && rest[0] === 'add') {
      return { kind: 'cmdAdd', name: rest[1], steps: [] };
    }
    if (cmd === 'base64') {
      const action = rest[0];
      const content = rest.slice(1).join(' ');
      if (action === 'encode') return { kind: 'wait', ms: 0 }; // handled in scripts
      if (action === 'decode') return { kind: 'wait', ms: 0 }; // handled in scripts
    }
    if (cmd === 'random') {
      return { kind: 'wait', ms: 0 }; // handled in scripts
    }
    if (cmd === 'progress') {
      const max = parseInt(rest[0]);
      const timeAdd = parseInt(rest[1]);
      return { kind: 'progress', max: max || 0, timeAdd: timeAdd || 0 };
    }
    if (cmd === 'sha256') {
      return { kind: 'sha256', data: rest.join(' ') };
    }
    return null;
  }

  // Parse - ask block
  function parseAskBlock(baseIndent: number): AskDef | null {
    // Skip the "- ask" line
    const askLine = advance();
    const askMatch = askLine.trimStart().match(/^- ask\s+(.*)/);
    const prompt = askMatch ? askMatch[1].trim() : '';

    const handlers: AskHandler[] = [];
    skipJunk();

    while (!eof()) {
      const line = peek();
      const trimmed = line.trimStart();
      if (trimmed.startsWith('[/') || (indentOf(line) < baseIndent && !trimmed.startsWith('[') && !trimmed.startsWith('/') && !trimmed.startsWith('- '))) break;

      if (trimmed.startsWith('[on')) {
        const hdr = parseHeader(trimmed);
        advance();
        const handlerBase = indentOf(peek()) || baseIndent + 2;
        const { actions, echo } = parseActions(handlerBase);
        const handler: AskHandler = { echo, actions };
        if (hdr?.attrs['match']) handler.match = hdr.attrs['match'];
        if (hdr?.attrs['empty'] === 'true') handler.empty = true;
        if (hdr?.attrs['default'] === 'true') handler.default = true;
        handlers.push(handler);
        // skip [/on]
        skipJunk();
        if (peek().trimStart().startsWith('[/on]')) advance();
      } else {
        break;
      }
    }

    return { prompt, on: handlers };
  }

  // Parse an [at N] block within a command or manAI
  function parseAtBlock(): CommandStep | null {
    const line = peek();
    const hdr = parseHeader(line.trimStart());
    if (!hdr || hdr.name !== 'at') return null;
    advance();

    const step: CommandStep = { echo: [], actions: [] };
    if (hdr.attrs['value']) {
      const v = hdr.attrs['value'];
      if (v === 'default') { /* default handler, no constraint */ }
      else if (v.includes('>=')) step.atMin = parseInt(v.replace('>=', '').trim());
      else if (v.includes('<=')) step.atMax = parseInt(v.replace('<=', '').trim());
      else step.at = parseInt(v);
    }
    // Parse when= attribute
    if (hdr.attrs['when']) step.when = hdr.attrs['when'];

    const indent = indentOf(line);
    const { actions, echo } = parseActions(indent + 2);
    step.echo = echo;
    step.actions = actions;

    // skip [/at]
    skipJunk();
    if (peek().trimStart().startsWith('[/at]')) advance();

    return step;
  }

  // ---- Main parse loop ----
  while (!eof()) {
    tick();
    skipJunk();
    if (eof()) break;

    const line = peek();
    const trimmed = line.trimStart();
    const indent = indentOf(line);

    // Skip comments
    if (trimmed.startsWith('+')) { skipComment(); continue; }

    const hdr = parseHeader(trimmed);
    if (!hdr) { advance(); continue; }

    switch (hdr.name) {
      case 'chapter': {
        advance();
        const meta: ChapterMeta = { id: '', name: '', description: '', gameId: '' };
        skipJunk();
        while (!eof() && !peek().trimStart().startsWith('[/chapter]')) { tick();
          const cline = peek().trimStart();
          // Inline values: [id] value
          if (cline.startsWith('[id]')) { meta.id = cline.slice(4).trim(); advance(); }
          else if (cline.startsWith('[name]')) { meta.name = cline.slice(6).trim(); advance(); }
          else if (cline.startsWith('[gameId]')) { meta.gameId = cline.slice(8).trim(); advance(); }
          else if (cline.startsWith('[description]')) {
            advance();
            const descLines: string[] = [];
            while (!eof() && !peek().trimStart().startsWith('[/description]')) { tick();
              descLines.push(peek().trimStart());
              advance();
            }
            meta.description = descLines.join('\n');
            if (peek().trimStart().startsWith('[/description]')) advance();
          } else { advance(); }
          skipJunk();
        }
        if (peek().trimStart().startsWith('[/chapter]')) advance();
        result.chapter = meta;
        break;
      }
      case 'useScript': {
        result.useScript = hdr.attrs['path'] || '';
        advance();
        break;
      }
      case 'condition': {
        const def: ConditionDef = {
          name: hdr.attrs['name'] || '',
          default: hdr.attrs['default'] === 'true' ? true :
                   hdr.attrs['default'] === 'false' ? false :
                   isNaN(Number(hdr.attrs['default'])) ? (hdr.attrs['default'] || false) :
                   Number(hdr.attrs['default']),
        };
        result.conditions.push(def);
        advance();
        break;
      }
      case 'dir': {
        result.dirs.push({ path: hdr.attrs['path'] || '' });
        advance();
        break;
      }
      case 'restricted': {
        result.restricted.push({ path: hdr.attrs['path'] || '' });
        advance();
        break;
      }
      case 'file': {
        const filePath = hdr.attrs['path'] || '';
        advance();
        const require = parseRequire(indent + 2);
        const onRead: Action[] = [];
        const content: string[] = [];

        // Read [onRead] and [fileContent]
        skipJunk();
        while (!eof() && !peek().trimStart().startsWith('[/file]')) { tick();
          const sec = peek().trimStart();
          if (sec.startsWith('[onRead]')) {
            advance();
            const { actions } = parseActions(indent + 4);
            onRead.push(...actions);
            skipJunk();
            if (peek().trimStart().startsWith('[/onRead]')) advance();
          } else if (sec.startsWith('[fileContent]')) {
            advance();
            content.push(...readBlock(0));
            skipJunk();
            if (peek().trimStart().startsWith('[/fileContent]')) advance();
          } else {
            advance();
          }
          skipJunk();
        }
        if (peek().trimStart().startsWith('[/file]')) advance();

        result.files.push({ path: filePath, require, onRead, content: content.join('\n') });
        break;
      }
      case 'command': {
        const cmdName = hdr.attrs['name'] || '';
        advance();
        const require = parseRequire(indent + 2);
        const params: string[] = [];
        const steps: CommandStep[] = [];

        skipJunk();
        while (!eof() && !peek().trimStart().startsWith('[/command]')) { tick();
          const sec = peek().trimStart();
          if (sec.startsWith('[params]')) {
            advance();
            const pline = peek().trimStart();
            if (pline && !pline.startsWith('[')) {
              params.push(...pline.split(/\s+/));
              advance();
            }
            skipJunk();
            if (peek().trimStart().startsWith('[/params]')) advance();
          } else if (sec.startsWith('[run]')) {
            advance();
            skipJunk();
            while (!eof() && !peek().trimStart().startsWith('[/run]')) { tick();
              const before = pos;
              const step = parseAtBlock();
              if (step) {
                steps.push(step);
              } else {
                const { actions, echo } = parseActions(indent + 4);
                if (echo.length > 0 || actions.length > 0) {
                  steps.push({ echo, actions, at: undefined });
                }
              }
              skipJunk();
              if (pos === before) advance();
            }
            if (peek().trimStart().startsWith('[/run]')) advance();
          } else {
            advance();
          }
          skipJunk();
        }
        if (peek().trimStart().startsWith('[/command]')) advance();

        result.commands.push({ name: cmdName, require, params, steps });
        break;
      }
      case 'manAI': {
        advance();
        const require = parseRequire(indent + 2);
        const steps: ManAIStep[] = [];
        skipJunk();
        while (!eof() && !peek().trimStart().startsWith('[/manAI]')) { tick();
          const sec = peek().trimStart();
          if (sec.startsWith('[talk]')) {
            advance();
            skipJunk();
            while (!eof() && !peek().trimStart().startsWith('[/talk]')) { tick();
              const before = pos;
              const step = parseAtBlock();
              if (step) {
                steps.push({ at: step.at, atMin: step.atMin, atMax: step.atMax, echo: step.echo, actions: step.actions });
              } else {
                const { actions, echo } = parseActions(indent + 4);
                if (echo.length > 0 || actions.length > 0) {
                  steps.push({ echo, actions });
                }
              }
              skipJunk();
              if (pos === before) advance(); // safety: ensure progress
            }
            if (peek().trimStart().startsWith('[/talk]')) advance();
          } else {
            advance();
          }
          skipJunk();
        }
        if (peek().trimStart().startsWith('[/manAI]')) advance();
        result.manAIs.push({ require, steps });
        break;
      }
      case 'webTry': {
        const name = hdr.attrs['name'] || '';
        let filepath = '';
        advance();
        skipJunk();
        while (!eof() && !peek().trimStart().startsWith('[/webTry]')) { tick();
          const sec = peek().trimStart();
          if (sec.startsWith('[filepath]')) {
            advance();
            const fp = peek().trimStart();
            if (fp && !fp.startsWith('[')) { filepath = fp; advance(); }
            skipJunk();
            if (peek().trimStart().startsWith('[/filepath]')) advance();
          } else {
            advance();
          }
          skipJunk();
        }
        if (peek().trimStart().startsWith('[/webTry]')) advance();
        result.webTries.push({ name, filepath });
        break;
      }
      case 'trigger': {
        const trigName = hdr.attrs['name'] || '';
        advance();
        const require = parseRequire(indent + 2);
        let trigEcho: string[] = [];
        let trigActions: Action[] = [];
        skipJunk();
        while (!eof() && !peek().trimStart().startsWith('[/trigger]')) { tick();
          const sec = peek().trimStart();
          if (sec.startsWith('[do]')) {
            advance();
            const { actions, echo } = parseActions(indent + 4);
            trigActions = actions;
            trigEcho = echo;
            skipJunk();
            if (peek().trimStart().startsWith('[/do]')) advance();
          } else {
            advance();
          }
          skipJunk();
        }
        if (peek().trimStart().startsWith('[/trigger]')) advance();
        result.triggers.push({ name: trigName, require, actions: trigActions, echo: trigEcho });
        break;
      }
      case 'script': {
        const scriptName = hdr.attrs['name'] || '';
        const scriptType = hdr.attrs['type'] || '';
        const config: Record<string, string> = {};
        advance();
        skipJunk();
        // Read config lines
        while (!eof() && !peek().trimStart().startsWith('[/script]')) { tick();
          const cfgLine = peek().trimStart();
          if (cfgLine.includes('=') && !cfgLine.startsWith('[') && !cfgLine.startsWith('+')) {
            const eqIdx = cfgLine.indexOf('=');
            const k = cfgLine.slice(0, eqIdx).trim();
            const v = cfgLine.slice(eqIdx + 1).trim();
            config[k] = v;
          }
          advance();
          skipJunk();
        }
        if (peek().trimStart().startsWith('[/script]')) advance();
        result.scripts.push({ name: scriptName, type: scriptType, config });
        break;
      }
      default: {
        advance();
        break;
      }
    }
  }

  return result;
}
