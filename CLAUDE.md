# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
npm run build       # tsc only
npm run start       # tsc + run (same as dev)
npm run dev         # tsc + run
npm run bundle      # ncc build (single-file bundle)
npm run exe         # pkg → dist/doas.exe (Windows x64)
npm run make        # tsc + bundle + exe (full pipeline)
```

## Architecture

`doas-cli` is an interactive fiction CLI game built with **Ink** (React-for-terminals) and TypeScript. The player types commands into a simulated "HumanOS" terminal to progress through story chapters.

### Layer model

```
src/index.tsx          — Entry point: chapter menu → creates GameEngine → renders <App>
src/components/App.tsx  — Terminal UI: boot animation, output scrollback, input line, history
src/engine/engine.ts    — Core engine: command registry, tokenizer, story-state machine, ask/echo/lock
src/engine/parser.ts    — Markup parser: [color:], [progress], [runCommand] → OutputLine[]
src/engine/storage.ts   — File persistence at ~/.doas-root-of-mylife/ (replaces web localStorage)
src/chapters/*.ts       — Chapter definitions: each file calls engine.newCommand() to register commands
```

### Key concepts

- **`storyWhere`**: A numeric state machine driving story progression. Each command/handler gates on `storyWhere` values. Returning `'nextSTEP'` from a handler increments it.
- **`engine.newCommand(name, paramDefs, handler, storyWhereNeed)`**: Registers a CLI command. `storyWhereNeed` is the minimum `storyWhere` value required for the command to be visible (lower values hide it as "command not found").
- **`engine.ask(prompt, callback)`**: Prompts the player for free-text input mid-story. The UI switches to "ask mode" until the player presses Enter.
- **`engine.echoContent(content, noSleep, delay)`**: Outputs text through the parser with optional typewriter delay. `noSleep=true` prints instantly.
- **`engine.setCallbacks(write, ask, lock, clear)`**: Wires engine output to the React UI. The engine buffers output until callbacks are set.

### State persistence

Game state (storyWhere, variables, command history) is saved per-chapter to `~/.doas-root-of-mylife/save-{chapterId}.json`. Achievements are saved per-gameId to `achieves-{gameId}.json`. Both are JSON files managed by `src/engine/storage.ts`.

### Input flow

1. `useInput` in App.tsx captures keystrokes
2. On Enter: calls `engine.executeLine(rawLine)`
3. Engine tokenizes (supports quoted strings), looks up the command, checks `storyWhereNeed`
4. Handler receives `CommandAPI` with args, echo, setVar/getVar, storyWhere controls
5. Handler calls `api.echo()` to write output lines, which flow back through the `onWrite` callback into React state

### Markup in echo content

- `[color: #hex]text[/endcolor]` — colored text
- `[progress max=N timeAdd=N][/progress]` — progress indicator
- `[runCommand command=X](args)[/endrunning]` — suggested command
