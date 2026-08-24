// Definitive test: prove cover <img> and video bind to INDEPENDENT transform
// variables using the REAL styles.css. jsdom does not SUBSTITUTE var() into
// computed transform, but it DOES report which var() each rule references —
// which is exactly what determines independence.
const fs = require('fs');
const { JSDOM } = require('jsdom');

const css = fs.readFileSync(require.resolve('./styles.css'), 'utf8');

const html = `<!DOCTYPE html><html><body>
  <div class="music-player" id="player">
    <img class="album" id="cover" src="x" />
    <video id="coverVideo" class="album" src="y"></video>
  </div>
</body></html>`;

const dom = new JSDOM(html);
const { document } = dom.window;
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

const player  = document.getElementById('player');
const cover   = document.getElementById('cover');
const coverVideo = document.getElementById('coverVideo');
const read = (el) => dom.window.getComputedStyle(el).getPropertyValue('transform').trim();

let pass = true;
const check = (label, cond) => { console.log(`${cond?'PASS':'FAIL'}: ${label}`); if(!cond) pass=false; };

// === VIDEO TRACK (.video-active present) ===
player.classList.add('video-active');
const cvCov = read(cover);
const cvVid = read(coverVideo);
console.log('\n[video-active] cover  ->', cvCov);
console.log('[video-active] video  ->', cvVid);
check('video track: cover <img> binds to --art-*  (independent of video)',
      cvCov.includes('art-dx') && !cvCov.includes('cover-dx'));
check('video track: video binds to --cover-*  (independent of cover)',
      cvVid.includes('cover-dx') && !cvVid.includes('art-dx'));
check('video track: cover & video reference DIFFERENT variables',
      cvCov.includes('art-dx') && cvVid.includes('cover-dx'));

// === AUDIO-ONLY TRACK (no .video-active) ===
player.classList.remove('video-active');
const aoCov = read(cover);
const aoVid = read(coverVideo);
console.log('\n[audio-only]   cover  ->', aoCov);
console.log('[audio-only]   video  ->', aoVid);
check('audio-only: cover <img> uses --cover-* (unchanged legacy behaviour)',
      aoCov.includes('cover-dx'));

console.log(`\nRESULT: ${pass ? 'ALL CHECKS PASSED — artwork & video are independently bound' : 'SOME CHECKS FAILED'}`);
process.exit(pass ? 0 : 1);
