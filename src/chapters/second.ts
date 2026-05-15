// doas -su mylife.root - Chapter: Second (第二章 - 核心损坏:manAI)
// Ported from content/chapters/second/commands.js

import { GameEngine, CommandAPI } from '../engine/engine.js';

export function registerSecondChapter(engine: GameEngine): void {
  // Load state
  engine.load();

  engine.echoContent('Welcome to HumanOS.', true);
  engine.echoContent('Type [color: #0f0]help[/endcolor] to get started.', true);

  // Add chapter directories and files to the virtual filesystem
  engine.addFile('/manAI/manAIcore.model', '', 1);
  engine.addFile('/manAI/manAIdata.db', '', 1);
  engine.addFile('/manAI/manAImemory.db', '', 1);
  engine.addFile('/log/tcbk-manAI-2025-12-09-12h-24m-56s.log', '', 1);
  engine.addRestrictedDir('/var');
  engine.addRestrictedDir('/home');

  engine.persist();

  // ---- help ----
  engine.newCommand('help', [], function () {
    engine.echoContent("You're hopeless. haha.", true);
  });

  // ---- manAI (corrupted) ----
  engine.newCommand('manAI', [], function () {
    if (
      engine.storyWhere === 0 ||
      engine.storyWhere === 1 ||
      engine.storyWhere === 2 ||
      engine.storyWhere === 201
    ) {
      engine.echoContent('[ ERROR ] Failed to call manAI server.', true);
      engine.echoContent('[ ERROR ] It seems like the manAI core was corrupted.', true);
    }
  });

  // ---- ls (custom: auth gate, then delegates to engine) ----
  engine.newCommand('ls', [], function () {
    if (engine.storyWhere === 0) {
      engine.echoContent('Please authentication first.', true);
      engine.ask('[sudo] password for owner-body: ', function (answer: string) {
        if (answer === 'rickroll') {
          engine.echoContent('https://nggyu.latingtude-studios.icu', true);
        } else if (answer === '%%%humanOS&&&defaultpwd&&&3912499594768843') {
          engine.echoContent('Authentication successfully. Welcome back, owner-body.', true);
          engine.storyWhere = 1;
        } else {
          engine.echoContent('Sorry, password wrong. Please retry.', true);
        }
      });
      return;
    }
    if (
      engine.storyWhere === 1 ||
      engine.storyWhere === 2 ||
      engine.storyWhere === 201
    ) {
      const cur = engine.currentDir === '~'
        ? `/home/${engine.username}`
        : engine.currentDir;
      if (engine.isRestrictedDir(cur)) {
        engine.echoContent('Permission denied.', true);
        return;
      }
      const entries = engine.ls();
      if (entries.length === 0) {
        engine.echoContent('(empty)', true);
      } else {
        engine.echoContent(entries.join('  '), true);
      }
    }
  });

  // ---- cd (custom: auth gate, then delegates to engine) ----
  engine.newCommand('cd', ['dir:string'], function (api: CommandAPI) {
    if (
      engine.storyWhere === 1 ||
      engine.storyWhere === 2 ||
      engine.storyWhere === 201
    ) {
      const dir = api.args[0] || '~';
      const dirs = ['manAI', 'log', 'var', 'home'];
      // Only allow cd to chapter-specific dirs from root
      if (dirs.indexOf(dir) < 0 && dir !== '..') {
        engine.echoContent('No such file or directory.', true);
        return;
      }
      const result = engine.cd(dir);
      if (result === null) {
        engine.echoContent('No such file or directory.', true);
      } else {
        engine.echoContent(result, true);
      }
    }
  });

  // ---- chmod ----
  engine.newCommand('chmod', ['mod:string', 'file:string'], function (api: CommandAPI) {
    if (engine.storyWhere === 2) {
      const cur = engine.currentDir === '~'
        ? `/home/${engine.username}`
        : engine.currentDir;
      if (cur !== '/manAI') {
        engine.echoContent('No such file or directory.', true);
        return;
      }
      if (api.args[1] !== 'manAIcore.model') {
        engine.echoContent('Invalid file.', true);
        return;
      }
      if (api.args[0] !== '777') {
        return;
      }
      engine.storyWhere = 201;
    }
  });

  // ---- checkdata ----
  engine.newCommand('checkdata', ['file:string'], function (api: CommandAPI) {
    if (engine.storyWhere === 1) {
      engine.echoContent('Checking file data...', true);
      engine.gocountdown(() => {
        engine.echoContent(
          '[ [color: green]FOUND[/endcolor] ] A file named "/manAI/manAIcore.model" was corrupted.\n[ [color: skyblue]FINFO[/endcolor] ] Fix it now?',
          true,
        );
        engine.ask('[Y/n]', function (ans: string) {
          if (ans !== 'n') {
            engine.echoContent('Hold on, running fix process...', true);
            engine.gocountdown(() => {
              engine.echoContent(
                '[ [color: red]FAILED[/endcolor] ] File named "/manAI/manAIcore.model" fix failed. Please check its permission then retry.',
                true,
              );
              engine.storyWhere = 2;
            }, 100);
          }
        });
      }, 100);
    } else if (engine.storyWhere === 201) {
      engine.echoContent('Checking file data...', true);
      engine.gocountdown(() => {
        engine.echoContent(
          '[ [color: green]FOUND[/endcolor] ] A file named "/manAI/manAIcore.model" was corrupted.\n[ [color: skyblue]FINFO[/endcolor] ] Fix it now?',
          true,
        );
        engine.ask('[Y/n]', function (ans: string) {
          if (ans !== 'n') {
            engine.echoContent('Hold on, running fix process...', true);
            engine.gocountdown(() => {
              engine.echoContent(
                '[ [color: green]SUCCESS[/endcolor] ] File named "/manAI/manAIcore.model" fix successfully. Used space 20.8Gigabytes.',
                true,
              );
              engine.storyWhere = 3;
            }, 100);
          }
        });
      }, 100);
    }
  });
}
