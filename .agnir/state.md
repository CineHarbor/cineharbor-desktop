# cineharbor-desktop Current State

Target: **1.0.0 release-ready**, not final publication. **RELEASE_READY = false; PUBLIC_RELEASE_EXECUTED = false.** The facade owns the seven-repository release matrix.

The Tauri shell owns local-service lifecycle, native account/profile orchestration, diagnostics and signed updates. Sidecar source remains in cineharbor-core. Candidate creation is draft-only, rejects existing public releases, requires all three expected platform jobs and does not update the live updater branch. Existing approved updater public key and production CSP boundaries are preserved.

Core/SDK/Web sources are pinned in ci/dependencies.json. Builds use Rust 1.98.1, Node 22 and pnpm 10.14.0. Sidecar builds use --locked, explicit targets, actual Cargo output directories and target/version/SHA256 provenance. Version synchronization updates the owned Cargo.lock entry without changing other dependencies. The isolated Web exporter preserves live source files.

## Observed native CI and repair — 2026-09-19

Main baseline e75f214c9d78a8b64addcbbc1bb5df2932495ad9, run 35438175264: portable quality and the actual frontend export passed. All three native platforms passed sidecar build, cargo check and tests. Strict Clippy failed on each. Both macOS unsigned bundles built; Windows bundling failed because tauri.windows.conf.json reintroduced nonexistent scripts/desktop-before-build.mjs. A metadata-only artifact upload was not a Windows installer success.

The Windows overlay now uses explicit prebuilt frontend/sidecar preparation, matching the base config. Four regression cases cover base and platform/CI overlays; the new test was observed failing against the original Windows config. Local validation with verified frozen dependencies: typecheck, 44 Jest tests, 20 Node tests and CSP contract passed. The exact proposed Rust diagnostic repair passed rustfmt 1.98.1; reproduced postimage and stale-preimage rejection were verified locally. Full native compilation is not claimed from the local Linux environment.

**DESKTOP_CI_REPAIR = applied.**

A bounded one-time writer applies only the reviewed lib.rs preimage to its fixed SHA256 postimage, runs portable gates, updates this checkpoint, deletes itself and verifies a non-forced main push before dispatching native CI. Pending means the Rust repair is a prepared candidate, not yet applied. See .agnir/evidence/2026-09-19-desktop-native-ci-repair.md for hashes and observations. No compiler gate has been removed or relaxed.

Signed RC packaging, actual installed playback/download, a real signed old-to-new upgrade with retained data, sidecar/UI compatibility, diagnostics redaction, deployment readiness and security/license review remain separate obligations. Unsigned build success does not close these gates.

Project identity urn:cineharbor:project:cineharbor-desktop; lineage urn:cineharbor:lineage:cineharbor-desktop. Agnir Core/Profile 1.0 / repository-filesystem/1.0 and operations 1.0.2 at b5626394ec40a5cb7a28c01892acde07cc0adc8e are unchanged. License CC-BY-NC-SA-4.0.

The exact Rust repair was applied and portable pre-commit gates passed in Actions run 35441354006. The temporary writer was retired in this same revision. Native CI, signed RC and real updater acceptance remain pending; RELEASE_READY stays false.
