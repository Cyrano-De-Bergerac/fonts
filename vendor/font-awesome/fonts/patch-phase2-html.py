#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Atomic dev.html patch for Phase 2: bpm-detect script + Global tab controls.
Aborts without writing if any anchor doesn't match exactly once."""
import sys
SRC = "dev.html"
with open(SRC, "r", encoding="utf-8") as f:
    c = f.read()
pairs = []
def add(name, old, new): pairs.append((name, old, new))

add("D1 bpm-detect script",
'  <script src="vendor/colorthief/color-thief.global.js?v=111"></script>\n'
'  <script src="script.js?v=111"></script>',
'  <script src="vendor/colorthief/color-thief.global.js?v=111"></script>\n'
'  <script src="vendor/bpm-detect/bpm-detect.js?v=111"></script>\n'
'  <script src="script.js?v=111"></script>')

add("D2 global tempo/snap line",
'      <div class="gs-trans-line">\n'
'        <label for="gsTransCurve">Curve:</label>\n'
'        <select id="gsTransCurve">\n'
'          <option value="equal-power">Equal power</option>\n'
'          <option value="equal-gain">Equal gain</option>\n'
'        </select>\n'
'      </div>',
'      <div class="gs-trans-line">\n'
'        <label for="gsTransCurve">Curve:</label>\n'
'        <select id="gsTransCurve">\n'
'          <option value="equal-power">Equal power</option>\n'
'          <option value="equal-gain">Equal gain</option>\n'
'        </select>\n'
'      </div>\n'
'      <div class="gs-trans-line">\n'
'        <label for="gsTransTempo">Tempo:</label>\n'
'        <select id="gsTransTempo" title="How two tracks align in speed during a blend">\n'
'          <option value="instant">Instant</option>\n'
'          <option value="locked">Locked (match speed)</option>\n'
'          <option value="ramp">Ramp (glide)</option>\n'
'        </select>\n'
'        <label class="inline-check" title="Land blends on a bar line (needs detected BPM)"><input type="checkbox" id="gsTransSnap" /> Snap to beat</label>\n'
'      </div>')

add("D3 beat-pulse defaults row",
'      <span class="hint-inline">Level new sessions start at (applies now too).</span>\n'
'    </div>',
'      <span class="hint-inline">Level new sessions start at (applies now too).</span>\n'
'    </div>\n'
'    <div class="row">\n'
'      <label class="inline-check" title="Pulse the album art on every beat (uses the detected BPM)"><input type="checkbox" id="gsBeatPulse" checked /> Beat-pulse artwork</label>\n'
'      <div class="color-field gs-wide"><label>Pulse strength</label>\n'
'        <input type="range" id="gsBeatPulseStrength" min="0" max="100" step="5" value="35" />\n'
'        <span class="zoom-value" id="gsBeatPulseStrengthVal">35%</span>\n'
'      </div>\n'
'    </div>')

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
