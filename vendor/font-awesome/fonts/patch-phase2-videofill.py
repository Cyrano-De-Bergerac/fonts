#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Reliable video fill: keep object-fit:contain (so the WHOLE media is rendered and
reachable by pan/zoom), and apply the cover-fill scale robustly once the video's
metadata is available (loadTrack runs before dimensions are known). Heals stale
low-scale framing. No toggle — defaults to filling the circle."""
import sys
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()

OLD = (
"    const tr = trackTransform(t);\n"
"    let cs = tr.coverScale || 1;\n"
"    if (isIdentityTransform(tr)){\n"
"      const auto = computeCoverFillScale();\n"
"      if (auto) cs = auto;\n"
"    }\n"
"    setVarPx('--cover-dx', tr.coverDx || 0);\n"
"    setVarPx('--cover-dy', tr.coverDy || 0);\n"
"    setVarNum('--cover-scale', cs);"
)

NEW = (
"    const tr = trackTransform(t);\n"
"    let cs = tr.coverScale || 1;\n"
"    // VIDEO defaults to FILLING the circle. Because the element is object-fit:contain,\n"
"    // the WHOLE media stays rendered and reachable by pan/zoom (drag to any corner).\n"
"    // A near-1 scale with no drag counts as untweaked -> also heals stale framing\n"
"    // left from earlier experiments so every video fills again.\n"
"    const videoUntweaked = !!(t.video && el.coverVideo && (isIdentityTransform(tr) ||\n"
"      ((tr.coverScale || 1) <= 1.05 && Math.abs(tr.coverDx || 0) < 5 && Math.abs(tr.coverDy || 0) < 5)));\n"
"    if (isIdentityTransform(tr) || videoUntweaked){\n"
"      const auto = computeCoverFillScale();\n"
"      if (auto) cs = auto;\n"
"    }\n"
"    setVarPx('--cover-dx', tr.coverDx || 0);\n"
"    setVarPx('--cover-dy', tr.coverDy || 0);\n"
"    setVarNum('--cover-scale', cs);\n"
"    // video dimensions are not ready at load time -> re-apply the fill once metadata\n"
"    // lands (and a timeout fallback), so the video reliably fills the circle.\n"
"    if (t.video && el.coverVideo){\n"
"      const vfill = () => {\n"
"        if (demoPlaylist[state.currentIndex] !== t) return;\n"
"        const ctt = trackTransform(t);\n"
"        const def = isIdentityTransform(ctt) || ((ctt.coverScale || 1) <= 1.05 && Math.abs(ctt.coverDx || 0) < 5 && Math.abs(ctt.coverDy || 0) < 5);\n"
"        if (!def) return;\n"
"        const s = computeCoverFillScale();\n"
"        if (s && s > 1){ setVarNum('--cover-scale', s); if (el.coverZoom) el.coverZoom.value = String(s); if (el.coverZoomVal) el.coverZoomVal.textContent = s.toFixed(2) + '×'; }\n"
"      };\n"
"      if (el.coverVideo.readyState >= 1) vfill(); else el.coverVideo.addEventListener('loadedmetadata', vfill, { once: true });\n"
"      setTimeout(vfill, 500);\n"
"    }"
)

n = c.count(OLD)
if n != 1:
    print("ABORTED: expected 1, found %d" % n); sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c.replace(OLD, NEW))
print("OK — video fill now reliable (fills the circle; whole media stays pan/zoomable)")
