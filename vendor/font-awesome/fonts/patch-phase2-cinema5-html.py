#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""dev.html: Cinema style dropdown (per-track in Video options + global in Global tab)."""
import sys
SRC = "dev.html"
c = open(SRC, encoding="utf-8").read()
pairs = []
def add(name, old, new): pairs.append((name, old, new))

add("H-1 trackCinemaStyle select",
'      <label><input type="checkbox" id="trackCinema" checked /> Cinema mode (auto-hide controls)</label>\n'
'    </div>',
'      <label><input type="checkbox" id="trackCinema" checked /> Cinema mode (auto-hide controls)</label>\n'
'      <label>Cinema style:\n'
'        <select id="trackCinemaStyle">\n'
'          <option value="bar">Progress bar</option>\n'
'          <option value="head">Playhead only</option>\n'
'        </select>\n'
'      </label>\n'
'    </div>')

add("H-2 gsCinemaStyle select",
'      <span class="hint-inline">Default for tracks without a per-track Cinema setting.</span>\n'
'    </div>',
'      <span class="hint-inline">Default for tracks without a per-track Cinema setting.</span>\n'
'    </div>\n'
'    <div class="row">\n'
'      <label for="gsCinemaStyle">Cinema style:</label>\n'
'      <select id="gsCinemaStyle">\n'
'        <option value="bar">Progress bar</option>\n'
'        <option value="head">Playhead only</option>\n'
'      </select>\n'
'      <span class="hint-inline">"Playhead only" hides the track + tail, leaving just the scrubbable playhead.</span>\n'
'    </div>')

errors = []
for name, old, new in pairs:
    n = c.count(old)
    if n != 1: errors.append("%s: expected 1, found %d" % (name, n)); continue
    c = c.replace(old, new)
if errors:
    print("ABORTED:"); 
    for e in errors: print("  " + e)
    sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c)
print("OK — applied %d dev.html cinema-style patches" % len(pairs))
