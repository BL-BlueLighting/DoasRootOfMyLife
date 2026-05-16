// doas -su mylife.root - File-based storage (replaces localStorage)
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const SAVE_DIR = path.join(os.homedir(), '.doas-root-of-mylife');

function ensureDir(): void {
  if (!fs.existsSync(SAVE_DIR)) {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
  }
}

export interface SaveData {
  history: string[];
  variables: Record<string, unknown>;
  storyWhere: number;
  nextStory: boolean;
  accessGiven: boolean;
  sideBarEnabled: boolean;
  currentDir: string;
}

export interface ProfileData {
  username: string;
  hostname: string;
}

export function loadState(chapterId: string): SaveData | null {
  ensureDir();
  const filePath = path.join(SAVE_DIR, `save-${chapterId}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveState(chapterId: string, data: SaveData): void {
  ensureDir();
  const filePath = path.join(SAVE_DIR, `save-${chapterId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Achievement storage
export function loadAchieves(gameId: string): string[] {
  ensureDir();
  const filePath = path.join(SAVE_DIR, `achieves-${gameId}.json`);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAchieves(gameId: string, achieves: string[]): void {
  ensureDir();
  const filePath = path.join(SAVE_DIR, `achieves-${gameId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(achieves, null, 2), 'utf-8');
}

// Global user profile (shared across all chapters)
export function loadProfile(): ProfileData | null {
  ensureDir();
  const filePath = path.join(SAVE_DIR, 'profile.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

export function saveProfile(profile: ProfileData): void {
  ensureDir();
  const filePath = path.join(SAVE_DIR, 'profile.json');
  fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf-8');
}

// Custom files

export function checkDirectoryOfCustomFiles(): boolean | null {
  const dirPath = path.join(SAVE_DIR, 'files');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return null;
  }
  return true;
}

export function createDirectoriesFromPath(filePath: string): boolean | null {
  // split filename and directories
  const parts = filePath.split('/').filter(p => p);
  const dirs = parts.slice(0, -1);
  let currentPath = path.join(SAVE_DIR, 'files');
  for (const dir of dirs) {
    currentPath = path.join(currentPath, dir);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  }
  return true;
}

export function readFile(filePath: string): string | null {
  checkDirectoryOfCustomFiles();
  const absPath = path.join(SAVE_DIR, 'files', filePath);
  if (!fs.existsSync(absPath)) return null;
  return fs.readFileSync(absPath, 'utf-8');
}

export function writeFile(filePath: string, content: string): void {
  checkDirectoryOfCustomFiles();
  createDirectoriesFromPath(filePath);
  const absPath = path.join(SAVE_DIR, 'files', filePath);
  fs.writeFileSync(absPath, content, 'utf-8');
}