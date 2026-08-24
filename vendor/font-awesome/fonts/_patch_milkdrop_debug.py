#!/usr/bin/env python3
# VIZ-28 debug: add console.log diagnostics to startMilkdrop + preset cycle UI.
P = "/home/user/script.js"
src = open(P, encoding="utf-8").read(); orig = src
def repl(old, new, label, n=1):
    global src
    c = src.count(old)
    if c != n: raise SystemExit(f"FAIL [{label}]: found {c} (want {n})\n{old[:80]}")
    src = src.replace(old, new)

# 1) console diagnostics in startMilkdrop
repl("    stopMilkdrop();\n    if (!milkdropSupported())",
     "    stopMilkdrop();\n    const _wgl2 = milkdropSupported();\n    console.log('[Milkdrop] start: WebGL2=' + _wgl2);\n    if (!_wgl2)",
     "1a wgl2 log")
repl("    const ok = await ensureButterchurn();\n    if (!ok || !window.butterchurn)",
     "    const ok = await ensureButterchurn();\n    console.log('[Milkdrop] butterchurn loaded=' + ok + ' global=' + !!window.butterchurn + ' presets=' + !!(window.butterchurnPresetsMinimal || window.butterchurnPresets));\n    if (!ok || !window.butterchurn)",
     "1b load log")
repl("      milkdropViz = window.butterchurn.createVisualizer(vizAudioCtx, cv, { width: cv.width, height: cv.height });",
     "      milkdropViz = window.butterchurn.createVisualizer(vizAudioCtx, cv, { width: cv.width, height: cv.height });\n      console.log('[Milkdrop] visualizer created ' + cv.width + 'x' + cv.height);",
     "1c viz log")
repl("      if (!milkdropRAF) milkdropRAF = requestAnimationFrame(milkdropTick);\n    } catch(e){ setSyncStatus('Milkdrop error: ' + (e.message || e), false); }",
     "      console.log('[Milkdrop] presets=' + (milkdropPresetNames ? milkdropPresetNames.length : 0) + ' rendering started');\n      if (!milkdropRAF) milkdropRAF = requestAnimationFrame(milkdropTick);\n    } catch(e){ console.error('[Milkdrop] error:', e); setSyncStatus('Milkdrop error: ' + (e.message || e), false); }",
     "1d render+error log")

# 2) preset cycle function (after stopMilkdrop)
repl("\n  function stopMilkdrop(){",
     "\n  function cycleMilkdropPreset(dir){\n"
     "    if (!milkdropPresetNames || !milkdropPresetNames.length) return;\n"
     "    milkdropPresetIdx = (milkdropPresetIdx + dir + milkdropPresetNames.length) % milkdropPresetNames.length;\n"
     "    const name = milkdropPresetNames[milkdropPresetIdx];\n"
     "    if (milkdropViz) try { milkdropViz.loadPreset(milkdropPresets[name], 1.0); } catch {}\n"
     "    milkdropCycleT = performance.now();\n"
     "    viz.milkdropPreset = name;\n"
     "    const el2 = document.getElementById('vizMilkdropPresetName');\n"
     "    if (el2) el2.textContent = name.length > 40 ? name.slice(0, 37) + '\\u2026' : name;\n"
     "  }\n"
     "  function stopMilkdrop(){",
     "2 cycle fn")

# 3) vizSyncUI: show/hide the milkdrop preset row + update name
repl("    { const eon = (viz.edgeMode || 'off') !== 'off';",
     "    { const mdOn = viz.mode === 'milkdrop';\n"
     "      const mdRow = g('vizMilkdropRow'); if (mdRow) mdRow.classList.toggle('visible', mdOn);\n"
     "      if (mdOn && milkdropPresetNames){ const nm = milkdropPresetNames[milkdropPresetIdx] || ''; const mdn = g('vizMilkdropPresetName'); if (mdn) mdn.textContent = nm.length > 40 ? nm.slice(0,37)+'\\u2026' : nm; }\n"
     "    { const eon = (viz.edgeMode || 'off') !== 'off';",
     "3 vizSyncUI")

# 4) attachVisualizerUI: bind preset cycle buttons
repl("    bind('vizEdgeColors', e => { viz.edgeColors = e.target.value; vizSave(); vizSyncUI(); });",
     "    bind('vizEdgeColors', e => { viz.edgeColors = e.target.value; vizSave(); vizSyncUI(); });\n"
     "    const mdPrev = g('vizMilkdropPrev'); if (mdPrev) mdPrev.addEventListener('click', () => { cycleMilkdropPreset(-1); });\n"
     "    const mdNext = g('vizMilkdropNext'); if (mdNext) mdNext.addEventListener('click', () => { cycleMilkdropPreset(1); });",
     "4 buttons")

if src == orig: raise SystemExit("FAIL: no changes")
open(P, "w", encoding="utf-8").write(src)
print("OK — Milkdrop diagnostics + preset cycle added.")
