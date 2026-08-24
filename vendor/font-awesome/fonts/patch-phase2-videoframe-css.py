#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""styles.css: grab cursor on the video (signals it's draggable); default in cinema."""
import sys
SRC = "styles.css"
c = open(SRC, encoding="utf-8").read()
ANCHOR = (
".music-player.cinema.head-only .arc-track,\n"
".music-player.cinema.head-only .arc-progress,\n"
".music-player.cinema.head-only .wheel { opacity: 0; }\n"
)
APPEND = (
"\n"
"/* direct video framing (panel out): grab cursor signals the video is draggable/\n"
"   zoomable; cinema uses default (not draggable — it fills) */\n"
".music-player #coverVideo.album { cursor: grab; }\n"
".music-player.cinema #coverVideo.album { cursor: default; }\n"
)
n = c.count(ANCHOR)
if n != 1:
    print("ABORTED: anchor found %d" % n); sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c.replace(ANCHOR, ANCHOR + APPEND))
print("OK — video framing cursor CSS appended")
