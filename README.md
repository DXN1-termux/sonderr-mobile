# Sonderr Mobile

**Chat-first AI assistant with research mode and file output.** Built for mobile, powered by your API keys.

- BYOK: OpenAI, Anthropic, Google Gemini
- Research mode with citations
- Markdown, JSON, TXT, PDF export
- Chat with file attachments
- GitHub Actions CI + EAS builds

## Version

**0.0.01** — Initial beta

## Stack

- Expo SDK 52 + React Native 0.76
- Expo Router
- TypeScript
- Vercel AI SDK for streaming + structured output
- React Markdown for rich chat rendering
- Zustand + Expo SecureStore for BYOK settings

## Quick start

```bash
git clone https://github.com/DXN1-termux/sonderr-mobile.git
cd sonderr-mobile
cp .env.example .env.local
bun install
bun run dev
```

## APK build options

### Option A: EAS cloud build (recommended for CI)

```bash
eas login
eas build --platform android --profile preview
```

Preview profile produces an `.apk` that installs directly on devices.

### Option B: Local gradlew build

Requires Android SDK + JDK 17 installed.

```bash
# Generate native android folder if needed
npx expo prebuild --clean

# Build release APK
cd android
./gradlew assembleRelease

# Output:
# android/app/build/outputs/apk/release/app-release.apk
```

Or use the helper script:

```bash
chmod +x scripts/build-android.sh
./scripts/build-android.sh
```

### Option C: Expo run

```bash
npx expo run:android --variant release
```

## Build outputs

| Profile | Android | iOS |
|---|---|---|
| preview | `.apk` | Simulator `.app` |
| production | `.aab` | `.ipa` |

## APK vs AAB

- **APK**: installable directly on devices/emulators, good for testing
- **AAB**: Google Play Store required format, used for production

## CI/CD

- `ci.yml`: lint + typecheck + test on PR/push
- `build.yml`: manual EAS preview/production build dispatch

Required secrets:
- `EXPO_TOKEN`

## Config

Set your provider keys in Settings or `sonderr.json`:

```json
{
  "activeProvider": "openai",
  "providers": {
    "openai": { "enabled": true, "apiKey": "sk-...", "model": "gpt-4o" }
  }
}
```

## License

MIT — inherits and extends Kilo Code / opencode licenses.
