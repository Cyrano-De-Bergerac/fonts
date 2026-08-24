#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cinema/immersive video mode — CSS. Append at end of styles.css."""
import sys
SRC = "styles.css"
c = open(SRC, encoding="utf-8").read()

APPEND = (
"\n"
"/* ============================================================ */\n"
"/* CINEMA / immersive video mode                                */\n"
"/* A playing video + mouse off the player -> the control surface */\n"
"/* fades out (panel, icons, buttons, text) leaving the scrubber + */\n"
"/* playhead, and the video fills the circle. Mouse over the main  */\n"
"/* player area fades controls back in (the scrubber stays usable  */\n"
"/* while hidden). JS toggles the .cinema class (video-only).       */\n"
".music-player .dash,\n"
".music-player .dash > *,\n"
".music-player .dash::before,\n"
".music-player .dash::after { transition: opacity .35s ease; }\n"
".music-player.cinema .dash::before,\n"
".music-player.cinema .dash::after { opacity: 0; }\n"
".music-player.cinema .dash > *:not(.seeker):not(.knob-overlay) { opacity: 0; pointer-events: none; }\n"
"/* video fills the whole circle (cover), neutralising drag/zoom so it fills cleanly */\n"
".music-player.cinema #coverVideo.album {\n"
"  object-fit: cover;\n"
"  transform: scale(var(--beat-pulse, 1));\n"
"}\n"
)

marker = ".pm-trans-editor .tr-tempo{ background: #23262e; color: #e6e9f0; border: 1px solid #3a3f4b; border-radius: 6px; padding: 4px 6px; font-size: 12px; }\n"
n = c.count(marker)
if n != 1:
    print("ABORTED: anchor not found once (%d)" % n); sys.exit(1)
c = c.replace(marker, marker + APPEND)
open(SRC, "w", encoding="utf-8").write(c)
print("OK — cinema CSS appended to %s" % SRC)
