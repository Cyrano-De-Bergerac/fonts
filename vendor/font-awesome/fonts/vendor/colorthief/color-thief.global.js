/* ============================================================
 * color-thief.global.js
 * Drop-in global build for the Round Music Player.
 *
 * Exposes window.ColorThief with the SYNCHRONOUS, image-element
 * APIs the player's palette engine (deriveThemeFromCover) uses:
 *   - getSwatchesSync(img)  -> node-vibrant style semantic swatches
 *        { Vibrant:{color:{_r,_g,_b}, population}, DarkVibrant, DarkMuted,
 *          LightVibrant, LightMuted, Muted }
 *   - getPaletteSync(img,n) -> ['#rrggbb', ...]
 *   - getColorSync(img)     -> '#rrggbb' (dominant)
 *
 * Pure in-browser implementation: median-cut quantisation on a
 * downscaled canvas render of the <img>. No network, no deps.
 * ============================================================ */
(function () {
  'use strict';

  function imageToPixels(img, maxDim) {
    var w = img.naturalWidth || img.width || 0;
    var h = img.naturalHeight || img.height || 0;
    if (!w || !h) return null;
    var scale = Math.min(1, maxDim / Math.max(w, h));
    var cw = Math.max(1, Math.round(w * scale));
    var ch = Math.max(1, Math.round(h * scale));
    var c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    var ctx = c.getContext('2d');
    try {
      ctx.drawImage(img, 0, 0, cw, ch);
      var id = ctx.getImageData(0, 0, cw, ch);
      var d = id.data, out = new Array(id.width * id.height);
      for (var i = 0, p = 0; i < d.length; i += 4, p++) {
        out[p] = [d[i], d[i + 1], d[i + 2]];
      }
      return out;
    } catch (e) { return null; }   // tainted canvas (CORS) -> caller falls back
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [h, s, l];
  }

  function toHex(rgb) {
    return '#' + rgb.map(function (v) {
      v = Math.max(0, Math.min(255, Math.round(v)));
      return ('0' + v.toString(16)).slice(-2);
    }).join('');
  }

  // ---- median-cut quantisation -> [{rgb, pop}] sorted by population desc ----
  function quantize(pixels, maxColors) {
    if (!pixels || !pixels.length) return [];
    var boxes = [pixels.slice()];
    var guard = 0;

    function channelRange(b, ch) {
      var mn = 255, mx = 0;
      for (var i = 0; i < b.length; i++) {
        var v = b[i][ch];
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
      return mx - mn;
    }

    while (boxes.length < maxColors && guard++ < 1000) {
      var bestIdx = -1, bestVol = 0, bestCh = 0;
      for (var bi = 0; bi < boxes.length; bi++) {
        if (boxes[bi].length < 2) continue;
        var rg = [channelRange(boxes[bi], 0), channelRange(boxes[bi], 1), channelRange(boxes[bi], 2)];
        var vol = Math.max(rg[0], rg[1], rg[2]);
        if (vol > bestVol) { bestVol = vol; bestIdx = bi; bestCh = rg.indexOf(vol); }
      }
      if (bestIdx < 0 || bestVol === 0) break;
      var bx = boxes[bestIdx];
      bx.sort(function (a, b) { return a[bestCh] - b[bestCh]; });
      var mid = bx.length >> 1;
      boxes.splice(bestIdx, 1, bx.slice(0, mid), bx.slice(mid));
    }

    var out = [];
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      if (!b.length) continue;
      var sr = 0, sg = 0, sb = 0;
      for (var k = 0; k < b.length; k++) { sr += b[k][0]; sg += b[k][1]; sb += b[k][2]; }
      out.push({ rgb: [sr / b.length, sg / b.length, sb / b.length], pop: b.length });
    }
    out.sort(function (a, b) { return b.pop - a.pop; });
    return out;
  }

  function getPaletteSync(img, count) {
    count = count || 8;
    var px = imageToPixels(img, 120);
    if (!px) return [];
    var q = quantize(px, count);
    var res = [];
    for (var i = 0; i < q.length && res.length < count; i++) res.push(toHex(q[i].rgb));
    return res;
  }

  function getSwatchesSync(img) {
    var px = imageToPixels(img, 120);
    if (!px) return null;
    var q = quantize(px, 32);
    var scored = q.map(function (c) {
      var hsl = rgbToHsl(c.rgb[0], c.rgb[1], c.rgb[2]);
      return { rgb: c.rgb.map(Math.round), pop: c.pop, h: hsl[0], s: hsl[1], l: hsl[2] };
    });
    var popW = function (s) { return 0.3 + 0.7 * Math.sqrt(s.pop); };
    var vib = function (s) { return s.s * (1 - Math.abs(s.l - 0.5)) * popW(s); };
    var mut = function (s) { return (1 - s.s) * (1 - Math.abs(s.l - 0.5)) * popW(s); };

    function pick(pred, scoreFn) {
      var best = null, bestScore = -1;
      for (var i = 0; i < scored.length; i++) {
        if (!pred(scored[i])) continue;
        var sc = scoreFn(scored[i]);
        if (sc > bestScore) { bestScore = sc; best = scored[i]; }
      }
      return best;
    }
    function sw(s) {
      return s ? { population: s.pop, color: { _r: s.rgb[0], _g: s.rgb[1], _b: s.rgb[2] } } : null;
    }

    return {
      Vibrant:      sw(pick(function (s) { return s.s >= 0.32 && s.l >= 0.30 && s.l <= 0.72; }, vib)),
      LightVibrant: sw(pick(function (s) { return s.s >= 0.28 && s.l > 0.62 && s.l <= 0.92; }, vib)),
      DarkVibrant:  sw(pick(function (s) { return s.s >= 0.32 && s.l >= 0.12 && s.l < 0.45; }, vib)),
      Muted:        sw(pick(function (s) { return s.s < 0.40 && s.l >= 0.30 && s.l <= 0.72; }, mut)),
      LightMuted:   sw(pick(function (s) { return s.s < 0.42 && s.l > 0.62 && s.l <= 0.94; }, mut)),
      DarkMuted:    sw(pick(function (s) { return s.s < 0.42 && s.l >= 0.08 && s.l < 0.35; }, mut))
    };
  }

  function getColorSync(img) {
    var p = getPaletteSync(img, 5);
    return p.length ? p[0] : null;
  }

  window.ColorThief = {
    getSwatchesSync: getSwatchesSync,
    getPaletteSync: getPaletteSync,
    getColorSync: getColorSync,
    // convenience async wrappers (callback/promise) for any future use
    getPalette: function (img, count, quality, cb) {
      var r = getPaletteSync(img, count);
      if (typeof cb === 'function') cb(r);
      return Promise.resolve(r);
    },
    getColor: function (img, quality, cb) {
      var r = getColorSync(img);
      if (typeof cb === 'function') cb(r);
      return Promise.resolve(r);
    }
  };
})();
