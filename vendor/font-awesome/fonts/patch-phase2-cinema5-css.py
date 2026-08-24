#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""styles.css: cinema 'playhead only' look — hide the progress track, tail + seek
wheel; keep the playhead dot (still scrubbable)."""
import sys
SRC = "styles.css"
c = open(SRC, encoding="utf-8").read()

ANCHOR = (
".music-player.cinema #coverVideo.album {\n"
"  object-fit: cover;\n"
"  transform: scale(var(--beat-pulse, 1));\n"
"}\n"
)
APPEND = (
"\n"
"/* cinema 'playhead only': hide the progress track + tail + seek wheel, keep the\n"
"   playhead dot (and its invisible hit target) so the track is still scrubbable */\n"
".music-player .arc-track,\n"
".music-player .arc-progress,\n"
".music-player .wheel { transition: opacity .35s ease; }\n"
".music-player.cinema.head-only .arc-track,\n"
".music-player.cinema.head-only .arc-progress,\n"
".music-player.cinema.head-only .wheel { opacity: 0; }\n"
)

n = c.count(ANCHOR)
if n != 1:
    print("ABORTED: anchor found %d" % n); sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c.replace(ANCHOR, ANCHOR + APPEND))
print("OK — cinema head-only CSS appended")
