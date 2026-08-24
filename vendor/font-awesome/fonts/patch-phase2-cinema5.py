#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cinema v5: (1) wider buffer (CM 18->30) so the trigger sits just OFF the bar;
(2) cinema-style dropdown: 'bar' (progress bar) vs 'head' (playhead only — track +
tail hidden, playhead stays scrubbable). Per-track + global default. Atomic."""
import sys
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()
pairs = []
def add(name, old, new, exp=1): pairs.append((name, old, new, exp))

add("C5-1 CM widen",
"    const CM = 18; // buffer ~5mm CSS px — hugs the arc; playhead stays grabbable",
"    const CM = 30; // buffer ~8mm CSS px — trigger sits just off the bar (past the knob)")

add("C5-2 engageCinema + styleForTrack",
"  function engageCinema(on){ if (on) el.player.classList.add('cinema'); else el.player.classList.remove('cinema'); }",
"  function cinemaStyleForTrack(){\n"
"    const t = demoPlaylist[state.currentIndex];\n"
"    return (t && t.cinemaStyle) || gs.cinemaStyle || 'bar';\n"
"  }\n"
"  function engageCinema(on){\n"
"    if (on){\n"
"      el.player.classList.add('cinema');\n"
"      el.player.classList.toggle('head-only', cinemaStyleForTrack() === 'head');\n"
"    } else {\n"
"      el.player.classList.remove('cinema', 'head-only');\n"
"    }\n"
"  }")

add("C5-3 gs.cinemaStyle",
"    cinema: true,               // auto-hide controls on video tracks (global default)",
"    cinema: true,               // auto-hide controls on video tracks (global default)\n"
"    cinemaStyle: 'bar',         // 'bar' = progress bar | 'head' = playhead only")

add("C5-4 trackCinemaStyle wire",
"      if (!t.cinema) engageCinema(false);   // turning off -> show controls immediately\n"
"    });",
"      if (!t.cinema) engageCinema(false);   // turning off -> show controls immediately\n"
"    });\n"
"    const trackCinemaStyleEl = document.getElementById('trackCinemaStyle');\n"
"    if (trackCinemaStyleEl) trackCinemaStyleEl.addEventListener('change', () => {\n"
"      const t = demoPlaylist[state.currentIndex];\n"
"      if (!t) return;\n"
"      t.cinemaStyle = trackCinemaStyleEl.value;\n"
"      state.playlistDirty = true; savePlaylist(); saveTheme({ server: true });\n"
"      if (el.player.classList.contains('cinema')) engageCinema(true);   // re-apply the look\n"
"    });")

add("C5-5 populate trackCinemaStyle",
"    const _tcEl = document.getElementById('trackCinema'); if (_tcEl) _tcEl.checked = (t.cinema !== false);",
"    const _tcEl = document.getElementById('trackCinema'); if (_tcEl) _tcEl.checked = (t.cinema !== false);\n"
"    const _tcsEl = document.getElementById('trackCinemaStyle'); if (_tcsEl) _tcsEl.value = t.cinemaStyle || 'bar';")

add("C5-6 gsSyncUI gsCinemaStyle",
"    setChk('gsCinema', gs.cinema !== false);",
"    setChk('gsCinema', gs.cinema !== false);\n"
"    setSel('gsCinemaStyle', gs.cinemaStyle || 'bar');")

add("C5-7 attachGlobalUI gsCinemaStyle",
"      if (!gs.cinema) engageCinema(false);   // global off -> show controls now\n"
"    });",
"      if (!gs.cinema) engageCinema(false);   // global off -> show controls now\n"
"    });\n"
"    const gsCinemaStyleEl = g('gsCinemaStyle');\n"
"    if (gsCinemaStyleEl) gsCinemaStyleEl.addEventListener('change', () => {\n"
"      gs.cinemaStyle = gsCinemaStyleEl.value || 'bar';\n"
"      gsSave();\n"
"      if (el.player.classList.contains('cinema')) engageCinema(true);   // re-apply the look\n"
"    });")

add("C5-8 theme-tracks cinemaStyle",
"        cinema: (t.cinema == null ? null : !!t.cinema),",
"        cinema: (t.cinema == null ? null : !!t.cinema),\n"
"        cinemaStyle: t.cinemaStyle || null,")

add("C5-9 rebuild-loops cinemaStyle",
"          cinema: (st && st.cinema == null ? null : !!(st && st.cinema)),",
"          cinema: (st && st.cinema == null ? null : !!(st && st.cinema)),\n"
"          cinemaStyle: (st && st.cinemaStyle) || null,",
exp=2)

errors = []
for name, old, new, exp in pairs:
    n = c.count(old)
    if n != exp: errors.append("%s: expected %d, found %d" % (name, exp, n)); continue
    c = c.replace(old, new)
if errors:
    print("ABORTED:"); 
    for e in errors: print("  " + e)
    sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c)
print("OK — applied %d cinema v5 JS patches" % len(pairs))
