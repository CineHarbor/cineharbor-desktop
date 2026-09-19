# cineharbor-desktop Current State

Target: **1.0.0 release-ready**, not final publication. **RELEASE_READY = false; PUBLIC_RELEASE_EXECUTED = false.** The facade owns the seven-repository release matrix.

The Tauri shell owns local-service lifecycle, native account/profile orchestration, diagnostics and signed updates. Sidecar source remains in cineharbor-core. Main previously had no native CI; its tag workflow could expose a public release before builds and accept partial platform success. Both are release blockers, not evidence of completed P5 acceptance.

## Candidate safety and reproducibility — 2026-09-19

Candidate creation is now draft-only and rejects existing public releases. All three expected platform jobs must complete successfully before candidate normalization; partial, missing, duplicate or cancelled jobs cannot be green. Candidate preparation no longer updates the live updater branch.

Core, SDK and the verified isolated Web Desktop exporter are bound to immutable commits in ci/dependencies.json. Native builds use Rust 1.98.1, Node 22 and pnpm 10.14.0. Sidecar builds use --locked, an explicit target and Cargo's actual output directory, then record target/version/SHA256. Version synchronization also updates the owned Cargo.lock entry and desktop metadata, preserving other dependency versions. The production CSP now permits bundled WASM compilation without ordinary JavaScript unsafe-eval or remote script sources. Overlays cannot replace app.security.

The new main CI covers portable release/CSP/tooling tests, actual WASM/frontend export and native check/test/strict Clippy/installers on macOS arm64/x64 and Windows x64. Unsigned CI bundles are explicitly separate from signed RC and real updater acceptance. Workflow configuration is not a pass; actual remote results must be inspected.

Observed local validation: Node v22.16.0 typecheck and CSP contract passed; 44 existing/extended Jest tests and 16 Node regressions passed, zero skips. The pinned Web exporter actually compiled WASM and 17 Desktop pages. Baseline Desktop Rust formatting failed; a bounded one-time normalizer will publish the owned formatting diff with a coherent checkpoint and retire itself. Native compiler and bundle results remain pending execution; no local Linux native acceptance is claimed.

Existing public updater key is preserved; secret existence, real signed old-to-new upgrade, installed playback/download, data preservation, diagnostics redaction and external production service readiness remain separate obligations. User instructions authorize autonomous fixes and pushes, not fabricated acceptance or final public release.

Project identity urn:cineharbor:project:cineharbor-desktop, lineage urn:cineharbor:lineage:cineharbor-desktop; Agnir Core/Profile 1.0 / repository-filesystem/1.0; operations 1.0.2 at b5626394ec40a5cb7a28c01892acde07cc0adc8e are unchanged. License: CC-BY-NC-SA-4.0.

## Applied formatting checkpoint

Owned Rust formatting now passes with Rust 1.98.1. The one-time normalizer was removed. Native CI and signed upgrade acceptance remain separately required; RELEASE_READY remains false.
