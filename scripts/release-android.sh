#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
TAG="${1:-v0.0.01}"

echo "==> Generating Android native project"
cd "$ROOT"
npx expo prebuild --clean --platform android

ARTIFACT="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
DEST_DIR="$ROOT/builds"
DEST="$DEST_DIR/sonderr-mobile.apk"

echo "==> Building release APK"
cd "$ROOT/android"
./gradlew assembleRelease

mkdir -p "$DEST_DIR"
rm -f "$DEST"
cp "$ARTIFACT" "$DEST"

echo "==> Uploading to GitHub Releases"
gh release create "$TAG" \
  --repo DXN1-termux/sonderr-mobile \
  --title "$TAG" \
  --notes "Initial beta release $TAG" \
  "$DEST"

echo "Done: $TAG → https://github.com/DXN1-termux/sonderr-mobile/releases/tag/$TAG"
