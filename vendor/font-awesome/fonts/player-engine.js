// GLOBAL ERROR CATCHER — shows any JS error on screen so we can see it
window.addEventListener('error', function(e){
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:red;color:white;font:14px monospace;padding:12px;white-space:pre-wrap;';
  d.textContent = 'JS ERROR: ' + (e.message || e.error) + '\n' + (e.error && e.error.stack ? e.error.stack.split('\n').slice(0,3).join('\n') : '');
  document.body.appendChild(d);
});
window.addEventListener('unhandledrejection', function(e){
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:darkred;color:white;font:14px monospace;padding:12px;white-space:pre-wrap;';
  d.textContent = 'PROMISE ERROR: ' + (e.reason && e.reason.message ? e.reason.message : e.reason);
  document.body.appendChild(d);
});

(function () {
  // DOM references
  const el = {
    body: document.body,

    player: document.getElementById('player'),
    audio: document.getElementById('audio'),
    cover: document.getElementById('cover'),
    coverVideo: document.getElementById('coverVideo'),
    plCircle: document.getElementById('playlistCircle'),
    plCover: document.getElementById('plCover'),
    plVideo: document.getElementById('plVideo'),
    plDragOverlay: document.getElementById('plDragOverlay'),

    btnMute: document.getElementById('btnMute'),
    btnShare: document.getElementById('btnShare'),
    btnPlaylist: document.getElementById('btnPlaylist'),
    volume: document.getElementById('volume'),
    volumeFill: document.getElementById('volumeFill'),

    seeker: document.getElementById('seeker'),
    btnBack: document.getElementById('btnBack'),
    btnPlay: document.getElementById('btnPlay'),
    btnForward: document.getElementById('btnForward'),
    timeCurrent: document.getElementById('timeCurrent'),
    timeDuration: document.getElementById('timeDuration'),

    title: document.getElementById('title'),
    artist: document.getElementById('artist'),

    seekSVG: document.getElementById('seekSVG'),
    arcTrack: document.getElementById('arcTrack'),
    arcProgress: document.getElementById('arcProgress'),
    arcKnob: document.getElementById('arcKnob'),

    dragOverlay: document.getElementById('dragOverlay'),

    // Playlist DOM
    playlistCircle: document.getElementById('playlistCircle'),
    plList: document.getElementById('plList'),
    plScrollSVG: document.getElementById('plScrollSVG'),
    plArcTrack: document.getElementById('plArcTrack'),
    plArcProgress: document.getElementById('plArcProgress'),
    plArcKnob: document.getElementById('plArcKnob'),
    menuLayer: document.getElementById('menuLayer'),

    // editor
    fileAudio: document.getElementById('fileAudio'),
    fileCover: document.getElementById('fileCover'),
    fileVideo: document.getElementById('fileVideo'),
    btnClearVideo: document.getElementById('btnClearVideo'),
    useVideoAudio: document.getElementById('useVideoAudio'),
    videoLoop: document.getElementById('videoLoop'),
    resumeOnlyIfWasPlaying: document.getElementById('resumeOnlyIfWasPlaying'),

    btnCoverDrag: document.getElementById('btnCoverDrag'),
    btnCoverReset: document.getElementById('btnCoverReset'),

    inputTitle: document.getElementById('inputTitle'),
    inputArtist: document.getElementById('inputArtist'),
    btnApplyMeta: document.getElementById('btnApplyMeta'),

    // Colors
    paletteChoice: document.getElementById('paletteChoice'),
    paletteRandom: document.getElementById('paletteRandom'),
    paletteRandomState: document.getElementById('paletteRandomState'),
    paletteSwatches: document.getElementById('paletteSwatches'),
    btnRestoreMetaCover: document.getElementById('btnRestoreMetaCover'),
    colorPanel: document.getElementById('colorPanel'),
    colorProg1: document.getElementById('colorProg1'),
    colorProg2: document.getElementById('colorProg2'),
    colorProg3: document.getElementById('colorProg3'),
    colorProgTrack: document.getElementById('colorProgTrack'),
    colorPlayBtn: document.getElementById('colorPlayBtn'),
    colorPlayGlyph: document.getElementById('colorPlayGlyph'),
    colorYoke: document.getElementById('colorYoke'),
    colorFFREW: document.getElementById('colorFFREW'),
    colorTimeBg: document.getElementById('colorTimeBg'),
    colorTimeFg: document.getElementById('colorTimeFg'),
    colorTopIcons: document.getElementById('colorTopIcons'),
    colorTitleText: document.getElementById('colorTitleText'),
    colorArtistText: document.getElementById('colorArtistText'),
    colorKnobInner: document.getElementById('colorKnobInner'),
    colorKnobOuter: document.getElementById('colorKnobOuter'),
    colorPlBase: document.getElementById('colorPlBase'),
    colorPlGrad: document.getElementById('colorPlGrad'),
    colorPlProg1: document.getElementById('colorPlProg1'),
    colorPlProg2: document.getElementById('colorPlProg2'),
    colorPlProg3: document.getElementById('colorPlProg3'),

    filePanelImage: document.getElementById('filePanelImage'),
    btnClearPanelImage: document.getElementById('btnClearPanelImage'),
    btnPanelDrag: document.getElementById('btnPanelDrag'),
    btnPanelReset: document.getElementById('btnPanelReset'),

    coverZoom: document.getElementById('coverZoom'),
    coverZoomVal: document.getElementById('coverZoomVal'),
    panelZoom: document.getElementById('panelZoom'),
    panelZoomVal: document.getElementById('panelZoomVal'),
    panelBlend: document.getElementById('panelBlend'),
    panelBlendVal: document.getElementById('panelBlendVal'),
    panelGrey: document.getElementById('panelGrey'),
    panelBlendMode: document.getElementById('panelBlendMode'),

    btnApplyColors: document.getElementById('btnApplyColors'),
    btnResetTheme: document.getElementById('btnResetTheme'),

    // playlist manager (dev page)
    pmFileInput: document.getElementById('pmFileInput'),
    pmUrlInput: document.getElementById('pmUrlInput'),
    pmAddUrlBtn: document.getElementById('pmAddUrlBtn'),
    pmClearBtn: document.getElementById('pmClearBtn'),
    pmDrop: document.getElementById('pmDrop'),
    editorDrop: document.getElementById('editorDrop'),
    pmList: document.getElementById('pmList'),
    btnSaveTrackTheme: document.getElementById('btnSaveTrackTheme'),
    btnResetTrackTheme: document.getElementById('btnResetTrackTheme'),
    btnSaveMasterTheme: document.getElementById('btnSaveMasterTheme'),
    masterThemeToggle: document.getElementById('masterThemeToggle'),
    vizCanvas: document.getElementById('vizCanvas')
  };

  // overlay knob (visible) for main progress wheel
  const dash = document.querySelector('.music-player .dash');
  const knobOverlay = document.createElement('div');
  knobOverlay.className = 'knob-overlay';
  dash.appendChild(knobOverlay);

  const state = {
    dragging: false, wasPlaying: false, pathLength: 0,
    dragMode: null, startX: 0, startY: 0, startDx: 0, startDy: 0,
    master: null, rafId: null,

    // playlist
    open: false,
    currentIndex: 0,
    plPathLen: 0,

    // v103: has the user actively picked a visualiser this session? On the
    // EDITOR page the media window shows the cover (visualiser OFF) until
    // they do — no more unrequested coasters on every track.
    vizUserPicked: false,

    // persistence / uploads
    mediaURLs: { audio: null, cover: null, panel: null, video: null },
    mediaData: { audio: null, cover: null, panel: null, video: null },
    serverTimer: null,
    pollId: null,
    lastAppliedUpdatedAt: 0,
    themeFromServer: null,
    masterOn: false,
    playlistFromStorage: false,
    playlistDirty: false,
    // blob: URLs created in THIS document session. Any other blob: URL is
    // dead (previous session) and must be revived from the server copy —
    // otherwise clicking a saved track plays silence forever.
    liveBlobs: new Set(),
    // theme save queue (retry + guaranteed delivery)
    themeSaving: false,
    themeDirty: false,
    themeAttempts: 0,
    // the OVERALL look (what the server theme's vars should hold). Per-track
    // themes applied to the live player must NEVER overwrite this — that's
    // what made the default look go red after a drop-derived theme.
    globalVars: null,
    // set by true user colour edits (typed hex / picker save / swatch /
    // eyedropper); consumed by applyColors to snapshot the global look
    _userColourEdit: false,
    // snapshot of the GLOBAL visualiser config (what the server theme's viz
    // should hold). Per-track viz applied to the live player must NEVER
    // overwrite this — that's what made the global default become starfield.
    globalViz: null,
    // one-shot artwork fallback guard (per track load)
    _coverFallbackTried: false
  };

  let prevAudioURL=null, prevCoverURL=null, prevPanelImgURL=null, prevVideoURL=null;

  // A blob: URL is dead when it was not created in this document session
  // (blob URLs die with the page that made them). Dead blobs must never be
  // assigned to <audio>/<video>/<img> — the load silently fails.
  function isDeadBlob(url){
    return typeof url === 'string' && url.startsWith('blob:') && !state.liveBlobs.has(url);
  }

  // Revoke a scratch blob URL ONLY if no playlist track (or live element)
  // still references it. Revoking a blob that a saved track still points at
  // makes that track unplayable for the rest of the session.
  function revokeIfUnused(url){
    if (!url || !String(url).startsWith('blob:')) return;
    const used = demoPlaylist.some(t => t && (t.audio === url || t.cover === url || t.video === url || t._blobURL === url));
    const liveEl = el.audio.src === url || el.cover.src === url || el.coverVideo.src === url;
    const panelVar = (getComputedStyle(document.documentElement).getPropertyValue('--panel-image') || '').includes(url);
    if (!used && !liveEl && !panelVar){
      try { URL.revokeObjectURL(url); } catch {}
      state.liveBlobs.delete(url);   // now dead — tracks still pointing at it get revived from the server
    }
  }

  // Helpers
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
  const fmt = s => { if(!isFinite(s)||s<0) s=0; const m=Math.floor(s/60); const ss=Math.floor(s%60).toString().padStart(2,'0'); return `${m}:${ss}`; };
  const getVarNum = (name, fallback=0)=>parseFloat(getComputedStyle(el.player).getPropertyValue(name))||fallback;
  const setVarNum = (name, num)=>el.player.style.setProperty(name, String(num));
  const setVarPx  = (name, px)=>el.player.style.setProperty(name, `${Math.round(px)}px`);
  // Returns the correct var prefix for the video transform based on cinema state:
  // --cinema-* in cinema mode, --cover-* in non-cinema. This enables independent
  // framing without a JS swap — the .cinema class switches which vars the CSS reads.
  const coverVar = (suffix)=> (el.player.classList.contains('cinema') ? '--cinema-' : '--cover-') + suffix;
  // Same pattern for the visualiser: --viz-* in non-cinema, --viz-cinema-* in cinema.
  const vizVar = (suffix)=> (el.player.classList.contains('cinema') ? '--viz-cinema-' : '--viz-') + suffix;
  // Cover-ART tools target the cover IMAGE: it reads --art-* when a video
  // backdrop is active (.video-active), otherwise --cover-* (incl. non-video
  // tracks and cinema). Without this the artwork wouldn't move on non-video.
  const artVar = (suffix)=>{
    if (el.player.classList.contains('cinema')) return '--cinema-art-' + suffix;
    return (el.player.classList.contains('video-active') ? '--art-' : '--cover-') + suffix;
  };
  const setRootVar = (name, val)=>document.documentElement.style.setProperty(name, val);
  // Route cross-origin media through our same-origin /proxy so the Web Audio
  // analyser receives data (a tainted cross-origin <audio>/<video> silences
  // the analyser). Same-origin / relative / blob: / data: pass through as-is.
  const proxiedMediaUrl = (u)=>{
    const s = String(u || '');
    if (!/^https?:\/\//i.test(s)) return s;
    try { if (new URL(s, location.href).origin === location.origin) return s; } catch { return s; }
    return '/proxy?url=' + encodeURIComponent(s);
  };
  const HEX=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  const normHex=v=>{if(!v)return null;v=v.trim();if(!v.startsWith('#'))v='#'+v;if(!HEX.test(v))return null;if(v.length===4)v='#'+[...v.slice(1)].map(c=>c+c).join('');return v.toLowerCase();};
  const getUIVolume = ()=> clamp((parseFloat(el.volumeFill.style.width)||75)/100, 0, 1);

  // ===== Audio format support (FM-02..FM-06, FM-09) =====
  // Maps file extensions to the MIME types browsers expect for <audio>, so
  // canPlayType() can tell us (and the user) whether a format will play in
  // THIS browser before we commit to it.
  const AUDIO_MIME_BY_EXT = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.ogg': 'audio/ogg',
    '.oga': 'audio/ogg',
    '.opus': 'audio/ogg; codecs=opus',
    '.m4a': 'audio/mp4',
    '.mp4': 'audio/mp4',
    '.aac': 'audio/aac',
    '.webm': 'audio/webm',
    '.aiff': 'audio/aiff',
    '.aif': 'audio/aiff',
    '.wma': 'audio/x-ms-wma'
  };
  const extOf = (name) => { const i = String(name || '').lastIndexOf('.'); return i >= 0 ? String(name).slice(i).toLowerCase() : ''; };
  // returns 'probably' | 'maybe' | '' (unsupported) | 'unknown'
  function audioSupportFor(name, mimeHint){
    const mime = (mimeHint && String(mimeHint).startsWith('audio/')) ? mimeHint
               : AUDIO_MIME_BY_EXT[extOf(name)] || null;
    if (!mime) return 'unknown';
    try { return el.audio.canPlayType(mime) || ''; } catch { return 'unknown'; }
  }
  function formatLabel(ext){
    const m = {
      '.mp3': 'MP3', '.wav': 'WAV', '.flac': 'FLAC', '.ogg': 'OGG Vorbis',
      '.oga': 'OGG Vorbis', '.opus': 'Opus', '.m4a': 'AAC/M4A', '.mp4': 'AAC/M4A',
      '.aac': 'AAC', '.webm': 'WebM', '.aiff': 'AIFF', '.aif': 'AIFF', '.wma': 'WMA'
    };
    return m[ext] || (ext ? ext.slice(1).toUpperCase() : 'file');
  }
  // Friendly, human-readable warning for a format the browser can't play.
  function unsupportedHint(ext){
    const fmt = formatLabel(ext);
    if (ext === '.aiff' || ext === '.aif' || ext === '.wma')
      return '⚠ ' + fmt + ' is not supported by web browsers — convert it to FLAC, WAV or MP3 and try again.';
    return '⚠ ' + fmt + ' (' + ext + ') is not supported by this browser — it may play silently or fail. Convert to MP3/WAV/FLAC/OGG for best compatibility.';
  }
  // Convenience: returns true when the format is playable ('probably'/'maybe').
  const isAudioSupported = (name, mimeHint) => {
    const st = audioSupportFor(name, mimeHint);
    return st === 'probably' || st === 'maybe' || st === 'unknown';
  };

  // ===== Version + persistence + upload infrastructure =====
  // The badge version is DERIVED from the script's own URL (?v=X), so it
  // always matches the file the browser actually loaded.
  const PLAYER_VERSION = (function(){
    try {
      const src = document.currentScript && document.currentScript.src;
      if (src){
        const m = src.match(/[?&]v=([0-9a-zA-Z]+)/);
        if (m) return 'v' + m[1];
      }
    } catch {}
    return 'v11';

  window.__playerVersion = PLAYER_VERSION;
  const MAX_UPLOAD_BYTES = 95 * 1024 * 1024;   // mirror the server cap
  const STORAGE_KEY = 'roundPlayer.theme.v1';
  let themeRestored = false;

  const THEME_VARS = [
    '--panel-fill','--progress-start','--progress-mid','--progress-end','--progress-track',
    '--btn-play-bg','--btn-play-fg','--controls-bg','--ff-rew-color',
    '--timestamp-bg','--timestamp-fg','--top-icons-color',
    '--title-text-color','--artist-text-color','--knob-inner','--knob-outer',
    '--cover-dx','--cover-dy','--cover-scale','--panel-dx','--panel-dy','--panel-scale'
  ];

  function isEditorPage(){ return !!el.fileAudio; }

  function fetchWithTimeout(url, opts, ms){
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms || 8000);
    return fetch(url, Object.assign({}, opts, { signal: ctrl.signal }))
      .catch(() => null)
      .finally(() => clearTimeout(t));
  }

  function setSyncStatus(msg, ok){
    const s = document.getElementById('syncStatus');
    if (!s) return;
    s.textContent = msg;
    s.className = 'sync-status ' + (ok ? 'ok' : 'warn');
  }

  // Deliver the theme to the server with retries. A single dropped/timed-out
  // POST must never stall the user (observed: while a big raw upload ties up
  // the browser's connection, the 8s theme save aborted -> "Server save
  // failed" and the server never received it). Each attempt re-serialises
  // the LATEST state, so edits made during retries are never lost.
  function pushThemeToServer(){
    if (state.themeSaving){ state.themeDirty = true; return; }   // in-flight loop picks it up
    state.themeSaving = true;
    state.themeDirty = false;
    state.themeAttempts = 0;
    const attempt = (n, total) => {
      let body = null;
      try { body = JSON.stringify(getThemeData()); } catch { body = null; }
      if (body === null){ state.themeSaving = false; return; }
      fetchWithTimeout('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      }, 20000)
        .then(res => {
          if (res && res.ok){
            if (state.themeDirty && total < 8){ state.themeDirty = false; attempt(0, total + 1); return; }
            state.themeSaving = false;
            state.themeAttempts = 0;
            setSyncStatus('✓ Saved to server', true);
          } else if (n < 3){
            setSyncStatus('⚠ Server save failed — retrying…', false);
            setTimeout(() => attempt(n + 1, total), [1000, 3000, 6000][n]);
          } else {
            state.themeSaving = false;
            state.themeAttempts = 0;
            setSyncStatus('⚠ Server save failed', false);
          }
        })
        .catch(() => {
          if (n < 3){
            setSyncStatus('⚠ Server save failed — retrying…', false);
            setTimeout(() => attempt(n + 1, total), [1000, 3000, 6000][n]);
          } else {
            state.themeSaving = false;
            state.themeAttempts = 0;
            setSyncStatus('⚠ Server save failed', false);
          }
        });
    };
    attempt(0, 0);
  }

  function getThemeData(){
    const data = { v: 1, vars: {}, title: el.title.textContent, artist: el.artist.textContent };
    // The server theme's vars = the OVERALL look (state.globalVars), NOT
    // whatever per-track theme happens to be on the live player right now —
    // a drop-derived artwork theme must never repaint the global default.
    const gv = state.globalVars || currentThemeVars();
    for (const name of THEME_VARS){
      const val = gv[name];
      if (val) data.vars[name] = String(val).trim();
    }
    // playlist panel colours live on :root
    for (const k of ['--pl-base','--pl-grad','--pl-prog1','--pl-prog2','--pl-prog3']){
      const val = gv[k];
      if (val) data.vars[k] = String(val).trim();
    }
    for (const k of ['audio','cover','panel','video']){
      if (state.mediaURLs[k]) data[k] = state.mediaURLs[k];
      if (state.mediaData[k]) data[k + 'Data'] = state.mediaData[k];
    }
    if (state.masterTheme) data.masterTheme = state.masterTheme;
    // Entry S29b: ship look presets to the server so they survive browser resets
    data.lookPresets = lookPresets || [];
    // visualiser config ships with the theme so the deployed player
    // inherits the editor's visualiser + settings
    data.viz = JSON.parse(JSON.stringify(state.globalViz || viz));
    // global settings ship too, so a fresh deployed browser inherits them
    data.global = JSON.parse(JSON.stringify(gs));
    // the full playlist with per-track themes ships to the server too, so a
    // fresh browser (no localStorage) still gets each track's saved look.
    // NEVER ship blob: URLs — they die with this browser session and would
    // poison the server theme for every other browser. Prefer the last
    // successfully uploaded server copy (t._server*), else omit the field.
    data.tracks = demoPlaylist.slice(0, 40).map(t => {
      const srvOf = (k, srvK) => {
        const v = t[k];
        if (typeof v === 'string' && !v.startsWith('blob:')) return v;
        return t[srvK] || null;
      };
      return {
        title: t.title, artist: t.artist,
        audio: srvOf('audio', '_serverAudio'), cover: srvOf('cover', '_serverCover'),
        video: srvOf('video', '_serverVideo'),
        bandcamp: t.bandcamp, theme: t.theme, liked: !!t.liked,
        viz: t.viz,
        // crossfade + transform settings MUST ship too — otherwise a fresh
        // browser rebuild from the server loses the user's crossfades
        transition: t.transition || null,
        transform: t.transform || null,
        // DJ Phase 2: detected tempo + beat phase (deployed player runs
        // beat-synced transitions from these without re-analyzing)
        bpm: (typeof t.bpm === 'number') ? t.bpm : null,
        bpmConfidence: (typeof t.bpmConfidence === 'number') ? t.bpmConfidence : null,
        bpmOffset: (typeof t.bpmOffset === 'number') ? t.bpmOffset : null,
        bpmSource: t.bpmSource || null,
        cinema: (t.cinema == null ? null : !!t.cinema),
        cinemaStyle: t.cinemaStyle || null,
        cinemaTransform: t.cinemaTransform || null,
        // v103: per-track wave-panel texture settings (image/grey/tint/blend)
        panelImage: srvOf('panelImage', '_serverPanel'),
        panelImageGrey: (typeof t.panelImageGrey === 'string' && t.panelImageGrey.indexOf('data:') === 0) ? t.panelImageGrey : null,
        panelGrey: !!t.panelGrey,
        panelBlend: (typeof t.panelBlend === 'number') ? t.panelBlend : 0,
        panelBlendMode: t.panelBlendMode || 'normal',
        _audioName: t._audioName || null, _coverName: t._coverName || null, _videoName: t._videoName || null,
        _panelImageName: t._panelImageName || null
      };
    });
    return data;
  }

  function saveTheme(opts){
    // v102 FIX: never WRITE the theme before it has been RESTORED — boot-time
    // saves (e.g. loadTrack -> writeThemeToUI -> applyColors) would clobber
    // the previously saved theme (vars like --panel-blend snapshotted as the
    // CSS default) before restoreTheme gets to read it.
    if (!themeRestored) return;
    // The SERVER theme is only written when the user explicitly saves a
    // track theme (saveCurrentAsTrackTheme passes {server:true}) or resets.
    // Everything else (slider wiggles, picker tweaks, uploads) only updates
    // localStorage for the current session — otherwise the server theme
    // (the deployed player's source of truth) would be clobbered by every
    // intermediate edit.
    if (opts && opts.localOnly){
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(getThemeData())); } catch {}
      return;
    }
    if (!opts || !opts.server) return;      // silent no-op unless explicit
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getThemeData()));
    } catch {}
    clearTimeout(state.serverTimer);
    if (window.__dbgSave) window.__dbgSave.push({ t: 'saveTheme server', hasTheme: !!demoPlaylist[state.currentIndex] && !!demoPlaylist[state.currentIndex].theme, stack: (new Error().stack || '').split('\n').slice(2, 6).join(' < ') });
    state.serverTimer = setTimeout(() => pushThemeToServer(), 250);
  }

  function applyThemeData(data){
    if (!data) return;
    state.themeFromServer = data;
    // visualiser config from the server theme (deployed player inherits).
    // On the DEV page the server viz must NOT override the user's explicit
    // local settings (e.g. the fog slider) — it only seeds a fresh browser
    // that has no local preferences yet. The deployed page has no editor, so
    // there the server viz is always authoritative.
    const hasLocalViz = (() => { try { return localStorage.getItem(VIZ_KEY) !== null; } catch { return false; } })();
    if (data.viz && typeof data.viz === 'object' && !isEditorPage()){
      viz = Object.assign(viz, data.viz);
      vizSave();
      vizSyncUI();
      applyViz();
    }
    // global settings: only seed a FRESH browser (no local prefs yet); the
    // user's live global settings always win on the editor page
    const hasLocalGlobal = (() => { try { return localStorage.getItem(GLOBAL_KEY) !== null; } catch { return false; } })();
    if (data.global && typeof data.global === 'object' && !hasLocalGlobal){
      gs = Object.assign(gs, data.global);
      gsSave();
      applyGlobalSettings();
      gsSyncUI();
    }
    // bootstrap may have injected the server playlist into the page HTML —
    // merge it synchronously so the first track's theme is correct on paint.
    // This runs ONLY for a browser with NO saved local playlist; the local
    // list is authoritative when it exists (playlistFromStorage).
    if (window.__serverTracks && Array.isArray(window.__serverTracks) && !state.playlistFromStorage){
      // SERVER PLAYLIST IS EMPTY (cleared): show the empty state. NEVER write
      // the empty list back to the server here — that clobbered the editor's
      // saved copy (the auto-mirror bug).
      if (!window.__serverTracks.length){
        demoPlaylist.length = 0;
        state.currentIndex = 0;
        renderPlaylist();
        renderPlaylistManager();
        loadTrack(0, false);
        delete window.__serverTracks;
        return;
      }
      // fresh browser: the SERVER list IS the playlist. Rebuild from scratch
      // (no demo seed, no length-arithmetic that could truncate a richer
      // list) and carry EVERY per-track field — including transition, so
      // crossfades survive a fresh browser's rebuild.
      demoPlaylist.length = 0;
      window.__serverTracks.forEach((st) => {
        demoPlaylist.push({
          title: (st && st.title) || 'Track ' + (demoPlaylist.length + 1),
          artist: (st && st.artist) || 'Unknown',
          audio: (st && st.audio) || '',
          cover: (st && st.cover) || defaultCoverFromName((st && st.title) || 'Track'),
          video: (st && st.video) || null,
          bandcamp: (st && st.bandcamp) || '',
          theme: (st && st.theme) || null,
          transition: (st && st.transition) || null,
          transform: (st && st.transform) || null,
          bpm: (st && typeof st.bpm === 'number') ? st.bpm : null,
          bpmConfidence: (st && typeof st.bpmConfidence === 'number') ? st.bpmConfidence : null,
          bpmOffset: (st && typeof st.bpmOffset === 'number') ? st.bpmOffset : null,
          bpmSource: (st && st.bpmSource) || null,
          cinema: (st && st.cinema == null ? null : !!(st && st.cinema)),
          cinemaStyle: (st && st.cinemaStyle) || null,
          cinemaTransform: (st && st.cinemaTransform) || null,
          viz: (st && st.viz) || null,
          liked: !!(st && st.liked),
          _audioName: (st && st._audioName) || null,
          _coverName: (st && st._coverName) || null,
          _videoName: (st && st._videoName) || null,
          // v103: per-track wave-panel texture settings
          panelImage: (st && st.panelImage) || null,
          panelImageGrey: (st && st.panelImageGrey) || null,
          panelGrey: !!(st && st.panelGrey),
          panelBlend: (typeof (st && st.panelBlend) === 'number') ? st.panelBlend : 0,
          panelBlendMode: (st && st.panelBlendMode) || 'normal',
          _panelImageName: (st && st._panelImageName) || null
        });
      });
      renderPlaylist();
      renderPlaylistManager();
      healOversizedCovers();
      checkMissingAudio();
      savePlaylist();
      loadTrack(state.currentIndex, false);
      delete window.__serverTracks;
      return;   // skip the generic vars application (per-track load wins)
    }
    state.themeGen = (state.themeGen || 0) + 1;   // invalidate pending derives
    if (state._themeRaf){ cancelAnimationFrame(state._themeRaf); state._themeRaf = null; }   // stop any running crossfade
    if (!data.vars) return;
    // server playlist (fresh browser, no local list): the server list IS the
    // playlist. Rebuild from scratch — NEVER truncate a longer local list
    // (that was deleting the user's tracks), and carry transition/transform
    // so crossfades survive a fresh browser's rebuild.
    const mergedTracks = Array.isArray(data.tracks) && data.tracks.length && !state.playlistFromStorage;
    if (mergedTracks){
      demoPlaylist.length = 0;
      data.tracks.forEach((st) => {
        demoPlaylist.push({
          title: (st && st.title) || 'Track ' + (demoPlaylist.length + 1),
          artist: (st && st.artist) || 'Unknown',
          audio: (st && st.audio) || '',
          cover: (st && st.cover) || defaultCoverFromName((st && st.title) || 'Track'),
          video: (st && st.video) || null,
          bandcamp: (st && st.bandcamp) || '',
          theme: (st && st.theme) || null,
          transition: (st && st.transition) || null,
          transform: (st && st.transform) || null,
          bpm: (st && typeof st.bpm === 'number') ? st.bpm : null,
          bpmConfidence: (st && typeof st.bpmConfidence === 'number') ? st.bpmConfidence : null,
          bpmOffset: (st && typeof st.bpmOffset === 'number') ? st.bpmOffset : null,
          bpmSource: (st && st.bpmSource) || null,
          cinema: (st && st.cinema == null ? null : !!(st && st.cinema)),
          cinemaStyle: (st && st.cinemaStyle) || null,
          cinemaTransform: (st && st.cinemaTransform) || null,
          viz: (st && st.viz) || null,
          liked: !!(st && st.liked),
          _audioName: (st && st._audioName) || null,
          _coverName: (st && st._coverName) || null,
          _videoName: (st && st._videoName) || null,
          // v103: per-track wave-panel texture settings
          panelImage: (st && st.panelImage) || null,
          panelImageGrey: (st && st.panelImageGrey) || null,
          panelGrey: !!(st && st.panelGrey),
          panelBlend: (typeof (st && st.panelBlend) === 'number') ? st.panelBlend : 0,
          panelBlendMode: (st && st.panelBlendMode) || 'normal',
          _panelImageName: (st && st._panelImageName) || null
        });
      });
      renderPlaylist();
      renderPlaylistManager();
      healOversizedCovers();
      healStaleThemes();
      checkMissingAudio();
      savePlaylist();
    }
    if (data.masterTheme && Object.keys(data.masterTheme).length){
      state.masterTheme = data.masterTheme;
      try { localStorage.setItem(STORAGE_KEY + '.master', JSON.stringify(data.masterTheme)); } catch {}
    }
    if (mergedTracks){
      // per-track load already applied the current track's own look;
      // skip the generic vars/title/media application below — but DO adopt
      // the server's uploaded media (audio/cover/video) for the current track
      const cur = demoPlaylist[state.currentIndex];
      const absM = u => { try { return new URL(u, location.href).href; } catch { return u; } };
      if (cur){
        // adopt THIS track's own server media (never the theme's global
        // audio/cover/video — those are the last-uploaded values and would
        // bleed onto the wrong track)
        const stCur = (Array.isArray(data.tracks) && data.tracks[state.currentIndex]) || {};
        // 'fresh' = a blob created THIS session (prev*URL) — always keep it;
        // stale stored blobs fall back to this track's server media.
        const fresh = (own, prev) => String(own||'').startsWith('blob:') && own === prev;
        const adopt = (own, srv, prev) => {
          if (own && (!String(own).startsWith('blob:') || fresh(own, prev))) return own;
          if (srv && !String(srv).startsWith('blob:')) return srv;
          return own || srv || null;
        };
        const pa = adopt(cur.audio, stCur.audio, prevAudioURL);
        const pc = adopt(cur.cover, stCur.cover, prevCoverURL);
        const pv = adopt(cur.video, stCur.video, prevVideoURL);
        if (pa) cur.audio = pa;
        if (pc) cur.cover = pc;
        if (pv) cur.video = pv;
      }
      savePlaylist();
      loadTrack(state.currentIndex, false);
      return;
    }
    for (const name of THEME_VARS){
      if (name in data.vars) el.player.style.setProperty(name, data.vars[name]);
    }
    if (data.vars['--pl-base']) setRootVar('--pl-base', data.vars['--pl-base']);
    if (data.vars['--pl-grad']) setRootVar('--pl-grad', data.vars['--pl-grad']);
    if (data.vars['--pl-prog1']) setRootVar('--pl-prog1', data.vars['--pl-prog1']);
    if (data.vars['--pl-prog2']) setRootVar('--pl-prog2', data.vars['--pl-prog2']);
    if (data.vars['--pl-prog3']) setRootVar('--pl-prog3', data.vars['--pl-prog3']);
    snapshotGlobalVars();   // server vars ARE the overall look
    // PER-TRACK THEMES WIN over the global vars: a returning browser gets the
    // server's overall look applied above, but the CURRENT track's saved look
    // (artwork-derived or explicit) must still show — same as a fresh browser.
    // Applied AFTER the snapshot so the global look is never replaced by a
    // per-track look.
    const curTrackTheme = (() => {
      const c = demoPlaylist[state.currentIndex];
      if (!c) return null;
      const eff = effectiveTheme(c);
      return eff && Object.keys(eff).length ? eff : null;
    })();
    if (curTrackTheme){
      const tvs = themeToVars(curTrackTheme);
      Object.keys(tvs).forEach(n => {
        if (!tvs[n]) return;
        if (n.startsWith('--pl-')) setRootVar(n, tvs[n]);
        else el.player.style.setProperty(n, tvs[n]);
      });
    }
    // v102: theme vars (incl. --panel-blend) just landed — reflect the
    // blend slider so the editor matches what the player shows
    if (typeof syncPanelBlendUI === 'function') syncPanelBlendUI();
    if (data.title)  el.title.textContent  = data.title;
    if (data.artist) el.artist.textContent = data.artist;
    const abs = u => { try { return new URL(u, location.href).href; } catch { return u; } };
    const mediaVal = (urlKey, dataKey) => (data[urlKey] || data[dataKey] || null);
    // Media belongs to the CURRENT TRACK, not the theme's global fields
    // (the global fields are just the last-saved values and would yank the
    // player to the wrong track's media on every server restore).
    const curTrk = demoPlaylist[state.currentIndex];
    const i0 = state.currentIndex;
    const isSeedMedia = (key, url) => {
      const seed = SEED_TRACK_MEDIA && SEED_TRACK_MEDIA[i0] && SEED_TRACK_MEDIA[i0][key];
      return !!seed && !!url && abs(url) === abs(seed);
    };
    // the track's OWN media wins — UNLESS it's still the untouched seed
    // default, in which case the theme's global media (e.g. a saved data-URI
    // cover) applies
    const audio = (curTrk && curTrk.audio && !isSeedMedia('audio', curTrk.audio)) ? curTrk.audio : mediaVal('audio', 'audioData');
    if (audio && abs(audio) !== el.audio.src){
      el.audio.pause();
      el.audio.src = audio;
      el.audio.load();
    }
    const cover = (curTrk && curTrk.cover && !isSeedMedia('cover', curTrk.cover)) ? curTrk.cover : mediaVal('cover', 'coverData');
    if (cover && abs(cover) !== el.cover.src) el.cover.src = cover;
    // v103: wave-panel image is PER-TRACK - applyPanelMedia(t) in loadTrack
    // / handover owns --panel-image (the global theme 'panel' field is only
    // a legacy copy and must not bleed across tracks).
    const video = (curTrk && curTrk.video && !isSeedMedia('video', curTrk.video)) ? curTrk.video : mediaVal('video', 'videoData');
    if (video && abs(video) !== el.coverVideo.src){
      el.coverVideo.src = video;
      el.coverVideo.load();
      el.coverVideo.style.display = 'block';
      el.cover.style.display = 'none';
    } else if (!video){
      el.coverVideo.pause();
      el.coverVideo.removeAttribute('src');
      el.coverVideo.load();
      el.coverVideo.style.display = 'none';
      el.cover.style.display = 'block';
    }
    updateOverlayStyle();
  }

  // Shared: empty the playlist everywhere (list, storage, player state).
  function clearPlaylistToEmpty(opts){
    opts = opts || {};
    demoPlaylist.length = 0;
    state.currentIndex = 0;
    if (opts.localOnly){
      // auto-mirror: update THIS browser only — never push the empty list to
      // the server (that would clobber the editor's saved playlist)
      try { localStorage.setItem(LS_KEY, JSON.stringify({ list: [], current: 0 })); } catch {}
    } else {
      savePlaylist();   // user clicked Clear Playlist -> sync everywhere
    }
    renderPlaylist();
    renderPlaylistManager();
    loadTrack(0, false);
  }

  // After the server theme loads, repair EVERY track that points at a dead
  // blob by adopting the SERVER's per-track media (persisted uploads).
  // Runs for returning users too (loadPlaylist can't know the server copy).
  // The old `t[k] !== t._blobURL` guard is GONE: after a reload t[k] equals
  // the dead _blobURL string, and that exact case is the one needing repair.
  function restoreServerMedia(data){
    if (!data || !Array.isArray(data.tracks)) return;
    data.tracks.forEach((st, i) => {
      const t = demoPlaylist[i];
      if (!t || !st) return;
      ['audio', 'cover', 'video', 'panelImage'].forEach(k => {
        if (isDeadBlob(t[k]) && st[k] && !isDeadBlob(st[k])){
          t[k] = st[k];
        }
      });
    });
    savePlaylist();
  }

  function restoreTheme(){
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch {}
    if (data && data.vars) applyThemeData(data);
    themeRestored = true;
    fetchWithTimeout('/api/theme', {}, 5000).then(res => (res && res.ok) ? res.json() : null).then(serverData => {
      if (serverData){
        // Entry S29b: restore look presets from the server (survive browser resets)
        if (Array.isArray(serverData.lookPresets) && serverData.lookPresets.length){
          lookPresets = serverData.lookPresets;
          try { localStorage.setItem(LOOK_KEY, JSON.stringify(lookPresets)); } catch {}
          renderLookPresets();
        }
        // repair dead blobs ALWAYS (even when vars is empty/not yet saved) —
        // the server tracks are the durable copy of uploaded media
        restoreServerMedia(serverData);
        // STALE DEMO-SEED LOCAL LIST must yield to a real server playlist:
        // after the polluted era, browser tabs can hold a 16-track demo-seed
        // list in localStorage that keeps overwriting the server on any save.
        // A local list whose EVERY track is seed-like (test/ or pixabay) is
        // never the user's real music — discard it and rebuild from server.
        if (state.playlistFromStorage && demoPlaylist.length
            && Array.isArray(serverData.tracks) && serverData.tracks.length){
          const seedOnly = demoPlaylist.every(t => {
            const a = String((t && t.audio) || '');
            // ONLY the true demo seed is discarded: pixabay remote URLs and
            // the seed's own local file 'test/test_tone.mp3' (any form).
            // A catch-all for '/test/' broke the automated suite (test
            // blocks legitimately use /test/ files) AND could discard a
            // user list that happens to reference a local test file.
            return !a || a.indexOf('pixabay.com') !== -1 || a.indexOf('test/test_tone.mp3') !== -1;
          });
          if (seedOnly){
            demoPlaylist.length = 0;
            state.playlistFromStorage = false;
            try { localStorage.removeItem(LS_KEY); } catch {}
            renderPlaylist();
            renderPlaylistManager();
          }
        }
        // SERVER SAYS THE PLAYLIST WAS CLEARED — but only mirror it when the
        // local list is pure DEMO SEED (no media, test/ or pixabay URLs).
        // A list backed by /uploads/ files is the user's REAL playlist — it
        // must NEVER be wiped just because the server theme is empty (that
        // was making tracks disappear from the deployed view + forcing
        // re-uploads). Dead files there surface as a per-track badge.
        if (Array.isArray(serverData.tracks) && serverData.tracks.length === 0 && demoPlaylist.length){
          const clearable = demoPlaylist.every(t => {
            const a = String((t && t.audio) || '');
            if (!a || a === 'undefined' || a === 'null') return true;              // no media
            if (a.startsWith('blob:') || a.startsWith('data:')) return false;       // user file
            if (a.startsWith('/uploads/')) return false;                            // user's real uploads — NEVER wipe
            if (/^https?:/.test(a) && !a.startsWith('https://cdn.pixabay.com/')) return false;   // user remote URL
            return true;                                                            // test/, pixabay (seed)
          });
          if (clearable) clearPlaylistToEmpty({ localOnly: true });
        }
      }
      // apply the server theme when it has vars OR tracks — the playlist
      // rebuild (fresh browser) must work even when vars are empty
      const srvHasContent = serverData && ((serverData.vars && Object.keys(serverData.vars).length) || (Array.isArray(serverData.tracks) && serverData.tracks.length));
      if (srvHasContent){
        applyThemeData(serverData);
        const cur = demoPlaylist[state.currentIndex];
        const hasTrackTheme = cur && cur.theme && Object.keys(cur.theme).length;
        if (isEditorPage() && !hasTrackTheme && serverData.vars && Object.keys(serverData.vars).length){
          // EDITOR, track has no saved theme: show the server look as a
          // starting point, but never WRITE it back to the track
          const vars = serverData.vars;
          const theme = {
            panel: vars['--panel-fill'], prog1: vars['--progress-start'], prog2: vars['--progress-mid'], prog3: vars['--progress-end'],
            progTrack: vars['--progress-track'], btnPlayBg: vars['--btn-play-bg'], btnPlayFg: vars['--btn-play-fg'],
            yoke: vars['--controls-bg'], ffrew: vars['--ff-rew-color'], timeBg: vars['--timestamp-bg'], timeFg: vars['--timestamp-fg'],
            topIcons: vars['--top-icons-color'], title: vars['--title-text-color'], artist: vars['--artist-text-color'],
            knobIn: vars['--knob-inner'], knobOut: vars['--knob-outer'],
            plBase: vars['--pl-base'], plGrad: vars['--pl-grad'], plProg1: vars['--pl-prog1'], plProg2: vars['--pl-prog2'], plProg3: vars['--pl-prog3']
          };
          writeThemeToUI(theme);
          applyTheme(theme, true);
        }
        // per-track themes already applied by loadTrack; nothing clobbered
      }
      state.lastAppliedUpdatedAt = (serverData && serverData.updatedAt) || 0;
      setSyncStatus('✓ Connected to server (' + PLAYER_VERSION + ')', true);
      if (!isEditorPage() && !state.pollId){
        state.pollId = setInterval(() => {
          if (document.hidden) return;
          fetchWithTimeout('/api/theme', {}, 5000).then(res => (res && res.ok) ? res.json() : null).then(d => {
            if (!d) return;
            const t = d.updatedAt || 0;
            if (t !== state.lastAppliedUpdatedAt){
              restoreServerMedia(d);   // editor re-uploads revive here too
              if (d.vars && Object.keys(d.vars).length) applyThemeData(d);
              state.lastAppliedUpdatedAt = t;
            }
          }).catch(()=>{});
        }, 2000);
      }
    }).catch(() => setSyncStatus('⚠ Server unreachable', false));
  }

  function resetSavedTheme(){
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    try { fetchWithTimeout('/api/theme', { method: 'DELETE' }, 5000); } catch {}
    location.reload();
  }

  function readAsDataURI(file, maxBytes){
    return new Promise(resolve => {
      if (file.size > maxBytes) return resolve(null);
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(file);
    });
  }

  function b64FromBuffer(buf){
    let s = '';
    const bytes = new Uint8Array(buf);
    const STEP = 0x8000;
    for (let i = 0; i < bytes.length; i += STEP){
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + STEP));
    }
    return btoa(s);
  }

  function postChunkJSON(payload){
    return fetchWithTimeout('/api/upload-chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 20000).then(r => (r && r.ok) ? r.json() : null).catch(() => null);
  }

  async function tryChunked(file, onProgress){
    if (file.size > MAX_UPLOAD_BYTES) return null;
    // Bigger chunks = fewer round trips (5x faster); if a rung fails (some
    // proxies cap request size) we fall back to smaller chunks automatically.
    const ladder = [256 * 1024, 48 * 1024, 12 * 1024];
    for (const chunkSize of ladder){
      const url = await tryChunkedAt(file, chunkSize, onProgress);
      if (url) return url;
    }
    return null;
  }

  async function tryChunkedAt(file, chunkSize, onProgress){
    const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const total = file.size;
    const nChunks = Math.max(1, Math.ceil(total / chunkSize));
    let allOk = true;
    for (let i = 0; i < nChunks; i++){
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, total);
      let buf;
      try { buf = await file.slice(start, end).arrayBuffer(); }
      catch { return null; }
      const res = await postChunkJSON({ id, name: file.name, idx: i, total: nChunks, b64: b64FromBuffer(buf) });
      if (!res || !res.ok){ allOk = false; break; }
      if (onProgress && (i % 16 === 0 || i === nChunks - 1)) onProgress(i + 1, nChunks);
    }
    const done = await postChunkJSON({ id, name: file.name, finalize: true });
    if (done && done.url) return done.url;
    if (!allOk){
      try { await postChunkJSON({ id, name: file.name, abandon: true }); } catch {}
    }
    return null;
  }

  // Upload strategy: ≤8 MB -> FormData, falling back to the chunked JSON
  // uploader. >8 MB -> chunked uploader directly. >32 MB -> LOCAL-ONLY
  // (plays on this page, not uploaded — e.g. huge videos).
  // The old raw-body upload is GONE: through some proxies it stalls for the
  // full 120s timeout, tying up the browser's connections so concurrent
  // theme saves abort with "Server save failed" (observed repeatedly).
  // Chunked uses many small requests that always get through.
  function uploadFile(file, mediaKey){
    const big = file.size > 8 * 1024 * 1024;
    const tooBigForUpload = file.size > 32 * 1024 * 1024;
    const tryForm = () => {
      if (big) return Promise.resolve(null);
      const fd = new FormData();
      fd.append('file', file);
      return fetchWithTimeout('/api/upload', { method: 'POST', body: fd }, 30000)
        .then(res => (res && res.ok) ? res.json() : null)
        .then(j => (j && j.url) ? j.url : null);
    };
    const chunked = async () => {
      setSyncStatus('Uploading… (chunked)', true);
      const url = await tryChunked(file, (done, n) => {
        if (done % 16 === 0 || done === n) setSyncStatus('Uploading… ' + Math.round(done / n * 100) + '%', true);
      });
      if (url){ state.mediaURLs[mediaKey] = url; return url; }
      return null;
    };
    if (tooBigForUpload){
      setSyncStatus('Local-only (file too large to upload) — plays on this page', true);
      state.mediaURLs[mediaKey] = null;
      return Promise.resolve(null);
    }
    setSyncStatus('Uploading…', true);
    return (big
      ? chunked()
      : tryForm().then(url => url || chunked())
    )
      .then(result => {
        const isUri = typeof result === 'string' && result.startsWith('data:');
        if (isUri){
          state.mediaData[mediaKey] = result;
          state.mediaURLs[mediaKey] = null;
        } else if (result){
          state.mediaURLs[mediaKey] = result;
          state.mediaData[mediaKey] = null;
        }
        const ok = !!(state.mediaURLs[mediaKey] || state.mediaData[mediaKey]);
        setSyncStatus(ok ? '✓ Uploaded & saved to server' : '⚠ Upload failed (local only) — see /status.html', ok);
        return state.mediaURLs[mediaKey] || state.mediaData[mediaKey];
      });
  }

  // Client-side video transcode: shrink a cover video to a small WebM
  // (<=720p, ~1.5 Mbps) via canvas.captureStream + MediaRecorder, keeping
  // the source audio. Real-time (plays through once). Resolves with the
  // WebM Blob, or rejects so the caller falls back to the raw file.
  // Purpose: visitors download a few MB, not the original tens of MB.
  async function transcodeVideo(file, onProgress){
    const TARGET_MAX = 720, BITRATE = 1500000, FPS = 30;
    const mime = ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']
      .find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
    if (!mime) throw new Error('MediaRecorder webm unsupported');
    let src = null, v = null, raf = null;
    try {
      src = URL.createObjectURL(file);
      v = document.createElement('video');
      v.src = src; v.muted = true; v.playsInline = true; v.preload = 'auto';
      await new Promise((res, rej) => { v.onloadedmetadata = res; v.onerror = () => rej(new Error('decode')); v.load(); });
      const vw = v.videoWidth || 1280, vh = v.videoHeight || 720;
      const scale = Math.min(1, TARGET_MAX / Math.max(vw, vh));
      const cw = Math.max(2, Math.round(vw * scale / 2) * 2);
      const ch = Math.max(2, Math.round(vh * scale / 2) * 2);
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      const ctx = c.getContext('2d');
      const cstream = c.captureStream(FPS);
      await v.play();
      // capture the source audio track (if any) so the output keeps it
      let aTrack = null;
      try {
        const cap = v.captureStream ? v.captureStream() : (v.mozCaptureStream ? v.mozCaptureStream() : null);
        if (cap) aTrack = cap.getAudioTracks()[0] || null;
      } catch {}
      const stream = new MediaStream();
      cstream.getVideoTracks().forEach(t => stream.addTrack(t));
      if (aTrack) stream.addTrack(aTrack);
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: BITRATE });
      const chunks = [];
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      const stopped = new Promise(r => { rec.onstop = r; rec.onerror = r; });
      const draw = () => {
        if (v.ended) return;
        try { ctx.drawImage(v, 0, 0, cw, ch); } catch {}
        if (onProgress && v.duration) try { onProgress(Math.min(0.999, v.currentTime / v.duration)); } catch {}
        raf = requestAnimationFrame(draw);
      };
      rec.start(200);
      draw();
      await new Promise(r => { v.onended = r; });
      if (raf) cancelAnimationFrame(raf);
      try { rec.stop(); } catch {}
      await stopped;
      const blob = new Blob(chunks, { type: 'video/webm' });
      if (!blob.size) throw new Error('empty transcode');
      return blob;
    } finally {
      if (raf) cancelAnimationFrame(raf);
      if (v) { try { v.pause(); } catch {} }
      if (src) URL.revokeObjectURL(src);
    }
  }

  // Tiny version badge (both pages) — click to hide
  function attachVersionBadge(){
    const b = document.createElement('div');
    b.id = 'playerVersionBadge';
    b.textContent = (isEditorPage() ? 'EDITOR ' : 'PLAYER ') + PLAYER_VERSION;   // PLAYER_VERSION already includes the 'v'
    b.style.cssText = 'position:fixed;left:8px;bottom:6px;z-index:99999;background:rgba(0,0,0,.45);color:#9fb2c4;font:10px/1 sans-serif;padding:3px 6px;border-radius:5px;cursor:pointer;opacity:.75;';
    b.title = 'Player script version — click to hide';
    b.addEventListener('click', () => b.remove());
    document.body.appendChild(b);
  }

  // Server self-test (editor page only)
  function attachServerSelfTest(){
    if (!isEditorPage()) return;
    const elTest = document.createElement('div');
    elTest.id = 'serverSelfTest';
    elTest.style.cssText = 'font:12px/1.4 sans-serif;border-radius:6px;padding:8px 10px;margin-bottom:10px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.12);color:#cfd6e0;';
    const status = document.getElementById('syncStatus');
    if (status && status.parentNode) status.parentNode.insertBefore(elTest, status.nextSibling);
    elTest.innerHTML = 'Server self-test: …';
    fetchWithTimeout('/api/ping', {}, 5000).then(r => (r && r.ok) ? r.json() : null).then(j => {
      if (j && j.ok){
        elTest.innerHTML = 'Server self-test: <b style="color:#7fe4a8">✓ reachable</b> — theme ' + (j.themePresent ? 'present' : 'empty') + ', ' + j.uploadCount + ' uploaded file(s)';
      } else {
        elTest.innerHTML = 'Server self-test: <b style="color:#ff8f8f">✗ cannot reach /api/ping</b> — uploads will not work in this preview';
      }
    }).catch(() => {
      elTest.innerHTML = 'Server self-test: <b style="color:#ff8f8f">✗ cannot reach /api/ping</b> — uploads will not work in this preview';
    });
  }

  // Media error badge (deployed page only)
  function attachMediaErrorBadge(){
    if (isEditorPage()) return;
    const hide = () => { const b = document.getElementById('playerMediaError'); if (b) b.remove(); };
    const show = kind => {
      let b = document.getElementById('playerMediaError');
      if (!b){
        b = document.createElement('div');
        b.id = 'playerMediaError';
        b.style.cssText = 'position:fixed;right:10px;bottom:10px;z-index:99999;background:#c0392b;color:#fff;font:11px/1.4 sans-serif;padding:8px 12px;border-radius:8px;max-width:340px;box-shadow:0 4px 14px rgba(0,0,0,.4);cursor:pointer;';
        b.title = 'Click to dismiss';
        b.addEventListener('click', () => b.remove());
        document.body.appendChild(b);
      }
      const src = (kind === 'audio' ? el.audio : el.coverVideo).currentSrc || (kind === 'audio' ? el.audio.src : el.coverVideo.src);
      let msg = kind + ' failed to play: ' + src;
      // friendly hint when the format itself is unsupported in this browser
      if (kind === 'audio'){
        const e2 = extOf(src.split('?')[0]);
        if (e2 && audioSupportFor(e2) === '') msg += ' — ' + unsupportedHint(e2).replace('⚠ ', '');
        else msg += ' — the audio file is missing from the server; re-upload this track in the editor.';
      }
      b.textContent = msg;
      console.error('[player]', kind, 'error, src =', src);
    };
    // a fresh track that starts playing clears the stale error badge
    el.audio.addEventListener('playing', hide);
    el.audio.addEventListener('loadeddata', hide);
    el.audio.addEventListener('error', () => {
      show('audio');
      const t = demoPlaylist[state.currentIndex];
      if (t && !t._audioMissing){ t._audioMissing = true; renderPlaylist(); renderPlaylistManager(); }
    });
    el.coverVideo.addEventListener('error', () => show('video'));
  }

  // Editor-side summary of what will reach the deployed player
  function updateMediaSummary(){
    const box = document.getElementById('mediaSummary');
    if (!box) return;
    const nameOf = input => {
      const f = input && input.files && input.files[0];
      return f ? f.name : null;
    };
    const rows = [];
    const audioName = nameOf(el.fileAudio);
    rows.push('<b>Music:</b> ' + (state.mediaURLs.audio || state.mediaData.audio ? (audioName || 'uploaded') + ' ✓' : 'default (test_tone.mp3)'));
    rows.push('<b>Cover:</b> ' + (state.mediaURLs.cover || state.mediaData.cover ? (nameOf(el.fileCover) || 'uploaded') + ' ✓' : 'default'));
    rows.push('<b>Video:</b> ' + (state.mediaURLs.video || state.mediaData.video ? (nameOf(el.fileVideo) || 'uploaded') + ' ✓' : 'none'));
    rows.push('<b>Panel image:</b> ' + (state.mediaURLs.panel || state.mediaData.panel ? (nameOf(el.filePanelImage) || 'uploaded') + ' ✓' : 'none'));
    // format support report for THIS browser (FM-06): green ✓ = plays,
    // red ✗ = unsupported
    const audioName2 = nameOf(el.fileAudio);
    const curExt = audioName2 ? extOf(audioName2) : (el.audio.getAttribute('src') || '').split('?')[0];
    const curExt2 = curExt ? extOf(curExt) : '';
    if (curExt2){
      const st = audioSupportFor(curExt2);
      const mark = (st === 'probably' || st === 'maybe') ? '✓' : '✗';
      rows.push('<b>Audio format:</b> ' + formatLabel(curExt2) + ' ' + mark +
        (st === '' ? ' <span style="color:#ff8f8f">(not supported by this browser)</span>' : ''));
    }
    const keyExts = ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.opus', '.aiff'];
    const supp = keyExts.map(e => {
      const ok = audioSupportFor(e) === 'probably' || audioSupportFor(e) === 'maybe';
      return formatLabel(e) + (ok ? ' ✓' : ' ✗');
    }).join('  ·  ');
    rows.push('<b>This browser plays:</b> ' + supp);
    box.innerHTML = rows.join('<br>');
  }

  // Demo playlist (replace with your own). Track 0 uses bundled local
  // media so the player plays out of the box; extra demo tracks are added
  // below so the curved scrollbar has something to scroll.
  const demoPlaylist = [
    {
      title: 'Lofi Study', artist: 'Audio Library',
      audio: 'test/test_tone.mp3',
      cover: 'test/test_cover.png',
      bandcamp: 'https://bandcamp.com',
      theme: {
        panel: '#252c36',
        prog1: '#ff2992', prog2: '#ffb84d', prog3: '#29d5ff',
        progTrack: '#1a1622',
        btnPlayBg: '#f5696c', btnPlayFg: '#ffffff',
        yoke: '#201f22', ffrew: '#bdbcbd',
        timeBg: '#201f22', timeFg: '#ffffff',
        topIcons: '#ffffff', title: '#ffffff', artist: '#cfd6e0',
        knobIn: '#ffffff', knobOut: '#3a304d',
        plBase: '#121724', plGrad: '#29d5ff',
        plProg1: '#ff2992', plProg2: '#ffb84d', plProg3: '#29d5ff'
      }
    },
    {
      title: 'Feeling Pretty Good', artist: 'Deneb',
      audio: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_3fb0a30af0.mp3?filename=feeling-pretty-good-124009.mp3',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=60',
      bandcamp: 'https://bandcamp.com',
      theme: {
        panel: '#26303a',
        prog1: '#29d5ff', prog2: '#54ff9f', prog3: '#a0ff4d',
        progTrack: '#10141b',
        btnPlayBg: '#58b5f8', btnPlayFg: '#06121a',
        yoke: '#141922', ffrew: '#cfd6e0',
        timeBg: '#141922', timeFg: '#e6f7ff',
        topIcons: '#e6f7ff', title: '#ffffff', artist: '#d2e0ec',
        knobIn: '#ffffff', knobOut: '#1d3b52',
        plBase: '#0f1724', plGrad: '#58b5f8',
        plProg1: '#29d5ff', plProg2: '#54ff9f', plProg3: '#a0ff4d'
      }
    },
    {
      title: 'Let Me Love You', artist: 'SURE',
      audio: 'https://cdn.pixabay.com/download/audio/2022/03/30/audio_e25c20fc3d.mp3?filename=let-me-love-you-11315.mp3',
      cover: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=800&q=60',
      bandcamp: 'https://bandcamp.com',
      theme: {
        panel: '#2a2335',
        prog1: '#ff6b6b', prog2: '#ffa14d', prog3: '#ffe84d',
        progTrack: '#140e1d',
        btnPlayBg: '#ff6b6b', btnPlayFg: '#fff',
        yoke: '#1b1622', ffrew: '#e0dfea',
        timeBg: '#1b1622', timeFg: '#fff',
        topIcons: '#fff', title: '#fff', artist: '#efe7ff',
        knobIn: '#fff', knobOut: '#3a304d',
        plBase: '#120d1a', plGrad: '#ff6b6b',
        plProg1: '#ff6b6b', plProg2: '#ffa14d', plProg3: '#ffe84d'
      }
    },
    {
      title: 'Moving Up (Lost Gravity)', artist: 'Mr. Polka',
      audio: 'https://cdn.pixabay.com/download/audio/2022/10/29/audio_2a82d2980b.mp3?filename=lost-gravity-124328.mp3',
      cover: 'https://images.unsplash.com/photo-1509339022327-1e1e25360a2f?auto=format&fit=crop&w=800&q=60',
      bandcamp: 'https://bandcamp.com',
      theme: {
        panel: '#1d1f29',
        prog1: '#29d5ff', prog2: '#7a9cff', prog3: '#c26bff',
        progTrack: '#0e0f15',
        btnPlayBg: '#7a9cff', btnPlayFg: '#0b0f1a',
        yoke: '#121421', ffrew: '#cfd6e0',
        timeBg: '#121421', timeFg: '#e6f7ff',
        topIcons: '#e8f0ff', title: '#fff', artist: '#cfdfff',
        knobIn: '#fff', knobOut: '#2f3a63',
        plBase: '#0c1020', plGrad: '#7a9cff',
        plProg1: '#29d5ff', plProg2: '#7a9cff', plProg3: '#c26bff'
      }
    }
  ];
  // Seed media snapshot: lets us tell "track still at its original seed
  // media" (theme's global media may apply) from "track customized by the
  // user" (its own media always wins).
  const SEED_TRACK_MEDIA = demoPlaylist.map(t => ({ audio: t.audio, cover: t.cover, video: t.video || null }));


  // Extend the demo list so the curved scrollbar has real content to scroll.
  (function extendDemoPlaylist(){
    const base = demoPlaylist.length;
    const titles = ['Midnight Drive','Sunset Avenue','Neon Rain','Paper Planes','Glass Cities','Golden Hour','Electric Dreams','Slow Motion','Night Owl','Violet Skies','Afterglow','Wildfire'];
    for (let i = 0; i < titles.length; i++){
      const src = demoPlaylist[i % base];
      demoPlaylist.push({
        title: titles[i], artist: 'Demo Artist ' + (i + 1),
        audio: src.audio, cover: src.cover,
        bandcamp: 'https://bandcamp.com',
        theme: { ...src.theme }
      });
    }
  })();

  // Persist/restore to localStorage (themes + order)
  const LS_KEY = 'circular-player-playlist-v1';
  function savePlaylist() {
    try {
      // persist FULL track objects (title, artist, audio, cover, bandcamp,
      // theme, video, liked...) so nothing is lost when another track changes.
      // NEVER persist transient fields: _original holds the RAW extracted
      // artwork (multi-MB) — it made every saved entry ~2MB and blew the
      // quota; _derivedTheme is an in-memory cache only.
      const data = demoPlaylist.map(t => {
        const c = Object.assign({}, t);
        delete c._original;
        delete c._derivedTheme;
        return c;
      });
      localStorage.setItem(LS_KEY, JSON.stringify({list:data, current:state.currentIndex}));
    } catch (e){
      // QUOTA SAFETY NET: if the playlist (with multi-MB data-URI covers)
      // exceeds localStorage, downscale the biggest cover and retry once —
      // otherwise every save silently fails and the deployed view goes stale.
      if (state._quotaRetry) { state._quotaRetry = false; }
      else {
        state._quotaRetry = true;
        const biggest = demoPlaylist
          .map((t, i) => ({ i, len: (t && t.cover && String(t.cover).startsWith('data:image')) ? String(t.cover).length : 0 }))
          .sort((a, b) => b.len - a.len)[0];
        if (biggest && biggest.len > 100000){
          downscaleImageDataURI(demoPlaylist[biggest.i].cover, 480, 0.75).then(small => {
            state._quotaRetry = false;
            if (small && demoPlaylist[biggest.i]){
              demoPlaylist[biggest.i].cover = small;
              if (biggest.i === state.currentIndex && el.cover) el.cover.src = small;
              savePlaylist();
            }
          });
        } else {
          state._quotaRetry = false;
        }
      }
    }
    // push to the server (debounced) ONLY if the user has modified the
    // playlist — otherwise a fresh browser's demo defaults would overwrite
    // the saved per-track themes on the server.
    if (state.playlistDirty) saveTheme({server:true});
  }
  function loadPlaylist() {
    state.playlistFromStorage = false;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (obj && Array.isArray(obj.list)){
        // an EXPLICITLY cleared playlist must stay cleared (no demo fallback)
        if (!obj.list.length){
          demoPlaylist.length = 0;
          state.playlistFromStorage = true;
          return;
        }
        // grow the playlist so saved tracks BEYOND the demo seed survive a
        // reload — the old `demoPlaylist[i]` guard silently dropped every
        // drop/manager-added track past the seed length (track added, plays
        // once, then gone forever after reload).
        while (demoPlaylist.length < obj.list.length){
          const k = demoPlaylist.length;
          demoPlaylist.push({ title: 'Track ' + (k + 1), artist: 'Unknown', cover: defaultCoverFromName('Track ' + (k + 1)), bandcamp: '' });
        }
        if (demoPlaylist.length > obj.list.length) demoPlaylist.length = obj.list.length;   // deleted tracks stay deleted
        for (let i=0;i<obj.list.length;i++){
          const saved = obj.list[i];
          if (!saved) continue;
          // revive dead blob urls from previous sessions: prefer the SERVER
          // theme's per-track media (persisted uploads); NEVER fall back to
          // the demo seed (that made tracks silently play the default audio).
          // isDeadBlob() = not created this session — after a reload every
          // saved blob is dead, so this repairs the usual returning-user case.
          ['audio','cover','video'].forEach(k => {
            if (isDeadBlob(saved[k])){
              const srv = (state.themeFromServer && Array.isArray(state.themeFromServer.tracks) && state.themeFromServer.tracks[i]) || {};
              const srvVal = srv[k];
              if (srvVal && !isDeadBlob(srvVal)){
                saved[k] = srvVal;
                return;
              }
              // keep the blob URL (the media-error badge will explain if it
              // truly died) — a wrong track's audio is worse than a loud error
            }
          });
          demoPlaylist[i] = {...demoPlaylist[i], ...saved};
        }
        if (typeof obj.current === 'number') state.currentIndex = clamp(obj.current,0,demoPlaylist.length-1);
        state.playlistFromStorage = true;
      }
    } catch {}
  }

  // ======= MAIN PLAYER PROGRESS (existing) =======
  function updatePlayIcon(){
    const m = state.master;
    const playing = m && !m.paused && !m.ended;
    el.btnPlay.classList.toggle('fa-play', !playing);
    el.btnPlay.classList.toggle('fa-pause', playing);
  }

  function recalcArcOnce(){
    if (state.pathLength) return;
    try {
      state.pathLength = el.arcProgress.getTotalLength();
      el.arcProgress.style.strokeDasharray = `0.01 ${state.pathLength}`;
      el.arcProgress.style.strokeDashoffset = `0`;
    } catch {}
  }
  function initArc(){
    recalcArcOnce();
    requestAnimationFrame(()=>{ recalcArcOnce(); renderProgress(); });
    const pt0 = el.arcProgress.getPointAtLength(0);
    el.arcKnob.setAttribute('cx', pt0.x);
    el.arcKnob.setAttribute('cy', pt0.y);
    updateOverlayStyle(); placeOverlayAtPoint(pt0);
  }

  function clientToSVG(svg, x,y){const pt=svg.createSVGPoint();pt.x=x;pt.y=y;return pt.matrixTransform(svg.getScreenCTM().inverse());}
  function svgToClient(svg, x,y){const pt=svg.createSVGPoint();pt.x=x;pt.y=y;const out=pt.matrixTransform(svg.getScreenCTM());return {x:out.x,y:out.y};}
  function placeOverlayAtPoint(pt){if(!pt)return;const c=svgToClient(el.seekSVG, pt.x,pt.y);const rect=dash.getBoundingClientRect();knobOverlay.style.left=(c.x-rect.left)+'px';knobOverlay.style.top=(c.y-rect.top)+'px';}
  function updateOverlayStyle(){
    const r=parseFloat(el.arcKnob.getAttribute('r'))||8;
    const sw=parseFloat(el.arcKnob.getAttribute('stroke-width'))||4;
    const half=sw/2;
    const css=getComputedStyle(el.player);
    const inner=(css.getPropertyValue('--knob-inner')||'#fff').trim();
    const outer=(css.getPropertyValue('--knob-outer')||'#3a304d').trim();
    knobOverlay.style.width=`${2*r}px`;
    knobOverlay.style.height=`${2*r}px`;
    knobOverlay.style.background=inner;
    knobOverlay.style.boxShadow=`0 0 0 ${half}px ${outer}, inset 0 0 0 ${half}px ${outer}`;
  }
  function pointerToRatio(clientX,clientY){
    const p=clientToSVG(el.seekSVG, clientX,clientY);
    const vb=el.seekSVG.viewBox.baseVal;
    const cx=vb.width/2, cy=0;
    let a=Math.atan2(p.y-cy,p.x-cx);
    if(a<0)a=0; if(a>Math.PI)a=Math.PI;
    return clamp(1-(a/Math.PI),0,1);
  }

  // RAF loop
  function startRAF(){ if (state.rafId) return;
    const step = () => { renderProgress(); if (state.master && !state.master.paused) state.rafId=requestAnimationFrame(step); else state.rafId=null; };
    state.rafId=requestAnimationFrame(step);
  }
  function stopRAF(){ if (state.rafId){ cancelAnimationFrame(state.rafId); state.rafId=null; } }

  function renderProgress(){
    recalcArcOnce();
    const m = state.master || el.audio;
    if (!isFinite(m.duration) || !state.pathLength) return;
    const ratio = clamp(m.currentTime / m.duration, 0, 1);
    // never let a stale/large currentTime paint a full tail on a fresh track
    const len = (ratio > 0.999 && m.currentTime < 0.05) ? 0 : state.pathLength * ratio;

    el.arcProgress.style.strokeDasharray = `${len} ${state.pathLength}`;
    el.arcProgress.style.strokeDashoffset = '0';

    const pt = el.arcProgress.getPointAtLength(len);
    el.arcKnob.setAttribute('cx', pt.x);
    el.arcKnob.setAttribute('cy', pt.y);
    placeOverlayAtPoint(pt);

    el.timeCurrent.textContent = fmt(m.currentTime);
    el.timeDuration.textContent = fmt(m.duration);

    if (el.coverVideo.src) {
      if (state.master === el.coverVideo) el.audio.currentTime = m.currentTime;
      else                                 el.coverVideo.currentTime = m.currentTime;
    }
  }

  function seekToRatio(r){
    recalcArcOnce();
    cancelCrossfade();   // user scrub = the crossfade must stop NOW
    const m = state.master || el.audio;
    if (!isFinite(m.duration) || m.duration <= 0) return;
    m.currentTime = r * m.duration;

    const len = state.pathLength * r;
    el.arcProgress.style.strokeDasharray = `${len} ${state.pathLength}`;
    const pt = el.arcProgress.getPointAtLength(len);
    el.arcKnob.setAttribute('cx', pt.x);
    el.arcKnob.setAttribute('cy', pt.y);
    placeOverlayAtPoint(pt);

    el.timeCurrent.textContent = fmt(m.currentTime);
    el.timeDuration.textContent = fmt(m.duration);

    if (el.coverVideo.src) {
      if (state.master === el.coverVideo) el.audio.currentTime = m.currentTime;
      else                                 el.coverVideo.currentTime = m.currentTime;
    }
  }

  // media handlers
  function detachMediaHandlers(obj){
    obj.removeEventListener('timeupdate', onTimeUpdate);
    obj.removeEventListener('loadedmetadata', onLoadedMeta);
    obj.removeEventListener('play', onPlay);
    obj.removeEventListener('pause', onPause);
    obj.removeEventListener('ended', onEnded);
  }
  function attachMediaHandlers(obj){
    // idempotent: never register twice (duplicate 'ended' handlers caused
    // double-advances and phantom playback)
    detachMediaHandlers(obj);
    obj.addEventListener('timeupdate', onTimeUpdate);
    obj.addEventListener('loadedmetadata', onLoadedMeta);
    obj.addEventListener('play', onPlay);
    obj.addEventListener('pause', onPause);
    obj.addEventListener('ended', onEnded);
  }
  function onTimeUpdate(){ renderProgress(); updateMediaSessionPosition(); preloadNext(); armCrossfade(); }
  function onLoadedMeta(){ renderProgress(); }
  function onPlay(){
    if (!state._switching) updatePlayIcon();
    startRAF();
    cinemaOnPlay();
    applySleepTimer();
    if (gs.mediaSession && 'mediaSession' in navigator){ try { navigator.mediaSession.playbackState = 'playing'; } catch {} }
  }
  function onPause(){
    if (!state._switching) updatePlayIcon();
    stopRAF();
    // Don't force-disengage cinema on pause — it caused a white flash (the dash panel
    // transition). The controls reveal via the mousemove handler or the checkbox.
    saveResume();
    if (gs.mediaSession && 'mediaSession' in navigator){ try { navigator.mediaSession.playbackState = 'paused'; } catch {} }
  }
  function onEnded(){
    updatePlayIcon(); stopRAF(); saveResume();
    // global playback rules: loop-one / shuffle / loop-all / stop-at-end
    if (gs.loop === 'one'){
      const m = state.master || el.audio;
      if (m){ m.currentTime = 0; m.play().catch(()=>{}); }
      return;
    }
    // A blend was armed mid-track and the outgoing element just ended —
    // complete the handover NOW. Playback must never stop here.
    if (AB.active){ completeBlendNow(); return; }
    if (demoPlaylist.length > 1){
      const next = pickNextIndex();
      if (next === null) return;
      // PHASE 1: the transition engine (crossfade/gapless) handles the
      // switch; if it isn't ready (e.g. preload missed), fall back to the
      // plain instant loadTrack.
      if (startTransition(next)) return;
      loadTrack(next, true);
    }
  }

  function setMaster(which){
    if (which === 'video') abStopAll();   // A/B audio engine only for audio master
    const prev = state.master;
    const prevVol = prev ? prev.volume : getUIVolume();
    if (state.master) { detachMediaHandlers(state.master); stopRAF(); }
    state.master = (which === 'video') ? el.coverVideo : el.audio;
    if (state.master === el.audio) el.audio.preload = 'auto';
    if (!isNaN(prevVol)) state.master.volume = clamp(prevVol, 0, 1);
    el.volumeFill.style.width = `${(state.master.volume || 0) * 100}%`;
    el.btnMute.classList.toggle('fa-volume-off', state.master.muted);
    el.btnMute.classList.toggle('fa-volume-up', !state.master.muted);
    attachMediaHandlers(state.master);
    renderProgress(); updatePlayIcon();
  }

  function attachTransport(){
    el.btnPlay.addEventListener('click', e => {
      e.preventDefault();
      const m = state.master || el.audio;
      if (m.paused) {
        if (AB.blendRaf){ cancelAnimationFrame(AB.blendRaf); AB.blendRaf = null; }
        AB.active = false;
        // stop + silence the AB element that is NOT the master, so a
        // leftover preload/blend can never play over the master
        if (AB.a && AB.a !== m){ AB.a.pause(); AB.a.volume = 0; }
        if (AB.b && AB.b !== m){ AB.b.pause(); AB.b.volume = 0; }
        if (m === AB.a || m === AB.b){ m.volume = getUIVolume() || 0.75; }
        state._manualPlayAt = performance.now();   // manual play — no instant crossfade
        ensureVizGraph();      // create the analyser graph on the first gesture
        resumeVizAudio();
        m.play().catch(()=>{});
        if (el.coverVideo.src && m !== el.coverVideo) el.coverVideo.play().catch(()=>{});
        startRAF();
      } else {
        // pause EVERYTHING: the master AND both AB elements (the other may
        // be a silent preload target or a leftover blend element)
        m.pause();
        if (AB.a) AB.a.pause();
        if (AB.b) AB.b.pause();
        AB.preloading = false;
        AB._preloadNext = null;
        if (el.coverVideo.src && el.coverVideo !== m) el.coverVideo.pause();
        stopRAF();
      }
      updatePlayIcon();
    });

    el.btnBack.addEventListener('click', e => {
      e.preventDefault();
      const m=state.master||el.audio; if(!isFinite(m.duration)) return;
      m.currentTime = clamp(m.currentTime - 10, 0, m.duration||0);
      renderProgress();
    });
    el.btnForward.addEventListener('click', e => {
      e.preventDefault();
      const m=state.master||el.audio; if(!isFinite(m.duration)) return;
      m.currentTime = clamp(m.currentTime + 10, 0, m.duration||0);
      renderProgress();
    });

    // Mute/Volume
    el.btnMute.addEventListener('click', e => {
      e.preventDefault();
      const m=state.master||el.audio; m.muted=!m.muted;
      el.btnMute.classList.toggle('fa-volume-off', m.muted);
      el.btnMute.classList.toggle('fa-volume-up', !m.muted);
      el.volumeFill.style.display = m.muted ? 'none' : 'block';
    });
    let volDragging=false;
    const setVol=ev=>{
      const m=state.master||el.audio; const rect=el.volume.getBoundingClientRect();
      const ratio=clamp((ev.clientX-rect.left)/rect.width,0,1);
      m.muted=false; m.volume=ratio; el.volumeFill.style.width=`${ratio*100}%`;
      el.btnMute.classList.remove('fa-volume-off'); el.btnMute.classList.add('fa-volume-up');
    };
    el.volume.addEventListener('pointerdown',e=>{volDragging=true;el.volume.setPointerCapture(e.pointerId);setVol(e);});
    el.volume.addEventListener('pointermove',e=>{if(volDragging)setVol(e);});
    el.volume.addEventListener('pointerup',e=>{volDragging=false;el.volume.releasePointerCapture(e.pointerId);});
    el.volume.addEventListener('pointercancel',()=>{volDragging=false;});

    // Scrub
    const startSeek=(x,y)=>{
      if (state.dragging) return;
      state.dragging=true;
      state.wasPlaying = !!(state.master && !state.master.paused);
      if (state.master && state.wasPlaying) state.master.pause();
      if (el.coverVideo.src) el.coverVideo.pause();
      seekToRatio(pointerToRatio(x,y));
    };
    const moveSeek=(x,y)=>{ if(state.dragging) seekToRatio(pointerToRatio(x,y)); };
    const endSeek=(x,y)=>{
      if (!state.dragging) return;
      if (typeof x==='number' && typeof y==='number') seekToRatio(pointerToRatio(x,y));
      state.dragging=false;
      const resumeOnly = el.resumeOnlyIfWasPlaying ? !!el.resumeOnlyIfWasPlaying.checked : true;
      const shouldResume = resumeOnly ? state.wasPlaying : true;
      if (shouldResume && state.master) {
        state.master.play().catch(()=>{});
        if (el.coverVideo.src && state.master !== el.coverVideo) el.coverVideo.play().catch(()=>{});
        startRAF();
      }
      updatePlayIcon();
    };
    el.seeker.addEventListener('pointerdown',e=>{
      e.preventDefault(); e.stopPropagation();
      if (state.dragging) return;
      el.seeker.setPointerCapture?.(e.pointerId);
      startSeek(e.clientX,e.clientY);
    });
    el.seeker.addEventListener('pointermove',e=>moveSeek(e.clientX,e.clientY));
    el.seeker.addEventListener('pointerup',e=>{endSeek(e.clientX,e.clientY); el.seeker.releasePointerCapture?.(e.pointerId);});
    el.seeker.addEventListener('pointercancel',()=>{state.dragging=false;});
    el.arcKnob.addEventListener('pointerdown',e=>{
      e.preventDefault(); e.stopPropagation();
      if (state.dragging) return;
      el.seeker.setPointerCapture?.(e.pointerId);
      startSeek(e.clientX,e.clientY);
    });

    // Playlist toggle
    el.btnPlaylist.addEventListener('click',(e)=>{
      e.preventDefault();
      togglePlaylist();
    });

    // Share
    el.btnShare?.addEventListener('click', e=>{
      e.preventDefault();
      const t = demoPlaylist[state.currentIndex];
      if (navigator.share) {
        navigator.share({title: t.title, text: `${t.title} — ${t.artist}`, url: location.href}).catch(()=>{});
      } else {
        prompt('Copy link to share:', location.href);
      }
    });
  }

  // EDITOR
  function attachEditor(){
    if(!el.fileAudio) return;
    // Entry S28: arm autosave on ANY user edit (input/change). Programmatic
    // loads set .value directly (no event) so they never arm — this prevents
    // init/restore from clobbering the saved theme with demo data.
    document.addEventListener('input', () => { _autoSaveArmed = true; }, true);
    document.addEventListener('change', () => { _autoSaveArmed = true; }, true);
    document.addEventListener('pointerup', () => { _autoSaveArmed = true; scheduleAutoSave(); }, true); // drags/zoom (transform edits)

    // Enhance file inputs and move Clear buttons inside wrapper
    enhanceFileInput(el.fileAudio, null);
    enhanceFileInput(el.fileCover, null);
    enhanceFileInput(el.fileVideo, el.btnClearVideo);
    enhanceFileInput(el.filePanelImage, el.btnClearPanelImage);

    // Drag & drop straight onto the EDITOR: drop an audio file to replace
    // the current track (metadata + artwork + theme extracted), an image for
    // the cover, or a video for the cover video. Same persistence as the
    // file choosers — the deployed player picks it up on reload.
    if (el.editorDrop){
      const dz = el.editorDrop;
      ['dragenter', 'dragover'].forEach(evt => dz.addEventListener(evt, e => { e.preventDefault(); dz.classList.add('dragover'); }));
      ['dragleave', 'drop'].forEach(evt => dz.addEventListener(evt, e => { e.preventDefault(); dz.classList.remove('dragover'); }));
      dz.addEventListener('drop', e => {
        const files = e.dataTransfer && e.dataTransfer.files;
        if (!files || !files.length) return;
        const t = demoPlaylist[state.currentIndex];
        if (!t){ addFilesToPlaylist(files); return; }
        const f = files[0];
        if (/^audio\//.test(f.type || '')){
          setSyncStatus('Replacing this track audio…', true);
          t.audio = prevAudioURL || '';
          applyAudioFileToTrack(f, t, { reloadTrack: true });
          const l = el.fileAudio.closest('.file-ui')?.querySelector('.file-name');
          if (l) l.textContent = f.name;
        } else if (/^image\//.test(f.type || '')){
          if (prevCoverURL) revokeIfUnused(prevCoverURL);
          prevCoverURL = URL.createObjectURL(f);
          state.liveBlobs.add(prevCoverURL);
          el.cover.src = prevCoverURL;
          t.cover = prevCoverURL;
          t._coverName = f.name;
          state.playlistDirty = true;
          const ci = state.currentIndex;
          uploadFile(f, 'cover').then(u => {
            if (u && demoPlaylist[ci]){ demoPlaylist[ci].cover = u; demoPlaylist[ci]._serverCover = u; savePlaylist(); saveTheme({server:true}); }
            updateMediaSummary();
          });
          savePlaylist();
          populateEditorFromTrack(t);
          const lc = el.fileCover.closest('.file-ui')?.querySelector('.file-name');
          if (lc) lc.textContent = f.name;
          setSyncStatus('Cover replaced', true);
        } else if (/^video\//.test(f.type || '')){
          if (prevVideoURL) revokeIfUnused(prevVideoURL);
          prevVideoURL = URL.createObjectURL(f);
          state.liveBlobs.add(prevVideoURL);
          el.coverVideo.src = prevVideoURL;
          el.coverVideo.load();
          el.coverVideo.style.display = 'block';
          el.cover.style.display = 'none';
          t.video = prevVideoURL;
          t._videoName = f.name;
          state.playlistDirty = true;
          const vi = state.currentIndex;
          uploadFile(f, 'video').then(u => {
            if (u && demoPlaylist[vi]){ demoPlaylist[vi].video = u; demoPlaylist[vi]._serverVideo = u; savePlaylist(); saveTheme({server:true}); }
            updateMediaSummary();
          });
          savePlaylist();
          setSyncStatus('Cover video replaced', true);
        }
      });
    }

    // MP3
    el.fileAudio.addEventListener('change',()=>{
      const f=el.fileAudio.files?.[0]; if(!f) return;
      // FM-06/FM-09: friendly notice BEFORE we commit to a format this
      // browser can't decode (AIFF/WMA and friends). We still add it so the
      // user can try, but the message explains what's wrong.
      const sup = audioSupportFor(f.name, f.type);
      if (sup === ''){
        setSyncStatus(unsupportedHint(extOf(f.name)), false);
      }
      revokeIfUnused(prevAudioURL);
      prevAudioURL=URL.createObjectURL(f);
      state.liveBlobs.add(prevAudioURL);
      el.audio.pause(); el.audio.src=prevAudioURL; el.audio.load();
      setMaster('audio');
      const audLabel = el.fileAudio.closest('.file-ui')?.querySelector('.file-name');
      if (audLabel) audLabel.textContent = f.name;
      // update the CURRENT playlist item: blob + metadata (title/artist/
      // embedded ARTWORK + derived theme) + server upload. The metadata
      // extraction is what keeps the album art from the file itself.
      const t = demoPlaylist[state.currentIndex];
      if (t){
        t.audio = prevAudioURL;
        t._blobURL = prevAudioURL;
        applyAudioFileToTrack(f, t, {});   // element already wired above — no reload
      }
      const wasUnsupported = audioSupportFor(f.name, f.type) === '';
      if (wasUnsupported){
        setTimeout(() => setSyncStatus(unsupportedHint(extOf(f.name)) + ' (added anyway)', false), 450);
      }
      renderProgress(); updatePlayIcon();
    });

    // Cover image
    el.fileCover.addEventListener('change',()=>{
      const f=el.fileCover.files?.[0]; if(!f) return;
      revokeIfUnused(prevCoverURL);
      prevCoverURL=URL.createObjectURL(f);
      state.liveBlobs.add(prevCoverURL);
      el.cover.src=prevCoverURL;
      const covLabel = el.fileCover.closest('.file-ui')?.querySelector('.file-name');
      if (covLabel) covLabel.textContent = f.name;
      demoPlaylist[state.currentIndex].cover = prevCoverURL;
      demoPlaylist[state.currentIndex]._coverName = f.name;
      state.playlistDirty = true;
      savePlaylist();
      // v100: re-derive every offered palette from the NEW artwork (and the
      // applied scheme too, unless the user hand-tuned or chose a free
      // random look)
      handleCoverChanged(demoPlaylist[state.currentIndex]);
      const coverIdx = state.currentIndex;
      uploadFile(f, 'cover').then(u => {
        if (u && demoPlaylist[coverIdx]){ demoPlaylist[coverIdx].cover = u; demoPlaylist[coverIdx]._serverCover = u; savePlaylist(); saveTheme({server:true}); }
        updateMediaSummary();
      });
    });

    // Cover video
    el.fileVideo.addEventListener('change',()=>{
      const f=el.fileVideo.files?.[0]; if(!f) return;
      revokeIfUnused(prevVideoURL);
      prevVideoURL=URL.createObjectURL(f);
      state.liveBlobs.add(prevVideoURL);
      el.coverVideo.src=prevVideoURL;
      const vidLabel = el.fileVideo.closest('.file-ui')?.querySelector('.file-name');
      if (vidLabel) vidLabel.textContent = f.name;
      el.coverVideo.loop = el.videoLoop.checked;
      const _hasAudio = !!(demoPlaylist[state.currentIndex] && demoPlaylist[state.currentIndex].audio);
      el.useVideoAudio.checked = !_hasAudio;          // keep the MP3 if there is one
      el.coverVideo.muted = _hasAudio;                // video is a silent visual when an MP3 exists
      el.coverVideo.volume = (state.master ? state.master.volume : getUIVolume());
      el.coverVideo.style.display='block';
      el.cover.style.display='none';
      el.coverVideo.load();
      if (!_hasAudio) setMaster('video');             // no MP3 -> the video is the audio source
      updatePlayIcon();
      demoPlaylist[state.currentIndex].video = prevVideoURL;
      demoPlaylist[state.currentIndex]._videoName = f.name;
      state.playlistDirty = true;
      savePlaylist();
      const videoIdx = state.currentIndex;
      // Transcode to a small WebM (<=720p ~1.5Mbps) for fast visitor loading,
      // then upload THAT. Falls back to the raw file if unsupported/fails.
      (async () => {
        let out = f;
        try {
          setSyncStatus('Optimizing video… 0%', true);
          const blob = await transcodeVideo(f, p => setSyncStatus('Optimizing video… ' + Math.round(p*100) + '%', true));
          if (blob && blob.size < f.size){
            out = new File([blob], 'optimized.webm', { type: 'video/webm' });
            const tcURL = URL.createObjectURL(blob);
            state.liveBlobs.add(tcURL);
            revokeIfUnused(prevVideoURL);
            prevVideoURL = tcURL;
            el.coverVideo.src = tcURL; el.coverVideo.load();
            if (demoPlaylist[videoIdx]) demoPlaylist[videoIdx].video = tcURL;
            savePlaylist();
            setSyncStatus('Video optimized to ' + (Math.round(blob.size/1048576*10)/10) + ' MB — uploading…', true);
          } else {
            setSyncStatus('Uploading original video…', true);
          }
        } catch (e){
          setSyncStatus('Video optimize unavailable — uploading original', false);
        }
        const u = await uploadFile(out, 'video');
        if (u && demoPlaylist[videoIdx]){ demoPlaylist[videoIdx].video = u; demoPlaylist[videoIdx]._serverVideo = u; savePlaylist(); saveTheme({server:true}); }
        updateMediaSummary();
      })();
    });

    // Clear video
    el.btnClearVideo.addEventListener('click',()=>{
      revokeIfUnused(prevVideoURL); prevVideoURL=null;
      el.fileVideo.value=''; el.coverVideo.pause();
      el.coverVideo.removeAttribute('src'); el.coverVideo.load();
      el.coverVideo.style.display='none'; el.cover.style.display='block';
      el.useVideoAudio.checked=false;
      setMaster('audio'); updatePlayIcon();
      if (demoPlaylist[state.currentIndex]) demoPlaylist[state.currentIndex].video = null;
      if (state.mediaURLs.video || state.mediaData.video){ state.mediaURLs.video = null; state.mediaData.video = null; saveTheme({server:true}); }
      updateMediaSummary();
      const fn = el.btnClearVideo.parentElement?.querySelector('.file-name'); if(fn) fn.textContent='No file chosen';
    });

    el.videoLoop.addEventListener('change',()=>{ el.coverVideo.loop = el.videoLoop.checked; });
    const trackCinemaEl = document.getElementById('trackCinema');
    if (trackCinemaEl) trackCinemaEl.addEventListener('change', () => {
      const t = demoPlaylist[state.currentIndex];
      if (!t) return;
      t.cinema = !!trackCinemaEl.checked;
      state.playlistDirty = true; savePlaylist(); saveTheme({ server: true });
      if (!t.cinema) engageCinema(false);   // turning off -> show controls immediately
      else if (cinemaContentActive()) engageCinema(true);  // turning ON -> engage (video, cover or visualiser)
    });
    const trackCinemaStyleEl = document.getElementById('trackCinemaStyle');
    if (trackCinemaStyleEl) trackCinemaStyleEl.addEventListener('change', () => {
      const t = demoPlaylist[state.currentIndex];
      if (!t) return;
      t.cinemaStyle = trackCinemaStyleEl.value;
      state.playlistDirty = true; savePlaylist(); saveTheme({ server: true });
      if (el.player.classList.contains('cinema')) engageCinema(true);   // re-apply the look
    });

    el.useVideoAudio.addEventListener('change',()=>{
      if(!el.coverVideo.src){ el.useVideoAudio.checked=false; return; }
      if(el.useVideoAudio.checked){
        el.coverVideo.muted=false;
        el.coverVideo.volume = el.audio.volume ?? getUIVolume();
        setMaster('video'); el.audio.pause();
      } else {
        el.coverVideo.muted=true;
        el.audio.volume = el.coverVideo.volume ?? getUIVolume();
        setMaster('audio');
      }
      updatePlayIcon();
    });

    // Title/Artist
    el.btnApplyMeta.addEventListener('click',()=>{
      const t=el.inputTitle.value.trim(), a=el.inputArtist.value.trim();
      if(t) el.title.textContent=t; if(a) el.artist.textContent=a;
      demoPlaylist[state.currentIndex].title = el.title.textContent;
      demoPlaylist[state.currentIndex].artist = el.artist.textContent;
      renderPlaylist();
      state.playlistDirty = true;
      savePlaylist();
      saveTheme({localOnly:true});
    });

    // Cover/Video drag/zoom
    el.btnCoverDrag.addEventListener('click',()=>toggleDragMode('cover'));
    const btnArtDrag=document.getElementById('btnArtDrag');
    if(btnArtDrag) btnArtDrag.addEventListener('click',()=>toggleDragMode('art'));
    const btnArtReset=document.getElementById('btnArtReset');
    if(btnArtReset) btnArtReset.addEventListener('click',()=>{setVarPx(artVar('dx'),0);setVarPx(artVar('dy'),0);if(!applyArtAutoFill()){setVarNum(artVar('scale'),1);const az=document.getElementById('artZoom');if(az)az.value='1';const azv=document.getElementById('artZoomVal');if(azv)azv.textContent='1.00×';}});
    const artZoom=document.getElementById('artZoom');
    if(artZoom) artZoom.addEventListener('input',()=>{const s=parseFloat(artZoom.value)||1;setVarNum(artVar('scale'),s);const v=document.getElementById('artZoomVal');if(v)v.textContent=s.toFixed(2)+'×';});
    el.btnCoverReset.addEventListener('click',()=>{
      setVarPx(coverVar('dx'),0); setVarPx(coverVar('dy'),0); setVarNum(coverVar('scale'),1);
      el.coverZoom.value='1'; el.coverZoomVal.textContent='1.00×';
      applyCoverAutoFill();   // "default" = auto-fill the window
    });
    el.coverZoom.addEventListener('input',()=>{
      const s=parseFloat(el.coverZoom.value)||1; setVarNum(coverVar('scale'),s); el.coverZoomVal.textContent=s.toFixed(2)+'×';
      clearTimeout(el._coverZoomTimer); el._coverZoomTimer = setTimeout(persistCoverTransform, 300);
    });

    // Wave panel image + drag/zoom
    const setPanelImageVar=urlOrUnset=>{
      if(urlOrUnset==='unset'){
        el.player.style.removeProperty('--panel-image');
      } else {
        el.player.style.setProperty('--panel-image', urlOrUnset);
      }
      void el.player.offsetHeight;
    };
    el.filePanelImage?.addEventListener('change',()=>{
      const f=el.filePanelImage.files?.[0]; if(!f) return;
      const t = demoPlaylist[state.currentIndex];
      revokeIfUnused(prevPanelImgURL);
      prevPanelImgURL=URL.createObjectURL(f);
      state.liveBlobs.add(prevPanelImgURL);
      // v103: the image belongs to THIS TRACK (never bleeds into others)
      if (t){
        t.panelImage = prevPanelImgURL;
        t._panelImageName = f.name;
        t.panelImageGrey = null;
        state.playlistDirty = true;
        savePlaylist();
      }
      applyPanelMedia(t);
      uploadFile(f, 'panel').then(u => {
        if (u && t && demoPlaylist.indexOf(t) !== -1){
          t.panelImage = u;
          t.panelImageGrey = null;
          state.playlistDirty = true;
          savePlaylist();
          saveTheme({server:true});
          // keep greyscale fresh if the user wants a greyscale texture
          if (t.panelGrey) ensurePanelGrey(t); else applyPanelMedia(t);
        }
        updateMediaSummary();
      });
    });
    el.btnClearPanelImage?.addEventListener('click',()=>{
      revokeIfUnused(prevPanelImgURL); prevPanelImgURL=null;
      el.filePanelImage.value='';
      const t = demoPlaylist[state.currentIndex];
      if (t){ t.panelImage = null; t.panelImageGrey = null; t.panelBlend = 0; state.playlistDirty = true; savePlaylist(); }
      applyPanelMedia(t);
      if (state.mediaURLs.panel || state.mediaData.panel){ state.mediaURLs.panel = null; state.mediaData.panel = null; saveTheme({server:true}); }
      updateMediaSummary();
      const fn = el.btnClearPanelImage.parentElement?.querySelector('.file-name'); if(fn) fn.textContent='No file chosen';
    });
    // v103: greyscale texture checkbox (per track)
    el.panelGrey?.addEventListener('change',()=>{
      const t = demoPlaylist[state.currentIndex];
      if (!t) return;
      t.panelGrey = !!el.panelGrey.checked;
      state.playlistDirty = true;
      savePlaylist();
      if (t.panelGrey && t.panelImage && !t.panelImageGrey){
        ensurePanelGrey(t);
      } else {
        applyPanelMedia(t);
      }
    });
    // v103: tint-mode dropdown (Normal / Colour / Multiply / Soft light)
    el.panelBlendMode?.addEventListener('change',()=>{
      const t = demoPlaylist[state.currentIndex];
      if (!t) return;
      t.panelBlendMode = el.panelBlendMode.value || 'normal';
      state.playlistDirty = true;
      savePlaylist();
      // v104: switch between the live CSS path and the canvas-baked path
      applyPanelMedia(t);
    });

    el.btnPanelDrag.addEventListener('click',()=>toggleDragMode('panel'));
    el.btnPanelReset.addEventListener('click',()=>{
      setVarPx('--panel-dx',0); setVarPx('--panel-dy',0); setVarNum('--panel-scale',1);
      el.panelZoom.value='1'; el.panelZoomVal.textContent='1.00×';
    });
    el.panelZoom.addEventListener('input',()=>{
      const s=parseFloat(el.panelZoom.value)||1; setVarNum('--panel-scale',s); el.panelZoomVal.textContent=s.toFixed(2)+'×';
    });

    // v102: Colors section two-tab switcher (Artwork Palette / Customise)
    (function attachColorsTabs(){
      const tabs = Array.from(document.querySelectorAll('.colors-tab'));
      if (!tabs.length) return;
      const art = document.getElementById('colorsPanelArt');
      const cust = document.getElementById('colorsPanelCustom');
      tabs.forEach(btn => btn.addEventListener('click', () => {
        const which = btn.dataset.ctab;
        tabs.forEach(b => b.classList.toggle('active', b === btn));
        if (art) art.style.display = which === 'art' ? '' : 'none';
        if (cust) cust.style.display = which === 'custom' ? '' : 'none';
      }));
    })();
    // v102: blend slider listener (functions live at top-level scope)
    el.panelBlend?.addEventListener('input',()=>{
      setPanelBlend(el.panelBlend.value);
      // v103: the blend belongs to THIS TRACK (persists per track, ships in
      // the track's theme data, applied on every track load / handover)
      const t = demoPlaylist[state.currentIndex];
      if (t){
        t.panelBlend = Math.max(0, Math.min(100, Math.round(+el.panelBlend.value || 0)));
        state.playlistDirty = true;
        savePlaylist();
      }
      // v104: canvas-baked modes re-render with the new strength
      refreshBakedPanelTexture();
    });

    // Apply colors
    el.btnApplyColors?.addEventListener('click', ()=>{ applyColors(true); });

    // Reset saved theme (server + local)
    el.btnResetTheme?.addEventListener('click', ()=>{ resetSavedTheme(); });

    // Overall player theme (toggle: colours only, media per-track)
    el.btnSaveMasterTheme?.addEventListener('click', ()=>{ saveMasterTheme(); });
    const mToggle = document.getElementById('masterThemeToggle');
    if (mToggle){
      mToggle.addEventListener('change', () => { setMasterOn(mToggle.checked); });
      mToggle.checked = state.masterOn;
    }

    // Save current editor look as this track's official theme
    el.btnSaveTrackTheme?.addEventListener('click', ()=>{ saveCurrentAsTrackTheme(); });

    // Entry S27: look presets (save/recall the whole look across tracks)
    const btnLookSave = document.getElementById('btnSaveLookPreset');
    if (btnLookSave) btnLookSave.addEventListener('click', () => {
      saveLookPreset((document.getElementById('lookPresetName').value || '').trim());
    });
    const lookNameInput = document.getElementById('lookPresetName');
    if (lookNameInput) lookNameInput.addEventListener('keydown', e => {
      if (e.key === 'Enter'){ e.preventDefault(); saveLookPreset((lookNameInput.value || '').trim()); }
    });
    // Export / Import looks (backup to file)
    const btnExport = document.getElementById('btnExportLooks');
    if (btnExport) btnExport.addEventListener('click', exportLookPresets);
    const btnImport = document.getElementById('btnImportLooks');
    const fileImport = document.getElementById('fileImportLooks');
    if (btnImport && fileImport) btnImport.addEventListener('click', () => fileImport.click());
    if (fileImport) fileImport.addEventListener('change', () => { const f = fileImport.files[0]; if (f) importLookPresets(f); fileImport.value = ''; });

    // v100: Random palette button — alternates art-based / free schemes
    el.paletteRandom?.addEventListener('click', () => { try { randomizePalette(); } catch (e) {} });
    // v100: palette preview tiles — click applies that role
    el.paletteSwatches?.addEventListener('click', (ev) => {
      const tile = ev.target && ev.target.closest ? ev.target.closest('.ps-tile') : null;
      if (tile && tile.dataset.role){ try { applyPaletteRole(tile.dataset.role); } catch (e) {} }
    });
    // v100: restore the artwork embedded in the audio file's metadata
    el.btnRestoreMetaCover?.addEventListener('click', () => { try { restoreMetaCover(); } catch (e) {} });

    // Reset this track back to its cover-derived default palette
    el.btnResetTrackTheme?.addEventListener('click', ()=>{
      const t = demoPlaylist[state.currentIndex];
      if (!t) return;
      // revert to the ORIGINAL thumbnail-derived theme + metadata + media
      const orig = t._original || t;
      const theme = (orig.theme && Object.keys(orig.theme).length) ? orig.theme : null;
      t.theme = theme ? JSON.parse(JSON.stringify(theme)) : null;
      t.video = orig.video || null;
      if (orig.cover && !String(orig.cover).startsWith('blob:')) t.cover = orig.cover;
      if (orig.audio && !String(orig.audio).startsWith('blob:')) t.audio = orig.audio;
      if (orig.title) t.title = orig.title;
      if (orig.artist) t.artist = orig.artist;
      t.transform = null;
      t._handTuned = false;       // v100: back to art-derived looks
      t._randomClicks = 0;        // v100: leave random mode
      t._paletteRole = null;
      // v103: revert this track's wave-panel texture settings too
      const hasPanel = (typeof orig.panelImage !== 'undefined');
      t.panelImage = hasPanel ? (orig.panelImage || null) : null;
      t.panelImageGrey = hasPanel ? (orig.panelImageGrey || null) : null;
      t.panelGrey = hasPanel ? !!orig.panelGrey : false;
      t.panelBlend = hasPanel ? (orig.panelBlend || 0) : 0;
      t.panelBlendMode = hasPanel ? (orig.panelBlendMode || 'normal') : 'normal';
      // Entry S28: Reset now reverts the WHOLE look — visualiser, cinema, all
      // framing, and the PL backdrop — back to the cover-art default.
      delete t.viz; delete t.cinema; delete t.cinemaStyle;
      delete t.cinemaTransform; delete t.cinemaArtTransform;
      delete t.vizTransform; delete t.vizCinemaTransform;
      delete t.plMedia; delete t.plMirror; delete t.plVideoOn;
      delete t.plArt; delete t.plVid;
      state.playlistDirty = true;
      savePlaylist();
      // derive fresh from the ORIGINAL cover (re-creates the default scheme)
      const finish = theme2 => {
        t.theme = theme2;
        t._original = t._original || { title: t.title, artist: t.artist, cover: t.cover, audio: t.audio, video: t.video, theme: JSON.parse(JSON.stringify(theme2)), transform: null, panelImage: t.panelImage || null, panelImageGrey: t.panelImageGrey || null, panelGrey: !!t.panelGrey, panelBlend: (typeof t.panelBlend === 'number') ? t.panelBlend : 0, panelBlendMode: t.panelBlendMode || 'normal' };
        savePlaylist();
        applyWithTheme(theme2);
        applyTrackViz(t);      // Entry S28: reflect the cleared visualiser
        applyPlBackdrop(t);    // reflect the cleared PL backdrop
        vizSyncUI();
        renderPalettePreviews(t);
        updatePaletteUI(t);
        populateEditorFromTrack(t);
      };
      deriveThemeFromCover({ cover: orig.cover || t.cover }).then(finish).catch(() => finish(theme || defaultFallbackTheme()));
      setSyncStatus('Reverted to original cover-derived theme for ' + (t.title || 'track'), true);
    });
  }

  function enhanceFileInput(input, trailingBtn){
    if(!input || input.closest('.file-ui')) return;
    const wrap=document.createElement('div');
    wrap.className='file-ui';

    const btn=document.createElement('button');
    btn.type='button';
    btn.className='file-btn';
    btn.textContent='Choose file';

    const name=document.createElement('span');
    name.className='file-name';
    name.textContent='No file chosen';

    const parent=input.parentNode;
    parent.insertBefore(wrap, input);
    wrap.appendChild(input);
    wrap.appendChild(btn);
    wrap.appendChild(name);

    if (trailingBtn) {
      trailingBtn.classList.add('file-clear');
      wrap.appendChild(trailingBtn);
    }

    btn.addEventListener('click',()=>input.click());
    input.addEventListener('change',()=>{
      const file = input.files && input.files[0];
      name.textContent = file ? file.name : 'No file chosen';
    });
  }

  function applyColors(saveToTrack=false){
    const setVar=(n,v)=>{ if(v) el.player.style.setProperty(n,v); };
    setVar('--panel-fill', normHex(el.colorPanel?.value));
    setVar('--progress-start', normHex(el.colorProg1?.value));
    setVar('--progress-mid',   normHex(el.colorProg2?.value));
    setVar('--progress-end',   normHex(el.colorProg3?.value));
    setVar('--progress-track', normHex(el.colorProgTrack?.value));
    setVar('--btn-play-bg',    normHex(el.colorPlayBtn?.value));
    setVar('--btn-play-fg',    normHex(el.colorPlayGlyph?.value));
    setVar('--controls-bg',    normHex(el.colorYoke?.value));
    setVar('--ff-rew-color',   normHex(el.colorFFREW?.value));
    setVar('--timestamp-bg',   normHex(el.colorTimeBg?.value));
    setVar('--timestamp-fg',   normHex(el.colorTimeFg?.value));
    setVar('--top-icons-color',normHex(el.colorTopIcons?.value));
    setVar('--title-text-color',  normHex(el.colorTitleText?.value));
    setVar('--artist-text-color', normHex(el.colorArtistText?.value));
    setVar('--knob-inner', normHex(el.colorKnobInner?.value));
    setVar('--knob-outer', normHex(el.colorKnobOuter?.value));
    updateOverlayStyle();
    // v104: canvas-baked blend modes follow the panel colour live
    if (typeof refreshBakedPanelTexture === 'function') refreshBakedPanelTexture();

    // Playlist colors (on the disc container)
    const base = normHex(el.colorPlBase?.value) || '#121724';
    const grad = normHex(el.colorPlGrad?.value) || '#29d5ff';
    setRootVar('--pl-base', base);
    setRootVar('--pl-grad', grad);

    // keep the rollercoaster in sync when its scheme is the live theme
    if (viz.mode === 'coaster' && viz.colors === 'theme' && window.RoundViz3D) window.RoundViz3D.setColors('theme');

    // Playlist scrollbar tail (tri-colour, mirrors the main progress tail)
    const pl1 = normHex(el.colorPlProg1?.value) || '#ff2992';
    const pl2 = normHex(el.colorPlProg2?.value) || '#ffb84d';
    const pl3 = normHex(el.colorPlProg3?.value) || '#29d5ff';
    setRootVar('--pl-prog1', pl1);
    setRootVar('--pl-prog2', pl2);
    setRootVar('--pl-prog3', pl3);

    // A USER colour edit (typed hex / picker save / swatch / eyedropper)
    // makes this look the GLOBAL look. Programmatic repaints (loading a
    // track's theme, artwork-derived colours) never set the flag, so they
    // can't leak into the server theme's vars.
    if (state._userColourEdit){
      state._userColourEdit = false;
      snapshotGlobalVars();
    }

    saveTheme();

    // color edits persist locally for the session (server theme is only
    // written when a track theme is explicitly saved)
    saveTheme({localOnly:true});

    if (saveToTrack) {
      const t = demoPlaylist[state.currentIndex];
      t.theme = {
        panel: el.colorPanel?.value,
        prog1: el.colorProg1?.value, prog2: el.colorProg2?.value, prog3: el.colorProg3?.value,
        progTrack: el.colorProgTrack?.value,
        btnPlayBg: el.colorPlayBtn?.value, btnPlayFg: el.colorPlayGlyph?.value,
        yoke: el.colorYoke?.value, ffrew: el.colorFFREW?.value,
        timeBg: el.colorTimeBg?.value, timeFg: el.colorTimeFg?.value,
        topIcons: el.colorTopIcons?.value,
        title: el.colorTitleText?.value, artist: el.colorArtistText?.value,
        knobIn: el.colorKnobInner?.value, knobOut: el.colorKnobOuter?.value,
        plBase: base, plGrad: grad,
        plProg1: pl1, plProg2: pl2, plProg3: pl3
      };
      t._handTuned = true;   // v100: explicit user colour edits survive cover swaps
      state.playlistDirty = true;
      savePlaylist();
    }
    scheduleAutoSave();   // Entry S28: autosave colours (and the rest of the look) as you go
  }

  // Artwork palette dropdown: regenerate THIS track's scheme live from the
  // chosen ColorThief role and remember the choice on the track.
  (function attachPaletteChoice(){
    const pc = document.getElementById('paletteChoice');
    if (!pc) return;
    pc.addEventListener('change', () => {
      try { applyPaletteRole(pc.value); } catch (e) {}
    });
  })();

  // Color pickers
  let pickersInitialized = false;
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

  // Render the cover artwork (image or video frame) to an offscreen canvas we
  // can sample pixels from. Cross-origin images would taint the canvas, so
  // remote artwork is reloaded with CORS enabled when the server allows it.
  // Returns null when there is no artwork or the canvas is tainted.
  async function buildArtworkSource(){
    const video = el.coverVideo, img = el.cover;
    const useVideo = !!(video && video.src && video.style.display !== 'none');
    const srcEl = useVideo ? video : img;
    const natW = useVideo ? (video.videoWidth || 0) : (img.naturalWidth || 0);
    const natH = useVideo ? (video.videoHeight || 0) : (img.naturalHeight || 0);
    if (!srcEl || !natW || !natH) return null;
    const u = (useVideo ? (video.currentSrc || video.src) : (img.currentSrc || img.src)) || '';
    const remote = !/^(blob:|data:|file:|about:)/i.test(u) && !u.startsWith(location.origin);
    try {
      let drawEl = srcEl;
      if (!useVideo && remote){
        drawEl = await Promise.race([
          new Promise(res => {
            const i = new Image(); i.crossOrigin = 'anonymous';
            i.onload = () => res(i); i.onerror = () => res(null);
            i.src = u;
          }),
          new Promise(res => setTimeout(() => res(null), 1500))
        ]);
        if (!drawEl) return null;
      }
      const c = document.createElement('canvas');
      c.width = natW; c.height = natH;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(drawEl, 0, 0, natW, natH);
      ctx.getImageData(0, 0, 1, 1);               // taint probe
      return { cv: c, el: srcEl, W: natW, H: natH };
    } catch { return null; }
  }

  // Universal eyedropper for browsers WITHOUT the native EyeDropper API
  // (Firefox, Safari, …): a full-screen crosshair overlay with a magnifying
  // loupe. Pixels come from a canvas render of the artwork; everywhere else
  // the element's computed background colour is sampled. Works in any
  // browser that supports <canvas>.
  async function startCanvasEyePicker(apply){
    if (state._eyePickerActive) return;
    state._eyePickerActive = true;
    let src = null, ready = false, done = false;
    const prep = buildArtworkSource().then(s => { src = s; ready = true; });

    const ov = document.createElement('div');
    ov.className = 'eye-picker-overlay';
    const loupe = document.createElement('div');
    loupe.className = 'eye-picker-loupe';
    loupe.innerHTML = '<canvas width="300" height="300"></canvas><div class="eye-picker-hint">Preparing sampler…</div>';
    ov.appendChild(loupe);
    document.body.appendChild(ov);

    const SIZE = 300, ZOOM = 6, HALF = SIZE / ZOOM / 2;   // 6× zoom, 25px crop
    const lc = loupe.querySelector('canvas').getContext('2d');
    const hint = loupe.querySelector('.eye-picker-hint');
    let rafId = null, mX = 0, mY = 0;

    const close = () => {
      if (done) return;
      done = true;
      if (rafId) cancelAnimationFrame(rafId);
      ov.remove();
      document.removeEventListener('keydown', onKey, true);
      state._eyePickerActive = false;
    };

    // Screen point -> colour: artwork pixel first, then element background.
    function sampleAt(x, y){
      if (src){
        const r = src.el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom){
          // object-fit: contain letterbox mapping
          const sc = Math.min(r.width / src.W, r.height / src.H);
          const dw = src.W * sc, dh = src.H * sc;
          const ox = r.left + (r.width - dw) / 2, oy = r.top + (r.height - dh) / 2;
          if (x >= ox && x <= ox + dw && y >= oy && y <= oy + dh){
            const px = Math.max(0, Math.min(src.W - 1, Math.round((x - ox) / dw * (src.W - 1))));
            const py = Math.max(0, Math.min(src.H - 1, Math.round((y - oy) / dh * (src.H - 1))));
            try {
              const d = src.cv.getContext('2d', { willReadFrequently: true }).getImageData(px, py, 1, 1).data;
              return { rgb: [d[0], d[1], d[2]], art: true, px, py };
            } catch { /* tainted — fall through */ }
          }
        }
      }
      // element background fallback (overlay is skipped via pointer-events)
      ov.style.pointerEvents = 'none';
      let node = document.elementFromPoint(x, y);
      ov.style.pointerEvents = '';
      while (node && node !== document.documentElement){
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)'){
          const m = bg.match(/([\d.]+)/g);
          if (m && m.length >= 3) return { rgb: [+m[0], +m[1], +m[2]], art: false };
        }
        node = node.parentElement;
      }
      return null;
    }

    function render(){
      rafId = null;
      lc.clearRect(0, 0, SIZE, SIZE);
      if (!ready){ hint.textContent = 'Preparing sampler…'; return; }
      const s = sampleAt(mX, mY);
      if (s){
        if (s.art && src){
          const ctx = src.cv.getContext('2d', { willReadFrequently: true });
          const x0 = Math.max(0, s.px - HALF), y0 = Math.max(0, s.py - HALF);
          const x1 = Math.min(src.W, s.px + HALF), y1 = Math.min(src.H, s.py + HALF);
          if (x1 - x0 > 0 && y1 - y0 > 0){
            try { lc.drawImage(src.cv, x0, y0, x1 - x0, y1 - y0, 0, 0, SIZE, SIZE); }
            catch { /* ignore */ }
          }
        } else {
          lc.fillStyle = 'rgb(' + s.rgb.join(',') + ')';
          lc.fillRect(0, 0, SIZE, SIZE);
        }
        hint.textContent = rgbToHex(s.rgb[0], s.rgb[1], s.rgb[2]) + '  ·  click to pick';
        lc.strokeStyle = 'rgba(255,255,255,.95)'; lc.lineWidth = 2;
        lc.beginPath(); lc.arc(SIZE / 2, SIZE / 2, 11, 0, Math.PI * 2); lc.stroke();
        lc.strokeStyle = 'rgba(0,0,0,.75)'; lc.lineWidth = 1;
        lc.beginPath(); lc.arc(SIZE / 2, SIZE / 2, 14, 0, Math.PI * 2); lc.stroke();
      } else {
        hint.textContent = 'Point at a colour…  (Esc to cancel)';
        lc.fillStyle = 'rgba(30,32,38,.9)';
        lc.fillRect(0, 0, SIZE, SIZE);
      }
    }

    function move(e){
      mX = e.clientX; mY = e.clientY;
      const L = 150;
      let lx = mX + 26, ly = mY - L - 22;
      if (ly < 8) ly = mY + 26;
      if (lx + L > window.innerWidth - 8) lx = mX - L - 26;
      lx = Math.max(8, Math.min(lx, window.innerWidth - L - 8));
      ly = Math.max(8, Math.min(ly, window.innerHeight - L - 8));
      loupe.style.left = lx + 'px';
      loupe.style.top = ly + 'px';
      if (!rafId) rafId = requestAnimationFrame(render);
    }

    const onClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!ready) return;
      const s = sampleAt(e.clientX, e.clientY);
      if (s){
        const hex = rgbToHex(s.rgb[0], s.rgb[1], s.rgb[2]);
        close();
        apply(hex);
      } else {
        close();
      }
    };
    ov.addEventListener('click', onClick);
    ov.addEventListener('mousemove', move);
    ov.addEventListener('contextmenu', e => { e.preventDefault(); close(); });
    function onKey(e){
      if (e.key === 'Escape'){
        // swallow the FOLLOWING keyup so Pickr's own Esc handler doesn't
        // close the popup too (the overlay is gone by then)
        const once = (ev) => { ev.stopPropagation(); document.removeEventListener('keyup', once, true); };
        document.addEventListener('keyup', once, true);
        close();
      }
    }
    document.addEventListener('keydown', onKey, true);
    prep.then(() => { if (!done && !rafId) rafId = requestAnimationFrame(render); });
  }

  // Add an EYEDROPPER button to a Pickr popup: click it, then click any
  // pixel on screen (the artwork, the page, anywhere) — its hex is applied
  // to the input + player immediately. Uses the native EyeDropper API in
  // Chromium browsers (Chrome, Edge, Brave, Vivaldi, Opera, …); everywhere
  // else (Firefox, Safari, …) it falls back to the canvas-loupe sampler.
  function addEyedropper(pickr, input, paint){
    // While the loupe overlay is up, block mousedowns from reaching Pickr's
    // own document-level CAPTURE handler ("hide on outside mousedown") so the
    // popup stays open during + after picking. A window-level capture
    // listener always runs before document-level ones, whatever the order
    // they were registered in.
    if (!window.__eyePickGuard){
      window.__eyePickGuard = true;
      window.addEventListener('mousedown', (e) => {
        if (state._eyePickerActive && e.target && e.target.closest && e.target.closest('.eye-picker-overlay')){
          e.stopPropagation();
        }
      }, true);
    }
    pickr.on('init', () => {
      const root = pickr.getRoot && pickr.getRoot();
      const app = root && root.app;                       // popup DOM element
      const interaction = app && app.querySelector('.pcr-interaction');
      if (!interaction || interaction.querySelector('.pcr-eye')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pcr-eye';
      btn.title = 'Pick a colour from anywhere on screen';
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 22l1-1 3-3"/><path d="M14.5 5.5l4 4L9 19H5v-4l9.5-9.5z"/><path d="M14.5 5.5l1.4-1.4a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L19 9.5"/></svg>';
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const applyHex = (hex) => {
          if (!hex || !normHex(hex)) return;
          input.value = hex;
          paint(hex);
          try { pickr.setColor(hex, true); } catch {}
          state._userColourEdit = true;
          applyColors(false);
        };
        if (window.EyeDropper){
          try {
            const dropper = new EyeDropper();
            const res = await dropper.open();
            applyHex(String(res && res.sRGBHex || '').toLowerCase());
          } catch (err) { /* user cancelled */ }
        } else {
          await startCanvasEyePicker(applyHex);
        }
      });
      interaction.appendChild(btn);
    });
  }

  function attachColorPickers(){
    if(!window.Pickr || pickersInitialized) return;
    pickersInitialized = true;

    const inputs=[
      el.colorPanel, el.colorProg1, el.colorProg2, el.colorProg3, el.colorProgTrack,
      el.colorPlayBtn, el.colorPlayGlyph, el.colorYoke, el.colorFFREW,
      el.colorTimeBg, el.colorTimeFg, el.colorTopIcons,
      el.colorTitleText, el.colorArtistText,
      el.colorKnobInner, el.colorKnobOuter,
      el.colorPlBase, el.colorPlGrad,
      el.colorPlProg1, el.colorPlProg2, el.colorPlProg3
    ].filter(Boolean);

    window.__pickrMap = window.__pickrMap || new Map();

    inputs.forEach(input=>{
      if (input.nextElementSibling && input.nextElementSibling.classList.contains('pcr-button')) return;

      const chip=document.createElement('button');
      chip.type='button';
      input.insertAdjacentElement('afterend',chip);

      const start=normHex(input.value)||'#ffffff';
      const pickr=Pickr.create({
        el:chip, useAsButton:true, theme:'monolith', default:start, lockOpacity:true,
        swatches:['#ffffff','#000000','#ff2992','#ffb84d','#29d5ff','#f5696c','#201f22','#1a1622','#cfd6e0','#3a304d','#bdbcbd','#121724'],
        components:{ preview:true, opacity:false, hue:true, interaction:{ hex:true, rgba:true, hsla:true, input:true, clear:true, save:true } }
      });

      const paint = (hex) => {
        chip.classList.add('pcr-button');
        chip.style.setProperty('background-image','none','important');
        chip.style.setProperty('background',hex,'important');
        chip.style.setProperty('background-color',hex,'important');
      };

      const applyPick=c=>{
        const hex=c.toHEXA().toString();
        input.value=hex; paint(hex); applyColors(false);
      };
      // NOTE: 'change' fires for EVERY hue drag AND for programmatic
      // setColor (our own syncPickrToInput) — no snapshot here. Real user
      // commits are 'save' + 'swatchselect' (they can't fire programmatically).

      pickr.on('init', () => { paint(start); })
           .on('change', applyPick)
           .on('save', c => { if(c){ state._userColourEdit = true; applyPick(c); } pickr.hide(); })
           .on('swatchselect', c => { state._userColourEdit = true; applyPick(c); });
      // Every time the popup OPENS, re-sync it to the input's current value —
      // this is the guarantee that it never shows a stale/random colour.
      const forceSync = () => {
        const cur = normHex(input.value);
        if (!cur) return;
        try { pickr.setColor(cur, true); } catch {}
        try { pickr.applyColor && pickr.applyColor(true); } catch {}
        // hard fallback: write the popup's result input + preview directly
        try {
          const app = document.querySelector('.pcr-app');
          if (app){
            const res = app.querySelector('.pcr-result');
            if (res) res.value = cur;
            const pv = app.querySelector('.pcr-color-preview, .pcr-preview');
            if (pv) pv.style.setProperty('--pcr-color', cur);
          }
        } catch {}
      };
      pickr.on('show', forceSync);
      chip.addEventListener('mousedown', () => setTimeout(forceSync, 0), { once: false });
      pickr.on('init', () => { paint(start); });
      addEyedropper(pickr, input, paint);
      window.__pickrMap.set(input.id, pickr);
    });
  }

  // Sync a Pickr instance to the input's current colour so the popup opens
  // showing the ACTUAL current colour (not a stale default).
  function syncPickrToInput(input){
    if (!input || !window.__pickrMap) return;
    const pickr = window.__pickrMap.get(input.id);
    if (!pickr) return;
    const hex = normHex(input.value);
    if (hex){
      try { pickr.setColor(hex, true); } catch {}
    }
  }

  function bindHexInputs(){
    const colorInputs = Array.from(document.querySelectorAll('input[type="text"][id^="color"]'));
    const applyFromInput = (input) => {
      const hex = normHex(input.value); if (!hex) return;
      input.value = hex;
      const chip = input.nextElementSibling;
      if (chip && chip.classList.contains('pcr-button')) {
        chip.style.setProperty('background-image','none','important');
        chip.style.setProperty('background',hex,'important');
        chip.style.setProperty('background-color',hex,'important');
      }
      state._userColourEdit = true;
      applyColors(false);
    };
    colorInputs.forEach(inp=>{
      inp.addEventListener('change',()=>applyFromInput(inp));
      inp.addEventListener('blur',()=>applyFromInput(inp));
      inp.addEventListener('keydown',(e)=>{
        if(e.key==='Enter'){ e.preventDefault(); applyFromInput(inp); }
      });
    });
  }

  function toggleDragMode(mode){ if(state.dragMode===mode){ endDragMode(); return; } startDragMode(mode); }
  // cover art backdrop has its own independent drag mode ('art') using --art-dx/dy
  function startDragMode(mode){
    state.dragMode=mode;
    if (mode === 'cover') state._videoDragActive = true;   // prevent cinema handler from interfering during the drag
    el.dragOverlay.classList.add('active');

    const onDown=e=>{e.preventDefault();el.dragOverlay.classList.add('grabbing');state.startX=e.clientX;state.startY=e.clientY;if(mode==='cover'){state.startDx=getVarNum(coverVar('dx'));state.startDy=getVarNum(coverVar('dy'));}else if(mode==='art'){state.startDx=getVarNum(artVar('dx'));state.startDy=getVarNum(artVar('dy'));}else if(mode==='viz'){state.startDx=getVarNum(vizVar('dx'));state.startDy=getVarNum(vizVar('dy'));}else{state.startDx=getVarNum('--panel-dx');state.startDy=getVarNum('--panel-dy');}el.dragOverlay.setPointerCapture(e.pointerId);};
    const onMove=e=>{if(!el.dragOverlay.hasPointerCapture?.(e.pointerId))return;const dx=state.startDx+(e.clientX-state.startX);const dy=state.startDy+(e.clientY-state.startY);if(mode==='cover'){setVarPx(coverVar('dx'),dx);setVarPx(coverVar('dy'),dy);}else if(mode==='art'){setVarPx(artVar('dx'),dx);setVarPx(artVar('dy'),dy);}else if(mode==='viz'){setVarPx(vizVar('dx'),dx);setVarPx(vizVar('dy'),dy);}else{setVarPx('--panel-dx',dx);setVarPx('--panel-dy',dy);}};
    const onUp=e=>{if(el.dragOverlay.hasPointerCapture?.(e.pointerId))el.dragOverlay.releasePointerCapture(e.pointerId);el.dragOverlay.classList.remove('grabbing');if(mode==='cover')persistCoverTransform();else if(mode==='art')persistArtTransform();else if(mode==='viz')persistVizTransform();};
    const onDbl=()=>{if(mode==='cover'){setVarPx(coverVar('dx'),0);setVarPx(coverVar('dy'),0);setVarNum(coverVar('scale'),1);el.coverZoom.value='1';el.coverZoomVal.textContent='1.00×';applyCoverAutoFill();}else if(mode==='art'){setVarPx(artVar('dx'),0);setVarPx(artVar('dy'),0);if(!applyArtAutoFill()){setVarNum(artVar('scale'),1);const az=document.getElementById('artZoom');if(az)az.value='1';const azv=document.getElementById('artZoomVal');if(azv)azv.textContent='1.00×';}}else if(mode==='viz'){setVarPx(vizVar('dx'),0);setVarPx(vizVar('dy'),0);setVarNum(vizVar('scale'),1);const vz=document.getElementById('vizZoom');if(vz)vz.value='1';const vzv=document.getElementById('vizZoomVal');if(vzv)vzv.textContent='1.00×';persistVizTransform();}else{setVarPx('--panel-dx',0);setVarPx('--panel-dy',0);setVarNum('--panel-scale',1);el.panelZoom.value='1';el.panelZoomVal.textContent='1.00×';}};
    const onKey=e=>{if(e.key==='Escape'||e.key==='Enter')endDragMode();};
    const onWheel=e=>{e.preventDefault();const sgn=-e.deltaY*0.0015;if(mode==='cover'){let s=getVarNum(coverVar('scale'),1)+sgn; s=clamp(s,0.5,3); setVarNum(coverVar('scale'),s); el.coverZoom.value=String(s); el.coverZoomVal.textContent=s.toFixed(2)+'×';clearTimeout(state._coverWheelT);state._coverWheelT=setTimeout(persistCoverTransform,300);}else if(mode==='art'){let s=getVarNum(artVar('scale'),1)+sgn; s=clamp(s,0.5,3); setVarNum(artVar('scale'),s); const az=document.getElementById('artZoom'); if(az)az.value=String(s); const azv=document.getElementById('artZoomVal'); if(azv)azv.textContent=s.toFixed(2)+'×';clearTimeout(state._artWheelT);state._artWheelT=setTimeout(persistArtTransform,300);}else if(mode==='viz'){let s=getVarNum(vizVar('scale'),1)+sgn; s=clamp(s,0.5,3); setVarNum(vizVar('scale'),s); const vz=document.getElementById('vizZoom'); if(vz)vz.value=String(s); const vzv=document.getElementById('vizZoomVal'); if(vzv)vzv.textContent=s.toFixed(2)+'×';clearTimeout(state._vizWheelT);state._vizWheelT=setTimeout(persistVizTransform,300);}else{let s=getVarNum('--panel-scale',1)+sgn; s=clamp(s,0.5,3); setVarNum('--panel-scale',s); el.panelZoom.value=String(s); el.panelZoomVal.textContent=s.toFixed(2)+'×';}};
    state._dragHandlers={onDown,onMove,onUp,onDbl,onKey,onWheel};
    el.dragOverlay.addEventListener('pointerdown',onDown);
    el.dragOverlay.addEventListener('pointermove',onMove);
    el.dragOverlay.addEventListener('pointerup',onUp);
    el.dragOverlay.addEventListener('dblclick',onDbl);
    el.dragOverlay.addEventListener('wheel',onWheel,{passive:false});
    window.addEventListener('keydown',onKey);
  }
  function endDragMode(){
    if(!state.dragMode) return;
    const h=state._dragHandlers;
    el.dragOverlay.classList.remove('active','grabbing');
    el.dragOverlay.removeEventListener('pointerdown',h.onDown);
    el.dragOverlay.removeEventListener('pointermove',h.onMove);
    el.dragOverlay.removeEventListener('pointerup',h.onUp);
    el.dragOverlay.removeEventListener('dblclick',h.onDbl);
    el.dragOverlay.removeEventListener('wheel',h.onWheel);
    window.removeEventListener('keydown',h.onKey);
    state.dragMode=null;
    state._videoDragActive=false;
  }

  function initFromData(){
    const ds=el.player.dataset||{};
    if(ds.cover) el.cover.src=ds.cover;
    if(ds.audio){el.audio.src=ds.audio; el.audio.load();}
    if(ds.title) el.title.textContent=ds.title;
    if(ds.artist) el.artist.textContent=ds.artist;
    el.audio.volume = getUIVolume();
    el.audio.muted = false;
  }

  // =======================
  // Playlist rendering + interactions
  // =======================
  function computePairGap(){
    const diam = el.player.offsetWidth || 415;
    const frac = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--overlap-fraction')) || 0.12;
    const overlap = Math.round(diam * frac);
    const gap = Math.round((diam - overlap) / 2);
    document.documentElement.style.setProperty('--player-diam', `${diam}px`);
    document.documentElement.style.setProperty('--pair-gap', `${gap}px`);
  }

  // Detect tracks whose /uploads/ audio file no longer exists on the server
  // and mark them (row badge + red dot) so the user KNOWS to re-upload.
  // Checked once per URL per session (cheap range HEAD via fetch).
  const __missingChecked = new Set();
  function markAudioMissing(t, missing){
    if (!t) return;
    if (t._audioMissing !== missing){
      t._audioMissing = missing;
      renderPlaylist();
      renderPlaylistManager();
    }
  }
  function checkMissingAudio(){
    demoPlaylist.forEach(t => {
      const a = t && t.audio;
      if (!a || !String(a).startsWith('/uploads/')) return;
      if (__missingChecked.has(a)) return;
      __missingChecked.add(a);
      fetch(a, { method: 'GET', headers: { 'Range': 'bytes=0-0' }, cache: 'no-store' })
        .then(r => markAudioMissing(t, !r.ok))
        .catch(() => markAudioMissing(t, true));
    });
  }

  function renderPlaylist(){
    const ul = el.plList;
    ul.innerHTML = '';
    // Phantom spacer row: invisible, same height as a real row — pushes the
    // first track down clear of the corner fade without changing the fade
    // or the scroll range.
    (function(){
      const sp = document.createElement('li');
      sp.className = 'pl-item pl-phantom';
      sp.setAttribute('aria-hidden', 'true');
      sp.style.visibility = 'hidden';
      sp.style.height = '58px';        // ~ a real row's height: pushes the
      sp.style.padding = '0';          // first track below the corner fade
      sp.style.border = '0';
      sp.style.margin = '0';
      sp.innerHTML = '<div class="pl-meta"></div>';
      ul.appendChild(sp);
    })();
    demoPlaylist.forEach((t,i)=>{
      const li = document.createElement('li');
      li.className = 'pl-item' + (i===state.currentIndex?' current':'');
      li.dataset.index = String(i);
      li.innerHTML = `
        <a href="#" class="pl-menu fa fa-ellipsis-v" aria-label="More"></a>
        <div class="pl-meta">
          <div class="pl-title">${escapeHTML(t.title)}${t._audioMissing ? ' <span class="pl-missing">⚠ missing file</span>' : ''}</div>
          <div class="pl-artist">${escapeHTML(t.artist)}</div>
        </div>
        <img class="pl-cover" alt="" src="${t.cover}"/>
      `;
      // click row to play + reflect in the editor
      li.addEventListener('click', (e)=>{
        if ((e.target).closest('.pl-menu')) return; // menu handled separately
        loadTrack(i, true);
        // Deferred: the editor-UI refresh (writeThemeToUI + 21 colour chips)
        // takes ~450ms on the main thread — if it ran synchronously here it
        // would delay the audio load by ~0.5-1s (loadstart fires only when
        // the main thread frees up). Audio first, editor paints next frame.
        requestAnimationFrame(() => populateEditorFromTrack(demoPlaylist[i]));
      });
      // kebab
      li.querySelector('.pl-menu').addEventListener('click',(e)=>{
        e.preventDefault(); e.stopPropagation();
        showMenuForItem(li, t);
      });
      if (isEditorPage()){
        // v106/v107: drag to REORDER straight in the player's playlist panel
        // (editor view only). The rows move live during dragover; the ORDER
        // IS COMMITTED ON DRAGEND from the final DOM order — so drops on
        // gaps, empty space or the phantom spacer all work, and the
        // Playlist Manager + server order always match the panel.
        li.draggable = true;
        li.addEventListener('dragstart', e => {
          li.classList.add('dragging');
          e.dataTransfer.setData('text/plain', String(i));
          e.dataTransfer.effectAllowed = 'move';
        });
        li.addEventListener('dragover', e => {
          if (li.classList.contains('dragging')) return;
          const draggingNode = ul.querySelector('.pl-item.dragging');
          if (!draggingNode) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          autoScrollOnDrag(ul, e.clientY);
          const after = e.offsetY > li.clientHeight / 2;
          const ref = after ? li.nextSibling : li;
          if (draggingNode === ref || draggingNode.nextSibling === ref) return;
          ul.insertBefore(draggingNode, ref);
        });
        li.addEventListener('drop', e => {
          // FILE drops fall through to the list-level add handler
          const draggingNode = ul.querySelector('.pl-item.dragging');
          if (!draggingNode) return;
          e.preventDefault();
          e.stopPropagation();
        });
        li.addEventListener('dragend', () => {
          li.classList.remove('dragging');
          // commit whatever order the rows ended up in (no-op if unchanged)
          commitPlaylistDomOrder();
        });
      }
      ul.appendChild(li);
    });
    updatePlScrollFromList();
    renderPlaylistManager();   // keep the editor manager in sync (no-op on deployed page)
  }

  // v107: commit the playlist panel's live DOM order into demoPlaylist.
  // Called on dragend so reorders are recorded even when the drop lands on
  // a gap, the phantom spacer or empty space below the last row (the old
  // row-only drop handler missed those — the manager never synced).
  function commitPlaylistDomOrder(){
    if (!el.plList) return;
    const rows = Array.from(el.plList.querySelectorAll('.pl-item:not(.pl-phantom)'));
    if (!rows.length || rows.length !== demoPlaylist.length) return;
    const order = rows.map(r => parseInt(r.dataset.index, 10));
    let changed = false;
    for (let k = 0; k < order.length; k++){ if (order[k] !== k){ changed = true; break; } }
    if (!changed) return;
    const curTrack = demoPlaylist[state.currentIndex];
    const next = order.map(idx => demoPlaylist[idx]);
    demoPlaylist.splice(0, demoPlaylist.length, ...next);
    if (curTrack){
      const ni = demoPlaylist.indexOf(curTrack);
      if (ni >= 0) state.currentIndex = ni;   // the current track moves WITH its row
    }
    renderPlaylist();                          // rows + manager in sync
    state.playlistDirty = true;
    savePlaylist();
    saveTheme({server:true});                  // deployed playlist order follows
  }

  // v107: scroll a list while dragging near its top/bottom edge.
  function autoScrollOnDrag(container, clientY){
    if (!container) return;
    const r = container.getBoundingClientRect();
    const EDGE = 44;
    if (clientY < r.top + EDGE && container.scrollTop > 0){
      container.scrollTop = Math.max(0, container.scrollTop - 14);
    } else if (clientY > r.bottom - EDGE){
      container.scrollTop += 14;
    }
  }

  // v109: where on a row a file-drag is hovering. Top band = insert BEFORE,
  // bottom band = insert AFTER, middle band = REPLACE that track. (ClientY
  // missing -> assume replace, so programmatic drops stay predictable.)
  function fileZone(e, rowEl){
    if (!isFinite(e.clientY)) return 'replace';
    const r = rowEl.getBoundingClientRect();
    if (r.height <= 0) return 'replace';   // hidden panel (no tab open): predictable default
    const rel = (e.clientY - r.top) / r.height;
    return rel < 0.35 ? 'before' : (rel > 0.65 ? 'after' : 'replace');
  }
  // v109: the array index a FILE drop at event position would insert at.
  function plDropInsertIndex(e){
    const ul = el.plList;
    const rows = Array.from(ul.querySelectorAll('.pl-item:not(.pl-phantom)'));
    if (!rows.length) return 0;
    const over = e.target && e.target.closest ? e.target.closest('.pl-item') : null;
    if (over && !over.classList.contains('pl-phantom')){
      const idx = rows.indexOf(over);
      if (idx >= 0){
        const zone = fileZone(e, over);
        return zone === 'before' ? idx : idx + 1;   // replace-zone handled elsewhere
      }
    }
    const first = rows[0].getBoundingClientRect();
    return e.clientY < first.top + first.height / 2 ? 0 : rows.length;
  }
  function clearPlDropReplace(){
    if (!el.plList) return;
    el.plList.querySelectorAll('.pl-item.drop-replace').forEach(r => r.classList.remove('drop-replace'));
  }
  function clearPmDropReplace(){
    if (!el.pmList) return;
    el.pmList.querySelectorAll('.pm-row.drop-replace').forEach(r => r.classList.remove('drop-replace'));
  }
  function setPlDropIndicator(idx){
    if (!el.plList) return;
    const rows = Array.from(el.plList.querySelectorAll('.pl-item:not(.pl-phantom)'));
    rows.forEach((r, k) => {
      r.classList.toggle('drop-before', idx === k);
      r.classList.toggle('drop-after', idx === k + 1);
    });
  }
  function clearPlDropIndicator(){
    if (!el.plList) return;
    el.plList.querySelectorAll('.pl-item.drop-before, .pl-item.drop-after')
      .forEach(r => r.classList.remove('drop-before', 'drop-after'));
  }
  // v107: same insertion helpers for the Playlist Manager row list.
  function pmDropInsertIndex(e){
    const rows = Array.from(el.pmList.querySelectorAll('.pm-row'));
    if (!rows.length) return 0;
    const over = e.target && e.target.closest ? e.target.closest('.pm-row') : null;
    if (over){
      const idx = rows.indexOf(over);
      if (idx >= 0){
        const zone = fileZone(e, over);
        return zone === 'before' ? idx : idx + 1;   // replace-zone handled elsewhere
      }
    }
    const first = rows[0].getBoundingClientRect();
    return e.clientY < first.top + first.height / 2 ? 0 : rows.length;
  }
  function setPmDropIndicator(idx){
    if (!el.pmList) return;
    const rows = Array.from(el.pmList.querySelectorAll('.pm-row'));
    rows.forEach((r, k) => {
      r.classList.toggle('drop-before', idx === k);
      r.classList.toggle('drop-after', idx === k + 1);
    });
  }
  function clearPmDropIndicator(){
    if (!el.pmList) return;
    el.pmList.querySelectorAll('.pm-row.drop-before, .pm-row.drop-after')
      .forEach(r => r.classList.remove('drop-before', 'drop-after'));
  }

  function showMenuForItem(li, t){
    el.menuLayer.innerHTML = '';
    const sheet = document.createElement('div');
    sheet.className = 'menu-sheet';
    const rect = li.getBoundingClientRect();
    const top = rect.top + window.scrollY + 10;
    const left = rect.left + window.scrollX + 10;

    sheet.style.top = `${top}px`;
    sheet.style.left = `${left}px`;

    sheet.innerHTML = `
      <a href="${t.bandcamp || '#'}" target="_blank" rel="noopener">
        <i class="fa fa-download"></i> <span>Bandcamp / Download</span>
      </a>
      <a href="#" data-share>
        <i class="fa fa-share"></i> <span>Share</span>
      </a>
      <a href="#" data-like>
        <i class="fa fa-heart"></i> <span>${t.liked ? 'Unlike' : 'Like'}</span>
      </a>
    `;
    el.menuLayer.appendChild(sheet);

    const close = ()=>{ el.menuLayer.innerHTML=''; window.removeEventListener('click', close, true); };
    window.addEventListener('click', close, true);

    sheet.querySelector('[data-share]')?.addEventListener('click',(e)=>{
      e.preventDefault();
      if (navigator.share) {
        navigator.share({title: t.title, text: `${t.title} — ${t.artist}`, url: location.href}).catch(()=>{});
      } else {
        prompt('Copy link to share:', location.href);
      }
      close();
    });
    sheet.querySelector('[data-like]')?.addEventListener('click',(e)=>{
      e.preventDefault();
      t.liked = !t.liked;
      close();
    });
  }

  function escapeHTML(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

  // Curved scrollbar mapping
  function plEnsurePath(){
    if (state.plPathLen) return;
    try {
      state.plPathLen = el.plArcProgress.getTotalLength();
      el.plArcProgress.style.strokeDasharray = `0.01 ${state.plPathLen}`;
      el.plArcProgress.style.strokeDashoffset = '0';
    } catch{}
  }
  function setPlScrollRatio(r){
    plEnsurePath();
    r = clamp(r,0,1);
    const len = state.plPathLen * r;
    el.plArcProgress.style.strokeDasharray = `${len} ${state.plPathLen}`;
    const pt = el.plArcProgress.getPointAtLength(len);
    el.plArcKnob.setAttribute('cx', pt.x);
    el.plArcKnob.setAttribute('cy', pt.y);
  }
  function updatePlScrollFromList(){
    const ul = el.plList;
    const max = Math.max(1, ul.scrollHeight - ul.clientHeight);
    const r = clamp(ul.scrollTop / max, 0, 1);
    setPlScrollRatio(r);
  }
  function setListScrollFromRatio(r){
    const ul = el.plList;
    const max = Math.max(1, ul.scrollHeight - ul.clientHeight);
    ul.scrollTop = r * max;
  }
  // Dragging the curved scrollbar
  (function attachPlScrollDrag(){
    let dragging=false;
    const ptrToR=(x,y)=>{
      const p=clientToSVG(el.plScrollSVG, x,y);
      const cx=207.5, cy=207.5;
      let a=Math.atan2(p.y-cy,p.x-cx); // -pi..pi
      let r = (a + Math.PI/2) / Math.PI; // 0..1, top->bottom
      return clamp(r,0,1);
    };
    const start=(e)=>{ e.preventDefault(); dragging=true; setListScrollFromRatio(ptrToR(e.clientX,e.clientY)); };
    const move=(e)=>{ if(!dragging) return; e.preventDefault(); setListScrollFromRatio(ptrToR(e.clientX,e.clientY)); };
    const end = ()=>{ dragging=false; };
    el.plScrollSVG.addEventListener('pointerdown',start);
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',end);
  })();

  // Playlist open/close
  function togglePlaylist(force){
    if (typeof force === 'boolean') state.open = force;
    else state.open = !state.open;
    document.documentElement.style.setProperty('--open', state.open ? 1 : 0);
    el.body.classList.toggle('playlist-open', state.open);
    // Entry S21: pause/resume the PL 3D coaster render loop with the disc so
    // it only burns GPU while actually visible.
    if (plCoasterInst && viz.plMode === 'coaster'){
      if (state.open){ plCoasterInst.setActive(true); if (!plCoasterRAF) plCoasterRAF = requestAnimationFrame(plCoasterTick); }
      else plCoasterInst.setActive(false);
    }
    // refresh the curved scrollbar mapping after the layout settles
    setTimeout(() => { plEnsurePath(); updatePlScrollFromList(); }, 60);
  }

  // Load a track by index (apply theme with smooth fade)
  // Apply a theme to the player + editor with a crossfade from the current
  // look. Module-scope so saveMasterTheme/clearMasterTheme/reset can use it.
  function applyWithTheme(theme){
    if (!theme) return;
    writeThemeToUI(theme);
    const toVars = themeToVars(theme);
    const fromVars = currentThemeVars();
    applyTheme(theme, true);          // set instantly (no save spam)
    if (state._themeRaf) cancelAnimationFrame(state._themeRaf);
    crossfadeTheme(fromVars, toVars, 600, () => { applyTheme(theme, true); });
  }

  function snapProgressToZero(){
    // Immediately reset the arc, knob and time labels — prevents the next
    // track's full progress tail flashing for a frame.
    if (!state.pathLength) recalcArcOnce();
    el.arcProgress.style.strokeDasharray = `0.01 ${state.pathLength || 600}`;
    const pt0 = el.arcProgress.getPointAtLength ? el.arcProgress.getPointAtLength(0) : null;
    if (pt0){
      el.arcKnob.setAttribute('cx', pt0.x);
      el.arcKnob.setAttribute('cy', pt0.y);
      placeOverlayAtPoint(pt0);
    }
    el.timeCurrent.textContent = '0:00';
  }

  // ===== Cover auto-fill (default framing) =====
  // Newly loaded album art / video is CENTERED and zoomed just enough to
  // cover the whole player window, so the dark panel never shows behind it.
  // Anything the user tweaks (drag or zoom, saved per track) wins over the
  // default; only untweaked tracks get the auto-fill scale.
  const absURL = u => { try { return new URL(u, location.href).href; } catch { return u; } };

  function computeCoverFillScale(){
    const video = el.coverVideo, img = el.cover;
    const useV = !!(video && video.style.display !== 'none' && video.videoWidth > 0);
    const nw = useV ? video.videoWidth : (img.naturalWidth || 0);
    const nh = useV ? video.videoHeight : (img.naturalHeight || 0);
    if (!nw || !nh) return null;
    const disp = useV ? video : img;
    const r = disp.getBoundingClientRect();
    const RW = (r && r.width > 0) ? r.width : 415;
    const RH = (r && r.height > 0) ? r.height : 415;
    const f = Math.min(RW / nw, RH / nh);                 // contain fit
    return Math.max(1, Math.max(RW / (nw * f), RH / (nh * f)));  // scale up to cover
  }

  function trackTransform(t){
    return (t && (t.transform || (t.theme && t.theme.transform))) || {};
  }
  function isIdentityTransform(tr){
    return (!tr.coverScale || tr.coverScale === 1) && !tr.coverDx && !tr.coverDy;
  }

  // Apply the auto-fill scale to the CURRENT vars/UI (no guards).
  function applyCoverAutoFill(){
    const s = computeCoverFillScale();
    if (!s) return false;
    setVarNum(coverVar('scale'), s);
    if (el.coverZoom){ el.coverZoom.value = String(s); el.coverZoomVal.textContent = s.toFixed(2) + '×'; }
    return true;
  }

  // Cover-ARTWORK fill — its own --art-* layer behind the video. It must FILL the
  // circle by default (like the video), then the user can reposition / zoom out to
  // reveal the full image. computeCoverFillScale() can't be reused: it keys off the
  // VIDEO when one is showing. This always measures the cover <img>.
  function computeArtFillScale(){
    const img = el.cover;
    const nw = img.naturalWidth || 0, nh = img.naturalHeight || 0;
    if (!nw || !nh) return null;
    const r = img.getBoundingClientRect();
    const RW = (r && r.width > 0) ? r.width : 415;
    const RH = (r && r.height > 0) ? r.height : 415;
    const f = Math.min(RW / nw, RH / nh);                  // contain fit
    return Math.max(1, Math.max(RW / (nw * f), RH / (nh * f)));  // scale up to cover
  }
  function applyArtAutoFill(){
    const s = computeArtFillScale();
    if (!s) return false;
    setVarNum(artVar('scale'), s);
    const az = document.getElementById('artZoom');
    if (az) az.value = String(s);
    const azv = document.getElementById('artZoomVal');
    if (azv) azv.textContent = s.toFixed(2) + '×';
    return true;
  }
  // Mirrors maybeAutoFillCover for the artwork BACKDROP. Only video tracks have a
  // separate art layer; audio-only uses the cover as its main media (--cover-*).
  function maybeAutoFillArt(){
    const t = demoPlaylist[state.currentIndex];
    if (!t || !t.video) return;
    applyArtAutoFill();
  }

  // Media finished loading: if the current track is still untweaked, frame
  // it to cover the window. Called from the cover img 'load' and video
  // 'loadedmetadata' events, so it fires exactly when natural size is known.
  function maybeAutoFillCover(){
    const t = demoPlaylist[state.currentIndex];
    if (!t) return;
    applyCoverAutoFill();   // always frame the main media to fill the circle on load
  }

  // ============================================================
  // PER-TRACK PLAYLIST-PANEL BACKDROP
  // Each track carries its own playlist-panel cover image + video
  // (independent of the main player) OR mirrors the main player's media.
  // Both layers fill the circle (contain + cover-fill) and reposition/zoom
  // independently: --pl-art-* (image), --pl-vid-* (video).
  // ============================================================
  const plVar    = (n, v)   => { if (el.plCircle) el.plCircle.style.setProperty(n, v); };
  const plVarPx  = (n, px)  => plVar(n, `${Math.round(px)}px`);
  const plVarNum = (n, num) => plVar(n, String(num));
  const plGetVar = (n, fb=0) => el.plCircle ? (parseFloat(getComputedStyle(el.plCircle).getPropertyValue(n)) || fb) : fb;

  function computePlFillScale(video){
    const m = video ? el.plVideo : el.plCover; if (!m) return null;
    const nw = video ? (m.videoWidth||0)  : (m.naturalWidth||0);
    const nh = video ? (m.videoHeight||0) : (m.naturalHeight||0);
    if (!nw || !nh) return null;
    const r = el.plCircle.getBoundingClientRect();
    const RW = (r && r.width > 0) ? r.width : 415;
    const RH = (r && r.height > 0) ? r.height : 415;
    const f = Math.min(RW/nw, RH/nh);
    return Math.max(1, Math.max(RW/(nw*f), RH/(nh*f)));
  }
  function applyPlArtFill(){
    const t = demoPlaylist[state.currentIndex];
    if (t && t.plMirror !== false && t.plMedia === true) return false;  // mirror mode: framing follows the main player
    const s = computePlFillScale(false); if (!s) return false;
    plVarNum('--pl-art-scale', s);
    const z = document.getElementById('plArtZoom'); if (z) z.value = String(s);
    const zv = document.getElementById('plArtZoomVal'); if (zv) zv.textContent = s.toFixed(2) + '×';
    return true;
  }
  function applyPlVidFill(){
    const t = demoPlaylist[state.currentIndex];
    if (t && t.plMirror !== false && t.plMedia === true) return false;  // mirror mode: framing follows the main player
    const s = computePlFillScale(true); if (!s) return false;
    plVarNum('--pl-vid-scale', s);
    const z = document.getElementById('plVidZoom'); if (z) z.value = String(s);
    const zv = document.getElementById('plVidZoomVal'); if (zv) zv.textContent = s.toFixed(2) + '×';
    return true;
  }

  // Apply THIS track's playlist-panel backdrop (mirror or independent media +
  // saved transforms) and frame both layers to fill the circle.
  // In MIRROR mode the playlist video tracks the MAIN player's video: same
  // play/pause, currentTime and playbackRate. (Independent mode plays freely.)
  function syncPlVideo(){
    const v = el.plVideo, m = el.coverVideo;
    if (!v || !m) return;
    const t = demoPlaylist[state.currentIndex];
    const mirror = !!(t && t.plMirror !== false && t.plMedia === true);
    if (!mirror) return;
    if (t && t.plVideoOn === false) return;   // video layer off -> never drive the panel video
    if (!m.currentSrc || m.readyState < 1) return;
    try {
      if (m.paused){ if (!v.paused) v.pause(); }
      else if (v.paused){ v.play().catch(()=>{}); }
    } catch {}
    // keep the panel video on the same frame as the main video (so a paused main
    // still shows its frame in the panel, not the cover art)
    if (Math.abs(v.currentTime - m.currentTime) > 0.08){ try { v.currentTime = m.currentTime; } catch {} }
    if (v.playbackRate !== m.playbackRate){ try { v.playbackRate = m.playbackRate; } catch {} }
  }
  function attachPlVideoSync(){
    const m = el.coverVideo; if (!m || !el.plVideo) return;
    const sync = () => syncPlVideo();
    ['play','pause','seeked','seeking','ratechange','loadedmetadata','timeupdate','playing','waiting','ended'].forEach(ev => m.addEventListener(ev, sync));
    // when the panel video becomes ready (e.g. right after Mirror is toggled on),
    // sync it so it actually starts playing in step with the main video.
    ['loadedmetadata','canplay'].forEach(ev => el.plVideo.addEventListener(ev, sync));
  }

  // In MIRROR mode the panel's FRAMING follows the main player too: panel video <- main
  // video's --cover-*, panel artwork <- main artwork's --art-*. (Independent mode keeps
  // its own --pl-* transforms.) Signature-cached so the per-frame beat-pulse style writes
  // on el.player don't trigger redundant work.
  let _lastPlMirrorSig = '';
  function syncPlMirror(){
    if (!el.plCircle || !el.player) return;
    const t = demoPlaylist[state.currentIndex];
    const mirror = !!(t && t.plMirror !== false && t.plMedia === true);
    if (!mirror){ _lastPlMirrorSig = ''; return; }
    const g = (n) => getComputedStyle(el.player).getPropertyValue(n).trim();
    const av = [g('--art-dx'), g('--art-dy'), g('--art-scale')];
    const cinemaOn = el.player.classList.contains('cinema');
    // The panel video mirrors the main video ONLY while cinema is engaged (the cinema
    // view). When the main player reveals its controls (cinema off) the panel FREEZES
    // on the last cinema framing so it keeps playing the cinema view instead of jumping
    // to the non-cinema view. The cover art always mirrors the main cover (it never
    // changes with cinema, so it doesn't switch).
    const cv = cinemaOn ? [g('--cinema-dx'), g('--cinema-dy'), g('--cinema-scale')] : null;
    const sig = (cv ? cv.join('|') : 'freeze') + '||' + av.join('|');
    if (sig === _lastPlMirrorSig) return;
    _lastPlMirrorSig = sig;
    if (cv){ plVar('--pl-vid-dx', cv[0] || '0px'); plVar('--pl-vid-dy', cv[1] || '0px'); plVar('--pl-vid-scale', cv[2] || '1'); }
    plVar('--pl-art-dx', av[0] || '0px'); plVar('--pl-art-dy', av[1] || '0px'); plVar('--pl-art-scale', av[2] || '1');
  }
  function attachPlMirror(){
    if (!el.player || !el.plCircle || typeof MutationObserver === 'undefined') return;
    // re-mirror whenever the main player's inline transform vars change (drag/zoom/load/cinema)
    new MutationObserver(syncPlMirror).observe(el.player, { attributes: true, attributeFilter: ['style'] });
  }

  function applyPlBackdrop(t){
    if (!el.plCircle) return;
    const mediaOn = !!(t && t.plMedia === true);    // default: media OFF (show colour scheme from Colors)
    el.plCircle.classList.toggle('pl-media-off', !mediaOn);
    if (!mediaOn){
      try { el.plVideo.pause(); } catch {}
      // clear any stale image so a previous track's artwork can never linger
      // while the panel is showing the colour scheme
      try { el.plCover.removeAttribute('src'); } catch {}
      try { if (el.plVideo.src){ el.plVideo.removeAttribute('src'); el.plVideo.load(); } } catch {}
      el.plCircle.classList.remove('pl-video-on');
      syncPlBackdropUI(t); return;
    }
    const mirror = !!(t && t.plMirror === true);    // default OFF — show colour scheme unless explicitly enabled
    const videoOn = !(t && t.plVideoOn === false);    // default: video layer ON
    const coverSrc = mirror ? ((t && t.cover) || '') : ((t && t.plCover) || '');
    const videoSrc = videoOn ? (mirror ? ((t && t.video) || '') : ((t && t.plVideo) || '')) : '';
    if (coverSrc){ el.plCover.src = coverSrc; } else { try { el.plCover.removeAttribute('src'); } catch {} }
    if (videoSrc){
      if ((el.plVideo.currentSrc || el.plVideo.src) !== videoSrc){ el.plVideo.src = videoSrc; el.plVideo.load(); }
      el.plVideo.muted = true; el.plCircle.classList.add('pl-video-on');
      if (mirror){
        el.plVideo.loop = !!el.coverVideo.loop;   // follow the main video's loop behaviour
        syncPlVideo();                            // mirror the main video (play/pause + time + rate)
        if (!el.coverVideo.paused){ try { el.plVideo.play().catch(()=>{}); } catch {} }  // ensure it plays
      } else {
        el.plVideo.loop = true;                   // independent backdrop: ambient loop
        try { el.plVideo.play().catch(()=>{}); } catch {}
      }
    } else {
      // video off (or no video source): hide + pause. KEEP the src so toggling back on
      // is instant — reloading on re-enable caused a race that left the panel stuck on
      // cover art. The element is display:none + paused, so keeping the src is cheap.
      try { el.plVideo.pause(); } catch {}
      el.plCircle.classList.remove('pl-video-on');
    }
    const pa = (t && t.plArt) || {};
    plVarPx('--pl-art-dx', pa.dx || 0); plVarPx('--pl-art-dy', pa.dy || 0);
    const pv = (t && t.plVid) || {};
    plVarPx('--pl-vid-dx', pv.dx || 0); plVarPx('--pl-vid-dy', pv.dy || 0);
    if (el.plCover.complete && el.plCover.naturalWidth) applyPlArtFill();
    if (el.plVideo.readyState >= 1) applyPlVidFill();
    setTimeout(() => { applyPlArtFill(); applyPlVidFill(); }, 800);
    syncPlBackdropUI(t);
    syncPlMirror();   // mirror mode: override the panel framing with the main player's
  }

  function syncPlBackdropUI(t){
    const md = document.getElementById('plMedia'); if (md) md.checked = !!(t && t.plMedia === true);
    const vn = document.getElementById('plVideoOn'); if (vn) vn.checked = !!(t && t.plVideoOn !== false);
    const m = document.getElementById('plMirror'); if (m) m.checked = !!(t && t.plMirror === true);
    const a = document.getElementById('plArtZoom');
    if (a){ const v = (t && t.plArt && t.plArt.scale) || 1; a.value = String(v); }
    const av = document.getElementById('plArtZoomVal'); if (av) av.textContent = (parseFloat(a && a.value) || 1).toFixed(2) + '×';
    const vz = document.getElementById('plVidZoom');
    if (vz){ const v = (t && t.plVid && t.plVid.scale) || 1; vz.value = String(v); }
    const vzv = document.getElementById('plVidZoomVal'); if (vzv) vzv.textContent = (parseFloat(vz && vz.value) || 1).toFixed(2) + '×';
  }

  function persistPlTransform(){
    const t = demoPlaylist[state.currentIndex]; if (!t) return;
    t.plArt = { dx: plGetVar('--pl-art-dx'), dy: plGetVar('--pl-art-dy'), scale: plGetVar('--pl-art-scale', 1) };
    t.plVid = { dx: plGetVar('--pl-vid-dx'), dy: plGetVar('--pl-vid-dy'), scale: plGetVar('--pl-vid-scale', 1) };
    state.playlistDirty = true; savePlaylist();
  }

  // Drag-&-drop media onto the playlist circle -> set THIS track's backdrop.
  function attachPlDrop(){
    const circle = el.plCircle; if (!circle) return;
    circle.addEventListener('dragover', e => { if (e.dataTransfer && Array.from(e.dataTransfer.types||[]).includes('Files')){ e.preventDefault(); circle.classList.add('pl-drop-target'); } });
    circle.addEventListener('dragleave', () => circle.classList.remove('pl-drop-target'));
    circle.addEventListener('drop', e => {
      e.preventDefault(); circle.classList.remove('pl-drop-target');
      const t = demoPlaylist[state.currentIndex]; if (!t) return;
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (!f) return;
      const isImg = f.type.startsWith('image/'), isVid = f.type.startsWith('video/');
      if (!isImg && !isVid) return;
      t.plMirror = false;                       // dropping independent media = leave mirror mode
      const url = URL.createObjectURL(f); state.liveBlobs.add(url);
      if (isImg){ t.plCover = url; t._plCoverName = f.name; uploadFile(f, 'plCover').then(u => { if (u && demoPlaylist[state.currentIndex] === t){ t.plCover = u; t._serverPlCover = u; savePlaylist(); saveTheme({server:true}); } }); }
      else      { t.plVideo = url; t._plVideoName = f.name; uploadFile(f, 'plVideo').then(u => { if (u && demoPlaylist[state.currentIndex] === t){ t.plVideo = u; t._serverPlVideo = u; savePlaylist(); saveTheme({server:true}); } }); }
      applyPlBackdrop(t); state.playlistDirty = true; savePlaylist();
    });
  }

  // Reposition/zoom the playlist backdrop layers (parallel to the main player's
  // toggleDragMode). mode = 'pl-art' (image) | 'pl-vid' (video).
  function togglePlDragMode(mode){ if (state.plDragMode === mode){ endPlDragMode(); return; } startPlDragMode(mode); }
  function startPlDragMode(mode){
    if (!el.plDragOverlay) return;
    state.plDragMode = mode;
    el.plDragOverlay.classList.add('active');
    const dxVar = mode === 'pl-vid' ? '--pl-vid-dx' : mode === 'pl-viz' ? '--pl-viz-dx' : '--pl-art-dx';
    const dyVar = mode === 'pl-vid' ? '--pl-vid-dy' : mode === 'pl-viz' ? '--pl-viz-dy' : '--pl-art-dy';
    const scVar = mode === 'pl-vid' ? '--pl-vid-scale' : mode === 'pl-viz' ? '--pl-viz-scale' : '--pl-art-scale';
    const zoomEl  = document.getElementById(mode === 'pl-vid' ? 'plVidZoom' : 'plArtZoom');
    const zoomVal = document.getElementById(mode === 'pl-vid' ? 'plVidZoomVal' : 'plArtZoomVal');
    const fillFn  = mode === 'pl-vid' ? applyPlVidFill : applyPlArtFill;
    const onDown  = e => { e.preventDefault(); el.plDragOverlay.classList.add('grabbing'); state.startX=e.clientX; state.startY=e.clientY; state.startDx=plGetVar(dxVar); state.startDy=plGetVar(dyVar); el.plDragOverlay.setPointerCapture?.(e.pointerId); };
    const onMove  = e => { if (!el.plDragOverlay.hasPointerCapture?.(e.pointerId)) return; plVarPx(dxVar, state.startDx + (e.clientX-state.startX)); plVarPx(dyVar, state.startDy + (e.clientY-state.startY)); };
    const onUp    = e => { if (el.plDragOverlay.hasPointerCapture?.(e.pointerId)) el.plDragOverlay.releasePointerCapture?.(e.pointerId); el.plDragOverlay.classList.remove('grabbing'); persistPlTransform(); };
    const onDbl   = () => { plVarPx(dxVar, 0); plVarPx(dyVar, 0); fillFn(); persistPlTransform(); };
    const onKey   = e => { if (e.key === 'Escape' || e.key === 'Enter') endPlDragMode(); };
    const onWheel = e => { e.preventDefault(); let s = plGetVar(scVar, 1) + (-e.deltaY*0.0015); s = Math.max(0.5, Math.min(5, s)); plVarNum(scVar, s); if (zoomEl) zoomEl.value = String(s); if (zoomVal) zoomVal.textContent = s.toFixed(2)+'×'; };
    state._plDragHandlers = { onDown, onMove, onUp, onDbl, onKey, onWheel };
    el.plDragOverlay.addEventListener('pointerdown', onDown);
    el.plDragOverlay.addEventListener('pointermove', onMove);
    el.plDragOverlay.addEventListener('pointerup', onUp);
    el.plDragOverlay.addEventListener('pointercancel', onUp);
    el.plDragOverlay.addEventListener('dblclick', onDbl);
    el.plDragOverlay.addEventListener('wheel', onWheel, { passive:false });
    window.addEventListener('keydown', onKey);
  }
  function endPlDragMode(){
    if (!state.plDragMode) return;
    const h = state._plDragHandlers;
    if (h && el.plDragOverlay){
      el.plDragOverlay.classList.remove('active','grabbing');
      el.plDragOverlay.removeEventListener('pointerdown', h.onDown);
      el.plDragOverlay.removeEventListener('pointermove', h.onMove);
      el.plDragOverlay.removeEventListener('pointerup', h.onUp);
      el.plDragOverlay.removeEventListener('pointercancel', h.onUp);
      el.plDragOverlay.removeEventListener('dblclick', h.onDbl);
      el.plDragOverlay.removeEventListener('wheel', h.onWheel);
      window.removeEventListener('keydown', h.onKey);
    }
    state.plDragMode = null;
  }

  // Wire the editor controls (mirror toggle + zoom sliders + reposition/reset).
  function attachPlFraming(){
    const md = document.getElementById('plMedia'); if (md) md.addEventListener('change', () => {
      const t = demoPlaylist[state.currentIndex]; if (!t) return;
      t.plMedia = md.checked; applyPlBackdrop(t); state.playlistDirty = true; savePlaylist();
    });
    const m = document.getElementById('plMirror'); if (m) m.addEventListener('change', () => {
      const t = demoPlaylist[state.currentIndex]; if (!t) return;
      t.plMirror = m.checked; applyPlBackdrop(t); state.playlistDirty = true; savePlaylist();
    });
    const vn = document.getElementById('plVideoOn'); if (vn) vn.addEventListener('change', () => {
      const t = demoPlaylist[state.currentIndex]; if (!t) return;
      t.plVideoOn = vn.checked; applyPlBackdrop(t); state.playlistDirty = true; savePlaylist();
    });
    const pickFile = (inputId, isImg) => {
      const inp = document.getElementById(inputId); if (!inp) return;
      inp.addEventListener('change', () => {
        const t = demoPlaylist[state.currentIndex]; const f = inp.files && inp.files[0];
        if (!t || !f) return;
        t.plMirror = false;
        const url = URL.createObjectURL(f); state.liveBlobs.add(url);
        if (isImg){ t.plCover = url; t._plCoverName = f.name; } else { t.plVideo = url; t._plVideoName = f.name; }
        applyPlBackdrop(t); state.playlistDirty = true; savePlaylist();
        uploadFile(f, isImg ? 'plCover' : 'plVideo').then(u => {
          if (u && demoPlaylist[state.currentIndex] === t){ if (isImg){ t.plCover = u; t._serverPlCover = u; } else { t.plVideo = u; t._serverPlVideo = u; } savePlaylist(); saveTheme({server:true}); }
        });
        inp.value = '';
      });
    };
    pickFile('filePlCover', true);
    pickFile('filePlVideo', false);
    // Reset PL backdrop to the track's own artwork (clears custom PL cover/video)
    const btnPlCoverReset = document.getElementById('btnPlCoverReset');
    if (btnPlCoverReset) btnPlCoverReset.addEventListener('click', () => {
      const t = demoPlaylist[state.currentIndex]; if (!t) return;
      delete t.plCover; delete t.plVideo; delete t._plCoverName; delete t._plVideoName;
      t.plMirror = true;
      const mEl = document.getElementById('plMirror'); if (mEl) mEl.checked = true;
      applyPlBackdrop(t); state.playlistDirty = true; savePlaylist();
      setSyncStatus('Playlist panel reset to track artwork ✓', true);
    });
    const wireZoom = (id, valId, scVar) => {
      const z = document.getElementById(id); if (!z) return;
      z.addEventListener('input', () => { const s = parseFloat(z.value) || 1; plVarNum(scVar, s); const v = document.getElementById(valId); if (v) v.textContent = s.toFixed(2) + '×'; persistPlTransform(); });
    };
    wireZoom('plArtZoom', 'plArtZoomVal', '--pl-art-scale');
    wireZoom('plVidZoom', 'plVidZoomVal', '--pl-vid-scale');
    const bd = document.getElementById('btnPlArtDrag'); if (bd) bd.addEventListener('click', () => togglePlDragMode('pl-art'));
    const bv = document.getElementById('btnPlVidDrag'); if (bv) bv.addEventListener('click', () => togglePlDragMode('pl-vid'));
    const br = document.getElementById('btnPlArtReset'); if (br) br.addEventListener('click', () => { plVarPx('--pl-art-dx',0); plVarPx('--pl-art-dy',0); applyPlArtFill(); persistPlTransform(); });
    const vr = document.getElementById('btnPlVidReset'); if (vr) vr.addEventListener('click', () => { plVarPx('--pl-vid-dx',0); plVarPx('--pl-vid-dy',0); applyPlVidFill(); persistPlTransform(); });
    // re-fill when the playlist media reports its real size
    if (el.plCover) el.plCover.addEventListener('load', () => { if (state.plDragMode !== 'pl-art') applyPlArtFill(); });
    if (el.plVideo) el.plVideo.addEventListener('loadedmetadata', () => { if (state.plDragMode !== 'pl-vid') applyPlVidFill(); });
  }

  function loadTrack(index, autoplay=false){
    flushAutoSave();   // Entry S28: save the outgoing track's pending edits before switching
    _autoSaveArmed = false;   // Entry S29: disarm during load so autosave can't snapshot stale data into the incoming track before its cover-derived theme lands
    window.__preloadNextUrl = null;
    engageCinema(false);   // exit cinema on track switch — every track loads non-cinema
    AB.gen = (AB.gen || 0) + 1;      // invalidate any in-flight blend rAF
    if (AB.blendRaf){ cancelAnimationFrame(AB.blendRaf); AB.blendRaf = null; }
    AB.active = false;
    AB._preloadNext = null;
    AB._blendNext = null;
    // STOP EVERYTHING: the original element AND both AB elements. Without
    // this, a preloaded/blended AB element keeps playing when the user
    // clicks another track — two tracks at once, and no way to stop the
    // phantom one.
    // capture the preloaded URL BEFORE abStopAll() (it clears _lastSrc)
    const __preUrl = (() => { const p = (AB.cur === 'a') ? AB.b : AB.a; return (p && p._lastSrc) ? String(p._lastSrc) : null; })();
    abStopAll();
    try { el.audio.pause(); } catch {}
    try { el.audio.volume = getUIVolume() || 0.75; } catch {}
    saveResume();   // remember the PREVIOUS track's position (if enabled)

    // EMPTY PLAYLIST: stop everything and show a neutral state instead of
    // crashing on demoPlaylist[0] === undefined.
    if (!demoPlaylist.length){
      state.currentIndex = 0;
      snapProgressToZero();
      stopRAF();
      el.audio.removeAttribute('src'); el.audio.load();
      el.cover.src = defaultCoverFromName('Playlist is empty');
      el.title.textContent = 'Playlist is empty';
      el.artist.textContent = 'Add songs in the editor (Playlist Manager tab)';
      if (el.coverVideo && el.coverVideo.src){ el.coverVideo.pause(); el.coverVideo.removeAttribute('src'); el.coverVideo.load(); el.coverVideo.style.display = 'none'; el.cover.style.display = 'block'; }
      el.player.classList.remove('video-active');
      setMaster('audio');
      updatePlayIcon();
      return;
    }
    state.currentIndex = clamp(index, 0, demoPlaylist.length-1);
    const t = demoPlaylist[state.currentIndex];

    // snap the progress UI to zero NOW (before touching the audio) so the
    // old track's tail can never flash on the new track
    snapProgressToZero();
    stopRAF();

    // suppress transient play/pause icon flicker while swapping
    state._switching = true;

    // content
    el.audio.pause();
    // revive dead blob urls at CLICK TIME: if this track points at a blob
    // that died (previous session, or revoked by another upload), swap in
    // the SERVER copy of THIS SAME TRACK before assigning the src — the
    // element would otherwise load a dead URL and stay silent forever.
    const tServer = (state.themeFromServer && Array.isArray(state.themeFromServer.tracks))
      ? state.themeFromServer.tracks[state.currentIndex] : null;
    ['audio','cover','video'].forEach(k => {
      if (isDeadBlob(t[k])){
        const srv = tServer && tServer[k] && !isDeadBlob(tServer[k]) ? tServer[k] : null;
        if (srv && srv !== t[k]){
          t[k] = srv;
          savePlaylist();
        } else if (k === 'cover'){
          // no server copy of the artwork -> deterministic placeholder so the
          // media window never shows a broken/blank image
          t[k] = defaultCoverFromName(t.title || 'Track');
          savePlaylist();
        }
      }
    });
    // INSTANT SWITCH: if this exact track is ALREADY loaded in the inactive
    // AB element (the transition engine preloads the next track), hand it
    // over immediately — zero network fetch, zero media-teardown delay.
    // This is what makes clicking the next/adjacent track start instantly.
    // PLAYBACK SOURCE: the live session blob (file dropped/selected in THIS
    // page) plays instantly with zero network — the server URL is for
    // persistence/reloads. Prefer the blob so clicks never wait on a fetch.
    const playSrc = (t._blobURL && state.liveBlobs.has(t._blobURL)) ? t._blobURL : proxiedMediaUrl(t.audio);
    const pre = (AB.cur === 'a') ? AB.b : AB.a;
    const preIsMatch = !!(pre && __preUrl && __preUrl === String(playSrc) && pre.readyState >= 2);
    if (window.__dbg && !preIsMatch){
      try { window.__dbg.push({ t: 'noMatch', preUrl: __preUrl, playSrc: String(playSrc), rs: pre ? pre.readyState : null, hasPre: !!pre, cur: AB.cur }); } catch {}
    }
    if (preIsMatch){
      try { el.audio.pause(); } catch {}
      try { el.audio.volume = 0; } catch {}
      const vol = getUIVolume() || 0.75;
      pre.volume = vol;
      detachMediaHandlers(el.audio);
      state.master = pre;
      attachMediaHandlers(pre);
      AB.preloading = false;
      AB._preloadNext = null;
      // CRITICAL: flip AB.cur so the A/B bookkeeping matches reality
      // (master is now the "active" element). Without this, cancelCrossfade
      // silenced the MASTER on scrub (sound stopped), armCrossfade preloaded
      // the NEXT track INTO the playing element, and blend in/out elements
      // were inverted — the "sound stops after clicking ahead" glitch.
      abSwitchActive();
      try { pre.playbackRate = gs.speed; } catch {}
      if (autoplay){
        state._manualPlayAt = performance.now();
        pre.play().catch(()=>{});
        if (gs.fade) fadeInAudio(pre, vol, 250);
      }
    } else {
      el.audio.src = playSrc;
      el.audio.preload = 'auto';   // keep a buffer so seeks resume instantly
      el.audio.load();
      applySpeed();

      setMaster('audio');
      if (gs.resume) restoreResume();
      if (autoplay){
        state._manualPlayAt = performance.now();
        el.audio.play().catch((e) => { if (window.__dbg) window.__dbg.push({ t: 'playReject', name: e && e.name, msg: e && String(e.message).slice(0, 80) }); });
        if (gs.fade) fadeInAudio(el.audio, getUIVolume() || 0.75, 450);
      }
      // warm the HTTP cache with the NEXT track's file (and the previous
      // track's) so subsequent clicks start instantly through the proxy
      warmSurroundingTracks();
    }

    // cover: use the track's own art, else a deterministic default derived
    // from the title — NEVER leave the previous track's artwork showing
    state._coverFallbackTried = false;
    const coverUrl = t.cover || defaultCoverFromName(t.title || 'Track');
    el.cover.src = coverUrl;
    el.title.textContent = t.title;
    el.artist.textContent = t.artist;
    updateBpmChip(t);          // DJ Phase 2: tempo chip in the info area
    // editor: sync the artwork-palette dropdown to this track's saved role
    if (el.paletteChoice) el.paletteChoice.value = t._paletteRole || 'auto';
    // editor: refresh the 7 palette preview tiles + random/restore state
    renderPalettePreviews(t);
    updatePaletteUI(t);
    // ensure the play icon + button reflect the FINAL state immediately
    updatePlayIcon();
    requestAnimationFrame(() => { state._switching = false; updatePlayIcon(); });

    // theme: saved custom theme wins; otherwise derive a default palette
    // from the cover (thumbnail) colours, then crossfade from the current.
    const applyWith = applyWithTheme;
    const saved = effectiveTheme(t);
    if (saved){
      // per-track (or overall) theme applies on BOTH pages — so the
      // deployed player shows each track's saved look, exactly like the editor
      applyWith(saved);
    } else if (isEditorPage()){
      // EDITOR PAGE ONLY: derive a default palette from the cover art
      // (honouring the track's saved artwork-palette role).
      const genAtStart = state.themeGen || 0;
      deriveThemeFromCover(t, t && t._paletteRole).then(theme => {
        // skip if a theme landed meanwhile (server restore or another load)
        if ((state.themeGen || 0) !== genAtStart) return;
        if (effectiveTheme(demoPlaylist[state.currentIndex])) return;
        const cur = demoPlaylist[state.currentIndex];
        if (cur && !cur._original){
          cur._original = { title: cur.title, artist: cur.artist, cover: cur.cover, audio: cur.audio, video: cur.video, theme: JSON.parse(JSON.stringify(theme)), transform: null, panelImage: t.panelImage || null, panelImageGrey: t.panelImageGrey || null, panelGrey: !!t.panelGrey, panelBlend: (typeof t.panelBlend === 'number') ? t.panelBlend : 0, panelBlendMode: t.panelBlendMode || 'normal' };
        }
        cur.theme = theme;
        savePlaylist();
        applyWith(theme);
      });
    } else {
      // DEPLOYED page, no saved theme: derive a palette from THIS track's
      // artwork (cached per cover) so every track gets its own look instead
      // of keeping the previous track's colours. If the artwork is missing,
      // keep the current look.
      const cv = t && t.cover;
      if (cv){
        if (t._derivedTheme && t._derivedTheme._for === cv){
          applyWith(t._derivedTheme);
        } else {
          deriveThemeFromCover({ cover: cv }, t && t._paletteRole).then(theme => {
            const cur = demoPlaylist[state.currentIndex];
            if (!cur || cur !== t) return;
            if (effectiveTheme(cur)) return;   // a saved theme landed meanwhile
            t._derivedTheme = Object.assign({ _for: cv }, theme);
            applyWith(theme);
          });
        }
      }
    }

    // v103: this track's OWN wave-panel image / blend / grey / tint mode
    applyPanelMedia(t);

    // list highlight — skip the phantom spacer row so the REAL track at
    // index i gets the highlight (not the one above/below it)
    Array.from(el.plList.querySelectorAll('.pl-item:not(.pl-phantom)')).forEach((li, i)=>{
      li.classList.toggle('current', i===state.currentIndex);
    });

    // per-track cover/panel transforms (zoom + position saved per track).
    // Untweaked tracks get the AUTO-FILL scale so the artwork covers the
    // whole window by default (centered, no dark panel showing); saved
    // adjustments are used as-is.
    const tr = trackTransform(t);
    let cs = tr.coverScale || 1;
    if (isIdentityTransform(tr)){
      const auto = computeCoverFillScale();
      if (auto) cs = auto;
      else if (el.coverVideo && el.coverVideo.style.display !== 'none'){
        // timing fix: video dimensions aren't ready at load time -> re-apply the
        // fill-scale once metadata lands (so the video fills the circle reliably)
        const fill = () => {
          if (demoPlaylist[state.currentIndex] !== t) return;
          if (!isIdentityTransform(trackTransform(t))) return;
          const s = computeCoverFillScale();
          if (s){ setVarNum(coverVar('scale'), s); if (el.coverZoom) el.coverZoom.value = String(s); if (el.coverZoomVal) el.coverZoomVal.textContent = s.toFixed(2) + '×'; }
        };
        if (el.coverVideo.readyState >= 1) fill();
        else el.coverVideo.addEventListener('loadedmetadata', fill, { once: true });
        setTimeout(fill, 800);
      }
    }
    setVarPx('--cover-dx', tr.coverDx || 0);
    setVarPx('--cinema-dx', ((t && t.cinemaTransform && t.cinemaTransform.coverDx) || tr.coverDx || 0));
    setVarPx('--cover-dy', tr.coverDy || 0);
    setVarPx('--cinema-dy', ((t && t.cinemaTransform && t.cinemaTransform.coverDy) || tr.coverDy || 0));
    setVarNum('--cover-scale', cs);
    setVarNum('--cinema-scale', ((t && t.cinemaTransform && t.cinemaTransform.coverScale) || cs));
    setVarPx('--panel-dx', tr.panelDx || 0);
    setVarPx('--panel-dy', tr.panelDy || 0);
    setVarNum('--panel-scale', tr.panelScale || 1);
    if (el.coverZoom) el.coverZoom.value = String(cs);
    if (el.coverZoomVal) el.coverZoomVal.textContent = cs.toFixed(2) + '×';
    if (el.panelZoom) el.panelZoom.value = String(tr.panelScale || 1);
    if (el.panelZoomVal) el.panelZoomVal.textContent = (tr.panelScale || 1).toFixed(2) + '×';

    // visualiser transform: restore saved cinema/non-cinema framing independently
    const vt = (t && t.vizTransform) || {};
    const vct = (t && t.vizCinemaTransform) || {};
    setVarPx('--viz-dx', vt.dx || 0); setVarPx('--viz-dy', vt.dy || 0); setVarNum('--viz-scale', vt.scale || 1);
    setVarPx('--viz-cinema-dx', vct.dx != null ? vct.dx : (vt.dx || 0));
    setVarPx('--viz-cinema-dy', vct.dy != null ? vct.dy : (vt.dy || 0));
    setVarNum('--viz-cinema-scale', vct.scale != null ? vct.scale : (vt.scale || 1));
    const _vz = document.getElementById('vizZoom'); if (_vz) _vz.value = String(vt.scale || 1);
    const _vzv = document.getElementById('vizZoomVal'); if (_vzv) _vzv.textContent = (vt.scale || 1).toFixed(2) + '×';

    // per-track video support: if this track has a video, show it; else cover
    // artwork backdrop starts fresh each track (its own --art-* layer; not persisted)
    setVarPx('--art-dx', 0);
    setVarPx('--art-dy', 0);
    setVarPx('--cinema-art-dx', ((t && t.cinemaArtTransform && t.cinemaArtTransform.artDx) || 0));
    setVarPx('--cinema-art-dy', ((t && t.cinemaArtTransform && t.cinemaArtTransform.artDy) || 0));
    setVarNum('--cinema-art-scale', ((t && t.cinemaArtTransform && t.cinemaArtTransform.artScale) || 1));
    if (t.video){
      el.coverVideo.src = proxiedMediaUrl(t.video);
      el.coverVideo.load();
      el.coverVideo.style.display = 'block';
      el.cover.style.display = 'block';
      el.player.classList.add('video-active');
      // the track has its own audio (MP3) -> MP3 is the sound, video is a
      // SILENT visual (prevents the MP3 + video audio clash)
      el.coverVideo.muted = !!t.audio;
      // artwork FILLS the circle by default (zoom out to see the full image). The
      // cover <img> may still be loading -> the global 'load' listener + the timeout
      // below also apply the fill once its natural size is known.
      if (el.cover.complete && el.cover.naturalWidth) maybeAutoFillArt();
      setTimeout(() => { if (demoPlaylist[state.currentIndex] === t && t.video) maybeAutoFillArt(); }, 800);
      // VIDEO fills the circle by default too. The earlier loadTrack pass can't
      // compute it there (the video isn't set up yet at that point), so fill here
      // from the VIDEO's own dimensions once metadata lands. Gated by
      // isIdentityTransform so a saved reposition still wins; object-fit stays
      // contain so zooming OUT reveals the full frame.
      const vfill = () => {
        if (demoPlaylist[state.currentIndex] !== t) return;
        const s = computeCoverFillScale();
        if (s){ setVarNum(coverVar('scale'), s); if (el.coverZoom) el.coverZoom.value = String(s); if (el.coverZoomVal) el.coverZoomVal.textContent = s.toFixed(2) + '×'; }
      };
      if (el.coverVideo.readyState >= 1) vfill();
      else el.coverVideo.addEventListener('loadedmetadata', vfill, { once: true });
      setTimeout(vfill, 800);
    } else {
      el.coverVideo.pause();
      el.coverVideo.removeAttribute('src');
      el.coverVideo.load();
      el.coverVideo.style.display = 'none';
      el.cover.style.display = 'block';
      el.player.classList.remove('video-active');
      setVarNum('--art-scale', 1);   // no backdrop layer on audio-only tracks
      const _az = document.getElementById('artZoom'); if (_az) _az.value = '1';
      const _azv = document.getElementById('artZoomVal'); if (_azv) _azv.textContent = '1.00×';
    }

    // per-track playlist-panel backdrop (mirror or independent media)
    applyPlBackdrop(t);
    // per-track visualiser: each track carries its own mode/settings/on-off
    applyTrackViz(t);
    updateEditingTrackBadge();
    updateMediaSession();

    savePlaylist();
    saveTheme();
  }

  // ===== Per-track theme helpers =====
  // When a track has no saved custom theme, derive a default palette from
  // its cover art (average hue family -> accent colors). Once the user
  // customizes and hits "Save as track theme", the saved theme wins.
  // ---- HSL helpers (used by the artwork colour derivation) ----
  function rgbToHsl(r, g, b){
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return [h / 6, s, l];
  }
  function hslToRgb(h, s, l){
    let r, g, b;
    if (s === 0){ r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const hue = t => { t = ((t % 1) + 1) % 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
      r = hue(h + 1/3); g = hue(h); b = hue(h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  const hslHex = (h, s, l) => '#' + hslToRgb(h, s, l).map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');

  // ---- Artwork palette extraction (v92) ----
  // Uses ColorThief (vendored, MIT — the standard "dominant colour" library)
  // to extract the artwork's VIBRANT primary colour plus a SECOND distinct-hue
  // colour, then maps them onto the DEFAULT scheme's lightness ladder, so:
  //   • the panel stays the default's dark grey VALUE (just tinted with the
  //     artwork hue — no more brown mud from averaging the whole image),
  //   • the play button stays vivid like the default red (#f5696c value),
  //   • the progress/playlist gradient uses BOTH artwork hues (primary +
  //     secondary) for an exciting two-colour scheme that references the art.
  // ---- Artwork colour derivation (v94) — SEMANTIC SWATCHES ----
  // Research-driven: ColorThief's semantic swatches (the Material/Spotify
  // style system — Vibrant/Muted/DarkVibrant/DarkMuted/LightVibrant/
  // LightMuted) are mapped to UI ROLES, then a CONTRAST GUARANTEE lifts the
  // play button so it can never blend into the panel, and the controls
  // ring/timestamp surface is picked distinctly from the panel.
  //   panel    <- DarkMuted   (the art's dark neutral — tasteful backdrop)
  //   yoke/    <- DarkVibrant (darker-but-saturated — visibly separate surface)
  //   timeBg
  //   button   <- Vibrant     (the art's saturated mid tone), contrast-lifted
  //   prog2    <- LightVibrant / LightMuted
  //   prog3    <- Muted / hue-distant third
  //   progTrack<- near-black tint of the panel hue
  function extractArtworkSwatches(img){
    try {
      if (window.ColorThief && typeof window.ColorThief.getSwatchesSync === 'function'){
        const sw = window.ColorThief.getSwatchesSync(img);
        if (sw && typeof sw === 'object'){
          const pick = role => {
            const o = sw[role];
            if (o && o.color && o.color._r !== undefined) return [o.color._r, o.color._g, o.color._b];
            return null;
          };
          return {
            vibrant: pick('Vibrant'), darkVibrant: pick('DarkVibrant'),
            darkMuted: pick('DarkMuted'), lightVibrant: pick('LightVibrant'),
            lightMuted: pick('LightMuted'), muted: pick('Muted')
          };
        }
      }
    } catch {}
    return null;
  }
  function extractArtworkPalette(img){
    // palette-based fallback (same roles) when swatches are unavailable
    try {
      if (window.ColorThief && typeof window.ColorThief.getPaletteSync === 'function'){
        const pal = (window.ColorThief.getPaletteSync(img, 8) || []).map(c => {
          const s = String(c);
          const m = s.match(/^#([0-9a-f]{6})$/i);
          return m ? [parseInt(m[1].slice(0,2),16), parseInt(m[1].slice(2,4),16), parseInt(m[1].slice(4,6),16)] : null;
        }).filter(Boolean);
        if (pal.length >= 1) return pal;
      }
    } catch {}
    try {
      const c = document.createElement('canvas');
      const s = Math.min(img.naturalWidth, 80);
      c.width = s; c.height = s;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, s, s);
      const d = ctx.getImageData(0, 0, s, s).data;
      const bucket = {};
      for (let i = 0; i < d.length; i += 12){
        const r = d[i], g = d[i+1], b = d[i+2];
        const key = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4);
        bucket[key] = (bucket[key] || 0) + 1;
      }
      const entries = Object.entries(bucket).sort((a, b) => b[1] - a[1]).slice(0, 8)
        .map(([k]) => k.split(',').map(v => (parseInt(v) << 4) + 8));
      if (entries.length >= 1) return entries;
    } catch {}
    return null;
  }
  function colorVibrancy(rgb){
    const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    if (l < 0.08 || l > 0.92) return 0;
    return s * (1 - Math.abs(l - 0.5) * 1.3);
  }
  function hueDistance(h1, h2){
    const d = Math.abs(h1 - h2);
    return Math.min(d, 1 - d);
  }
  const lumOf = rgb => (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  // Lighten/darken a colour (HSL lightness walk) — used by the contrast guarantee
  function shiftLightness(rgb, dl){
    const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    return hslToRgb(h, s, Math.min(0.97, Math.max(0.03, l + dl)));
  }

  // The 6 semantic-swatch palettes: each "stars" one ColorThief role for
  // the play button, and the other roles fill the supporting surfaces.
  // 'auto' = the researched default (vibrant button).
  // ---- Interior-design palette engine (v99) ----
  // RESEARCH: paint/design tools (Sherwin-Williams ColorSnap, PantoneTools,
  // paintcolorhq) build palettes with hue-wheel HARMONIES — analogous (±30°),
  // complementary (180°), split-complementary (180°±30°), triadic (120°),
  // monochromatic — plus the 60-30-10 RULE: 60% dominant (walls), 30%
  // secondary (furniture/trim), 10% accent (artwork).
  //
  // The player is a room; the artwork is the one hero piece on the wall:
  //   • wave panel   = the WALLS       (60% — dominant, tinted+neutralised)
  //   • control ring = the TRIM/FURN   (30% — a harmony partner, distinct)
  //   • play button  = the HERO ACCENT (10% — the art's star colour, full)
  //   • progress     = decor accents   (harmony partners at decor lightness)
  // Each of the 6 palettes is a distinct ROOM STYLE with its own harmony +
  // recipe for wall/trim/accents, so every element changes between palettes.
  const HUE = {
    norm: h => ((h % 1) + 1) % 1,
    analogous: h => [HUE.norm(h - 0.08), h, HUE.norm(h + 0.08)],
    complementary: h => [h, HUE.norm(h + 0.5)],
    split: h => [h, HUE.norm(h + 0.42), HUE.norm(h + 0.58)],
    triadic: h => [h, HUE.norm(h + 1 / 3), HUE.norm(h + 2 / 3)],
    mono: h => [h, h, h]
  };
  const PALETTE_STYLES = {
    //            harmony        wall                trim                accent2             accent3             btn swatch
    auto:         { harmony: 'complementary', wall: { i: 0, s: 0.22, l: 0.13 }, trim: { i: 1, s: 0.30, l: 0.20 }, a2: { i: 1, s: 0.55, l: 0.70 }, a3: { i: 0, s: 0.40, l: 0.42 }, btn: 'vibrant' },
    vibrant:      { harmony: 'complementary', wall: { i: 0, s: 0.22, l: 0.13 }, trim: { i: 1, s: 0.30, l: 0.20 }, a2: { i: 1, s: 0.55, l: 0.70 }, a3: { i: 0, s: 0.40, l: 0.42 }, btn: 'vibrant' },
    muted:        { harmony: 'analogous',     wall: { i: 0, s: 0.10, l: 0.22 }, trim: { i: 2, s: 0.14, l: 0.30 }, a2: { i: 2, s: 0.20, l: 0.72 }, a3: { i: 0, s: 0.15, l: 0.45 }, btn: 'muted' },
    darkvibrant:  { harmony: 'mono',          wall: { i: 0, s: 0.50, l: 0.10 }, trim: { i: 1, s: 0.35, l: 0.22 }, a2: { i: 0, s: 0.65, l: 0.62 }, a3: { i: 1, s: 0.40, l: 0.40 }, btn: 'darkVibrant' },
    darkmuted:    { harmony: 'mono',          wall: { i: 0, s: 0.07, l: 0.13 }, trim: { i: 1, s: 0.10, l: 0.24 }, a2: { i: 0, s: 0.18, l: 0.68 }, a3: { i: 1, s: 0.10, l: 0.42 }, btn: 'darkMuted' },
    lightvibrant: { harmony: 'split',         wall: { i: 0, s: 0.12, l: 0.48 }, trim: { i: 1, s: 0.25, l: 0.38 }, a2: { i: 1, s: 0.60, l: 0.70 }, a3: { i: 0, s: 0.40, l: 0.35 }, btn: 'lightVibrant' },
    lightmuted:   { harmony: 'analogous',     wall: { i: 0, s: 0.08, l: 0.55 }, trim: { i: 2, s: 0.12, l: 0.42 }, a2: { i: 2, s: 0.15, l: 0.80 }, a3: { i: 0, s: 0.12, l: 0.60 }, btn: 'lightMuted' }
  };

  function deriveThemeFromCover(t, role){
    role = role || 'auto';
    const fallback = { panel:'#252c36', prog1:'#ff2992', prog2:'#ffb84d', prog3:'#29d5ff',
      progTrack:'#1a1622', btnPlayBg:'#f5696c', btnPlayFg:'#ffffff', yoke:'#201f22',
      ffrew:'#bdbcbd', timeBg:'#201f22', timeFg:'#ffffff', topIcons:'#ffffff',
      title:'#ffffff', artist:'#cfd6e0', knobIn:'#ffffff', knobOut:'#3a304d',
      plBase:'#121724', plGrad:'#29d5ff', plProg1:'#ff2992', plProg2:'#ffb84d', plProg3:'#29d5ff' };
    if (!t || !t.cover) return Promise.resolve(fallback);
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const sw = extractArtworkSwatches(img);
          const palette = sw ? null : extractArtworkPalette(img);
          if (!sw && !palette){ resolve(fallback); return; }
          let panel, yoke, btn, prog2, prog3;
          const style = PALETTE_STYLES[role] || PALETTE_STYLES.auto;
          if (sw){
            // KEY colour = the palette's star swatch (the artwork colour the
            // client wants featured). Fall back gracefully when a swatch is
            // missing (solid covers have no dark roles).
            const key = sw[style.btn] || sw.vibrant || sw.lightVibrant || sw.muted || sw.darkVibrant || sw.darkMuted || sw.lightMuted;
            const [kh] = rgbToHsl(key[0], key[1], key[2]);
            const hues = HUE[style.harmony](kh);
            const mk = spec => {
              const h = hues[spec.i % hues.length];
              return hslToRgb(h, spec.s, spec.l);
            };
            btn = key;
            panel = mk(style.wall);
            yoke  = mk(style.trim);
            prog2 = mk(style.a2);
            prog3 = mk(style.a3);
          } else {
            const scored = palette.map(c => ({ c, s: colorVibrancy(c) })).sort((a, b) => b.s - a.s);
            const primary = scored[0] && scored[0].s > 0.05 ? scored[0].c : palette[0];
            btn = primary;
            const [kh] = rgbToHsl(btn[0], btn[1], btn[2]);
            const hues = HUE[style.harmony](kh);
            const mk = spec => hslToRgb(hues[spec.i % hues.length], spec.s, spec.l);
            panel = mk(style.wall);
            yoke  = mk(style.trim);
            prog2 = mk(style.a2);
            prog3 = mk(style.a3);
          }
          if (!btn || !panel){ resolve(fallback); return; }
          // ALL palette sources (semantic roles, random schemes) finish
          // through the shared contrast-guarantee pass — the play button bg,
          // controls ring and timestamp chip can never blend into the panel.
          resolve(finalizePalette(panel, yoke, btn, prog2, prog3, fallback));
        } catch { resolve(fallback); }
      };
      img.onerror = () => resolve(fallback);
      img.src = t.cover;
    });
  }

  // Shared finishing pass for EVERY palette source: enforces the CONTRAST
  // GUARANTEES (button bg >=55 luminance from the wall, ring + timestamp
  // >=10 from the wall and >=15 from the button, decor accents >=15 from the
  // wall) and maps the four key colours onto the full theme + text colours.
  function finalizePalette(panel, yoke, btn, prog2, prog3, fallback){
    // CONTRAST GUARANTEE (both directions): the hero accent pops off
    // the wall. Dark wall -> lift the button lighter; light wall
    // (Light palettes) -> push it darker. Same technique, mirrored.
    let panelLum = lumOf(panel);
    let btnLum = lumOf(btn);
    const wallDark = panelLum < 110;
    let guard = 0;
    while (Math.abs(btnLum - panelLum) < 55 && guard < 10){
      btn = shiftLightness(btn, wallDark ? 0.07 : -0.07);
      btnLum = lumOf(btn);
      guard++;
    }
    // Trim (control ring + timestamp) must be visibly distinct from the
    // wall — walk it away until it clears by >=10 luminance.
    let yokeLum = lumOf(yoke);
    guard = 0;
    while (Math.abs(yokeLum - panelLum) < 10 && guard < 8){
      yoke = shiftLightness(yoke, yokeLum >= panelLum ? 0.10 : -0.10);
      yokeLum = lumOf(yoke);
      guard++;
    }
    // ... and distinct from the BUTTON too (v100 random schemes): keep the
    // trim >=15 luminance from the hero accent so both surfaces read.
    guard = 0;
    while (Math.abs(yokeLum - btnLum) < 15 && guard < 6){
      yoke = shiftLightness(yoke, yokeLum >= btnLum ? 0.08 : -0.08);
      yokeLum = lumOf(yoke);
      guard++;
    }
    // Decor accents (progress mids) clear the wall by >=15 as well, so
    // progress stays visible even on light walls.
    const pushAway = (c, refLum, wantLum) => {
      let l = lumOf(c); let g = 0;
      while (Math.abs(l - refLum) < wantLum && g < 8){
        c = shiftLightness(c, l >= refLum ? 0.08 : -0.08);
        l = lumOf(c); g++;
      }
      return c;
    };
    prog2 = pushAway(prog2, panelLum, 15);
    prog3 = pushAway(prog3, panelLum, 15);
    // progress track: near-black tint of the wall hue
    const [ph2, ps2] = rgbToHsl(panel[0], panel[1], panel[2]);
    const progTrack = hslToRgb(ph2, Math.max(0.15, ps2), 0.09);
    // text follows the WALL: white on dark walls, dark on light walls
    const wallLight = panelLum > 120;
    const hex3 = c => '#' + c.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
    const pa = hex3(panel), yo = hex3(yoke), bt = hex3(btn), p2 = hex3(prog2 || btn), p3 = hex3(prog3 || prog2 || btn), pt = hex3(progTrack);
    return Object.assign({}, fallback, {
      panel: pa, btnPlayBg: bt, prog1: bt, prog2: p2, prog3: p3,
      progTrack: pt, yoke: yo, timeBg: yo, controlsBg: yo,
      knobOut: yo,
      plBase: pa, plGrad: bt, plProg1: bt, plProg2: p2, plProg3: p3,
      title: wallLight ? '#1a1622' : '#ffffff',
      artist: wallLight ? '#333' : '#cfd6e0',
      topIcons: wallLight ? '#1a1622' : '#ffffff',
      btnPlayFg: lumOf(btn) > 150 ? '#1a1622' : '#ffffff',
      timeFg: wallLight ? '#1a1622' : '#ffffff',
      ffrew: wallLight ? '#555' : '#d8d8d8',
      knobIn: wallLight ? '#1a1622' : '#ffffff'
    });
  }

  // ---- v100: RANDOM schemes + live palette previews ----
  // The Random button alternates modes on every click:
  //   odd clicks  -> 'art'  : a FRESH scheme grown from the artwork (random
  //                           harmony + recipe inside tasteful bounds, and
  //                           re-rolled until it matches NONE of the 7
  //                           dropdown looks)
  //   even clicks -> 'free' : a tasteful scheme that IGNORES the artwork
  //                           (random base hue, same interior-design rules)
  // BOTH finish through finalizePalette(), so the play-button bg, controls
  // ring and timestamp chip always stay visible against the wave panel.
  const RANDOM_HARMONIES = ['analogous', 'complementary', 'split', 'triadic', 'mono'];
  const randBetween = (a, b) => a + Math.random() * (b - a);
  const randPick = arr => arr[Math.floor(Math.random() * arr.length)];
  const RANDOM_ROLES = ['vibrant', 'lightVibrant', 'muted', 'darkVibrant', 'darkMuted', 'lightMuted'];

  function randomPaletteFromArt(t, free){
    const fallback = defaultFallbackTheme();
    const build = (anchorHue, btnColor) => {
      const harmony = randPick(RANDOM_HARMONIES);
      const hues = HUE[harmony](anchorHue);
      const wallDark = free ? Math.random() < 0.5 : Math.random() < 0.65;
      const wallS = wallDark ? randBetween(0.10, 0.34) : randBetween(0.05, 0.20);
      const wallL = wallDark ? randBetween(0.10, 0.26) : randBetween(0.44, 0.58);
      let panel = hslToRgb(hues[0], wallS, wallL);
      let yoke = hslToRgb(hues[1 % hues.length], randBetween(0.10, 0.30), wallDark ? randBetween(0.20, 0.34) : randBetween(0.30, 0.46));
      let btn = btnColor || hslToRgb(hues[2 % hues.length], randBetween(0.35, 0.72), randBetween(0.42, 0.66));
      let prog2 = hslToRgb(hues[1 % hues.length], randBetween(0.25, 0.55), randBetween(0.55, 0.78));
      let prog3 = hslToRgb(hues[(hues.length - 1) % hues.length], randBetween(0.20, 0.45), randBetween(0.35, 0.60));
      return finalizePalette(panel, yoke, btn, prog2, prog3, fallback);
    };
    // no artwork at all -> nothing to reference, so behave like 'free'
    if (!t || !t.cover || free) return Promise.resolve(build(Math.random(), null));
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const sw = extractArtworkSwatches(img);
          const pal = sw ? null : extractArtworkPalette(img);
          if (!sw && !pal){ resolve(build(Math.random(), null)); return; }
          const available = sw ? RANDOM_ROLES.filter(r => sw[r]) : null;
          const key = sw && available.length ? randPick(available) : null;
          const star = key ? sw[key] : (pal ? pal[0] : null);
          if (!star){ resolve(build(Math.random(), null)); return; }
          const [kh] = rgbToHsl(star[0], star[1], star[2]);
          resolve(build(kh + randBetween(-0.035, 0.035), star));
        } catch { resolve(build(Math.random(), null)); }
      };
      img.onerror = () => resolve(build(Math.random(), null));
      img.src = t.cover;
    });
  }

  // Live previews of all 7 schemes for the CURRENT cover (editor page).
  // Cached per cover URL so track switches and re-renders stay instant.
  const palettePreviewCache = new Map();
  const PALETTE_ROLES = ['auto', 'vibrant', 'muted', 'darkvibrant', 'darkmuted', 'lightvibrant', 'lightmuted'];
  const PALETTE_LABELS = { auto: 'Auto', vibrant: 'Vibrant', muted: 'Muted', darkvibrant: 'Dark vibrant', darkmuted: 'Dark muted', lightvibrant: 'Light vibrant', lightmuted: 'Light muted' };
  function ensurePalettePreviews(t){
    if (!t || !t.cover) return Promise.resolve(null);
    const cover = String(t.cover);
    let entry = palettePreviewCache.get(cover);
    if (entry) return Promise.resolve(entry);
    return Promise.all(PALETTE_ROLES.map(role =>
      deriveThemeFromCover({ cover }, role).then(th => [role, th])
    )).then(pairs => {
      entry = Object.fromEntries(pairs);
      if (palettePreviewCache.size > 12) palettePreviewCache.delete(palettePreviewCache.keys().next().value);
      palettePreviewCache.set(cover, entry);
      return entry;
    });
  }

  function renderPalettePreviews(t){
    const wrap = el.paletteSwatches;
    if (!wrap || !isEditorPage()) return;
    if (!t){ wrap.innerHTML = ''; return; }
    const activeRole = (t._paletteRole || 'auto');
    // skeleton tiles while (re)deriving — stable layout, no flash
    if (wrap.dataset.cover !== String(t.cover || '')){
      wrap.innerHTML = PALETTE_ROLES.map(role =>
        '<div class="ps-tile' + (role === activeRole ? ' ps-active' : '') + '" data-role="' + role + '" title="' + (PALETTE_LABELS[role] || role) + '"><div class="ps-chips"><span style="background:#555"></span><span style="background:#777"></span><span style="background:#999"></span></div><div class="ps-label">' + (PALETTE_LABELS[role] || role) + '</div></div>'
      ).join('');
      wrap.dataset.cover = String(t.cover || '');
    }
    ensurePalettePreviews(t).then(previews => {
      if (!previews || !wrap || wrap.dataset.cover !== String(t.cover || '')) return;
      const cur = demoPlaylist[state.currentIndex];
      const active = (cur && cur._paletteRole) || 'auto';
      const inRandomMode = !!(cur && cur._randomClicks);
      Array.from(wrap.querySelectorAll('.ps-tile')).forEach(tile => {
        const role = tile.dataset.role;
        const th = previews[role];
        if (th){
          const chips = tile.querySelector('.ps-chips');
          if (chips) chips.innerHTML = ['panel', 'yoke', 'btnPlayBg'].map(k => '<span style="background:' + th[k] + '"></span>').join('');
        }
        tile.classList.toggle('ps-active', !inRandomMode && role === active);
      });
    });
  }

  // v101: recover the metadata artwork on demand for tracks that predate
  // v100 (dropped before _metaCover capture existed) or that were rebuilt
  // from the server theme (fresh browser — _metaCover is localStorage-only).
  // The audio file is the durable source: ID3 tags live at the START of an
  // mp3, so a ~1MB range fetch is enough to read the embedded art. Runs
  // lazily when the track is opened/loaded; guarded against re-fetching.
  const metaCoverRecovery = new WeakSet();
  function ensureMetaCover(t){
    if (!t || t._metaCover || metaCoverRecovery.has(t)) return Promise.resolve(t ? t._metaCover : null);
    metaCoverRecovery.add(t);
    const a = String(t.audio || '');
    if (!/\.mp3($|\?)/i.test(a) || /^blob:/i.test(a) || /^data:/i.test(a)) return Promise.resolve(null);
    return fetchWithTimeout(a, { headers: { Range: 'bytes=0-' + (1024 * 1024 - 1) } }, 25000)
      .then(res => {
        // transient failure (network/timeout): let a later open retry
        if (!res || !res.ok){ metaCoverRecovery.delete(t); return null; }
        return res.blob();
      })
      .then(blob => blob ? readMp3Meta(new File([blob], t._audioName || 'track.mp3', { type: 'audio/mpeg' })) : null)
      .then(async meta => {
        if (!meta || !meta.cover || demoPlaylist.indexOf(t) === -1) return null;
        const small = await downscaleImageDataURI(meta.cover);
        if (!small) return null;
        t._metaCover = small;
        // only adopt the art automatically when the track has NO cover at
        // all — never replace existing artwork (SVG data-URI covers can be
        // genuine user art, not placeholders); the Restore button is the
        // explicit way back to the metadata artwork
        if (!t.cover){
          t.cover = small;
          t._coverName = null;
          t._serverCover = null;
          if (demoPlaylist[state.currentIndex] === t && el.cover) el.cover.src = small;
        }
        state.playlistDirty = true;
        savePlaylist();
        updatePaletteUI(t);
        return small;
      })
      .catch(() => null);
  }

  function updatePaletteUI(t){
    // random-mode label + restore button availability (editor page)
    const st = el.paletteRandomState;
    if (st){
      const clicks = (t && t._randomClicks) || 0;
      if (clicks > 0){
        st.style.display = 'inline';
        st.textContent = (clicks % 2 === 0)
          ? '↻ Random mode: free of the artwork — click again for an art scheme'
          : '↻ Random mode: from this artwork — click again for a free scheme';
      } else {
        st.style.display = 'none';
      }
    }
    if (el.btnRestoreMetaCover){
      const has = !!(t && t._metaCover);
      el.btnRestoreMetaCover.disabled = !has;
      el.btnRestoreMetaCover.title = has
        ? 'Revert to the artwork embedded in the audio file\'s metadata and its original colour scheme'
        : (t && t.audio ? 'No metadata artwork recorded yet — checking the audio file… (click again once it appears)' : 'This track has no audio file to read artwork from');
    }
    // v101: recover the metadata artwork from the audio file when missing
    if (t) ensureMetaCover(t);
  }

  // Apply one of the 7 artwork-palette roles (dropdown or preview tile).
  function applyPaletteRole(role){
    const t = demoPlaylist[state.currentIndex];
    if (!t) return;
    role = role || 'auto';
    t._paletteRole = role === 'auto' ? null : role;
    t._randomClicks = 0;          // explicit role pick leaves random mode
    t._handTuned = false;         // and returns to art-derived looks
    if (t.cover){
      deriveThemeFromCover(t, role).then(theme => {
        if (demoPlaylist[state.currentIndex] !== t) return;
        t._derivedTheme = Object.assign({ _for: t.cover }, theme);
        applyWithTheme(theme);
        // A specific palette COMMITS the scheme to the track (it becomes
        // the saved theme, so it survives reloads and reaches the
        // deployed page). 'Auto' stays a fresh per-load derivation.
        if (role !== 'auto'){
          t.theme = JSON.parse(JSON.stringify(theme));
        } else {
          delete t.theme;
        }
        try { state.playlistDirty = true; savePlaylist(); } catch (e) {}
        renderPalettePreviews(t);
        updatePaletteUI(t);
        setSyncStatus('Palette: ' + (role === 'auto' ? 'Auto — best of all' : (PALETTE_LABELS[role] || role)) + (role === 'auto' ? ' applied (fresh each load)' : ' applied + saved to this track'), true);
      });
    } else {
      try { state.playlistDirty = true; savePlaylist(); } catch (e) {}
      updatePaletteUI(t);
    }
  }

  // Random button: alternate art-based / free schemes, each committed to
  // the track so the look survives reloads and reaches the deployed page.
  function randomizePalette(){
    const t = demoPlaylist[state.currentIndex];
    if (!t) return;
    const nextFree = ((t._randomClicks || 0) % 2) === 1;   // click 1 = art, 2 = free...
    ensurePalettePreviews(t).then(previews => {
      const roll = attemptsLeft => {
        randomPaletteFromArt(t, nextFree).then(theme => {
          // art rolls must match NONE of the 7 dropdown schemes (panel AND
          // button both equal would be "the same look")
          const differs = !previews || PALETTE_ROLES.every(role => {
            const p = previews[role];
            return !p || p.panel !== theme.panel || p.btnPlayBg !== theme.btnPlayBg;
          });
          if (differs || attemptsLeft <= 0){
            t._randomClicks = (t._randomClicks || 0) + 1;
            t._handTuned = false;
            t._paletteRole = null;
            t._derivedTheme = Object.assign({ _for: t.cover }, theme);
            t.theme = JSON.parse(JSON.stringify(theme));
            applyWithTheme(theme);
            try { state.playlistDirty = true; savePlaylist(); } catch (e) {}
            renderPalettePreviews(t);
            updatePaletteUI(t);
            setSyncStatus('🎲 Random (' + (nextFree ? 'free — ignores the artwork' : 'from this artwork') + ') applied + saved to this track — play button & timestamp stay visible', true);
          } else {
            roll(attemptsLeft - 1);
          }
        });
      };
      roll(6);
    });
  }

  // Restore the artwork embedded in the audio file's metadata + its
  // original (auto) colour scheme, at the click of a button.
  function restoreMetaCover(){
    const t = demoPlaylist[state.currentIndex];
    if (!t) return;
    if (!t._metaCover){
      setSyncStatus('This track has no artwork embedded in its audio metadata — nothing to restore', false);
      return;
    }
    // v101: if the current cover IS the metadata artwork, there's nothing to
    // restore — say so instead of silently doing nothing.
    if (t.cover && String(t.cover) === String(t._metaCover)){
      setSyncStatus('This track is already showing its metadata artwork', true);
      return;
    }
    t.cover = t._metaCover;
    t._coverName = null;
    t._serverCover = null;
    t._paletteRole = null;
    t._randomClicks = 0;
    t._handTuned = false;
    if (el.coverVideo) el.coverVideo.style.display = 'none';
    if (el.cover){ el.cover.style.display = 'block'; el.cover.src = t.cover; }
    // the "original" scheme = the auto derivation from the metadata art
    deriveThemeFromCover(t, 'auto').then(theme => {
      if (demoPlaylist[state.currentIndex] !== t) return;
      t.theme = JSON.parse(JSON.stringify(theme));
      t._derivedTheme = Object.assign({ _for: t.cover }, theme);
      applyWithTheme(theme);
      try { state.playlistDirty = true; savePlaylist(); } catch (e) {}
      saveTheme({ server: true });
      renderPalettePreviews(t);
      updatePaletteUI(t);
      populateEditorFromTrack(t);
      setSyncStatus('↺ Restored the metadata artwork + its original colour scheme for ' + (t.title || 'track'), true);
    });
  }

  // v100: a NEW cover re-derives every palette the dropdown/previews offer.
  // Art-derived schemes (auto or a picked role) re-apply + re-commit to the
  // new art immediately; hand-tuned colour edits and 'free' random schemes
  // are left alone (the user deliberately stepped away from the art).
  function handleCoverChanged(t){
    if (!t) return;
    renderPalettePreviews(t);
    updatePaletteUI(t);
    const clicks = t._randomClicks || 0;
    if (t._handTuned || (clicks > 0 && clicks % 2 === 0)){
      setSyncStatus('New cover saved — palette previews updated; your custom/free scheme was kept', true);
      return;
    }
    deriveThemeFromCover(t, t._paletteRole || 'auto').then(theme => {
      if (demoPlaylist[state.currentIndex] !== t) return;
      t._derivedTheme = Object.assign({ _for: t.cover }, theme);
      t.theme = JSON.parse(JSON.stringify(theme));
      applyWithTheme(theme);
      try { state.playlistDirty = true; savePlaylist(); } catch (e) {}
      renderPalettePreviews(t);
      setSyncStatus('New cover: colour scheme re-derived from the artwork ✓', true);
    });
  }

  // v94 SELF-HEAL: saved themes generated by the OLD derivation (v92/v93)
  // had yoke/timeBg equal to the panel -> invisible play-button/timestamp
  // surfaces. If a saved theme shows that signature, drop it so the v94
  // semantic-swatch derivation (which guarantees distinct surfaces) runs.
  function healStaleThemes(){
    let changed = 0;
    demoPlaylist.forEach(t => {
      const th = t && t.theme;
      if (!th || typeof th !== 'object') return;
      const same = (a, b) => !!a && !!b && String(a).toLowerCase() === String(b).toLowerCase();
      // v93 signature: invisible yoke+timestamp BUT a distinct button
      // (prog1 !== panel). Themes where EVERYTHING equals the panel are
      // legitimate minimal themes (the suite's) — leave those alone.
      if (same(th.yoke, th.panel) && same(th.timeBg, th.panel) && !same(th.prog1, th.panel)){
        t.theme = null;
        changed++;
      }
    });
    if (changed){ renderPlaylist(); renderPlaylistManager(); savePlaylist(); }
  }

  function defaultFallbackTheme(){
    return { panel:'#252c36', prog1:'#ff2992', prog2:'#ffb84d', prog3:'#29d5ff',
      progTrack:'#1a1622', btnPlayBg:'#f5696c', btnPlayFg:'#ffffff', yoke:'#201f22',
      ffrew:'#bdbcbd', timeBg:'#201f22', timeFg:'#ffffff', topIcons:'#ffffff',
      title:'#ffffff', artist:'#cfd6e0', knobIn:'#ffffff', knobOut:'#3a304d',
      plBase:'#121724', plGrad:'#29d5ff', plProg1:'#ff2992', plProg2:'#ffb84d', plProg3:'#29d5ff' };
  }

  function effectiveTheme(t){
    // 1) master/overall theme (if toggled on) overrides the COLOUR scheme;
    //    media (audio/cover/video) still comes from the track below.
    if (state.masterOn && state.masterTheme && Object.keys(state.masterTheme).length) return state.masterTheme;
    // 2) saved custom track theme wins; otherwise derive from cover
    return t && t.theme && Object.keys(t.theme).length ? t.theme : null;
  }

  // ---- overall player theme (toggle): overrides COLOURS only; media
  //      (audio/cover/video) still changes per track ----
  function setMasterOn(on){
    state.masterOn = !!on;
    gs.masterOn = state.masterOn;
    gsSave();
    try { localStorage.setItem(STORAGE_KEY + '.masterOn', state.masterOn ? '1' : '0'); } catch {}
    // re-apply the current track's theme (effectiveTheme now honours the toggle)
    loadTrack(state.currentIndex, false);
    const sw = document.getElementById('masterThemeToggle');
    if (sw) sw.checked = state.masterOn;
    setSyncStatus(state.masterOn ? 'Overall theme ON — overrides track colours (media still per-track)' : 'Overall theme OFF — track themes active', true);
  }
  function saveMasterTheme(){
    const theme = {
      panel: el.colorPanel?.value || '#252c36',
      prog1: el.colorProg1?.value || '#ff2992', prog2: el.colorProg2?.value || '#ffb84d', prog3: el.colorProg3?.value || '#29d5ff',
      progTrack: el.colorProgTrack?.value || '#1a1622',
      btnPlayBg: el.colorPlayBtn?.value || '#f5696c', btnPlayFg: el.colorPlayGlyph?.value || '#ffffff',
      yoke: el.colorYoke?.value || '#201f22', ffrew: el.colorFFREW?.value || '#bdbcbd',
      timeBg: el.colorTimeBg?.value || '#201f22', timeFg: el.colorTimeFg?.value || '#ffffff',
      topIcons: el.colorTopIcons?.value || '#ffffff',
      title: el.colorTitleText?.value || '#ffffff', artist: el.colorArtistText?.value || '#cfd6e0',
      knobIn: el.colorKnobInner?.value || '#ffffff', knobOut: el.colorKnobOuter?.value || '#3a304d',
      plBase: el.colorPlBase?.value || '#121724', plGrad: el.colorPlGrad?.value || '#29d5ff',
      plProg1: el.colorPlProg1?.value || '#ff2992', plProg2: el.colorPlProg2?.value || '#ffb84d', plProg3: el.colorPlProg3?.value || '#29d5ff'
    };
    state.masterTheme = theme;
    snapshotGlobalVars();   // explicit overall save -> this IS the global look
    try { localStorage.setItem(STORAGE_KEY + '.master', JSON.stringify(theme)); } catch {}
    saveTheme({server:true});
    // apply immediately if the toggle is on
    if (state.masterOn) applyWithTheme(theme);
    setSyncStatus('Overall theme saved — ' + (state.masterOn ? 'ON (overriding track colours)' : 'toggle ON to apply'), true);
  }

    function crossfadeTheme(fromVars, toVars, durMs, done){
    // INSTANT theme change (no animation). All colours switch at once.
    // A proper fade between tracks can be layered on later — this keeps the
    // signature so callers don't change.
    Object.keys(toVars).forEach(n => {
      if (!toVars[n]) return;
      if (n.startsWith('--pl-')) setRootVar(n, toVars[n]);
      else el.player.style.setProperty(n, toVars[n]);
    });
    if (state._themeRaf){ cancelAnimationFrame(state._themeRaf); state._themeRaf = null; }
    updateOverlayStyle();
    done && done();
  }

  function themeToVars(theme){
    return {
      '--panel-fill': theme.panel, '--progress-start': theme.prog1, '--progress-mid': theme.prog2,
      '--progress-end': theme.prog3, '--progress-track': theme.progTrack,
      '--btn-play-bg': theme.btnPlayBg, '--btn-play-fg': theme.btnPlayFg,
      '--controls-bg': theme.yoke, '--ff-rew-color': theme.ffrew,
      '--timestamp-bg': theme.timeBg, '--timestamp-fg': theme.timeFg,
      '--top-icons-color': theme.topIcons, '--title-text-color': theme.title,
      '--artist-text-color': theme.artist, '--knob-inner': theme.knobIn, '--knob-outer': theme.knobOut,
      '--pl-base': theme.plBase, '--pl-grad': theme.plGrad,
      '--pl-prog1': theme.plProg1, '--pl-prog2': theme.plProg2, '--pl-prog3': theme.plProg3
    };
  }
  function currentThemeVars(){
    const css = getComputedStyle(el.player);
    const root = getComputedStyle(document.documentElement);
    const g = n => (css.getPropertyValue(n) || '').trim();
    const r = n => (root.getPropertyValue(n) || '').trim();
    return {
      '--panel-fill': g('--panel-fill') || '#252c36', '--panel-blend': g('--panel-blend') || '0',
      '--progress-start': g('--progress-start') || '#ff2992',
      '--progress-mid': g('--progress-mid') || '#ffb84d', '--progress-end': g('--progress-end') || '#29d5ff',
      '--progress-track': g('--progress-track') || '#1a1622',
      '--btn-play-bg': g('--btn-play-bg') || '#f5696c', '--btn-play-fg': g('--btn-play-fg') || '#ffffff',
      '--controls-bg': g('--controls-bg') || '#201f22', '--ff-rew-color': g('--ff-rew-color') || '#bdbcbd',
      '--timestamp-bg': g('--timestamp-bg') || '#201f22', '--timestamp-fg': g('--timestamp-fg') || '#ffffff',
      '--top-icons-color': g('--top-icons-color') || '#ffffff', '--title-text-color': g('--title-text-color') || '#ffffff',
      '--artist-text-color': g('--artist-text-color') || '#cfd6e0', '--knob-inner': g('--knob-inner') || '#ffffff',
      '--knob-outer': g('--knob-outer') || '#3a304d',
      '--pl-base': r('--pl-base') || '#121724', '--pl-grad': r('--pl-grad') || '#29d5ff',
      '--pl-prog1': r('--pl-prog1') || '#ff2992', '--pl-prog2': r('--pl-prog2') || '#ffb84d',
      '--pl-prog3': r('--pl-prog3') || '#29d5ff'
    };
  }

  // Snapshot the current computed look as the OVERALL look. Called at boot
  // (CSS defaults), when the server/global vars are applied, and when the
  // user explicitly saves the overall theme. NEVER called when a per-track
  // (artwork-derived) theme is applied to the live player.
  function snapshotGlobalVars(){
    state.globalVars = currentThemeVars();
  }

  // Save the CURRENT editor look (colours + cover + video) as this track's
  // official custom theme.
  function saveCurrentAsTrackTheme(){
    const t = demoPlaylist[state.currentIndex];
    if (!t) return;
    const theme = {
      panel: el.colorPanel?.value || '#252c36',
      prog1: el.colorProg1?.value || '#ff2992', prog2: el.colorProg2?.value || '#ffb84d', prog3: el.colorProg3?.value || '#29d5ff',
      progTrack: el.colorProgTrack?.value || '#1a1622',
      btnPlayBg: el.colorPlayBtn?.value || '#f5696c', btnPlayFg: el.colorPlayGlyph?.value || '#ffffff',
      yoke: el.colorYoke?.value || '#201f22', ffrew: el.colorFFREW?.value || '#bdbcbd',
      timeBg: el.colorTimeBg?.value || '#201f22', timeFg: el.colorTimeFg?.value || '#ffffff',
      topIcons: el.colorTopIcons?.value || '#ffffff',
      title: el.colorTitleText?.value || '#ffffff', artist: el.colorArtistText?.value || '#cfd6e0',
      knobIn: el.colorKnobInner?.value || '#ffffff', knobOut: el.colorKnobOuter?.value || '#3a304d',
      plBase: el.colorPlBase?.value || '#121724', plGrad: el.colorPlGrad?.value || '#29d5ff',
      plProg1: el.colorPlProg1?.value || '#ff2992', plProg2: el.colorPlProg2?.value || '#ffb84d', plProg3: el.colorPlProg3?.value || '#29d5ff'
    };
    // Cover/video: only adopt the currently-displayed artwork if it is
    // DIFFERENT from this track's saved media (i.e. the user changed it).
    // This prevents saving track B from clobbering track A's saved cover.
    const abs = u => { try { return new URL(u, location.href).href; } catch { return u; } };
    const shownCover = el.cover.src ? abs(el.cover.src) : null;
    const shownVideo = (el.coverVideo.src && el.coverVideo.style.display !== 'none') ? abs(el.coverVideo.src) : null;
    const savedCover = t.cover ? abs(t.cover) : null;
    const savedVideo = t.video ? abs(t.video) : null;
    if (shownCover && shownCover !== savedCover) t.cover = shownCover;
    if (shownVideo && shownVideo !== savedVideo) t.video = shownVideo;
    t.theme = theme;
    t._handTuned = true;   // v100: explicit user colour edits — cover swaps keep this scheme
    // v103: capture THIS track's wave-panel image / blend / grey / tint mode
    const shownPanel = el.player.style.getPropertyValue('--panel-image') || '';
    const m = shownPanel.match(/url\("?([^")]+)"?\)/);
    t.panelImage = (m && m[1]) ? m[1] : (t.panelImage || null);
    if (String(t.panelImage || '').startsWith('blob:')) t.panelImage = null;   // upload handled below
    t.panelBlend = Math.max(0, Math.min(100, Math.round(+el.player.style.getPropertyValue('--panel-blend') || 0)));
    t.panelGrey = !!(el.panelGrey && el.panelGrey.checked);
    t.panelBlendMode = (el.panelBlendMode && el.panelBlendMode.value) || 'normal';
    // capture the current cover/panel transforms for this track
    t.transform = {
      coverDx: getVarNum('--cover-dx'), coverDy: getVarNum('--cover-dy'), coverScale: getVarNum('--cover-scale', 1),
      panelDx: getVarNum('--panel-dx'), panelDy: getVarNum('--panel-dy'), panelScale: getVarNum('--panel-scale', 1)
    };
    // capture cinema + non-cinema video framing INDEPENDENTLY so saving
    // while in cinema never overwrites the non-cinema framing (otherwise the
    // video look reverts on reload).
    t.cinemaTransform = {
      coverDx: getVarNum('--cinema-dx'), coverDy: getVarNum('--cinema-dy'), coverScale: getVarNum('--cinema-scale', 1)
    };
    t.cinemaArtTransform = {
      artDx: getVarNum('--cinema-art-dx'), artDy: getVarNum('--cinema-art-dy'), artScale: getVarNum('--cinema-art-scale', 1)
    };
    state.playlistDirty = true;
    savePlaylist();
    saveTheme({server:true});
    setSyncStatus('Saved as ' + (t.title || 'track') + ' official theme ✓', true);
    renderPlaylist();
    // Upload blob media (audio/cover/video) to the server so the track uses
    // a PERSISTENT url — blob urls die on reload and break playback.
    const uploadIfBlob = (key, input) => {
      if (String(t[key]||'').startsWith('blob:')){
        const f = input && input.files && input.files[0];
        if (f) uploadFile(f, key).then(u => {
          if (u){ t[key] = u; savePlaylist(); saveTheme({server:true}); }
        });
      }
    };
    uploadIfBlob('audio', el.fileAudio);
    uploadIfBlob('cover', el.fileCover);
    uploadIfBlob('video', el.fileVideo);
    // v103: persist a freshly-chosen (blob) panel texture for this track
    const pf = el.filePanelImage && el.filePanelImage.files && el.filePanelImage.files[0];
    if (pf && String(t.panelImage || '').startsWith('blob:')){
      uploadFile(pf, 'panel').then(u => {
        if (u && demoPlaylist.indexOf(t) !== -1){
          t.panelImage = u;
          t.panelImageGrey = null;
          state.playlistDirty = true;
          savePlaylist();
          saveTheme({server:true});
          if (t.panelGrey) ensurePanelGrey(t);
        }
      });
    }
  }

  // v102: wave panel image ⇄ colour blend (0 = image fully visible,
  // 100 = pure panel colour, image hidden). Lives per TRACK (v103), so each
  // track keeps its own image/blend/greyscale/tint-mode.
  function setPanelBlend(v){
    v = Math.max(0, Math.min(100, Math.round(+v || 0)));
    el.player.style.setProperty('--panel-blend', String(v));
    if (el.panelBlend) el.panelBlend.value = String(v);
    if (el.panelBlendVal) el.panelBlendVal.textContent = v + '%';
  }
  function syncPanelBlendUI(){
    const v = parseFloat(el.player.style.getPropertyValue('--panel-blend'));
    setPanelBlend(isFinite(v) ? v : 0);
  }
  function applyPanelImageVar(urlOrUnset){
    if (urlOrUnset === 'unset' || !urlOrUnset){
      el.player.style.removeProperty('--panel-image');
    } else {
      el.player.style.setProperty('--panel-image', String(urlOrUnset).indexOf('url(') === 0 ? urlOrUnset : 'url("' + urlOrUnset + '")');
    }
    void el.player.offsetHeight;
  }
  function setPanelBlendMode(m){
    m = m || 'normal';
    el.player.style.setProperty('--panel-blend-mode', m);
    if (el.panelBlendMode) el.panelBlendMode.value = m;
  }

  // ---- v104: the FULL Photoshop blend-mode list ----
  // 16 modes are native CSS background-blend-modes (live, real-time). The
  // remaining 9 (Dissolve, Linear Burn, Linear Dodge/Add, Vivid/Linear/Pin
  // Light, Hard Mix, Subtract, Divide) don't exist in CSS, so the player
  // BAKES them onto the texture with Photoshop's exact per-channel maths,
  // re-rendering whenever the panel colour, blend slider or greyscale
  // changes. [value, label, cssNative]
  const PANEL_BLEND_MODES = [
    ['normal', 'Normal', true], ['darken', 'Darken', true], ['multiply', 'Multiply', true],
    ['color-burn', 'Color Burn', true], ['lighten', 'Lighten', true], ['screen', 'Screen', true],
    ['color-dodge', 'Color Dodge', true], ['overlay', 'Overlay', true], ['soft-light', 'Soft Light', true],
    ['hard-light', 'Hard Light', true], ['difference', 'Difference', true], ['exclusion', 'Exclusion', true],
    ['hue', 'Hue', true], ['saturation', 'Saturation', true], ['color', 'Color', true], ['luminosity', 'Luminosity', true],
    ['dissolve', 'Dissolve', false], ['linear-burn', 'Linear Burn', false], ['linear-dodge', 'Linear Dodge (Add)', false],
    ['vivid-light', 'Vivid Light', false], ['linear-light', 'Linear Light', false], ['pin-light', 'Pin Light', false],
    ['hard-mix', 'Hard Mix', false], ['subtract', 'Subtract', false], ['divide', 'Divide', false]
  ];
  const PANEL_CSS_MODES = new Set(PANEL_BLEND_MODES.filter(m => m[2]).map(m => m[0]));

  // Photoshop blend-mode math on 0..1 channels (b = base/texture pixel,
  // c = blend colour channel, a = blend strength 0..1).
  function psColorBurn(b, c){
    if (c <= 0) return 0;
    return 1 - Math.min(1, (1 - b) / Math.min(c, 1));
  }
  function psColorDodge(b, c){
    if (c >= 1) return 1;
    return Math.min(1, b / Math.max(1 - c, 1e-6));
  }
  function psLinearBurn(b, c){ return Math.max(0, b + c - 1); }
  function psLinearDodge(b, c){ return Math.min(1, b + c); }
  function psBlendChannel(mode, b, c, a, rand){
    let r;
    switch (mode){
      case 'dissolve':      r = rand() < a ? c : b; break;
      case 'linear-burn':   r = psLinearBurn(b, c); break;
      case 'linear-dodge':  r = psLinearDodge(b, c); break;
      case 'vivid-light':   r = c <= 0.5 ? psColorBurn(b, 2 * c) : psColorDodge(b, 2 * c - 1); break;
      case 'linear-light':  r = c <= 0.5 ? psLinearBurn(b, 2 * c) : psLinearDodge(b, 2 * c - 1); break;
      case 'pin-light':     r = c <= 0.5 ? Math.min(b, 2 * c) : Math.max(b, 2 * c - 1); break;
      case 'hard-mix': { const v = c <= 0.5 ? psColorBurn(b, 2 * c) : psColorDodge(b, 2 * c - 1); r = v < 0.5 ? 0 : 1; break; }
      case 'subtract':      r = Math.max(0, b - c); break;
      case 'divide':        r = c === 0 ? (b === 0 ? 0 : 1) : Math.min(1, b / c); break;
      default:              r = b;
    }
    if (mode === 'dissolve') return r;          // already alpha-randomised
    return b * (1 - a) + r * a;                 // Photoshop opacity mix
  }

  const panelBakeCache = new Map();
  function panelBakeKey(t, mode, colour, alpha){
    return mode + '|' + colour + '|' + alpha + '|' + (t.panelGrey ? 'g' : 'c') + '|' + (t.panelImageGrey || t.panelImage || '');
  }
  // Bake a non-CSS blend mode onto the texture (Photoshop-exact result).
  function bakePanelTexture(t){
    const mode = (t && t.panelBlendMode) || 'normal';
    if (PANEL_CSS_MODES.has(mode) || !t || !t.panelImage) return Promise.resolve(null);
    const colour = normHex(el.player.style.getPropertyValue('--panel-fill')) || '#252c36';
    const alpha = (typeof t.panelBlend === 'number') ? Math.max(0, Math.min(100, t.panelBlend)) / 100 : 0;
    const src = (t.panelGrey && t.panelImageGrey) ? t.panelImageGrey : t.panelImage;
    const key = panelBakeKey(t, mode, colour, alpha);
    if (panelBakeCache.has(key)) return Promise.resolve(panelBakeCache.get(key));
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const W = img.naturalWidth, H = img.naturalHeight;
          const scale = Math.min(1, 1024 / Math.max(W, H));
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(W * scale));
          c.height = Math.max(1, Math.round(H * scale));
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, c.width, c.height);
          const data = ctx.getImageData(0, 0, c.width, c.height);
          const px = data.data;
          const cr = parseInt(colour.slice(1, 3), 16) / 255;
          const cg = parseInt(colour.slice(3, 5), 16) / 255;
          const cb = parseInt(colour.slice(5, 7), 16) / 255;
          const rand = Math.random;
          for (let i = 0; i < px.length; i += 4){
            px[i]     = Math.round(psBlendChannel(mode, px[i] / 255, cr, alpha, rand) * 255);
            px[i + 1] = Math.round(psBlendChannel(mode, px[i + 1] / 255, cg, alpha, rand) * 255);
            px[i + 2] = Math.round(psBlendChannel(mode, px[i + 2] / 255, cb, alpha, rand) * 255);
          }
          ctx.putImageData(data, 0, 0);
          const out = c.toDataURL('image/jpeg', 0.85);
          if (panelBakeCache.size > 24) panelBakeCache.delete(panelBakeCache.keys().next().value);
          panelBakeCache.set(key, out);
          resolve(out);
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = String(src);
    });
  }
  // Debounced re-bake for live colour/slider changes (only matters for the
  // canvas-rendered modes).
  function refreshBakedPanelTexture(){
    const t = demoPlaylist[state.currentIndex];
    if (!t) return;
    const mode = t.panelBlendMode || 'normal';
    if (PANEL_CSS_MODES.has(mode) || !t.panelImage) return;
    clearTimeout(state._panelBakeTimer);
    state._panelBakeTimer = setTimeout(() => {
      const cur = demoPlaylist[state.currentIndex];
      if (cur !== t) return;
      bakePanelTexture(t).then(out => {
        if (out && demoPlaylist[state.currentIndex] === t) applyPanelImageVar(out);
      });
    }, 120);
  }
  // Build a greyscale copy of the panel image (canvas desaturation) so the
  // colour overlay is the ONLY hue — texture keeps its luminance detail.
  function makeGreyscaleDataURI(url){
    return new Promise(resolve => {
      if (!url || /^blob:/.test(String(url))) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const scale = Math.min(1, 600 / Math.max(img.naturalWidth, img.naturalHeight));
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.naturalWidth * scale));
          c.height = Math.max(1, Math.round(img.naturalHeight * scale));
          const ctx = c.getContext('2d');
          ctx.filter = 'grayscale(1)';
          ctx.drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', 0.82));
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = String(url);
    });
  }
  function ensurePanelGrey(t){
    if (!t || !t.panelImage || t.panelImageGrey) return Promise.resolve(t && t.panelImageGrey);
    return makeGreyscaleDataURI(t.panelImage).then(g => {
      if (!g) return null;
      t.panelImageGrey = g;
      state.playlistDirty = true;
      try { savePlaylist(); } catch {}
      applyPanelMedia(t);
      return g;
    });
  }
  // Sync the editor controls (checkbox / dropdown / slider / label) to a
  // track's panel settings WITHOUT touching the CSS vars.
  function syncPanelUI(t){
    if (el.panelGrey) el.panelGrey.checked = !!t.panelGrey;
    if (el.panelBlendMode) el.panelBlendMode.value = t.panelBlendMode || 'normal';
    if (el.panelBlend) el.panelBlend.value = String(typeof t.panelBlend === 'number' ? t.panelBlend : 0);
    if (el.panelBlendVal) el.panelBlendVal.textContent = (typeof t.panelBlend === 'number' ? t.panelBlend : 0) + '%';
    const pn = document.getElementById('filePanelImage')?.closest('.file-ui')?.querySelector('.file-name');
    if (pn){
      pn.textContent = t.panelImage
        ? (t._panelImageName || (String(t.panelImage).indexOf('data:') === 0 ? 'uploaded texture' : nameFromURL(t.panelImage) || 'texture'))
        : 'No file chosen';
    }
  }

  // Apply THIS track's wave-panel media (image / grey / blend / tint mode) —
  // the single source of truth for the dash background. Called on every
  // track load + handover so nothing bleeds across tracks.
  function applyPanelMedia(t){
    if (!t) return;
    const mode = t.panelBlendMode || 'normal';
    const src = (t.panelGrey && t.panelImageGrey) ? t.panelImageGrey : t.panelImage;
    if (!PANEL_CSS_MODES.has(mode) && t.panelImage){
      // CANVAS-BAKED mode: the CSS blend is 'normal' and the colour overlay
      // is off; the baked image carries the full effect.
      const colour = normHex(el.player.style.getPropertyValue('--panel-fill')) || '#252c36';
      const alpha = typeof t.panelBlend === 'number' ? t.panelBlend : 0;
      const key = panelBakeKey(t, mode, colour, alpha);
      const cached = panelBakeCache.get(key);
      if (cached){
        applyPanelImageVar(cached);
        el.player.style.setProperty('--panel-blend', '0');
        setPanelBlendMode('normal');
      } else {
        // no cached bake yet — show the source (or grey) image meanwhile
        if (src) applyPanelImageVar(src); else applyPanelImageVar('unset');
        el.player.style.setProperty('--panel-blend', '0');
        setPanelBlendMode('normal');
        bakePanelTexture(t).then(out => {
          if (out && demoPlaylist[state.currentIndex] === t) applyPanelImageVar(out);
        });
      }
      syncPanelUI(t);
      return;
    }
    // CSS blend-mode path (live)
    if (src) applyPanelImageVar(src);
    else applyPanelImageVar('unset');
    setPanelBlend(typeof t.panelBlend === 'number' ? t.panelBlend : 0);
    setPanelBlendMode(mode);
    syncPanelUI(t);
  }

  // v105: info-icon descriptions — hover OR click to read (shared tooltip,
  // positioned in the viewport so it never gets clipped by the editor's
  // internal scroll). Descriptions live in data-tip on each .info-icon.
  function attachInfoTips(){
    const icons = Array.from(document.querySelectorAll('.info-icon'));
    if (!icons.length) return;
    let tip = document.getElementById('infoTip');
    if (!tip){
      tip = document.createElement('div');
      tip.id = 'infoTip';
      tip.className = 'info-tip';
      document.body.appendChild(tip);
    }
    const show = (el) => {
      tip.innerHTML = el.getAttribute('data-tip') || el.title || '';
      tip.style.display = 'block';
      const r = el.getBoundingClientRect();
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let x = Math.round(r.left + r.width / 2 - tw / 2);
      x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
      let y = Math.round(r.top - th - 10);
      if (y < 8) y = Math.round(r.bottom + 10);
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
    };
    const hide = () => { tip.style.display = 'none'; };
    icons.forEach(el => {
      el.addEventListener('mouseenter', () => show(el));
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', () => show(el));
      el.addEventListener('blur', hide);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (el.classList.contains('open')){ el.classList.remove('open'); hide(); }
        else { el.classList.add('open'); show(el); }
      });
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.info-icon')){ icons.forEach(i => i.classList.remove('open')); hide(); }
    });
  }

  // Populate the editor inputs + file-name labels from a track's saved
  // theme + media. Called when a track is selected/applied so the editor
  // always reflects that track's official look (fixes "editor reverted to
  // default after returning from the deployed page").
  function populateEditorFromTrack(t){
    if (!t) return;
    updateEditingTrackBadge();
    // sync the artwork-palette dropdown to THIS track's chosen role
    if (el.paletteChoice) el.paletteChoice.value = t._paletteRole || 'auto';
    // refresh the 7 palette preview tiles + random/restore state
    renderPalettePreviews(t);
    updatePaletteUI(t);
    // v103: reflect THIS track's wave-panel image / blend / grey / tint mode
    applyPanelMedia(t);
    // when the overall theme is ON, the editor shows the master theme
    // (so inputs always match what the player shows)
    const theme = (state.masterOn && state.masterTheme) ? state.masterTheme : (t.theme || {});
    writeThemeToUI(theme);
    // cover + video names for the file labels — prefer the remembered real
    // filename; fall back to a clean name from a server URL; never show
    // a blob: UUID.
    const labelFor = (url, storedName) => {
      if (storedName) return storedName;
      if (String(url||'').startsWith('blob:')) return t.title || 'Track file';
      const n = nameFromURL(url);
      // server uploads have UUID filenames — show the track title instead
      if (n && /^[0-9a-f]{16,}/.test(n)) return (t.title || 'Track') + '.mp3';
      return n || 'No file chosen';
    };
    const cv = document.querySelectorAll('#fileCover');
    cv.forEach(inp => { const fn = inp.closest('.file-ui')?.querySelector('.file-name'); if (fn) fn.textContent = t.cover ? labelFor(t.cover, t._coverName) : 'No file chosen'; });
    const av = document.querySelectorAll('#fileAudio');
    av.forEach(inp => { const fn = inp.closest('.file-ui')?.querySelector('.file-name'); if (fn) fn.textContent = t.audio && !String(t.audio).startsWith('data:') ? labelFor(t.audio, t._audioName) : 'No file chosen'; });
    const vv = document.querySelectorAll('#fileVideo');
    vv.forEach(inp => { const fn = inp.closest('.file-ui')?.querySelector('.file-name'); if (fn) fn.textContent = t.video ? labelFor(t.video, t._videoName) : 'No file chosen'; });
    if (t.cover) el.cover.src = t.cover;
    if (t.video){
      el.coverVideo.src = proxiedMediaUrl(t.video);
      el.coverVideo.style.display = 'block';
      el.cover.style.display = 'block';
      el.player.classList.add('video-active');
    } else {
      el.cover.style.display = 'block';
      el.cover.style.removeProperty('transform');
      el.coverVideo.style.display = 'none';
      el.player.classList.remove('video-active');
    }
    // title/artist inputs
    if (el.inputTitle) el.inputTitle.value = t.title || '';
    const _tcEl = document.getElementById('trackCinema'); if (_tcEl) _tcEl.checked = (t.cinema === true);
    const _tcsEl = document.getElementById('trackCinemaStyle'); if (_tcsEl) _tcsEl.value = t.cinemaStyle || 'bar';
    if (el.inputArtist) el.inputArtist.value = t.artist || '';
    // zoom bars reflect this track's saved transforms
    const tr = (t.transform || (t.theme && t.theme.transform)) || {};
    if (el.coverZoom) el.coverZoom.value = String(tr.coverScale || 1);
    if (el.coverZoomVal) el.coverZoomVal.textContent = (tr.coverScale || 1).toFixed(2) + '×';
    if (el.panelZoom) el.panelZoom.value = String(tr.panelScale || 1);
    if (el.panelZoomVal) el.panelZoomVal.textContent = (tr.panelScale || 1).toFixed(2) + '×';
    // repaint the picker chips to the track colors
    const hexMap = {
      colorPanel:'panel', colorProg1:'prog1', colorProg2:'prog2', colorProg3:'prog3',
      colorProgTrack:'progTrack', colorPlayBtn:'btnPlayBg', colorPlayGlyph:'btnPlayFg',
      colorYoke:'yoke', colorFFREW:'ffrew', colorTimeBg:'timeBg', colorTimeFg:'timeFg',
      colorTopIcons:'topIcons', colorTitleText:'title', colorArtistText:'artist',
      colorKnobInner:'knobIn', colorKnobOuter:'knobOut',
      colorPlBase:'plBase', colorPlGrad:'plGrad', colorPlProg1:'plProg1', colorPlProg2:'plProg2', colorPlProg3:'plProg3'
    };
    Object.keys(hexMap).forEach(id => {
      const inp = document.getElementById(id);
      if (!inp) return;
      const chip = inp.nextElementSibling;
      if (chip && chip.classList && chip.classList.contains('pcr-button')){
        const hex = normHex(theme[hexMap[id]]) || normHex(inp.value) || '#ffffff';
        chip.style.setProperty('background', hex, 'important');
        chip.style.setProperty('background-color', hex, 'important');
      }
      // NOTE: no syncPickrToInput() here — it costs ~25ms per picker
      // (21 pickers ≈ 500ms) and BLOCKED the click handler, delaying audio
      // start by ~0.9s. The popup re-syncs itself on open (forceSync on
      // 'show'), so per-track switching stays instant.
    });
  }

  function writeThemeToUI(theme){
    if (!theme) return;
    if (!el.colorPanel) return;   // deployed page has no editor inputs
    const syncAfter = [];
    el.colorPanel.value      = theme.panel || '#252c36';
    el.colorProg1.value      = theme.prog1 || '#ff2992';
    el.colorProg2.value      = theme.prog2 || '#ffb84d';
    el.colorProg3.value      = theme.prog3 || '#29d5ff';
    el.colorProgTrack.value  = theme.progTrack || '#1a1622';
    el.colorPlayBtn.value    = theme.btnPlayBg || '#f5696c';
    el.colorPlayGlyph.value  = theme.btnPlayFg || '#ffffff';
    el.colorYoke.value       = theme.yoke || '#201f22';
    el.colorFFREW.value      = theme.ffrew || '#bdbcbd';
    el.colorTimeBg.value     = theme.timeBg || '#201f22';
    el.colorTimeFg.value     = theme.timeFg || '#ffffff';
    el.colorTopIcons.value   = theme.topIcons || '#ffffff';
    el.colorTitleText.value  = theme.title || '#ffffff';
    el.colorArtistText.value = theme.artist || '#cfd6e0';
    el.colorKnobInner.value  = theme.knobIn || '#ffffff';
    el.colorKnobOuter.value  = theme.knobOut || '#3a304d';
    el.colorPlBase.value     = theme.plBase || '#121724';
    el.colorPlGrad.value     = theme.plGrad || '#29d5ff';
    el.colorPlProg1.value    = theme.plProg1 || '#ff2992';
    el.colorPlProg2.value    = theme.plProg2 || '#ffb84d';
    el.colorPlProg3.value    = theme.plProg3 || '#29d5ff';
    // sync the popups so they open showing these colours — DEFERRED:
    // 21 x Pickr.setColor() costs ~200ms on the main thread and was delaying
    // audio start on every track switch. The popup also re-syncs on open,
    // and populateEditorFromTrack repaints the chips next frame.
    requestAnimationFrame(() => {
      ['colorPanel','colorProg1','colorProg2','colorProg3','colorProgTrack','colorPlayBtn','colorPlayGlyph',
       'colorYoke','colorFFREW','colorTimeBg','colorTimeFg','colorTopIcons','colorTitleText','colorArtistText',
       'colorKnobInner','colorKnobOuter','colorPlBase','colorPlGrad','colorPlProg1','colorPlProg2','colorPlProg3']
        .forEach(id => syncPickrToInput(document.getElementById(id)));
    });
    // apply
    applyColors(false);
  }

  function applyTheme(theme){
    if (!theme) return;
    const setVar=(n,v)=>{ if(v) el.player.style.setProperty(n,v); };
    setVar('--panel-fill', theme.panel);
    setVar('--progress-start', theme.prog1);
    setVar('--progress-mid',   theme.prog2);
    setVar('--progress-end',   theme.prog3);
    setVar('--progress-track', theme.progTrack);
    setVar('--btn-play-bg',    theme.btnPlayBg);
    setVar('--btn-play-fg',    theme.btnPlayFg);
    setVar('--controls-bg',    theme.yoke);
    setVar('--ff-rew-color',   theme.ffrew);
    setVar('--timestamp-bg',   theme.timeBg);
    setVar('--timestamp-fg',   theme.timeFg);
    setVar('--top-icons-color',theme.topIcons);
    setVar('--title-text-color',  theme.title);
    setVar('--artist-text-color', theme.artist);
    setVar('--knob-inner', theme.knobIn);
    setVar('--knob-outer', theme.knobOut);
    setRootVar('--pl-base', theme.plBase || '#121724');
    setRootVar('--pl-grad', theme.plGrad || '#29d5ff');
    setRootVar('--pl-prog1', theme.plProg1 || '#ff2992');
    setRootVar('--pl-prog2', theme.plProg2 || '#ffb84d');
    setRootVar('--pl-prog3', theme.plProg3 || '#29d5ff');
    updateOverlayStyle();
    saveTheme();
    // v104: canvas-baked blend modes re-render with the new panel colour
    if (typeof refreshBakedPanelTexture === 'function') refreshBakedPanelTexture();
  }

  // ======================= PLAYLIST MANAGER (dev editor) =======================
  // Ported from the user's drag-and-drop version, wired into our demoPlaylist
  // + loadTrack so it works in both views. Dev-page only (el.pmList absent on
  // the deployed page).
  function nameFromURL(u){
    try {
      const p = new URL(u, location.href).pathname.split('/').pop();
      return p && p !== 'blob:' ? decodeURIComponent(p) : null;
    } catch { return null; }
  }

  function titleFromFile(f){
    const n = (f.name || 'Track').replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ');
    return n.replace(/\b\w/g, c => c.toUpperCase());
  }
  function niceTitleFromUrl(u){
    const n = decodeURIComponent((u.split('/').pop() || 'Track')).replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ');
    return n.replace(/\b\w/g, c => c.toUpperCase());
  }
  // Downscale an embedded-artwork data URI so it stays small enough to save.
  // A track's art can be a 1.6MB PNG inside the MP3 -> a 2.2MB data URI,
  // and 5 such covers EXCEED the 5MB localStorage quota — which made every
  // playlist save silently fail, so the deployed view showed stale/placeholder
  // artwork (and even dropped tracks). 600px JPEG is plenty for a 415px window.
  function downscaleImageDataURI(uri, maxDim, quality){
    maxDim = maxDim || 600;
    quality = quality || 0.82;
    if (!uri || !String(uri).startsWith('data:image')) return Promise.resolve(uri);
    if (String(uri).length < 150000) return Promise.resolve(uri);   // already small
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        try {
          const w = img.naturalWidth, h = img.naturalHeight;
          const scale = Math.min(1, maxDim / Math.max(w, h));
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(w * scale));
          c.height = Math.max(1, Math.round(h * scale));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          // quality ladder: keep stepping down until the cover is compact
          // (noisy/artistic art can stay huge at q0.82; photos shrink fast)
          const target = 150000;
          let out = null;
          for (const q of [quality, 0.7, 0.55, 0.42, 0.32]){
            const cand = c.toDataURL('image/jpeg', q);
            if (cand.length <= target){ out = cand; break; }
            out = cand;
          }
          resolve(out && out.length < String(uri).length ? out : uri);
        } catch { resolve(uri); }
      };
      img.onerror = () => resolve(uri);
      img.src = String(uri);
    });
  }

  // Heal any track whose saved cover is an oversized data URI (e.g. covers
  // extracted before downscaling existed). Runs at boot in BOTH views so the
  // deployed player's stored playlist stops carrying multi-MB covers.
  function healOversizedCovers(){
    demoPlaylist.forEach((t, i) => {
      const c = t && t.cover;
      if (c && String(c).startsWith('data:image') && String(c).length >= 150000){
        downscaleImageDataURI(c).then(small => {
          if (small && small !== c && demoPlaylist[i]){
            demoPlaylist[i].cover = small;
            if (i === state.currentIndex && el.cover) el.cover.src = small;
            savePlaylist();
          }
        });
      }
    });
  }

  function defaultCoverFromName(name){
    // Deterministic placeholder artwork as an INLINE SVG data-URI — the old
    // https://via.placeholder.com service is unreachable inside the sandboxed
    // preview, so missing art stayed broken. A data URI always loads.
    const clean = String(name || 'Track').replace(/\.[a-z0-9]+$/i, '').trim() || 'Track';
    const h = Math.abs([...clean].reduce((a,c)=>((a<<5)-a)+c.charCodeAt(0)|0, 0)) % 360;
    const hue = h * 0.75 + 210;                       // blue-violet family, never neon
    const bg1 = 'hsl(' + hue + ', 30%, 16%)';
    const bg2 = 'hsl(' + hue + ', 45%, 30%)';
    const letters = clean.split(/[\s-]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '♪';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">'
      + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
      + '<stop offset="0" stop-color="' + bg1 + '"/><stop offset="1" stop-color="' + bg2 + '"/></linearGradient></defs>'
      + '<rect width="300" height="300" fill="url(#g)"/>'
      + '<circle cx="150" cy="118" r="42" fill="rgba(255,255,255,0.14)"/>'
      + '<text x="150" y="152" font-family="Helvetica,Arial,sans-serif" font-size="72" font-weight="bold" fill="rgba(255,255,255,0.9)" text-anchor="middle">' + letters + '</text>'
      + '<text x="150" y="266" font-family="Helvetica,Arial,sans-serif" font-size="26" fill="rgba(255,255,255,0.55)" text-anchor="middle" letter-spacing="2">♪</text>'
      + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // ---- per-transition editor (Phase 1, TR-05) ----
  // Opens an inline editor below the row: fade seconds (0 = gapless),
  // curve (equal-power/equal-gain), optional bars (beats mode), and
  // apply-to-all + clear. Persists on the track as t.transition.
  function openTransitionEditor(i, row){
    const t = demoPlaylist[i];
    if (!t) return;
    const nextName = (demoPlaylist[i + 1] && demoPlaylist[i + 1].title) || (demoPlaylist[(i + 1) % demoPlaylist.length] && demoPlaylist[(i + 1) % demoPlaylist.length].title) || 'next';
    // close any open editor
    const old = el.pmList.querySelector('.pm-trans-editor');
    if (old) old.remove();
    const tr = transitionFor(i);
    const ed = document.createElement('div');
    ed.className = 'pm-trans-editor';
    ed.innerHTML = `
      <div class="pm-trans-head">Transition into <b>${escapeHTML(nextName)}</b></div>
      <div class="pm-trans-row">
        <label>Fade (s)</label>
        <input type="range" min="0" max="90" step="1" value="${tr.fade}" class="tr-fade" />
        <span class="tr-fade-val">${tr.fade}s ${tr.fade === 0 ? '(gapless)' : ''}</span>
      </div>
      <div class="pm-trans-row">
        <label>Curve</label>
        <select class="tr-curve">
          <option value="equal-power" ${tr.curve === 'equal-power' ? 'selected' : ''}>Equal power</option>
          <option value="equal-gain" ${tr.curve === 'equal-gain' ? 'selected' : ''}>Equal gain</option>
        </select>
        <label>Bars (beats)</label>
        <select class="tr-beats">
          <option value="0" ${tr.beats === 0 ? 'selected' : ''}>Off (seconds)</option>
          <option value="8" ${tr.beats === 8 ? 'selected' : ''}>8 bars</option>
          <option value="16" ${tr.beats === 16 ? 'selected' : ''}>16 bars</option>
          <option value="32" ${tr.beats === 32 ? 'selected' : ''}>32 bars</option>
        </select>
      </div>
      <div class="pm-trans-row">
        <label>Snap</label>
        <label class="inline-check" title="Land the fade on a bar line (needs the detected BPM)"><input type="checkbox" class="tr-snap" ${tr.snap ? 'checked' : ''} /> Snap to beat</label>
        <label>Tempo</label>
        <select class="tr-tempo">
          <option value="instant" ${tr.tempoMode === 'instant' ? 'selected' : ''}>Instant</option>
          <option value="locked" ${tr.tempoMode === 'locked' ? 'selected' : ''}>Locked (match speed)</option>
          <option value="ramp" ${tr.tempoMode === 'ramp' ? 'selected' : ''}>Ramp (glide)</option>
        </select>
        <span class="hint-inline">Locked/Ramp keep both tracks at the same speed during the blend</span>
      </div>
      <div class="pm-trans-row">
        <button class="btn apply" type="button" id="tr-save">Save</button>
        <button class="btn" type="button" id="tr-clear">Clear (use global)</button>
        <button class="btn" type="button" id="tr-all">Apply to all</button>
        <span class="hint-inline">0s = true gapless · bars use the detected BPM</span>
      </div>`;
    row.after(ed);
    const fadeIn = ed.querySelector('.tr-fade');
    const fadeVal = ed.querySelector('.tr-fade-val');
    fadeIn.addEventListener('input', () => { fadeVal.textContent = fadeIn.value + 's' + (fadeIn.value === '0' ? ' (gapless)' : ''); });
    ed.querySelector('#tr-save').addEventListener('click', () => {
      t.transition = {
        fade: parseFloat(fadeIn.value) || 0,
        curve: ed.querySelector('.tr-curve').value,
        beats: parseInt(ed.querySelector('.tr-beats').value, 10) || 0,
        tempoMode: ed.querySelector('.tr-tempo').value || 'instant',
        snap: !!(ed.querySelector('.tr-snap') && ed.querySelector('.tr-snap').checked)
      };
      state.playlistDirty = true;
      savePlaylist(); saveTheme({ server: true });
      ed.remove();
      const st = document.getElementById('syncStatus');
      if (st) setSyncStatus('Transition saved for track ' + (i + 1) + ' → ' + nextName, true);
    });
    ed.querySelector('#tr-clear').addEventListener('click', () => {
      delete t.transition;
      state.playlistDirty = true;
      savePlaylist(); saveTheme({ server: true });
      ed.remove();
      setSyncStatus('Transition cleared — uses the global default', true);
    });
    ed.querySelector('#tr-all').addEventListener('click', () => {
      const v = { fade: parseFloat(fadeIn.value) || 0, curve: ed.querySelector('.tr-curve').value, beats: parseInt(ed.querySelector('.tr-beats').value, 10) || 0, tempoMode: ed.querySelector('.tr-tempo').value || 'instant', snap: !!(ed.querySelector('.tr-snap') && ed.querySelector('.tr-snap').checked) };
      demoPlaylist.forEach(x => { if (x) x.transition = JSON.parse(JSON.stringify(v)); });
      state.playlistDirty = true;
      savePlaylist(); saveTheme({ server: true });
      ed.remove();
      setSyncStatus('Applied to ALL transitions', true);
    });
  }

  function renderPlaylistManager(){
    if (!el.pmList) return;
    el.pmList.innerHTML = '';
    demoPlaylist.forEach((t, i) => {
      const row = document.createElement('li');
      row.className = 'pm-row';
      row.draggable = true;
      row.dataset.index = String(i);
      row.innerHTML = `
        <i class="fa fa-bars drag" aria-hidden="true"></i>
        <img class="thumb" alt="" src="${escapeHTML(t.cover || '')}" />
        <div class="meta">
          <div class="pm-missing-line">${t._audioMissing ? '<span class="pl-missing">⚠ audio file missing — drop a file on this row to replace it</span>' : ''}</div>
          <input class="title" type="text" value="${escapeHTML(t.title || '')}" placeholder="Title" />
          <input class="artist" type="text" value="${escapeHTML(t.artist || '')}" placeholder="Artist" />
          <div class="pm-bpm${t._bpmDetecting ? 'detecting' : ''}">
            <span class="pm-bpm-note">♩</span>
            <input class="pm-bpm-val" type="number" min="40" max="220" step="0.5" value="${t.bpm != null ? t.bpm : ''}" placeholder="BPM" title="Tempo (BPM)" />
            <span class="pm-bpm-dot conf-${t.bpmConfidence >= 0.5 ? 'high' : (t.bpmConfidence > 0 ? 'low' : 'none')}" title="confidence ${Math.round((t.bpmConfidence||0)*100)}%"></span>
            <button type="button" class="pm-bpm-btn" data-act="half" title="Half tempo (fix double-time)">½</button>
            <button type="button" class="pm-bpm-btn" data-act="double" title="Double tempo (fix half-time)">×2</button>
            <button type="button" class="pm-bpm-btn" data-act="detect" title="Re-detect BPM">↻</button>
            <span class="pm-bpm-src" title="${t.bpmSource === 'manual' ? 'set manually' : 'auto-detected'}">${t._bpmDetecting ? '…' : (t.bpmSource === 'manual' ? '✎' : (t.bpm != null ? '✓' : ''))}</span>
          </div>
        </div>
        <div class="row-actions">
          <button class="btn apply" type="button" title="Load into Player">Apply</button>
          <button class="btn transition" type="button" title="Edit the transition INTO the next track">⧉</button>
          <button class="btn remove" type="button" title="Remove"><i class="fa fa-trash"></i></button>
        </div>`;

      const titleIn = row.querySelector('.title');
      const artistIn = row.querySelector('.artist');
      titleIn.addEventListener('change', () => { t.title = titleIn.value.trim() || t.title; state.playlistDirty = true; renderPlaylist(); savePlaylist(); if (i === state.currentIndex) el.title.textContent = t.title; });
      artistIn.addEventListener('change', () => { t.artist = artistIn.value.trim() || t.artist; state.playlistDirty = true; renderPlaylist(); savePlaylist(); if (i === state.currentIndex) el.artist.textContent = t.artist; });
      const bpmVal = row.querySelector('.pm-bpm-val');
      if (bpmVal) bpmVal.addEventListener('change', () => {
        const v = parseFloat(bpmVal.value);
        setTrackBpm(t, (isFinite(v) && v > 0) ? v : null, { source: 'manual' });
      });
      row.querySelectorAll('.pm-bpm-btn').forEach(btn => btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        const act = btn.dataset.act;
        if (act === 'half') setTrackBpm(t, t.bpm ? t.bpm / 2 : t.bpm, { source: t.bpmSource || 'manual' });
        else if (act === 'double') setTrackBpm(t, t.bpm ? t.bpm * 2 : t.bpm, { source: t.bpmSource || 'manual' });
        else if (act === 'detect') redetectBpm(t);
      }));

      row.querySelector('.apply').addEventListener('click', () => { loadTrack(i, true); requestAnimationFrame(() => populateEditorFromTrack(demoPlaylist[i])); });
      row.querySelector('.transition').addEventListener('click', () => openTransitionEditor(i, row));
      row.querySelector('.remove').addEventListener('click', () => {
        demoPlaylist.splice(i, 1); state.playlistDirty = true;
        if (state.currentIndex >= demoPlaylist.length) state.currentIndex = Math.max(0, demoPlaylist.length - 1);
        renderPlaylist(); renderPlaylistManager(); savePlaylist();
        if (demoPlaylist.length) loadTrack(state.currentIndex, false);
      });

      // DROP A FILE ONTO THIS ROW — v109 ZONE-AWARE. Quick release (<500ms)
      // = add (appends at the end via the list handler). Held + MIDDLE band
      // = REPLACE this track's audio in place (keeps title/artist/cover/
      // theme/transition) — the way to fix a missing-file track. Held + TOP/
      // BOTTOM band = let the event bubble to the list, which INSERTS the
      // track before/after this row.
      row.addEventListener('drop', e => {
        row.classList.remove('drop-target', 'drop-replace', 'drop-before', 'drop-after');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (!f || !/^audio\//.test(f.type || '')) return;
        const entered = parseInt((el.pmList && el.pmList.dataset.fileEnter) || 0, 10);
        const quick = !entered || (Date.now() - entered) < 500;
        if (quick) return;                       // list handler appends
        if (fileZone(e, row) !== 'replace') return;   // list handler inserts
        e.preventDefault();
        e.stopPropagation();
        if (t._audioMissing) markAudioMissing(t, false);
        applyAudioFileToTrack(f, t, { reloadTrack: i === state.currentIndex });
        setSyncStatus('Replaced this track audio — ' + f.name, true);
      });

      // ---- drag to reorder (HTML5 DnD) ----
      // Live DOM move during dragover; commit the array order on drop.
      // We track the dragged NODE (not stale indices) so repeated
      // dragover passes keep working.
      row.addEventListener('dragstart', e => {
        row.classList.add('dragging');
        e.dataTransfer.setData('text/plain', String(i));
        e.dataTransfer.effectAllowed = 'move';
        el.pmList.dataset.dragFrom = String(i);
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        delete el.pmList.dataset.dragFrom;
      });
      row.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (row.classList.contains('dragging')) return;   // hovering over self
        const draggingNode = el.pmList.querySelector('.pm-row.dragging');
        if (!draggingNode) return;
        const after = e.offsetY > row.clientHeight / 2;
        const ref = after ? row.nextSibling : row;
        if (draggingNode === ref || draggingNode.nextSibling === ref) return;
        el.pmList.insertBefore(draggingNode, ref);
      });
      row.addEventListener('drop', e => {
        e.preventDefault();
        const draggingNode = el.pmList.querySelector('.pm-row.dragging');
        if (!draggingNode) return;
        const from = parseInt(el.pmList.dataset.dragFrom, 10);
        if (isNaN(from)) return;
        // the dragged node's live position = its array destination
        const to = Array.from(el.pmList.children).indexOf(draggingNode);
        if (to < 0 || to === from) return;
        const [it] = demoPlaylist.splice(from, 1);
        demoPlaylist.splice(to, 0, it);
        if (state.currentIndex === from) state.currentIndex = to;
        else if (state.currentIndex > from && state.currentIndex <= to) state.currentIndex--;
        else if (state.currentIndex < from && state.currentIndex >= to) state.currentIndex++;
        renderPlaylist();
        renderPlaylistManager();
        savePlaylist();
      });

      el.pmList.appendChild(row);
    });
  }

  // Read MP3 ID3v2 metadata (title/artist) + embedded APIC album art by
  // parsing the file bytes directly (the <audio> element exposes neither).
  function readMp3Meta(file){
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const buf = new Uint8Array(reader.result);
          // ID3v2 header: 'ID3' + ver + flags + size (syncsafe, 4 bytes)
          if (buf.length < 10 || buf[0] !== 0x49 || buf[1] !== 0x44 || buf[2] !== 0x33){
            return resolve({ title: null, artist: null, cover: null });
          }
          const ver = buf[3];
          const syncsafe = ver === 4;   // ID3v2.4 frame sizes are syncsafe too
          const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
          const end = Math.min(10 + size, buf.length);
          let title = null, artist = null, cover = null;
          let pos = 10;
          while (pos + 10 <= end){
            const id = String.fromCharCode(buf[pos], buf[pos+1], buf[pos+2], buf[pos+3]);
            const b0 = buf[pos+4], b1 = buf[pos+5], b2 = buf[pos+6], b3 = buf[pos+7];
            const fsz = syncsafe
              ? ((b0 & 0x7f) << 21) | ((b1 & 0x7f) << 14) | ((b2 & 0x7f) << 7) | (b3 & 0x7f)
              : (b0 << 24) | (b1 << 16) | (b2 << 8) | b3;
            const flags = buf[pos+8];
            let dataStart = pos + 10;
            if (ver === 4){
              if (flags & 0x40) dataStart += 1;   // group id
              if (flags & 0x20) dataStart += 1;   // compression flag
            } else {
              if (flags & 0x80) dataStart += 4;   // compression
              if (flags & 0x40) dataStart += 1;   // encryption
              if (flags & 0x20) dataStart += 1;   // grouping
            }
            const dataEnd = Math.min(dataStart + fsz, buf.length);
            if (id === 'TIT2' || id === 'TPE1'){
              let s = '';
              for (let i = dataStart + 1; i < dataEnd; i++) s += String.fromCharCode(buf[i]);   // skip 1-byte encoding
              s = s.replace(/\u0000/g, '').trim();
              if (id === 'TIT2' && s) title = s;
              if (id === 'TPE1' && s) artist = s;
            } else if (id === 'APIC'){
              // [1-byte encoding][mime\0][1-byte picture type][description\0][image]
              let i = dataStart + 1;   // skip the 1-byte text encoding (0 latin1, 1 utf16, 3 utf8)
              const mimeStart = i;
              while (i < dataEnd && buf[i] !== 0) i++;
              const mime = String.fromCharCode.apply(null, buf.slice(mimeStart, i));
              i++;                      // mime terminator
              i += 1;                   // picture type byte
              while (i < dataEnd && buf[i] !== 0) i++;   // description
              i++;
              if (i < dataEnd && buf[i] === 0) i++;      // UTF-16 descriptions end with a double NUL
              const img = buf.slice(i, dataEnd);
              const blob = new Blob([img], { type: mime || 'image/jpeg' });
              const r = new FileReader();
              r.onload = () => { cover = r.result; resolve({ title, artist, cover }); };
              r.onerror = () => resolve({ title, artist, cover: null });
              r.readAsDataURL(blob);
              return;
            }
            pos = dataEnd;
          }
          resolve({ title, artist, cover });
        } catch { resolve({ title: null, artist: null, cover: null }); }
      };
      reader.onerror = () => resolve({ title: null, artist: null, cover: null });
      reader.readAsArrayBuffer(file);
    });
  }

  // Apply a chosen/dropped AUDIO file to a track: set the blob, read the
  // embedded metadata (title/artist/artwork), derive + apply the colour
  // theme, upload to the server for persistence. Used by the editor's file
  // chooser, the editor drop zone and the Playlist Manager.
  function applyAudioFileToTrack(f, entry, opts){
    opts = opts || {};
    const blob = URL.createObjectURL(f);
    state.liveBlobs.add(blob);
    entry.audio = blob;
    entry._blobURL = blob;
    entry._audioName = f.name;
    const idx = demoPlaylist.indexOf(entry);
    state.playlistDirty = true;
    // DJ Phase 2: detect tempo + beat phase from the file (runs alongside
    // the metadata read; updates the row + persists when done)
    if (window.BpmDetect) analyzeBpm(f, entry);
    // upload so the deployed player + reloads use a persistent URL
    uploadFile(f, 'audio').then(u => {
      if (u && demoPlaylist.indexOf(entry) !== -1){
        entry.audio = u;
        entry._serverAudio = u;
        // NOTE: no repoint of the live element here — loadTrack prefers the
        // session blob for playback, so clicks stay instant; the server URL
        // persists in t.audio for reloads and the deployed page.
        state.playlistDirty = true;
        savePlaylist();
        saveTheme({server:true});
      }
      updateMediaSummary();
    });
    readMp3Meta(f).then(async meta => {
      if (meta && meta.title) entry.title = meta.title;
      if (meta && meta.artist) entry.artist = meta.artist;
      if (meta && meta.cover){
        entry.cover = await downscaleImageDataURI(meta.cover);
        // v100: keep a PERSISTED copy of the metadata artwork so the
        // "Restore metadata artwork" button can bring it (and its original
        // colour scheme) back even after the user swapped the cover.
        entry._metaCover = entry.cover;
      }
      // untagged file: split "Artist - Title.mp3" style filenames
      if ((!meta || !meta.title) && (!meta || !meta.artist)){
        const m = (f.name || '').replace(/\.[a-z0-9]+$/i, '').match(/^\s*(.+?)\s*[-–—]\s*(.+?)\s*$/);
        if (m){
          const cap = s => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
          entry.title = cap(m[2]);
          entry.artist = cap(m[1]);
        }
      }
      // if this is the track on screen, refresh the player now
      if (idx === state.currentIndex){
        el.title.textContent = entry.title || 'Track';
        el.artist.textContent = entry.artist || 'Unknown';
        const c = entry.cover || defaultCoverFromName(entry.title || 'Track');
        if (c && c !== el.cover.src) el.cover.src = c;
        populateEditorFromTrack(entry);
      }
      if (meta && meta.cover){
        deriveThemeFromCover({ cover: meta.cover }, entry && entry._paletteRole).then(theme => {
          entry.theme = theme;
          entry._original = { title: entry.title, artist: entry.artist, cover: meta.cover, audio: entry.audio, video: null, theme: JSON.parse(JSON.stringify(theme)), transform: null, panelImage: entry.panelImage || null, panelImageGrey: entry.panelImageGrey || null, panelGrey: !!entry.panelGrey, panelBlend: (typeof entry.panelBlend === 'number') ? entry.panelBlend : 0, panelBlendMode: entry.panelBlendMode || 'normal' };
          if (idx === state.currentIndex){
            const eff = effectiveTheme(entry);
            if (eff) applyWithTheme(eff);
            populateEditorFromTrack(entry);
          }
          renderPlaylist(); renderPlaylistManager(); state.playlistDirty = true; savePlaylist();
        });
      }
      renderPlaylist(); renderPlaylistManager(); state.playlistDirty = true; savePlaylist();
      // v101: metadata (incl. _metaCover) just landed — refresh the palette
      // UI + restore button state NOW, without waiting for a track switch
      if (idx === state.currentIndex){ updatePaletteUI(entry); renderPalettePreviews(entry); }
      if (opts.reloadTrack) loadTrack(state.currentIndex, false);
    }).catch(() => {
      renderPlaylist(); renderPlaylistManager(); state.playlistDirty = true; savePlaylist();
      if (opts.reloadTrack) loadTrack(state.currentIndex, false);
    });
  }

  function addFilesToPlaylist(files, insertIndex){
    const addable = Array.from(files || []).filter(f => /^audio\/|^video\//.test(f.type || ''));
    if (!addable.length) { setSyncStatus('No audio/video files in the drop', false); return; }
    // v107: positional insertion — where the new tracks land (default: end)
    const insIdx = (typeof insertIndex === 'number')
      ? Math.max(0, Math.min(insertIndex, demoPlaylist.length))
      : demoPlaylist.length;
    let pos = insIdx;
    // FM-06: warn about any format this browser cannot play (still added,
    // so the user can see why it would fail, but the message is clear)
    const unsupported = addable.filter(f => audioSupportFor(f.name, f.type) === '');
    if (unsupported.length){
      setSyncStatus('⚠ ' + unsupported.map(f => f.name + ' (' + formatLabel(extOf(f.name)) + ')').join(', ')
        + ' — not supported by this browser; convert to MP3/WAV/FLAC/OGG', false);
    }
    let pending = addable.length;
    let added = 0, replaced = 0;
    addable.forEach(f => {
      // RE-UPLOAD FIX: if a track with this exact filename already exists
      // (e.g. the user re-drops the same song after its file was wiped),
      // REPLACE that track in place instead of appending a duplicate that
      // leaves the broken original behind.
      const existing = demoPlaylist.find(t => t && t._audioName === f.name);
      if (existing){
        replaced++;
        applyAudioFileToTrack(f, existing, { reloadTrack: existing === demoPlaylist[state.currentIndex] });
        pending--;
        if (pending === 0){
          renderPlaylist(); renderPlaylistManager(); state.playlistDirty = true; savePlaylist();
          setSyncStatus('Replaced ' + replaced + ' existing track(s) with the re-uploaded file — metadata read where available', true);
        }
        return;
      }
      const entry = {
        title: titleFromFile(f), artist: 'Unknown',
        audio: '', cover: defaultCoverFromName(f.name),
        bandcamp: '', theme: null,   // Entry S29: fresh — loadTrack derives a cover-art palette (don't copy the current track's)
        _audioName: f.name
      };
      demoPlaylist.splice(pos, 0, entry);
      pos++;
      added++;
      applyAudioFileToTrack(f, entry, {});
      pending--;
      if (pending === 0){
        renderPlaylist(); renderPlaylistManager(); state.playlistDirty = true; savePlaylist();
        setSyncStatus('Added ' + addable.length + ' track(s) — metadata read where available', true);
      }
    });
    // immediate render with the filename titles
    renderPlaylist(); renderPlaylistManager(); state.playlistDirty = true; savePlaylist();
    checkMissingAudio();
    // v107: keep the playing track stable when inserting before it
    if (added && insIdx <= state.currentIndex) state.currentIndex += added;
    // load the FIRST added track into the player so the drop is visible
    // immediately (title/artist/artwork/theme refine as metadata lands)
    const firstIdx = added ? insIdx : state.currentIndex;
    loadTrack(firstIdx, false);
    populateEditorFromTrack(demoPlaylist[firstIdx]);
  }

  function attachPlaylistManager(){
    if (!el.pmList) return;   // deployed page: no manager
    el.pmClearBtn?.addEventListener('click', () => {
      if (!demoPlaylist.length){ setSyncStatus('Playlist is already empty', true); return; }
      if (!confirm('Remove ALL tracks from the playlist?\n\nThis also clears the saved playlist on the server.')) return;
      demoPlaylist.length = 0;
      state.currentIndex = 0;
      state.playlistDirty = true;
      savePlaylist();          // localStorage {list: []} + server push of empty tracks
      renderPlaylist();
      renderPlaylistManager();
      loadTrack(0, false);
      setSyncStatus('Playlist cleared — add tracks to start fresh', true);
    });
    el.pmFileInput.addEventListener('change', () => { addFilesToPlaylist(el.pmFileInput.files); el.pmFileInput.value = ''; });
    el.pmAddUrlBtn.addEventListener('click', () => {
      const url = (el.pmUrlInput.value || '').trim();
      if (!url) return;
      // FM-06: warn when adding a URL whose format this browser can't play
      const uExt = extOf(url.split('?')[0]);
      if (uExt && audioSupportFor(uExt) === ''){
        setSyncStatus(unsupportedHint(uExt), false);
      }
      demoPlaylist.push({
        title: niceTitleFromUrl(url), artist: 'Unknown',
        audio: url, cover: defaultCoverFromName(url.split('/').pop() || ''),
        bandcamp: '', theme: Object.assign({}, demoPlaylist[state.currentIndex]?.theme || {})
      });
      el.pmUrlInput.value = '';
      renderPlaylist(); renderPlaylistManager(); state.playlistDirty = true; savePlaylist();
    });
    ['dragenter', 'dragover'].forEach(evt => el.pmDrop.addEventListener(evt, e => { e.preventDefault(); el.pmDrop.classList.add('dragover'); }));
    ['dragleave', 'drop'].forEach(evt => el.pmDrop.addEventListener(evt, e => { e.preventDefault(); el.pmDrop.classList.remove('dragover'); }));
    el.pmDrop.addEventListener('drop', e => addFilesToPlaylist(e.dataTransfer && e.dataTransfer.files));
  }

  // Dev-page tabs: Editor | Playlist Manager (only one panel visible at a time)
  function attachDevTabs(){
    const bar = document.querySelector('.dev-tabbar');
    if (!bar) return;   // deployed page has no tabs
    bar.addEventListener('click', e => {
      const btn = e.target.closest('button[data-tab]');
      if (!btn) return;
      const tab = btn.dataset.tab;
      bar.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.dev-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + tab));
    });
    // nested sub-tabs within the editor: Edit Main Player / Edit Playlist Panel
    const subbar = document.getElementById('editTabbar');
    if (subbar){
      subbar.addEventListener('click', e => {
        const btn = e.target.closest('button[data-stab]'); if (!btn) return;
        const stab = btn.dataset.stab;
        subbar.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.sub-panel').forEach(p => p.classList.toggle('active', p.dataset.spanel === stab));
      });
    }
    // Visualiser sub-tabs: Main player / Playlist (Entry S24). Distinct panel
    // class (.viz-sub-panel) so the edit sub-tab handler above never toggles these.
    const vizbar = document.getElementById('vizTabbar');
    if (vizbar){
      vizbar.addEventListener('click', e => {
        const btn = e.target.closest('button[data-viztab]'); if (!btn) return;
        const vt = btn.dataset.viztab;
        vizbar.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.viz-sub-panel').forEach(p => p.classList.toggle('active', p.dataset.vizpanel === vt));
      });
    }
  }

  // ===================== GLOBAL SETTINGS =====================
  // Everything that applies to the WHOLE player (not per track): playback
  // behaviour, OS integration, defaults, housekeeping. Persisted in
  // localStorage (roundPlayer.global.v1) and shipped to the deployed page
  // via the server theme for fresh browsers.
  const GLOBAL_KEY = 'roundPlayer.global.v1';
  const RESUME_KEY = 'roundPlayer.resume.v1';
  let gs = {
    masterOn: false,
    autoplay: false,
    loop: 'off',          // off | all | one
    shuffle: false,
    gapless: false,
    fade: true,
    speed: 1,
    boost: 100,           // volume boost % (100-200)
    resume: false,
    sleep: 0,             // minutes, 0 = off
    volume: 75,           // default volume %
    mediaSession: true,
    cinema: true,               // auto-hide controls on video tracks (global default)
    plCinema: false,            // playlist cinema OFF by default (user toggles via Global Settings)
    cinemaStyle: 'bar',         // 'bar' = progress bar | 'head' = playhead only
    transitionDefault: { fade: 0, curve: 'equal-power', beats: 0, tempoMode: 'instant', snap: false },  // 0 = gapless
    beatPulse: true,          // DJ Phase 2: artwork "breathes" on the detected beat
    beatPulseStrength: 35     // 0-100 (pulse depth)
  };
  let gsSleepTimer = null;
  let gsPosTick = 0;

  const gsLoad = () => {
    try { const s = JSON.parse(localStorage.getItem(GLOBAL_KEY) || 'null'); if (s) gs = Object.assign(gs, s); } catch {}
    // fresh browser: inherit global settings saved with the deployed theme
    if (window.__serverGlobal && localStorage.getItem(GLOBAL_KEY) === null){
      gs = Object.assign(gs, window.__serverGlobal || {});
      gsSave();
    }
  };
  const gsSave = () => { try { localStorage.setItem(GLOBAL_KEY, JSON.stringify(gs)); } catch {} };

  // ===== Per-transition crossfade engine (Phase 1: TR-01..TR-06) =====
  // Each track carries a "transition" (to the NEXT track):
  //   { fade: seconds (0 = gapless), curve: 'equal-power'|'equal-gain', beats: bars }
  // Tracks without one fall back to gs.transitionDefault. A dual-element
  // (A/B) audio engine preloads the next track and blends at the boundary.
  const AB = {
    // exposed for the automated suite: window.__abDebug mirrors the live AB state
    __expose: () => { try { window.__abDebug = AB; } catch {} }
  ,
    a: null, b: null, cur: 'a', preloading: false, active: false, blendRaf: null,
    _preloadNext: null,   // index of the track we're preloading for the blend
    _blendNext: null      // index of the track being blended into
  };

  function transitionFor(i){
    const t = demoPlaylist[i];
    const own = t && t.transition && typeof t.transition === 'object' ? t.transition : null;
    const def = (gs && gs.transitionDefault) || { fade: 0, curve: 'equal-power', beats: 0 };
    return {
      fade: own && isFinite(own.fade) ? own.fade : (def.fade || 0),
      curve: (own && own.curve) || def.curve || 'equal-power',
      beats: own && isFinite(own.beats) ? own.beats : (def.beats || 0),
      tempoMode: (own && own.tempoMode) || def.tempoMode || 'instant',
      snap: own && typeof own.snap === 'boolean' ? own.snap : (typeof def.snap === 'boolean' ? def.snap : false)
    };
  }
  // convert a bars-based transition to seconds using the OUTGOING track BPM
  // (falls back to plain seconds when no BPM is known)
  function transitionSeconds(t, tr){
    if (tr.beats > 0 && t && t.bpm > 0) return tr.beats * 4 * 60 / t.bpm;
    return tr.fade;
  }
  // equal-power gains: gainA=cos(t·π/2), gainB=sin(t·π/2) (-3 dB midpoint);
  // equal-gain: linear crossfade (a=1-t, b=t) for correlated material
  function crossfadeGains(t, curve){
    if (curve === 'equal-gain') return { a: 1 - t, b: t };
    return { a: Math.cos(t * Math.PI / 2), b: Math.sin(t * Math.PI / 2) };
  }

  // ---- dual-element engine ----
  function ensureAB(){
    if (!AB.a){
      AB.a = new Audio();
      AB.b = new Audio();
      window.__abEls = { a: AB.a, b: AB.b };   // debug/test hook
      [AB.a, AB.b].forEach(a => { a.preload = 'auto'; a.volume = 0; });
    }
    // route both into the Web Audio graph (once each) so volume boost +
    // analyser keep working. CRITICAL: the graph may be created AFTER the
    // AB elements (lazy AudioContext on the play gesture), so re-attempt the
    // wiring on EVERY call — an unwired element is silent.
    const wire = (el2) => {
      if (!vizAudioCtx || !vizMasterGain || el2._wired) return;
      try {
        const src = vizAudioCtx.createMediaElementSource(el2);
        src.connect(vizMasterGain);
        el2._wired = true;
      } catch {}
    };
    wire(AB.a);
    wire(AB.b);
  }
  // call before starting any blend: guarantees both AB elements are wired
  function ensureABWired(){
    ensureAB();
    if (vizAudioCtx && vizMasterGain){
      // force re-attempt if either element is unwired
      if (!AB.a._wired || !AB.b._wired){
        try {
          if (!AB.a._wired){ const s = vizAudioCtx.createMediaElementSource(AB.a); s.connect(vizMasterGain); AB.a._wired = true; }
          if (!AB.b._wired){ const s = vizAudioCtx.createMediaElementSource(AB.b); s.connect(vizMasterGain); AB.b._wired = true; }
        } catch {}
      }
    }
  }
  // set a source on the INACTIVE element, preload it
  function abPreload(url){
    if (!url) return;
    ensureAB();
    const el2 = AB.cur === 'a' ? AB.b : AB.a;
    const _purl = proxiedMediaUrl(url);
    el2._lastSrc = _purl;              // mark IMMEDIATELY (synchronously)
    try { el2.src = _purl; el2.load(); } catch {}
    // the preload element must be COMPLETELY silent while buffering — it is
    // only heard once the blend hands over at full volume. load() can reset
    // volume in some browsers, so set it before AND after.
    try { el2.volume = 0; } catch {}
    el2.addEventListener('loadedmetadata', () => { try { el2.volume = 0; } catch {} }, { once: true });
    AB.preloading = true;
  }
  function abSwitchActive(){
    AB.cur = AB.cur === 'a' ? 'b' : 'a';
    AB.preloading = false;
  }
  // When the A/B engine takes over playback, detach the ORIGINAL el.audio's
  // media handlers so its 'ended' (or 'play'/'pause') can never double-fire
  // the transition/advance logic.
  function abDetachOriginal(){
    try {
      detachMediaHandlers(el.audio);
      el.audio.removeEventListener('timeupdate', onTimeUpdate);
      el.audio.removeEventListener('loadedmetadata', onLoadedMeta);
    } catch {}
  }
  function abStopAll(){
    if (AB.a){ AB.a.pause(); AB.a.volume = 0; AB.a._lastSrc = null; }
    if (AB.b){ AB.b.pause(); AB.b.volume = 0; AB.b._lastSrc = null; }
    AB.preloading = false;
    AB._preloadNext = null;
    AB._blendNext = null;
    if (AB.blendRaf){ cancelAnimationFrame(AB.blendRaf); AB.blendRaf = null; }
    AB.cur = 'a';
    // if the AB engine had taken over as master, hand the master back to
    // el.audio so the UI (volume fader, play/pause) controls the right element
    if (state.master && state.master !== el.audio && state.master !== el.coverVideo){
      state.master = el.audio;
      try { detachMediaHandlers(AB.cur === 'a' ? AB.b : AB.a); } catch {}
      try { attachMediaHandlers(el.audio); } catch {}
    }
  }

  try { window.__abDebug = AB; } catch {}
  // Prefetch the NEIGHBOURING tracks' files into the HTTP cache in the
  // background so a click on them starts instantly (the preview proxy is
  // slow on first fetch — the ~3s the user saw). Only our own /uploads/
  // files are warmed; blobs/data URIs/remote URLs are skipped.
  const _warming = new Set();
  function warmTrack(url){
    try {
      if (!url || _warming.has(url)) return;
      const s = String(url);
      if (s.startsWith('blob:') || s.startsWith('data:')) return;
      if (/^https?:/.test(s) && !s.startsWith(location.origin + '/uploads/')) return;
      _warming.add(s);
      fetch(s, { cache: 'force-cache' }).then(r => r.ok ? r.blob() : null).catch(() => null).finally(() => _warming.delete(s));
    } catch {}
  }
  function warmSurroundingTracks(){
    const n = demoPlaylist.length;
    if (!n) return;
    for (const d of [1, -1]){
      const i = (state.currentIndex + d + n) % n;
      const t = demoPlaylist[i];
      if (t) warmTrack(t.audio);
    }
  }

  // The user took control of the CURRENT track (seek/scrub/replay) while a
  // crossfade was running or armed. Kill the blend and silence the INCOMING
  // element so the next track can never keep playing over the current one.
  // The master (current track) is left untouched and keeps playing.
  function cancelCrossfade(){
    if (AB.blendRaf){ cancelAnimationFrame(AB.blendRaf); AB.blendRaf = null; }
    const other = (AB.cur === 'a') ? AB.b : AB.a;
    if (other){
      try { other.pause(); } catch {}
      try { other.volume = 0; } catch {}
    }
    AB.active = false;
    AB._blendNext = null;
    AB._preloadNext = null;
    AB.preloading = false;
  }

  // The main transition: called when the current track ends (or near end).
  // fade=0 -> hard gapless switch via the preloaded element.
  // fade>0 -> equal-power/equal-gain ramp starting `fade` seconds BEFORE
  //           the boundary (so it must be armed early via armCrossfade).
  // pick the next track index (same rules everywhere: shuffle / loop)
  function pickNextIndex(){
    if (demoPlaylist.length < 2) return null;
    let n;
    if (gs.shuffle){
      n = Math.floor(Math.random() * demoPlaylist.length);
      if (demoPlaylist.length > 1 && n === state.currentIndex) n = (n + 1) % demoPlaylist.length;
    } else {
      n = state.currentIndex + 1;
      if (gs.loop !== 'all' && n >= demoPlaylist.length) return null;   // loop off: stop at end
      n = n % demoPlaylist.length;
    }
    return n;
  }

  // Complete a handover to the preloaded (incoming) element. This is the
  // SINGLE place that re-points master/media handlers + UI, so gapless,
  // crossfade and the emergency path all behave identically.
  function abCompleteHandover(nextIdx, vol){
    const isABMaster = !!(state.master && state.master !== el.audio);
    const outEl = isABMaster ? (AB.cur === 'a' ? AB.a : AB.b) : el.audio;
    const inEl = (AB.cur === 'a') ? AB.b : AB.a;
    // CRITICAL: never read the volume from state.master here — during a
    // crossfade the OUTGOING element has been ramped to 0, so that would
    // hand the incoming track over at volume 0 (silent playhead). Use the
    // volume captured BEFORE the ramp (passed in) or the UI volume.
    if (typeof vol !== 'number' || !isFinite(vol) || vol < 0 || vol > 2){
      vol = getUIVolume() || 0.75;
    }
    try { outEl.pause(); } catch {}
    try { outEl.volume = 0; } catch {}
    inEl.volume = vol;
    abSwitchActive();
    abDetachOriginal();
    state.master = inEl;
    // DJ Phase 2: after a tempo-matched blend, the new master resumes its
    // own real tempo (Locked/Ramp stretched only during the overlap)
    try { inEl.playbackRate = (gs && gs.speed) || 1; } catch {}
    try { outEl.playbackRate = (gs && gs.speed) || 1; } catch {}
    detachMediaHandlers(outEl);
    attachMediaHandlers(inEl);
    AB.active = false;
    AB._blendNext = null;
    AB._preloadNext = null;
    state.currentIndex = nextIdx;
    renderPlaylist();
    updatePlayIcon();
    startRAF();
    const nt = demoPlaylist[nextIdx];
    if (nt){
      el.title.textContent = nt.title;
      el.artist.textContent = nt.artist;
      el.cover.src = (nt.cover || defaultCoverFromName(nt.title || 'Track'));
      el.cover.style.display = 'block'; el.coverVideo.style.display = 'none';
      el.player.classList.toggle('video-active', !!(nt && nt.video));
      // re-apply THIS track's saved cover/panel transforms (zoom + drag),
      // exactly as loadTrack does — otherwise the artwork would reset to
      // the default framing (the "zoom-out" the user saw)
      const tr = trackTransform(nt);
      let cs = tr.coverScale || 1;
      if (isIdentityTransform(tr)){
        const auto = computeCoverFillScale();
        if (auto) cs = auto;
      }
      setVarPx('--cover-dx', tr.coverDx || 0);
    setVarPx('--cinema-dx', ((nt && nt.cinemaTransform && nt.cinemaTransform.coverDx) || tr.coverDx || 0));
      setVarPx('--cover-dy', tr.coverDy || 0);
    setVarPx('--cinema-dy', ((nt && nt.cinemaTransform && nt.cinemaTransform.coverDy) || tr.coverDy || 0));
      setVarNum('--cover-scale', cs);
    setVarNum('--cinema-scale', ((nt && nt.cinemaTransform && nt.cinemaTransform.coverScale) || cs));
      // artwork backdrop: fresh per track (independent --art-* layer), fills the circle
      setVarPx('--art-dx', 0);
      setVarPx('--art-dy', 0);
      if (nt.video){
        if (el.cover.complete && el.cover.naturalWidth) maybeAutoFillArt();
        setTimeout(() => { if (demoPlaylist[state.currentIndex] === nt && nt.video) maybeAutoFillArt(); }, 800);
      } else {
        setVarNum('--art-scale', 1);
      }
      setVarPx('--panel-dx', tr.panelDx || 0);
      setVarPx('--panel-dy', tr.panelDy || 0);
      setVarNum('--panel-scale', tr.panelScale || 1);
      if (el.coverZoom) el.coverZoom.value = String(cs);
      if (el.coverZoomVal) el.coverZoomVal.textContent = cs.toFixed(2) + '×';
      if (el.panelZoom) el.panelZoom.value = String(tr.panelScale || 1);
      if (el.panelZoomVal) el.panelZoomVal.textContent = (tr.panelScale || 1).toFixed(2) + '×';
      // apply THIS track's colour theme. CRITICAL for the deployed player:
      // auto-advance goes through the crossfade (NOT loadTrack), and without
      // this the player kept the FIRST track's colours for the whole session.
      // Same precedence as loadTrack: per-track (or master) theme wins;
      // otherwise the DEPLOYED page derives one from this track's artwork
      // (cached) so the look changes with every track.
      const eff = effectiveTheme(nt);
      if (eff){
        applyWithTheme(eff);
      } else if (!isEditorPage() && nt && nt.cover){
        const cv = nt.cover;
        if (nt._derivedTheme && nt._derivedTheme._for === cv){
          applyWithTheme(nt._derivedTheme);
        } else {
          deriveThemeFromCover({ cover: cv }, nt && nt._paletteRole).then(theme => {
            if (demoPlaylist[state.currentIndex] !== nt) return;
            if (effectiveTheme(nt)) return;
            nt._derivedTheme = Object.assign({ _for: cv }, theme);
            applyWithTheme(theme);
          });
        }
      }
      applyPlBackdrop(nt);
      // visualiser transform: restore saved cinema/non-cinema framing independently
      { const vt = (nt && nt.vizTransform) || {}; const vct = (nt && nt.vizCinemaTransform) || {};
        setVarPx('--viz-dx', vt.dx || 0); setVarPx('--viz-dy', vt.dy || 0); setVarNum('--viz-scale', vt.scale || 1);
        setVarPx('--viz-cinema-dx', vct.dx != null ? vct.dx : (vt.dx || 0));
        setVarPx('--viz-cinema-dy', vct.dy != null ? vct.dy : (vt.dy || 0));
        setVarNum('--viz-cinema-scale', vct.scale != null ? vct.scale : (vt.scale || 1));
      }
      applyTrackViz(nt);
      // v103: the incoming track's OWN wave-panel image / blend / grey / tint
      applyPanelMedia(nt);
      updateEditingTrackBadge();
      updateMediaSession();
      savePlaylist();
    }
  }

  // Emergency completion: the outgoing track ENDED while a blend was in
  // flight (or the blend stalled). Snap the handover so playback NEVER stops.
  function completeBlendNow(){
    if (AB._blendNext === null){
      AB.active = false;
      return;
    }
    const nextIdx = AB._blendNext;
    if (AB.blendRaf){ cancelAnimationFrame(AB.blendRaf); AB.blendRaf = null; }
    const inEl = (AB.cur === 'a') ? AB.b : AB.a;
    if (inEl && inEl._lastSrc) inEl.play().catch(()=>{});
    abCompleteHandover(nextIdx);
  }

  function startTransition(nextIdx){
    const t = demoPlaylist[state.currentIndex];
    const next = demoPlaylist[nextIdx];
    if (!t || !next) return false;
    const tr = transitionFor(state.currentIndex);
    const fade = transitionSeconds(t, tr);
    const m = state.master || el.audio;
    const isABMaster = !!(state.master && state.master !== el.audio);
    const outEl = isABMaster ? (AB.cur === 'a' ? AB.a : AB.b) : el.audio;
    const inEl = (AB.cur === 'a') ? AB.b : AB.a;
    const vol = (m && m.volume) || getUIVolume() || 0.75;
    const ready = !!(inEl && inEl._lastSrc && String(inEl._lastSrc) === String(next.audio));
    AB._blendNext = nextIdx;
    if (fade <= 0){
      // TRUE GAPLESS: instant switch to the preloaded element
      if (!ready) return false;
      ensureABWired();
      inEl.volume = vol;
      inEl.play().catch(()=>{});
      abCompleteHandover(nextIdx, vol);
      return true;
    }
    // CROSSFADE: ramp the REAL outgoing element down, the incoming up
    if (!ready) return false;
    ensureABWired();
    AB.active = true;
    inEl.volume = 0;
    inEl.play().catch(() => {
      // incoming track failed to play (bad URL/format) — abort the blend
      // cleanly and fall back to a normal track load
      if (AB.blendRaf){ cancelAnimationFrame(AB.blendRaf); AB.blendRaf = null; }
      AB.active = false;
      try { outEl.volume = vol; } catch {}
      loadTrack(nextIdx, true);
    });
    // DJ Phase 2 — tempo mode: keep both decks at the same speed during the
    // blend. Locked = incoming time-stretched to the outgoing tempo; Ramp =
    // both glide outgoing -> incoming. Native preservesPitch (zero deps).
    // Auto-fallback to Instant when the gap is >12% or BPM unknown, so we
    // never produce nasty time-stretch artefacts.
    const outBPM = (t.bpm && t.bpm > 0) ? t.bpm : null;
    const inBPM = (next.bpm && next.bpm > 0) ? next.bpm : null;
    const tempoMode = tr.tempoMode || 'instant';
    const useTempo = tempoMode !== 'instant' && outBPM && inBPM && Math.abs(outBPM - inBPM) / inBPM <= 0.12;
    const speedMul = (gs && gs.speed) || 1;
    const inRatioLocked = (outBPM && inBPM) ? (outBPM / inBPM) : 1;
    if (useTempo){ setPreservesPitch(outEl, true); setPreservesPitch(inEl, true); }
    const t0 = performance.now();
    const myGen = AB.gen || 0;
    const step = () => {
      // a manual track click or load happened mid-blend — stop ramping
      if ((AB.gen || 0) !== myGen) return;
      const k = Math.min(1, (performance.now() - t0) / (fade * 1000));
      const g = crossfadeGains(k, tr.curve);
      try { outEl.volume = vol * g.a; } catch {}
      try { inEl.volume = vol * g.b; } catch {}
      if (useTempo){
        let outRate, inRate;
        if (tempoMode === 'ramp'){
          const tgt = outBPM + (inBPM - outBPM) * k;
          outRate = tgt / outBPM; inRate = tgt / inBPM;
        } else { outRate = 1; inRate = inRatioLocked; }
        try { outEl.playbackRate = outRate * speedMul; } catch {}
        try { inEl.playbackRate = inRate * speedMul; } catch {}
      }
      if (k < 1) AB.blendRaf = requestAnimationFrame(step);
      else { AB.blendRaf = null; abCompleteHandover(nextIdx, vol); }
    };
    step();
    return true;
  }

  // Called every timeupdate. PRELOADS the next track with margin, then
  // ARMS the crossfade when we're `fade` seconds from the end AND the
  // incoming element is ready. NEVER blocks the advance: if anything isn't
  // ready when the track is about to end, onEnded's safety net takes over.
  function armCrossfade(){
    if (!gs.transitionDefault && !demoPlaylist.some(t => t && t.transition)) return;
    const t = demoPlaylist[state.currentIndex];
    if (!t) return;
    const tr = transitionFor(state.currentIndex);
    const fade = transitionSeconds(t, tr);
    if (fade <= 0) return;                 // gapless: handled at 'ended'
    if (AB.active || AB.blendRaf) return;  // a blend is already running
    const m = state.master || el.audio;
    if (!isFinite(m.duration) || m.duration <= 0) return;
    if (m.paused) return;                  // never arm while paused
    // a track the user JUST clicked/loaded must play on its own: don't
    // crossfade it away until it has actually been playing for a while
    // (manual clicks of short tracks then simply advance at their natural
    // end instead of blending away mid-song)
    if (m.currentTime < 3) return;
    const remain = m.duration - m.currentTime;

    // PRELOAD phase: warm the next track with margin (12s), once per track
    if (AB._preloadNext === null && remain <= fade + 12){
      const n = pickNextIndex();
      if (n !== null && demoPlaylist[n]){
        AB._preloadNext = n;
        abPreload(demoPlaylist[n].audio);
      }
    }
    // ARM phase: start the ramp when close AND the incoming is ready.
    // DJ Phase 2 — with Snap on + a known outgoing BPM, the blend START is
    // nudged to the outgoing track's nearest bar line (a 4-beat boundary)
    // so the fade exits cleanly on a phrase. Falls back to the plain
    // "remain <= fade+0.35" trigger when snap is off / no BPM / no room.
    if (AB._preloadNext !== null){
      const n = AB._preloadNext;
      const inEl = (AB.cur === 'a') ? AB.b : AB.a;
      const ready = inEl && inEl._lastSrc && String(inEl._lastSrc) === String(demoPlaylist[n].audio);
      let armNow = (remain <= fade + 0.35);
      if (tr.snap && t.bpm > 0 && ready){
        const barLen = 4 * 60 / t.bpm;
        const off = (typeof t.bpmOffset === 'number') ? ((t.bpmOffset % barLen) + barLen) % barLen : 0;
        const lastOkStart = m.duration - fade - 0.15;
        let bs = off + Math.ceil((m.currentTime - off) / barLen) * barLen;
        if (bs < m.currentTime + 0.02) bs += barLen;
        if (bs <= lastOkStart){ AB._blendStart = bs; armNow = (m.currentTime >= bs - 0.05); }
        else { AB._blendStart = null; }
      } else { AB._blendStart = null; }
      if (ready && armNow){
        AB._preloadNext = null;
        AB.active = true;
        startTransition(n);
        return;
      }
      // preload not ready yet — if the track is ABOUT to end, never stall:
      // hard-switch to whatever we have, else plain loadTrack
      if (!ready && remain <= 0.3){
        AB._preloadNext = null;
        if (inEl && inEl._lastSrc){
          AB.active = true;
          if (!startTransition(n)){ AB.active = false; loadTrack(n, true); }
        } else {
          loadTrack(n, true);
        }
      }
    }
  }


  // ---- playback behaviours ----
  function skipTrack(dir){
    if (!demoPlaylist.length) return;
    const next = ((state.currentIndex + dir) % demoPlaylist.length + demoPlaylist.length) % demoPlaylist.length;
    loadTrack(next, true);
  }
  function applySpeed(){
    try { el.audio.playbackRate = gs.speed; } catch {}
    try { if (el.coverVideo) el.coverVideo.playbackRate = gs.speed; } catch {}
  }
  function applyBoost(){
    if (vizMasterGain) vizMasterGain.gain.value = clamp(gs.boost, 100, 200) / 100;
  }
  function applyDefaultVolume(){
    const m = state.master || el.audio;
    if (!m) return;
    try {
      m.volume = clamp(gs.volume / 100, 0, 1);
      if (el.volumeFill) el.volumeFill.style.width = gs.volume + '%';
      if (el.coverVideo && el.coverVideo !== m) el.coverVideo.volume = clamp(gs.volume / 100, 0, 1);
    } catch {}
  }
  function applySleepTimer(){
    if (gsSleepTimer){ clearTimeout(gsSleepTimer); gsSleepTimer = null; }
    if (gs.sleep > 0){
      gsSleepTimer = setTimeout(() => {
        gsSleepTimer = null;
        const m = state.master || el.audio;
        if (m) m.pause();
        setSyncStatus('Sleep timer: playback paused', true);
      }, gs.sleep * 60000);
    }
  }
  function saveResume(){
    if (!gs.resume) return;
    try {
      const m = state.master || el.audio;
      if (isFinite(m.duration) && m.currentTime > 5 && m.currentTime < (m.duration - 2)){
        const map = JSON.parse(localStorage.getItem(RESUME_KEY) || '{}');
        map[state.currentIndex] = m.currentTime;
        localStorage.setItem(RESUME_KEY, JSON.stringify(map));
      }
    } catch {}
  }
  function restoreResume(){
    if (!gs.resume) return;
    try {
      const map = JSON.parse(localStorage.getItem(RESUME_KEY) || '{}');
      const t = map[state.currentIndex];
      const m = state.master || el.audio;
      if (t > 5 && isFinite(m.duration) && t < m.duration - 2) m.currentTime = t;
    } catch {}
  }
  // Gapless: when the current track is within a few seconds of its end,
  // warm the NEXT track's URL in a hidden Audio element so the switch on
  // 'ended' is instant (the HTTP cache has it ready).
  function preloadNext(){
    if (!gs.gapless || demoPlaylist.length < 2) return;
    try {
      const m = state.master || el.audio;
      if (!isFinite(m.duration) || m.duration <= 0 || m.currentTime < m.duration - 5) return;
      if (window.__preloadNextUrl) return;
      const next = (state.currentIndex + 1) % demoPlaylist.length;
      const t2 = demoPlaylist[next];
      if (!t2 || !t2.audio || String(t2.audio).startsWith('blob:')) return;
      window.__preloadNextUrl = proxiedMediaUrl(t2.audio);
      const a = new Audio();
      a.preload = 'auto';
      a.src = proxiedMediaUrl(t2.audio);
      a.load();
    } catch {}
  }
  function fadeInAudio(el2, target, ms){
    if (!el2) return;
    try { el2.volume = 0; } catch {}
    const t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      try { el2.volume = target * k; } catch {}
      if (k < 1) requestAnimationFrame(step);
    };
    step();
  }

  // ---- media session (OS lock screen / media keys) ----
  function updateMediaSession(){
    if (!('mediaSession' in navigator)) return;
    try {
      if (!gs.mediaSession){
        navigator.mediaSession.metadata = null;
        ['play', 'pause', 'previoustrack', 'nexttrack', 'seekto'].forEach(a => {
          try { navigator.mediaSession.setActionHandler(a, null); } catch {}
        });
        return;
      }
      const t = demoPlaylist[state.currentIndex];
      const artwork = [];
      if (t && t.cover) artwork.push({ src: t.cover, sizes: '512x512', type: 'image/png' });
      navigator.mediaSession.metadata = new MediaMetadata({
        title: (t && t.title) || 'Round Player',
        artist: (t && t.artist) || '',
        artwork
      });
      navigator.mediaSession.setActionHandler('play', () => { const m = state.master || el.audio; m.play().catch(()=>{}); });
      navigator.mediaSession.setActionHandler('pause', () => { const m = state.master || el.audio; m.pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', () => skipTrack(-1));
      navigator.mediaSession.setActionHandler('nexttrack', () => skipTrack(1));
      navigator.mediaSession.setActionHandler('seekto', (d) => {
        if (d && isFinite(d.seekTime)){
          cancelCrossfade();
          const m = state.master || el.audio; m.currentTime = d.seekTime;
        }
      });
    } catch {}
  }
  function updateMediaSessionPosition(){
    if (!gs.mediaSession || !('mediaSession' in navigator)) return;
    if (++gsPosTick % 15 !== 0) return;   // ~once a second
    try {
      const m = state.master || el.audio;
      if (isFinite(m.duration) && m.duration > 0){
        navigator.mediaSession.setPositionState({ duration: m.duration, playbackRate: m.playbackRate || 1, position: m.currentTime });
      }
    } catch {}
  }

  function applyGlobalSettings(){
    applySpeed();
    applyBoost();
    applyDefaultVolume();
    updateMediaSession();
    applySleepTimer();
    if (gs.autoplay){
      setTimeout(() => { const m = state.master || el.audio; m.play().catch(()=>{}); }, 600);
    }
  }

  // ============== DJ PHASE 2: beat-engine helpers (TR-07/08/09) ==============
  let bpmCtx = null;
  function decodeForBpm(arr){
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return Promise.resolve(null);
    if (!bpmCtx){ try { bpmCtx = new AC(); } catch(e){ return Promise.resolve(null); } }
    return new Promise(res => {
      try {
        const p = bpmCtx.decodeAudioData(arr.slice(0), b => res(b), () => res(null));
        if (p && p.then) p.then(b => res(b), () => res(null));
      } catch(e){ res(null); }
    });
  }
  function setPreservesPitch(mediaEl, on){
    if (!mediaEl) return;
    try { mediaEl.preservesPitch = on; } catch {}
    try { mediaEl.mozPreservesPitch = on; } catch {}
    try { mediaEl.webkitPreservesPitch = on; } catch {}
  }
  // detect tempo + beat phase from a File; store on the track (auto on upload)
  function analyzeBpm(file, entry){
    if (!file || !entry || !window.BpmDetect) return;
    entry._bpmDetecting = true; renderPlaylistManager();
    setSyncStatus('Detecting tempo…', true);
    file.arrayBuffer().then(decodeForBpm).then(ab => {
      if (demoPlaylist.indexOf(entry) === -1) return;
      entry._bpmDetecting = false;
      if (!ab){ setSyncStatus('Could not decode audio for BPM — set it manually', false); renderPlaylistManager(); return; }
      const r = window.BpmDetect.analyze(ab);
      if (r && r.bpm){
        entry.bpm = r.bpm; entry.bpmConfidence = r.confidence || 0; entry.bpmOffset = r.offset || 0; entry.bpmSource = 'auto';
        if (demoPlaylist[state.currentIndex] === entry) updateBpmChip(entry);
        setSyncStatus('♩ ' + r.bpm + ' BPM detected' + (r.confidence < 0.4 ? ' (low confidence — try ½/×2 if wrong)' : ''), true);
      } else setSyncStatus('No clear tempo found — set BPM manually', false);
      state.playlistDirty = true; savePlaylist(); renderPlaylistManager();
    }).catch(() => { entry._bpmDetecting = false; renderPlaylistManager(); setSyncStatus('BPM detection failed', false); });
  }
  // re-detect from the track's current audio URL (server copy / blob)
  function redetectBpm(entry){
    if (!entry || !window.BpmDetect) return;
    const url = entry.audio || '';
    if (/^https?:/.test(url) && !url.startsWith(location.origin)){ setSyncStatus('Re-detect needs a local/uploaded file (remote URL is CORS-blocked)', false); return; }
    entry._bpmDetecting = true; renderPlaylistManager(); setSyncStatus('Re-detecting tempo…', true);
    fetch(url).then(r => r.arrayBuffer()).then(decodeForBpm).then(ab => {
      entry._bpmDetecting = false;
      if (ab){ const r = window.BpmDetect.analyze(ab); if (r && r.bpm){ entry.bpm = r.bpm; entry.bpmConfidence = r.confidence||0; entry.bpmOffset = r.offset||0; entry.bpmSource='auto'; setSyncStatus('♩ '+r.bpm+' BPM', true);} else setSyncStatus('No tempo found', false); }
      else setSyncStatus('Could not decode for re-detect', false);
      state.playlistDirty = true; savePlaylist(); renderPlaylistManager();
      if (demoPlaylist[state.currentIndex] === entry) updateBpmChip(entry);
    }).catch(() => { entry._bpmDetecting = false; renderPlaylistManager(); setSyncStatus('Re-detect failed (CORS?)', false); });
  }
  function setTrackBpm(entry, bpm, opts){
    opts = opts || {};
    if (!entry) return;
    if (bpm == null || !(bpm > 0)){ entry.bpm = null; entry.bpmConfidence = 0; entry.bpmOffset = 0; entry.bpmSource = null; }
    else {
      while (bpm < 40) bpm *= 2; while (bpm > 220) bpm /= 2;
      entry.bpm = Math.round(bpm * 10) / 10;
      if (opts.source) entry.bpmSource = opts.source;
      if (!entry.bpmConfidence) entry.bpmConfidence = 0;
    }
    state.playlistDirty = true; savePlaylist(); renderPlaylistManager();
    if (demoPlaylist[state.currentIndex] === entry) updateBpmChip(entry);
  }
  // ♩BPM chip in the player's info area (deployed + editor)
  function updateBpmChip(t){
    // BPM chip removed from the main player by request — tempo is shown only
    // in the Playlist Manager. Kept as a safe no-op so callers don't break.
    const chip = document.getElementById('bpmChip'); if (chip) chip.remove();
    el.player.classList.remove('has-bpm');
  }
  // ---- beat pulse: GROOVES with the music. A real-time kick ONSET (the sharp
  // ---- rise in the bass band on each drum hit) snaps a musical swell on the
  // ---- ACTUAL beat you hear. The detected BPM supplies the refractory (so it
  // ---- fires once per beat, never on rolls/noise) and the swell decay time.
  // ---- Result: the artwork pulses right on the kick — locked in, rhythmic,
  // ---- and it rests when the drums stop. (BPM absent -> learns tempo from kicks.)
  let beatPulseRaf = null;
  let _gpFreq = null;
  let _gpBass = 0, _gpPrevBass = 0, _gpFluxBase = 0;
  let _gpLast = -10, _gpBeat = 0.5, _gpBpmKnown = false;
  let _gpEnv = 0, _gpActive = 0, _gpPrevTime = 0;
  function applyBeatPulseStrength(){
    const s = clamp(gs.beatPulseStrength != null ? gs.beatPulseStrength : 35, 0, 100) / 100;
    el.player.style.setProperty('--beat-pulse-max', String(0.02 + s * 0.06));    // 2%-8% scale
    el.player.style.setProperty('--beat-flash-max', String(0.04 + s * 0.16));    // 4%-20% warmth
  }
  function beatPulseLoop(){
    beatPulseRaf = null;
    const t = demoPlaylist[state.currentIndex];
    const m = state.master || el.audio;
    const enabled = gs.beatPulse !== false && t && m && !m.paused;
    if (enabled){
      const a = ensureVizGraph();               // shared analyser (created on first play)
      if (a){
        if (!_gpFreq || _gpFreq.length !== a.frequencyBinCount) _gpFreq = new Uint8Array(a.frequencyBinCount);
        a.getByteFrequencyData(_gpFreq);
        // KICK-band energy (low bins ~80-430 Hz)
        const hi = Math.max(2, Math.min(5, _gpFreq.length));
        let sum = 0; for (let i = 1; i < hi; i++) sum += _gpFreq[i];
        const bass = (sum / (hi - 1)) / 255;
        _gpBass += (bass - _gpBass) * 0.4;                    // light smoothing (low lag)
        // onset = the positive RISE of the smoothed bass = a kick transient
        const flux = _gpBass > _gpPrevBass ? (_gpBass - _gpPrevBass) : 0;
        _gpPrevBass = _gpBass;
        _gpFluxBase += (flux - _gpFluxBase) * 0.02;           // adaptive onset baseline
        if (t.bpm > 0){ _gpBeat = 60 / t.bpm; _gpBpmKnown = true; }   // BPM -> beat period
        const now = m.currentTime;
        let dt = now - _gpPrevTime; if (dt <= 0 || dt > 0.5) dt = 1/60;
        _gpPrevTime = now;
        const sinceLast = now - _gpLast;
        const thr = _gpFluxBase * 2.0 + 0.008;                // onset must clear ~2x baseline
        // TRIGGER on a real kick onset, with a refractory (~60% of a beat) so we
        // fire ONCE per beat on the actual hit (not on rolls / ghost notes)
        if (flux > thr && _gpBass > 0.05 && sinceLast > _gpBeat * 0.6){
          _gpLast = now;
          _gpEnv = 1;                                         // snap the swell onto the beat
          _gpActive = 1;
          if (!_gpBpmKnown && sinceLast < 2.0 && sinceLast > 0.2){
            _gpBeat = _gpBeat * 0.7 + sinceLast * 0.3;        // learn tempo from the kicks
          }
        }
        // musical swell decay (time-constant ~45% of the beat)
        _gpEnv *= Math.exp(-dt / Math.max(0.05, _gpBeat * 0.45));
        // rest if no kick for ~2.2s (breakdowns / quiet / end of track)
        const targetActive = (now - _gpLast) < 2.2 ? 1 : 0;
        _gpActive += (targetActive - _gpActive) * 0.05;
        const e = _gpEnv * _gpActive;
        const max = parseFloat(getComputedStyle(el.player).getPropertyValue('--beat-pulse-max')) || 0.05;
        const fmax = parseFloat(getComputedStyle(el.player).getPropertyValue('--beat-flash-max')) || 0.12;
        el.player.style.setProperty('--beat-pulse', String(1 + e * max));
        el.player.style.setProperty('--beat-flash', String(1 + e * fmax));
      } else {
        el.player.style.setProperty('--beat-pulse', '1');
        el.player.style.setProperty('--beat-flash', '1');
      }
    } else {
      // not playing / disabled -> ease to still; reset so it snaps on resume
      _gpEnv *= 0.9; _gpActive *= 0.9;
      el.player.style.setProperty('--beat-pulse', '1');
      el.player.style.setProperty('--beat-flash', '1');
    }
    beatPulseRaf = requestAnimationFrame(beatPulseLoop);
  }

  // ---- cinema / immersive video mode ----
  // A video that is playing hides the control surface (panel + icons + buttons +
  // text) when the mouse leaves the player, keeping only the scrubber + playhead,
  // and fills the circle. Mouse onto the MAIN area brings controls back; hovering
  // the scrubber keeps them hidden so you can scrub in peace. Pause shows controls.
  let _cinemaMouseOver = false;
  let _cinemaArmed = false;   // Entry S30: cinema auto-engage only after the user has hovered the player since the last track load
  let _cinemaRevealT = null;   // dwell timer: reveal controls only after hovering the wave-panel band
  function videoMediaActive(){
    return !!(el.coverVideo && el.coverVideo.src && el.coverVideo.style.display !== 'none');
  }
  // Cinema is meaningful whenever there is something immersive to look at:
  // a video, the cover artwork, or an active visualiser (in-circle or edge).
  function cinemaContentActive(){
    if (videoMediaActive()) return true;
    if (el.cover && el.cover.src && el.cover.style.display !== 'none') return true;
    if (viz.mode && viz.mode !== 'off') return true;
    if (viz.edgeMode && viz.edgeMode !== 'off') return true;
    return false;
  }
  // Single source of truth for the .video-active class. That class is what
  // switches the cover <img> from sharing the video's --cover-* transform
  // (base rule) to its OWN --art-* transform (the .video-active rule) so the
  // artwork backdrop and the video can be repositioned INDEPENDENTLY.
  // Track-TYPE is the right signal (not the video element's transient
  // display state): it stays stable while src/display flip during load /
  // upload / crossfade handover, so the cover never flickers between
  // backdrop-mode and main-mode. A MutationObserver (see init) re-derives it
  // whenever the video element mutates — fixing every path at once, including
  // the upload paths that previously forgot to set the class.
  function syncVideoActive(){
    const t = demoPlaylist[state.currentIndex];
    el.player.classList.toggle('video-active', !!(t && t.video));
  }
  function cinemaStyleForTrack(){
    const t = demoPlaylist[state.currentIndex];
    if (t && t.cinemaStyle === 'head') return 'head';
    return 'bar';
  }
  function engageCinema(on){
    // Only toggle the .cinema class (controls visibility). NO transform swap — the
    // swap was fragile (corrupted values across toggles, Math.max blocked zoom-out).
    // The video uses one set of vars (--cover-*) in both states. Repositioning/zoom
    // persists via persistCoverTransform (called by the drag handlers + onUp).
    if (on){
      el.player.classList.add('cinema');
      el.player.classList.toggle('head-only', cinemaStyleForTrack() === 'head');
    } else {
      el.player.classList.remove('cinema', 'head-only');
    }
  }
  function cinemaOnPlay(){
    // Engage cinema for ANY video track while playing (the video plays muted as a
    // visual even when the audio master is the MP3), so auto-hide + the progress-bar
    // style actually engage. The previous `state.master === el.coverVideo` gate meant
    // cinema never engaged for MP3-audio video tracks.
    if (cinemaContentActive() && cinemaEnabledForTrack() && !_cinemaMouseOver) engageCinema(true);
  }
  function cinemaEnabledForTrack(){
    // Entry S30: cinema is PER-TRACK ONLY. A track loads non-cinema and stays
    // non-cinema unless its own cinema checkbox is ticked (t.cinema === true).
    const t = demoPlaylist[state.currentIndex];
    return !!(t && t.cinema === true);
  }
  function attachCinema(){
    // Cinema control-reveal is progress-bar gated. Controls appear only when the
    // pointer reaches the progress bar (.seeker) at the bottom; hovering the video
    // keeps cinema on. While actively SCRUBBING (state.dragging) the controls stay
    // hidden so you can drag the playhead in peace. Leaving the player re-engages
    // cinema (if enabled + video playing).
    el.player.addEventListener('mouseenter', () => { _cinemaMouseOver = true; });
    el.player.addEventListener('mousemove', (e) => {
      if (state._videoDragActive) return;
      if (!el.player.classList.contains('cinema')) return;
      if (state.dragging){ clearTimeout(_cinemaRevealT); _cinemaRevealT = null; engageCinema(true); return; }
      const rr = el.player.getBoundingClientRect();
      if (e.clientY < rr.top + rr.height * 0.55){
        clearTimeout(_cinemaRevealT); _cinemaRevealT = null;
        return;
      }
      if (e.target && e.target.closest && e.target.closest('.knob-overlay, .arc-knob')){
        clearTimeout(_cinemaRevealT); _cinemaRevealT = null;
        return;
      }
      if (!_cinemaRevealT) _cinemaRevealT = setTimeout(() => { _cinemaRevealT = null; engageCinema(false); }, 250);
    });
    el.player.addEventListener('mouseleave', () => {
      _cinemaMouseOver = false;
      clearTimeout(_cinemaRevealT); _cinemaRevealT = null;
      // Re-hide controls on mouse-off whenever cinema is enabled + there is
      // immersive content — including visualisers (Milkdrop/coaster animate
      // even when audio is paused), not only while a track is playing.
      if (cinemaContentActive() && cinemaEnabledForTrack()) engageCinema(true);
    });
  }

  // ---- direct video framing: drag to reposition, wheel to zoom the video while the
  // ---- control panel is out (cinema off). Uses the same --cover-* vars as the editor
  // ---- Reposition tool, so framing is consistent and persists per track.
  function persistCoverTransform(){
    const t = demoPlaylist[state.currentIndex];
    if (!t) return;
    const vars = {
      coverDx: getVarNum(coverVar('dx')), coverDy: getVarNum(coverVar('dy')), coverScale: getVarNum(coverVar('scale'), 1)
    };
    if (el.player.classList.contains('cinema')){ t.cinemaTransform = vars; }
    else { t.transform = Object.assign({}, t.transform || {}, vars); }
    state.playlistDirty = true; savePlaylist();
  }
  // Persist the ARTWORK (cover image) transform — independent cinema/non-cinema.
  function persistArtTransform(){
    const t = demoPlaylist[state.currentIndex];
    if (!t) return;
    const vars = { artDx: getVarNum(artVar('dx')), artDy: getVarNum(artVar('dy')), artScale: getVarNum(artVar('scale'), 1) };
    if (el.player.classList.contains('cinema')){ t.cinemaArtTransform = vars; }
    else if (el.player.classList.contains('video-active')){ t.artTransform = Object.assign({}, t.artTransform || {}, vars); }
    else { t.transform = Object.assign({}, t.transform || {}, vars); }
    state.playlistDirty = true; savePlaylist();
  }
  // Save the visualiser transform (position + scale) to the current track.
  // Cinema saves to t.vizCinemaTransform, non-cinema to t.vizTransform.
  function persistVizTransform(){
    const t = demoPlaylist[state.currentIndex]; if (!t) return;
    const vars = { dx: getVarNum(vizVar('dx')), dy: getVarNum(vizVar('dy')), scale: getVarNum(vizVar('scale'), 1) };
    if (el.player.classList.contains('cinema')){ t.vizCinemaTransform = vars; }
    else { t.vizTransform = vars; }
    state.playlistDirty = true; savePlaylist();
  }
  function attachVideoFraming(){
    if (!isEditorPage()) return;            // editor/backend only — never on the deployed view
    const v = el.coverVideo;
    if (!v) return;
    try { v.draggable = false; } catch {}   // stop the browser's native video drag
    const player = el.player;
    let dragging = false, sx = 0, sy = 0, sdx = 0, sdy = 0, wheelTimer = null;
    const framable = () => videoMediaActive() && !state.dragMode;   // works in cinema AND panel-out
    // don't hijack clicks on the real controls (play / scrub / icons / volume / playhead)
    const onControl = (tgt) => !!(tgt && tgt.closest && (tgt.closest('.controls') || tgt.closest('.seeker') || tgt.closest('a') || tgt.closest('.volume-level') || tgt.closest('.info') || tgt.closest('.knob-overlay')));
    player.addEventListener('pointerdown', (e) => {
      if (!framable() || onControl(e.target)) return;
      dragging = true; state._videoDragActive = true; sx = e.clientX; sy = e.clientY;
      sdx = getVarNum(coverVar('dx')); sdy = getVarNum(coverVar('dy'));
      try { player.setPointerCapture(e.pointerId); } catch {}
      e.preventDefault();
    });
    player.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      setVarPx(coverVar('dx'), sdx + (e.clientX - sx));
      setVarPx(coverVar('dy'), sdy + (e.clientY - sy));
    });
    const end = (e) => {
      if (!dragging) return;
      dragging = false; state._videoDragActive = false;
      try { player.releasePointerCapture(e.pointerId); } catch {}
      persistCoverTransform();
    };
    player.addEventListener('pointerup', end);
    player.addEventListener('pointercancel', end);
    player.addEventListener('wheel', (e) => {
      if (!framable() || onControl(e.target)) return;
      e.preventDefault();
      const s = clamp(getVarNum(coverVar('scale'), 1) + (-e.deltaY * 0.0015), 0.5, 5);
      setVarNum(coverVar('scale'), s);
      if (el.coverZoom) el.coverZoom.value = String(s);
      if (el.coverZoomVal) el.coverZoomVal.textContent = s.toFixed(2) + '×';
      clearTimeout(wheelTimer); wheelTimer = setTimeout(persistCoverTransform, 250);
    }, { passive: false });
  }

  // ---- Global tab UI (dev page) ----



  function gsSyncUI(){
    const g = id => document.getElementById(id);
    const setChk = (id, val) => { const e = g(id); if (e) e.checked = !!val; };
    const setSel = (id, val) => { const e = g(id); if (e) e.value = val; };
    setChk('gsAutoplay', gs.autoplay);
    setSel('gsLoop', gs.loop);
    setChk('gsShuffle', gs.shuffle);
    setChk('gsGapless', gs.gapless);
    setChk('gsFade', gs.fade);
    const tf = g('gsTransFade');
    if (tf) tf.value = (gs.transitionDefault && gs.transitionDefault.fade) || 0;
    const tfv = g('gsTransFadeVal');
    if (tfv) tfv.textContent = ((gs.transitionDefault && gs.transitionDefault.fade) || 0) + 's' + (((gs.transitionDefault && gs.transitionDefault.fade) || 0) === 0 ? ' (gapless)' : '');
    const tc = g('gsTransCurve');
    if (tc) tc.value = (gs.transitionDefault && gs.transitionDefault.curve) || 'equal-power';
    setSel('gsTransTempo', (gs.transitionDefault && gs.transitionDefault.tempoMode) || 'instant');
    setChk('gsTransSnap', !!(gs.transitionDefault && gs.transitionDefault.snap));
    setChk('gsBeatPulse', gs.beatPulse !== false);
    const bps = g('gsBeatPulseStrength'); if (bps) bps.value = gs.beatPulseStrength != null ? gs.beatPulseStrength : 35;
    const bpsv = g('gsBeatPulseStrengthVal'); if (bpsv) bpsv.textContent = (gs.beatPulseStrength != null ? gs.beatPulseStrength : 35) + '%';
    setSel('gsSpeed', String(gs.speed));
    const boost = g('gsBoost'); if (boost) boost.value = gs.boost;
    const bv = g('gsBoostVal'); if (bv) bv.textContent = gs.boost + '%';
    setChk('gsResume', gs.resume);
    setSel('gsSleep', String(gs.sleep));
    setChk('gsMediaSession', gs.mediaSession);
    setChk('gsCinema', gs.cinema !== false);
    setChk('gsPlCinema', gs.plCinema !== false);
    setSel('gsCinemaStyle', gs.cinemaStyle || 'bar');
    const vol = g('gsVolume'); if (vol) vol.value = gs.volume;
    const vv = g('gsVolumeVal'); if (vv) vv.textContent = gs.volume + '%';
  }
  function onGlobalChanged(key){
    const g = id => document.getElementById(id);
    switch (key){
      case 'speed': applySpeed(); break;
      case 'boost': applyBoost(); break;
      case 'volume': applyDefaultVolume(); break;
      case 'sleep': applySleepTimer(); break;
      case 'mediaSession': updateMediaSession(); break;
      default: break;
    }
    const st = g('globalStatus');
    if (st) st.textContent = 'Global setting saved ✓ — ' + key;
    setSyncStatus('Global: ' + key + ' saved', true);
  }
  function attachGlobalUI(){
    if (!document.getElementById('gsAutoplay')) return;   // dev page only
    const g = id => document.getElementById(id);
    const bindChk = (id, key) => { const e = g(id); if (e) e.addEventListener('change', () => { gs[key] = e.checked; gsSave(); onGlobalChanged(key); }); };
    const bindSel = (id, key, parse) => { const e = g(id); if (e) e.addEventListener('change', () => { gs[key] = parse ? parse(e.value) : e.value; gsSave(); onGlobalChanged(key); }); };
    const bindRange = (id, valId, key, suffix) => { const e = g(id); if (e) e.addEventListener('input', () => { gs[key] = +e.value; const v = g(valId); if (v) v.textContent = gs[key] + suffix; gsSave(); onGlobalChanged(key); }); };
    bindChk('gsAutoplay', 'autoplay');
    bindSel('gsLoop', 'loop');
    bindChk('gsShuffle', 'shuffle');
    bindChk('gsGapless', 'gapless');
    bindChk('gsFade', 'fade');
    const transFade = g('gsTransFade');
    if (transFade){
      transFade.addEventListener('input', () => {
        gs.transitionDefault = gs.transitionDefault || { fade: 0, curve: 'equal-power', beats: 0 };
        gs.transitionDefault.fade = +transFade.value;
        const v = g('gsTransFadeVal'); if (v) v.textContent = transFade.value + 's' + (transFade.value === '0' ? ' (gapless)' : '');
        gsSave(); onGlobalChanged('transitionDefault');
      });
    }
    const transCurve = g('gsTransCurve');
    if (transCurve){
      transCurve.addEventListener('change', () => {
        gs.transitionDefault = gs.transitionDefault || { fade: 0, curve: 'equal-power', beats: 0 };
        gs.transitionDefault.curve = transCurve.value;
        gsSave(); onGlobalChanged('transitionDefault');
      });
    }
    const transTempo = g('gsTransTempo');
    if (transTempo) transTempo.addEventListener('change', () => {
      gs.transitionDefault = gs.transitionDefault || { fade: 0, curve: 'equal-power', beats: 0 };
      gs.transitionDefault.tempoMode = transTempo.value;
      gsSave(); onGlobalChanged('transitionDefault');
    });
    const transSnap = g('gsTransSnap');
    if (transSnap) transSnap.addEventListener('change', () => {
      gs.transitionDefault = gs.transitionDefault || { fade: 0, curve: 'equal-power', beats: 0 };
      gs.transitionDefault.snap = !!transSnap.checked;
      gsSave(); onGlobalChanged('transitionDefault');
    });
    bindChk('gsBeatPulse', 'beatPulse');
    const bps = g('gsBeatPulseStrength');
    if (bps) bps.addEventListener('input', () => {
      gs.beatPulseStrength = +bps.value;
      const v = g('gsBeatPulseStrengthVal'); if (v) v.textContent = gs.beatPulseStrength + '%';
      gsSave(); applyBeatPulseStrength();
    });
    bindSel('gsSpeed', 'speed', parseFloat);
    bindRange('gsBoost', 'gsBoostVal', 'boost', '%');
    bindChk('gsResume', 'resume');
    bindSel('gsSleep', 'sleep', parseInt);
    bindChk('gsMediaSession', 'mediaSession');
    const gsCinemaEl = g('gsCinema');
    if (gsCinemaEl) gsCinemaEl.addEventListener('change', () => {
      gs.cinema = !!gsCinemaEl.checked;
      gsSave();
      // Engage IMMEDIATELY when enabled (with immersive content) — not only on
      // the next play/mouse-off. Disengage when disabled.
      if (gs.cinema) { /* cinema is per-track; global toggle is just a default preference */ }
      else engageCinema(false);
    });
    const gsPlCinemaEl = g('gsPlCinema');
    if (gsPlCinemaEl) gsPlCinemaEl.addEventListener('change', () => {
      gs.plCinema = !!gsPlCinemaEl.checked;
      gsSave();
      const plCircle = document.getElementById('playlistCircle');
      if (!gs.plCinema && plCircle) plCircle.classList.remove('pl-cinema');
    });
    const gsCinemaStyleEl = g('gsCinemaStyle');
    if (gsCinemaStyleEl) gsCinemaStyleEl.addEventListener('change', () => {
      gs.cinemaStyle = gsCinemaStyleEl.value || 'bar';
      const t = demoPlaylist[state.currentIndex];
      if (t){ t.cinemaStyle = gs.cinemaStyle; state.playlistDirty = true; savePlaylist(); }  // apply to current track too
      gsSave();
      if (el.player.classList.contains('cinema')) engageCinema(true);   // re-apply the look
    });
    bindRange('gsVolume', 'gsVolumeVal', 'volume', '%');
    const reset = g('btnGlobalReset');
    if (reset) reset.addEventListener('click', () => {
      if (!confirm('Reset ALL settings (themes, playlist, visualiser, global)?')) return;
      [STORAGE_KEY, STORAGE_KEY + '.master', STORAGE_KEY + '.masterOn', LS_KEY, VIZ_KEY, GLOBAL_KEY, RESUME_KEY].forEach(k => { try { localStorage.removeItem(k); } catch {} });
      fetchWithTimeout('/api/theme', { method: 'DELETE' }, 5000).catch(()=>{});
      location.reload();
    });
  }

  // ===================== VISUALISER ENGINE =====================
  // Config lives in localStorage (roundPlayer.visualizer.v1) and is shipped
  // to the deployed page via the server theme (viz object in theme.json).
  const VIZ_KEY = 'roundPlayer.visualizer.v1';
  let viz = {
    mode: 'off',          // off | bars | radial | waveform | starfield | plasma
    sensitivity: 100,     // %
    smoothing: 0.82,
    opacity: 0.85,
    bars: 32,
    fft: 512,
    colors: 'theme',      // theme | rainbow | mono | custom
    customColors: ['#ffffff', '#ff2992', '#29d5ff'],  // starfield "custom" 3-colour set
    artwork: true,
    starSize: 2,          // starfield: star-size multiplier (1×–8×)
        fog: 0,               // coaster: black-fog background amount (0–100%)
    edgeMode: 'off',      // EDGE/RIM visualiser (pulses around the disc): off | edge-bars | edge-mirror | edge-bass | edge-ripple | edge-polar | edge-rings | edge-orbit | edge-blocks
    edgeReach: 35,        // edge: how far outward the rim pulses (0–100% of available room)
    edgeSensitivity: 100, // edge: independent sensitivity
    edgeSmoothing: 0.82,  // edge: independent smoothing (own analyser)
    edgeOpacity: 0.85,    // edge: independent opacity
    edgeBars: 48,         // edge: independent bar count
    edgeColors: 'theme',  // edge colours: theme(match player) | rainbow | mono | custom(individual)
    edgeCustomColors: ['#ffffff', '#ff2992', '#29d5ff'],  // edge custom 3-colour set
    plMode: 'off',           // PLAYLIST visualiser mode (independent from main): off | bars | radial | waveform | starfield | plasma | milkdrop | coaster
    plOpacity: 0.85,         // playlist visualiser opacity
    plMirror: false,         // mirror the main player's viz BEHIND the PL viz
    plMilkdropPreset: null,  // PL milkdrop: saved preset name
    plMilkdropAuto: true,    // PL milkdrop: auto-cycle presets every ~20s
    plSensitivity: 100, plSmoothing: 0.82, plBars: 32, plColors: 'theme',
    plEdgeMode: 'off',           // PLAYLIST edge/rim visualiser (wraps the playlist disc): off | edge-bars | ... (independent from the main edge)
    plEdgeReach: 35,             // PL edge: how far outward the rim pulses (0–100%)
    plEdgeSensitivity: 100,      // PL edge: independent sensitivity
    plEdgeSmoothing: 0.82,       // PL edge: independent smoothing (own analyser)
    plEdgeOpacity: 0.85,         // PL edge: independent opacity
    plEdgeBars: 48,              // PL edge: independent bar count
    plEdgeColors: 'theme',       // PL edge colours: theme | rainbow | mono | custom
    plEdgeCustomColors: ['#ffffff', '#ff2992', '#29d5ff'],  // PL edge custom 3-colour set
    plFog: 0,                    // PL coaster: black-fog background amount (0–100%)
    vizBlend: false,             // MAIN visualiser blend over cover art/video (on/off)
    vizBlendMode: 'overlay',     // MAIN blend mode (CSS mix-blend-mode): normal|multiply|screen|overlay|...
    vizBlendStrength: 1,         // MAIN blend amount (0-1) = how strongly the blend shows
    plVizBlend: false,           // PLAYLIST visualiser blend over the panel backdrop (on/off)
    plVizBlendMode: 'overlay',   // PLAYLIST blend mode
    plVizBlendStrength: 1,       // PLAYLIST blend amount (0-1)
    mdDecay: 0, mdZoom: 1, mdWarp: 1, mdSensitivity: 1, mdTint: 0, mdQuality: 1,
    plMdDecay: 0, plMdZoom: 1, plMdWarp: 1, plMdSensitivity: 1, plMdTint: 0, plMdQuality: 1
  };
  let vizAudioCtx = null, vizAnalyser = null, vizAudioSrc = null, vizVideoSrc = null, vizMasterGain = null;
  let vizFreq = null, vizWave = null, vizRAF = null, vizStars = null;
  // EDGE/RIM visualiser state (independent layer that wraps the disc)
  let vizEdgeRAF = null, vizEdgeRipples = [], vizEdgeParticles = null, edgeBassAvg = 0.5, elEdge = null;
  let edgeAnalyser = null, vizEdgeFreq = null;
  let plVizCanvas = null, plVizRAF = null;   // edge has its OWN analyser -> independent smoothing
  const EDGE_BOX = 1.7;   // edge canvas = this many x the disc (room for outward spikes)
  // PLAYLIST 3D rollercoaster instance (Entry S21) — independent from the main
  // window.RoundViz3D. Created lazily when plMode === 'coaster'.
  let plCoasterInst = null, plCoasterRAF = null;
  // PLAYLIST edge / rim visualiser state (independent layer that wraps the playlist disc)
  let elPlEdge = null, plEdgeRAF = null, plEdgeFreq = null, plEdgeAnalyser = null;
  let plEdgeRipples = [], plEdgeParticles = null;
  let _plEdgeBass = 0, _plEdgePrevBass = 0, _plEdgeFluxBase = 0, _plEdgeLastSpawn = -10, _plEdgeLastSeenBeat = -10, _plEdgeBeatPeriod = 0.5;

  const markVizPicked = () => {
    state.vizUserPicked = true;
    try { localStorage.setItem(VIZ_KEY + '.picked', '1'); } catch {}
  };
  const vizLoad = () => {
    // v103: did the USER pick a visualiser (marker set), or was the saved
    // config only SEEDED from the server? Only a real pick earns the right
    // to show on the editor at boot.
    try { state.vizUserPicked = localStorage.getItem(VIZ_KEY + '.picked') === '1'; } catch { state.vizUserPicked = false; }
    try { const s = JSON.parse(localStorage.getItem(VIZ_KEY) || 'null'); if (s) viz = Object.assign(viz, s); } catch {}
    if (!isEditorPage() && viz.mode !== 'off' && window.__serverViz && localStorage.getItem(VIZ_KEY) === null){
      // fresh browser: inherit the visualiser saved with the deployed theme
      viz = Object.assign(viz, window.__serverViz || {});
      try { localStorage.setItem(VIZ_KEY, JSON.stringify(viz)); } catch {}
    }
    state.globalViz = JSON.parse(JSON.stringify(viz));
  };
  const vizSave = () => {
    try { localStorage.setItem(VIZ_KEY, JSON.stringify(viz)); } catch {}
    // global edits (mode/sliders/off/artwork/fog...) update the GLOBAL
    // snapshot — per-track configs applied via applyTrackViz never call
    // vizSave, so they can't pollute it.
    state.globalViz = JSON.parse(JSON.stringify(viz));
    // v106: preference tweaks made while a per-track config is ACTIVE update
    // that track's saved config — the visualiser AND its preferences affect
    // only the selected track.
    if (isEditorPage()){
      const t = demoPlaylist[state.currentIndex];
      const tv = t && trackVizConfig(t);
      if (tv && tv.on !== false){
        Object.assign(t.viz, {
          mode: viz.mode, sensitivity: viz.sensitivity, smoothing: viz.smoothing,
          opacity: viz.opacity, bars: viz.bars, fft: viz.fft, colors: viz.colors,
          customColors: viz.customColors ? viz.customColors.slice() : undefined,
          artwork: viz.artwork, starSize: viz.starSize, fog: viz.fog
        });
        state.playlistDirty = true;
        try { savePlaylist(); } catch {}
      }
    }
    scheduleAutoSave();   // Entry S28: autosave the full look (colours + viz + framing) as you go
  };
  const VIZ_DEFAULTS = {
    mode: 'off', sensitivity: 100, smoothing: 0.82, opacity: 0.85,
    bars: 32, fft: 512, colors: 'theme', customColors: ['#ffffff', '#ff2992', '#29d5ff'], artwork: true, starSize: 2, fog: 0,
    edgeMode: 'off', edgeReach: 35,
    edgeSensitivity: 100, edgeSmoothing: 0.82, edgeOpacity: 0.85, edgeBars: 48,
    edgeColors: 'theme', edgeCustomColors: ['#ffffff', '#ff2992', '#29d5ff'],
    plMode: 'off', plOpacity: 0.85, plMirror: false, plMilkdropPreset: null, plMilkdropAuto: true,
    plSensitivity: 100, plSmoothing: 0.82, plBars: 32, plColors: 'theme',
    plEdgeMode: 'off', plEdgeReach: 35,
    plEdgeSensitivity: 100, plEdgeSmoothing: 0.82, plEdgeOpacity: 0.85, plEdgeBars: 48,
    plEdgeColors: 'theme', plEdgeCustomColors: ['#ffffff', '#ff2992', '#29d5ff'],
    plFog: 0,
    vizBlend: false, vizBlendMode: 'overlay', vizBlendStrength: 1,
    plVizBlend: false, plVizBlendMode: 'overlay', plVizBlendStrength: 1,
    mdDecay: 0, mdZoom: 1, mdWarp: 1, mdSensitivity: 1, mdTint: 0, mdQuality: 1,
    plMdDecay: 0, plMdZoom: 1, plMdWarp: 1, plMdSensitivity: 1, plMdTint: 0, plMdQuality: 1
  };

  // Per-track visualiser: each track may carry its own viz config
  // ({ on, mode, sensitivity, ... }). Tracks without one use the global
  // settings. This is what makes every track's look fully unique.
  function trackVizConfig(t){
    return (t && t.viz && typeof t.viz === 'object') ? t.viz : null;
  }

  function applyTrackViz(t){
    const tv = trackVizConfig(t);
    if (tv){
      // per-track config is authoritative; the 'on' flag toggles the whole
      // visualiser for this track (false = force off)
      viz = Object.assign({}, VIZ_DEFAULTS, tv);
      if (tv.on === false) viz.mode = 'off';
    } else {
      // v106: on the EDITOR the visualiser is PER-TRACK ONLY — a track
      // without its own saved config NEVER shows one (fixes the bleed where
      // toggling a viz on one track lit up every track below it via the
      // global fallback). Settings are kept so the sliders don't jump; only
      // the mode is silenced. The DEPLOYED page keeps the global/server
      // visualiser fallback (it has no per-track editor).
      viz = Object.assign({}, VIZ_DEFAULTS, state.globalViz || {});
      if (viz.on === false || isEditorPage()){
        viz.mode = 'off';
        // Entry S29: a track with NO saved visualiser config (e.g. a brand-new
        // track) must show NO visualiser at all on the editor — main, playlist,
        // and both edge layers — not inherit the global/previous track's modes.
        if (isEditorPage()){ viz.plMode = 'off'; viz.edgeMode = 'off'; viz.plEdgeMode = 'off'; }
      }
    }
    vizSyncUI();
    applyViz();
    applyEdgeViz();
    applyPlViz();
    applyPlEdgeViz();
  }

  // "Editing track" badge in the editor: always shows WHICH playlist track
  // the editor is currently working on, so saves are never ambiguous.
  function updateEditingTrackBadge(){
    const t = demoPlaylist[state.currentIndex];
    const badge = document.getElementById('editingTrack');
    if (!badge) return;
    const num = (state.currentIndex + 1);
    badge.innerHTML = 'Editing track <b>' + num + ': ' +
      (t && t.title ? escapeHtml(t.title) : '…') + '</b> — changes & saves affect ONLY this track';
  }
  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function updateTrackVizUI(){
    const g = id => document.getElementById(id);
    const t = demoPlaylist[state.currentIndex];
    const tv = trackVizConfig(t);
    const on = g('vizTrackOn');
    if (on) on.checked = tv ? tv.on !== false : viz.mode !== 'off';
    const st = g('trackVizState');
    if (st) st.textContent = tv
      ? 'Track-specific visualiser (this track only)' + (tv.on === false ? ' — OFF for this track' : '')
      : 'Global visualiser — applies to all tracks';
  }

  function saveCurrentAsTrackViz(){
    const g = id => document.getElementById(id);
    const t = demoPlaylist[state.currentIndex];
    if (!t) return;
    const on = !!(g('vizTrackOn') && g('vizTrackOn').checked);
    t.viz = {
      on,
      mode: viz.mode, sensitivity: viz.sensitivity, smoothing: viz.smoothing,
      opacity: viz.opacity, bars: viz.bars, fft: viz.fft, colors: viz.colors,
      customColors: viz.customColors ? viz.customColors.slice() : undefined,
      artwork: viz.artwork, starSize: viz.starSize, fog: viz.fog,
      edgeMode: viz.edgeMode, edgeReach: viz.edgeReach,
      edgeSensitivity: viz.edgeSensitivity, edgeSmoothing: viz.edgeSmoothing,
      edgeOpacity: viz.edgeOpacity, edgeBars: viz.edgeBars,
      edgeColors: viz.edgeColors, edgeCustomColors: viz.edgeCustomColors ? viz.edgeCustomColors.slice() : undefined,
      plMode: viz.plMode, plOpacity: viz.plOpacity,
      plMirror: viz.plMirror, plMilkdropPreset: viz.plMilkdropPreset,
      plSensitivity: viz.plSensitivity, plSmoothing: viz.plSmoothing,
      plBars: viz.plBars, plColors: viz.plColors,
      plFog: viz.plFog,
      plEdgeMode: viz.plEdgeMode, plEdgeReach: viz.plEdgeReach,
      plEdgeSensitivity: viz.plEdgeSensitivity, plEdgeSmoothing: viz.plEdgeSmoothing,
      plEdgeOpacity: viz.plEdgeOpacity, plEdgeBars: viz.plEdgeBars,
      plEdgeColors: viz.plEdgeColors, plEdgeCustomColors: viz.plEdgeCustomColors ? viz.plEdgeCustomColors.slice() : undefined,
      vizBlend: viz.vizBlend, vizBlendMode: viz.vizBlendMode, vizBlendStrength: viz.vizBlendStrength,
      plVizBlend: viz.plVizBlend, plVizBlendMode: viz.plVizBlendMode, plVizBlendStrength: viz.plVizBlendStrength
    };
    state.playlistDirty = true;
    savePlaylist();                      // localStorage + server theme
    updateTrackVizUI();
    const vs = g('vizStatus');
    if (vs) vs.textContent = 'Track visualiser saved' + (on ? '' : ' (OFF)') + ' — applied to this track';
  }

  function resetCurrentTrackViz(){
    const g = id => document.getElementById(id);
    const t = demoPlaylist[state.currentIndex];
    if (!t) return;
    delete t.viz;
    state.playlistDirty = true;
    savePlaylist();
    if (isEditorPage()){
      // v106: on the editor the visualiser is per-track only — after a reset
      // the track is simply OFF until the user picks a mode again.
      applyTrackViz(t);
      const vs = g('vizStatus');
      if (vs) vs.textContent = 'Track visualiser reset — visualiser off for this track (pick a mode to re-enable)';
    } else {
      // fall back to the global settings (localStorage default / server viz)
      viz = Object.assign({}, VIZ_DEFAULTS);
      try { const s = JSON.parse(localStorage.getItem(VIZ_KEY) || 'null'); if (s) viz = Object.assign(viz, s); } catch {}
      vizSyncUI();
      applyViz();
    }
    updateTrackVizUI();
  }

  // ============================================================
  // LOOK PRESETS (Entry S27) — save the entire look of the current
  // track (colour scheme + visualiser + blend modes + framing + cinema,
  // BOTH main player and playlist panel) as a NAMED preset, stored in
  // localStorage, that can be recalled and applied to any other track.
  // A look is STYLING ONLY — it never carries media (audio/cover/video),
  // title or artist, so applying it keeps the target track's song/art.
  // ============================================================
  const LOOK_KEY = 'roundPlayer.lookPresets.v1';
  let lookPresets = [];
  function loadLookPresets(){ try { lookPresets = JSON.parse(localStorage.getItem(LOOK_KEY) || '[]') || []; } catch { lookPresets = []; } }
  function persistLookPresets(){
    try { localStorage.setItem(LOOK_KEY, JSON.stringify(lookPresets)); } catch {}
    // ALSO sync to server so looks survive browser data clears / sandbox resets
    try { saveTheme({ server: true }); } catch {}
  }
  function exportLookPresets(){
    if (!lookPresets.length){ setSyncStatus('No looks to export', false); return; }
    const blob = new Blob([JSON.stringify({ type: 'round-music-player-looks', version: 1, looks: lookPresets }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'round-music-player-looks.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSyncStatus('Exported ' + lookPresets.length + ' look(s) ✓', true);
  }
  function importLookPresets(file){
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        const imported = Array.isArray(data) ? data : (data.looks || []);
        if (!imported.length){ setSyncStatus('No looks found in file', false); return; }
        let added = 0, updated = 0;
        imported.forEach(look => {
          if (!look.name) return;
          const idx = lookPresets.findIndex(p => p.name === look.name);
          if (idx >= 0){ lookPresets[idx] = look; updated++; } else { lookPresets.push(look); added++; }
        });
        persistLookPresets(); renderLookPresets();
        setSyncStatus('Imported ' + (added + updated) + ' look(s) — ' + added + ' new, ' + updated + ' updated ✓', true);
      } catch(e){ setSyncStatus('Import failed: invalid file', false); }
    };
    r.readAsText(file);
  }

  // AUTOSAVE ("save as you go") — Entry S28. Every edit is snapshotted into
  // the CURRENT track + persisted (localStorage + server) on a debounce.
  let _autoSaveT = null, _autoSaveArmed = false;
  function autoSaveLook(){
    if (!_autoSaveArmed || !isEditorPage()) return;
    const t = demoPlaylist[state.currentIndex]; if (!t) return;
    const th = Object.assign({}, t.theme || {});
    const rd = (id, k) => { const e = document.getElementById(id); if (e && e.value) th[k] = e.value; };
    rd('colorPanel','panel'); rd('colorProg1','prog1'); rd('colorProg2','prog2'); rd('colorProg3','prog3'); rd('colorProgTrack','progTrack');
    rd('colorPlayBtn','btnPlayBg'); rd('colorPlayGlyph','btnPlayFg'); rd('colorYoke','yoke'); rd('colorFFREW','ffrew');
    rd('colorTimeBg','timeBg'); rd('colorTimeFg','timeFg'); rd('colorTopIcons','topIcons'); rd('colorTitleText','title'); rd('colorArtistText','artist');
    rd('colorKnobInner','knobIn'); rd('colorKnobOuter','knobOut');
    rd('colorPlBase','plBase'); rd('colorPlGrad','plGrad'); rd('colorPlProg1','plProg1'); rd('colorPlProg2','plProg2'); rd('colorPlProg3','plProg3');
    t.theme = th; t._handTuned = true;
    t.viz = Object.assign({ on: !!(viz.mode && viz.mode !== 'off') }, JSON.parse(JSON.stringify(viz)));
    t.transform = { coverDx: getVarNum('--cover-dx'), coverDy: getVarNum('--cover-dy'), coverScale: getVarNum('--cover-scale',1), panelDx: getVarNum('--panel-dx'), panelDy: getVarNum('--panel-dy'), panelScale: getVarNum('--panel-scale',1) };
    t.cinemaTransform = { coverDx: getVarNum('--cinema-dx'), coverDy: getVarNum('--cinema-dy'), coverScale: getVarNum('--cinema-scale',1) };
    t.cinemaArtTransform = { artDx: getVarNum('--cinema-art-dx'), artDy: getVarNum('--cinema-art-dy'), artScale: getVarNum('--cinema-art-scale',1) };
    t.vizTransform = { dx: getVarNum('--viz-dx'), dy: getVarNum('--viz-dy'), scale: getVarNum('--viz-scale',1) };
    t.vizCinemaTransform = { dx: getVarNum('--viz-cinema-dx'), dy: getVarNum('--viz-cinema-dy'), scale: getVarNum('--viz-cinema-scale',1) };
    t.panelBlend = Math.max(0, Math.min(100, Math.round(+el.player.style.getPropertyValue('--panel-blend') || 0)));
    t.panelBlendMode = (el.panelBlendMode && el.panelBlendMode.value) || t.panelBlendMode || 'normal';
    t.panelGrey = !!(el.panelGrey && el.panelGrey.checked);
    // NOTE: cinema is NOT snapshotted here — it's a deliberate per-track
    // toggle (the checkbox), not part of the "look as you go". Only the
    // trackCinema change handler writes t.cinema.
    state.playlistDirty = true;
    clearTimeout(_autoSaveT);
    _autoSaveT = setTimeout(() => {
      try { savePlaylist(); } catch {}
      try { saveTheme({ server: true }); } catch {}
      setSyncStatus('Look saved ✓ — ' + (t.title || 'track'), true);
    }, 400);
  }
  function scheduleAutoSave(){ if (!_autoSaveArmed || !isEditorPage()) return; clearTimeout(_autoSaveT); _autoSaveT = setTimeout(autoSaveLook, 350); }
  function flushAutoSave(){ if (_autoSaveT){ clearTimeout(_autoSaveT); _autoSaveT = null; autoSaveLook(); } }

  // Restore the current track's saved cover/panel/viz/art/cinema transform
  // vars onto the player (no auto-fill recompute — just the saved framing).
  function applyTrackTransforms(t){
    const tr = trackTransform(t) || {};
    setVarPx('--cover-dx', tr.coverDx || 0); setVarPx('--cover-dy', tr.coverDy || 0);
    setVarNum('--cover-scale', tr.coverScale || 1);
    setVarPx('--cinema-dx', (t.cinemaTransform && t.cinemaTransform.coverDx) || tr.coverDx || 0);
    setVarPx('--cinema-dy', (t.cinemaTransform && t.cinemaTransform.coverDy) || tr.coverDy || 0);
    setVarNum('--cinema-scale', (t.cinemaTransform && t.cinemaTransform.coverScale) || tr.coverScale || 1);
    setVarPx('--panel-dx', tr.panelDx || 0); setVarPx('--panel-dy', tr.panelDy || 0); setVarNum('--panel-scale', tr.panelScale || 1);
    const vt = t.vizTransform || {}, vct = t.vizCinemaTransform || {};
    setVarPx('--viz-dx', vt.dx || 0); setVarPx('--viz-dy', vt.dy || 0); setVarNum('--viz-scale', vt.scale || 1);
    setVarPx('--viz-cinema-dx', vct.dx != null ? vct.dx : (vt.dx || 0));
    setVarPx('--viz-cinema-dy', vct.dy != null ? vct.dy : (vt.dy || 0));
    setVarNum('--viz-cinema-scale', vct.scale != null ? vct.scale : (vt.scale || 1));
    setVarPx('--art-dx', 0); setVarPx('--art-dy', 0);
    setVarPx('--cinema-art-dx', (t.cinemaArtTransform && t.cinemaArtTransform.artDx) || 0);
    setVarPx('--cinema-art-dy', (t.cinemaArtTransform && t.cinemaArtTransform.artDy) || 0);
    setVarNum('--cinema-art-scale', (t.cinemaArtTransform && t.cinemaArtTransform.artScale) || 1);
    if (el.coverZoom) el.coverZoom.value = String(tr.coverScale || 1);
    if (el.coverZoomVal) el.coverZoomVal.textContent = (tr.coverScale || 1).toFixed(2) + '×';
    if (el.panelZoom) el.panelZoom.value = String(tr.panelScale || 1);
    if (el.panelZoomVal) el.panelZoomVal.textContent = (tr.panelScale || 1).toFixed(2) + '×';
    const _vz = document.getElementById('vizZoom'); if (_vz) _vz.value = String(vt.scale || 1);
    const _vzv = document.getElementById('vizZoomVal'); if (_vzv) _vzv.textContent = (vt.scale || 1).toFixed(2) + '×';
  }
  // Re-apply a track's whole LOOK to the live player WITHOUT reloading its
  // media (colours + panel texture + transforms + PL backdrop + visualiser).
  function applyTrackLook(t){
    if (!t) return;
    const theme = effectiveTheme(t);
    if (theme && Object.keys(theme).length){ applyWithTheme(theme); }
    if (typeof applyPanelMedia === 'function') applyPanelMedia(t);
    applyTrackTransforms(t);
    if (typeof applyPlBackdrop === 'function') applyPlBackdrop(t);
    applyTrackViz(t);
    vizSyncUI();
    populateEditorFromTrack(t);
    updateEditingTrackBadge();
    engageCinema(t.cinema && cinemaEnabledForTrack() && cinemaContentActive());
    state.playlistDirty = true;
    savePlaylist();
  }
  // Build a look object from the current track (syncs live editor state first).
  // STYLING ONLY — media / title / artist are deliberately excluded.
  function captureCurrentLook(){
    if (typeof saveCurrentAsTrackTheme === 'function') saveCurrentAsTrackTheme();
    if (typeof saveCurrentAsTrackViz === 'function') saveCurrentAsTrackViz();
    const t = demoPlaylist[state.currentIndex]; if (!t) return null;
    const clone = v => v ? JSON.parse(JSON.stringify(v)) : null;
    return {
      theme: clone(t.theme),
      viz: clone(t.viz),
      transform: t.transform ? Object.assign({}, t.transform) : null,
      cinemaTransform: t.cinemaTransform ? Object.assign({}, t.cinemaTransform) : null,
      cinemaArtTransform: t.cinemaArtTransform ? Object.assign({}, t.cinemaArtTransform) : null,
      artTransform: t.artTransform ? Object.assign({}, t.artTransform) : null,
      vizTransform: t.vizTransform ? Object.assign({}, t.vizTransform) : null,
      vizCinemaTransform: t.vizCinemaTransform ? Object.assign({}, t.vizCinemaTransform) : null,
      panelBlend: t.panelBlend, panelBlendMode: t.panelBlendMode, panelGrey: t.panelGrey,
      cinema: t.cinema, cinemaStyle: t.cinemaStyle,
      // PL-panel media CONFIG (toggles + framing) — NOT the image data. The
      // actual cover/video is sourced from the TARGET track at apply time, so
      // a look never leaks another track's artwork.
      plMedia: t.plMedia, plMirror: t.plMirror, plVideoOn: t.plVideoOn,
      plArt: t.plArt ? Object.assign({}, t.plArt) : null,
      plVid: t.plVid ? Object.assign({}, t.plVid) : null
    };
  }
  function saveLookPreset(name){
    name = (name || '').trim();
    if (!name){ setSyncStatus('Enter a name for the look preset', false); return; }
    const look = captureCurrentLook(); if (!look) return;
    look.name = name;
    const idx = lookPresets.findIndex(p => p.name === name);
    if (idx >= 0) lookPresets[idx] = look; else lookPresets.push(look);
    persistLookPresets(); renderLookPresets();
    setSyncStatus('Look "' + name + '" saved ✓ — apply it to any track from the list', true);
  }
  function applyLookPreset(name){
    const look = lookPresets.find(p => p.name === name); if (!look) return;
    const t = demoPlaylist[state.currentIndex]; if (!t) return;
    const clone = v => v ? JSON.parse(JSON.stringify(v)) : null;
    if (look.theme) t.theme = clone(look.theme);
    if (look.viz) t.viz = clone(look.viz);
    if (look.transform) t.transform = Object.assign({}, look.transform);
    if (look.cinemaTransform) t.cinemaTransform = Object.assign({}, look.cinemaTransform);
    if (look.cinemaArtTransform) t.cinemaArtTransform = Object.assign({}, look.cinemaArtTransform);
    if (look.artTransform) t.artTransform = Object.assign({}, look.artTransform);
    if (look.vizTransform) t.vizTransform = Object.assign({}, look.vizTransform);
    if (look.vizCinemaTransform) t.vizCinemaTransform = Object.assign({}, look.vizCinemaTransform);
    if (look.panelBlend != null) t.panelBlend = look.panelBlend;
    if (look.panelBlendMode) t.panelBlendMode = look.panelBlendMode;
    if (look.panelGrey != null) t.panelGrey = look.panelGrey;
    if (look.cinema != null) t.cinema = look.cinema;
    if (look.cinemaStyle) t.cinemaStyle = look.cinemaStyle;
    // PL-panel media CONFIG from the look (image stays the target track's own)
    if (look.plMedia === true || look.plMedia === false) t.plMedia = look.plMedia;
    if (look.plMirror === true || look.plMirror === false) t.plMirror = look.plMirror;
    if (look.plVideoOn === true || look.plVideoOn === false) t.plVideoOn = look.plVideoOn;
    if (look.plArt) t.plArt = Object.assign({}, look.plArt);
    if (look.plVid) t.plVid = Object.assign({}, look.plVid);
    applyTrackLook(t);
    setSyncStatus('Look "' + name + '" applied to ' + (t.title || 'track') + ' ✓', true);
  }
  function deleteLookPreset(name){
    lookPresets = lookPresets.filter(p => p.name !== name);
    persistLookPresets(); renderLookPresets();
  }
  function renderLookPresets(){
    const box = document.getElementById('lookPresetList'); if (!box) return;
    const count = document.getElementById('lookCount'); if (count) count.textContent = '(' + lookPresets.length + ')';
    if (!lookPresets.length){ box.innerHTML = '<div class="hint-inline">No saved looks yet.</div>'; return; }
    box.innerHTML = lookPresets.map(p => {
      const cols = p.theme ? [p.theme.prog1, p.theme.prog2, p.theme.prog3, p.theme.plGrad] : ['#fff','#fff','#fff','#fff'];
      const chips = cols.map(c => '<span class="look-chip" style="background:' + (c || '#fff') + '"></span>').join('');
      const vizTag = (p.viz && p.viz.mode && p.viz.mode !== 'off') ? p.viz.mode : '';
      return '<div class="look-preset-row">' + chips + '<span class="look-name">' + escapeHtml(p.name) + '</span>' +
        '<span class="look-meta">' + escapeHtml(vizTag) + '</span>' +
        '<button type="button" class="btn look-apply" data-look="' + escapeHtml(p.name) + '">Apply</button>' +
        '<button type="button" class="btn btn-secondary look-delete" data-look="' + escapeHtml(p.name) + '">Delete</button></div>';
    }).join('');
    box.querySelectorAll('.look-apply').forEach(b => b.addEventListener('click', () => applyLookPreset(b.dataset.look)));
    box.querySelectorAll('.look-delete').forEach(b => b.addEventListener('click', () => { if (confirm('Delete look "' + b.dataset.look + '"?')) deleteLookPreset(b.dataset.look); }));
  }

  // Lazy Web Audio graph: <audio> + <video> both feed one analyser so the
  // visualiser works whichever is master. Must be created from a user
  // gesture (autoplay policy) — created on first play or first viz toggle.
  function ensureVizGraph(){
    if (vizAnalyser) return vizAnalyser;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      vizAudioCtx = new AC();
      vizAnalyser = vizAudioCtx.createAnalyser();
      vizAnalyser.fftSize = viz.fft || 512;
      vizAnalyser.smoothingTimeConstant = viz.smoothing || 0.82;
      vizAnalyser.minDecibels = -90;
      vizAnalyser.maxDecibels = -10;
      // createMediaElementSource can only be called ONCE per element; the
      // source stays valid across src changes, so create both up front.
      // A MASTER GAIN sits between the sources and the analyser so the
      // global Volume Boost (>100%, VLC-style) works through Web Audio.
      vizMasterGain = vizAudioCtx.createGain();
      vizMasterGain.gain.value = clamp(gs.boost, 100, 200) / 100;
      if (el.audio && !vizAudioSrc){
        vizAudioSrc = vizAudioCtx.createMediaElementSource(el.audio);
        vizAudioSrc.connect(vizMasterGain);
      }
      if (el.coverVideo && !vizVideoSrc){
        vizVideoSrc = vizAudioCtx.createMediaElementSource(el.coverVideo);
        vizVideoSrc.connect(vizMasterGain);
      }
      vizMasterGain.connect(vizAnalyser);
      vizAnalyser.connect(vizAudioCtx.destination);
      // SECOND analyser for the EDGE/RIM visualiser — taps the same master
      // gain so its smoothing is fully independent of the in-circle visualiser.
      if (!edgeAnalyser){
        edgeAnalyser = vizAudioCtx.createAnalyser();
        edgeAnalyser.fftSize = 512;
        edgeAnalyser.smoothingTimeConstant = viz.edgeSmoothing != null ? viz.edgeSmoothing : 0.82;
        edgeAnalyser.minDecibels = -90;
        edgeAnalyser.maxDecibels = -10;
        vizMasterGain.connect(edgeAnalyser);
      }
      // THIRD analyser for the PLAYLIST edge/rim visualiser (Entry S21) —
      // fully independent smoothing from both the main edge and the in-circle viz.
      if (!plEdgeAnalyser){
        plEdgeAnalyser = vizAudioCtx.createAnalyser();
        plEdgeAnalyser.fftSize = 512;
        plEdgeAnalyser.smoothingTimeConstant = viz.plEdgeSmoothing != null ? viz.plEdgeSmoothing : 0.82;
        plEdgeAnalyser.minDecibels = -90;
        plEdgeAnalyser.maxDecibels = -10;
        vizMasterGain.connect(plEdgeAnalyser);
      }
    } catch { return null; }
    return vizAnalyser;
  }
  function resumeVizAudio(){
    if (vizAudioCtx && vizAudioCtx.state === 'suspended') vizAudioCtx.resume().catch(()=>{});
  }

  // Palette helper — always returns a colour for t in [0,1] plus the mode's
  // favourite CSS theme vars so every visualiser matches the player theme.
  function vizPalette(){
    const cs = getComputedStyle(el.player);
    const c1 = cs.getPropertyValue('--progress-start').trim() || '#ff2992';
    const c2 = cs.getPropertyValue('--progress-mid').trim() || '#ffb84d';
    const c3 = cs.getPropertyValue('--progress-end').trim() || '#29d5ff';
    const mono = cs.getPropertyValue('--btn-play-fg').trim() || '#ffffff';
    const hex = h => { const n = parseInt(h.slice(1), 16); return [(n>>16)&255, (n>>8)&255, n&255]; };
    const [r1,g1,b1] = hex(c1), [r2,g2,b2] = hex(c2), [r3,g3,b3] = hex(c3);
    const lerp = (a,b,t) => a + (b-a)*t;
    const hue2rgb = (p,q,t) => { if (t<0) t+=1; if (t>1) t-=1; if (t<1/6) return p+(q-p)*6*t; if (t<1/2) return q; if (t<2/3) return p+(q-p)*(2/3-t)*6; return p; };
    const hsla = (t, s=0.75, l=0.55) => {
      const q = l < 0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
      return [hue2rgb(p,q,t+1/3)*255, hue2rgb(p,q,t)*255, hue2rgb(p,q,t-1/3)*255];
    };
    return {
      t: (t, i, n) => {                       // 3-stop theme gradient
        const seg = t < 0.5 ? 0 : 1, u = t < 0.5 ? t*2 : (t-0.5)*2;
        const a = seg===0 ? [r1,g1,b1] : [r2,g2,b2], b = seg===0 ? [r2,g2,b2] : [r3,g3,b3];
        return `rgb(${Math.round(lerp(a[0],b[0],u))},${Math.round(lerp(a[1],b[1],u))},${Math.round(lerp(a[2],b[2],u))})`;
      },
      rainbow: (t, i, n) => { const h = ((i/(n||1)) + t*0.08) % 1; const [r,g,b] = hsla(h); return `rgb(${r|0},${g|0},${b|0})`; },
      mono: (t, i, n) => mono,
      // custom 3-colour set (position-based for bars/radial; random per star in starfield)
      custom: (t, i, n) => {
        const cols = (viz.customColors && viz.customColors.length === 3) ? viz.customColors : ['#ffffff', c1, c3];
        return cols[(i|0) % cols.length];
      },
      // starfield theme look: white-led gradient (white + the 3 theme colours) so the
      // classic white-star field also carries the artwork's accent colours
      starGrad: (h) => {
        const stops = [[255,255,255],[255,255,255],[r1,g1,b1],[r2,g2,b2],[r3,g3,b3]];
        const m = stops.length - 1, pos = Math.min(m - 1e-6, Math.max(0, h)) * m, seg = Math.floor(pos), u = pos - seg;
        const a = stops[seg], b = stops[Math.min(m, seg + 1)];
        return `rgb(${Math.round(lerp(a[0],b[0],u))},${Math.round(lerp(a[1],b[1],u))},${Math.round(lerp(a[2],b[2],u))})`;
      },
      c1, c2, c3, mono
    };
  }
  function vizColor(pal, mode, t, i, n){
    if (viz.colors === 'custom') return pal.custom(t, i, n);
    if (viz.colors === 'rainbow') return pal.rainbow(t, i, n);
    if (viz.colors === 'mono') return pal.mono;
    return pal.t(t, i, n);
  }
  function vizColorA(pal, t, i, n, a){
    // colour + alpha (rgb(r,g,b) -> rgba(r,g,b,a))
    const c = vizColor(pal, 't', t, i, n);
    const m = c.match(/\d+/g);
    return m && m.length >= 3 ? `rgba(${m[0]},${m[1]},${m[2]},${a})` : c;
  }

  function sizeVizCanvas(){
    const cv = el.vizCanvas;
    if (!cv) return;
    const r = el.player.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // the canvas is the MEDIA WINDOW = top half of the player circle
    const W = Math.round(r.width);
    const H = Math.round(r.height * 0.5);
    cv.width = Math.max(1, Math.round(W * dpr));
    cv.height = Math.max(1, Math.round(H * dpr));
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
  }

  // ---- the five modes ----
  // All modes draw inside the MEDIA WINDOW frame (W × H = top half of the
  // player): bars sit on the panel line at the bottom, radial fans upward
  // from the panel line, waveform + starfield centre in the window.
  function drawBars(ctx, W, H, data, pal){
    const n = viz.bars || 32;
    const bw = (W * 0.92) / n;
    const gap = Math.max(1, bw * 0.18);
    const baseY = H;                       // bottom of the media window = panel line
    const maxH = H * 0.92;
    const bins = Math.min(data.length, Math.floor(data.length * 0.6)); // skip empty highs
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++){
      const bi = Math.min(bins - 1, Math.floor(i / n * bins));
      const v = data[bi] / 255 * viz.sensitivity / 100;
      const h = Math.max(2, Math.min(maxH, v * maxH));
      const x = (W - n*bw)/2 + i*bw + gap/2;
      const grad = ctx.createLinearGradient(0, baseY - h, 0, baseY);
      grad.addColorStop(0, vizColor(pal, 't', i/n, i, n));
      grad.addColorStop(1, vizColor(pal, 't', i/n + 0.35, i, n));
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, baseY - h, bw - gap, h, 3);
      else ctx.rect(x, baseY - h, bw - gap, h);
      ctx.fill();
    }
  }
  function drawRadial(ctx, W, H, data, pal, t){
    // sunburst fan: bars radiate UPWARD from the panel line (bottom centre),
    // so nothing is hidden behind the wave panel / controls below
    const n = viz.bars || 48;
    const cx = W/2, cy = H;                // origin on the panel line
    const R0 = H * 0.30;
    const R1 = H * 0.88;
    const rot = -Math.PI / 2 + t * 0.04;   // start pointing straight up, slow spin
    const bins = Math.min(data.length, Math.floor(data.length * 0.6));
    // bass glow at the origin
    let bass = 0; for (let i = 0; i < 6; i++) bass += data[i] || 0; bass = bass / 6 / 255;
    const glowR = R0 * (0.35 + bass * 0.4);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    glow.addColorStop(0, vizColorA(pal, 0.5, 0, n, 0.33));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI*2); ctx.fill();
    ctx.lineWidth = Math.max(2, Math.min(W, H) * 0.012);
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++){
      const bi = Math.min(bins - 1, Math.floor(i / n * bins));
      const v = data[bi] / 255 * viz.sensitivity / 100;
      const a = rot + i / n * Math.PI;     // sweep a half-circle
      const len = v * (R1 - R0);
      ctx.strokeStyle = vizColor(pal, 't', i/n, i, n);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R0, cy + Math.sin(a) * R0);
      ctx.lineTo(cx + Math.cos(a) * (R0 + len), cy + Math.sin(a) * (R0 + len));
      ctx.stroke();
    }
  }
  function drawWaveform(ctx, W, H, data){
    const midY = H * 0.5;
    const amp = H * 0.42 * viz.sensitivity / 100;
    ctx.lineWidth = Math.max(2, H * 0.008);
    ctx.strokeStyle = vizColor(vizPalette(), 't', 0.5, 0, 1);
    ctx.beginPath();
    for (let i = 0; i < data.length; i++){
      const x = i / (data.length - 1) * W;
      const y = midY + ((data[i] - 128) / 128) * amp;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    // mirror faint
    ctx.globalAlpha *= 0.35;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++){
      const x = i / (data.length - 1) * W;
      const y = midY - ((data[i] - 128) / 128) * amp;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = viz.opacity;
  }
  function drawStarfield(ctx, W, H, data, pal, t){
    const cx = W/2, cy = H * 0.55;
    if (!vizStars){
      vizStars = [];
      // each star gets a size factor + a fixed hue/colour-index so the field
      // mixes big/small stars AND shows many colours at once (rainbow/custom)
      for (let i = 0; i < 220; i++) vizStars.push({
        x: (Math.random()*2-1), y: (Math.random()*2-1), z: Math.random(),
        sz: 0.45 + Math.random() * 1.9,
        hue: Math.random(),        // per-star spectrum position (rainbow / theme)
        ci: (Math.random()*3)|0    // which of the 3 custom colours this star uses
      });
    }
    let bass = 0; for (let i = 0; i < 6; i++) bass += data[i] || 0; bass = bass / 6 / 255;
    const speed = 0.0012 + bass * 0.014 * viz.sensitivity / 100;
    const starMul = viz.starSize || 2;
    const R = Math.min(W, H) * 0.62;
    // per-star colour resolver: white-led theme (white + artwork colours), full-spectrum
    // rainbow (each star its OWN hue), a 3-colour custom set, or pure white (mono)
    const customCols = (viz.customColors && viz.customColors.length === 3)
      ? viz.customColors : ['#ffffff', pal.c1, pal.c3];
    const starColor = (s) => {
      if (viz.colors === 'rainbow') return pal.rainbow(t, s.hue, 1);  // i/n = s.hue -> full spectrum
      if (viz.colors === 'custom')  return customCols[s.ci % 3];
      if (viz.colors === 'mono')    return '#ffffff';
      return pal.starGrad(s.hue);                                    // theme: white + the 3 theme colours
    };
    for (const s of vizStars){
      s.z -= speed;
      if (s.z <= 0.02) { s.z = 1; s.x = Math.random()*2-1; s.y = Math.random()*2-1; s.sz = 0.45 + Math.random() * 1.9; }
      const px = cx + (s.x / s.z) * R * 0.5;
      const py = cy + (s.y / s.z) * R * 0.5;
      if (px < -60 || px > W+60 || py < -60 || py > H+60) { s.z = 1; continue; }
      // big stars are the ones up close ((1-s.z) large); the size slider
      // scales them all, and each star's own sz factor adds variety
      const size = Math.max(0.8, (1 - s.z) * 2.4 * starMul * s.sz);
      const bright = 0.35 + (1 - s.z) * 0.65;
      const fill = starColor(s);
      // soft halo on larger stars so they read clearly
      if (size >= 3){
        ctx.globalAlpha = viz.opacity * bright * 0.28;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(px, py, size * 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = viz.opacity * bright;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = viz.opacity;
    // faint central glow that pulses with bass
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.4);
    // mono stars are white — the central bass glow must be white too, never the
    // theme's play-glyph colour (which can be dark and paint a dark central orb)
    glow.addColorStop(0, viz.colors === 'mono' ? 'rgba(255,255,255,0.13)' : vizColorA(pal, 0.5, 0, 1, 0.13));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.4, 0, Math.PI*2); ctx.fill();
  }
  function drawPlasma(ctx, W, H, data, pal, t){
    // classic sin-wave plasma at low res, upscaled (fast 60fps trick)
    const small = document.createElement('canvas');
    small.width = 64; small.height = 64;
    const sctx = small.getContext('2d');
    const img = sctx.createImageData(64, 64);
    let vol = 0; for (let i = 0; i < data.length; i += 4) vol += data[i]; vol = vol / (data.length/4) / 255;
    const p = img.data;
    for (let y = 0; y < 64; y++){
      for (let x = 0; x < 64; x++){
        const v = Math.sin(x/9 + t*0.9 + vol*2.2)
                + Math.sin(y/8 + t*0.7)
                + Math.sin((x+y)/11 + vol*3)
                + Math.sin(Math.sqrt(x*x + y*y)/7 - t*0.6);
        const n = (v + 4) / 8;                      // 0..1
        const i4 = (y*64 + x) * 4;
        const col = vizColor(pal, 't', n, x+y, 128);
        const m = col.match(/\d+/g);
        p[i4] = +m[0]; p[i4+1] = +m[1]; p[i4+2] = +m[2];
        p[i4+3] = 255;
      }
    }
    sctx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(small, 0, 0, W, H);
  }

  function vizTick(){
    if (viz.mode === 'off' || viz.mode === 'milkdrop'){ vizRAF = null; return; }
    // Rollercoaster: the 3D module draws itself; this loop only feeds it
    // audio-reactive bloom. Bloom strength = base + bass energy × sensitivity.
    if (viz.mode === 'coaster'){
      const a = ensureVizGraph();
      if (!vizFreq) vizFreq = new Uint8Array(a ? a.frequencyBinCount : 256);
      let bass = 0;
      if (a){ a.getByteFrequencyData(vizFreq); for (let i = 0; i < 6; i++) bass += vizFreq[i] || 0; bass = bass / 6 / 255; }
      // v52 bloom behaviour restored: strong + bass-reactive. The canvas uses
      // mix-blend-mode: screen, so the black backdrop is invisible and the
      // artwork shows through no matter how strong the glow gets.
      const strength = (0.8 + bass * 3.0) * (viz.sensitivity / 100);
      if (window.RoundViz3D) window.RoundViz3D.setIntensity(strength);
      vizRAF = requestAnimationFrame(vizTick);
      return;
    }
    const cv = el.vizCanvas;
    if (!cv || cv.style.display === 'none'){ vizRAF = null; return; }
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    if (!W || !H){ vizRAF = requestAnimationFrame(vizTick); return; }
    const t = performance.now() / 1000;
    ctx.clearRect(0, 0, W, H);
    const a = ensureVizGraph();
    if (!vizFreq) vizFreq = new Uint8Array(a ? a.frequencyBinCount : 256);
    if (!vizWave) vizWave = new Uint8Array(a ? a.frequencyBinCount : 256);
    if (a){ a.getByteFrequencyData(vizFreq); a.getByteTimeDomainData(vizWave); }
    else { vizFreq.fill(0); vizWave.fill(128); }
    ctx.globalAlpha = viz.opacity;
    const pal = vizPalette();
    if (viz.mode === 'bars') drawBars(ctx, W, H, vizFreq, pal);
    else if (viz.mode === 'radial') drawRadial(ctx, W, H, vizFreq, pal, t);
    else if (viz.mode === 'waveform') drawWaveform(ctx, W, H, vizWave);
    else if (viz.mode === 'starfield') drawStarfield(ctx, W, H, vizFreq, pal, t);
    else if (viz.mode === 'plasma') drawPlasma(ctx, W, H, vizFreq, pal, t);
    ctx.globalAlpha = 1;
    vizRAF = requestAnimationFrame(vizTick);
  }

  // ============================================================
  // EDGE / RIM VISUALISER — pulses around the OUTSIDE of the disc
  // (Vizzy-style). Lives on its own UN-CLIPPED canvas (.viz-edge, a
  // sibling of .music-player inside .player-pair) so outward spikes
  // aren't cropped by the player's overflow:hidden. Independent of the
  // in-circle visualiser: both can run at once.
  // ============================================================
  // EDGE palette + colour pickers: read the SAME theme vars as the player
  // (so 'theme' matches the Colors section), but the colours-MODE and the
  // custom 3-colour set are the EDGE's own — independent of the in-circle
  // visualiser.
  function edgePalette(){
    const pal = vizPalette();           // theme vars shared with the player
    pal.custom = (t, i, n) => {
      const cols = (viz.edgeCustomColors && viz.edgeCustomColors.length === 3) ? viz.edgeCustomColors : ['#ffffff', pal.c1, pal.c3];
      return cols[(i | 0) % cols.length];
    };
    return pal;
  }
  function edgeColor(pal, mode, t, i, n){
    if (viz.edgeColors === 'custom') return pal.custom(t, i, n);
    if (viz.edgeColors === 'rainbow') return pal.rainbow(t, i, n);
    if (viz.edgeColors === 'mono') return pal.mono;
    return pal.t(t, i, n);              // 'theme' = match the player's Colors section
  }
  function edgeColorA(pal, t, i, n, a){
    const c = edgeColor(pal, 't', t, i, n);
    const m = c.match(/\d+/g);
    return m && m.length >= 3 ? `rgba(${m[0]},${m[1]},${m[2]},${a})` : c;
  }

  function ensureEdgeCanvas(){
    if (elEdge) return elEdge;
    const pair = document.getElementById('playerPair');
    if (!pair) return null;
    const cv = document.createElement('canvas');
    cv.className = 'viz-edge';
    cv.setAttribute('aria-hidden', 'true');
    pair.appendChild(cv);
    elEdge = cv;
    return cv;
  }
  function sizeVizEdgeCanvas(){
    const cv = elEdge; if (!cv) return;
    const r = el.player.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const box = Math.max(1, r.width * EDGE_BOX);
    cv.width = Math.max(1, Math.round(box * dpr));
    cv.height = Math.max(1, Math.round(box * dpr));
    cv.style.width = box + 'px';
    cv.style.height = box + 'px';
  }
  function edgeBass(data){ let s = 0; for (let i = 0; i < 8; i++) s += data[i] || 0; return s / 8 / 255; }

  // E-1 outer radial bars (the Vizzy look)
  function drawEdgeBars(ctx, cx, cy, R, reach, data, pal, t, dpr){
    const n = Math.max(24, (viz.edgeBars || 48) * 2);
    const bins = Math.floor(data.length * 0.6);
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1, (2 * Math.PI * R) / n * 0.5);
    const rot = t * 0.06;
    for (let i = 0; i < n; i++){
      const bi = Math.min(bins - 1, Math.floor(i / n * bins));
      const v = data[bi] / 255 * viz.edgeSensitivity / 100;
      const a = i / n * Math.PI * 2 - Math.PI / 2 + rot;
      const ca = Math.cos(a), sa = Math.sin(a);
      const r1 = R + 2 * dpr, r2 = r1 + v * reach;
      ctx.strokeStyle = edgeColor(pal, 't', i / n, i, n);
      ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 6 * dpr;
      ctx.beginPath(); ctx.moveTo(cx + ca * r1, cy + sa * r1); ctx.lineTo(cx + ca * r2, cy + sa * r2); ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }
  // E-2 mirror bars (outward + inward)
  function drawEdgeMirror(ctx, cx, cy, R, reach, data, pal, t, dpr){
    const n = Math.max(24, (viz.edgeBars || 48) * 2);
    const bins = Math.floor(data.length * 0.6);
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1, (2 * Math.PI * R) / n * 0.5);
    const inMax = R * 0.45;
    const rot = t * 0.06;
    for (let i = 0; i < n; i++){
      const bi = Math.min(bins - 1, Math.floor(i / n * bins));
      const v = data[bi] / 255 * viz.edgeSensitivity / 100;
      const a = i / n * Math.PI * 2 - Math.PI / 2 + rot;
      const ca = Math.cos(a), sa = Math.sin(a);
      const col = edgeColor(pal, 't', i / n, i, n);
      ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 6 * dpr;
      const rO1 = R + 2 * dpr, rO2 = rO1 + v * reach;
      ctx.beginPath(); ctx.moveTo(cx + ca * rO1, cy + sa * rO1); ctx.lineTo(cx + ca * rO2, cy + sa * rO2); ctx.stroke();
      const rI2 = Math.max(R * 0.5, R - 2 * dpr - v * inMax);
      ctx.beginPath(); ctx.moveTo(cx + ca * (R - 2 * dpr), cy + sa * (R - 2 * dpr)); ctx.lineTo(cx + ca * rI2, cy + sa * rI2); ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }
  // E-3 bass ring (glowing stroke that pulses with bass)
  function drawEdgeBassRing(ctx, cx, cy, R, reach, data, pal, t, dpr){
    const bass = edgeBass(data);
    const rr = R + 3 * dpr + bass * reach;
    const col = edgeColor(pal, 't', 0.5, 0, 1);
    ctx.strokeStyle = col; ctx.lineWidth = (2 + bass * 4) * dpr;
    ctx.shadowColor = col; ctx.shadowBlur = (12 + bass * 36) * dpr;
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
  }
  // E-4 beat ripples — expanding rings fired on each detected beat. Driven by
  // the SHARED beat engine's onset (_gpLast) with a local kick-flux fallback,
  // so it fires reliably whether or not the artwork beat-pulse toggle is on.
  let _edgeBass = 0, _edgePrevBass = 0, _edgeFluxBase = 0, _edgeLastSpawn = -10, _edgeLastSeenBeat = -10, _edgeBeatPeriod = 0.5;
  function drawEdgeRipples(ctx, cx, cy, R, reach, data, pal, t, dpr){
    // --- beat detection: engine onset (primary) + local flux (fallback) ---
    const hi = Math.max(2, Math.min(5, data.length));
    let sum = 0; for (let i = 1; i < hi; i++) sum += data[i] || 0;
    const bass = (sum / (hi - 1)) / 255;
    _edgeBass += (bass - _edgeBass) * 0.4;
    const flux = _edgeBass > _edgePrevBass ? (_edgeBass - _edgePrevBass) : 0;
    _edgePrevBass = _edgeBass;
    _edgeFluxBase += (flux - _edgeFluxBase) * 0.02;
    const now = performance.now() / 1000;
    const thr = _edgeFluxBase * 2.0 + 0.008;
    let beat = false;
    if (_gpLast > _edgeLastSeenBeat && _gpLast > 0){ _edgeLastSeenBeat = _gpLast; beat = true; }      // real beat (engine)
    if (flux > thr && _edgeBass > 0.05 && (now - _edgeLastSpawn) > _edgeBeatPeriod * 0.6) beat = true; // local flux
    if (beat && (now - _edgeLastSpawn) > 0.12 && vizEdgeRipples.length < 10){
      vizEdgeRipples.push({ r: R + 2 * dpr, a: 0.78, w: (2 + _edgeBass * 5) * dpr });
      _edgeLastSpawn = now;
    }
    // --- draw + advance ripples (brighter, thicker, glow, longer-lived) ---
    const maxR = R + reach * 1.35;
    for (const rip of vizEdgeRipples){
      rip.r += reach * 0.03 + 0.5 * dpr; rip.a *= 0.972;
      ctx.strokeStyle = edgeColorA(pal, 0.5, 0, 1, rip.a);
      ctx.lineWidth = rip.w;
      ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 8 * dpr;
      ctx.beginPath(); ctx.arc(cx, cy, rip.r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    vizEdgeRipples = vizEdgeRipples.filter(r => r.a > 0.04 && r.r < maxR);
  }
  // E-5 polar waveform (a closed reactive blob just outside the rim)
  function drawEdgePolar(ctx, cx, cy, R, reach, data, pal, t, dpr){
    const n = 200, bins = data.length;
    ctx.beginPath();
    for (let i = 0; i <= n; i++){
      const bi = Math.min(bins - 1, Math.floor(i / n * bins * 0.5));
      const v = data[bi] / 255 * viz.edgeSensitivity / 100;
      const a = i / n * Math.PI * 2 - Math.PI / 2;
      const rr = R + 3 * dpr + v * reach;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    const col = edgeColor(pal, 't', 0.5, 0, 1);
    ctx.fillStyle = edgeColorA(pal, 0.5, 0, 1, 0.07); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2 * dpr;
    ctx.shadowColor = col; ctx.shadowBlur = 10 * dpr; ctx.stroke(); ctx.shadowBlur = 0;
  }
  // E-6 concentric frequency rings (bass/mid/treble, counter-rotating arcs)
  function drawEdgeRings(ctx, cx, cy, R, reach, data, pal, t, dpr){
    const bands = [[0, 8, -0.18], [8, 40, 0.10], [40, 120, 0.24]];
    bands.forEach((b, bi) => {
      let e = 0, cnt = 0;
      for (let i = b[0]; i < b[1] && i < data.length; i++){ e += data[i] || 0; cnt++; }
      e = cnt ? e / cnt / 255 : 0;
      const rr = R + (4 + bi * reach * 0.22 + e * reach * 0.45) * dpr;
      const col = edgeColor(pal, 't', bi / 3, bi, 3);
      ctx.strokeStyle = col; ctx.lineWidth = (1.4 + e * 3) * dpr;
      ctx.shadowColor = col; ctx.shadowBlur = 6 * dpr;
      const seg = 6, gap = 0.34, rot = t * b[2];
      for (let s = 0; s < seg; s++){
        const a0 = rot + s / seg * Math.PI * 2, a1 = a0 + (Math.PI * 2 / seg - gap);
        ctx.beginPath(); ctx.arc(cx, cy, rr, a0, a1); ctx.stroke();
      }
    });
    ctx.shadowBlur = 0;
  }
  // E-7 particle orbit (particles ride the rim; reactive size/speed)
  function ensureEdgeParticles(n){
    if (vizEdgeParticles) return;
    vizEdgeParticles = [];
    for (let i = 0; i < n; i++) vizEdgeParticles.push({
      a: Math.random() * Math.PI * 2, off: Math.random() * 0.5,
      spd: 0.2 + Math.random() * 0.9, sz: 0.4 + Math.random() * 1.6, hue: Math.random()
    });
  }
  function drawEdgeOrbit(ctx, cx, cy, R, reach, data, pal, t, dpr){
    ensureEdgeParticles(150);
    const bass = edgeBass(data);
    for (const p of vizEdgeParticles){
      p.a += p.spd * 0.01 * (0.4 + bass * 1.5);
      const rr = R + (3 + p.off * reach + bass * reach * 0.35) * dpr;
      const x = cx + Math.cos(p.a) * rr, y = cy + Math.sin(p.a) * rr;
      const sz = Math.max(0.6, (p.sz * (1 + bass * 1.5)) * dpr);
      ctx.globalAlpha = viz.edgeOpacity * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(p.a * 2 + t)));
      ctx.fillStyle = edgeColor(pal, 't', p.hue, 0, 1);
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = viz.edgeOpacity;
  }
  // E-8 stacked blocks (rectangular tiles around the rim)
  function drawEdgeBlocks(ctx, cx, cy, R, reach, data, pal, t, dpr){
    const n = Math.max(16, viz.edgeBars || 48);
    const bins = Math.floor(data.length * 0.6);
    const step = (2 * Math.PI * R) / n;
    const w = step * 0.68;
    const rot = t * 0.05;
    for (let i = 0; i < n; i++){
      const bi = Math.min(bins - 1, Math.floor(i / n * bins));
      const v = data[bi] / 255 * viz.edgeSensitivity / 100;
      const a = i / n * Math.PI * 2 - Math.PI / 2 + rot;
      const bx = cx + Math.cos(a) * (R + 2 * dpr), by = cy + Math.sin(a) * (R + 2 * dpr);
      const len = v * reach;
      ctx.save();
      ctx.translate(bx, by); ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = edgeColor(pal, 't', i / n, i, n);
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 5 * dpr;
      ctx.fillRect(-w / 2, -len, w, len);
      ctx.restore();
    }
    ctx.shadowBlur = 0;
  }

  function vizEdgeTick(){
    if (viz.edgeMode === 'off' || !elEdge){ vizEdgeRAF = null; return; }
    const cv = elEdge;
    if (!cv.width || !cv.height){ vizEdgeRAF = requestAnimationFrame(vizEdgeTick); return; }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pr = el.player.getBoundingClientRect();
    if (Math.round(pr.width * EDGE_BOX * dpr) !== cv.width) sizeVizEdgeCanvas();   // auto-resize
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ensureVizGraph();   // creates the audio graph AND the independent edge analyser
    if (edgeAnalyser){
      const esm = viz.edgeSmoothing != null ? viz.edgeSmoothing : 0.82;
      if (edgeAnalyser.smoothingTimeConstant !== esm) edgeAnalyser.smoothingTimeConstant = esm;
      if (!vizEdgeFreq || vizEdgeFreq.length !== edgeAnalyser.frequencyBinCount) vizEdgeFreq = new Uint8Array(edgeAnalyser.frequencyBinCount);
      edgeAnalyser.getByteFrequencyData(vizEdgeFreq);
    } else {
      if (!vizEdgeFreq) vizEdgeFreq = new Uint8Array(256);
      vizEdgeFreq.fill(0);
    }
    const t = performance.now() / 1000;
    const cx = cv.width / 2, cy = cv.height / 2;
    const R = Math.max(1, (pr.width / 2) * dpr);
    const reach = (viz.edgeReach / 100) * (EDGE_BOX - 1) * R;   // outward px, clamped to canvas room
    const pal = edgePalette();
    ctx.globalAlpha = viz.edgeOpacity;
    switch (viz.edgeMode){
      case 'edge-bars':   drawEdgeBars(ctx, cx, cy, R, reach, vizEdgeFreq, pal, t, dpr); break;
      case 'edge-mirror': drawEdgeMirror(ctx, cx, cy, R, reach, vizEdgeFreq, pal, t, dpr); break;
      case 'edge-bass':   drawEdgeBassRing(ctx, cx, cy, R, reach, vizEdgeFreq, pal, t, dpr); break;
      case 'edge-ripple': drawEdgeRipples(ctx, cx, cy, R, reach, vizEdgeFreq, pal, t, dpr); break;
      case 'edge-polar':  drawEdgePolar(ctx, cx, cy, R, reach, vizEdgeFreq, pal, t, dpr); break;
      case 'edge-rings':  drawEdgeRings(ctx, cx, cy, R, reach, vizEdgeFreq, pal, t, dpr); break;
      case 'edge-orbit':  drawEdgeOrbit(ctx, cx, cy, R, reach, vizEdgeFreq, pal, t, dpr); break;
      case 'edge-blocks': drawEdgeBlocks(ctx, cx, cy, R, reach, vizEdgeFreq, pal, t, dpr); break;
    }
    ctx.globalAlpha = 1;
    vizEdgeRAF = requestAnimationFrame(vizEdgeTick);
  }

  function applyEdgeViz(){
    if (!elEdge) return;
    const on = viz.edgeMode && viz.edgeMode !== 'off';
    elEdge.classList.toggle('visible', on);
    if (on){
      sizeVizEdgeCanvas();
      if (!vizEdgeRAF) vizEdgeRAF = requestAnimationFrame(vizEdgeTick);
    } else {
      if (vizEdgeRAF){ cancelAnimationFrame(vizEdgeRAF); vizEdgeRAF = null; }
      if (elEdge.width){ const ctx = elEdge.getContext('2d'); ctx.clearRect(0, 0, elEdge.width, elEdge.height); }
      vizEdgeRipples = [];
    }
  }

  function ensureViz3D(){
    // LAZY-LOAD: the 3D coaster + three.js (~1.2 MB) are fetched ONLY when the
    // user picks the coaster mode. Dynamic-importing viz3d.js (which imports
    // three.module.js) on demand keeps the initial page load fast for everyone
    // who isn't using the 3D visualiser.
    if (window.RoundViz3D) return Promise.resolve(true);
    return import('./viz3d.js').then(() => !!window.RoundViz3D).catch(() => false);
  }

  // ============================================================
  // MILKDROP (Butterchurn) — WebGL2 Milkdrop visualiser. Opt-in,
  // lazy-loaded (core ~188KB + minimal presets ~187KB via script inject).
  // Zero impact on initial load; requires WebGL 2.0; degrades gracefully.
  // ============================================================
  let milkdropCanvas = null, milkdropViz = null, milkdropRAF = null;
  let milkdropPresets = null, milkdropPresetNames = null, milkdropPresetIdx = 0, milkdropCycleT = 0;

  function milkdropSupported(){
    try { return !!(document.createElement('canvas').getContext('webgl2')); }
    catch { return false; }
  }
  // NOTE on CSP / unsafe-eval: butterchurn normally compiles each preset's
  // per-frame/per-vertex math with new Function(...) (eval), which strict-CSP
  // environments (e.g. the sandboxed live preview) forbid. We ship a
  // PRECOMPILED presets file (butterchurnPresetsFullPrecompiled.js, loaded in
  // ensureButterchurn) that turns those equation strings into real functions
  // ahead of time, so butterchurn's loadPreset() skips the eval entirely.
  // Milkdrop therefore renders under strict CSP with no code change at runtime.
  function loadScript(src){
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = () => res();
      s.onerror = () => rej(new Error('load: ' + src));
      document.head.appendChild(s);
    });
  }
  function ensureButterchurn(){
    if (window.butterchurn && window.__butterchurnPrecompiled) return Promise.resolve(true);
    // Load ORDER matters: butterchurn core -> FULL preset pack -> PRECOMPILED
    // presets (which attach real eqs functions so butterchurn's loadPreset()
    // never calls new Function). That last file is what makes Milkdrop work
    // under a strict CSP (no unsafe-eval) — e.g. the sandboxed live preview.
    // Full pack = 100 presets (was 29 in the minimal pack).
    return loadScript('vendor/butterchurn/butterchurn.min.js')
      .then(() => loadScript('vendor/butterchurn/butterchurnPresetsFull.min.js'))
      .then(() => loadScript('vendor/butterchurn/butterchurnPresetsFullPrecompiled.js'))
      .then(() => !!(window.butterchurn && window.butterchurnPresets && window.__butterchurnPrecompiled))
      .catch(() => false);
  }
  function ensureMilkdropCanvas(){
    if (milkdropCanvas) return milkdropCanvas;
    const cv = document.createElement('canvas');
    cv.className = 'viz-canvas milkdrop-canvas';
    cv.setAttribute('aria-hidden', 'true');
    el.player.insertBefore(cv, el.player.querySelector('#vizCanvas, .dash') || null);
    milkdropCanvas = cv;
    return cv;
  }
  function milkdropTick(){
    if (viz.mode !== 'milkdrop' || !milkdropViz){ milkdropRAF = null; return; }
    // auto-resize check
    const r = el.player.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = Math.max(1, Math.round(r.width * dpr));
    const H = Math.max(1, Math.round(r.height * 0.5 * dpr));
    if (milkdropCanvas.width !== W || milkdropCanvas.height !== H){
      milkdropCanvas.width = W; milkdropCanvas.height = H;
      milkdropCanvas.style.width = Math.round(r.width) + 'px';
      milkdropCanvas.style.height = Math.round(r.height * 0.5) + 'px';
      try { milkdropViz.setRendererSize(W, H); } catch {}
    }
    milkdropViz.render();
    // auto-cycle presets every ~20s
    const now = performance.now();
    if (milkdropPresetNames && milkdropPresetNames.length > 1 && now - milkdropCycleT > 20000){
      milkdropCycleT = now;
      milkdropPresetIdx = (milkdropPresetIdx + 1) % milkdropPresetNames.length;
      try { milkdropViz.loadPreset(mdBuildPreset(milkdropPresets[milkdropPresetNames[milkdropPresetIdx]], mdGetParams("")), 1.5); } catch {}
    }
    milkdropRAF = requestAnimationFrame(milkdropTick);
  }
  async function startMilkdrop(){
    stopMilkdrop();
    const _wgl2 = milkdropSupported();
    console.log('[Milkdrop] start: WebGL2=' + _wgl2);
    if (!_wgl2){ setSyncStatus('Milkdrop needs WebGL 2.0 — unavailable in this browser', false); return; }
    const cv = ensureMilkdropCanvas();
    cv.classList.add('visible');
    cv.style.opacity = viz.opacity;        // opacity slider applies to Milkdrop too
    const r = el.player.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * 0.5 * dpr));
    cv.style.width = Math.round(r.width) + 'px';
    cv.style.height = Math.round(r.height * 0.5) + 'px';
    setSyncStatus('Loading Milkdrop\u2026', true);
    const ok = await ensureButterchurn();
    console.log('[Milkdrop] butterchurn loaded=' + ok + ' global=' + !!window.butterchurn + ' presets=' + !!(window.butterchurnPresets || window.butterchurnPresetsMinimal));
    if (!ok || !window.butterchurn){ setSyncStatus('Milkdrop failed to load', false); return; }
    const a = ensureVizGraph();
    if (!a || !vizAudioCtx){ setSyncStatus('Audio not ready \u2014 play a track first', false); return; }
    try {
      const bc = (window.butterchurn && (window.butterchurn.default || window.butterchurn));
      milkdropViz = bc.createVisualizer(vizAudioCtx, cv, { width: cv.width, height: cv.height });
      console.log('[Milkdrop] visualizer created ' + cv.width + 'x' + cv.height);
      milkdropViz.connectAudio(a); mdApplyQuality(milkdropViz, viz.mdQuality != null ? viz.mdQuality : 1);
      const presetsObj = window.butterchurnPresets || window.butterchurnPresetsMinimal;
      const presetsApi = (presetsObj && (presetsObj.default || presetsObj)) || {};
      milkdropPresets = presetsApi.getPresets ? presetsApi.getPresets() : {};
      milkdropPresetNames = Object.keys(milkdropPresets);
      const saved = viz.milkdropPreset;
      milkdropPresetIdx = Math.max(0, milkdropPresetNames.indexOf(saved));
      if (milkdropPresetNames.length){
        milkdropViz.loadPreset(mdBuildPreset(milkdropPresets[milkdropPresetNames[milkdropPresetIdx]], mdGetParams("")), 0.0);
      }
      milkdropCycleT = performance.now();
      setSyncStatus('Milkdrop ready \u2713', true);
      console.log('[Milkdrop] presets=' + (milkdropPresetNames ? milkdropPresetNames.length : 0) + ' rendering started');
      if (!milkdropRAF) milkdropRAF = requestAnimationFrame(milkdropTick);
    } catch(e){ console.error('[Milkdrop] error:', e); setSyncStatus('Milkdrop error: ' + (e.message || e), false); }
  }
  function cycleMilkdropPreset(dir){
    if (!milkdropPresetNames || !milkdropPresetNames.length) return;
    milkdropPresetIdx = (milkdropPresetIdx + dir + milkdropPresetNames.length) % milkdropPresetNames.length;
    const name = milkdropPresetNames[milkdropPresetIdx];
    if (milkdropViz) try { milkdropViz.loadPreset(mdBuildPreset(milkdropPresets[name], mdGetParams("")), 1.0); } catch {}
    milkdropCycleT = performance.now();
    viz.milkdropPreset = name;
    const el2 = document.getElementById('vizMilkdropPresetName');
    if (el2) el2.textContent = name.length > 40 ? name.slice(0, 37) + '\u2026' : name;
  }
  function stopMilkdrop(){
    if (milkdropRAF){ cancelAnimationFrame(milkdropRAF); milkdropRAF = null; }
    if (milkdropCanvas) milkdropCanvas.classList.remove('visible');
    milkdropViz = null;
  }

  // ============================================================
  // PLAYLIST VISUALISER — independent mode on the playlist circle.
  // Reuses the 2D draw functions (bars/radial/waveform/starfield/plasma)
  // at playlist-canvas dimensions. Has its own mode + opacity. Revealed
  // when the playlist cinema mode fades out the track list.
  // ============================================================
  function ensurePlVizCanvas(){
    if (plVizCanvas) return plVizCanvas;
    const plCircle = document.getElementById('playlistCircle');
    if (!plCircle) return null;
    const cv = document.createElement('canvas');
    cv.className = 'pl-viz-canvas';
    cv.setAttribute('aria-hidden', 'true');
    const scrim = plCircle.querySelector('.pl-scrim');
    plCircle.insertBefore(cv, scrim || null);
    plVizCanvas = cv;
    return cv;
  }
  function plVizTick(){
    if (viz.plMode === 'off' || !plVizCanvas){ plVizRAF = null; return; }
    if (!document.body.classList.contains('playlist-open')){
      plVizRAF = requestAnimationFrame(plVizTick); return;  // idle when closed
    }
    const cv = plVizCanvas;
    const r = el.plCircle.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = Math.max(1, Math.round(r.width * dpr));
    const H = Math.max(1, Math.round(r.height * dpr));
    if (cv.width !== W || cv.height !== H){
      cv.width = W; cv.height = H;
      cv.style.width = Math.round(r.width) + 'px';
      cv.style.height = Math.round(r.height) + 'px';
    }
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    const a = ensureVizGraph();
    if (!vizFreq) vizFreq = new Uint8Array(a ? a.frequencyBinCount : 256);
    if (!vizWave) vizWave = new Uint8Array(a ? a.frequencyBinCount : 256);
    if (a){ a.getByteFrequencyData(vizFreq); a.getByteTimeDomainData(vizWave); }
    else { vizFreq.fill(0); vizWave.fill(128); }
    const t = performance.now() / 1000;
    const pal = vizPalette();
    ctx.globalAlpha = viz.plOpacity;
    // swap to PL-independent settings for the draw
    const _sv = { s: viz.sensitivity, b: viz.bars, c: viz.colors };
    if (viz.plSensitivity != null) viz.sensitivity = viz.plSensitivity;
    if (viz.plBars != null) viz.bars = viz.plBars;
    if (viz.plColors) viz.colors = viz.plColors;
    if (viz.plMode === 'coaster' || viz.plMode === 'milkdrop'){ plVizRAF = null; return; }
    if (viz.plMode === 'bars') drawBars(ctx, W, H, vizFreq, pal);
    else if (viz.plMode === 'radial') drawRadial(ctx, W, H, vizFreq, pal, t);
    else if (viz.plMode === 'waveform') drawWaveform(ctx, W, H, vizWave);
    else if (viz.plMode === 'starfield') drawStarfield(ctx, W, H, vizFreq, pal, t);
    else if (viz.plMode === 'plasma') drawPlasma(ctx, W, H, vizFreq, pal, t);
    ctx.globalAlpha = 1;
    viz.sensitivity = _sv.s; viz.bars = _sv.b; viz.colors = _sv.c;
    plVizRAF = requestAnimationFrame(plVizTick);
  }
  // ---- playlist Milkdrop (second butterchurn instance on the playlist circle) ----
  let plMilkdropCanvas = null, plMilkdropViz = null, plMilkdropRAF = null, plMilkdropCycleT = 0;
  function ensurePlMilkdropCanvas(){
    if (plMilkdropCanvas) return plMilkdropCanvas;
    const plCircle = document.getElementById('playlistCircle');
    if (!plCircle) return null;
    const cv = document.createElement('canvas');
    cv.className = 'pl-viz-canvas-milkdrop';
    cv.setAttribute('aria-hidden', 'true');
    const scrim = plCircle.querySelector('.pl-scrim');
    plCircle.insertBefore(cv, scrim || null);
    plMilkdropCanvas = cv;
    return cv;
  }
  async function startPlMilkdrop(){
    stopPlMilkdrop();
    if (!milkdropSupported()) return;
    const cv = ensurePlMilkdropCanvas();
    if (!cv) return;
    cv.classList.add('visible');
    if (plVizCanvas) plVizCanvas.classList.remove('visible');
    const r = el.plCircle.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * dpr));
    cv.style.width = Math.round(r.width) + 'px';
    cv.style.height = Math.round(r.height) + 'px';
    const ok = await ensureButterchurn();
    if (!ok || !window.butterchurn) return;
    const a = ensureVizGraph();
    if (!a || !vizAudioCtx) return;
    try {
      const bc = window.butterchurn.default || window.butterchurn;
      plMilkdropViz = bc.createVisualizer(vizAudioCtx, cv, { width: cv.width, height: cv.height });
      plMilkdropViz.connectAudio(a); mdApplyQuality(plMilkdropViz, viz.plMdQuality != null ? viz.plMdQuality : 1);
      const presetsObj = window.butterchurnPresets || window.butterchurnPresetsMinimal;
      const presetsApi = (presetsObj && (presetsObj.default || presetsObj)) || {};
      const presets = presetsApi.getPresets ? presetsApi.getPresets() : {};
      const names = Object.keys(presets);
      // Use the SAVED preset if set; otherwise random. This stops the preset
      // from changing on every restart (e.g. when toggling blend modes).
      let startIdx;
      const savedName = viz.plMilkdropPreset;
      if (savedName && names.indexOf(savedName) >= 0) startIdx = names.indexOf(savedName);
      else startIdx = Math.floor(Math.random() * names.length);
      milkdropPresetIdx = startIdx;
      const startName = names[startIdx] || '';
      if (names.length) plMilkdropViz.loadPreset(mdBuildPreset(presets[startName], mdGetParams("pl")), 0.0);
      viz.plMilkdropPreset = startName;
      { const lbl = document.getElementById('vizPlMilkdropPresetName'); if (lbl) lbl.textContent = startName.length > 40 ? startName.slice(0,37)+'\u2026' : startName; }
      if (!milkdropPresets) { milkdropPresets = presets; milkdropPresetNames = names; }
      cv.style.opacity = String(viz.plOpacity || 0.85);
      plMilkdropCycleT = performance.now();
      console.log('[PlMilkdrop] started, preset=' + startName + ' presets=' + names.length);
      function tick(){
        if (viz.plMode !== 'milkdrop' || !plMilkdropViz){ plMilkdropRAF = null; return; }
        if (!document.body.classList.contains('playlist-open')){ plMilkdropRAF = requestAnimationFrame(tick); return; }
        plMilkdropViz.render();
        // auto-cycle presets every ~20s when Auto is on (default)
        if (viz.plMilkdropAuto !== false && milkdropPresetNames && milkdropPresetNames.length > 1){
          const now = performance.now();
          if (now - plMilkdropCycleT > 20000){
            plMilkdropCycleT = now;
            milkdropPresetIdx = (milkdropPresetIdx + 1) % milkdropPresetNames.length;
            const nm = milkdropPresetNames[milkdropPresetIdx];
            try { plMilkdropViz.loadPreset(mdBuildPreset(milkdropPresets[nm], mdGetParams("pl")), 1.5); } catch {}
            viz.plMilkdropPreset = nm;
            const lbl2 = document.getElementById('vizPlMilkdropPresetName');
            if (lbl2) lbl2.textContent = nm.length > 40 ? nm.slice(0,37)+'\u2026' : nm;
          }
        }
        plMilkdropRAF = requestAnimationFrame(tick);
      }
      if (!plMilkdropRAF) plMilkdropRAF = requestAnimationFrame(tick);
    } catch(e){ console.error('[PlMilkdrop] error:', e); }
  }
  function stopPlMilkdrop(){
    if (plMilkdropRAF){ cancelAnimationFrame(plMilkdropRAF); plMilkdropRAF = null; }
    if (plMilkdropCanvas) plMilkdropCanvas.classList.remove('visible');
    plMilkdropViz = null;
  }
  // ---- PL mirror: renders the main player's CURRENT viz mode on a separate
  // canvas behind the PL viz, so the user can layer mirror + independent viz.
  let plMirrorCanvas = null, plMirrorRAF = null;
  function ensurePlMirrorCanvas(){
    if (plMirrorCanvas) return plMirrorCanvas;
    const plCircle = document.getElementById('playlistCircle');
    if (!plCircle) return null;
    const cv = document.createElement('canvas');
    cv.className = 'pl-viz-canvas pl-mirror-canvas';
    cv.setAttribute('aria-hidden', 'true');
    const ref = plCircle.querySelector('.pl-viz-canvas:not(.pl-mirror-canvas), .pl-scrim');
    plCircle.insertBefore(cv, ref || null);
    plMirrorCanvas = cv;
    return cv;
  }
  function plMirrorTick(){
    if (!viz.plMirror || !plMirrorCanvas || viz.mode === 'off'){ plMirrorRAF = null; return; }
    if (!document.body.classList.contains('playlist-open')){ plMirrorRAF = requestAnimationFrame(plMirrorTick); return; }
    const cv = plMirrorCanvas;
    const r = el.plCircle.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = Math.max(1, Math.round(r.width * dpr)), H = Math.max(1, Math.round(r.height * dpr));
    if (cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; cv.style.width = Math.round(r.width)+'px'; cv.style.height = Math.round(r.height)+'px'; }
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    const a = ensureVizGraph();
    if (!vizFreq) vizFreq = new Uint8Array(a ? a.frequencyBinCount : 256);
    if (a) a.getByteFrequencyData(vizFreq); else vizFreq.fill(0);
    const t = performance.now() / 1000;
    const pal = vizPalette();
    ctx.globalAlpha = (viz.plOpacity || 0.85) * 0.5;
    const m = viz.mode;
    if (m === 'bars') drawBars(ctx, W, H, vizFreq, pal);
    else if (m === 'radial') drawRadial(ctx, W, H, vizFreq, pal, t);
    else if (m === 'starfield') drawStarfield(ctx, W, H, vizFreq, pal, t);
    else if (m === 'plasma') drawPlasma(ctx, W, H, vizFreq, pal, t);
    ctx.globalAlpha = 1;
    plMirrorRAF = requestAnimationFrame(plMirrorTick);
  }
  function startPlMirror(){
    ensurePlMirrorCanvas();
    if (plMirrorCanvas) plMirrorCanvas.classList.add('visible');
    if (!plMirrorRAF) plMirrorRAF = requestAnimationFrame(plMirrorTick);
  }
  function stopPlMirror(){
    if (plMirrorRAF){ cancelAnimationFrame(plMirrorRAF); plMirrorRAF = null; }
    if (plMirrorCanvas) plMirrorCanvas.classList.remove('visible');
  }
  // ---- PL Milkdrop preset cycle
  function cyclePlMilkdropPreset(dir){
    if (!milkdropPresetNames || !milkdropPresetNames.length) return;
    let idx = milkdropPresetIdx;
    idx = (idx + dir + milkdropPresetNames.length) % milkdropPresetNames.length;
    milkdropPresetIdx = idx;
    const name = milkdropPresetNames[idx];
    if (plMilkdropViz) try { plMilkdropViz.loadPreset(mdBuildPreset(milkdropPresets[name], mdGetParams("pl")), 1.0); } catch {}
    viz.plMilkdropPreset = name;
    const el2 = document.getElementById('vizPlMilkdropPresetName');
    if (el2) el2.textContent = name.length > 40 ? name.slice(0, 37) + '\u2026' : name;
  }

  // ---- PLAYLIST 3D rollercoaster (Entry S21) ----
  // Independent instance on the playlist circle. The viz3d module is shared
  // with the main player (already lazy-loaded by ensureViz3D when either
  // coaster is picked), but create('playlistCircle', ...) builds a fully
  // separate scene/camera/renderer/composer. This loop only feeds it
  // audio-reactive bloom (the module draws itself).
  function plCoasterTick(){
    if (viz.plMode !== 'coaster' || !plCoasterInst || !plCoasterInst.active){ plCoasterRAF = null; return; }
    if (!document.body.classList.contains('playlist-open')){ plCoasterRAF = requestAnimationFrame(plCoasterTick); return; }
    const a = ensureVizGraph();
    if (!vizFreq) vizFreq = new Uint8Array(a ? a.frequencyBinCount : 256);
    let bass = 0;
    if (a){ a.getByteFrequencyData(vizFreq); for (let i = 0; i < 6; i++) bass += vizFreq[i] || 0; bass = bass / 6 / 255; }
    const strength = (0.8 + bass * 3.0) * ((viz.plSensitivity != null ? viz.plSensitivity : 100) / 100);
    plCoasterInst.setIntensity(strength);
    plCoasterRAF = requestAnimationFrame(plCoasterTick);
  }
  function startPlCoaster(){
    stopPlCoaster();
    const activate = () => {
      if (!window.RoundViz3D || !window.RoundViz3D.create) return;
      if (!plCoasterInst){
        plCoasterInst = window.RoundViz3D.create('playlistCircle', {
          heightFraction: 1, scaleMode: 'pl',
          canvasClass: 'pl-viz-canvas-3d', fogClass: 'pl-viz-fog-layer'
        });
      }
      if (!plCoasterInst) return;
      plCoasterInst.setColors(viz.plColors || 'theme');
      plCoasterInst.setFog((viz.plFog || 0) / 100);  // PL coaster black-fog amount (slider)
      // only render while the playlist disc is OPEN (its internal three.js
      // loop would otherwise burn GPU while the disc is closed/invisible)
      if (document.body.classList.contains('playlist-open')){
        plCoasterInst.setActive(true);
        if (!plCoasterRAF) plCoasterRAF = requestAnimationFrame(plCoasterTick);
      }
    };
    if (window.RoundViz3D && window.RoundViz3D.create) activate();
    else ensureViz3D().then(ok => { if (ok && viz.plMode === 'coaster') activate(); });
  }
  function stopPlCoaster(){
    if (plCoasterRAF){ cancelAnimationFrame(plCoasterRAF); plCoasterRAF = null; }
    if (plCoasterInst) plCoasterInst.setActive(false);
  }

  // ============================================================
  // PLAYLIST EDGE / RIM VISUALISER (Entry S21) — pulses around the
  // OUTSIDE of the playlist disc. Reuses the 8 main edge draw functions,
  // but with PLAYLIST-specific settings (plEdgeMode/reach/...) and its own
  // analyser + ripple/particle state, swapped in around the draw so the
  // main edge is never disturbed. Glides RIGHT (opposite of the main edge).
  // ============================================================
  function ensurePlEdgeCanvas(){
    if (elPlEdge) return elPlEdge;
    const pair = document.getElementById('playerPair');
    if (!pair) return null;
    const cv = document.createElement('canvas');
    cv.className = 'pl-edge';
    cv.setAttribute('aria-hidden', 'true');
    pair.appendChild(cv);
    elPlEdge = cv;
    return cv;
  }
  function sizePlEdgeCanvas(){
    const cv = elPlEdge; if (!cv || !el.plCircle) return;
    const r = el.plCircle.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const box = Math.max(1, r.width * EDGE_BOX);
    cv.width = Math.max(1, Math.round(box * dpr));
    cv.height = Math.max(1, Math.round(box * dpr));
    cv.style.width = box + 'px';
    cv.style.height = box + 'px';
  }
  function plEdgeTick(){
    if (viz.plEdgeMode === 'off' || !elPlEdge){ plEdgeRAF = null; return; }
    if (!document.body.classList.contains('playlist-open')){ plEdgeRAF = requestAnimationFrame(plEdgeTick); return; }
    const cv = elPlEdge;
    if (!cv.width || !cv.height){ sizePlEdgeCanvas(); plEdgeRAF = requestAnimationFrame(plEdgeTick); return; }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const pr = el.plCircle.getBoundingClientRect();
    if (Math.round(pr.width * EDGE_BOX * dpr) !== cv.width) sizePlEdgeCanvas();   // auto-resize
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    ensureVizGraph();   // creates the audio graph AND the independent PL edge analyser
    if (plEdgeAnalyser){
      const esm = viz.plEdgeSmoothing != null ? viz.plEdgeSmoothing : 0.82;
      if (plEdgeAnalyser.smoothingTimeConstant !== esm) plEdgeAnalyser.smoothingTimeConstant = esm;
      if (!plEdgeFreq || plEdgeFreq.length !== plEdgeAnalyser.frequencyBinCount) plEdgeFreq = new Uint8Array(plEdgeAnalyser.frequencyBinCount);
      plEdgeAnalyser.getByteFrequencyData(plEdgeFreq);
    } else {
      if (!plEdgeFreq) plEdgeFreq = new Uint8Array(256);
      plEdgeFreq.fill(0);
    }
    // ---- swap the main-edge settings + beat state -> PLAYLIST values ----
    // The 8 draw functions read module-level viz.edge* + the shared ripple/
    // particle/bass state; swapping them in (then restoring) lets the PL edge
    // reuse that code with fully independent settings, without touching the
    // working main edge.
    const _sv = { em: viz.edgeMode, er: viz.edgeReach, es: viz.edgeSensitivity, eo: viz.edgeOpacity, eb: viz.edgeBars, ec: viz.edgeColors, ecc: viz.edgeCustomColors };
    viz.edgeMode = viz.plEdgeMode;
    viz.edgeReach = viz.plEdgeReach != null ? viz.plEdgeReach : 35;
    viz.edgeSensitivity = viz.plEdgeSensitivity != null ? viz.plEdgeSensitivity : 100;
    viz.edgeOpacity = viz.plEdgeOpacity != null ? viz.plEdgeOpacity : 0.85;
    viz.edgeBars = viz.plEdgeBars != null ? viz.plEdgeBars : 48;
    viz.edgeColors = viz.plEdgeColors || 'theme';
    viz.edgeCustomColors = (viz.plEdgeCustomColors && viz.plEdgeCustomColors.length === 3) ? viz.plEdgeCustomColors : ['#ffffff', '#ff2992', '#29d5ff'];
    const _r = vizEdgeRipples; vizEdgeRipples = plEdgeRipples;
    const _p = vizEdgeParticles; vizEdgeParticles = plEdgeParticles;
    const _eb = _edgeBass, _epb = _edgePrevBass, _efb = _edgeFluxBase, _els = _edgeLastSpawn, _elsb = _edgeLastSeenBeat, _ebp = _edgeBeatPeriod;
    _edgeBass = _plEdgeBass; _edgePrevBass = _plEdgePrevBass; _edgeFluxBase = _plEdgeFluxBase;
    _edgeLastSpawn = _plEdgeLastSpawn; _edgeLastSeenBeat = _plEdgeLastSeenBeat; _edgeBeatPeriod = _plEdgeBeatPeriod;

    const t = performance.now() / 1000;
    const cx = cv.width / 2, cy = cv.height / 2;
    const R = Math.max(1, (pr.width / 2) * dpr);
    const reach = (viz.edgeReach / 100) * (EDGE_BOX - 1) * R;   // outward px, clamped to canvas room
    const pal = edgePalette();
    ctx.globalAlpha = viz.edgeOpacity;
    switch (viz.edgeMode){
      case 'edge-bars':   drawEdgeBars(ctx, cx, cy, R, reach, plEdgeFreq, pal, t, dpr); break;
      case 'edge-mirror': drawEdgeMirror(ctx, cx, cy, R, reach, plEdgeFreq, pal, t, dpr); break;
      case 'edge-bass':   drawEdgeBassRing(ctx, cx, cy, R, reach, plEdgeFreq, pal, t, dpr); break;
      case 'edge-ripple': drawEdgeRipples(ctx, cx, cy, R, reach, plEdgeFreq, pal, t, dpr); break;
      case 'edge-polar':  drawEdgePolar(ctx, cx, cy, R, reach, plEdgeFreq, pal, t, dpr); break;
      case 'edge-rings':  drawEdgeRings(ctx, cx, cy, R, reach, plEdgeFreq, pal, t, dpr); break;
      case 'edge-orbit':  drawEdgeOrbit(ctx, cx, cy, R, reach, plEdgeFreq, pal, t, dpr); break;
      case 'edge-blocks': drawEdgeBlocks(ctx, cx, cy, R, reach, plEdgeFreq, pal, t, dpr); break;
    }
    ctx.globalAlpha = 1;

    // ---- restore the PL beat state + main-edge settings ----
    plEdgeRipples = vizEdgeRipples; vizEdgeRipples = _r;
    plEdgeParticles = vizEdgeParticles; vizEdgeParticles = _p;
    _plEdgeBass = _edgeBass; _plEdgePrevBass = _edgePrevBass; _plEdgeFluxBase = _edgeFluxBase;
    _plEdgeLastSpawn = _edgeLastSpawn; _plEdgeLastSeenBeat = _edgeLastSeenBeat; _plEdgeBeatPeriod = _edgeBeatPeriod;
    _edgeBass = _eb; _edgePrevBass = _epb; _edgeFluxBase = _efb; _edgeLastSpawn = _els; _edgeLastSeenBeat = _elsb; _edgeBeatPeriod = _ebp;
    viz.edgeMode = _sv.em; viz.edgeReach = _sv.er; viz.edgeSensitivity = _sv.es; viz.edgeOpacity = _sv.eo; viz.edgeBars = _sv.eb; viz.edgeColors = _sv.ec; viz.edgeCustomColors = _sv.ecc;

    plEdgeRAF = requestAnimationFrame(plEdgeTick);
  }
  function applyPlEdgeViz(){
    if (!elPlEdge && viz.plEdgeMode && viz.plEdgeMode !== 'off') ensurePlEdgeCanvas();
    if (!elPlEdge) return;
    const on = viz.plEdgeMode && viz.plEdgeMode !== 'off';
    elPlEdge.classList.toggle('visible', on);
    if (on){
      sizePlEdgeCanvas();
      if (!plEdgeRAF) plEdgeRAF = requestAnimationFrame(plEdgeTick);
    } else {
      if (plEdgeRAF){ cancelAnimationFrame(plEdgeRAF); plEdgeRAF = null; }
      if (elPlEdge.width){ const ctx = elPlEdge.getContext('2d'); ctx.clearRect(0, 0, elPlEdge.width, elPlEdge.height); }
      plEdgeRipples = [];
    }
  }

  function applyPlViz(){
    if (!el.plCircle) return;
    const on = viz.plMode && viz.plMode !== 'off';
    el.plCircle.classList.toggle('pl-viz-active', on);
    // Entry S25: blend the PL in-circle visualiser over the panel backdrop.
    // Setting to '' removes the inline var -> CSS defaults (normal / screen) apply.
    if (viz.plVizBlend) plVar('--pl-viz-blend-mode', viz.plVizBlendMode || 'normal');
    else plVar('--pl-viz-blend-mode', '');
    applyPlVizBlendOpacity();
    // when NO PL viz is active, restore pl-media-off so the backdrop hides
    // (showing the colour scheme) unless the user explicitly enabled media
    if (!on){
      const t = demoPlaylist[state.currentIndex];
      const mediaOn = !!(t && t.plMedia === true);
      el.plCircle.classList.toggle('pl-media-off', !mediaOn);
    }
    // force the backdrop visible + populated with the track's cover art
    if (on){
      const t = demoPlaylist[state.currentIndex];
      const plCover = document.getElementById('plCover');
      if (plCover && t && t.cover && !plCover.src){ plCover.src = t.cover; }
      if (el.plCircle) el.plCircle.classList.remove('pl-media-off');
    }
    // mirror layer
    if (viz.plMirror && on) startPlMirror(); else stopPlMirror();
    if (on && !plVizCanvas && viz.plMode !== 'milkdrop' && viz.plMode !== 'coaster') ensurePlVizCanvas();
    const is2D = on && viz.plMode !== 'milkdrop' && viz.plMode !== 'coaster';
    if (plVizCanvas) plVizCanvas.classList.toggle('visible', is2D);
    if (viz.plMode === 'milkdrop') { if (!plMilkdropViz) startPlMilkdrop(); } else stopPlMilkdrop();
    if (viz.plMode === 'coaster') startPlCoaster(); else stopPlCoaster();
    if (is2D){
      if (!plVizRAF) plVizRAF = requestAnimationFrame(plVizTick);
    } else {
      if (plVizRAF){ cancelAnimationFrame(plVizRAF); plVizRAF = null; }
      if (plVizCanvas && plVizCanvas.width){ const c = plVizCanvas.getContext('2d'); c.clearRect(0,0,plVizCanvas.width,plVizCanvas.height); }
    }
  }

  // Entry S26: blend STRENGTH = how much of the blended visualiser shows over
  // the art/video. Implemented as the in-circle canvas opacity while blending
  // (the standard "layer opacity = blend amount" control). When blend is OFF
  // the canvases revert to their normal opacity (viz.opacity / plOpacity).
  function applyVizBlendOpacity(){
    const op = viz.vizBlend ? clamp(viz.vizBlendStrength != null ? viz.vizBlendStrength : 1, 0, 1) : null;
    if (el.vizCanvas) el.vizCanvas.style.opacity = (op != null) ? String(op) : '';
    const cv3d = el.player.querySelector('.viz-canvas-3d');
    if (cv3d) cv3d.style.opacity = (op != null) ? String(op) : String(viz.opacity);
    const md = el.player.querySelector('.milkdrop-canvas');
    if (md) md.style.opacity = (op != null) ? String(op) : String(viz.opacity);
  }
  function applyPlVizBlendOpacity(){
    if (!el.plCircle) return;
    const op = viz.plVizBlend ? clamp(viz.plVizBlendStrength != null ? viz.plVizBlendStrength : 1, 0, 1) : null;
    if (plVizCanvas) plVizCanvas.style.opacity = (op != null) ? String(op) : '';
    const plMd = document.querySelector('.pl-viz-canvas-milkdrop');
    if (plMd) plMd.style.opacity = (op != null) ? String(op) : String(viz.plOpacity != null ? viz.plOpacity : 0.85);
    const pl3d = el.plCircle.querySelector('.pl-viz-canvas-3d');
    if (pl3d) pl3d.style.opacity = (op != null) ? String(op) : '';
  }

  function applyViz(){
    const cv = el.vizCanvas;
    if (!cv) return;
    const active = viz.mode !== 'off';
    const isCoaster = viz.mode === 'coaster';
    const isMilkdrop = viz.mode === 'milkdrop';
    const cv3d = el.player.querySelector('.viz-canvas-3d');
    cv.classList.toggle('visible', active && !isCoaster && !isMilkdrop);
    // "Show artwork behind the visualiser" applies to EVERY mode (incl. 3D)
    el.player.classList.toggle('viz-hide-art', active && !viz.artwork);
    // Entry S25: blend the in-circle visualiser over the cover art/video.
    // Removing the inline var restores the CSS defaults (normal for 2D/milkdrop,
    // screen for the coaster).
    if (viz.vizBlend) el.player.style.setProperty('--viz-blend-mode', viz.vizBlendMode || 'normal');
    else el.player.style.removeProperty('--viz-blend-mode');
    applyVizBlendOpacity();
    if (isCoaster){
      // 3D rollercoaster: hand the media window to the WebGL module
      if (cv3d){
        cv3d.classList.add('visible');
        cv3d.style.opacity = viz.opacity;      // opacity fader works on 3D too
      }
      const activate = () => {
        if (!window.RoundViz3D) return;
        window.RoundViz3D.setColors(viz.colors);   // colours dropdown -> coaster
        window.RoundViz3D.setFog((viz.fog || 0) / 100);   // black-fog slider
        window.RoundViz3D.setActive(true);
        if (!vizRAF) vizRAF = requestAnimationFrame(vizTick);  // bloom reactivity loop
      };
      if (window.RoundViz3D) activate();
      else ensureViz3D().then(ok => { if (ok && viz.mode === 'coaster') activate(); });
      return;
    }
    // 2D modes
    if (cv3d && window.RoundViz3D && window.RoundViz3D.active) window.RoundViz3D.setActive(false);
    if (isMilkdrop){
      if (vizRAF){ cancelAnimationFrame(vizRAF); vizRAF = null; }
      const ctx2d = cv.getContext('2d'); if (ctx2d && cv.width) ctx2d.clearRect(0, 0, cv.width, cv.height);
      startMilkdrop();
      return;
    }
    stopMilkdrop();
    if (active){
      sizeVizCanvas();
      if (vizAnalyser){
        vizAnalyser.fftSize = viz.fft || 512;
        vizAnalyser.smoothingTimeConstant = viz.smoothing || 0.82;
        vizFreq = null; vizWave = null;
      }
      if (!vizRAF) vizRAF = requestAnimationFrame(vizTick);
    } else {
      if (vizRAF){ cancelAnimationFrame(vizRAF); vizRAF = null; }
      const ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, cv.width, cv.height);
    }
  }

  function vizSyncUI(){
    const g = id => document.getElementById(id);
    const set = (id, val) => { const e = g(id); if (e) e.value = val; };
    const setVal = (id, txt) => { const e = g(id); if (e) e.textContent = txt; };
    set('vizMode', viz.mode);
    set('vizSensitivity', viz.sensitivity);
    setVal('vizSensitivityVal', viz.sensitivity + '%');
    set('vizSmoothing', Math.round(viz.smoothing * 100));
    setVal('vizSmoothingVal', viz.smoothing.toFixed(2));
    set('vizOpacity', Math.round(viz.opacity * 100));
    setVal('vizOpacityVal', Math.round(viz.opacity * 100) + '%');
    set('vizBars', viz.bars);
    setVal('vizBarsVal', viz.bars);
    set('vizFFT', viz.fft);
    set('vizColors', viz.colors);
    set('vizStarSize', viz.starSize);
    setVal('vizStarSizeVal', (viz.starSize || 2).toFixed(1) + '×');
    set('vizFog', viz.fog || 0);
    setVal('vizFogVal', (viz.fog || 0) + '%');
    const art = g('vizArtwork'); if (art) art.checked = !!viz.artwork;
    // Entry S25: visualiser blend toggles + mode dropdowns
    { const vb = g('vizBlend'); if (vb) vb.checked = !!viz.vizBlend; }
    set('vizBlendMode', viz.vizBlendMode || 'overlay');
    set('vizBlendStrength', Math.round((viz.vizBlendStrength != null ? viz.vizBlendStrength : 1) * 100));
    setVal('vizBlendStrengthVal', Math.round((viz.vizBlendStrength != null ? viz.vizBlendStrength : 1) * 100) + '%');
    { const pvb = g('vizPlBlend'); if (pvb) pvb.checked = !!viz.plVizBlend; }
    set('vizPlBlendMode', viz.plVizBlendMode || 'overlay');
    set('vizPlBlendStrength', Math.round((viz.plVizBlendStrength != null ? viz.plVizBlendStrength : 1) * 100));
    setVal('vizPlBlendStrengthVal', Math.round((viz.plVizBlendStrength != null ? viz.plVizBlendStrength : 1) * 100) + '%');
    // star-size row only matters in starfield mode
    const ssRow = g('vizStarSizeRow');
    if (ssRow) ssRow.classList.toggle('visible', viz.mode === 'starfield');
    // black-fog row only matters in coaster mode
    const fogRow = g('vizFogRow');
    if (fogRow) fogRow.classList.toggle('visible', viz.mode === 'coaster');
    // custom 3-colour row shows only when Colours = custom
    const cRow = g('vizCustomRow'); if (cRow) cRow.classList.toggle('visible', viz.colors === 'custom');
    const cc = (viz.customColors && viz.customColors.length === 3) ? viz.customColors : ['#ffffff','#ff2992','#29d5ff'];
    set('vizCustom1', cc[0]); set('vizCustom2', cc[1]); set('vizCustom3', cc[2]);
    set('vizEdgeMode', viz.edgeMode || 'off');
    set('vizEdgeReach', viz.edgeReach != null ? viz.edgeReach : 35);
    setVal('vizEdgeReachVal', (viz.edgeReach != null ? viz.edgeReach : 35) + '%');
    set('vizEdgeSensitivity', viz.edgeSensitivity != null ? viz.edgeSensitivity : 100);
    setVal('vizEdgeSensitivityVal', (viz.edgeSensitivity != null ? viz.edgeSensitivity : 100) + '%');
    set('vizEdgeSmoothing', Math.round((viz.edgeSmoothing != null ? viz.edgeSmoothing : 0.82) * 100));
    setVal('vizEdgeSmoothingVal', (viz.edgeSmoothing != null ? viz.edgeSmoothing : 0.82).toFixed(2));
    set('vizEdgeOpacity', Math.round((viz.edgeOpacity != null ? viz.edgeOpacity : 0.85) * 100));
    setVal('vizEdgeOpacityVal', Math.round((viz.edgeOpacity != null ? viz.edgeOpacity : 0.85) * 100) + '%');
    set('vizEdgeBars', viz.edgeBars != null ? viz.edgeBars : 48);
    setVal('vizEdgeBarsVal', viz.edgeBars != null ? viz.edgeBars : 48);
    set('vizEdgeColors', viz.edgeColors || 'theme');
    { const ecc = (viz.edgeCustomColors && viz.edgeCustomColors.length === 3) ? viz.edgeCustomColors : ['#ffffff','#ff2992','#29d5ff'];
      set('vizEdgeCustom1', ecc[0]); set('vizEdgeCustom2', ecc[1]); set('vizEdgeCustom3', ecc[2]); }
    set('vizPlMode', viz.plMode || 'off');
    { const pm = g('vizPlMirror'); if (pm) pm.checked = !!viz.plMirror; }
    set('vizPlSensitivity', viz.plSensitivity != null ? viz.plSensitivity : 100);
    setVal('vizPlSensitivityVal', (viz.plSensitivity != null ? viz.plSensitivity : 100) + '%');
    set('vizPlBars', viz.plBars != null ? viz.plBars : 32);
    setVal('vizPlBarsVal', viz.plBars != null ? viz.plBars : 32);
    set('vizPlColors', viz.plColors || 'theme');
    { const plc = (viz.customColors && viz.customColors.length === 3) ? viz.customColors : ['#ffffff','#ff2992','#29d5ff'];
      set('vizPlCustom1', plc[0]); set('vizPlCustom2', plc[1]); set('vizPlCustom3', plc[2]); }
    { const plCr = g('vizPlCustomRow'); if (plCr) plCr.classList.toggle('visible', (viz.plColors || 'theme') === 'custom'); }
    { const plmdOn = viz.plMode === 'milkdrop'; const plmdRow = g('vizPlMilkdropRow'); if (plmdRow) plmdRow.classList.toggle('visible', plmdOn); }
    { const plma = g('vizPlMilkdropAuto'); if (plma) plma.checked = viz.plMilkdropAuto !== false; }
    set('vizPlFog', viz.plFog || 0);
    setVal('vizPlFogVal', (viz.plFog || 0) + '%');
    { const plFogRow = g('vizPlFogRow'); if (plFogRow) plFogRow.classList.toggle('visible', viz.plMode === 'coaster'); }
    set('vizPlOpacity', Math.round((viz.plOpacity != null ? viz.plOpacity : 0.85) * 100));
    setVal('vizPlOpacityVal', Math.round((viz.plOpacity != null ? viz.plOpacity : 0.85) * 100) + '%');
    // ---- playlist edge / rim visualiser (Entry S21) ----
    set('vizPlEdgeMode', viz.plEdgeMode || 'off');
    set('vizPlEdgeReach', viz.plEdgeReach != null ? viz.plEdgeReach : 35);
    setVal('vizPlEdgeReachVal', (viz.plEdgeReach != null ? viz.plEdgeReach : 35) + '%');
    set('vizPlEdgeSensitivity', viz.plEdgeSensitivity != null ? viz.plEdgeSensitivity : 100);
    setVal('vizPlEdgeSensitivityVal', (viz.plEdgeSensitivity != null ? viz.plEdgeSensitivity : 100) + '%');
    set('vizPlEdgeSmoothing', Math.round((viz.plEdgeSmoothing != null ? viz.plEdgeSmoothing : 0.82) * 100));
    setVal('vizPlEdgeSmoothingVal', (viz.plEdgeSmoothing != null ? viz.plEdgeSmoothing : 0.82).toFixed(2));
    set('vizPlEdgeOpacity', Math.round((viz.plEdgeOpacity != null ? viz.plEdgeOpacity : 0.85) * 100));
    setVal('vizPlEdgeOpacityVal', Math.round((viz.plEdgeOpacity != null ? viz.plEdgeOpacity : 0.85) * 100) + '%');
    set('vizPlEdgeBars', viz.plEdgeBars != null ? viz.plEdgeBars : 48);
    setVal('vizPlEdgeBarsVal', viz.plEdgeBars != null ? viz.plEdgeBars : 48);
    set('vizPlEdgeColors', viz.plEdgeColors || 'theme');
    { const pec = (viz.plEdgeCustomColors && viz.plEdgeCustomColors.length === 3) ? viz.plEdgeCustomColors : ['#ffffff','#ff2992','#29d5ff'];
      set('vizPlEdgeCustom1', pec[0]); set('vizPlEdgeCustom2', pec[1]); set('vizPlEdgeCustom3', pec[2]); }
    { const pleOn = (viz.plEdgeMode || 'off') !== 'off';
      const ples = g('vizPlEdgeSettings'); if (ples) ples.classList.toggle('visible', pleOn);
      const plecr = g('vizPlEdgeCustomRow'); if (plecr) plecr.classList.toggle('visible', pleOn && viz.plEdgeColors === 'custom'); }
    { const mdOn = viz.mode === 'milkdrop';
      const mdRow = g('vizMilkdropRow'); if (mdRow) mdRow.classList.toggle('visible', mdOn);
      const mdParamRow = g('vizMdRow'); if (mdParamRow) mdParamRow.classList.toggle('visible', mdOn);
      if (mdOn && milkdropPresetNames){ const nm = milkdropPresetNames[milkdropPresetIdx] || ''; const mdn = g('vizMilkdropPresetName'); if (mdn) mdn.textContent = nm.length > 40 ? nm.slice(0,37)+'\u2026' : nm; }
      set('vizMdDecay', Math.round((viz.mdDecay || 0) * 100)); setVal('vizMdDecayVal', viz.mdDecay > 0 ? Math.round(viz.mdDecay*100)+'%' : 'Preset');
      set('vizMdZoom', Math.round((viz.mdZoom||1)*100)); setVal('vizMdZoomVal', (viz.mdZoom!=null?viz.mdZoom:1).toFixed(2)+'\u00d7');
      set('vizMdWarp', Math.round((viz.mdWarp||1)*100)); setVal('vizMdWarpVal', (viz.mdWarp!=null?viz.mdWarp:1).toFixed(2)+'\u00d7');
      set('vizMdSensitivity', Math.round((viz.mdSensitivity||1)*100)); setVal('vizMdSensitivityVal', (viz.mdSensitivity!=null?viz.mdSensitivity:1).toFixed(2)+'\u00d7');
      set('vizMdTint', viz.mdTint||0); setVal('vizMdTintVal', (viz.mdTint||0)+'%'); set('vizMdQuality', String(viz.mdQuality!=null?viz.mdQuality:1));
      const plMdOn = viz.plMode === 'milkdrop';
      const plMdParamRow = g('vizPlMdRow'); if (plMdParamRow) plMdParamRow.classList.toggle('visible', plMdOn);
      set('vizPlMdDecay', Math.round((viz.plMdDecay||0)*100)); setVal('vizPlMdDecayVal', viz.plMdDecay>0?Math.round(viz.plMdDecay*100)+'%':'Preset');
      set('vizPlMdZoom', Math.round((viz.plMdZoom||1)*100)); setVal('vizPlMdZoomVal', (viz.plMdZoom!=null?viz.plMdZoom:1).toFixed(2)+'\u00d7');
      set('vizPlMdWarp', Math.round((viz.plMdWarp||1)*100)); setVal('vizPlMdWarpVal', (viz.plMdWarp!=null?viz.plMdWarp:1).toFixed(2)+'\u00d7');
      set('vizPlMdSensitivity', Math.round((viz.plMdSensitivity||1)*100)); setVal('vizPlMdSensitivityVal', (viz.plMdSensitivity!=null?viz.plMdSensitivity:1).toFixed(2)+'\u00d7');
      set('vizPlMdTint', viz.plMdTint||0); setVal('vizPlMdTintVal', (viz.plMdTint||0)+'%'); set('vizPlMdQuality', String(viz.plMdQuality!=null?viz.plMdQuality:1));
      const eon = (viz.edgeMode || 'off') !== 'off';
      const es = g('vizEdgeSettings'); if (es) es.classList.toggle('visible', eon);
      const ecr = g('vizEdgeCustomRow'); if (ecr) ecr.classList.toggle('visible', eon && viz.edgeColors === 'custom'); }
    updateTrackVizUI();
  }

  function attachVisualizerUI(){
    if (!el.vizCanvas) return;
    ensureEdgeCanvas();
    const g = id => document.getElementById(id);
    const bind = (id, fn) => { const e = g(id); if (e) e.addEventListener('input', ev => { markVizPicked(); fn(ev); }); };
    bind('vizMode', e => { viz.mode = e.target.value; vizSave(); ensureVizGraph(); applyViz(); vizSyncUI(); });
    bind('vizEdgeMode', e => { viz.edgeMode = e.target.value; vizSave(); ensureVizGraph(); applyEdgeViz(); vizSyncUI(); });
    bind('vizEdgeReach', e => { viz.edgeReach = +e.target.value || 35; const v = g('vizEdgeReachVal'); if (v) v.textContent = viz.edgeReach + '%'; vizSave(); });
    bind('vizEdgeSensitivity', e => { viz.edgeSensitivity = +e.target.value; const v = g('vizEdgeSensitivityVal'); if (v) v.textContent = viz.edgeSensitivity + '%'; vizSave(); });
    bind('vizEdgeSmoothing', e => { viz.edgeSmoothing = +e.target.value / 100; const v = g('vizEdgeSmoothingVal'); if (v) v.textContent = viz.edgeSmoothing.toFixed(2); vizSave(); if (edgeAnalyser) edgeAnalyser.smoothingTimeConstant = viz.edgeSmoothing; });
    bind('vizEdgeOpacity', e => { viz.edgeOpacity = +e.target.value / 100; const v = g('vizEdgeOpacityVal'); if (v) v.textContent = Math.round(viz.edgeOpacity * 100) + '%'; vizSave(); });
    bind('vizEdgeBars', e => { viz.edgeBars = +e.target.value; const v = g('vizEdgeBarsVal'); if (v) v.textContent = viz.edgeBars; vizSave(); });
    bind('vizEdgeColors', e => { viz.edgeColors = e.target.value; vizSave(); vizSyncUI(); });
    bind('vizPlMode', e => { viz.plMode = e.target.value; vizSave(); applyPlViz(); vizSyncUI(); });
    bind('vizPlEdgeMode', e => { viz.plEdgeMode = e.target.value; vizSave(); ensureVizGraph(); applyPlEdgeViz(); vizSyncUI(); });
    bind('vizPlEdgeReach', e => { viz.plEdgeReach = +e.target.value || 35; const v = g('vizPlEdgeReachVal'); if (v) v.textContent = viz.plEdgeReach + '%'; vizSave(); });
    bind('vizPlEdgeSensitivity', e => { viz.plEdgeSensitivity = +e.target.value; const v = g('vizPlEdgeSensitivityVal'); if (v) v.textContent = viz.plEdgeSensitivity + '%'; vizSave(); });
    bind('vizPlEdgeSmoothing', e => { viz.plEdgeSmoothing = +e.target.value / 100; const v = g('vizPlEdgeSmoothingVal'); if (v) v.textContent = viz.plEdgeSmoothing.toFixed(2); vizSave(); if (plEdgeAnalyser) plEdgeAnalyser.smoothingTimeConstant = viz.plEdgeSmoothing; });
    bind('vizPlEdgeOpacity', e => { viz.plEdgeOpacity = +e.target.value / 100; const v = g('vizPlEdgeOpacityVal'); if (v) v.textContent = Math.round(viz.plEdgeOpacity * 100) + '%'; vizSave(); });
    bind('vizPlEdgeBars', e => { viz.plEdgeBars = +e.target.value; const v = g('vizPlEdgeBarsVal'); if (v) v.textContent = viz.plEdgeBars; vizSave(); });
    bind('vizPlEdgeColors', e => { viz.plEdgeColors = e.target.value; vizSave(); vizSyncUI(); });
    ['vizPlEdgeCustom1','vizPlEdgeCustom2','vizPlEdgeCustom3'].forEach((id, idx) => {
      const e = g(id);
      if (e) e.addEventListener('input', () => {
        markVizPicked();
        viz.plEdgeCustomColors = (viz.plEdgeCustomColors && viz.plEdgeCustomColors.length === 3) ? viz.plEdgeCustomColors : ['#ffffff','#ff2992','#29d5ff'];
        viz.plEdgeCustomColors[idx] = e.value || '#ffffff';
        vizSave();
      });
    });
    { const pm = g('vizPlMirror'); if (pm) pm.addEventListener('change', () => { markVizPicked(); viz.plMirror = !!pm.checked; vizSave(); applyPlViz(); }); }
    { const mdPrev = g('vizPlMilkdropPrev'); if (mdPrev) mdPrev.addEventListener('click', () => { viz.plMilkdropAuto = false; cyclePlMilkdropPreset(-1); vizSyncUI(); }); }
    { const mdNext = g('vizPlMilkdropNext'); if (mdNext) mdNext.addEventListener('click', () => { viz.plMilkdropAuto = false; cyclePlMilkdropPreset(1); vizSyncUI(); }); }
    { const plma = g('vizPlMilkdropAuto'); if (plma) plma.addEventListener('change', () => { markVizPicked(); viz.plMilkdropAuto = !!plma.checked; if (viz.plMilkdropAuto) plMilkdropCycleT = performance.now(); vizSave(); }); }
    const btnPlVizDrag = g('btnPlVizDrag'); if (btnPlVizDrag) btnPlVizDrag.addEventListener('click', () => togglePlDragMode('pl-viz'));
    const btnPlVizReset = g('btnPlVizReset'); if (btnPlVizReset) btnPlVizReset.addEventListener('click', () => { plVar('--pl-viz-dx', '0px'); plVar('--pl-viz-dy', '0px'); plVar('--pl-viz-scale', '1'); const pz=g('vizPlZoom'); if(pz)pz.value='1'; const pzv=g('vizPlZoomVal'); if(pzv)pzv.textContent='1.00\u00d7'; });
    const plVizZoom = g('vizPlZoom'); if (plVizZoom) plVizZoom.addEventListener('input', () => { const s=parseFloat(plVizZoom.value)||1; plVar('--pl-viz-scale', String(s)); const v=g('vizPlZoomVal'); if(v)v.textContent=s.toFixed(2)+'\u00d7'; });
    bind('vizPlSensitivity', e => { viz.plSensitivity = +e.target.value; const v = g('vizPlSensitivityVal'); if (v) v.textContent = viz.plSensitivity + '%'; vizSave(); });
    bind('vizPlBars', e => { viz.plBars = +e.target.value; const v = g('vizPlBarsVal'); if (v) v.textContent = viz.plBars; vizSave(); });
    bind('vizPlFog', e => { viz.plFog = +e.target.value || 0; const v = g('vizPlFogVal'); if (v) v.textContent = viz.plFog + '%'; vizSave(); if (plCoasterInst) plCoasterInst.setFog(viz.plFog / 100); });
    bind('vizPlColors', e => { viz.plColors = e.target.value; vizSave(); vizSyncUI(); if (viz.plMode === 'coaster' && plCoasterInst) plCoasterInst.setColors(viz.plColors); });
    ['vizPlCustom1','vizPlCustom2','vizPlCustom3'].forEach((id, idx) => {
      const e = g(id);
      if (e) e.addEventListener('input', () => {
        markVizPicked();
        viz.customColors = (viz.customColors && viz.customColors.length === 3) ? viz.customColors : ['#ffffff','#ff2992','#29d5ff'];
        viz.customColors[idx] = e.value || '#ffffff';
        vizSave();
      });
    });
    bind('vizPlOpacity', e => { viz.plOpacity = +e.target.value / 100; const v = g('vizPlOpacityVal'); if (v) v.textContent = Math.round(viz.plOpacity * 100) + '%'; vizSave(); applyPlVizBlendOpacity(); });
    const mdPrev = g('vizMilkdropPrev'); if (mdPrev) mdPrev.addEventListener('click', () => { cycleMilkdropPreset(-1); });
    const mdNext = g('vizMilkdropNext'); if (mdNext) mdNext.addEventListener('click', () => { cycleMilkdropPreset(1); });
    ['vizEdgeCustom1','vizEdgeCustom2','vizEdgeCustom3'].forEach((id, idx) => {
      const e = g(id);
      if (e) e.addEventListener('input', () => {
        markVizPicked();
        viz.edgeCustomColors = (viz.edgeCustomColors && viz.edgeCustomColors.length === 3) ? viz.edgeCustomColors : ['#ffffff','#ff2992','#29d5ff'];
        viz.edgeCustomColors[idx] = e.value || '#ffffff';
        vizSave();
      });
    });
    bind('vizStarSize', e => { viz.starSize = parseFloat(e.target.value) || 2; const v = g('vizStarSizeVal'); if (v) v.textContent = viz.starSize.toFixed(1) + '×'; vizSave(); });
    bind('vizFog', e => {
      viz.fog = +e.target.value || 0;
      const v = g('vizFogVal'); if (v) v.textContent = viz.fog + '%';
      vizSave();
      if (viz.mode === 'coaster' && window.RoundViz3D) window.RoundViz3D.setFog(viz.fog / 100);
    });
    bind('vizSensitivity', e => { viz.sensitivity = +e.target.value; const v = g('vizSensitivityVal'); if (v) v.textContent = viz.sensitivity + '%'; vizSave(); });
    bind('vizSmoothing', e => { viz.smoothing = +e.target.value / 100; const v = g('vizSmoothingVal'); if (v) v.textContent = viz.smoothing.toFixed(2); vizSave(); if (vizAnalyser) vizAnalyser.smoothingTimeConstant = viz.smoothing; });
    bind('vizOpacity', e => { viz.opacity = +e.target.value / 100; const v = g('vizOpacityVal'); if (v) v.textContent = Math.round(viz.opacity * 100) + '%'; vizSave(); applyVizBlendOpacity(); });
    bind('vizBars', e => { viz.bars = +e.target.value; const v = g('vizBarsVal'); if (v) v.textContent = viz.bars; vizSave(); });
    bind('vizFFT', e => { viz.fft = +e.target.value; vizSave(); if (vizAnalyser) vizAnalyser.fftSize = viz.fft; vizFreq = null; vizWave = null; });
    bind('vizColors', e => { viz.colors = e.target.value; vizSave(); vizSyncUI(); if (viz.mode === 'coaster' && window.RoundViz3D) window.RoundViz3D.setColors(viz.colors); });
    // custom 3-colour pickers (starfield) — stars randomly take one of the three
    ['vizCustom1','vizCustom2','vizCustom3'].forEach((id, idx) => {
      const e = g(id);
      if (e) e.addEventListener('input', () => {
        markVizPicked();
        viz.customColors = (viz.customColors && viz.customColors.length === 3) ? viz.customColors : ['#ffffff','#ff2992','#29d5ff'];
        viz.customColors[idx] = e.value || '#ffffff';
        vizSave();
      });
    });
    const art = g('vizArtwork');
    if (art) art.addEventListener('change', e => { markVizPicked(); viz.artwork = e.target.checked; vizSave(); el.player.classList.toggle('viz-hide-art', viz.mode !== 'off' && !viz.artwork); });
    // Entry S25: blend toggles + mode dropdowns (main + playlist)
    { const vb = g('vizBlend'); if (vb) vb.addEventListener('change', () => { markVizPicked(); viz.vizBlend = !!vb.checked; vizSave(); applyViz(); }); }
    bind('vizBlendMode', e => { viz.vizBlendMode = e.target.value; vizSave(); applyViz(); });
    { const pvb = g('vizPlBlend'); if (pvb) pvb.addEventListener('change', () => { markVizPicked(); viz.plVizBlend = !!pvb.checked; vizSave(); applyPlViz(); }); }
    bind('vizPlBlendMode', e => { viz.plVizBlendMode = e.target.value; vizSave(); applyPlViz(); });
    bind('vizBlendStrength', e => { viz.vizBlendStrength = +e.target.value / 100; const v = g('vizBlendStrengthVal'); if (v) v.textContent = Math.round(viz.vizBlendStrength * 100) + '%'; vizSave(); applyVizBlendOpacity(); });
    bind('vizPlBlendStrength', e => { viz.plVizBlendStrength = +e.target.value / 100; const v = g('vizPlBlendStrengthVal'); if (v) v.textContent = Math.round(viz.plVizBlendStrength * 100) + '%'; vizSave(); applyPlVizBlendOpacity(); });
    // Entry S31: Milkdrop parameter sliders (main + PL)
    const mdSlider = (id, key, prefix, valId, fmt, reload) => {
      const e = g(id); if (!e) return;
      e.addEventListener('input', () => {
        markVizPicked();
        const raw = +e.target.value;
        viz[key] = key.includes('Decay') ? (raw === 0 ? 0 : raw / 100) : key.includes('Quality') ? raw : raw / 100;
        const v = g(valId); if (v) v.textContent = fmt(viz[key]);
        vizSave(); reload();
      });
    };
    mdSlider('vizMdDecay','mdDecay','','vizMdDecayVal', v => v > 0 ? Math.round(v*100)+'%' : 'Preset', mdReloadMain);
    mdSlider('vizMdZoom','mdZoom','','vizMdZoomVal', v => v.toFixed(2)+'×', mdReloadMain);
    mdSlider('vizMdWarp','mdWarp','','vizMdWarpVal', v => v.toFixed(2)+'×', mdReloadMain);
    mdSlider('vizMdSensitivity','mdSensitivity','','vizMdSensitivityVal', v => v.toFixed(2)+'×', mdReloadMain);
    mdSlider('vizMdTint','mdTint','','vizMdTintVal', v => Math.round(v*100)+'%', mdReloadMain);
    { const e = g('vizMdQuality'); if (e) e.addEventListener('change', () => { markVizPicked(); viz.mdQuality = +e.target.value; vizSave(); mdApplyQuality(milkdropViz, viz.mdQuality); }); }
    mdSlider('vizPlMdDecay','plMdDecay','pl','vizPlMdDecayVal', v => v > 0 ? Math.round(v*100)+'%' : 'Preset', mdReloadPl);
    mdSlider('vizPlMdZoom','plMdZoom','pl','vizPlMdZoomVal', v => v.toFixed(2)+'×', mdReloadPl);
    mdSlider('vizPlMdWarp','plMdWarp','pl','vizPlMdWarpVal', v => v.toFixed(2)+'×', mdReloadPl);
    mdSlider('vizPlMdSensitivity','plMdSensitivity','pl','vizPlMdSensitivityVal', v => v.toFixed(2)+'×', mdReloadPl);
    mdSlider('vizPlMdTint','plMdTint','pl','vizPlMdTintVal', v => Math.round(v*100)+'%', mdReloadPl);
    { const e = g('vizPlMdQuality'); if (e) e.addEventListener('change', () => { markVizPicked(); viz.plMdQuality = +e.target.value; vizSave(); mdApplyQuality(plMilkdropViz, viz.plMdQuality); }); }
    // Reset to baseline buttons
    const btnMdR = g('btnMdReset'); if (btnMdR) btnMdR.addEventListener('click', () => {
      markVizPicked(); viz.mdDecay = 0; viz.mdZoom = 1; viz.mdWarp = 1; viz.mdSensitivity = 1; viz.mdTint = 0; viz.mdQuality = 1;
      vizSave(); vizSyncUI(); mdReloadMain();
    });
    const btnPlMdR = g('btnPlMdReset'); if (btnPlMdR) btnPlMdR.addEventListener('click', () => {
      markVizPicked(); viz.plMdDecay = 0; viz.plMdZoom = 1; viz.plMdWarp = 1; viz.plMdSensitivity = 1; viz.plMdTint = 0; viz.plMdQuality = 1;
      vizSave(); vizSyncUI(); mdReloadPl();
    });
    // unified per-track save: look + transform + media + playlist panel +
    // visualiser, all keyed to the CURRENT highlighted track only.
    const saveAll = g('btnSaveTrackAll');
    if (saveAll) saveAll.addEventListener('click', () => {
      const t = demoPlaylist[state.currentIndex];
      if (!t) return;
      saveCurrentAsTrackTheme();       // colours, transform, cover/video adopt, blob uploads
      saveCurrentAsTrackViz();         // visualiser config for this track
      const vs = g('vizStatus');
      if (vs) vs.textContent = 'Track ' + (state.currentIndex + 1) + ' (' + (t.title || '?') + ') saved — look + media + visualiser, this track only';
      setSyncStatus('✓ Saved track ' + (state.currentIndex + 1) + ' (' + (t.title || '?') + ') — this track only', true);
    });

    const off = g('btnVizOff');
    if (off) off.addEventListener('click', () => { markVizPicked(); viz.mode = 'off'; vizSyncUI(); vizSave(); applyViz(); });
    // visualiser reposition / reset / zoom (cinema-aware via vizVar)
    const vd = g('btnVizDrag');
    if (vd) vd.addEventListener('click', () => toggleDragMode('viz'));
    const vr = g('btnVizReset');
    if (vr) vr.addEventListener('click', () => { setVarPx(vizVar('dx'),0); setVarPx(vizVar('dy'),0); setVarNum(vizVar('scale'),1); const vz=g('vizZoom'); if(vz)vz.value='1'; const vzv=g('vizZoomVal'); if(vzv)vzv.textContent='1.00×'; persistVizTransform(); });
    const vzSlider = g('vizZoom');
    if (vzSlider) vzSlider.addEventListener('input', () => { const s=parseFloat(vzSlider.value)||1; setVarNum(vizVar('scale'),s); const v=g('vizZoomVal'); if(v)v.textContent=s.toFixed(2)+'×'; clearTimeout(state._vizWheelT); state._vizWheelT=setTimeout(persistVizTransform,300); });
    // per-track visualiser save / reset / toggle
    const sv = g('btnSaveTrackViz');
    if (sv) sv.addEventListener('click', () => { markVizPicked(); saveCurrentAsTrackViz(); });
    const rv = g('btnResetTrackViz');
    if (rv) rv.addEventListener('click', () => { markVizPicked(); resetCurrentTrackViz(); });
    // BUGFIX: the 'Use a visualiser for THIS track' toggle must PERSIST the
    // moment the user flips it. Before, unchecking did nothing until "Save
    // as Track Visualiser", and coming back to the track re-derived the
    // checkbox from the live mode (always checked after another track had
    // run) — the user's uncheck looked like it didn't stick.
    const vto = g('vizTrackOn');
    if (vto) vto.addEventListener('change', () => { markVizPicked(); });
    if (vto) vto.addEventListener('change', () => {
      const t = demoPlaylist[state.currentIndex];
      if (!t) return;
      // v106: checking ON with no active mode defaults to 'bars' so the
      // toggle visibly works (previously it captured mode 'off' -> nothing).
      const mode = vto.checked ? ((viz.mode && viz.mode !== 'off') ? viz.mode : 'bars') : 'off';
      t.viz = {
        on: vto.checked,
        mode, sensitivity: viz.sensitivity, smoothing: viz.smoothing,
        opacity: viz.opacity, bars: viz.bars, fft: viz.fft, colors: viz.colors,
        customColors: viz.customColors ? viz.customColors.slice() : undefined,
        artwork: viz.artwork, starSize: viz.starSize, fog: viz.fog,
        edgeMode: viz.edgeMode, edgeReach: viz.edgeReach,
        edgeSensitivity: viz.edgeSensitivity, edgeSmoothing: viz.edgeSmoothing,
        edgeOpacity: viz.edgeOpacity, edgeBars: viz.edgeBars,
        edgeColors: viz.edgeColors, edgeCustomColors: viz.edgeCustomColors ? viz.edgeCustomColors.slice() : undefined,
        plMode: viz.plMode, plOpacity: viz.plOpacity,
        plMirror: viz.plMirror, plMilkdropPreset: viz.plMilkdropPreset,
        plSensitivity: viz.plSensitivity, plSmoothing: viz.plSmoothing,
        plBars: viz.plBars, plColors: viz.plColors,
        plFog: viz.plFog,
        plEdgeMode: viz.plEdgeMode, plEdgeReach: viz.plEdgeReach,
        plEdgeSensitivity: viz.plEdgeSensitivity, plEdgeSmoothing: viz.plEdgeSmoothing,
        plEdgeOpacity: viz.plEdgeOpacity, plEdgeBars: viz.plEdgeBars,
        plEdgeColors: viz.plEdgeColors, plEdgeCustomColors: viz.plEdgeCustomColors ? viz.plEdgeCustomColors.slice() : undefined,
        vizBlend: viz.vizBlend, vizBlendMode: viz.vizBlendMode, vizBlendStrength: viz.vizBlendStrength,
        plVizBlend: viz.plVizBlend, plVizBlendMode: viz.plVizBlendMode, plVizBlendStrength: viz.plVizBlendStrength
      };
      state.playlistDirty = true;
      savePlaylist();
      viz.mode = mode;
      applyViz();
      vizSyncUI();
      updateTrackVizUI();
      const vs = g('vizStatus');
      if (vs) vs.textContent = vto.checked ? 'Visualiser ON for this track (saved)' : 'Visualiser OFF for this track (saved)';
    });
  }

  // Init
  (function init(){
    computePairGap();
    window.addEventListener('resize',()=>{ computePairGap(); initArc(); renderProgress(); sizeVizCanvas(); if (window.RoundViz3D && window.RoundViz3D.resize) window.RoundViz3D.resize(); if (plCoasterInst && plCoasterInst.resize) plCoasterInst.resize(); sizePlEdgeCanvas(); setTimeout(updatePlScrollFromList, 50); });

    // MIGRATION: clear stale t.cinema=true (Entry S30 — was wrongly set by the
    // old checkbox logic `t.cinema !== false` which treated undefined as true).
    try {
      if (!localStorage.getItem('roundPlayer.migrated.cinema-clear-v222')) {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) { const obj = JSON.parse(raw); if (obj && obj.list) { obj.list.forEach(t => { if (t) delete t.cinema; }); localStorage.setItem(LS_KEY, JSON.stringify(obj)); } }
        localStorage.setItem('roundPlayer.migrated.cinema-clear-v222', '1');
      }
    } catch {}

    // MIGRATION (must run BEFORE loadPlaylist — stale localStorage re-saves to server)
    try {
      if (!localStorage.getItem('roundPlayer.migrated.plviz-v203')) {
        const vk = localStorage.getItem('roundPlayer.visualizer.v1');
        if (vk) { const v = JSON.parse(vk); if (v.plMode && v.plMode !== 'off') { v.plMode = 'off'; localStorage.setItem('roundPlayer.visualizer.v1', JSON.stringify(v)); } }
        const sk = localStorage.getItem('roundPlayer.theme.v1');
        if (sk) {
          const s = JSON.parse(sk);
          if (s.plCinema) s.plCinema = false;
          for (const t of (s.tracks || [])) { if (t.plMirror && t.plMirror !== false) t.plMirror = false; if (t.viz && typeof t.viz === 'object' && t.viz.plMode && t.viz.plMode !== 'off') t.viz.plMode = 'off'; }
          localStorage.setItem('roundPlayer.theme.v1', JSON.stringify(s));
        }
        localStorage.setItem('roundPlayer.migrated.plviz-v203', '1');
      }
    } catch {}

    loadPlaylist();
    // overall player theme overrides track themes when present
    try { state.masterTheme = JSON.parse(localStorage.getItem(STORAGE_KEY + '.master') || 'null'); } catch { state.masterTheme = null; }
    gsLoad();
    state.masterOn = !!gs.masterOn;
    renderPlaylist();
    renderPlaylistManager();
    healOversizedCovers();   // shrink any multi-MB data-URI covers (quota safety)
    healStaleThemes();       // drop v93 themes with invisible surfaces (v94 re-derives)
    checkMissingAudio();     // badge tracks whose server audio is gone
    attachPlaylistManager();

    initFromData();
    initArc();
    attachTransport();
    attachColorPickers();
    attachEditor();
    loadLookPresets();      // Entry S27: look presets library
    renderLookPresets();
    bindHexInputs();
    applyColors(false);
    snapshotGlobalVars();   // CSS defaults = the overall look (per-track themes must not leak)
    state.master = el.audio;

    // sync curved scrollbar on list scroll
    el.plList.addEventListener('scroll', updatePlScrollFromList, {passive:true});

    // v106-v108: drop audio files straight onto the player's playlist panel
    // (EDITOR view only). The QUICK-vs-PLACE rule is TIME-based: a quick
    // release (<500ms after the file enters the list) APPENDS at the end —
    // it never drops where the cursor happens to be. Hold & hover (>=500ms)
    // enters placement mode: the blue insertion line appears and the track
    // lands exactly where you release. Edges auto-scroll while dragging.
    if (isEditorPage() && el.plList){
      const ul = el.plList;
      const PLACE_MS = 500;
      const hasFiles = e => e.dataTransfer && Array.from(e.dataTransfer.types || []).indexOf('Files') !== -1;
      let lastIdx = -1;
      const enterMs = () => parseInt(ul.dataset.fileEnter, 10) || 0;
      ul.addEventListener('dragenter', e => {
        if (!hasFiles(e) || ul.querySelector('.pl-item.dragging')) return;
        if (!ul.dataset.fileEnter) ul.dataset.fileEnter = String(Date.now());
      });
      ul.addEventListener('dragover', e => {
        const files = hasFiles(e);
        const draggingNode = ul.querySelector('.pl-item.dragging');
        if (!files && !draggingNode) return;
        e.preventDefault();
        autoScrollOnDrag(ul, e.clientY);
        if (files){
          if (!ul.dataset.fileEnter) ul.dataset.fileEnter = String(Date.now());
          ul.classList.add('drop-target');
          if (Date.now() - enterMs() >= PLACE_MS){
            // v109 ZONES: top band = insert before, bottom band = insert
            // after, middle band = REPLACE this track (amber highlight)
            const row = e.target && e.target.closest ? e.target.closest('.pl-item') : null;
            const zone = row && !row.classList.contains('pl-phantom') ? fileZone(e, row) : null;
            if (zone === 'replace'){
              clearPlDropIndicator();
              clearPlDropReplace();
              row.classList.add('drop-replace');
              ul.dataset.replaceIdx = row.dataset.index;
            } else {
              clearPlDropReplace();
              delete ul.dataset.replaceIdx;
              lastIdx = plDropInsertIndex(e);
              setPlDropIndicator(lastIdx);
            }
          } else {
            clearPlDropIndicator();
            clearPlDropReplace();
            delete ul.dataset.replaceIdx;
          }
        }
      });
      ul.addEventListener('dragleave', e => {
        if (!e.relatedTarget || !ul.contains(e.relatedTarget)){
          clearPlDropIndicator();
          clearPlDropReplace();
          ul.classList.remove('drop-target');
          delete ul.dataset.fileEnter;
          delete ul.dataset.replaceIdx;
        }
      });
      ul.addEventListener('drop', e => {
        clearPlDropIndicator();
        clearPlDropReplace();
        ul.classList.remove('drop-target');
        const files = e.dataTransfer && e.dataTransfer.files;
        const draggingNode = ul.querySelector('.pl-item.dragging');
        if (files && files.length){
          e.preventDefault();
          e.stopPropagation();
          const entered = enterMs();
          const quick = !entered || (Date.now() - entered) < PLACE_MS;
          const repIdx = ul.dataset.replaceIdx;
          delete ul.dataset.fileEnter;
          delete ul.dataset.replaceIdx;
          if (!quick && repIdx != null && /^audio\//.test(String(files[0].type || ''))){
            // v109: held on the middle band -> REPLACE that track in place
            const t = demoPlaylist[+repIdx];
            if (t){
              if (t._audioMissing) markAudioMissing(t, false);
              applyAudioFileToTrack(files[0], t, { reloadTrack: demoPlaylist[state.currentIndex] === t });
              setSyncStatus('Replaced this track audio — ' + files[0].name, true);
            }
            lastIdx = -1;
            return;
          }
          // v108: quick release -> APPEND at the END (never the cursor spot);
          // held -> insert at the last hovered position
          addFilesToPlaylist(files, quick ? undefined : (lastIdx >= 0 ? lastIdx : undefined));
          lastIdx = -1;
        } else if (draggingNode){
          e.preventDefault();
          // row reorder commit happens on dragend (covers gaps/empty space)
        }
      });
    }

    // v107/v108: same QUICK-vs-PLACE rule for the PLAYLIST MANAGER list.
    // Quick release (<500ms) APPENDS at the end — even when released on a
    // row. Hold & hover (>=500ms) is the deliberate gesture: over a row the
    // row's highlight shows REPLACE (drop = replace that track's audio);
    // over a gap the blue insertion line shows where the track will land.
    if (isEditorPage() && el.pmList){
      const pmUl = el.pmList;
      const PLACE_MS = 500;
      const hasFiles = e => e.dataTransfer && Array.from(e.dataTransfer.types || []).indexOf('Files') !== -1;
      let pmLastIdx = -1;
      const pmEnterMs = () => parseInt(pmUl.dataset.fileEnter, 10) || 0;
      pmUl.addEventListener('dragenter', e => {
        if (!hasFiles(e)) return;
        if (!pmUl.dataset.fileEnter) pmUl.dataset.fileEnter = String(Date.now());
      });
      pmUl.addEventListener('dragover', e => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        autoScrollOnDrag(pmUl, e.clientY);
        if (!pmUl.dataset.fileEnter) pmUl.dataset.fileEnter = String(Date.now());
        if (Date.now() - pmEnterMs() >= PLACE_MS){
          // v109 ZONES: top band = insert before, bottom band = insert after,
          // middle band = REPLACE this track (amber highlight)
          const row = e.target && e.target.closest ? e.target.closest('.pm-row') : null;
          const zone = row ? fileZone(e, row) : null;
          if (zone === 'replace'){
            clearPmDropIndicator();
            clearPmDropReplace();
            row.classList.add('drop-replace');
            pmUl.dataset.replaceIdx = row.dataset.index;
          } else {
            clearPmDropReplace();
            delete pmUl.dataset.replaceIdx;
            pmLastIdx = pmDropInsertIndex(e);
            setPmDropIndicator(pmLastIdx);
          }
        } else {
          clearPmDropIndicator();
          clearPmDropReplace();
          delete pmUl.dataset.replaceIdx;
        }
      });
      pmUl.addEventListener('dragleave', e => {
        if (!e.relatedTarget || !pmUl.contains(e.relatedTarget)){
          clearPmDropIndicator();
          clearPmDropReplace();
          delete pmUl.dataset.fileEnter;
          delete pmUl.dataset.replaceIdx;
        }
      });
      pmUl.addEventListener('drop', e => {
        clearPmDropIndicator();
        clearPmDropReplace();
        const files = e.dataTransfer && e.dataTransfer.files;
        if (!files || !files.length) return;
        const entered = pmEnterMs();
        const quick = !entered || (Date.now() - entered) < PLACE_MS;
        const repIdx = pmUl.dataset.replaceIdx;
        delete pmUl.dataset.fileEnter;
        delete pmUl.dataset.replaceIdx;
        e.preventDefault();
        if (quick){
          // v108: quick release -> APPEND at the END (never at the cursor)
          addFilesToPlaylist(files);
          pmLastIdx = -1;
          return;
        }
        // v109: held on a row's MIDDLE band -> replace (the row handler does
        // this and stopPropagation; this is the gap/edge fallback)
        if (repIdx != null && /^audio\//.test(String(files[0].type || ''))){
          const t = demoPlaylist[+repIdx];
          if (t){
            if (t._audioMissing) markAudioMissing(t, false);
            applyAudioFileToTrack(files[0], t, { reloadTrack: demoPlaylist[state.currentIndex] === t });
            setSyncStatus('Replaced this track audio — ' + files[0].name, true);
          }
          pmLastIdx = -1;
          return;
        }
        // held: insert at the hovered spot (top/bottom band or gap)
        addFilesToPlaylist(files, pmLastIdx >= 0 ? pmLastIdx : undefined);
        pmLastIdx = -1;
      });
    }

    // cover auto-fill: once untweaked artwork reveals its natural size,
    // frame it to cover the player window (centered, no dark panel visible)
    el.cover.addEventListener('load', maybeAutoFillCover);
    el.cover.addEventListener('load', maybeAutoFillArt);
    el.coverVideo.addEventListener('loadedmetadata', maybeAutoFillCover);
    // artwork that fails to load (deleted server file / dead blob) falls
    // back to the deterministic placeholder once per track — never leave a
    // broken image in the media window. TRANSIENT errors (an old load being
    // aborted while the src is swapped) must NOT trigger the fallback — they
    // fire with complete=false and would replace a fine cover with a
    // placeholder (the "keeps the previous artwork" glitch).
    el.cover.addEventListener('error', () => {
      if (state._coverFallbackTried) return;
      if (!el.cover.complete || el.cover.naturalWidth > 0) return;   // transient abort
      state._coverFallbackTried = true;
      const cur = String(el.cover.src || '');
      if (cur && !cur.startsWith('data:')){
        el.cover.src = defaultCoverFromName(el.title.textContent || 'Track');
      }
    });

    // close menus on escape
    window.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ el.menuLayer.innerHTML=''; }});

    // start with track index restored from storage
    loadTrack(state.currentIndex, false);

    // One-time migration: clear stale PL viz/mirror data from old builds
    try {
      if (!localStorage.getItem('roundPlayer.migrated.plviz-v203')) {
        const vk = localStorage.getItem('roundPlayer.visualizer.v1');
        if (vk) { const v = JSON.parse(vk); if (v.plMode && v.plMode !== 'off') { v.plMode = 'off'; localStorage.setItem('roundPlayer.visualizer.v1', JSON.stringify(v)); } }
        const sk = localStorage.getItem('roundPlayer.theme.v1');
        if (sk) {
          const s = JSON.parse(sk);
          if (s.plCinema) s.plCinema = false;
          // clear stale plMirror from saved tracks
          for (const t of (s.tracks || [])) { if (t.plMirror && t.plMirror !== false) t.plMirror = false; if (t.viz && t.viz.plMode && t.viz.plMode !== 'off') t.viz.plMode = 'off'; }
          localStorage.setItem('roundPlayer.theme.v1', JSON.stringify(s));
        }
        localStorage.setItem('roundPlayer.migrated.plviz-v203', '1');
      }
    } catch {}

    // visualiser: load config, wire the tab controls, apply
    vizLoad();
    attachVisualizerUI();
    vizSyncUI();
    applyTrackViz(demoPlaylist[state.currentIndex]);   // per-track wins on first paint
    attachGlobalUI();
    gsSyncUI();
    applyGlobalSettings();
    applyBeatPulseStrength();                       // DJ Phase 2
    if (!beatPulseRaf) beatPulseRaf = requestAnimationFrame(beatPulseLoop);

    // persistence: apply saved/server theme on top, then diagnostics UI
    attachDevTabs();
    attachInfoTips();
    restoreTheme();
    attachVersionBadge();
    attachServerSelfTest();
    attachMediaErrorBadge();
    updateMediaSummary();
    attachCinema();

    // Playlist cinema: auto-hide the track list + colors when the mouse leaves
    // the playlist circle, revealing the backdrop media filling the full circle.
    // Re-enters → content fades back in. Starts in cinema mode (media fills).
    (function attachPlCinema(){
      const plCircle = document.getElementById('playlistCircle');
      if (!plCircle) return;
      let _plCinemaT = null;
      // playlist starts NON-cinema; cinema only on mouseleave
      plCircle.addEventListener('mouseenter', () => {
        plCircle.classList.remove('pl-cinema');
        clearTimeout(_plCinemaT);
      });
      plCircle.addEventListener('mouseleave', () => {
        clearTimeout(_plCinemaT);
        if (gs.plCinema !== false) _plCinemaT = setTimeout(() => plCircle.classList.add('pl-cinema'), 400);
      });
    })();

    // One-time migration: clear stale plMedia=true (old default ON) from BOTH the
    // saved playlist AND the in-memory demoPlaylist so the playlist defaults to
    // OFF (Colors scheme) per v157+. The localStorage-only clear in v171 didn't
    // touch the runtime array — this does.
    try {
      const needClear = !localStorage.getItem('_plMediaMemCleared');
      if (needClear){
        // clear in-memory
        demoPlaylist.forEach(t => { if (t && t.plMedia === true) delete t.plMedia; });
        // clear localStorage
        const raw = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
        if (raw && raw.list){
          raw.list.forEach(t => { if (t && t.plMedia === true) delete t.plMedia; });
          localStorage.setItem(LS_KEY, JSON.stringify(raw));
        }
        localStorage.setItem('_plMediaMemCleared', '1');
        state.playlistDirty = true;
      }
    } catch {}
    attachVideoFraming();
    attachPlDrop();        // per-track playlist-panel backdrop: drag-&-drop media
    attachPlFraming();     // playlist-panel backdrop: mirror toggle + reposition/zoom
    attachPlVideoSync();   // keep the playlist video in sync with the main video (mirror mode)
    attachPlMirror();      // mirror the main player's framing (reposition/zoom) to the panel (mirror mode)
    // Keep .video-active in lock-step with the video element so the cover-art
    // backdrop engages its independent --art-* transform exactly when a video
    // is actually showing — across EVERY path (load, upload, crossfade, clear).
    // syncVideoActive is a hoisted function declaration in this closure.
    if (el.coverVideo && typeof MutationObserver !== 'undefined'){
      new MutationObserver(syncVideoActive)
        .observe(el.coverVideo, { attributes: true, attributeFilter: ['src', 'style'] });
      syncVideoActive();   // seed from current state
    }
  })();
  // ============================================================
  // MILKDROP PARAMETER OVERRIDES (Entry S31) — 6 live sliders that
  // modify the preset data BEFORE loadPreset(). Non-destructive: the
  // original preset is deep-cloned, baseVals are scaled, then loaded.
  // ============================================================
  const MD_MESH = [[32, 24], [64, 48], [128, 96]];
  function mdBuildPreset(original, p){
    if (!original) return original;
    const clone = JSON.parse(JSON.stringify(original));
    const bv = clone.baseVals = clone.baseVals || {};
    const sens = (p.sensitivity != null ? p.sensitivity : 1) || 1;
    if (p.decay > 0) bv.decay = Math.max(0.5, Math.min(1.0, p.decay));
    bv.zoom = (bv.zoom != null ? bv.zoom : 1.0) * ((p.zoom != null ? p.zoom : 1) || 1) * sens;
    bv.warp = (bv.warp != null ? bv.warp : 0) * ((p.warp != null ? p.warp : 1) || 1) * sens;
    bv.rot = (bv.rot != null ? bv.rot : 0) * sens;
    if ((p.tint || 0) > 0){
      const cs = getComputedStyle(el.player);
      const hex2rgb = h => { const n = parseInt(h.slice(1), 16); return [(n>>16)&255, (n>>8)&255, n&255]; };
      const c1 = hex2rgb((cs.getPropertyValue('--progress-start').trim() || '#ff2992'));
      const c2 = hex2rgb((cs.getPropertyValue('--progress-end').trim() || '#29d5ff'));
      const t = (p.tint || 0) / 100;
      const mix = (o, v) => o + (v/255 - o) * t;
      bv.wave_r = mix(bv.wave_r != null ? bv.wave_r : 1, c1[0]);
      bv.wave_g = mix(bv.wave_g != null ? bv.wave_g : 1, c1[1]);
      bv.wave_b = mix(bv.wave_b != null ? bv.wave_b : 1, c1[2]);
      bv.ob_r = mix(bv.ob_r != null ? bv.ob_r : 0, c2[0]);
      bv.ob_g = mix(bv.ob_g != null ? bv.ob_g : 0, c2[1]);
      bv.ob_b = mix(bv.ob_b != null ? bv.ob_b : 0, c2[2]);
    }
    return clone;
  }
  function mdApplyQuality(inst, quality){
    if (!inst) return;
    const m = MD_MESH[Math.max(0, Math.min(2, quality != null ? quality : 1))];
    try { inst.setInternalMeshSize(m[0], m[1]); } catch {}
  }
  function mdGetParams(prefix){
    return {
      decay: viz[prefix + 'MdDecay'] || 0,
      zoom: viz[prefix + 'MdZoom'] != null ? viz[prefix + 'MdZoom'] : 1,
      warp: viz[prefix + 'MdWarp'] != null ? viz[prefix + 'MdWarp'] : 1,
      sensitivity: viz[prefix + 'MdSensitivity'] != null ? viz[prefix + 'MdSensitivity'] : 1,
      tint: viz[prefix + 'MdTint'] || 0,
      quality: viz[prefix + 'MdQuality'] != null ? viz[prefix + 'MdQuality'] : 1
    };
  }
  function mdReloadMain(){
    if (!milkdropViz || !milkdropPresetNames || !milkdropPresetNames.length) return;
    const name = milkdropPresetNames[milkdropPresetIdx];
    const p = mdBuildPreset(milkdropPresets[name], mdGetParams(''));
    try { milkdropViz.loadPreset(p, 0.3); } catch {}
    mdApplyQuality(milkdropViz, viz.mdQuality != null ? viz.mdQuality : 1);
  }
  function mdReloadPl(){
    if (!plMilkdropViz || !milkdropPresetNames || !milkdropPresetNames.length) return;
    const name = milkdropPresetNames[milkdropPresetIdx];
    const p = mdBuildPreset(milkdropPresets[name], mdGetParams('pl'));
    try { plMilkdropViz.loadPreset(p, 0.3); } catch {}
    mdApplyQuality(plMilkdropViz, viz.plMdQuality != null ? viz.plMdQuality : 1);
  }
  })();
})();
