#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""dev.html: per-track Cinema checkbox (video options) + global Cinema default (Global tab).
Anchors use the file's actual 6-space/4-space indentation."""
import sys
SRC = "dev.html"
c = open(SRC, encoding="utf-8").read()
pairs = []
def add(name, old, new): pairs.append((name, old, new))

add("H-1 trackCinema checkbox",
'      <label><input type="checkbox" id="videoLoop" checked /> Loop video</label>\n'
'    </div>',
'      <label><input type="checkbox" id="videoLoop" checked /> Loop video</label>\n'
'      <label><input type="checkbox" id="trackCinema" checked /> Cinema mode (auto-hide controls)</label>\n'
'    </div>')

add("H-2 gsCinema global toggle",
'      <span class="hint-inline">Show track info and controls on the OS lock screen, notification shade and hardware media keys.</span>\n'
'    </div>',
'      <span class="hint-inline">Show track info and controls on the OS lock screen, notification shade and hardware media keys.</span>\n'
'    </div>\n'
'    <div class="row">\n'
'      <label><input type="checkbox" id="gsCinema" checked /> Cinema mode (auto-hide controls on video tracks)</label>\n'
'      <span class="hint-inline">Default for tracks without a per-track Cinema setting.</span>\n'
'    </div>')

errors = []
for name, old, new in pairs:
    n = c.count(old)
    if n != 1: errors.append("%s: expected 1, found %d" % (name, n)); continue
    c = c.replace(old, new)
if errors:
    print("ABORTED:")
    for e in errors: print("  " + e)
    sys.exit(1)
open(SRC, "w", encoding="utf-8").write(c)
print("OK — applied %d dev.html cinema patches" % len(pairs))
