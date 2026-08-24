#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 2 patch for script.js (DJ beat engine + beat-synced transitions).
ATOMIC: every old->new must match exactly once or NOTHING is written.
This file is the persisted work-product (crash-safe). Re-runnable on a
pristine v111 script.js.  Run: python3 patch-phase2.py
"""
import sys
SRC = "script.js"
with open(SRC, "r", encoding="utf-8") as f:
    c = f.read()

pairs = []
def add(name, old, new): pairs.append((name, old, new))

# ---- E1: gs defaults (transitionDefault tempo/snap + beat pulse) ----
add("E1 gs-defaults",
"    transitionDefault: { fade: 0, curve: 'equal-power', beats: 0 }   // 0 = gapless",
"    transitionDefault: { fade: 0, curve: 'equal-power', beats: 0, tempoMode: 'instant', snap: false },  // 0 = gapless\n"
"    beatPulse: true,          // DJ Phase 2: artwork \"breathes\" on the detected beat\n"
"    beatPulseStrength: 35     // 0-100 (pulse depth)")

# ---- E2: transitionFor returns tempoMode + snap ----
add("E2 transitionFor",
"      fade: own && isFinite(own.fade) ? own.fade : (def.fade || 0),\n"
"      curve: (own && own.curve) || def.curve || 'equal-power',\n"
"      beats: own && isFinite(own.beats) ? own.beats : (def.beats || 0)\n"
"    };",
"      fade: own && isFinite(own.fade) ? own.fade : (def.fade || 0),\n"
"      curve: (own && own.curve) || def.curve || 'equal-power',\n"
"      beats: own && isFinite(own.beats) ? own.beats : (def.beats || 0),\n"
"      tempoMode: (own && own.tempoMode) || def.tempoMode || 'instant',\n"
"      snap: own && typeof own.snap === 'boolean' ? own.snap : (typeof def.snap === 'boolean' ? def.snap : false)\n"
"    };")

# ---- E6: startTransition tempo-mode ramp ----
add("E6 startTransition",
"    // CROSSFADE: ramp the REAL outgoing element down, the incoming up\n"
"    if (!ready) return false;\n"
"    ensureABWired();\n"
"    AB.active = true;\n"
"    inEl.volume = 0;\n"
"    inEl.play().catch(() => {\n"
"      // incoming track failed to play (bad URL/format) — abort the blend\n"
"      // cleanly and fall back to a normal track load\n"
"      if (AB.blendRaf){ cancelAnimationFrame(AB.blendRaf); AB.blendRaf = null; }\n"
"      AB.active = false;\n"
"      try { outEl.volume = vol; } catch {}\n"
"      loadTrack(nextIdx, true);\n"
"    });\n"
"    const t0 = performance.now();\n"
"    const myGen = AB.gen || 0;\n"
"    const step = () => {\n"
"      // a manual track click or load happened mid-blend — stop ramping\n"
"      if ((AB.gen || 0) !== myGen) return;\n"
"      const k = Math.min(1, (performance.now() - t0) / (fade * 1000));\n"
"      const g = crossfadeGains(k, tr.curve);\n"
"      try { outEl.volume = vol * g.a; } catch {}\n"
"      try { inEl.volume = vol * g.b; } catch {}\n"
"      if (k < 1) AB.blendRaf = requestAnimationFrame(step);\n"
"      else { AB.blendRaf = null; abCompleteHandover(nextIdx, vol); }\n"
"    };\n"
"    step();\n"
"    return true;",
"    // CROSSFADE: ramp the REAL outgoing element down, the incoming up\n"
"    if (!ready) return false;\n"
"    ensureABWired();\n"
"    AB.active = true;\n"
"    inEl.volume = 0;\n"
"    inEl.play().catch(() => {\n"
"      // incoming track failed to play (bad URL/format) — abort the blend\n"
"      // cleanly and fall back to a normal track load\n"
"      if (AB.blendRaf){ cancelAnimationFrame(AB.blendRaf); AB.blendRaf = null; }\n"
"      AB.active = false;\n"
"      try { outEl.volume = vol; } catch {}\n"
"      loadTrack(nextIdx, true);\n"
"    });\n"
"    // DJ Phase 2 — tempo mode: keep both decks at the same speed during the\n"
"    // blend. Locked = incoming time-stretched to the outgoing tempo; Ramp =\n"
"    // both glide outgoing -> incoming. Native preservesPitch (zero deps).\n"
"    // Auto-fallback to Instant when the gap is >12% or BPM unknown, so we\n"
"    // never produce nasty time-stretch artefacts.\n"
"    const outBPM = (t.bpm && t.bpm > 0) ? t.bpm : null;\n"
"    const inBPM = (next.bpm && next.bpm > 0) ? next.bpm : null;\n"
"    const tempoMode = tr.tempoMode || 'instant';\n"
"    const useTempo = tempoMode !== 'instant' && outBPM && inBPM && Math.abs(outBPM - inBPM) / inBPM <= 0.12;\n"
"    const speedMul = (gs && gs.speed) || 1;\n"
"    const inRatioLocked = (outBPM && inBPM) ? (outBPM / inBPM) : 1;\n"
"    if (useTempo){ setPreservesPitch(outEl, true); setPreservesPitch(inEl, true); }\n"
"    const t0 = performance.now();\n"
"    const myGen = AB.gen || 0;\n"
"    const step = () => {\n"
"      // a manual track click or load happened mid-blend — stop ramping\n"
"      if ((AB.gen || 0) !== myGen) return;\n"
"      const k = Math.min(1, (performance.now() - t0) / (fade * 1000));\n"
"      const g = crossfadeGains(k, tr.curve);\n"
"      try { outEl.volume = vol * g.a; } catch {}\n"
"      try { inEl.volume = vol * g.b; } catch {}\n"
"      if (useTempo){\n"
"        let outRate, inRate;\n"
"        if (tempoMode === 'ramp'){\n"
"          const tgt = outBPM + (inBPM - outBPM) * k;\n"
"          outRate = tgt / outBPM; inRate = tgt / inBPM;\n"
"        } else { outRate = 1; inRate = inRatioLocked; }\n"
"        try { outEl.playbackRate = outRate * speedMul; } catch {}\n"
"        try { inEl.playbackRate = inRate * speedMul; } catch {}\n"
"      }\n"
"      if (k < 1) AB.blendRaf = requestAnimationFrame(step);\n"
"      else { AB.blendRaf = null; abCompleteHandover(nextIdx, vol); }\n"
"    };\n"
"    step();\n"
"    return true;")

# ---- E7: abCompleteHandover reset playbackRate after tempo blend ----
add("E7 handover-reset",
"    state.master = inEl;\n"
"    detachMediaHandlers(outEl);\n"
"    attachMediaHandlers(inEl);",
"    state.master = inEl;\n"
"    // DJ Phase 2: after a tempo-matched blend, the new master resumes its\n"
"    // own real tempo (Locked/Ramp stretched only during the overlap)\n"
"    try { inEl.playbackRate = (gs && gs.speed) || 1; } catch {}\n"
"    try { outEl.playbackRate = (gs && gs.speed) || 1; } catch {}\n"
"    detachMediaHandlers(outEl);\n"
"    attachMediaHandlers(inEl);")

# ---- E8: armCrossfade bar-snap ----
add("E8 armCrossfade-snap",
"    // ARM phase: start the ramp when close AND the incoming is ready\n"
"    if (remain <= fade + 0.35 && AB._preloadNext !== null){\n"
"      const n = AB._preloadNext;\n"
"      const inEl = (AB.cur === 'a') ? AB.b : AB.a;\n"
"      const ready = inEl && inEl._lastSrc && String(inEl._lastSrc) === String(demoPlaylist[n].audio);\n"
"      if (ready){\n"
"        AB._preloadNext = null;\n"
"        AB.active = true;\n"
"        startTransition(n);\n"
"        return;\n"
"      }\n"
"      // preload not ready yet — if the track is ABOUT to end, never stall:\n"
"      // hard-switch to whatever we have, else plain loadTrack\n"
"      if (remain <= 0.3){\n"
"        AB._preloadNext = null;\n"
"        if (inEl && inEl._lastSrc){\n"
"          AB.active = true;\n"
"          if (!startTransition(n)){ AB.active = false; loadTrack(n, true); }\n"
"        } else {\n"
"          loadTrack(n, true);\n"
"        }\n"
"      }\n"
"    }",
"    // ARM phase: start the ramp when close AND the incoming is ready.\n"
"    // DJ Phase 2 — with Snap on + a known outgoing BPM, the blend START is\n"
"    // nudged to the outgoing track's nearest bar line (a 4-beat boundary)\n"
"    // so the fade exits cleanly on a phrase. Falls back to the plain\n"
"    // \"remain <= fade+0.35\" trigger when snap is off / no BPM / no room.\n"
"    if (AB._preloadNext !== null){\n"
"      const n = AB._preloadNext;\n"
"      const inEl = (AB.cur === 'a') ? AB.b : AB.a;\n"
"      const ready = inEl && inEl._lastSrc && String(inEl._lastSrc) === String(demoPlaylist[n].audio);\n"
"      let armNow = (remain <= fade + 0.35);\n"
"      if (tr.snap && t.bpm > 0 && ready){\n"
"        const barLen = 4 * 60 / t.bpm;\n"
"        const off = (typeof t.bpmOffset === 'number') ? ((t.bpmOffset % barLen) + barLen) % barLen : 0;\n"
"        const lastOkStart = m.duration - fade - 0.15;\n"
"        let bs = off + Math.ceil((m.currentTime - off) / barLen) * barLen;\n"
"        if (bs < m.currentTime + 0.02) bs += barLen;\n"
"        if (bs <= lastOkStart){ AB._blendStart = bs; armNow = (m.currentTime >= bs - 0.05); }\n"
"        else { AB._blendStart = null; }\n"
"      } else { AB._blendStart = null; }\n"
"      if (ready && armNow){\n"
"        AB._preloadNext = null;\n"
"        AB.active = true;\n"
"        startTransition(n);\n"
"        return;\n"
"      }\n"
"      // preload not ready yet — if the track is ABOUT to end, never stall:\n"
"      // hard-switch to whatever we have, else plain loadTrack\n"
"      if (!ready && remain <= 0.3){\n"
"        AB._preloadNext = null;\n"
"        if (inEl && inEl._lastSrc){\n"
"          AB.active = true;\n"
"          if (!startTransition(n)){ AB.active = false; loadTrack(n, true); }\n"
"        } else {\n"
"          loadTrack(n, true);\n"
"        }\n"
"      }\n"
"    }")

# ---- E9: getThemeData tracks ship bpm fields ----
add("E9 theme-tracks-bpm",
"        transition: t.transition || null,\n"
"        transform: t.transform || null,",
"        transition: t.transition || null,\n"
"        transform: t.transform || null,\n"
"        // DJ Phase 2: detected tempo + beat phase (deployed player runs\n"
"        // beat-synced transitions from these without re-analyzing)\n"
"        bpm: (typeof t.bpm === 'number') ? t.bpm : null,\n"
"        bpmConfidence: (typeof t.bpmConfidence === 'number') ? t.bpmConfidence : null,\n"
"        bpmOffset: (typeof t.bpmOffset === 'number') ? t.bpmOffset : null,\n"
"        bpmSource: t.bpmSource || null,")

# ---- E3: applyAudioFileToTrack -> analyzeBpm on upload ----
add("E3 analyze-on-upload",
"    const idx = demoPlaylist.indexOf(entry);\n"
"    state.playlistDirty = true;\n"
"    // upload so the deployed player + reloads use a persistent URL",
"    const idx = demoPlaylist.indexOf(entry);\n"
"    state.playlistDirty = true;\n"
"    // DJ Phase 2: detect tempo + beat phase from the file (runs alongside\n"
"    // the metadata read; updates the row + persists when done)\n"
"    if (window.BpmDetect) analyzeBpm(f, entry);\n"
"    // upload so the deployed player + reloads use a persistent URL")

# ---- E10: loadTrack -> BPM chip ----
add("E10 loadTrack-bpmchip",
"    el.title.textContent = t.title;\n"
"    el.artist.textContent = t.artist;",
"    el.title.textContent = t.title;\n"
"    el.artist.textContent = t.artist;\n"
"    updateBpmChip(t);          // DJ Phase 2: tempo chip in the info area")

# ---- E11a: gsSyncUI global snap/tempo/beat-pulse ----
add("E11a gsSyncUI",
"    const tc = g('gsTransCurve');\n"
"    if (tc) tc.value = (gs.transitionDefault && gs.transitionDefault.curve) || 'equal-power';",
"    const tc = g('gsTransCurve');\n"
"    if (tc) tc.value = (gs.transitionDefault && gs.transitionDefault.curve) || 'equal-power';\n"
"    setSel('gsTransTempo', (gs.transitionDefault && gs.transitionDefault.tempoMode) || 'instant');\n"
"    setChk('gsTransSnap', !!(gs.transitionDefault && gs.transitionDefault.snap));\n"
"    setChk('gsBeatPulse', gs.beatPulse !== false);\n"
"    const bps = g('gsBeatPulseStrength'); if (bps) bps.value = gs.beatPulseStrength != null ? gs.beatPulseStrength : 35;\n"
"    const bpsv = g('gsBeatPulseStrengthVal'); if (bpsv) bpsv.textContent = (gs.beatPulseStrength != null ? gs.beatPulseStrength : 35) + '%';")

# ---- E11b: attachGlobalUI bindings ----
add("E11b attachGlobalUI",
"    const transCurve = g('gsTransCurve');\n"
"    if (transCurve){\n"
"      transCurve.addEventListener('change', () => {\n"
"        gs.transitionDefault = gs.transitionDefault || { fade: 0, curve: 'equal-power', beats: 0 };\n"
"        gs.transitionDefault.curve = transCurve.value;\n"
"        gsSave(); onGlobalChanged('transitionDefault');\n"
"      });\n"
"    }",
"    const transCurve = g('gsTransCurve');\n"
"    if (transCurve){\n"
"      transCurve.addEventListener('change', () => {\n"
"        gs.transitionDefault = gs.transitionDefault || { fade: 0, curve: 'equal-power', beats: 0 };\n"
"        gs.transitionDefault.curve = transCurve.value;\n"
"        gsSave(); onGlobalChanged('transitionDefault');\n"
"      });\n"
"    }\n"
"    const transTempo = g('gsTransTempo');\n"
"    if (transTempo) transTempo.addEventListener('change', () => {\n"
"      gs.transitionDefault = gs.transitionDefault || { fade: 0, curve: 'equal-power', beats: 0 };\n"
"      gs.transitionDefault.tempoMode = transTempo.value;\n"
"      gsSave(); onGlobalChanged('transitionDefault');\n"
"    });\n"
"    const transSnap = g('gsTransSnap');\n"
"    if (transSnap) transSnap.addEventListener('change', () => {\n"
"      gs.transitionDefault = gs.transitionDefault || { fade: 0, curve: 'equal-power', beats: 0 };\n"
"      gs.transitionDefault.snap = !!transSnap.checked;\n"
"      gsSave(); onGlobalChanged('transitionDefault');\n"
"    });\n"
"    bindChk('gsBeatPulse', 'beatPulse');\n"
"    const bps = g('gsBeatPulseStrength');\n"
"    if (bps) bps.addEventListener('input', () => {\n"
"      gs.beatPulseStrength = +bps.value;\n"
"      const v = g('gsBeatPulseStrengthVal'); if (v) v.textContent = gs.beatPulseStrength + '%';\n"
"      gsSave(); applyBeatPulseStrength();\n"
"    });")

# ---- E4: renderPlaylistManager BPM cell (template) ----
add("E4a pm-row-meta",
"        <div class=\"meta\">\n"
"          <div class=\"pm-missing-line\">${t._audioMissing ? '<span class=\"pl-missing\">⚠ audio file missing — drop a file on this row to replace it</span>' : ''}</div>\n"
"          <input class=\"title\" type=\"text\" value=\"${escapeHTML(t.title || '')}\" placeholder=\"Title\" />\n"
"          <input class=\"artist\" type=\"text\" value=\"${escapeHTML(t.artist || '')}\" placeholder=\"Artist\" />\n"
"        </div>",
"        <div class=\"meta\">\n"
"          <div class=\"pm-missing-line\">${t._audioMissing ? '<span class=\"pl-missing\">⚠ audio file missing — drop a file on this row to replace it</span>' : ''}</div>\n"
"          <input class=\"title\" type=\"text\" value=\"${escapeHTML(t.title || '')}\" placeholder=\"Title\" />\n"
"          <input class=\"artist\" type=\"text\" value=\"${escapeHTML(t.artist || '')}\" placeholder=\"Artist\" />\n"
"          <div class=\"pm-bpm${t._bpmDetecting ? detecting : ''}\">\n"
"            <span class=\"pm-bpm-note\">♩</span>\n"
"            <input class=\"pm-bpm-val\" type=\"number\" min=\"40\" max=\"220\" step=\"0.5\" value=\"${t.bpm != null ? t.bpm : ''}\" placeholder=\"BPM\" title=\"Tempo (BPM)\" />\n"
"            <span class=\"pm-bpm-dot conf-${t.bpmConfidence >= 0.5 ? 'high' : (t.bpmConfidence > 0 ? 'low' : 'none')}\" title=\"confidence ${Math.round((t.bpmConfidence||0)*100)}%\"></span>\n"
"            <button type=\"button\" class=\"pm-bpm-btn\" data-act=\"half\" title=\"Half tempo (fix double-time)\">½</button>\n"
"            <button type=\"button\" class=\"pm-bpm-btn\" data-act=\"double\" title=\"Double tempo (fix half-time)\">×2</button>\n"
"            <button type=\"button\" class=\"pm-bpm-btn\" data-act=\"detect\" title=\"Re-detect BPM\">↻</button>\n"
"            <span class=\"pm-bpm-src\" title=\"${t.bpmSource === 'manual' ? 'set manually' : 'auto-detected'}\">${t._bpmDetecting ? '…' : (t.bpmSource === 'manual' ? '✎' : (t.bpm != null ? '✓' : ''))}</span>\n"
"          </div>\n"
"        </div>")

# ---- E4b: renderPlaylistManager BPM wiring (after artistIn) ----
add("E4b pm-row-bpm-wire",
"      artistIn.addEventListener('change', () => { t.artist = artistIn.value.trim() || t.artist; state.playlistDirty = true; renderPlaylist(); savePlaylist(); if (i === state.currentIndex) el.artist.textContent = t.artist; });",
"      artistIn.addEventListener('change', () => { t.artist = artistIn.value.trim() || t.artist; state.playlistDirty = true; renderPlaylist(); savePlaylist(); if (i === state.currentIndex) el.artist.textContent = t.artist; });\n"
"      const bpmVal = row.querySelector('.pm-bpm-val');\n"
"      if (bpmVal) bpmVal.addEventListener('change', () => {\n"
"        const v = parseFloat(bpmVal.value);\n"
"        setTrackBpm(t, (isFinite(v) && v > 0) ? v : null, { source: 'manual' });\n"
"      });\n"
"      row.querySelectorAll('.pm-bpm-btn').forEach(btn => btn.addEventListener('click', (ev) => {\n"
"        ev.preventDefault();\n"
"        const act = btn.dataset.act;\n"
"        if (act === 'half') setTrackBpm(t, t.bpm ? t.bpm / 2 : t.bpm, { source: t.bpmSource || 'manual' });\n"
"        else if (act === 'double') setTrackBpm(t, t.bpm ? t.bpm * 2 : t.bpm, { source: t.bpmSource || 'manual' });\n"
"        else if (act === 'detect') redetectBpm(t);\n"
"      }));")

# ---- E5a: openTransitionEditor rows ----
add("E5a trans-editor-rows",
"      <div class=\"pm-trans-row\">\n"
"        <button class=\"btn apply\" type=\"button\" id=\"tr-save\">Save</button>\n"
"        <button class=\"btn\" type=\"button\" id=\"tr-clear\">Clear (use global)</button>\n"
"        <button class=\"btn\" type=\"button\" id=\"tr-all\">Apply to all</button>\n"
"        <span class=\"hint-inline\">0s = true gapless · bars need the track BPM</span>\n"
"      </div>`;",
"      <div class=\"pm-trans-row\">\n"
"        <label>Snap</label>\n"
"        <label class=\"inline-check\" title=\"Land the fade on a bar line (needs the detected BPM)\"><input type=\"checkbox\" class=\"tr-snap\" ${tr.snap ? 'checked' : ''} /> Snap to beat</label>\n"
"        <label>Tempo</label>\n"
"        <select class=\"tr-tempo\">\n"
"          <option value=\"instant\" ${tr.tempoMode === 'instant' ? 'selected' : ''}>Instant</option>\n"
"          <option value=\"locked\" ${tr.tempoMode === 'locked' ? 'selected' : ''}>Locked (match speed)</option>\n"
"          <option value=\"ramp\" ${tr.tempoMode === 'ramp' ? 'selected' : ''}>Ramp (glide)</option>\n"
"        </select>\n"
"        <span class=\"hint-inline\">Locked/Ramp keep both tracks at the same speed during the blend</span>\n"
"      </div>\n"
"      <div class=\"pm-trans-row\">\n"
"        <button class=\"btn apply\" type=\"button\" id=\"tr-save\">Save</button>\n"
"        <button class=\"btn\" type=\"button\" id=\"tr-clear\">Clear (use global)</button>\n"
"        <button class=\"btn\" type=\"button\" id=\"tr-all\">Apply to all</button>\n"
"        <span class=\"hint-inline\">0s = true gapless · bars use the detected BPM</span>\n"
"      </div>`;")

# ---- E5b: save handler carries tempo/snap ----
add("E5b trans-editor-save",
"      t.transition = {\n"
"        fade: parseFloat(fadeIn.value) || 0,\n"
"        curve: ed.querySelector('.tr-curve').value,\n"
"        beats: parseInt(ed.querySelector('.tr-beats').value, 10) || 0\n"
"      };",
"      t.transition = {\n"
"        fade: parseFloat(fadeIn.value) || 0,\n"
"        curve: ed.querySelector('.tr-curve').value,\n"
"        beats: parseInt(ed.querySelector('.tr-beats').value, 10) || 0,\n"
"        tempoMode: ed.querySelector('.tr-tempo').value || 'instant',\n"
"        snap: !!(ed.querySelector('.tr-snap') && ed.querySelector('.tr-snap').checked)\n"
"      };")

# ---- E5c: apply-to-all carries tempo/snap ----
add("E5c trans-editor-all",
"      const v = { fade: parseFloat(fadeIn.value) || 0, curve: ed.querySelector('.tr-curve').value, beats: parseInt(ed.querySelector('.tr-beats').value, 10) || 0 };\n"
"      demoPlaylist.forEach(x => { if (x) x.transition = JSON.parse(JSON.stringify(v)); });",
"      const v = { fade: parseFloat(fadeIn.value) || 0, curve: ed.querySelector('.tr-curve').value, beats: parseInt(ed.querySelector('.tr-beats').value, 10) || 0, tempoMode: ed.querySelector('.tr-tempo').value || 'instant', snap: !!(ed.querySelector('.tr-snap') && ed.querySelector('.tr-snap').checked) };\n"
"      demoPlaylist.forEach(x => { if (x) x.transition = JSON.parse(JSON.stringify(v)); });")

# ---- E12a: append new functions before "Global tab UI" marker ----
NEW_FUNCS = (
"  // ============== DJ PHASE 2: beat-engine helpers (TR-07/08/09) ==============\n"
"  let bpmCtx = null;\n"
"  function decodeForBpm(arr){\n"
"    const AC = window.AudioContext || window.webkitAudioContext;\n"
"    if (!AC) return Promise.resolve(null);\n"
"    if (!bpmCtx){ try { bpmCtx = new AC(); } catch(e){ return Promise.resolve(null); } }\n"
"    return new Promise(res => {\n"
"      try {\n"
"        const p = bpmCtx.decodeAudioData(arr.slice(0), b => res(b), () => res(null));\n"
"        if (p && p.then) p.then(b => res(b), () => res(null));\n"
"      } catch(e){ res(null); }\n"
"    });\n"
"  }\n"
"  function setPreservesPitch(mediaEl, on){\n"
"    if (!mediaEl) return;\n"
"    try { mediaEl.preservesPitch = on; } catch {}\n"
"    try { mediaEl.mozPreservesPitch = on; } catch {}\n"
"    try { mediaEl.webkitPreservesPitch = on; } catch {}\n"
"  }\n"
"  // detect tempo + beat phase from a File; store on the track (auto on upload)\n"
"  function analyzeBpm(file, entry){\n"
"    if (!file || !entry || !window.BpmDetect) return;\n"
"    entry._bpmDetecting = true; renderPlaylistManager();\n"
"    setSyncStatus('Detecting tempo…', true);\n"
"    file.arrayBuffer().then(decodeForBpm).then(ab => {\n"
"      if (demoPlaylist.indexOf(entry) === -1) return;\n"
"      entry._bpmDetecting = false;\n"
"      if (!ab){ setSyncStatus('Could not decode audio for BPM — set it manually', false); renderPlaylistManager(); return; }\n"
"      const r = window.BpmDetect.analyze(ab);\n"
"      if (r && r.bpm){\n"
"        entry.bpm = r.bpm; entry.bpmConfidence = r.confidence || 0; entry.bpmOffset = r.offset || 0; entry.bpmSource = 'auto';\n"
"        if (demoPlaylist[state.currentIndex] === entry) updateBpmChip(entry);\n"
"        setSyncStatus('♩ ' + r.bpm + ' BPM detected' + (r.confidence < 0.4 ? ' (low confidence — try ½/×2 if wrong)' : ''), true);\n"
"      } else setSyncStatus('No clear tempo found — set BPM manually', false);\n"
"      state.playlistDirty = true; savePlaylist(); renderPlaylistManager();\n"
"    }).catch(() => { entry._bpmDetecting = false; renderPlaylistManager(); setSyncStatus('BPM detection failed', false); });\n"
"  }\n"
"  // re-detect from the track's current audio URL (server copy / blob)\n"
"  function redetectBpm(entry){\n"
"    if (!entry || !window.BpmDetect) return;\n"
"    const url = entry.audio || '';\n"
"    if (/^https?:/.test(url) && !url.startsWith(location.origin)){ setSyncStatus('Re-detect needs a local/uploaded file (remote URL is CORS-blocked)', false); return; }\n"
"    entry._bpmDetecting = true; renderPlaylistManager(); setSyncStatus('Re-detecting tempo…', true);\n"
"    fetch(url).then(r => r.arrayBuffer()).then(decodeForBpm).then(ab => {\n"
"      entry._bpmDetecting = false;\n"
"      if (ab){ const r = window.BpmDetect.analyze(ab); if (r && r.bpm){ entry.bpm = r.bpm; entry.bpmConfidence = r.confidence||0; entry.bpmOffset = r.offset||0; entry.bpmSource='auto'; setSyncStatus('♩ '+r.bpm+' BPM', true);} else setSyncStatus('No tempo found', false); }\n"
"      else setSyncStatus('Could not decode for re-detect', false);\n"
"      state.playlistDirty = true; savePlaylist(); renderPlaylistManager();\n"
"      if (demoPlaylist[state.currentIndex] === entry) updateBpmChip(entry);\n"
"    }).catch(() => { entry._bpmDetecting = false; renderPlaylistManager(); setSyncStatus('Re-detect failed (CORS?)', false); });\n"
"  }\n"
"  function setTrackBpm(entry, bpm, opts){\n"
"    opts = opts || {};\n"
"    if (!entry) return;\n"
"    if (bpm == null || !(bpm > 0)){ entry.bpm = null; entry.bpmConfidence = 0; entry.bpmOffset = 0; entry.bpmSource = null; }\n"
"    else {\n"
"      while (bpm < 40) bpm *= 2; while (bpm > 220) bpm /= 2;\n"
"      entry.bpm = Math.round(bpm * 10) / 10;\n"
"      if (opts.source) entry.bpmSource = opts.source;\n"
"      if (!entry.bpmConfidence) entry.bpmConfidence = 0;\n"
"    }\n"
"    state.playlistDirty = true; savePlaylist(); renderPlaylistManager();\n"
"    if (demoPlaylist[state.currentIndex] === entry) updateBpmChip(entry);\n"
"  }\n"
"  // ♩BPM chip in the player's info area (deployed + editor)\n"
"  function updateBpmChip(t){\n"
"    let chip = document.getElementById('bpmChip');\n"
"    const has = t && typeof t.bpm === 'number' && t.bpm > 0;\n"
"    if (!has){ if (chip) chip.remove(); el.player.classList.remove('has-bpm'); return; }\n"
"    if (!chip){ chip = document.createElement('span'); chip.id = 'bpmChip'; chip.className = 'bpm-chip'; const info = el.player.querySelector('.info'); if (info) info.appendChild(chip); }\n"
"    const dot = (t.bpmConfidence >= 0.5) ? '●' : (t.bpmConfidence > 0 ? '◐' : '○');\n"
"    chip.innerHTML = '<span class=\"bpm-note\">♩</span> ' + t.bpm + ' <span class=\"bpm-dot\">' + dot + '</span>';\n"
"    el.player.classList.add('has-bpm');\n"
"  }\n"
"  // ---- beat pulse: artwork \"breathes\" on the detected beat ----\n"
"  let beatPulseRaf = null;\n"
"  function applyBeatPulseStrength(){\n"
"    const s = clamp(gs.beatPulseStrength != null ? gs.beatPulseStrength : 35, 0, 100) / 100;\n"
"    el.player.style.setProperty('--beat-pulse-max', String(0.015 + s * 0.055));   // 1.5%-7% scale\n"
"  }\n"
"  function beatPulseLoop(){\n"
"    beatPulseRaf = null;\n"
"    const t = demoPlaylist[state.currentIndex];\n"
"    const m = state.master || el.audio;\n"
"    const active = gs.beatPulse !== false && t && t.bpm > 0 && m && !m.paused && isFinite(m.duration);\n"
"    if (active){\n"
"      const beat = 60 / t.bpm;\n"
"      const off = (typeof t.bpmOffset === 'number') ? t.bpmOffset : 0;\n"
"      let phase = ((m.currentTime - off) % beat) / beat; if (phase < 0) phase += 1;\n"
"      const env = phase < 0.32 ? (1 - phase / 0.32) : 0;     // sharp peak at the beat\n"
"      const max = parseFloat(getComputedStyle(el.player).getPropertyValue('--beat-pulse-max')) || 0.04;\n"
"      el.player.style.setProperty('--beat-pulse', String(1 + env * max));\n"
"    } else { el.player.style.setProperty('--beat-pulse', '1'); }\n"
"    beatPulseRaf = requestAnimationFrame(beatPulseLoop);\n"
"  }\n"
"\n"
"  // ---- Global tab UI (dev page) ----\n")
add("E12a append-functions",
"  // ---- Global tab UI (dev page) ----",
NEW_FUNCS)

# ---- E12b: init wiring (start beat pulse) ----
add("E12b init-beatpulse",
"    applyGlobalSettings();\n\n"
"    // persistence: apply saved/server theme on top, then diagnostics UI",
"    applyGlobalSettings();\n"
"    applyBeatPulseStrength();                       // DJ Phase 2\n"
"    if (!beatPulseRaf) beatPulseRaf = requestAnimationFrame(beatPulseLoop);\n\n"
"    // persistence: apply saved/server theme on top, then diagnostics UI")

# ---- apply ----
errors = []
for name, old, new in pairs:
    cnt = c.count(old)
    if cnt != 1:
        errors.append("%s: expected 1 match, found %d" % (name, cnt))
        continue
    c = c.replace(old, new)
if errors:
    print("ABORTED (file untouched):")
    for e in errors: print("  " + e)
    sys.exit(1)
with open(SRC, "w", encoding="utf-8") as f:
    f.write(c)
print("OK — applied %d patches to %s" % (len(pairs), SRC))
