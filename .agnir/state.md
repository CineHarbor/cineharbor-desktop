# cineharbor-desktop Current State

Target: **1.0.0 release-ready**, under the canonical facade scope. **RELEASE_READY=false; PUBLIC_RELEASE_EXECUTED=false.** This preparation does not authorize public 1.0.0 publication.

The shell owns local-service lifecycle, native accounts/profile orchestration, diagnostics and signed updates. Sidecar implementation remains Core-owned. The existing approved updater public key, updater endpoint and production CSP are unchanged.

## Verified predecessor and current candidate

Main predecessor `1fd69e23d3d493b57ac280ff72623ab0eadb7d4d` passed complete unsigned/native matrices twice (35447427945 and 35448987352), including Windows x64, macOS Intel and Apple Silicon. The earlier 35441377610 run had failed macOS Clippy and Intel DMG packaging; it must not be described as a complete pass.

The candidate aligns package, Tauri, workspace, owned Cargo.lock entry and release metadata to 1.0.0. It pins twice-verified Core `246411ba6c72b5b79b6e14598228c62a16857309`, SDK `3ab4ff8fcc38a6f0849389a7c6b66291f3ca341d` and Web `97cf1bf55033ed16a2f0f77a97c28848aa323956`. Immutable checkout is followed by a version/dependency-graph consistency check; incompatible pins or mixed versions fail before building.

Local portable checks pass: typecheck, 44 Jest tests, 40 Node tooling tests, CSP, owned rustfmt and integration metadata validation. This is not native installation proof. Require the complete three-platform PR matrix and two full runs at the eventual main SHA.

## Windows checkout regression

PR #2 at fd304b5f41c6d56e3b1acc66d7fca5ef4370b1c3 passed portable and actual WASM/static-export checks, but run 35509724548 job 106075738202 failed before Windows native compilation: the new lock parser assumed LF despite Windows Git CRLF checkout. The follow-up normalizes only the in-memory TOML/lock text, preserves files byte-for-byte, and still rejects stale or duplicate owned versions. Three new regressions fail against the former parser and pass after repair. Full local portable gates pass again. The repaired exact PR/main native matrices remain required.

See `.agnir/evidence/2026-09-20-windows-lock-newlines.md`.

## Signing and installation boundary

The draft-only release workflow previously hardcoded ad-hoc macOS signing. It now requires explicit approved Developer ID credentials and notarization configuration, an approved Windows signing provider configuration, and the existing updater key before any draft asset write. Secrets are scoped to the signing step. The separate trusted-main prerequisite workflow reports only fixed statuses and never calls configuration presence signed/installed acceptance. No certificate, provider or key has been invented or replaced.

Actual availability of hosted prerequisites must be observed from the new workflow; local absence is not evidence about GitHub Secrets. Public desktop-v0.1.0 exists (release 378518356), but old signature assets have not yet been cryptographically validated or used for an installed upgrade.

Signed RCs, installed playback/download, long-running native media-capability renewal, real old-to-new upgrade/data preservation, native diagnostics review and production integration remain open. See `.agnir/evidence/2026-09-20-integration-and-signing-gates.md`.

Project urn:cineharbor:project:cineharbor-desktop; lineage urn:cineharbor:lineage:cineharbor-desktop; Agnir 1.0 / repository-filesystem/1.0 and operations 1.0.2 provenance unchanged. License CC-BY-NC-SA-4.0.
