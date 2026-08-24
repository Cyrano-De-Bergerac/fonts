#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Show the entire video with no cropping: cinema uses object-fit: contain, and the
auto cover-fill is skipped for video (so it loads at scale 1 = whole frame)."""
import sys
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()
OLD = ("    const tr = trackTransform(t);\n"
"    if (!isIdentityTransform(tr)) return;\n"
"    // only frame the media that belongs to THIS track right now. The")
NEW = ("    const tr = trackTransform(t);\n"
"    if (!isIdentityTransform(tr)) return;\n"
"    if (el.coverVideo && el.coverVideo.style.display !== 'none') return;   // video: show whole frame by default (no cover-fill crop)\n"
"    // only frame the media that belongs to THIS track right now. The")
n = c.count(OLD)
if n != 1:
    print("ABORTED: expected 1, found %d" % n); sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c.replace(OLD, NEW))
print("OK — video no longer cover-filled on load (shows whole frame)")
