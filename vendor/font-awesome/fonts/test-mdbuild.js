// Test mdBuildPreset logic in isolation
const fs = require('fs');
const vm = require('vm');

// Load presets
let code = fs.readFileSync('vendor/butterchurn/butterchurnPresetsFull.min.js', 'utf8');
const sb = {window:{},self:{},setInterval,setTimeout,clearInterval,clearTimeout,console,Math,Date,JSON,parseInt,parseFloat,isNaN,Array,Object};
sb.window = sb; sb.self = sb; sb.globalThis = sb;
const ctx = vm.createContext(sb);
vm.runInContext(code, ctx);
const api = (sb.butterchurnPresets && (sb.butterchurnPresets.default || sb.butterchurnPresets));
const presets = api.getPresets();
const names = Object.keys(presets);

// Stub getComputedStyle
global.getComputedStyle = () => ({ getPropertyValue: v => v === '--progress-start' ? '#ff2992' : '#29d5ff' });

// Extract and eval mdBuildPreset
const script = fs.readFileSync('script.js', 'utf8');
const m = script.match(/(function mdBuildPreset\(original, p\)\{[\s\S]*?return clone;\n  \})/);
const mdBuildPreset = vm.runInNewContext('(' + m[1] + ')', {
  Math, JSON, parseInt, getComputedStyle: () => ({ getPropertyValue: v => v === '--progress-start' ? '#ff2992' : '#29d5ff' }),
  el: { player: {} }
});

const setsZoomName = names.find(n => /a\.zoom\s*=/.test(presets[n].frame_eqs_str || ''));
const noZoomName = names.find(n => !/a\.zoom\s*=/.test(presets[n].frame_eqs_str || ''));
const tp = presets[setsZoomName];
const np = presets[noZoomName];

function showAppended(orig, result) {
  const appended = result.frame_eqs_str.slice(orig.frame_eqs_str.length);
  return appended || '(nothing appended)';
}

console.log('=== DECAY (0.8) ===');
const r4 = mdBuildPreset(tp, {decay:0.8, zoom:1, warp:1, sensitivity:1, tint:0, quality:1});
console.log('  bv.decay:', r4.baseVals.decay, '| append:', showAppended(tp, r4));

console.log('=== TINT (0.5) ===');
const r3 = mdBuildPreset(tp, {decay:0, zoom:1, warp:1, sensitivity:1, tint:0.5, quality:1});
console.log('  append:', showAppended(tp, r3));

console.log('=== WARP (1.5) on preset that SETS warp ===');
const r5 = mdBuildPreset(tp, {decay:0, zoom:1, warp:1.5, sensitivity:1, tint:0, quality:1});
console.log('  bv.warp:', r5.baseVals.warp, '| append:', showAppended(tp, r5));

console.log('=== SENSITIVITY (2.0) ===');
const r6 = mdBuildPreset(tp, {decay:0, zoom:1, warp:1, sensitivity:2, tint:0, quality:1});
console.log('  append:', showAppended(tp, r6));

console.log('=== ZOOM (2.0) on preset that DOES NOT set zoom ===');
const r7 = mdBuildPreset(np, {decay:0, zoom:2, warp:1, sensitivity:1, tint:0, quality:1});
console.log('  bv.zoom:', r7.baseVals.zoom, '(orig:', np.baseVals.zoom, ') | append:', showAppended(np, r7));

console.log('=== DEFAULTS (all 1/0) — should NOT append anything ===');
const r8 = mdBuildPreset(tp, {decay:0, zoom:1, warp:1, sensitivity:1, tint:0, quality:1});
console.log('  unchanged:', r8.frame_eqs_str === tp.frame_eqs_str);

console.log('=== COMBINED (zoom=1.5, warp=0.5, decay=0.9, tint=0.3, sens=1.2) ===');
const r9 = mdBuildPreset(tp, {decay:0.9, zoom:1.5, warp:0.5, sensitivity:1.2, tint:0.3, quality:1});
console.log('  append:', showAppended(tp, r9));
