// Run the REAL script.js against the REAL dev.html DOM in jsdom, mocking media
// dimensions + layout, to see whether --cover-scale / --art-scale get set to fill
// values and to surface any init/runtime errors.
const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(require.resolve('./dev.html'), 'utf8');
const js   = fs.readFileSync(require.resolve('./script.js'), 'utf8');

const dom = new JSDOM(html, {
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  url: 'http://localhost:3000/dev.html'
});
const { window } = dom;
const { document } = window;

// ---- mocks for browser APIs jsdom lacks ----
window.requestAnimationFrame = (cb) => 0;       // don't actually loop
window.cancelAnimationFrame = () => {};
if (!window.MediaSession) window.MediaSession = function(){};
window.navigator.mediaSession = { setActionHandler(){}, metadata: null, playbackState: 'none' };
window.HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); };
window.HTMLMediaElement.prototype.pause = function(){};
// AudioContext stub (visualiser may touch it)
window.AudioContext = function(){ return { createMediaElementSource: function(){ return { connect: function(){} }; }, destination:{}, close: function(){} }; };
window.OfflineAudioContext = window.AudioContext;
if (!window.matchMedia) window.matchMedia = () => ({ matches:false, addListener(){}, addEventListener(){}, removeEventListener(){} });

// fetch stub
window.fetch = () => Promise.resolve({ ok:false, status:0, headers:{ get:()=>'0' }, json:()=>Promise.resolve({}), text:()=>Promise.resolve(''), blob:()=>Promise.resolve(new window.Blob()) });

// Media dimensions: when src is set, fake 'load'/'loadedmetadata' with dims.
const PLAYER = 430;
function patchMedia(proto, dims, evt){
  const desc = Object.getOwnPropertyDescriptor(proto.prototype || proto, 'src');
  // can't easily override; instead wrap addEventListener to fire after src set
}
// Simpler: intercept setAttribute/property? Instead, override naturalWidth/videoWidth via Object.defineProperty on instances later.
// We patch after script runs by waiting then dispatching events.

// getBoundingClientRect -> player size for .album elements
const origGetBCR = window.Element.prototype.getBoundingClientRect;
window.Element.prototype.getBoundingClientRect = function(){
  if (this.classList && this.classList.contains('album')) {
    return { left:0, top:0, right:PLAYER, bottom:PLAYER, width:PLAYER, height:PLAYER, x:0, y:0 };
  }
  return origGetBCR.call(this);
};

// Capture errors
const errors = [];
window.addEventListener('error', e => errors.push('window.error: ' + (e.error && e.error.stack || e.message)));
window.onerror = (m,s,l,c,err) => { errors.push(`onerror L${l}: ${m}` + (err && err.stack ? '\n'+err.stack : '')); return true; };

// run the script
try {
  const scriptEl = document.createElement('script');
  scriptEl.textContent = js;
  document.body.appendChild(scriptEl);
} catch (e) {
  console.log('SCRIPT THROW:', e.stack || e);
}

// Give init a tick
setTimeout(() => {
  // Define dimensions for the cover img and video, then dispatch load events.
  const cover = document.getElementById('cover');
  const video = document.getElementById('coverVideo');
  try {
    Object.defineProperty(cover, 'naturalWidth', { value: 450, configurable: true });
    Object.defineProperty(cover, 'naturalHeight', { value: 600, configurable: true });
    cover.complete = true;
    Object.defineProperty(video, 'videoWidth', { value: 1280, configurable: true });
    Object.defineProperty(video, 'videoHeight', { value: 720, configurable: true });
    Object.defineProperty(video, 'readyState', { value: 2, configurable: true });
    video.style.display = 'block';
    // dispatch events
    cover.dispatchEvent(new window.Event('load'));
    video.dispatchEvent(new window.Event('loadedmetadata'));
  } catch (e) { console.log('DISPATCH THROW:', e); }

  setTimeout(() => {
    const player = document.getElementById('player') || (cover && cover.closest('.music-player')) || document.querySelector('.music-player');
    const cs = window.getComputedStyle(player).getPropertyValue('--cover-scale').trim();
    const as = window.getComputedStyle(player).getPropertyValue('--art-scale').trim();
    const va = player && player.classList.contains('video-active');
    console.log('=== RESULT ===');
    console.log('player found:', !!player, '| video-active:', va);
    console.log('--cover-scale =', JSON.stringify(cs), '(expect ~1.78 for 1280x720, or ~1.33 if it used the 450x600 img)');
    console.log('--art-scale   =', JSON.stringify(as), '(expect ~1.33 for 450x600 portrait)');
    console.log('cover img display =', cover.style.display, '| video display =', video.style.display);
    console.log('=== ERRORS (' + errors.length + ') ===');
    errors.slice(0,15).forEach(e => console.log(e));
    process.exit(0);
  }, 1200);
}, 200);
