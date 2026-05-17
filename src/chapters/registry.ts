// Static chapter registry — story data imported as text + static script imports
// Bun bundles text imports into the compiled executable

import { GameEngine } from '../engine/engine.js';
import { registerScripts as registerPre } from './storyFiles/pre.js';
import { registerScripts as registerFirst } from './storyFiles/first.js';
import { registerScripts as registerSecond } from './storyFiles/second.js';
import preStory from './storyFiles/pre.doasStory';
import firstStory from './storyFiles/first.doasStory';
import secondStory from './storyFiles/second.doasStory';

export interface ChapterInfo {
  id: string;
  name: string;
  description: string;
  gameId: string;
  storySource: string;
}

export const CHAPTERS: ChapterInfo[] = [
  {
    id: 'pre',
    name: '序章 - 意外而来',
    description: '你从昏迷中醒来，发现自己处于 Emergency Mode (应急恢复模式，又称 CLI Mode)，与 manAI 拯救你自己。',
    gameId: 'pre',
    storySource: preStory,
  },
  {
    id: 'first',
    name: '第一章 - 探索空间',
    description: '放假了，和老朋友 manAI 叙叙旧，学学最简单的 SQL 注入。',
    gameId: '1',
    storySource: firstStory,
  },
  {
    id: 'second',
    name: '第二章 - 核心损坏: manAI',
    description: 'manAI 核心损坏，你需要学会独自修复它。',
    gameId: '2',
    storySource: secondStory,
  },
];

export const SCRIPT_REGISTRY = new Map<string, (engine: GameEngine) => void>([
  ['pre', registerPre],
  ['first', registerFirst],
  ['second', registerSecond],
]);
