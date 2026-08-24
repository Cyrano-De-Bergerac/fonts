#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CSS: cinema video uses the user's framing transform (dx/dy/scale) on the cover-fill,
so reposition/zoom apply in cinema; grab cursor signals it's draggable there too."""
import sys
SRC = "styles.css"
c = open(SRC, encoding="utf-8").read()
pairs = []
def add(name, old, new): pairs.append((name, old, new))

add("CSS-1 cinema video transform",
".music-player.cinema #coverVideo.album {\n"
"  object-fit: cover;\n"
"  transform: scale(var(--beat-pulse, 1));\n"
"}",
".music-player.cinema #coverVideo.album {\n"
"  object-fit: cover;\n"
"  transform: translate(var(--cover-dx), var(--cover-dy)) scale(calc(var(--cover-scale) * var(--beat-pulse, 1)));\n"
"}")

add("CSS-2 cinema cursor grab",
".music-player.cinema #coverVideo.album { cursor: default; }",
".music-player.cinema #coverVideo.album { cursor: grab; }")

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
print("OK — cinema video framing CSS applied")
