/* ============================================================
 * bpm-detect.js — bespoke, zero-dependency tempo + beat-grid analyzer
 * for the Round Music Player (DJ Phase 2).
 *
 * Pipeline (the standard one, per the research):
 *   mono mixdown + decimate  ->  energy envelope (RMS frames)
 *   ->  half-wave-rectified flux (onset detection function, ODF)
 *   ->  autocorrelation over a 70–180 BPM lag range
 *   ->  parabolic-interpolated peak = beat period -> BPM
 *   ->  confidence = peak prominence over the autocorrelation mean
 *   ->  beat-0 phase offset = the grid alignment that best fits the ODF
 *
 * Works on any AudioBuffer-like object {length, sampleRate,
 * numberOfChannels, getChannelData(c)}. Offline analysis only — no
 * AudioWorklet, no live graph, no user gesture needed. ~1–2s for a
 * 4-minute track.
 *
 * Exposes window.BpmDetect = { analyze(buffer), analyzeSamples(mono, fs) }
 * (and module.exports for Node testing).
 * ============================================================ */
(function (root) {
  'use strict';

  // analyzeSamples(mono Float32Array @ fs Hz) -> {bpm, confidence, offset}
  function analyzeSamples(samples, fs) {
    const N = samples.length;
    if (!N || N < fs * 3) return { bpm: null, confidence: 0, offset: 0 };

    // tempo is global — cap analysis at 120s for speed
    const cap = Math.min(N, Math.floor(fs * 120));

    // onset detection: frame the energy envelope
    const FRAME = 512, HOP = 256;
    const nFrames = Math.floor((cap - FRAME) / HOP) + 1;
    if (nFrames < 8) return { bpm: null, confidence: 0, offset: 0 };

    const energy = new Float32Array(nFrames);
    for (let f = 0; f < nFrames; f++) {
      let sum = 0; const o = f * HOP;
      for (let i = 0; i < FRAME; i++) { const s = samples[o + i]; sum += s * s; }
      energy[f] = Math.sqrt(sum / FRAME);
    }

    // half-wave-rectified flux = onset strength, mean-removed
    const flux = new Float32Array(nFrames);
    let fmean = 0;
    for (let f = 1; f < nFrames; f++) { const d = energy[f] - energy[f - 1]; flux[f] = d > 0 ? d : 0; fmean += flux[f]; }
    fmean /= nFrames;
    for (let f = 0; f < nFrames; f++) flux[f] = flux[f] > fmean ? flux[f] - fmean : 0;

    const hopTime = HOP / fs;
    const MIN_BPM = 70, MAX_BPM = 180;
    const minLag = Math.max(1, Math.round((60 / MAX_BPM) / hopTime));
    const maxLag = Math.min(nFrames - 1, Math.round((60 / MIN_BPM) / hopTime));
    if (maxLag <= minLag) return { bpm: null, confidence: 0, offset: 0 };

    // autocorrelation of the ODF across the tempo lag range
    const acf = new Float32Array(maxLag + 2);
    let acfMean = 0, acfCount = 0;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let s = 0;
      for (let i = lag; i < nFrames; i++) s += flux[i] * flux[i - lag];
      acf[lag] = s;
      acfMean += s; acfCount++;
    }
    acfMean /= acfCount || 1;

    // peak (with neighbours for parabolic interpolation)
    let peak = minLag, peakV = acf[minLag];
    for (let lag = minLag + 1; lag <= maxLag; lag++) {
      if (acf[lag] > peakV) { peakV = acf[lag]; peak = lag; }
    }
    const y0 = acf[peak - 1] || 0, y1 = acf[peak], y2 = acf[peak + 1] || 0;
    const denom = (y0 - 2 * y1 + y2);
    const shift = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0;
    const beatLag = peak + shift;
    const beatTime = beatLag * hopTime;
    let bpm = beatTime > 0 ? 60 / beatTime : null;
    if (bpm === null) return { bpm: null, confidence: 0, offset: 0 };

    // fold into the perceptual window (handles double/half-time at the edges)
    while (bpm < MIN_BPM) bpm *= 2;
    while (bpm > MAX_BPM) bpm /= 2;
    bpm = Math.round(bpm * 10) / 10;

    // confidence = how strongly the peak stands out above the mean ACF
    const confidence = acfMean > 0 ? Math.max(0, Math.min(1, (peakV / acfMean - 1) / 4)) : 0;

    // beat-0 phase: the frame offset (mod beat period) that best aligns the grid to onsets
    const beatLagInt = Math.max(1, Math.round(beatLag));
    let bestOff = 0, bestScore = -1;
    for (let off = 0; off < beatLagInt; off++) {
      let score = 0;
      for (let k = off; k < nFrames; k += beatLagInt) score += flux[k];
      if (score > bestScore) { bestScore = score; bestOff = off; }
    }
    const offset = bestOff * hopTime;

    return { bpm: bpm, confidence: Math.round(confidence * 100) / 100, offset: Math.round(offset * 1000) / 1000 };
  }

  // analyze(AudioBuffer-like) -> {bpm, confidence, offset}
  function analyze(buffer) {
    try {
      const ch = buffer.numberOfChannels || 1;
      const fs = buffer.sampleRate;
      const len = buffer.length;
      if (!fs || !len) return { bpm: null, confidence: 0, offset: 0 };

      // mono mixdown + decimate to ~11 kHz (beat info lives far below that)
      const TARGET = 11025;
      const step = Math.max(1, Math.round(fs / TARGET));
      const frames = Math.floor(len / step);
      const mono = new Float32Array(frames);
      const chans = [];
      for (let c = 0; c < ch; c++) {
        try { chans.push(buffer.getChannelData(c)); } catch (e) { chans.push(null); }
      }
      for (let i = 0; i < frames; i++) {
        let s = 0, counted = 0; const base = i * step;
        for (let c = 0; c < ch; c++) { const d = chans[c]; if (d) { s += d[base]; counted++; } }
        mono[i] = counted ? s / counted : 0;
      }
      return analyzeSamples(mono, fs / step);
    } catch (e) {
      return { bpm: null, confidence: 0, offset: 0 };
    }
  }

  const api = { analyze: analyze, analyzeSamples: analyzeSamples };
  if (typeof window !== 'undefined') window.BpmDetect = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.BpmDetect = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
