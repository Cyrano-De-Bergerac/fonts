#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Direct video framing: drag to reposition + wheel to zoom the video on the player
while the control panel is out (cinema off). Persists per-track transform."""
import sys
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()
pairs = []
def add(name, old, new): pairs.append((name, old, new))

VIDFUNCS = (
"  // ---- direct video framing: drag to reposition, wheel to zoom the video while the\n"
"  // ---- control panel is out (cinema off). Uses the same --cover-* vars as the editor\n"
"  // ---- Reposition tool, so framing is consistent and persists per track.\n"
"  function persistCoverTransform(){\n"
"    const t = demoPlaylist[state.currentIndex];\n"
"    if (!t) return;\n"
"    t.transform = Object.assign({}, t.transform || {}, {\n"
"      coverDx: getVarNum('--cover-dx'), coverDy: getVarNum('--cover-dy'), coverScale: getVarNum('--cover-scale', 1)\n"
"    });\n"
"    state.playlistDirty = true; savePlaylist();\n"
"  }\n"
"  function attachVideoFraming(){\n"
"    const v = el.coverVideo;\n"
"    if (!v) return;\n"
"    let dragging = false, sx = 0, sy = 0, sdx = 0, sdy = 0, wheelTimer = null;\n"
"    const framable = () => videoMediaActive() && !el.player.classList.contains('cinema') && !state.dragMode;\n"
"    v.addEventListener('pointerdown', (e) => {\n"
"      if (!framable()) return;\n"
"      dragging = true; sx = e.clientX; sy = e.clientY;\n"
"      sdx = getVarNum('--cover-dx'); sdy = getVarNum('--cover-dy');\n"
"      try { v.setPointerCapture(e.pointerId); } catch {}\n"
"      v.style.cursor = 'grabbing';\n"
"    });\n"
"    v.addEventListener('pointermove', (e) => {\n"
"      if (!dragging) return;\n"
"      setVarPx('--cover-dx', sdx + (e.clientX - sx));\n"
"      setVarPx('--cover-dy', sdy + (e.clientY - sy));\n"
"    });\n"
"    const end = (e) => {\n"
"      if (!dragging) return;\n"
"      dragging = false; v.style.cursor = '';\n"
"      try { v.releasePointerCapture(e.pointerId); } catch {}\n"
"      persistCoverTransform();\n"
"    };\n"
"    v.addEventListener('pointerup', end);\n"
"    v.addEventListener('pointercancel', end);\n"
"    v.addEventListener('wheel', (e) => {\n"
"      if (!framable()) return;\n"
"      e.preventDefault();\n"
"      const s = clamp(getVarNum('--cover-scale', 1) + (-e.deltaY * 0.0015), 0.5, 5);\n"
"      setVarNum('--cover-scale', s);\n"
"      if (el.coverZoom) el.coverZoom.value = String(s);\n"
"      if (el.coverZoomVal) el.coverZoomVal.textContent = s.toFixed(2) + '×';\n"
"      clearTimeout(wheelTimer); wheelTimer = setTimeout(persistCoverTransform, 250);\n"
"    }, { passive: false });\n"
"  }\n"
"\n"
"  // ---- Global tab UI (dev page) ----\n"
)
add("VF-1 append funcs", "  // ---- Global tab UI (dev page) ----", VIDFUNCS)

add("VF-2 init call",
"    attachCinema();\n"
"  })();",
"    attachCinema();\n"
"    attachVideoFraming();\n"
"  })();")

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
print("OK — video framing added")
