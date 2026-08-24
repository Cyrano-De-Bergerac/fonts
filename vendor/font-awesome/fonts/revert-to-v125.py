#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Revert to v125: undo v126-v128 video object-fit/fill experiments.
1. loadTrack: remove videoUntweaked/vfill block -> original simple transform.
2. CSS: cinema video object-fit contain -> cover (v125)."""

# --- JS ---
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()

OLD_JS = (
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
NEW_JS = (
"    let cs = tr.coverScale || 1;\n"
"    if (isIdentityTransform(tr)){\n"
"      const auto = computeCoverFillScale();\n"
"      if (auto) cs = auto;\n"
"    }\n"
"    setVarPx('--cover-dx', tr.coverDx || 0);\n"
"    setVarPx('--cover-dy', tr.coverDy || 0);\n"
"    setVarNum('--cover-scale', cs);"
)
assert c.count(OLD_JS) == 1, "JS block not found uniquely"
c = c.replace(OLD_JS, NEW_JS)
open(SRC, "w", encoding="utf-8").write(c)
print("OK — loadTrack reverted to v125")

# --- CSS ---
SRC2 = "styles.css"
c2 = open(SRC2, encoding="utf-8").read()
OLD_CSS = (
".music-player.cinema #coverVideo.album {\n"
"  object-fit: contain;\n"
"  transform: translate(var(--cover-dx), var(--cover-dy)) scale(calc(var(--cover-scale) * var(--beat-pulse, 1)));\n"
"}"
)
NEW_CSS = (
".music-player.cinema #coverVideo.album {\n"
"  object-fit: cover;\n"
"  transform: translate(var(--cover-dx), var(--cover-dy)) scale(calc(var(--cover-scale) * var(--beat-pulse, 1)));\n"
"}"
)
assert c2.count(OLD_CSS) == 1, "CSS block not found uniquely"
c2 = c2.replace(OLD_CSS, NEW_CSS)
open(SRC2, "w", encoding="utf-8").write(c2)
print("OK — cinema video CSS reverted to cover (v125)")
