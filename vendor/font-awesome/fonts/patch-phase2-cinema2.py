#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cinema v2: (1) pure-hover (crossing the bar brings controls back), (2) per-track +
global cinema toggles. Atomic; aborts without writing on any miss."""
import sys
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()
pairs = []
def add(name, old, new, exp=1): pairs.append((name, old, new, exp))

add("C2-1 gs.cinema",
"    mediaSession: true,",
"    mediaSession: true,\n"
"    cinema: true,               // auto-hide controls on video tracks (global default)")

add("C2-2 attachCinema-pure-hover",
"  function attachCinema(){\n"
"    el.player.addEventListener('mouseenter', () => { _cinemaMouseOver = true; });\n"
"    el.player.addEventListener('mouseleave', () => {\n"
"      _cinemaMouseOver = false;\n"
"      if (videoMediaActive() && state.master && !state.master.paused) engageCinema(true);\n"
"    });\n"
"    el.player.addEventListener('mousemove', (e) => {\n"
"      // in cinema: moving over the MAIN area restores controls; the scrubber stays usable hidden\n"
"      if (!el.player.classList.contains('cinema')) return;\n"
"      const onBar = e.target && e.target.closest && (e.target.closest('.seeker') || e.target.closest('.knob-overlay'));\n"
"      if (!onBar) engageCinema(false);\n"
"    });\n"
"  }",
"  function cinemaEnabledForTrack(){\n"
"    const t = demoPlaylist[state.currentIndex];\n"
"    if (!t) return false;\n"
"    return (t.cinema == null) ? (gs.cinema !== false) : (!!t.cinema);\n"
"  }\n"
"  function attachCinema(){\n"
"    // pure hover: ANY entry into the player (including crossing the progress bar)\n"
"    // brings the controls back; leaving engages cinema (if enabled + video playing)\n"
"    el.player.addEventListener('mouseenter', () => {\n"
"      _cinemaMouseOver = true;\n"
"      if (el.player.classList.contains('cinema')) engageCinema(false);\n"
"    });\n"
"    el.player.addEventListener('mouseleave', () => {\n"
"      _cinemaMouseOver = false;\n"
"      if (videoMediaActive() && cinemaEnabledForTrack() && state.master && !state.master.paused) engageCinema(true);\n"
"    });\n"
"  }")

add("C2-3 cinemaOnPlay-gate",
"  function cinemaOnPlay(){\n"
"    if (videoMediaActive() && state.master === el.coverVideo && !_cinemaMouseOver) engageCinema(true);\n"
"  }",
"  function cinemaOnPlay(){\n"
"    if (videoMediaActive() && cinemaEnabledForTrack() && state.master === el.coverVideo && !_cinemaMouseOver) engageCinema(true);\n"
"  }")

add("C2-4 trackCinema-wire",
"    el.videoLoop.addEventListener('change',()=>{ el.coverVideo.loop = el.videoLoop.checked; });",
"    el.videoLoop.addEventListener('change',()=>{ el.coverVideo.loop = el.videoLoop.checked; });\n"
"    const trackCinemaEl = document.getElementById('trackCinema');\n"
"    if (trackCinemaEl) trackCinemaEl.addEventListener('change', () => {\n"
"      const t = demoPlaylist[state.currentIndex];\n"
"      if (!t) return;\n"
"      t.cinema = !!trackCinemaEl.checked;\n"
"      state.playlistDirty = true; savePlaylist(); saveTheme({ server: true });\n"
"      if (!t.cinema) engageCinema(false);   // turning off -> show controls immediately\n"
"    });")

add("C2-5 populate-trackCinema",
"    if (el.inputTitle) el.inputTitle.value = t.title || '';",
"    if (el.inputTitle) el.inputTitle.value = t.title || '';\n"
"    const _tcEl = document.getElementById('trackCinema'); if (_tcEl) _tcEl.checked = (t.cinema !== false);")

add("C2-6 gsSyncUI-gsCinema",
"    setChk('gsMediaSession', gs.mediaSession);",
"    setChk('gsMediaSession', gs.mediaSession);\n"
"    setChk('gsCinema', gs.cinema !== false);")

add("C2-7 attachGlobalUI-gsCinema",
"    bindChk('gsMediaSession', 'mediaSession');",
"    bindChk('gsMediaSession', 'mediaSession');\n"
"    const gsCinemaEl = g('gsCinema');\n"
"    if (gsCinemaEl) gsCinemaEl.addEventListener('change', () => {\n"
"      gs.cinema = !!gsCinemaEl.checked;\n"
"      gsSave();\n"
"      if (!gs.cinema) engageCinema(false);   // global off -> show controls now\n"
"    });")

add("C2-8 theme-tracks-cinema",
"        bpmSource: t.bpmSource || null,",
"        bpmSource: t.bpmSource || null,\n"
"        cinema: (t.cinema == null ? null : !!t.cinema),")

add("C2-9 rebuild-loops-cinema",
"          bpmSource: (st && st.bpmSource) || null,",
"          bpmSource: (st && st.bpmSource) || null,\n"
"          cinema: (st && st.cinema == null ? null : !!(st && st.cinema)),",
exp=2)

errors = []
for name, old, new, exp in pairs:
    n = c.count(old)
    if n != exp:
        errors.append("%s: expected %d, found %d" % (name, exp, n)); continue
    c = c.replace(old, new)
if errors:
    print("ABORTED (file untouched):")
    for e in errors: print("  " + e)
    sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c)
print("OK — applied %d cinema v2 patches" % len(pairs))
