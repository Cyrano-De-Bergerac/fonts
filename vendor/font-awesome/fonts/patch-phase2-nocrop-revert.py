#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Revert the video auto-fill skip so videos DEFAULT to filling the circle again
(contain + cover-fill scale = looks like a fill), while keeping contain so zooming
OUT can reveal the full aspect-ratio frame."""
import sys
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()
OLD = ("    const tr = trackTransform(t);\n"
"    if (!isIdentityTransform(tr)) return;\n"
"    if (el.coverVideo && el.coverVideo.style.display !== 'none') return;   // video: show whole frame by default (no cover-fill crop)\n"
"    // only frame the media that belongs to THIS track right now. The")
NEW = ("    const tr = trackTransform(t);\n"
"    if (!isIdentityTransform(tr)) return;\n"
"    // video defaults to FILLING the circle (auto cover-fill), but because the element\n"
"    // is object-fit:contain, zooming OUT reveals the full aspect-ratio frame.\n"
"    // only frame the media that belongs to THIS track right now. The")
n = c.count(OLD)
if n != 1:
    print("ABORTED: expected 1, found %d" % n); sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c.replace(OLD, NEW))
print("OK — videos default to filling the circle again; zoom-out reaches full frame")
