// doas -su mylife.root - CLI Entry Point

import React, { useState } from 'react';
import { render, Box, Text, useInput } from 'ink';
import { GameEngine } from './engine/engine.js';
import { App } from './components/App.js';
import { registerPreChapter } from './chapters/pre.js';
import { registerFirstChapter } from './chapters/first.js';
import { registerSecondChapter } from './chapters/second.js';

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

interface ChapterInfo {
  id: string;
  name: string;
  description: string;
  gameId: string;
  register: (engine: GameEngine) => void;
}

const CHAPTERS: ChapterInfo[] = [
  {
    id: 'pre',
    name: '序章 - 意外而来',
    description: '你从昏迷中醒来，发现自己处于 Emergency Mode (应急恢复模式，又称 CLI Mode)，与 manAI 拯救你自己。',
    gameId: 'pre',
    register: registerPreChapter,
  },
  {
    id: 'first',
    name: '第一章 - 探索空间',
    description: '放假了，和老朋友 manAI 叙叙旧，学学最简单的 SQL 注入。',
    gameId: '1',
    register: registerFirstChapter,
  },
  {
    id: 'second',
    name: '第二章 - 核心损坏: manAI',
    description: 'manAI 核心损坏，你需要学会独自修复它。',
    gameId: '2',
    register: registerSecondChapter,
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
    setEngine(eng);
    setChapter(ch);
  };

  // Show chapter menu
  if (!chapter || !engine) {
    return <ChapterMenu onSelect={handleSelect} />;
  }

  // Register chapter commands and show boot + game
  chapter.register(engine);

  return (
    <App
      engine={engine}
      bootText={BOOT_TEXT}
      onBootComplete={() => {
        // Boot done, game is ready
      }}
    />
  );
}

render(<Main />);
