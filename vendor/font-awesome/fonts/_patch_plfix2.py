#!/usr/bin/env python3
# Fix: 1) init pl-cinema removed, 2) Milkdrop opacity for backdrop,
# 3) PL preset cycle (populate globals), 4) independent PL settings.
P = "/home/user/script.js"
src = open(P, encoding="utf-8").read(); orig = src
def repl(old, new, label, n=1):
    global src
    c = src.count(old)
    if c != n: raise SystemExit(f"FAIL [{label}]: found {c} (want {n})\n{old[:80]}")
    src = src.replace(old, new)

# 1) NEVER add pl-cinema on init
repl("      if (gs.plCinema !== false) plCircle.classList.add('pl-cinema');\n",
     "      // playlist starts NON-cinema; cinema only on mouseleave\n",
     "1")

# 2) viz object: add PL independent settings
repl("    plMilkdropPreset: null   // PL milkdrop: saved preset name",
     "    plMilkdropPreset: null,  // PL milkdrop: saved preset name\n"
     "    plSensitivity: 100, plSmoothing: 0.82, plBars: 32, plColors: 'theme'",
     "2")

# 3) VIZ_DEFAULTS
repl("    plMode: 'off', plOpacity: 0.85, plMirror: false, plMilkdropPreset: null\n  };",
     "    plMode: 'off', plOpacity: 0.85, plMirror: false, plMilkdropPreset: null,\n"
     "    plSensitivity: 100, plSmoothing: 0.82, plBars: 32, plColors: 'theme'\n  };",
     "3")

# 4) startPlMilkdrop: populate shared preset globals + canvas opacity
repl("      console.log('[PlMilkdrop] started, presets=' + names.length);",
     "      if (!milkdropPresets) { milkdropPresets = presets; milkdropPresetNames = names; }\n"
     "      cv.style.opacity = String(viz.plOpacity || 0.85);\n"
     "      console.log('[PlMilkdrop] started, presets=' + names.length);",
     "4")

# 5) plVizTick: swap to PL settings before draw, restore after
repl("    const t = performance.now() / 1000;\n    const pal = vizPalette();",
     "    const t = performance.now() / 1000;\n"
     "    // swap to PL-independent settings for the draw\n"
     "    const _sv = { s: viz.sensitivity, b: viz.bars, c: viz.colors };\n"
     "    if (viz.plSensitivity != null) viz.sensitivity = viz.plSensitivity;\n"
     "    if (viz.plBars != null) viz.bars = viz.plBars;\n"
     "    if (viz.plColors) viz.colors = viz.plColors;\n"
     "    const pal = vizPalette();",
     "5a")
repl("    ctx.globalAlpha = 1;\n    plVizRAF = requestAnimationFrame(plVizTick);",
     "    ctx.globalAlpha = 1;\n"
     "    viz.sensitivity = _sv.s; viz.bars = _sv.b; viz.colors = _sv.c; // restore\n"
     "    plVizRAF = requestAnimationFrame(plVizTick);",
     "5b")

# 6) vizSyncUI
repl("    { const pm = g('vizPlMirror'); if (pm) pm.checked = !!viz.plMirror; }",
     "    { const pm = g('vizPlMirror'); if (pm) pm.checked = !!viz.plMirror; }\n"
     "    set('vizPlSensitivity', viz.plSensitivity != null ? viz.plSensitivity : 100);\n"
     "    setVal('vizPlSensitivityVal', (viz.plSensitivity != null ? viz.plSensitivity : 100) + '%');\n"
     "    set('vizPlBars', viz.plBars != null ? viz.plBars : 32);\n"
     "    setVal('vizPlBarsVal', viz.plBars != null ? viz.plBars : 32);\n"
     "    set('vizPlColors', viz.plColors || 'theme');",
     "6")

# 7) Bindings
repl("    bind('vizPlOpacity', e => { viz.plOpacity = +e.target.value / 100;",
     "    bind('vizPlSensitivity', e => { viz.plSensitivity = +e.target.value; const v = g('vizPlSensitivityVal'); if (v) v.textContent = viz.plSensitivity + '%'; vizSave(); });\n"
     "    bind('vizPlBars', e => { viz.plBars = +e.target.value; const v = g('vizPlBarsVal'); if (v) v.textContent = viz.plBars; vizSave(); });\n"
     "    bind('vizPlColors', e => { viz.plColors = e.target.value; vizSave(); vizSyncUI(); });\n"
     "    bind('vizPlOpacity', e => { viz.plOpacity = +e.target.value / 100; const plmd = document.querySelector('.pl-viz-canvas-milkdrop'); if (plmd) plmd.style.opacity = viz.plOpacity;",
     "7")

# 8) Persistence
repl("      plMirror: viz.plMirror, plMilkdropPreset: viz.plMilkdropPreset\n    };",
     "      plMirror: viz.plMirror, plMilkdropPreset: viz.plMilkdropPreset,\n"
     "      plSensitivity: viz.plSensitivity, plSmoothing: viz.plSmoothing,\n"
     "      plBars: viz.plBars, plColors: viz.plColors\n    };",
     "8a")
repl("        plMirror: viz.plMirror, plMilkdropPreset: viz.plMilkdropPreset\n      };",
     "        plMirror: viz.plMirror, plMilkdropPreset: viz.plMilkdropPreset,\n"
     "        plSensitivity: viz.plSensitivity, plSmoothing: viz.plSmoothing,\n"
     "        plBars: viz.plBars, plColors: viz.plColors\n      };",
     "8b")

if src == orig: raise SystemExit("FAIL: no changes")
open(P, "w", encoding="utf-8").write(src)
print("OK")
