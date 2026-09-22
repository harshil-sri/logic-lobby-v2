import http from 'http';
import fs from 'fs';
import path from 'path';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Polyfills for Vercel Serverless Functions
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (data) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(data));
    return this;
  };

  // API Routing
  if (url.pathname.startsWith('/api/')) {
    const apiFile = path.join(process.cwd(), url.pathname + '.js');
    if (fs.existsSync(apiFile)) {
      try {
        // Read body for POST requests if needed
        if (req.method === 'POST') {
          await new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
              try {
                if (body) req.body = JSON.parse(body);
                resolve();
              } catch (e) {
                resolve(); // Not JSON or empty
              }
            });
            req.on('error', reject);
          });
        }
        
        // Cache bust the import for hot reloading (in dev mode)
        const handler = await import('file://' + apiFile + '?t=' + Date.now());
        return handler.default(req, res);
      } catch (err) {
        console.error(`Error executing ${url.pathname}:`, err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      return res.status(404).json({ error: 'Not found' });
    }
  }

  // Static File Routing
  let pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  if (pathname === '/final') {
    pathname = '/index.html';
  }
  let ext = path.extname(pathname);
  
  // Vercel routes /page to /page.html if /page.html exists
  if (!ext) {
    if (fs.existsSync(path.join(process.cwd(), pathname + '.html'))) {
      pathname += '.html';
      ext = '.html';
    }
  }

  const filePath = path.join(process.cwd(), pathname);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    res.end(fs.readFileSync(filePath));
  } else {
    res.statusCode = 404;
    res.end('File not found');
  }
});

server.listen(3000, () => {
  console.log('==================================================');
  console.log('  LOGIC LOBBY VERCEL-LITE DEV SERVER RUNNING');
  console.log('  Access website: http://localhost:3000');
  console.log('==================================================');
});
