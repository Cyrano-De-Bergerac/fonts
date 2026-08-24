#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Enable reposition/zoom of the video WHILE IN CINEMA (full-circle) view:
- framable() no longer blocks cinema (drag works in cinema too)
- a drag-in-progress flag keeps cinema on while reframing
- cinema hover-exit becomes a lower CONTROL ZONE (so the video area stays in cinema,
  draggable); controls return when you move to the bottom (progress bar/buttons)."""
import sys
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()
pairs = []
def add(name, old, new): pairs.append((name, old, new))

add("VF3-1 framable allow cinema",
"    const framable = () => videoMediaActive() && !player.classList.contains('cinema') && !state.dragMode;",
"    const framable = () => videoMediaActive() && !state.dragMode;   // works in cinema AND panel-out")

add("VF3-2 pointerdown set drag flag",
"      dragging = true; sx = e.clientX; sy = e.clientY;\n"
"      sdx = getVarNum('--cover-dx'); sdy = getVarNum('--cover-dy');\n"
"      try { player.setPointerCapture(e.pointerId); } catch {}\n"
"      e.preventDefault();",
"      dragging = true; state._videoDragActive = true; sx = e.clientX; sy = e.clientY;\n"
"      sdx = getVarNum('--cover-dx'); sdy = getVarNum('--cover-dy');\n"
"      try { player.setPointerCapture(e.pointerId); } catch {}\n"
"      e.preventDefault();")

add("VF3-3 end clear drag flag",
"      dragging = false;\n"
"      try { player.releasePointerCapture(e.pointerId); } catch {}\n"
"      persistCoverTransform();",
"      dragging = false; state._videoDragActive = false;\n"
"      try { player.releasePointerCapture(e.pointerId); } catch {}\n"
"      persistCoverTransform();")

add("VF3-4 cinema hover = control zone",
"    el.player.addEventListener('mousemove', (e) => {\n"
"      if (!el.player.classList.contains('cinema')) return;\n"
"      // buffer hugs the player's circular EDGE (the progress arc lives on it):\n"
"      // cinema stays while the mouse is within ~CM of the edge — so the playhead is\n"
"      // grabbable anywhere along the arc — and returns once it moves past into the middle\n"
"      const rr = el.player.getBoundingClientRect();\n"
"      const dist = Math.hypot(e.clientX - (rr.left + rr.width/2), e.clientY - (rr.top + rr.height/2));\n"
"      if (dist < rr.width/2 - CM) engageCinema(false);\n"
"    });",
"    el.player.addEventListener('mousemove', (e) => {\n"
"      if (!el.player.classList.contains('cinema')) return;\n"
"      if (state._videoDragActive) return;   // reframing the video -> keep cinema on\n"
"      // cinema stays over the VIDEO area (so it can be dragged/zoomed in full-circle\n"
"      // view); controls return only when the mouse moves into the lower control zone\n"
"      // (progress bar + buttons) or leaves the player (mouseleave below)\n"
"      const rr = el.player.getBoundingClientRect();\n"
"      if (e.clientY > rr.top + rr.height * 0.6) engageCinema(false);\n"
"    });")

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
print("OK — cinema-state video reframing enabled")
