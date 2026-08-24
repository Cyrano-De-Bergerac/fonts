#!/usr/bin/env bash
# ============================================================
# make-release-zip.sh — build a FRESH-DEFAULT release zip of the
# Round Music Player (no media). Re-run after EVERY version bump to
# refresh round-music-player-latest.zip in the workspace.
#
# Fresh default = boots into the built-in demo playlist (seed + external
# media), no uploaded media, no saved theme. The user unzips, runs
# `node server.js`, and gets a clean player every time.
# ============================================================
set -u
cd "$(dirname "$0")"
ORIG="$(pwd)"

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

# 1) code + assets the player needs (allow-list => scratch .py files excluded)
for f in server.js script.js styles.css viz3d.js \
         index.html dev.html hub.html status.html \
         package.json scallop.png; do
  [ -e "$f" ] && cp -r "$f" "$STAGE/" || true
done
for d in vendor test docs; do
  [ -d "$d" ] && cp -r "$d" "$STAGE/" || true
done

# 2) fresh default data: empty uploads/, no saved theme, empty dedup index
mkdir -p "$STAGE/uploads" "$STAGE/data/chunks"
printf '%s' '{"updatedAt":0}' > "$STAGE/data/theme.json"
printf '%s' '{}'            > "$STAGE/data/upload-index.json"

# 3) README with the version + run instructions
VER="$(grep -oE 'script\.js\?v=[0-9]+' index.html | head -1 | grep -oE '[0-9]+$' || echo '?')"
cat > "$STAGE/README.txt" <<EOF
Round Music Player — fresh default build (script.js v${VER}), NO media.

RUN:
  1. Install Node.js (https://nodejs.org) if you don't already have it.
  2. In this folder run:   node server.js
  3. Open in your browser:
       http://localhost:3000/         (launcher / hub)
       http://localhost:3000/dev.html (designer editor)
       http://localhost:3000/index.html (deployed player)

This build boots into the DEFAULT demo playlist (no uploaded media). Uploading
your own audio / cover / video works normally and is stored in uploads/.
EOF

# 4) zip it (deterministic -X), version-stamped; remove any older release zips
VER="$(grep -oE 'script\.js\?v=[0-9]+' index.html | head -1 | grep -oE '[0-9]+$' || echo '?')"
ZIP="round-music-player-v${VER}.zip"
rm -f "$ORIG"/round-music-player-*.zip
( cd "$STAGE" && zip -r -q -X "$ORIG/$ZIP" . )

echo "✓ Built $ZIP (script.js v${VER})"
ls -lh "$ORIG/$ZIP" | awk '{print "  size:", $5}'
