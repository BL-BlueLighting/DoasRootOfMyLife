// Second chapter (第二章) — Script hooks
import { GameEngine } from '../../engine/engine.js';

export function registerScripts(engine: GameEngine): void {
  // ---- ls (auth gate) ----
  engine.newCommand('ls', [], () => {
    if (engine.storyWhere === 0) {
      engine.echoContent('Please authentication first.', true);
      engine.ask('[sudo] password for owner-body: ', (answer: string) => {
        if (answer === 'rickroll') {
          engine.echoContent('https://nggyu.latingtude-studios.icu', true);
        } else if (answer === '%%%humanOS&&&defaultpwd&&&3912499594768843') {
          engine.echoContent('Authentication successfully. Welcome back, owner-body.', true);
          engine.storyWhere = 1;
        } else {
          engine.echoContent('Sorry, password wrong. Please retry.', true);
          // create a file under archive folder, to real pwd
          engine.writeFile("/archived_files/email_bl@airoj.cn_to_cnaas@airoj.cn_.eml", `From: BL.BlueLighting<bl@airoj.cn>
To: cn_aas<cnaas@airoj.cn>
Subject: Recoverying Password

Dear cn_aas:
This is your HumanOS root authenticating password.
Please don't share it with anyone, and keep it safe.

Your password: JSUlaHVtYW5PUyYmJmRlZmF1bHRwd2QmJiYzOTEyNDk5NTk0NzY4ODQz
Decrypt it using ████ sixty-four decoder, then you will get the password.

Best regards,
BL.BlueLighting, HumanOS Technology Supporting Team.
`);
        }
      });
      return;
    }
    if (engine.storyWhere === 1 || engine.storyWhere === 2 || engine.storyWhere === 201) {
      const cur = engine.currentDir === '~' ? `/home/${engine.username}` : engine.currentDir;
      if (engine.isRestrictedDir(cur)) {
        engine.echoContent('Permission denied.', true);
        return;
      }
      const entries = engine.ls();
      engine.echoContent(entries.length === 0 ? '(empty)' : entries.join('  '), true);
    }
  }, 0);

  // ---- cd (directory restriction) ----
  engine.newCommand('cd', ['dir'], (api) => {
    if (engine.storyWhere === 1 || engine.storyWhere === 2 || engine.storyWhere === 201) {
      const dir = api.args[0] || '~';
      const dirs = ['manAI', 'log', 'var', 'home'];
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
  }, 0);

  // ---- manAI (corrupted — overrides DSL manAI) ----
  engine.newCommand('manAI', [], () => {
    engine.echoContent('[ ERROR ] Failed to call manAI server.', true);
    engine.echoContent('[ ERROR ] It seems like the manAI core was corrupted.', true);
  }, 0);

  // ---- chmod ----
  engine.newCommand('chmod', ['mod', 'file'], (api) => {
    if (engine.storyWhere === 2) {
      const cur = engine.currentDir === '~' ? `/home/${engine.username}` : engine.currentDir;
      if (cur !== '/manAI') { engine.echoContent('No such file or directory.', true); return; }
      if (api.args[1] !== 'manAIcore.model') { engine.echoContent('Invalid file.', true); return; }
      if (api.args[0] !== '777') return;
      engine.storyWhere = 201;
    }
  }, 0);

  // ---- checkdata ----
  engine.newCommand('checkdata', ['file'], () => {
    if (engine.storyWhere === 1) {
      engine.echoContent('Checking file data...', true);
      engine.gocountdown(() => {
        engine.echoContent('[ [color: green]FOUND[/endcolor] ] /manAI/manAIcore.model corrupted.\n[ [color: skyblue]FINFO[/endcolor] ] Fix it now?', true);
        engine.ask('[Y/n]', (ans: string) => {
          if (ans !== 'n') {
            engine.echoContent('Hold on, running fix process...', true);
            engine.gocountdown(() => {
              engine.echoContent('[ [color: red]FAILED[/endcolor] ] Fix failed. Check permission then retry.', true);
              engine.storyWhere = 2;
            }, 100);
          }
        });
      }, 100);
    } else if (engine.storyWhere === 201) {
      engine.echoContent('Checking file data...', true);
      engine.gocountdown(() => {
        engine.echoContent('[ [color: green]FOUND[/endcolor] ] /manAI/manAIcore.model corrupted.\n[ [color: skyblue]FINFO[/endcolor] ] Fix it now?', true);
        engine.ask('[Y/n]', (ans: string) => {
          if (ans !== 'n') {
            engine.echoContent('Hold on, running fix process...', true);
            engine.gocountdown(() => {
              engine.echoContent('[ [color: green]SUCCESS[/endcolor] ] Fix successfully. Used 20.8 GiB.', true);
              engine.storyWhere = 3;
            }, 100);
          }
        });
      }, 100);
    }
  }, 0);
}
