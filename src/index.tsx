// doas -su mylife.root - CLI Entry Point

import React, { useState } from 'react';
import { render, Box, Text, useInput } from 'ink';
import { GameEngine } from './engine/engine.js';
import { App } from './components/App.js';
import { parseStory } from './story/parser.js';
import { loadStory } from './story/loader.js';
import {
  runCountdown, runBase64, runPermission, runPandorabox, runCapture,
  runMpm, runDebug, runWebtry, runCheck, runDecryptKey,
  runManAICorrupted, runLsAuth, runCdAuth, runChmod, runCheckdata,
  resetFirstChapter,
} from './story/scripts.js';
import { StoryFile } from './story/types.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BOOT_TEXT = `HumanOS Core v6.15.3
:: Pulling humand

:: HumanDaemon v6235.33.12
[ OK ] Ready to initialize.

[ WAIT ] Loading base service...
[ SUCCESS ] Successfully to load base services.

[ WAIT ] Trying to connect brainet...
[ WARNING ] Your connection to brainet is not safety.
[ SUCCESS ] Brainet is connected.

[ WAIT ] Pulling humanSchedule

:: HumanSchedule v6233.33.52
[ NONE ] Nothing needs run.

[ WAIT ] Trying to connect HumanBodyManagerService...

:: HumanBMS v52362.22.13
[ SUCCESS ] HumanBMS is launched.
[ WAIT ] Waiting for HumanDaemon...

[ SUCCESS ] HumanDaemon connection client started.
[ INFO ] BIP: brain.humandaemon, Port: 67716.
[ INFO ] Daemon BIP: brain.humanbms.client.hd, Port: 19198, BID: 3265

:: Human Memory Package Manager Service v53621.23.125
[ WAIT ] Waiting for HumanBMS service...
[ SUCCESS ] HMPMS is launched with HBMS and HD.
[ INFO ] Hold on...

[ WAIT ] Downloading update package...
[ INFO ] You disabled update skill.
[ INFO ] Update progress will be not launched.

[ SUCCESS ] HMPMS is loaded.

:: HumanSystemInitializingModule started.
[ INFO ] HSIM started.
[ WAIT ] Trying to pull ui to user...
[ FAILED ] EyeService not launch or corrupt.
[ INFO ] HSIM Work finished.

:: System Initialized. Welcome to HumanOS! ::`;

// Load story file — try project root first, then src/story/
const storyPath = (() => {
  const cwd = process.cwd();
  const paths = [
    resolve(cwd, 'story.doasStory'),
    resolve(cwd, 'src', 'story', 'story.doasStory'),
    resolve(__dirname, 'story', 'story.doasStory'),
  ];
  for (const p of paths) {
    try { readFileSync(p); return p; } catch {}
  }
  return paths[1]; // Default to src/story/
})();
let storyFile: StoryFile;
try {
  const source = readFileSync(storyPath, 'utf-8');
  storyFile = parseStory(source);
} catch (err) {
  console.error('Failed to load story file:', storyPath, err);
  process.exit(1);
}

// Chapter metadata
interface ChapterInfo {
  id: string;
  name: string;
  description: string;
  gameId: string;
}

const CHAPTERS: ChapterInfo[] = [
  {
    id: 'pre',
    name: '序章 - 意外而来',
    description: '你从昏迷中醒来，发现自己处于 Emergency Mode (应急恢复模式，又称 CLI Mode)，与 manAI 拯救你自己。',
    gameId: 'pre',
  },
  {
    id: 'first',
    name: '第一章 - 探索空间',
    description: '放假了，和老朋友 manAI 叙叙旧，学学最简单的 SQL 注入。',
    gameId: '1',
  },
  {
    id: 'second',
    name: '第二章 - 核心损坏: manAI',
    description: 'manAI 核心损坏，你需要学会独自修复它。',
    gameId: '2',
  },
];

function ChapterMenu({ onSelect }: { onSelect: (chapter: ChapterInfo) => void }) {
  const [selected, setSelected] = useState(0);

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelected((prev) => (prev - 1 + CHAPTERS.length) % CHAPTERS.length);
    }
    if (key.downArrow) {
      setSelected((prev) => (prev + 1) % CHAPTERS.length);
    }
    if (key.return) {
      onSelect(CHAPTERS[selected]);
    }
  });

  return (
    <Box flexDirection="column" padding={1} borderStyle="double" borderColor="#00ff66">
      <Box marginBottom={1} justifyContent="center">
        <Text bold>
          <Text color="#00ff66">doas</Text>
          <Text color="#888888"> -su </Text>
          <Text color="#87ceeb">mylife.root</Text>
        </Text>
      </Box>
      <Box marginBottom={1} justifyContent="center">
        <Text color="#00ff66">========== SELECT THE CHAPTER ==========</Text>
      </Box>

      {CHAPTERS.map((ch, i) => (
        <Box key={ch.id} marginY={0} justifyContent="center">
          <Text color={i === selected ? '#000' : '#00ff66'} backgroundColor={i === selected ? '#00ff66' : undefined}>
            {i === selected ? ' ▶ ' : '   '}
            {ch.name}
          </Text>
        </Box>
      ))}

      <Box marginTop={1} justifyContent="center">
        <Text color="#555"> ↑ ↓ SELECT，Enter to begin.</Text>
      </Box>
    </Box>
  );
}

function Main() {
  const [chapter, setChapter] = useState<ChapterInfo | null>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);

  const handleSelect = (ch: ChapterInfo) => {
    const eng = new GameEngine(ch.id, ch.gameId);
    eng.load();
    loadStory(eng, storyFile!);

    // Register script-backed commands
    registerChapterScripts(eng, ch.id);

    eng.echoContent('Welcome to HumanOS.', true);
    eng.echoContent('Type [color: #0f0]help[/endcolor] to get started.', true);
    eng.persist();

    setEngine(eng);
    setChapter(ch);
  };

  if (!chapter || !engine) {
    return <ChapterMenu onSelect={handleSelect} />;
  }

  return (
    <App
      engine={engine}
      bootText={BOOT_TEXT}
      onBootComplete={() => {}}
    />
  );
}

// Register script-backed commands for each chapter
function registerChapterScripts(engine: GameEngine, chapterId: string): void {
  // Common scripts
  engine.newCommand('countdown', [], () => {
    const script = storyFile?.scripts.find(s => s.name === 'countdown');
    if (script) runCountdown({ engine, config: script.config });
  }, 3504);

  if (chapterId === 'pre') {
    // Pre chapter scripts are handled above (countdown)
  }

  if (chapterId === 'first') {
    resetFirstChapter();

    engine.newCommand('base64', ['action', 'content'], (api) => {
      runBase64(engine, api.args);
    }, 0);

    engine.newCommand('permission', ['action', 'who', 'group'], () => {
      runPermission(engine);
    }, 0);

    engine.newCommand('pandorabox', ['act', 'act2', 'act3'], (api) => {
      runPandorabox(engine, api.args);
    }, 8);

    engine.newCommand('capture', ['action', 'target'], (api) => {
      runCapture(engine, api.args);
    }, 8);

    engine.newCommand('mpm', ['action', 'more'], (api) => {
      runMpm(engine, api.args);
    }, 6);

    engine.newCommand('debug', ['action', 'setvalue'], (api) => {
      runDebug(engine, api.args);
    }, 0);

    engine.newCommand('webtry', [], () => {
      runWebtry(engine, []);
    }, 0);

    engine.newCommand('1534852388', [], () => {
      runDecryptKey(engine);
    }, 0);

    engine.newCommand('check', ['id'], () => {
      runCheck(engine);
    }, 0);
  }

  if (chapterId === 'second') {
    // Override built-in commands
    engine.newCommand('ls', [], () => {
      runLsAuth(engine);
    }, 0);

    engine.newCommand('cd', ['dir'], (api) => {
      runCdAuth(engine, api.args);
    }, 0);

    // Corrupted manAI (overrides DSL manAI block for this chapter)
    engine.newCommand('manAI', [], () => {
      runManAICorrupted(engine);
    }, 0);

    engine.newCommand('chmod', ['mod', 'file'], (api) => {
      runChmod(engine, api.args);
    }, 0);

    engine.newCommand('checkdata', ['file'], () => {
      runCheckdata(engine);
    }, 0);
  }
}

render(<Main />);
