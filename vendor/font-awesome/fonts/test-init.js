// Execution trace harness: does script.js init() complete or hang?
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, 'dev.html'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

// Capture console output
const logs = [];
const vc = new VirtualConsole();
vc.on('console', (...args) => logs.push('[log] ' + args.map(String).join(' ')));
vc.on('consoleError', (...args) => logs.push('[ERROR] ' + args.map(String).join(' ')));
vc.on('consoleWarn', (...args) => logs.push('[warn] ' + args.map(String).join(' ')));
vc.on('jsdomError', (e) => logs.push('[JSDOM ERROR] ' + (e.stack || e.message || e)));

// Build the DOM without running scripts yet
const dom = new JSDOM(html, {
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  virtualConsole: vc,
  url: 'http://localhost:3000/dev.html'
});
const { window } = dom;

// --- Browser API stubs ---
// requestAnimationFrame (jsdom pretendToBeVisual provides a basic one, but be safe)
if (!window.requestAnimationFrame) {
  let id = 0;
  window.requestAnimationFrame = (cb) => { id++; setTimeout(() => cb(performance.now()), 16); return id; };
  window.cancelAnimationFrame = (id) => clearTimeout(id);
}
// WebGL stub (canvas.getContext('webgl2') etc.)
const stubCtx = new Proxy({}, { get: (t, p) => { if (p === 'canvas') return {}; return () => {}; } });
window.HTMLCanvasElement.prototype.getContext = function() { return stubCtx; };
// matchMedia
if (!window.matchMedia) window.matchMedia = () => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
// MutationObserver — jsdom has it but make sure
// Audio/Video — jsdom has elements but limited; stub play()
if (window.HTMLMediaElement) {
  window.HTMLMediaElement.prototype.play = function() { return Promise.resolve(); };
  window.HTMLMediaElement.prototype.pause = function() {};
}
// structuredClone fallback
if (!window.structuredClone) window.structuredClone = (o) => JSON.parse(JSON.stringify(o));

// localStorage is provided by jsdom with url option

// SVG geometry stubs (jsdom doesn't implement these — real browsers do)
const svgProto = window.SVGElement && window.SVGElement.prototype;
if (svgProto) {
  if (!svgProto.getPointAtLength) svgProto.getPointAtLength = function() { return { x: 0, y: 0 }; };
  if (!svgProto.getTotalLength) svgProto.getTotalLength = function() { return 100; };
  if (!svgProto.setAttribute) svgProto.setAttribute = function() {};
}
// getComputedStyle for elements (jsdom has it on window but ensure CSS vars work)
const origGetCS = window.getComputedStyle;
window.getComputedStyle = function(el) { const cs = origGetCS.call(this, el); cs.getPropertyValue = cs.getPropertyValue || (() => ''); return cs; };

// Directly override window.console to capture all output
const origConsole = window.console;
window.console = {
  log: (...a) => logs.push('[log] ' + a.map(String).join(' ')),
  error: (...a) => logs.push('[ERROR] ' + a.map(String).join(' ')),
  warn: (...a) => logs.push('[warn] ' + a.map(String).join(' ')),
  info: (...a) => logs.push('[info] ' + a.map(String).join(' ')),
  debug: (...a) => logs.push('[debug] ' + a.map(String).join(' ')),
  dir: () => {}, table: () => {}, group: () => {}, groupEnd: () => {},
  trace: () => {}, time: () => {}, timeEnd: () => {}, assert: () => {},
  count: () => {}, clear: () => {}
};

// Inject the script via window.eval (runScripts: outside-only supports this)
console.log('=== Running script.js ===');
let hangTimer = setTimeout(() => {
  console.log('\n!!! TIMEOUT: init appears to HANG (5s elapsed, INIT COMPLETE not reached)');
  console.log('=== Last 30 captured console entries ===');
  logs.slice(-30).forEach(l => console.log(l));
  process.exit(1);
}, 5000);

try {
  window.eval(script);
} catch (e) {
  clearTimeout(hangTimer);
  console.log('!!! SYNCHRONOUS EXCEPTION during script execution:');
  console.log(e.stack || e);
  console.log('\n=== All captured console entries ===');
  logs.forEach(l => console.log(l));
  process.exit(1);
}

// Give async ops (rAF, fetch, microtasks) a moment to settle
setTimeout(() => {
  clearTimeout(hangTimer);
  console.log('\n=== Script execution finished (no synchronous hang) ===');
  console.log('=== Debug markers found ===');
  const markers = logs.filter(l => l.includes('[DBG]'));
  if (markers.length === 0) console.log('(no [DBG] markers captured — IIFE may not have started)');
  markers.forEach(l => console.log(l));
  console.log('\n=== Errors found ===');
  const errs = logs.filter(l => l.includes('ERROR') || l.includes('Error') || l.includes('error'));
  errs.slice(0, 20).forEach(l => console.log(l));
  if (errs.length > 20) console.log('... ' + (errs.length - 20) + ' more errors');
  console.log('\n=== Total log entries: ' + logs.length + ' ===');
  console.log('=== Last 15 entries ===');
  logs.slice(-15).forEach(l => console.log(l));
  // Check if version badge exists in DOM
  const badge = window.document.querySelector('#versionBadge, .version-badge, [data-version]');
  console.log('\n=== Version badge in DOM: ' + (badge ? 'YES' : 'NO') + ' ===');
  process.exit(0);
}, 1500);
