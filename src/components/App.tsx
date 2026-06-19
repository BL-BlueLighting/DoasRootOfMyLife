import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { GameEngine, GameState, PanelStatus } from '../engine/engine.js';
import { OutputLine, OutputBlock, OutputSegment } from '../engine/parser.js';

interface AppProps {
  engine: GameEngine;
  bootText: string;
  onBootComplete: () => void;
}

export function App({ engine, bootText, onBootComplete }: AppProps) {
  const { exit } = useApp();
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [input, setInput] = useState('');
  const [locked, setLocked] = useState(false);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const [showBoot, setShowBoot] = useState(true);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);
  const [panel, setPanel] = useState<PanelStatus>({
    visible: false, ip: '127.0.0.1', ports: '22', mem: '739MiB', extra: '',
  });
  const history = useRef<string[]>([]);
  const askCb = useRef<((s: string) => void) | null>(null);

  // ---- Boot animation ----
  useEffect(() => {
    const allLines = bootText.split('\n');
    let i = 0;
    const timer = setInterval(() => {
      if (i < allLines.length) {
        setBootLines(prev => [...prev, allLines[i]]);
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setShowBoot(false);
          setBootDone(true);
          onBootComplete();
        }, 500);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [bootText, onBootComplete]);

  // ---- Wire engine callbacks ----
  useEffect(() => {
    engine.setCallbacks(
      (line: OutputLine) => {
        setLines(prev => [...prev, line]);
      },
      (_prompt: string, cb: (response: string) => void) => {
        askCb.current = cb;
        setLocked(false);
      },
      (l: boolean) => {
        setLocked(l);
      },
      () => {
        setLines([]);
      },
      () => {
        exit();
      },
      (status: PanelStatus) => {
        setPanel({ ...status });
      },
    );
  }, [engine]);

  // ---- Input handling ----
  useInput((inputVal, key) => {
    if (showBoot && !bootDone) return;

    // Handle ask mode
    if (askCb.current) {
      if (key.return) {
        const cb = askCb.current;
        askCb.current = null;
        setInput('');
        cb(input);
      }
      return;
    }

    if (key.return) {
      if (locked) return;
      const cmd = input.trim();
      if (cmd) {
        history.current.push(cmd);
        setHistoryIdx(null);
      }
      setInput('');
      engine.executeLine(cmd);
      return;
    }

    if (key.upArrow) {
      if (history.current.length === 0) return;
      const newIdx = historyIdx === null
        ? history.current.length - 1
        : Math.max(0, historyIdx - 1);
      setHistoryIdx(newIdx);
      setInput(history.current[newIdx]);
      return;
    }

    if (key.downArrow) {
      if (history.current.length === 0) return;
      if (historyIdx === null) return;
      const newIdx = historyIdx + 1;
      if (newIdx >= history.current.length) {
        setHistoryIdx(null);
        setInput('');
      } else {
        setHistoryIdx(newIdx);
        setInput(history.current[newIdx]);
      }
      return;
    }

    if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1));
      return;
    }

    // Regular text input
    if (inputVal && !key.ctrl && !key.meta && !key.tab && !key.escape) {
      setInput(prev => prev + inputVal);
    }
  });

  // Visible lines (last N that fit on screen)
  const maxVisible = process.stdout.rows ? process.stdout.rows - 5 : 20;
  const visibleLines = lines.slice(-maxVisible);

  // Boot screen
  if (showBoot) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box flexDirection="column">
          {bootLines.map((line, i) => (
            <Text key={i} color="#00ff66">{line}</Text>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="row" padding={0}>
      {/* Main terminal area */}
      <Box flexDirection="column" flexGrow={1} padding={0}>
        {/* Header */}
        <Box borderStyle="single" borderColor="#87ceeb" paddingX={1} justifyContent="center">
          <Text bold>
            <Text color="#00ff66">doas</Text>
            <Text color="#888888"> -su </Text>
            <Text color="#87ceeb">mylife.root</Text>
            <Text color="#00ff66"> - HumanOS Terminal</Text>
          </Text>
        </Box>

        {/* Output area */}
        <Box flexDirection="column" height={maxVisible + 2} overflow="hidden">
          {visibleLines.map((line, i) => (
            <Text key={i}>
              {line.segments.map((seg, j) => (
                <Text key={j} color={seg.color || '#888888'}>{seg.text}</Text>
              ))}
            </Text>
          ))}
        </Box>

        {/* Input line */}
        <Box flexDirection="row">
          <Text color="#00ff66">yourself@humanos, ~, $ </Text>
          {locked ? (
            <Text color="#888">== Performing uninterruptable tasks. ==</Text>
          ) : (
            <Text color="#ffffffff">
              {input}
              <Text color="#555555ff">█</Text>
            </Text>
          )}
        </Box>
      </Box>

      {/* Side panel */}
      {panel.visible && (
        <Box
          flexDirection="column"
          width={30}
          borderStyle="single"
          borderColor="#87ceeb"
          paddingX={1}
        >
          <Text bold color="#00ff66">[ PANEL ]</Text>
          <Text color="#888888">──────────────</Text>
          <Text color="#87ceeb">IP: <Text color="#ffffff">{panel.ip}</Text></Text>
          <Text color="#87ceeb">Ports: <Text color="#ffffff">{panel.ports}</Text></Text>
          <Text color="#87ceeb">Mem: <Text color="#ffffff">{panel.mem}</Text></Text>
          {panel.extra ? <Text color="#888888">{panel.extra}</Text> : null}
        </Box>
      )}
    </Box>
  );
}
