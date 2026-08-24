// Node test for the bespoke BPM analyzer. Generates synthetic "kick" patterns
// at known tempos and checks the detector returns the right BPM.
const { analyzeSamples } = require('./vendor/bpm-detect/bpm-detect.js');

const FS = 44100;
function makeKicks(bpm, seconds, opts = {}) {
  const N = Math.floor(FS * seconds);
  const buf = new Float32Array(N);
  const period = 60 / bpm; // seconds between kicks
  const bg = opts.noise || 0;       // background noise level
  const kickLen = Math.floor(FS * (opts.kickMs || 35) / 1000);
  let t = opts.startOffset || 0;
  let n = 0;
  while (t < seconds - 0.05) {
    const idx = Math.floor(t * FS);
    for (let j = 0; j < kickLen && idx + j < N; j++) {
      // decaying burst (a transient)
      buf[idx + j] += (1 - j / kickLen) * 0.95 * (opts.amp || 1);
    }
    t += period; n++;
  }
  for (let i = 0; i < N; i++) buf[i] += (Math.random() * 2 - 1) * bg;
  return buf;
}

const cases = [
  { name: '120 BPM house',      bpm: 120, secs: 20 },
  { name: '90 BPM hip-hop',     bpm: 90,  secs: 20 },
  { name: '140 BPM DnB',        bpm: 140, secs: 20 },
  { name: '128 BPM, noisy',     bpm: 128, secs: 20, noise: 0.05 },
  { name: '124 BPM, 60s',       bpm: 124, secs: 60 },
];

let pass = 0;
for (const c of cases) {
  const sig = makeKicks(c.bpm, c.secs, { noise: c.noise });
  const r = analyzeSamples(sig, FS);
  // accept within ±1.5 BPM of target (or its octave — half/double)
  const targets = [c.bpm, c.bpm / 2, c.bpm * 2];
  const ok = r.bpm != null && targets.some(t => Math.abs(r.bpm - t) <= 1.5);
  const mark = ok ? '✓' : '✗';
  console.log(`${mark} ${c.name.padEnd(20)} expected ${c.bpm}  ->  got ${r.bpm}  (conf ${r.confidence}, off ${r.offset}s)`);
  if (ok) pass++;
}
console.log(`\n${pass}/${cases.length} cases correct`);
process.exit(pass === cases.length ? 0 : 1);
