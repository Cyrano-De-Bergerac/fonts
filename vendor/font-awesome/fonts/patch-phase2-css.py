#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Atomic styles.css patch for Phase 2: beat-pulse transform + BPM UI styles.
Aborts without writing if any anchor doesn't match exactly once."""
import sys
SRC = "styles.css"
with open(SRC, "r", encoding="utf-8") as f:
    c = f.read()
pairs = []
def add(name, old, new): pairs.append((name, old, new))

# C1: album transform multiplies by --beat-pulse (default 1 = no effect)
add("C1 album-beatpulse",
"  transform: translate(var(--cover-dx), var(--cover-dy)) scale(var(--cover-scale));",
"  transform: translate(var(--cover-dx), var(--cover-dy)) scale(calc(var(--cover-scale) * var(--beat-pulse, 1)));")

# C2..: append the Phase 2 styles at the end of the file
APPEND = (
"\n"
"/* ============================================================ */\n"
"/* DJ PHASE 2 — beat engine UI + beat-pulse artwork            */\n"
"/* ============================================================ */\n"
":root{ --beat-pulse: 1; }\n"
"\n"
"/* beat-pulse artwork: --beat-pulse is animated in JS (1 at rest, peaks >1\n"
"   on each detected beat). Multiplied into .album's scale via C1 above. */\n"
".music-player{ --beat-pulse-max: 0.04; }\n"
"\n"
"/* BPM chip in the player's info area */\n"
".music-player .info .bpm-chip{\n"
"  display: inline-flex; align-items: center; gap: 3px;\n"
"  margin-top: 5px; padding: 2px 9px; border-radius: 999px;\n"
"  background: var(--timestamp-bg, #201f22); color: var(--timestamp-fg, #fff);\n"
"  font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\n"
"  font-variant-numeric: tabular-nums; letter-spacing: .3px;\n"
"  border: 1px solid rgba(255,255,255,.12);\n"
"}\n"
".music-player .info .bpm-chip .bpm-note{ font-size: 12px; opacity: .85; }\n"
".music-player .info .bpm-chip .bpm-dot{ opacity: .6; font-size: 9px; }\n"
"\n"
"/* BPM cell inside a Playlist Manager row */\n"
".pm-row .pm-bpm{\n"
"  display: flex; align-items: center; gap: 4px; margin-top: 3px;\n"
"  font-size: 11px; opacity: .95;\n"
"}\n"
".pm-row .pm-bpm.detecting{ opacity: .6; }\n"
".pm-row .pm-bpm-note{ color: #7fe3ff; font-size: 12px; }\n"
".pm-row .pm-bpm-val{\n"
"  width: 52px; padding: 1px 4px; border: 0; border-radius: 4px;\n"
"  background: rgba(255,255,255,.08); color: #fff;\n"
"  font: 600 11px/1.3 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\n"
"  font-variant-numeric: tabular-nums;\n"
"}\n"
".pm-row .pm-bpm-val:focus{ outline: 1px solid #29d5ff88; }\n"
".pm-row .pm-bpm-dot{ width: 7px; height: 7px; border-radius: 50%; display: inline-block; }\n"
".pm-row .pm-bpm-dot.conf-high{ background: #54ff9f; }\n"
".pm-row .pm-bpm-dot.conf-low{ background: #ffb84d; }\n"
".pm-row .pm-bpm-dot.conf-none{ background: #566; }\n"
".pm-row .pm-bpm-btn{\n"
"  padding: 1px 5px; font-size: 10px; line-height: 1.3; border: 0; border-radius: 4px;\n"
"  background: #2b6cb0; color: #fff; cursor: pointer; white-space: nowrap;\n"
"}\n"
".pm-row .pm-bpm-btn:hover{ background: #2c5282; }\n"
".pm-row .pm-bpm-src{ font-size: 10px; opacity: .65; margin-left: 1px; }\n"
"\n"
"/* transition editor: tempo/snap rows inherit .pm-trans-row sizing */\n"
".pm-trans-editor .tr-tempo{ background: #23262e; color: #e6e9f0; border: 1px solid #3a3f4b; border-radius: 6px; padding: 4px 6px; font-size: 12px; }\n"
)
add("C2 append-phase2-styles",
"/* v109: REPLACE highlight (middle band of a row during a held file drag) */\n"
".pl-item.drop-replace, .pm-row.drop-replace {\n"
"  outline: 2px dashed #ffb84d !important;\n"
"  outline-offset: -2px;\n"
"  background: rgba(255, 184, 77, .10) !important;\n"
"}",
"/* v109: REPLACE highlight (middle band of a row during a held file drag) */\n"
".pl-item.drop-replace, .pm-row.drop-replace {\n"
"  outline: 2px dashed #ffb84d !important;\n"
"  outline-offset: -2px;\n"
"  background: rgba(255, 184, 77, .10) !important;\n"
"}\n" + APPEND)

errors = []
for name, old, new in pairs:
    cnt = c.count(old)
    if cnt != 1:
        errors.append("%s: expected 1 match, found %d" % (name, cnt)); continue
    c = c.replace(old, new)
if errors:
    print("ABORTED (file untouched):")
    for e in errors: print("  " + e)
    sys.exit(1)
with open(SRC, "w", encoding="utf-8") as f:
    f.write(c)
print("OK — applied %d patches to %s" % (len(pairs), SRC))
