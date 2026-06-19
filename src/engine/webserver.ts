// doas -su mylife.root - Local Web Server
// Serves webtry/capturer pages and provides a simple API for CLI↔browser communication

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

const PUBLIC_DIR = path.resolve(import.meta.dirname, '../../public');

interface CapturerStore {
  ip: string;
  sender: string;
  more: string;
}

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
      // Port 0 = OS picks a free port
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

  // ---- Capturer data ----
  setCapturerData(ip: string, sender: string, more: string): void {
    this.capturerData = { ip, sender, more };
  }

  getCapturerData(): CapturerStore {
    return { ...this.capturerData };
  }

  // ---- Contact (browser → CLI communication) ----
  setContact(key: string, value: string): void {
    this.contactStore.set(key, value);
  }

  /** Check and consume a contact key. Returns the value if set, undefined otherwise. */
  checkContact(key: string): string | undefined {
    const val = this.contactStore.get(key);
    if (val !== undefined) {
      this.contactStore.delete(key);
    }
    return val;
  }

  // ---- Open browser ----
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

  // ---- Request handler ----
  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = new URL(req.url || '/', `http://localhost:${this.port}`);
    const pathname = url.pathname;

    // CORS for local dev
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // API: GET /api/capturer → get capturer data
    if (pathname === '/api/capturer' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(this.capturerData));
      return;
    }

    // API: POST /api/capturer → update capturer data from browser
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

    // API: POST /api/contact → browser sets a contact key
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

    // API: GET /api/contact?key=xxx → check (and consume) a contact key
    if (pathname === '/api/contact' && req.method === 'GET') {
      const key = url.searchParams.get('key');
      const val = key ? this.checkContact(key) : undefined;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ key: key || null, value: val ?? null, found: val !== undefined }));
      return;
    }

    // Static file serving
    this.serveStatic(pathname, res);
  }

  private serveStatic(pathname: string, res: http.ServerResponse): void {
    // Default to webtry.html
    let filePath = pathname === '/' || pathname === ''
      ? path.join(PUBLIC_DIR, 'webtries', 'webtry.html')
      : path.join(PUBLIC_DIR, pathname);

    // If direct path not found, try webtries/ subfolder
    if (!fs.existsSync(filePath)) {
      filePath = path.join(PUBLIC_DIR, 'webtries', pathname);
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }
}

// Singleton
export const webServer = new WebServer();
