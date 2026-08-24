#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cinema v3: buffer zone above the progress bar so the playhead can be grabbed &
dragged while controls stay hidden; controls return only after the mouse crosses
~1cm past the bar into the main area."""
import sys
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()

OLD = (
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
"  }"
)

NEW = (
"  function attachCinema(){\n"
"    // Buffer zone above the progress bar: the playhead can be grabbed & dragged\n"
"    // without revealing the controls. Controls only return once the mouse moves\n"
"    // ~1cm PAST (above) the progress bar into the main area. Leaving the player\n"
"    // re-engages cinema (if enabled + video playing).\n"
"    const CM = 38; // ~1cm in CSS px (96dpi)\n"
"    el.player.addEventListener('mouseenter', () => { _cinemaMouseOver = true; });\n"
"    el.player.addEventListener('mousemove', (e) => {\n"
"      if (!el.player.classList.contains('cinema')) return;\n"
"      const barTop = el.seeker ? el.seeker.getBoundingClientRect().top : Infinity;\n"
"      if (e.clientY < barTop - CM) engageCinema(false);   // past the buffer -> show controls\n"
"    });\n"
"    el.player.addEventListener('mouseleave', () => {\n"
"      _cinemaMouseOver = false;\n"
"      if (videoMediaActive() && cinemaEnabledForTrack() && state.master && !state.master.paused) engageCinema(true);\n"
"    });\n"
"  }"
)

n = c.count(OLD)
if n != 1:
    print("ABORTED: expected 1, found %d" % n); sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c.replace(OLD, NEW))
print("OK — cinema now has a 1cm buffer above the progress bar")
