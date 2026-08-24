#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cinema video: object-fit cover -> contain so the ENTIRE video shows (letterboxed
inside the circle) with no cropping."""
import sys
SRC = "styles.css"
c = open(SRC, encoding="utf-8").read()
OLD = (".music-player.cinema #coverVideo.album {\n"
"  object-fit: cover;\n"
"  transform: translate(var(--cover-dx), var(--cover-dy)) scale(calc(var(--cover-scale) * var(--beat-pulse, 1)));\n"
"}")
NEW = (".music-player.cinema #coverVideo.album {\n"
"  object-fit: contain;\n"
"  transform: translate(var(--cover-dx), var(--cover-dy)) scale(calc(var(--cover-scale) * var(--beat-pulse, 1)));\n"
"}")
n = c.count(OLD)
if n != 1:
    print("ABORTED: expected 1, found %d" % n); sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c.replace(OLD, NEW))
print("OK — cinema video now uses contain (whole video, no crop)")
