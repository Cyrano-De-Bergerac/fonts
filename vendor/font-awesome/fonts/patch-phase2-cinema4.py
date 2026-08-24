#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cinema v4: (a) buffer hugs the player's CIRCULAR arc (distance-from-center), not the
rectangular scrubber box, so controls return ~1cm past the curve anywhere along it;
(b) scrubbing no longer exits cinema (the scrub-pause guard)."""
import sys
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()
pairs = []
def add(name, old, new): pairs.append((name, old, new))

add("C4-1 CM value",
"    const CM = 38; // ~1cm in CSS px (96dpi)",
"    const CM = 18; // buffer ~5mm CSS px — hugs the arc; playhead stays grabbable")

add("C4-2 circular buffer",
"    el.player.addEventListener('mousemove', (e) => {\n"
"      if (!el.player.classList.contains('cinema')) return;\n"
"      const barTop = el.seeker ? el.seeker.getBoundingClientRect().top : Infinity;\n"
"      if (e.clientY < barTop - CM) engageCinema(false);   // past the buffer -> show controls\n"
"    });",
"    el.player.addEventListener('mousemove', (e) => {\n"
"      if (!el.player.classList.contains('cinema')) return;\n"
"      // buffer hugs the player's circular EDGE (the progress arc lives on it):\n"
"      // cinema stays while the mouse is within ~CM of the edge — so the playhead is\n"
"      // grabbable anywhere along the arc — and returns once it moves past into the middle\n"
"      const rr = el.player.getBoundingClientRect();\n"
"      const dist = Math.hypot(e.clientX - (rr.left + rr.width/2), e.clientY - (rr.top + rr.height/2));\n"
"      if (dist < rr.width/2 - CM) engageCinema(false);\n"
"    });")

add("C4-3 scrub-pause guard",
"    if (videoMediaActive()) engageCinema(false);\n"
"    saveResume();",
"    if (videoMediaActive() && !state.dragging) engageCinema(false);\n"
"    saveResume();")

errors = []
for name, old, new in pairs:
    n = c.count(old)
    if n != 1: errors.append("%s: expected 1, found %d" % (name, n)); continue
    c = c.replace(old, new)
if errors:
    print("ABORTED:"); 
    for e in errors: print("  " + e)
    sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c)
print("OK — cinema buffer now hugs the arc + scrub no longer shows controls")
