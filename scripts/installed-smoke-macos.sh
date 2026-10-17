#!/bin/bash
set -euo pipefail
bundle_dir="${1:?usage: installed-smoke-macos.sh BUNDLE_DIR}"
: "${RUNNER_TEMP:?RUNNER_TEMP is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"
evidence="${RUNNER_TEMP}/cineharbor-installed-smoke"
mkdir -p "$evidence"
tmp="$(mktemp -d "${RUNNER_TEMP}/ch-install.XXXXXXXX")"
mount="$tmp/volume"
installed="$tmp/Applications/CineHarbor Desktop.app"
pid=""
mounted=0
cleanup() {
  if [[ -n "$pid" ]]; then kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true; fi
  if [[ "$mounted" == 1 ]]; then hdiutil detach "$mount" -quiet || true; fi
  rm -rf "$tmp"
}
trap cleanup EXIT
mkdir -p "$mount" "$tmp/Applications"
dmgs=()
while IFS= read -r -d '' item; do dmgs+=("$item"); done < <(find "$bundle_dir" -type f -name '*.dmg' -print0)
[[ ${#dmgs[@]} -eq 1 ]] || { echo "Expected exactly one unsigned DMG; found ${#dmgs[@]}" >&2; exit 1; }
dmg="${dmgs[0]}"
shasum -a 256 "$dmg" | tee "$evidence/installer-sha256.txt"
hdiutil attach "$dmg" -readonly -nobrowse -mountpoint "$mount" -quiet
mounted=1
source_app="$(find "$mount" -maxdepth 2 -name '*.app' -type d -print -quit)"
[[ -n "$source_app" ]] || { echo 'DMG contains no app bundle' >&2; exit 1; }
ditto "$source_app" "$installed"
plist="$installed/Contents/Info.plist"
bundle_id=$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$plist")
bundle_version=$(/usr/libexec/PlistBuddy -c 'Print CFBundleShortVersionString' "$plist")
executable=$(/usr/libexec/PlistBuddy -c 'Print CFBundleExecutable' "$plist")
[[ "$bundle_id" == 'com.cineharbor.desktop' && "$bundle_version" == '1.0.0' ]] || { echo "Unexpected bundle identity/version: $bundle_id/$bundle_version" >&2; exit 1; }
binary="$installed/Contents/MacOS/$executable"
[[ -x "$binary" ]] || { echo 'Missing executable installed app binary' >&2; exit 1; }
sidecar="$(find "$installed/Contents" -type f -name 'cineharbor-local-service*' -print -quit)"
[[ -n "$sidecar" && -x "$sidecar" ]] || { echo 'Missing executable installed native sidecar' >&2; exit 1; }
shasum -a 256 "$binary" "$sidecar" > "$evidence/installed-binaries-sha256.txt"
for attempt in 1 2; do
  "$binary" > "$evidence/launch-$attempt.log" 2>&1 &
  pid=$!
  sleep 10
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "Installed application launch $attempt exited prematurely" >&2
    tail -n 60 "$evidence/launch-$attempt.log" >&2 || true
    exit 1
  fi
  echo "Installed application launch #$attempt remained alive for 10 seconds"
  kill "$pid"
  wait "$pid" 2>/dev/null || true
  pid=""
done
printf 'sha=%s\narchitecture=%s\ninstaller=dmg\nbundle_id=%s\nversion=%s\nnative_install=true\nstartup=true\nrestart=true\nsigned_verification=false\nui_interaction=false\n' "$GITHUB_SHA" "$(uname -m)" "$bundle_id" "$bundle_version" > "$evidence/result.txt"
cat "$evidence/result.txt"
