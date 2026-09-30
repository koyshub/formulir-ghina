/* Server lokal sederhana untuk mencoba formulir: node tools/server.js [port] */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const akar = path.join(__dirname, '..');
const port = Number(process.argv[2] || 8765);
const jenis = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.ttf': 'font/ttf',
  '.json': 'application/json', '.pdf': 'application/pdf',
};

http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const berkas = path.join(akar, p.endsWith('/') ? p + 'index.html' : p);
  if (!berkas.startsWith(akar)) { res.writeHead(403); return res.end(); }
  fs.readFile(berkas, (err, isi) => {
    if (err) { res.writeHead(404); return res.end('tidak ada'); }
    res.writeHead(200, { 'Content-Type': jenis[path.extname(berkas)] || 'application/octet-stream' });
    res.end(isi);
  });
}).listen(port, '127.0.0.1', () => console.log('http://127.0.0.1:' + port + '/'));
