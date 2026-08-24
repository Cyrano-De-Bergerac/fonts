#!/usr/bin/env python3
"""Generate the seed assets the player loads out of the box:
   - scallop.png       : the wavy/scalloped mask tile for the wave-panel cap
   - test/test_cover.png: a cover image for the default track
   - test/test_tone.mp3 : a short silent-but-valid MPEG-1 Layer III tone

Run from the project root:  python3 generate-seed.py
"""
import os
import math

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
os.makedirs("test", exist_ok=True)


# ---------------------------------------------------------------- scallop.png
def make_scallop(path):
    from PIL import Image

    # One upward scallop bump per tile, opaque below the scalloped edge,
    # transparent above. Used as a CSS mask-image (repeat-x, bottom-anchored).
    W, H = 28, 44
    R = 14
    base = 20  # solid-opaque band begins at y=base; the bump rises above it
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = img.load()
    for x in range(W):
        d = x - W / 2.0
        bump = math.sqrt(max(0.0, R * R - d * d)) * (base / R)  # 0..base
        top = base - bump  # y coordinate of the opaque top edge
        for y in range(H):
            if y >= top:
                px[x, y] = (255, 255, 255, 255)
    img.save(path)
    print("wrote", path, img.size)


# ---------------------------------------------------------------- test_cover.png
def make_cover(path):
    from PIL import Image, ImageDraw, ImageFont

    S = 600
    img = Image.new("RGB", (S, S))
    px = img.load()
    stops = [(0.0, (255, 41, 146)), (0.45, (255, 184, 77)), (1.0, (41, 213, 255))]

    def lerp(a, b, t):
        return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

    def grad(t):
        for i in range(len(stops) - 1):
            t0, c0 = stops[i]
            t1, c1 = stops[i + 1]
            if t <= t1:
                u = 0 if t1 == t0 else (t - t0) / (t1 - t0)
                return lerp(c0, c1, u)
        return stops[-1][1]

    for y in range(S):
        for x in range(S):
            t = (x + y) / (2 * S)
            px[x, y] = grad(t)

    d = ImageDraw.Draw(img)
    # decorative ring + soft highlights
    d.ellipse([S * 0.30, S * 0.20, S * 0.70, S * 0.60], outline=(255, 255, 255), width=4)
    d.ellipse([S * 0.40, S * 0.30, S * 0.60, S * 0.50], outline=(255, 255, 255), width=2)

    def font(size, bold=False):
        for name in (["DejaVuSans-Bold.ttf", "DejaVuSans.ttf"] if bold else ["DejaVuSans.ttf"]):
            try:
                return ImageFont.truetype(name, size)
            except Exception:
                pass
        return ImageFont.load_default()

    f_big = font(70, True)
    f_sm = font(34)
    d.text((S / 2, S * 0.74), "Lofi Study", fill=(255, 255, 255), anchor="mm", font=f_big)
    d.text((S / 2, S * 0.82), "Audio Library", fill=(235, 235, 235), anchor="mm", font=f_sm)
    d.text((S / 2, S * 0.16), "♪", fill=(255, 255, 255), anchor="mm", font=f_big)
    img.save(path)
    print("wrote", path, img.size)


# ---------------------------------------------------------------- test_tone.mp3
def make_mp3(path):
    # A valid MPEG-1 Layer III, 128 kbps, 44100 Hz, mono, SILENT bitstream.
    # Header bytes: FF FB 90 C0
    #   1111 1111 | 1111 1011 -> sync(11b)=0x7FF, MPEG-1, Layer III, no CRC
    #   1001 0000           -> bitrate idx 9 = 128kbps, 44100Hz, no padding
    #   1100 0000           -> mono, mode-ext 00, no copyright/orig, emphasis 00
    # Frame length = floor(144 * 128000 / 44100) = 417 bytes.
    # Zero side-info + zero main data = clean silence (part2_3_length = 0).
    header = bytes([0xFF, 0xFB, 0x90, 0xC0])
    frame_len = 417
    frame = header + bytes(frame_len - 4)
    n_frames = 140  # ~3.7 s (each frame = 1152 samples = 26.12 ms)
    with open(path, "wb") as f:
        f.write(frame * n_frames)
    print("wrote", path, frame_len * n_frames, "bytes", "(~%.1fs)" % (n_frames * 1152 / 44100))


if __name__ == "__main__":
    make_scallop("scallop.png")
    make_cover("test/test_cover.png")
    make_mp3("test/test_tone.mp3")
    print("done.")
