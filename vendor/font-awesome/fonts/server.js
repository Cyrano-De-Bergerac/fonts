/* ============================================================
 * server.js — Round Music Player backend (zero dependencies)
 *
 * Static hosting + the persistence/upload API the player expects:
 *   GET    /api/ping            { ok, themePresent, uploadCount, version }
 *   GET    /api/theme           saved theme JSON (or { updatedAt:0 })
 *   POST   /api/theme           save theme body -> { ok, updatedAt }
 *   DELETE /api/theme           forget saved theme -> { ok }
 *   POST   /api/upload          multipart/form-data 'file' -> { ok, url }
 *   POST   /api/upload-chunk    JSON chunked assembler -> { ok[, url] }
 *   GET    /api/uploads         { files:[{name,url,size}] }
 *   GET    /uploads/<name>      uploaded media (Range-aware)
 *   GET    /                    hub.html (launcher)
 *
 * Run:  node server.js   (PORT env, default 3000)
 * ============================================================ */
'use strict';
const http = require('http');
const https = require('https');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const DATA_DIR = path.join(ROOT, 'data');
const CHUNK_DIR = path.join(DATA_DIR, 'chunks');
const THEME_FILE = path.join(DATA_DIR, 'theme.json');
const MAX_UPLOAD = 95 * 1024 * 1024;     // mirror the client cap
const MAX_THEME = 64 * 1024 * 1024;       // theme may carry data-URI media

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(CHUNK_DIR, { recursive: true });

// ---- upload dedup (by content hash) ----
// Re-uploading the SAME bytes reuses the existing file instead of piling up
// duplicate UUID-named copies. Index: sha1(content) -> filename.
const UPLOAD_INDEX_FILE = path.join(DATA_DIR, 'upload-index.json');
const uploadIndex = new Map();
function loadUploadIndex() {
  try {
    const obj = JSON.parse(fs.readFileSync(UPLOAD_INDEX_FILE, 'utf8'));
    for (const [h, name] of Object.entries(obj))
      if (fs.existsSync(path.join(UPLOAD_DIR, name))) uploadIndex.set(h, name);  // prune stale
  } catch { /* no index yet */ }
}
function saveUploadIndex() {
  try {
    const obj = {};
    for (const [h, name] of uploadIndex) obj[h] = name;
    fs.writeFileSync(UPLOAD_INDEX_FILE, JSON.stringify(obj));
  } catch {}
}
// First run: hash every existing upload so re-uploads dedupe against them.
function buildUploadIndex() {
  if (fs.existsSync(UPLOAD_INDEX_FILE)) { loadUploadIndex(); return; }
  try {
    for (const name of fs.readdirSync(UPLOAD_DIR)) {
      const p = path.join(UPLOAD_DIR, name);
      try {
        if (!fs.statSync(p).isFile()) continue;
        const h = crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');
        if (!uploadIndex.has(h)) uploadIndex.set(h, name);
      } catch {}
    }
    saveUploadIndex();
  } catch {}
}
// Store an upload with content dedup; resolves to the filename to serve.
function storeUpload(data, origName) {
  const h = crypto.createHash('sha1').update(data).digest('hex');
  const existing = uploadIndex.get(h);
  if (existing && fs.existsSync(path.join(UPLOAD_DIR, existing)))
    return Promise.resolve(existing);                  // identical content already stored
  const out = uniqueName(origName || 'file');
  return fsp.writeFile(path.join(UPLOAD_DIR, out), data).then(() => {
    uploadIndex.set(h, out);
    saveUploadIndex();
    return out;
  });
}
buildUploadIndex();


const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.flac': 'audio/flac',
  '.ogg':  'audio/ogg',
  '.oga':  'audio/ogg',
  '.opus': 'audio/ogg',
  '.m4a':  'audio/mp4',
  '.aac':  'audio/aac',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.mov':  'video/quicktime',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff',
  '.ttf':   'font/ttf',
  '.otf':   'font/otf',
  '.eot':   'application/vnd.ms-fontobject',
  '.map':  'application/json; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8'
};
const mimeOf = f => MIME[(path.extname(f) || '').toLowerCase()] || 'application/octet-stream';

// ---------- helpers ----------
function sendJSON(res, status, obj) {
  const body = Buffer.from(JSON.stringify(obj));
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function isInside(file, base) {
  const f = path.resolve(file), b = path.resolve(base);
  return f === b || f.startsWith(b + path.sep);
}

function safeName(name) {
  const ext = (path.extname(name) || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
  const base = path.basename(name, path.extname(name)).replace(/[^\w.\-]+/g, '_').slice(0, 48) || 'file';
  return base + ext;
}

function uniqueName(name) {
  return crypto.randomBytes(8).toString('hex') + '-' + safeName(name);
}

function sanitizeId(id) {
  return String(id || '').replace(/[^\w.\-]+/g, '').slice(0, 64);
}

function readJSON(req, limit, cb) {
  const parts = [];
  let len = 0, aborted = false;
  req.on('data', c => {
    if (aborted) return;
    len += c.length;
    if (len > limit) { aborted = true; cb(null); req.destroy(); return; }
    parts.push(c);
  });
  req.on('end', () => {
    if (aborted) return;
    try { cb(JSON.parse(Buffer.concat(parts).toString('utf8'))); }
    catch (e) { cb(null); }
  });
  req.on('error', () => { if (!aborted) cb(null); });
}

// ---------- static serving (Range-aware) ----------
function serveStatic(req, res, filePath) {
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) return send404(res);
    const total = st.size;
    let start = 0, end = total - 1, status = 200;
    const headers = {
      'Content-Type': mimeOf(filePath),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    };
    const range = req.headers['range'];
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      if (m) {
        start = m[1] ? parseInt(m[1], 10) : 0;
        end = m[2] ? parseInt(m[2], 10) : total - 1;
        if (start > end || start >= total) {
          res.writeHead(416, { 'Content-Range': `bytes */${total}` });
          return res.end();
        }
        status = 206;
        headers['Content-Range'] = `bytes ${start}-${end}/${total}`;
      }
    }
    headers['Content-Length'] = end - start + 1;
    res.writeHead(status, headers);
    fs.createReadStream(filePath, { start, end }).pipe(res);
  });
}

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
}

// ---------- multipart/form-data file extraction ----------
function splitMultipart(buf, boundary) {
  const b = Buffer.from(boundary);
  const positions = [];
  let from = 0, at = buf.indexOf(b, from);
  while (at !== -1) { positions.push(at); from = at + b.length; at = buf.indexOf(b, from); }
  const parts = [];
  for (let i = 0; i < positions.length - 1; i++) {
    parts.push(buf.slice(positions[i] + b.length, positions[i + 1]));
  }
  return parts;
}

function extractFilePart(buf, boundary) {
  const parts = splitMultipart(buf, boundary);
  for (const part of parts) {
    const sep = part.indexOf('\r\n\r\n');
    if (sep === -1) continue;
    const head = part.slice(0, sep).toString('latin1');
    let body = part.slice(sep + 4);
    if (body.length >= 2 && body[body.length - 2] === 0x0d && body[body.length - 1] === 0x0a) {
      body = body.slice(0, body.length - 2);   // strip trailing CRLF before boundary
    }
    const fn = (head.match(/filename="([^"]*)"/) || [])[1];
    if (fn !== undefined) return { filename: fn, data: body };
  }
  return null;
}

// ---------- API handlers ----------
function handlePing(res) {
  fs.readdir(UPLOAD_DIR, (e, files) => {
    const uploadCount = (!e && Array.isArray(files)) ? files.filter(f => !f.startsWith('.')).length : 0;
    fs.access(THEME_FILE, err => {
      sendJSON(res, 200, { ok: true, themePresent: !err, uploadCount, version: 'rebuilt-1.0' });
    });
  });
}

function getTheme(res) {
  fs.readFile(THEME_FILE, (e, buf) => {
    let data = { updatedAt: 0 };
    if (!e) {
      try {
        data = JSON.parse(buf.toString('utf8'));
        if (typeof data !== 'object' || data === null) data = { updatedAt: 0 };
        if (typeof data.updatedAt !== 'number') data.updatedAt = 0;
      } catch (x) { data = { updatedAt: 0 }; }
    }
    sendJSON(res, 200, data);
  });
}

function postTheme(req, res) {
  readJSON(req, MAX_THEME, obj => {
    if (!obj || typeof obj !== 'object') return sendJSON(res, 400, { ok: false, error: 'bad json' });
    obj.updatedAt = Date.now();
    fsp.writeFile(THEME_FILE, JSON.stringify(obj))
      .then(() => sendJSON(res, 200, { ok: true, updatedAt: obj.updatedAt }))
      .catch(() => sendJSON(res, 500, { ok: false, error: 'write failed' }));
  });
}

function delTheme(res) {
  fsp.unlink(THEME_FILE).then(() => sendJSON(res, 200, { ok: true })).catch(() => sendJSON(res, 200, { ok: true }));
}

// Same-origin media proxy: streams a remote http(s) URL through this server
// so the player's Web Audio analyser receives data from cross-origin sources
// (a tainted cross-origin <audio>/<video> silences the analyser). Range-aware
// (forwards Range / Content-Range so seeking works). For the album's own
// same-origin media this is never used (the client bypasses it).
function handleProxy(req, res){
  let target;
  try { target = new URL(req.url, 'http://localhost').searchParams.get('url'); } catch { return sendJSON(res, 400, { ok:false, error:'bad request' }); }
  if (!target) return sendJSON(res, 400, { ok:false, error:'no url' });
  let turl;
  try { turl = new URL(target); } catch { return sendJSON(res, 400, { ok:false, error:'bad url' }); }
  if (!/^(https?:)$/.test(turl.protocol)) return sendJSON(res, 400, { ok:false, error:'bad scheme' });
  const lib = turl.protocol === 'https:' ? https : http;
  const upHeaders = { 'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0' };
  if (req.headers.range) upHeaders.Range = req.headers.range;   // forward seeking
  if (req.headers.referer) upHeaders.Referer = req.headers.referer;
  const up = lib.get(turl.href, { headers: upHeaders }, r => {
    if (!r.statusCode || r.statusCode >= 400){
      res.writeHead(r.statusCode || 502, { 'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-store' });
      r.pipe(res); return;
    }
    const h = {
      'Content-Type': r.headers['content-type'] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    };
    if (r.headers['content-length']) h['Content-Length'] = r.headers['content-length'];
    if (r.headers['content-range'])  h['Content-Range']  = r.headers['content-range'];
    if (r.headers['accept-ranges'])  h['Accept-Ranges']  = r.headers['accept-ranges'];
    res.writeHead(r.statusCode, h);
    r.pipe(res);
  });
  up.on('error', () => { try { res.writeHead(502, {'Content-Type':'text/plain'}); res.end('upstream error'); } catch {} });
}

function handleUpload(req, res) {
  const ct = req.headers['content-type'] || '';
  const m = /boundary=(.+)$/.exec(ct);
  if (!m) return sendJSON(res, 400, { ok: false, error: 'no boundary' });
  const boundary = '--' + m[1].trim();
  const parts = [];
  let len = 0, aborted = false;
  req.on('data', c => {
    if (aborted) return;
    len += c.length;
    if (len > MAX_UPLOAD) { aborted = true; sendJSON(res, 413, { ok: false, error: 'too large' }); req.destroy(); return; }
    parts.push(c);
  });
  req.on('end', () => {
    if (aborted) return;
    const file = extractFilePart(Buffer.concat(parts), boundary);
    if (!file || !file.data || !file.data.length) return sendJSON(res, 400, { ok: false, error: 'no file part' });
    storeUpload(file.data, file.filename || 'file')
      .then(name => sendJSON(res, 200, { ok: true, url: '/uploads/' + name }))
      .catch(() => sendJSON(res, 500, { ok: false, error: 'write failed' }));
  });
  req.on('error', () => { if (!aborted) sendJSON(res, 500, { ok: false, error: 'stream' }); });
}

function handleChunk(req, res) {
  readJSON(req, MAX_UPLOAD, obj => {
    if (!obj || typeof obj !== 'object') return sendJSON(res, 400, { ok: false, error: 'bad json' });
    const id = sanitizeId(obj.id);
    const name = safeName(obj.name || 'file');
    const dir = path.join(CHUNK_DIR, id);
    fs.mkdirSync(dir, { recursive: true });

    if (obj.abandon) {
      return fsp.rm(dir, { recursive: true, force: true })
        .then(() => sendJSON(res, 200, { ok: true }))
        .catch(() => sendJSON(res, 200, { ok: true }));
    }

    if (obj.finalize) {
      return fs.readdir(dir, async (e, files) => {
        if (e) return sendJSON(res, 500, { ok: false, error: 'no chunks' });
        try {
          const parts = files
            .filter(f => /^\d+\.part$/.test(f))
            .map(f => ({ f, idx: parseInt(f.split('.')[0], 10) }))
            .sort((a, b) => a.idx - b.idx);
          const chunks = [];
          for (const { f } of parts) chunks.push(await fsp.readFile(path.join(dir, f)));
          const data = Buffer.concat(chunks);
          if (!data.length) return sendJSON(res, 400, { ok: false, error: 'empty' });
          const out = await storeUpload(data, name);
          fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
          return sendJSON(res, 200, { ok: true, url: '/uploads/' + out });
        } catch (err) {
          return sendJSON(res, 500, { ok: false, error: String(err) });
        }
      });
    }

    // store a chunk
    const idx = parseInt(obj.idx, 10);
    if (!isFinite(idx) || idx < 0) return sendJSON(res, 400, { ok: false, error: 'bad idx' });
    let data;
    try { data = Buffer.from(obj.b64 || '', 'base64'); }
    catch (e) { return sendJSON(res, 400, { ok: false, error: 'bad b64' }); }
    fsp.writeFile(path.join(dir, idx + '.part'), data)
      .then(() => sendJSON(res, 200, { ok: true }))
      .catch(() => sendJSON(res, 500, { ok: false, error: 'write failed' }));
  });
}

function listUploads(res) {
  fs.readdir(UPLOAD_DIR, (e, files) => {
    const list = [];
    if (!e && Array.isArray(files)) {
      for (const f of files) {
        if (f.startsWith('.')) continue;
        try {
          const st = fs.statSync(path.join(UPLOAD_DIR, f));
          if (st.isFile()) list.push({ name: f, url: '/uploads/' + f, size: st.size });
        } catch (x) {}
      }
    }
    sendJSON(res, 200, { files: list });
  });
}

// ---------- router ----------
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const method = req.method;

  if (pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }

  // ---- API ----
  if (pathname === '/api/ping' && method === 'GET') return handlePing(res);
  if (pathname === '/api/theme') {
    if (method === 'GET') return getTheme(res);
    if (method === 'POST') return postTheme(req, res);
    if (method === 'DELETE') return delTheme(res);
    return sendJSON(res, 405, { ok: false, error: 'method' });
  }
  if (pathname === '/api/upload' && method === 'POST') return handleUpload(req, res);
  if (pathname === '/api/upload-chunk' && method === 'POST') return handleChunk(req, res);
  if (pathname === '/api/uploads' && method === 'GET') return listUploads(res);
  if (pathname === '/proxy' && method === 'GET') return handleProxy(req, res);

  // ---- /uploads/* ----
  if (pathname.startsWith('/uploads/')) {
    const rel = pathname.slice('/uploads/'.length);
    const file = path.join(UPLOAD_DIR, rel);
    if (isInside(file, UPLOAD_DIR) && !rel.includes('..')) return serveStatic(req, res, file);
    return send404(res);
  }

  // ---- static from ROOT (deny data/, which is private) ----
  let rel = pathname === '/' ? '/hub.html' : pathname;
  if (rel.startsWith('/data/') || rel.includes('..')) return send404(res);
  const file = path.join(ROOT, rel);
  if (!isInside(file, ROOT)) return send404(res);
  return serveStatic(req, res, file);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Round Music Player server listening on http://0.0.0.0:${PORT}`);
  console.log(`  root:     ${ROOT}`);
  console.log(`  uploads:  ${UPLOAD_DIR}`);
  console.log(`  theme:    ${THEME_FILE}`);
  console.log(`  launcher: http://localhost:${PORT}/  (hub.html)`);
});

server.on('error', err => { console.error('server error:', err); process.exit(1); });
