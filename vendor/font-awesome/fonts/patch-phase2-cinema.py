#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cinema/immersive video mode — JS wiring. Atomic; aborts without writing on any miss.
Adds a .cinema class to the player when a video is playing and the mouse leaves;
fades the control surface (keeps scrubber + playhead); mouse onto main area restores."""
import sys
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()
pairs = []
def add(name, old, new): pairs.append((name, old, new))

CINEMA_FUNCS = (
"  // ---- cinema / immersive video mode ----\n"
"  // A video that is playing hides the control surface (panel + icons + buttons +\n"
"  // text) when the mouse leaves the player, keeping only the scrubber + playhead,\n"
"  // and fills the circle. Mouse onto the MAIN area brings controls back; hovering\n"
"  // the scrubber keeps them hidden so you can scrub in peace. Pause shows controls.\n"
"  let _cinemaMouseOver = false;\n"
"  function videoMediaActive(){\n"
"    return !!(el.coverVideo && el.coverVideo.src && el.coverVideo.style.display !== 'none');\n"
"  }\n"
"  function engageCinema(on){ if (on) el.player.classList.add('cinema'); else el.player.classList.remove('cinema'); }\n"
"  function cinemaOnPlay(){\n"
"    if (videoMediaActive() && state.master === el.coverVideo && !_cinemaMouseOver) engageCinema(true);\n"
"  }\n"
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
"  }\n"
"\n"
"  // ---- Global tab UI (dev page) ----\n"
)
add("CJ1 cinema-funcs", "  // ---- Global tab UI (dev page) ----", CINEMA_FUNCS)

add("CJ2 onPlay",
"  function onPlay(){\n"
"    if (!state._switching) updatePlayIcon();\n"
"    startRAF();\n"
"    applySleepTimer();\n",
"  function onPlay(){\n"
"    if (!state._switching) updatePlayIcon();\n"
"    startRAF();\n"
"    cinemaOnPlay();\n"
"    applySleepTimer();\n"
)

add("CJ3 onPause",
"  function onPause(){\n"
"    if (!state._switching) updatePlayIcon();\n"
"    stopRAF();\n"
"    saveResume();\n",
"  function onPause(){\n"
"    if (!state._switching) updatePlayIcon();\n"
"    stopRAF();\n"
"    if (videoMediaActive()) engageCinema(false);\n"
"    saveResume();\n"
)

add("CJ4 loadTrack",
"  function loadTrack(index, autoplay=false){\n"
"    window.__preloadNextUrl = null;\n",
"  function loadTrack(index, autoplay=false){\n"
"    window.__preloadNextUrl = null;\n"
"    engageCinema(false);   // exit cinema on track switch\n"
)

add("CJ5 init",
"    attachMediaErrorBadge();\n"
"    updateMediaSummary();\n"
"  })();\n",
"    attachMediaErrorBadge();\n"
"    updateMediaSummary();\n"
"    attachCinema();\n"
"  })();\n"
)

errors = []
for name, old, new in pairs:
    n = c.count(old)
    if n != 1: errors.append("%s: expected 1, found %d" % (name, n)); continue
    c = c.replace(old, new)
if errors:
    print("ABORTED (file untouched):")
    for e in errors: print("  " + e)
    sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c)
print("OK — applied %d cinema JS patches to %s" % (len(pairs), SRC))
