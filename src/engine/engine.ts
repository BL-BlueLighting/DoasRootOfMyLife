// doas -su mylife.root - Core Engine
// Port of base.js to TypeScript for CLI

import { parseEchoContent, blocksToLines, OutputLine, OutputBlock } from './parser.js';
import { loadState, saveState, loadAchieves, saveAchieves, SaveData } from './storage.js';
import { webServer } from './webserver.js';

export interface CommandAPI {
  args: string[];
  context: Record<string, unknown>;
  echo: (content: string, noSleep?: boolean, delay?: number) => void;
  save: () => void;
  setVar: (k: string, v: unknown) => void;
  getVar: (k: string) => unknown;
  storyWhere: number;
  nextStory: boolean;
  setStoryWhere: (v: number) => void;
  setNextStory: (v: boolean) => void;
}

export type CommandHandler = (api: CommandAPI) => string | void | Promise<string | void>;

interface CommandEntry {
  paramDefs: string[];
  handler: CommandHandler;
  storyWhereNeed: number;
}

export interface GameState {
  storyWhere: number;
  nextStory: boolean;
  accessGiven: boolean;
  sideBarEnabled: boolean;
  contextVars: Record<string, unknown>;
  history: string[];
  achieves: string[];
}

export interface PanelStatus {
  visible: boolean;
  ip: string;
  ports: string;
  mem: string;
  extra: string;
}

type WriteLineFn = (line: OutputLine) => void;
type WriteBlockFn = (block: OutputBlock) => void;
type AskFn = (prompt: string, callback: (response: string) => void) => void;
type LockInputFn = (locked: boolean) => void;
type ExitProgramFn = () => void;
type ClearOutputFn = () => void;
type PanelUpdateFn = (status: PanelStatus) => void;

export class GameEngine {
  private commands = new Map<string, CommandEntry>();
  private state: GameState;
  private chapterId: string;
  private gameId: string;
  private asking = false;
  private askCallback: ((response: string) => void) | null = null;
  private echoDelay = 30;

  // UI callbacks
  private onWrite: WriteLineFn = () => {};
  private onAsk: AskFn = () => {};
  private onLock: LockInputFn = () => {};
  private onClear: ClearOutputFn = () => {};
  private onExit: ExitProgramFn = () => {};
  private onPanel: PanelUpdateFn = () => {};
  private callbacksSet = false;
  private pendingLines: OutputLine[] = [];

  // Panel status
  private panelStatus: PanelStatus = {
    visible: false,
    ip: '127.0.0.1',
    ports: '22',
    mem: '739MiB',
    extra: '',
  };

  constructor(chapterId: string, gameId: string) {
    this.chapterId = chapterId;
    this.gameId = gameId;
    this.state = {
      storyWhere: 0,
      nextStory: false,
      accessGiven: false,
      sideBarEnabled: false,
      contextVars: {},
      history: [],
      achieves: [],
    };
  }

  // Wire up UI callbacks
  setCallbacks(
    write: WriteLineFn,
    ask: AskFn,
    lock: LockInputFn,
    clear: ClearOutputFn,
    exit: ExitProgramFn,
    panel?: PanelUpdateFn,
  ): void {
    this.onWrite = write;
    this.onAsk = ask;
    this.onLock = lock;
    this.onClear = clear;
    this.onExit = exit;
    if (panel) this.onPanel = panel;
    this.callbacksSet = true;
    // Flush pending output
    for (const line of this.pendingLines) {
      this.onWrite(line);
    }
    this.pendingLines = [];
  }

  private writeLine(line: OutputLine): void {
    if (this.callbacksSet) {
      this.onWrite(line);
    } else {
      this.pendingLines.push(line);
    }
  }

  // Load from disk
  load(): void {
    const data = loadState(this.chapterId);
    if (data) {
      this.state.storyWhere = data.storyWhere;
      this.state.nextStory = data.nextStory;
      this.state.accessGiven = data.accessGiven;
      this.state.sideBarEnabled = data.sideBarEnabled;
      this.state.contextVars = data.variables;
      this.state.history = data.history;
    }
    this.state.achieves = loadAchieves(this.gameId);
  }

  // Save to disk
  persist(): void {
    const data: SaveData = {
      history: this.state.history,
      variables: this.state.contextVars,
      storyWhere: this.state.storyWhere,
      nextStory: this.state.nextStory,
      accessGiven: this.state.accessGiven,
      sideBarEnabled: this.state.sideBarEnabled,
    };
    saveState(this.chapterId, data);
    saveAchieves(this.gameId, this.state.achieves);
  }

  get storyWhere(): number { return this.state.storyWhere; }
  set storyWhere(v: number) { this.state.storyWhere = v; }
  get nextStory(): boolean { return this.state.nextStory; }
  set nextStory(v: boolean) { this.state.nextStory = v; }
  get accessGiven(): boolean { return this.state.accessGiven; }
  set accessGiven(v: boolean) { this.state.accessGiven = v; }
  get sideBarEnabled(): boolean { return this.state.sideBarEnabled; }
  set sideBarEnabled(v: boolean) { this.state.sideBarEnabled = v; }
  get achieves(): string[] { return this.state.achieves; }
  get isAsking(): boolean { return this.asking; }

  // ---- Echo content ----
  echoContent(content: string, noSleep = false, delay = 90): void {
    const blocks = parseEchoContent(content);
    const lines = blocksToLines(blocks);
    const effectiveDelay = noSleep ? 0 : delay;

    if (effectiveDelay === 0) {
      for (const line of lines) {
        this.writeLine(line);
      }
    } else {
      this.onLock(true);
      let i = 0;
      const next = () => {
        if (i < lines.length) {
          this.writeLine(lines[i]);
          i++;
          setTimeout(next, effectiveDelay);
        } else {
          this.onLock(false);
        }
      };
      next();
    }
  }

  // ---- Command registration ----
  newCommand(name: string, paramDefs: string[], handler: CommandHandler, storyWhereNeed = 0): void {
    if (typeof name !== 'string') throw new Error('命令名必须为字符串');
    if (!Array.isArray(paramDefs)) paramDefs = [];
    if (typeof handler !== 'function') throw new Error('命令处理函数必须为函数');
    this.commands.set(name, { paramDefs: paramDefs.slice(), handler, storyWhereNeed });
  }

  // ---- Tokenizer ----
  tokenize(str: string): string[] {
    const tokens: string[] = [];
    let cur = '';
    let inQuote = false;
    let quoteChar = '';
    for (const ch of str) {
      if (inQuote) {
        if (ch === quoteChar) {
          inQuote = false;
          quoteChar = '';
          tokens.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"' || ch === "'") {
          inQuote = true;
          quoteChar = ch;
        } else if (/\s/.test(ch)) {
          if (cur !== '') { tokens.push(cur); cur = ''; }
        } else {
          cur += ch;
        }
      }
    }
    if (cur !== '') tokens.push(cur);
    return tokens;
  }

  // ---- Execute a command line ----
  async executeLine(rawLine: string): Promise<void> {
    if (this.asking) {
      this.handleAskResponse(rawLine);
      return;
    }

    if (!rawLine.trim()) return;

    // Echo the command
    this.writeLine({ segments: [{ text: `$ ${rawLine}` }] });
    this.state.history.push(rawLine);

    const tokens = this.tokenize(rawLine);
    const cmd = tokens.shift()!;
    const entry = this.commands.get(cmd);

    if (!entry) {
      this.writeLine({ segments: [{ text: `Command not found: ${cmd}` }] });
      this.persist();
      return;
    }

    if (entry.storyWhereNeed > this.state.storyWhere) {
      this.writeLine({ segments: [{ text: `Command not found: ${cmd}` }] });
      this.persist();
      return;
    }

    try {
      const api: CommandAPI = {
        args: tokens.slice(),
        context: this.state.contextVars,
        echo: this.echoContent.bind(this),
        save: () => this.persist(),
        setVar: (k, v) => { this.state.contextVars[k] = v; },
        getVar: (k) => this.state.contextVars[k],
        storyWhere: this.state.storyWhere,
        nextStory: this.state.nextStory,
        setStoryWhere: (v) => { this.state.storyWhere = v; },
        setNextStory: (v) => { this.state.nextStory = v; },
      };

      const result = await entry.handler(api);
      if (typeof result === 'string' && result.startsWith('nextSTEP')) {
        this.state.nextStory = true;
        this.state.storyWhere++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.writeLine({ segments: [{ text: `命令执行出错: ${msg}` }] });
    }

    this.persist();
  }

  // ---- Ask system ----
  ask(prompt: string, callback: (response: string) => void): void {
    if (typeof prompt !== 'string') throw new Error('提示文本必须是字符串');
    if (typeof callback !== 'function') throw new Error('回调函数必须是函数');
    this.asking = true;
    this.askCallback = callback;
    this.echoContent(prompt);
  }

  private handleAskResponse(response: string): void {
    if (this.askCallback) {
      const cb = this.askCallback;
      this.askCallback = null;
      this.asking = false;
      cb(response);
    }
  }

  // ---- Achievement system ----
  addAchieve(name: string, level: string): void {
    const achieve = `[ ${level} ] ${name}`;
    this.echoContent(`[ 成就 ] 「 ${level} 」 ${name} 获得。`);
    this.state.achieves.push(achieve);
    this.persist();
  }

  lookAchieves(): void {
    this.echoContent('doas -su mylife.root - 成就系统 所有成就');
    for (const a of this.state.achieves) {
      this.echoContent(a);
    }
  }

  // ---- Clear output ----
  clear(): void {
    this.onClear();
  }

  // ---- WebTry: open browser to local page ----
  async loadWebTry(pageId: string): Promise<void> {
    try {
      await webServer.start();
      this.echoContent(`[ WEBTRY ] 正在打开浏览器: ${webServer.url}/webtry.html?pageid=${pageId}`, true);
      webServer.openBrowser(`/webtry.html?pageid=${pageId}`);
    } catch (err) {
      this.echoContent(`[ ERROR ] 无法启动 WebTry 服务: ${err}`, true);
    }
  }

  // ---- Capturer: open browser to capturer page ----
  async loadCapturer(ip: string, sender: string, more: string): Promise<void> {
    try {
      await webServer.start();
      webServer.setCapturerData(ip, sender, more);
      const encodedMore = encodeURIComponent(more);
      this.echoContent(`[ CAPTURER ] 正在打开抓包器: ${webServer.url}/capturer.html?ip=${ip}&sender=${encodeURIComponent(sender)}`, true);
      webServer.openBrowser(`/capturer.html?ip=${encodeURIComponent(ip)}&sender=${encodeURIComponent(sender)}&more=${encodedMore}`);
    } catch (err) {
      this.echoContent(`[ ERROR ] 无法启动 Capturer 服务: ${err}`, true);
    }
  }

  // ---- Panel (sidebar in Ink) ----
  showPanel(): void {
    this.panelStatus.visible = !this.panelStatus.visible;
    this.onPanel({ ...this.panelStatus });
  }

  updateStatus(
    ip = '127.0.0.1',
    ports = '22',
    mem = '739MiB',
    cucontent = '',
    _extra = '',
  ): void {
    this.panelStatus.ip = ip;
    this.panelStatus.ports = ports;
    this.panelStatus.mem = mem;
    this.panelStatus.extra = cucontent;
    this.onPanel({ ...this.panelStatus });
    this.echoContent(`[ STATUS ] IP: ${ip}  Ports: ${ports}  Mem: ${mem}  ${cucontent}`);
  }

  updateHelp(content: string): void {
    this.echoContent(`[ HELP ] ${content.replace(/<br\/>/g, '\n')}`);
  }

  // ---- Countdown stub (CSS in web, simple text in CLI) ----
  gocountdown(callback: () => void, _duration = 3): void {
    this.echoContent('[ COUNTDOWN ] 倒计时中...');
    setTimeout(callback, _duration * 1000);
  }

  // ---- Base64 (Node.js Buffer instead of jQuery) ----
  static base64Encode(str: string): string {
    return Buffer.from(str, 'utf-8').toString('base64');
  }

  static base64Decode(str: string): string {
    return Buffer.from(str, 'base64').toString('utf-8');
  }

  _goExit(): void {
    this.onExit();
  }
}
