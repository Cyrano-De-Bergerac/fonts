#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Replace the grid-based beat-pulse with an analyser-driven, energy-reactive one
(bass-band envelope + attack/decay + silence gate + brightness flash). Atomic."""
import sys
SRC = "script.js"
c = open(SRC, encoding="utf-8").read()

OLD = (
'  // ---- beat pulse: artwork "breathes" on the detected beat ----\n'
'  let beatPulseRaf = null;\n'
'  function applyBeatPulseStrength(){\n'
'    const s = clamp(gs.beatPulseStrength != null ? gs.beatPulseStrength : 35, 0, 100) / 100;\n'
'    el.player.style.setProperty(\'--beat-pulse-max\', String(0.015 + s * 0.055));   // 1.5%-7% scale\n'
'  }\n'
'  function beatPulseLoop(){\n'
'    beatPulseRaf = null;\n'
'    const t = demoPlaylist[state.currentIndex];\n'
'    const m = state.master || el.audio;\n'
'    const active = gs.beatPulse !== false && t && t.bpm > 0 && m && !m.paused && isFinite(m.duration);\n'
'    if (active){\n'
'      const beat = 60 / t.bpm;\n'
'      const off = (typeof t.bpmOffset === \'number\') ? t.bpmOffset : 0;\n'
'      let phase = ((m.currentTime - off) % beat) / beat; if (phase < 0) phase += 1;\n'
'      const env = phase < 0.32 ? (1 - phase / 0.32) : 0;     // sharp peak at the beat\n'
'      const max = parseFloat(getComputedStyle(el.player).getPropertyValue(\'--beat-pulse-max\')) || 0.04;\n'
'      el.player.style.setProperty(\'--beat-pulse\', String(1 + env * max));\n'
'    } else { el.player.style.setProperty(\'--beat-pulse\', \'1\'); }\n'
'    beatPulseRaf = requestAnimationFrame(beatPulseLoop);\n'
'  }'
)

NEW = (
'  // ---- beat pulse: artwork reacts to the REAL drums. Bass-band energy from the\n'
'  // ---- shared analyser -> attack/decay envelope -> scale + brightness flash.\n'
'  // ---- A silence gate eases it to still when there is no beat (breakdowns /\n'
'  // ---- ambient / quiet), so it pulses in time with the kick and stops otherwise.\n'
'  let beatPulseRaf = null;\n'
'  let _bassFreq = null, _bassEnv = 0, _bassPeak = 0.001, _bassFloor = 0, _beatGate = 0;\n'
'  function applyBeatPulseStrength(){\n'
'    const s = clamp(gs.beatPulseStrength != null ? gs.beatPulseStrength : 35, 0, 100) / 100;\n'
'    el.player.style.setProperty(\'--beat-pulse-max\', String(0.015 + s * 0.055));  // 1.5%-7% scale\n'
'    el.player.style.setProperty(\'--beat-flash-max\', String(0.05 + s * 0.20));   // 5%-25% brightness\n'
'  }\n'
'  function beatPulseLoop(){\n'
'    beatPulseRaf = null;\n'
'    const t = demoPlaylist[state.currentIndex];\n'
'    const m = state.master || el.audio;\n'
'    const enabled = gs.beatPulse !== false && t && m && !m.paused;\n'
'    if (enabled){\n'
'      const a = ensureVizGraph();               // shared analyser (created on first play)\n'
'      if (a){\n'
'        if (!_bassFreq || _bassFreq.length !== a.frequencyBinCount) _bassFreq = new Uint8Array(a.frequencyBinCount);\n'
'        a.getByteFrequencyData(_bassFreq);\n'
'        // kick / low-band energy (bins ~1-6, ~80-520 Hz at fftSize 512)\n'
'        const hi = Math.max(2, Math.min(6, _bassFreq.length));\n'
'        let sum = 0; for (let i = 1; i < hi; i++) sum += _bassFreq[i];\n'
'        const bass = (sum / (hi - 1)) / 255;    // 0..1 instantaneous\n'
'        // adaptive normalization: peak chases loud hits fast & decays slow; floor drifts\n'
'        _bassPeak += (bass - _bassPeak) * (bass > _bassPeak ? 0.35 : 0.01);\n'
'        _bassFloor += (bass - _bassFloor) * 0.004;\n'
'        const range = _bassPeak - _bassFloor;\n'
'        const lvl = range > 0.002 ? clamp((bass - _bassFloor) / range, 0, 1) : 0;\n'
'        // attack (snap on the hit) / decay (settle after) -> the "thump"\n'
'        const coef = lvl > _bassEnv ? 0.5 : 0.12;\n'
'        _bassEnv += (lvl - _bassEnv) * coef;\n'
'        // gate: only pulse when there is real beat energy; eased in/out so it\n'
'        // starts and stops smoothly with the drums (still during breakdowns)\n'
'        const targetGate = (range > 0.05 && _bassPeak > 0.05) ? 1 : 0;\n'
'        _beatGate += (targetGate - _beatGate) * 0.06;\n'
'        const max = parseFloat(getComputedStyle(el.player).getPropertyValue(\'--beat-pulse-max\')) || 0.04;\n'
'        const fmax = parseFloat(getComputedStyle(el.player).getPropertyValue(\'--beat-flash-max\')) || 0.15;\n'
'        const e = _bassEnv * _beatGate;\n'
'        el.player.style.setProperty(\'--beat-pulse\', String(1 + e * max));\n'
'        el.player.style.setProperty(\'--beat-flash\', String(1 + e * fmax));\n'
'      } else {\n'
'        el.player.style.setProperty(\'--beat-pulse\', \'1\');\n'
'        el.player.style.setProperty(\'--beat-flash\', \'1\');\n'
'      }\n'
'    } else {\n'
'      // not playing / disabled -> ease to still; reset envelope so it snaps on resume\n'
'      _bassEnv *= 0.85; _beatGate *= 0.9;\n'
'      el.player.style.setProperty(\'--beat-pulse\', \'1\');\n'
'      el.player.style.setProperty(\'--beat-flash\', \'1\');\n'
'    }\n'
'    beatPulseRaf = requestAnimationFrame(beatPulseLoop);\n'
'  }'
)

n = c.count(OLD)
if n != 1:
    print("ABORTED: expected 1 match, found %d" % n); sys.exit(1)
c = c.replace(OLD, NEW)
open(SRC, "w", encoding="utf-8").write(c)
print("OK — beat-pulse replaced with energy-reactive engine")
