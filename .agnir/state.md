# cineharbor-desktop Current State

Target: **1.0.0 release**, with release gates enforced. **RELEASE_READY = false; PUBLIC_RELEASE_EXECUTED = false.** The facade owns the seven-repository release matrix.

The Tauri shell owns local-service lifecycle, native account/profile orchestration, diagnostics and signed updates. Sidecar source remains in cineharbor-core. Candidate creation is draft-only, rejects existing public releases, requires all three expected platform jobs and does not update the live updater branch. Existing approved updater public key and production CSP boundaries are preserved.

Core/SDK/Web sources are pinned in ci/dependencies.json. Builds use Rust 1.98.1, Node 22 and pnpm 10.14.0. Sidecar builds use --locked, explicit targets, actual Cargo output directories and target/version/SHA256 provenance. Version synchronization updates the owned Cargo.lock entry without changing other dependencies. The isolated Web exporter preserves live source files.

## Observed native CI — 2026-09-19

At final predecessor main `8f5c74dc7c6cbf9e3f115c6c9bd09f315cf12f39`, native run `35441377610` completed. Portable release safety/tooling/Rust formatting and the pinned WASM/Desktop static export passed. Windows x64 passed sidecar build, cargo check, tests, strict Clippy and the real unsigned NSIS installer build. macOS Intel and Apple Silicon also passed sidecar build, cargo check, tests and unsigned app/DMG build, but strict Clippy failed on both platforms because seven Windows diagnostics DTOs and five Windows-only formatting helpers were compiled on non-Windows targets and therefore reported as dead code under `-D warnings`.

The repair on the release branch adds `#[cfg(target_os = "windows")]` to exactly those Windows-only types/helpers. It does not add an allow attribute, suppress diagnostics, weaken Clippy, skip a platform, or alter runtime behavior on Windows. PR CI and two complete post-merge main executions are required before this repair becomes final release evidence.

See `.agnir/evidence/2026-09-19-native-platform-cfg.md`.

## Remaining release obligations

Signed RC packaging, actual installed playback/download, a real signed old-to-new upgrade with retained data, sidecar/UI compatibility, diagnostics redaction, production/deployment readiness and security/license/brand/version review remain separate obligations. Unsigned build success does not close these gates. The Principal has now authorized proceeding through public 1.0.0 release only after every hard gate genuinely passes.

Project identity `urn:cineharbor:project:cineharbor-desktop`; lineage `urn:cineharbor:lineage:cineharbor-desktop`. Agnir Core/Profile 1.0 / repository-filesystem/1.0 and operations 1.0.2 at `b5626394ec40a5cb7a28c01892acde07cc0adc8e` are unchanged. License CC-BY-NC-SA-4.0.
