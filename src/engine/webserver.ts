// doas -su mylife.root - Local Web Server
// Serves webtry/capturer pages from embedded content (bun compile compatible)

import * as http from 'http';
import { exec } from 'child_process';

interface CapturerStore {
  ip: string;
  sender: string;
  more: string;
}

// In-memory static file store (embedded at compile time)
const STATIC_FILES = new Map<string, { mime: string; content: string }>([
  ['/webtry.html', { mime: 'text/html; charset=utf-8', content: WEBTRY_HTML }],
  ['/capturer.html', { mime: 'text/html; charset=utf-8', content: CAPTURER_HTML }],
  ['/1004.html', { mime: 'text/html; charset=utf-8', content: PAGE_1004_HTML }],
  ['/1004_1.html', { mime: 'text/html; charset=utf-8', content: PAGE_1004_1_HTML }],
  ['/1004_3.html', { mime: 'text/html; charset=utf-8', content: PAGE_1004_3_HTML }],
  ['/1004_4.html', { mime: 'text/html; charset=utf-8', content: PAGE_1004_4_HTML }],
]);

export class WebServer {
  private server: http.Server | null = null;
  private port: number = 0;
  private capturerData: CapturerStore = { ip: '', sender: '', more: '' };
  private contactStore = new Map<string, string>();

  get url(): string {
    return `http://localhost:${this.port}`;
  }

  get running(): boolean {
    return this.server !== null;
  }

  async start(): Promise<number> {
    if (this.server) return this.port;

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => this.handleRequest(req, res));
      this.server.listen(0, '127.0.0.1', () => {
        const addr = this.server!.address();
        if (addr && typeof addr === 'object') {
          this.port = addr.port;
          resolve(this.port);
        } else {
          reject(new Error('Failed to get server address'));
        }
      });
      this.server.on('error', reject);
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      this.port = 0;
    }
  }

  setCapturerData(ip: string, sender: string, more: string): void {
    this.capturerData = { ip, sender, more };
  }

  getCapturerData(): CapturerStore {
    return { ...this.capturerData };
  }

  setContact(key: string, value: string): void {
    this.contactStore.set(key, value);
  }

  checkContact(key: string): string | undefined {
    const val = this.contactStore.get(key);
    if (val !== undefined) {
      this.contactStore.delete(key);
    }
    return val;
  }

  openBrowser(urlPath: string): void {
    const url = `${this.url}${urlPath}`;
    const cmd = process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
    exec(cmd, (err) => {
      if (err) {
        // Non-fatal: browser might not be available
      }
    });
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = new URL(req.url || '/', `http://localhost:${this.port}`);
    const pathname = url.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (pathname === '/api/capturer' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.capturerData));
      return;
    }

    if (pathname === '/api/capturer' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.more !== undefined) this.capturerData.more = data.more;
          if (data.ip !== undefined) this.capturerData.ip = data.ip;
          if (data.sender !== undefined) this.capturerData.sender = data.sender;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400);
          res.end('Invalid JSON');
        }
      });
      return;
    }

    if (pathname === '/api/contact' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.key) this.contactStore.set(data.key, String(data.value ?? ''));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400);
          res.end('Invalid JSON');
        }
      });
      return;
    }

    if (pathname === '/api/contact' && req.method === 'GET') {
      const key = url.searchParams.get('key');
      const val = key ? this.checkContact(key) : undefined;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ key: key || null, value: val ?? null, found: val !== undefined }));
      return;
    }

    this.serveStatic(pathname, res);
  }

  private serveStatic(pathname: string, res: http.ServerResponse): void {
    let lookupPath = pathname === '/' || pathname === '' ? '/webtry.html' : pathname;

    const entry = STATIC_FILES.get(lookupPath);
    if (entry) {
      res.writeHead(200, { 'Content-Type': entry.mime });
      res.end(entry.content);
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  }
}

export const webServer = new WebServer();

// ---- Embedded HTML content ----

const WEBTRY_HTML = `<!doctype html>
<html lang="zh-CN">
    <head>
        <title>Hydra Shell - Web Try</title>
    </head>
    <body style="background-color: black;">
        <div class="container" style="width: 100%; height: 100vh;">
            <center><p style="color: white;">HYDRA SHELL - WEB TRY - RUNNING</p></center>
            <br/>
            <iframe style="width: 100%; height: 90%; border: 1px solid white; border-radius: 10px;"></iframe>
        </div>

    </body>

    <script>
        const params = new URLSearchParams(window.location.search);
        const pageid = params.get('pageid');

        document.querySelector('iframe').src = "./" + pageid + ".html";
    </script>
</html>`;

const CAPTURER_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>HumanOS - Capturer</title>
<style>
  :root{
    --bg:#000;
    --panel:#071010;
    --accent:#00ff88;
    --muted:#67ffb0;
    --card-bg: rgba(0,0,0,0.6);
  }
  html,body{height:100%;margin:0;background:var(--bg);color:var(--accent);font-family:ui-monospace,Consolas,monospace;}
  .wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;}
  .card{
    width:980px;max-width:calc(100% - 40px);background:linear-gradient(180deg,#040404 0%, #071010 100%);border:1px solid rgba(0,255,136,0.08);
    box-shadow: 0 8px 40px rgba(0,255,136,0.04);border-radius:8px;padding:18px;display:flex;gap:14px;
  }
  .left{flex:1;display:flex;flex-direction:column;gap:12px;}
  .right{width:320px;min-width:260px;display:flex;flex-direction:column;gap:12px;}
  .section{background:var(--card-bg);border:1px solid rgba(0,255,136,0.06);padding:12px;border-radius:6px;}
  .section h2{margin:0 0 8px 0;color:var(--muted);font-size:14px;}
  .kv{font-size:13px;line-height:1.6;color:var(--accent);display:flex;gap:8px;align-items:center;}
  .kv .k{color:rgba(255,255,255,0.25);min-width:88px;}
  .kv .v{flex:1;color:var(--accent);word-break:break-all;}
  .controls{display:flex;gap:8px;margin-top:8px;}
  .btn{background:transparent;border:1px solid rgba(0,255,136,0.12);color:var(--accent);padding:6px 10px;border-radius:6px;cursor:pointer}
  .btn:active{transform:translateY(1px)}
  textarea#moreArea{width:94%;height:260px;background:#030403;color:var(--accent);border:1px solid rgba(0,255,136,0.06);padding:10px;border-radius:6px;resize:vertical;font-family:ui-monospace,Consolas,monospace;font-size:13px;}
  .muted{color:rgba(255,255,255,0.24);font-size:12px;}
  .small{font-size:12px;padding:6px 8px}
  .row{display:flex;gap:8px;align-items:center}
  @media(max-width:900px){
    .card{flex-direction:column;}
    .right{width:100%}
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="card" role="main" aria-label="DSMR Capturer UI">
      <h3>Capturer - CAPTURED!</h3>
      <br/>
      <div class="left">
        <div class="section" id="infoSection">
          <h2>Information - 信息</h2>
          <div class="kv"><div class="k">IP:</div><div class="v" id="info_ip">--</div></div>
          <div class="kv"><div class="k">Sender:</div><div class="v" id="info_sender">--</div></div>
          <div class="controls">
            <div style="flex:1"></div>
            <span class="muted" id="timeStamp"></span>
          </div>
        </div>

        <div class="section">
          <h2>More - 更多</h2>
          <textarea id="moreArea" placeholder="" readonly></textarea>
          <div class="row" style="justify-content:space-between;margin-top:8px">
            <span class="muted" id="apiStatus"></span>
            <button class="btn small" id="btnRefresh">刷新</button>
          </div>
        </div>
      </div>
    </div>
  </div>

<script>
/* ===== 参数读取 ===== */
const params = new URLSearchParams(window.location.search);
const param_ip = params.get('ip') || '0.0.0.0';
const param_sender = params.get('sender') || 'Chromium';
const API_BASE = window.location.origin + '/api/capturer';

/* ===== 元素引用 ===== */
const el_ip = document.getElementById('info_ip');
const el_sender = document.getElementById('info_sender');
const el_more = document.getElementById('moreArea');
const el_time = document.getElementById('timeStamp');
const el_status = document.getElementById('apiStatus');

/* ===== 通过 HTTP API 加载 "more" 数据 ===== */
async function loadMoreFromAPI(){
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    el_more.value = data.more || '';
    if (data.ip) el_ip.textContent = data.ip;
    if (data.sender) el_sender.textContent = data.sender;
    el_status.textContent = '✓ 已同步';
  } catch(e) {
    el_status.textContent = '✗ 无法连接服务器';
  }
}

/* ===== 初始化显示 ===== */
function renderInfo(){
  el_ip.textContent = param_ip;
  el_sender.textContent = param_sender;
  el_time.textContent = new Date().toLocaleString();
}

/* 页面初始化 */
renderInfo();
loadMoreFromAPI();

/* 每 2 秒轮询一次，同步 CLI 端数据 */
setInterval(loadMoreFromAPI, 2000);

/* 刷新按钮 */
document.getElementById('btnRefresh').addEventListener('click', loadMoreFromAPI);
</script>
</body>
</html>`;

const PAGE_1004_HTML = `<!doctype html>
<html lang="zh-CN">
    <head>
        <title>Perfect Contact System</title>
    </head>
    <body style="background-color: white;">
        <main style="margin-top: 27px; margin-left: 27px;">
            <h1>完美通讯系统</h1>
            <p><a href="./1004_1.html">登录入口</a></p>
        </main>
    </body>
</html>`;

const PAGE_1004_1_HTML = `<!doctype html>
<html lang="zh-CN">
    <head>
        <title>Perfect Contact System</title>
    </head>
    <body style="background-color: white;">
        <main style="margin-top: 27px; margin-left: 27px;">
            <h1>完美通讯系统</h1>
            <h2>- LOGIN SYSTEM -</h2>
            <div class="login_form">
                <label for="username">用户名:</label><br/>
                <input type="text" id="username" name="username" required/><br/><br/>
                <label for="password">密码:</label><br/>
                <input type="password" id="password" name="password" required/><br/><br/>
                <input type="button" id="login" value="登录"/>
            </div>
            <a href="./1004_2.html" style="display: none;" id="manage">跳转到管理页</a>
        </main>
    </body>

    <script>
        const API_BASE = window.location.origin + '/api/contact';
        const correctUsername = "admin";
        const correctPassword = "woCaoNiMaDeJianPuZhai";
        const loginButton = document.getElementById("login");
        let errorCount = 0;

        loginButton.addEventListener("click", function() {
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            if (username === correctUsername && password === correctPassword) {
                alert("登录成功！");
                manage.style.display = "inline";
                fetch(API_BASE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'drom-contact-locals-1', value: 'true' })
                }).catch(() => {});
            } else if (username == "user" && password === "123456") {
                alert("普通用户无法登录管理后台。");
            } else {
                if (errorCount >= 3) {
                    alert("错误次数过多，请稍后再试。");
                } else {
                    alert("用户名或密码错误，请重试。");
                    errorCount++;
                }
            }
        });
    </script>
</html>`;

const PAGE_1004_3_HTML = `<!doctype html>
<html lang="zh-CN">
    <head>
        <title>Perfect Contact System</title>
    </head>
    <body style="background-color: white;">
        <main style="margin-top: 27px; margin-left: 27px;">
            <h1>完美通讯系统</h1>
            <h2>- LOGIN SYSTEM -</h2>
            <div class="login_form">
                <label for="username">用户名:</label><br/>
                <input type="text" id="username" name="username" required/><br/><br/>
                <label for="password">密码:</label><br/>
                <input type="password" id="password" name="password" required/><br/><br/>
                <input type="button" id="login" value="登录"/>
            </div>
        </main>
    </body>

    <script>
        const API_BASE = window.location.origin + '/api';
        document.getElementById("login").addEventListener("click", function() {
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const more = [
                '------ BEGIN PACKET ------',
                'Method: Post',
                'Request-URI: /api/v1/login',
                'Host: 173.5.5.3:80',
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type: application/x-www-form-urlencoded',
                'Content-Length: ' + (('username='.length + username.length + '&password='.length + password.length)),
                '',
                'Request-Source: username=' + username + '&password=' + password,
                'Request-Raw:',
                '  {',
                "    'Username': '" + username + "',",
                "    'Password': '" + password + "'",
                '  }',
                '------ END PACKET ------'
            ].join('\\n');

            fetch(API_BASE + '/capturer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip: '127.0.0.1',
                    sender: 'Chromium',
                    more: more
                })
            }).then(() => {
                return fetch(API_BASE + '/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'drom-contact-locals-2', value: 'true' })
                });
            }).catch(() => {});
        });
    </script>
</html>`;

const PAGE_1004_4_HTML = `<!doctype html>
<html lang="zh-CN">
    <head>
        <title>Perfect Contact System</title>
    </head>
    <body style="background-color: white;">
        <main style="margin-top: 27px; margin-left: 27px;">
            <h1>完美通讯系统</h1>
            <h2>- LOGIN SYSTEM -</h2>
            <div class="login_form">
                <label for="username">用户名:</label><br/>
                <input type="text" id="username" name="username" required/><br/><br/>
                <label for="password">密码:</label><br/>
                <input type="password" id="password" name="password" required/><br/><br/>
                <input type="button" id="login" value="登录"/>
            </div>
            <a href="./1004_2.html" style="display: none;" id="manage">跳转到管理页</a>
        </main>
    </body>

    <script>
        const API_BASE = window.location.origin + '/api/contact';
        const correctUsername = "' OR 1=1";
        const correctPassword = "' OR 1=1";
        const loginButton = document.getElementById("login");
        let errorCount = 0;

        loginButton.addEventListener("click", function() {
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            if (username === correctUsername && password === correctPassword) {
                alert("登录成功！");
                manage.style.display = "inline";
                fetch(API_BASE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'drom-contact-locals-3', value: 'true' })
                }).catch(() => {});
            } else if (username == "user" && password === "123456") {
                alert("普通用户无法登录管理后台。");
            } else {
                if (errorCount >= 3) {
                    alert("错误次数过多，请稍后再试。");
                } else {
                    alert("用户名或密码错误，请重试。");
                    errorCount++;
                }
            }
        });
    </script>
</html>`;
