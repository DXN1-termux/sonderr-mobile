#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
ARTIFACT="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
DEST_DIR="$ROOT/builds"
DEST="$DEST_DIR/sonderr-mobile.apk"

echo "==> Building Android release APK"
cd "$ROOT/android"
./gradlew assembleRelease

mkdir -p "$DEST_DIR"
rm -f "$DEST"
cp "$ARTIFACT" "$DEST"

echo "Done: $DEST"
