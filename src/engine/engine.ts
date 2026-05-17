// doas -su mylife.root - Core Engine
// Port of base.js to TypeScript for CLI

import { parseEchoContent, blocksToLines, OutputLine, OutputBlock } from './parser.js';
import { loadState, saveState, loadAchieves, saveAchieves, loadProfile, saveProfile, SaveData, ProfileData, readFile as storageReadFile, writeFile as storageWriteFile } from './storage.js';
import { webServer } from './webserver.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
  currentDir: string;
}

export interface PanelStatus {
  visible: boolean;
  ip: string;
  ports: string;
  mem: string;
  extra: string;
}

export type FileContent = string | ((engine: GameEngine) => void | string | Promise<void | string>);

export interface FileEntry {
  content: FileContent;
  storyWhereMin: number;
  storyWhereMax?: number;
}

type WriteLineFn = (line: OutputLine) => void;
type WriteBlockFn = (block: OutputBlock) => void;
type AskFn = (prompt: string, callback: (response: string) => void) => void;
type LockInputFn = (locked: boolean) => void;
type ExitProgramFn = () => void;
type ClearOutputFn = () => void;
type PanelUpdateFn = (status: PanelStatus) => void;
type PromptUpdateFn = (prompt: string) => void;

export class GameEngine {
  private commands = new Map<string, CommandEntry>();
  private state: GameState;
  private chapterId: string;
  private gameId: string;
  private asking = false;
  private askCallback: ((response: string) => void) | null = null;
  private echoDelay = 30;
  public readFile = storageReadFile;
  public writeFile = storageWriteFile;

  // Story conditions (shared with loader so cheat commands can modify them)
  public conditions = new Map<string, boolean | number | string>();

  // Cheat system
  private cheatActive = false;
  private originalStoryWhere: number | null = null;

  // UI callbacks
  private onWrite: WriteLineFn = () => {};
  private onAsk: AskFn = () => {};
  private onLock: LockInputFn = () => {};
  private onClear: ClearOutputFn = () => {};
  private onExit: ExitProgramFn = () => {};
  private onPanel: PanelUpdateFn = () => {};
  private onPrompt: PromptUpdateFn = () => {};
  private callbacksSet = false;
  private pendingLines: OutputLine[] = [];

  // User profile (global across chapters)
  private profile: ProfileData = { username: '', hostname: 'humanos' };

  // Virtual filesystem tree
  private dirTree: Record<string, string[]> = {
    '/': ['home', 'etc', 'tmp', 'var'],
    '/home': [],
    '/etc': ['hosts', 'passwd'],
    '/tmp': [],
    '/var': ['log', 'run'],
    '/var/log': [],
    '/var/run': [],
  };

  // Virtual file contents
  private fileContents: Record<string, FileEntry> = {};

  // Restricted directories (ls/cd will show "Permission denied")
  private restrictedDirs: Set<string> = new Set();

  // HostProxy: mounts ~/.doas-root-of-mylife/files/ → ~/hostProxy in virtual FS
  private hostProxyMounted = false;
  private hostProxyRealDir: string;
  private hostProxyVirtualPath: string;

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
      currentDir: '~',
    };
    this.hostProxyRealDir = path.join(os.homedir(), '.doas-root-of-mylife', 'files');
    this.hostProxyVirtualPath = '';

    // Load global profile
    const profile = loadProfile();
    if (profile) {
      this.profile = profile;
      // Ensure home dir exists in tree
      const homeDir = `/home/${this.profile.username}`;
      if (!this.dirTree['/home'].includes(this.profile.username)) {
        this.dirTree['/home'].push(this.profile.username);
      }
      if (!this.dirTree[homeDir]) {
        this.dirTree[homeDir] = ['documents', 'downloads', 'projects'];
        this.dirTree[`${homeDir}/documents`] = [];
        this.dirTree[`${homeDir}/downloads`] = [];
        this.dirTree[`${homeDir}/projects`] = [];
      }
    }

    // Public file API
    this.readFile = storageReadFile;
    this.writeFile = storageWriteFile;

    // Check for cheat activation file
    this.checkDevelopFile();
    this.registerCheatCommand();
  }

  // ---- Cheat system ----

  checkDevelopFile(): void {
    const developPath = path.join(os.homedir(), '.doas-root-of-mylife', '.develop');
    this.cheatActive = fs.existsSync(developPath);
  }

  get isCheatActive(): boolean { return this.cheatActive; }

  private registerCheatCommand(): void {
    this.newCommand('/cheat', ['subcommand', 'arg1', 'arg2', 'arg3'], (api) => {
      if (!this.cheatActive) {
        api.echo('/CHEAT: .develop file not found. Cheat mode is disabled.', true);
        return;
      }

      const sub = api.args[0];
      const a1 = api.args[1];
      const a2 = api.args[2];
      const rest = api.args.slice(3).join(' ');

      if (sub === 'set' && (a1 === 'storyWhere' || a1 === 'storywhere')) {
        const val = parseInt(a2, 10);
        if (isNaN(val)) {
          api.echo('/CHEAT: Invalid storyWhere value.', true);
          return;
        }
        if (this.originalStoryWhere === null) {
          this.originalStoryWhere = this.state.storyWhere;
        }
        this.state.storyWhere = val;
        api.echo(`/CHEAT: storyWhere set to ${val} (original saved: ${this.originalStoryWhere}).`, true);
        return;
      }

      if (sub === 'open') {
        if (a1 === 'webTry' || a1 === 'webtry') {
          const pageId = a2 || '1004';
          this.loadWebTry(pageId);
          api.echo(`/CHEAT: Opening webTry page: ${pageId}`, true);
          return;
        }
        if (a1 === 'capturer') {
          this.loadCapturer('127.0.0.1', 'Cheat', a2 || '');
          api.echo(`/CHEAT: Opening capturer.`, true);
          return;
        }
      }

      if (sub === 'set' && a1 === 'custom') {
        if (!a2) {
          api.echo('/CHEAT: Missing condition name. Usage: /cheat set custom <name> <value>', true);
          return;
        }
        this.conditions.set(a2, rest);
        api.echo(`/CHEAT: Condition '${a2}' set to '${rest}'.`, true);
        return;
      }

      if (sub === 'view') {
        if (a1 === 'webtry' || a1 === 'webtries') {
          const pages = webServer.listWebTryPages();
          if (pages.length === 0) {
            api.echo('/CHEAT: No webtry pages available.', true);
          } else {
            api.echo(`/CHEAT: WebTry pages (${pages.length}):`, true);
            for (const id of pages) {
              api.echo(`  ${id}.html`, true);
            }
          }
          return;
        }
        if (a1 === 'capturer') {
          const cd = webServer.getCapturerData();
          api.echo('/CHEAT: Capturer data:', true);
          api.echo(`  IP:     ${cd.ip || '(none)'}`, true);
          api.echo(`  Sender: ${cd.sender || '(none)'}`, true);
          api.echo(`  More:   ${cd.more || '(none)'}`, true);
          return;
        }
        // Default: view all state
        api.echo('/CHEAT — Current state:', true);
        api.echo(`  storyWhere:  ${this.state.storyWhere} (original: ${this.originalStoryWhere ?? 'N/A'})`, true);
        api.echo(`  cheatActive: ${this.cheatActive}`, true);
        api.echo(`  chapterId:   ${this.chapterId}`, true);
        api.echo(`  currentDir:  ${this.state.currentDir}`, true);
        if (this.conditions.size > 0) {
          api.echo('  Conditions:', true);
          for (const [k, v] of this.conditions) {
            api.echo(`    ${k} = ${v}`, true);
          }
        }
        const pages = webServer.listWebTryPages();
        api.echo(`  WebTry pages: ${pages.length > 0 ? pages.join(', ') : '(none)'}`, true);
        return;
      }

      if (sub === 'reboot') {
        api.echo('/CHEAT: Rebooting program...', true);
        setTimeout(() => this._goExit(), 500);
        return;
      }

      // Help
      api.echo('/CHEAT — Available subcommands:', true);
      api.echo('  /cheat view                          (show all current state)', true);
      api.echo('  /cheat view webtries                 (list all webtry pages)', true);
      api.echo('  /cheat view capturer                 (show capturer data)', true);
      api.echo('  /cheat set storyWhere <number>       (saves original, sets new)', true);
      api.echo('  /cheat open webTry <pageId>          (open webtry page)', true);
      api.echo('  /cheat open capturer <pageId>        (open capturer)', true);
      api.echo('  /cheat set custom <name> <value>     (set story condition)', true);
      api.echo('  /cheat reboot                        (restart program)', true);
    }, 0);
  }

  // Wire up UI callbacks
  setCallbacks(
    write: WriteLineFn,
    ask: AskFn,
    lock: LockInputFn,
    clear: ClearOutputFn,
    exit: ExitProgramFn,
    panel?: PanelUpdateFn,
    prompt?: PromptUpdateFn,
  ): void {
    this.onWrite = write;
    this.onAsk = ask;
    this.onLock = lock;
    this.onClear = clear;
    this.onExit = exit;
    if (panel) this.onPanel = panel;
    if (prompt) this.onPrompt = prompt;
    this.callbacksSet = true;
    // Flush pending output
    for (const line of this.pendingLines) {
      this.onWrite(line);
    }
    this.pendingLines = [];
    // Push initial prompt
    this.pushPrompt();
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
      this.state.currentDir = data.currentDir || '~';
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
      currentDir: this.state.currentDir,
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
  get username(): string { return this.profile.username || 'yourself'; }
  get hostname(): string { return this.profile.hostname || 'humanos'; }
  get currentDir(): string { return this.state.currentDir; }

  // ---- Profile ----
  get isProfileSet(): boolean {
    return !!this.profile.username;
  }

  buildPrompt(): string {
    const user = this.username;
    const host = this.hostname;
    const dir = this.state.currentDir;
    return `${user}@${host}:${dir}$ `;
  }

  private pushPrompt(): void {
    if (this.callbacksSet) {
      this.onPrompt(this.buildPrompt());
    }
  }

  /** Ensure profile is set. If not, asks the player for username/hostname. */
  async ensureProfile(): Promise<void> {
    if (this.isProfileSet) {
      this.ensureHomeDir();
      this.pushPrompt();
      return;
    }

    // Ask for username
    const oldUsername = this.profile.username;
    await new Promise<void>((resolve) => {
      this.echoContent('Please complete Setup.', true);
      this.echoContent("[color: #00eeff]Step 1.[/endcolor] Setup your name and hostname", true);
      this.ask('What\'s your name?', (answer) => {
        const name = answer.trim() || 'ropicstu';
        this.profile.username = name;
        this.ensureHomeDir();
        this.rehomeFiles(oldUsername);
        saveProfile(this.profile);
        this.pushPrompt();
        resolve();
      });
    });

    // Ask for hostname
    await new Promise<void>((resolve) => {
      this.ask('What\'s your brain name?', (answer) => {
        this.profile.hostname = answer.trim() || 'humanos';
        saveProfile(this.profile);
        this.pushPrompt();
        this.echoContent(`[color: #0f0]Step 1 completed.[/endcolor]\nYour device(brain): ${this.username}@${this.hostname}`, true);
      });
      this.echoContent("Hold down, We are setting your device(brain)...", true);
      // wait 5 seconds
      setTimeout(() => {
        this.echoContent(`Welcome, ${this.username}!`, true);
        this.echoContent("    - Everything is setup.", true);
        this.echoContent("    - HumanOS Version: 6.0.0", true);
        this.echoContent("    - Enjoy.", true);
        this.echoContent("Copyright (c) 2026 BL.BlueLighting", true);
        this.ask('Enter, then continue', (answer) => {
          resolve();
        })
      }, 5000);
    });
  }

  private ensureHomeDir(): void {
    const homeDir = `/home/${this.profile.username}`;
    if (!this.dirTree['/home'].includes(this.profile.username)) {
      this.dirTree['/home'].push(this.profile.username);
    }
    if (!this.dirTree[homeDir]) {
      this.dirTree[homeDir] = ['documents', 'downloads', 'projects'];
      this.dirTree[`${homeDir}/documents`] = [];
      this.dirTree[`${homeDir}/downloads`] = [];
      this.dirTree[`${homeDir}/projects`] = [];
    }
    // Re-mount hostProxy in case the home path changed
    this.mountHostProxy();
  }

  // Move files from old home dir to new home dir after profile name change
  rehomeFiles(oldUsername: string): void {
    const newHome = `/home/${this.profile.username}`;
    const oldHome = `/home/${oldUsername || 'yourself'}`;
    if (oldHome === newHome) return;
    // Copy files from old home to new home
    for (const [path, entry] of Object.entries(this.fileContents)) {
      if (path.startsWith(oldHome + '/')) {
        const newPath = newHome + path.slice(oldHome.length);
        this.fileContents[newPath] = entry;
        delete this.fileContents[path];
      }
    }
    // Move dir listings
    const oldEntries = this.dirTree[oldHome];
    if (oldEntries && this.dirTree[newHome]) {
      for (const entry of oldEntries) {
        if (!this.dirTree[newHome].includes(entry)) {
          this.dirTree[newHome].push(entry);
        }
      }
    }
  }

  // ---- Directory system ----
  resolvePath(raw: string): string {
    if (!raw || raw === '~') return `/home/${this.profile.username || 'yourself'}`;
    if (raw === '/') return '/';
    if (raw === '-') return this.state.currentDir;

    let base: string;
    let rest: string;
    if (raw.startsWith('/')) {
      base = '/';
      rest = raw.slice(1);
    } else if (raw.startsWith('~')) {
      base = `/home/${this.profile.username || 'yourself'}`;
      rest = raw.startsWith('~/') ? raw.slice(2) : raw.slice(1);
    } else {
      base = this.state.currentDir === '~'
        ? `/home/${this.profile.username || 'yourself'}`
        : this.state.currentDir;
      rest = raw;
    }

    const parts = rest.split('/').filter(Boolean);
    for (const part of parts) {
      if (part === '..') {
        if (base === '/') continue;
        base = base.substring(0, base.lastIndexOf('/')) || '/';
      } else if (part === '.') {
        // stay
      } else {
        const candidate = base === '/' ? `/${part}` : `${base}/${part}`;
        if (this.dirTree[base]?.includes(part) && this.dirTree[candidate]) {
          base = candidate;
        } else {
          return ''; // path not found
        }
      }
    }
    return base;
  }

  cd(raw: string): string | null {
    const resolved = this.resolvePath(raw || '~');
    if (!resolved) return null;
    this.state.currentDir = this.toShortPath(resolved);
    this.pushPrompt();
    return this.state.currentDir;
  }

  private toShortPath(absPath: string): string {
    const homeDir = `/home/${this.profile.username || 'yourself'}`;
    if (absPath === homeDir || absPath.startsWith(homeDir + '/')) {
      return '~' + absPath.slice(homeDir.length);
    }
    return absPath;
  }

  ls(dir?: string): string[] {
    const target = dir ? this.resolvePath(dir) : this.state.currentDir;
    const absTarget = target === '~'
      ? `/home/${this.profile.username || 'yourself'}`
      : target;
    if (!absTarget) return [];
    // HostProxy: list real filesystem
    if (this.isHostProxyPath(absTarget)) {
      return this.listHostProxy(this.getHostProxySubPath(absTarget));
    }
    if (!this.dirTree[absTarget]) return [];
    const entries = [...this.dirTree[absTarget]];
    // Add files from fileContents that match storyWhere
    for (const [filePath, entry] of Object.entries(this.fileContents)) {
      const parentDir = filePath.substring(0, filePath.lastIndexOf('/')) || '/';
      if (parentDir !== absTarget) continue;
      const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
      if (entries.includes(fileName)) continue;
      if (entry.storyWhereMin > this.state.storyWhere) continue;
      if (entry.storyWhereMax !== undefined && entry.storyWhereMax < this.state.storyWhere) continue;
      entries.push(fileName);
    }
    return entries;
  }

  pwd(): string {
    return this.state.currentDir;
  }

  // Resolve a file path for cat/read operations
  resolveFilePath(raw: string): string {
    if (!raw) return '';
    if (raw.startsWith('/')) return raw;
    if (raw.startsWith('~')) {
      const homeDir = `/home/${this.profile.username || 'yourself'}`;
      return raw === '~' ? homeDir : `${homeDir}/${raw.slice(2)}`;
    }
    const base = this.state.currentDir === '~'
      ? `/home/${this.profile.username || 'yourself'}`
      : this.state.currentDir;
    return base === '/' ? `/${raw}` : `${base}/${raw}`;
  }

  // Add a file to the virtual filesystem (supports ~/ prefix for home-relative paths)
  addFile(path: string, content: FileContent, storyWhereMin = 0, storyWhereMax?: number): void {
    const resolvedPath = path.startsWith('~/') ? this.resolveFilePath(path) : path;
    // Ensure parent directory exists
    const parentDir = resolvedPath.substring(0, resolvedPath.lastIndexOf('/')) || '/';
    if (!this.dirTree[parentDir]) {
      this.mkdirP(parentDir);
    }
    this.fileContents[resolvedPath] = { content, storyWhereMin, storyWhereMax };
  }

  // Read a file from the virtual filesystem (respects storyWhere)
  catFile(rawPath: string): { content: FileContent; entry: FileEntry } | null {
    const resolved = this.resolveFilePath(rawPath);
    if (!resolved) return null;
    // HostProxy: read from real filesystem
    if (this.isHostProxyPath(resolved)) {
      const subPath = this.getHostProxySubPath(resolved);
      if (!subPath) return null; // can't cat a directory
      const content = this.readHostProxy(subPath);
      if (content === null) return null;
      return { content, entry: { content, storyWhereMin: 0 } };
    }
    const entry = this.fileContents[resolved];
    if (!entry) return null;
    if (entry.storyWhereMin > this.state.storyWhere) return null;
    if (entry.storyWhereMax !== undefined && entry.storyWhereMax < this.state.storyWhere) return null;
    return { content: entry.content, entry };
  }

  // Ensure a directory path exists
  private mkdirP(absPath: string): void {
    if (this.dirTree[absPath]) return;
    const parts = absPath.split('/').filter(Boolean);
    let current = '/';
    for (const part of parts) {
      const next = current === '/' ? `/${part}` : `${current}/${part}`;
      if (!this.dirTree[current]) this.dirTree[current] = [];
      if (!this.dirTree[current].includes(part)) {
        this.dirTree[current].push(part);
      }
      if (!this.dirTree[next]) this.dirTree[next] = [];
      current = next;
    }
  }

  // Mark a directory as restricted (ls shows "Permission denied", cd is blocked)
  addRestrictedDir(absPath: string): void {
    this.restrictedDirs.add(absPath);
    // Ensure it exists in the tree so it shows up in parent listings
    if (!this.dirTree[absPath]) {
      this.mkdirP(absPath);
    }
  }

  isRestrictedDir(absPath: string): boolean {
    return this.restrictedDirs.has(absPath);
  }

  // ---- HostProxy: mount real ~/.doas-root-of-mylife/files/ → ~/hostProxy ----

  mountHostProxy(): void {
    // Always re-resolve in case the profile (home path) has changed
    const newPath = this.resolveFilePath('~/hostProxy');
    if (newPath !== this.hostProxyVirtualPath) {
      this.hostProxyVirtualPath = newPath;
      this.hostProxyMounted = false;
    }
    if (this.hostProxyMounted) return;
    // Ensure the virtual directory exists
    if (!this.dirTree[this.hostProxyVirtualPath]) {
      this.mkdirP(this.hostProxyVirtualPath);
    }
    // Ensure the real directory exists
    if (!fs.existsSync(this.hostProxyRealDir)) {
      fs.mkdirSync(this.hostProxyRealDir, { recursive: true });
    }
    this.hostProxyMounted = true;
  }

  private isHostProxyPath(absPath: string): boolean {
    if (!this.hostProxyMounted) return false;
    return absPath === this.hostProxyVirtualPath || absPath.startsWith(this.hostProxyVirtualPath + '/');
  }

  private getHostProxySubPath(absPath: string): string {
    if (absPath === this.hostProxyVirtualPath) return '';
    return absPath.slice(this.hostProxyVirtualPath.length + 1);
  }

  private listHostProxy(subPath: string): string[] {
    const dirPath = subPath
      ? path.join(this.hostProxyRealDir, subPath)
      : this.hostProxyRealDir;
    if (!fs.existsSync(dirPath)) return [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    // Exclude archived_files directory
    return entries
      .filter(e => !(e.isDirectory() && e.name === 'archived_files'))
      .map(e => e.isDirectory() ? e.name + '/' : e.name);
  }

  private readHostProxy(subPath: string): string | null {
    // Block access to archived_files
    if (subPath.includes('archived_files')) return null;
    return storageReadFile(subPath);
  }

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

  cheating(tokens: string[]): void {
    // enable cheat of this archive
    if (tokens[0] === 'enable') {
      this.ask('Enter to enable cheating?', (answer) => {
        if (answer.trim().toLowerCase() === 'yes') {
          this.state.contextVars['cheatEnabled'] = true;
          this.echoContent('Cheating enabled. Use with caution!', true);
        } else {
          this.echoContent('Cheating not enabled.', true);
        }
      });
    }

    // set storyWhere
    if (tokens[0] === 'setStoryWhere' && this.state.contextVars['cheatEnabled']) {
      const value = parseInt(tokens[1], 10);
      if (!isNaN(value)) {
        this.state.storyWhere = value;
        this.echoContent(`Story position set to ${value}.`, true);
      } else {
        this.echoContent('Invalid story position.', true);
      }
    }

    // set custom
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

    // ---- exit (always built-in) ----
    if (cmd === 'exit') {
      this.onExit();
      return;
    }

    // ---- Chapter commands (checked first so chapters can override built-ins) ----
    const entry = this.commands.get(cmd);

    if (entry && entry.storyWhereNeed <= this.state.storyWhere) {
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
      return;
    }

    // ---- Built-in directory commands (fallback) ----
    if (cmd === 'cd') {
      const target = tokens[0] || '~';
      const resolved = this.resolvePath(target);
      if (resolved && this.isRestrictedDir(resolved)) {
        this.writeLine({ segments: [{ text: `cd: permission denied: ${target}` }] });
        this.persist();
        return;
      }
      const result = this.cd(target);
      if (result === null) {
        this.writeLine({ segments: [{ text: `cd: no such directory: ${target}` }] });
      }
      this.persist();
      return;
    }

    if (cmd === 'pwd') {
      this.writeLine({ segments: [{ text: this.pwd() }] });
      this.persist();
      return;
    }

    if (cmd === 'ls') {
      const target = tokens[0];
      const absTarget = target
        ? this.resolvePath(target)
        : (this.state.currentDir === '~'
          ? `/home/${this.profile.username || 'yourself'}`
          : this.state.currentDir);
      if (absTarget && this.isRestrictedDir(absTarget)) {
        this.writeLine({ segments: [{ text: 'Permission denied.' }] });
        this.persist();
        return;
      }
      const entries = this.ls(target);
      if (entries.length === 0) {
        this.writeLine({ segments: [{ text: '(empty)' }] });
      } else {
        const dirList = entries.map((e) => {
          const candidate = absTarget ? `${absTarget}/${e}` : '';
          const isDir = candidate && this.dirTree[candidate] !== undefined;
          return isDir ? `[color: #87ceeb]${e}[/endcolor]` : e;
        });
        this.echoContent(dirList.join('  '), true);
      }
      this.persist();
      return;
    }

    // ---- Built-in clear ----
    if (cmd === 'clear') {
      this.clear();
      this.persist();
      return;
    }

    // ---- Built-in cat ----
    if (cmd === 'cat') {
      const target = tokens[0];
      if (!target) {
        this.writeLine({ segments: [{ text: 'cat: missing file operand' }] });
        this.persist();
        return;
      }
      const result = this.catFile(target);
      if (!result) {
        this.writeLine({ segments: [{ text: `cat: ${target}: No such file or directory` }] });
      } else if (typeof result.content === 'function') {
        const ret = await result.content(this);
        if (typeof ret === 'string') {
          this.echoContent(ret);
        }
      } else {
        this.echoContent(result.content);
      }
      this.persist();
      return;
    }

    // ---- Built-in sha256sum ----
    if (cmd === 'sha256sum') {
      const target = tokens[0];
      if (!target) {
        this.writeLine({ segments: [{ text: 'sha256sum: missing file operand' }] });
        this.persist();
        return;
      }
      const hash = this.sha256File(target);
      if (hash === null) {
        this.writeLine({ segments: [{ text: `sha256sum: ${target}: No such file or directory` }] });
      } else {
        this.writeLine({ segments: [{ text: `${hash}  ${target}` }] });
      }
      this.persist();
      return;
    }

    // Command not found
    this.writeLine({ segments: [{ text: `Command not found: ${cmd}` }] });
    this.persist();
  }

  // ---- Ask system ----
  ask(prompt: string, callback: (response: string) => void): void {
    if (typeof prompt !== 'string') throw new Error('提示文本必须是字符串');
    if (typeof callback !== 'function') throw new Error('回调函数必须是函数');
    this.asking = true;
    this.askCallback = callback;
    this.onAsk(prompt, (response: string) => {
      this.asking = false;
      this.askCallback = null;
      callback(response);
    });
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

  // ---- SHA256 ----
  static sha256(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf-8').digest('hex');
  }

  /** Compute SHA256 of a file. Returns hash string or null if file not found. */
  sha256File(filePath: string): string | null {
    const result = this.catFile(filePath);
    if (!result) return null;
    let content: string;
    if (typeof result.content === 'function') {
      const ret = result.content(this);
      if (ret instanceof Promise) return null; // async not supported for hash
      content = ret || '';
    } else {
      content = result.content;
    }
    return GameEngine.sha256(content);
  }

  _goExit(): void {
    this.onExit();
  }
}
