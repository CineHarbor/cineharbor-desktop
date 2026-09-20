# Desktop Updater Release

## Candidate preparation

`.github/workflows/ci.yml` verifies main and pull requests using the immutable Web/Core/SDK revisions in `ci/dependencies.json`. It builds the real WASM/static frontend, native sidecars and macOS Intel, macOS Apple Silicon and Windows x64 installers. Its `tauri.ci.conf.json` overlay disables generation of updater signatures only for unsigned verification bundles; it does not change the production CSP, updater public key or signature verification. These bundles are not evidence of signed RC or real old-to-new upgrade acceptance.

`.github/workflows/desktop-release.yml` prepares **draft** release candidates for `desktop-v*` tags pushed from the `main` branch. It must never publicly publish a release or update the live `desktop-updater` branch during candidate preparation. Already-public releases are rejected, not rewritten back into drafts. All three required native platforms must succeed; missing, failed, cancelled or duplicated jobs block candidate completion. A partially uploaded draft is not release-ready.

Before the final publication, verify installers, signatures, checksums, version alignment, sidecar compatibility and the real old-to-new updater cycle with user data preserved. Final public publication remains a separate explicitly authorized action. The version synchronizer updates package.json, Tauri config, the Cargo workspace, the owned Cargo.lock entry and desktop release metadata together; unrelated locked dependencies are retained.

## Reproducible build

Use Node 22, pnpm 10.14.0 and Rust 1.98.1. In a clean parent directory, clone this repository, then run `python3 scripts/ci-checkout.py`. Existing sibling directories are deliberately refused, not overwritten. The declared Web revision includes an isolated Desktop frontend exporter. It builds outside live Web source and replaces the previous static output only after a complete export.

Run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test --runInBand`, `pnpm test:tooling` and `pnpm check:tauri-csp`. Build the pinned Web frontend, copy its `desktop-shell-dist` to this repository, then run `node scripts/sync-desktop-sidecar.mjs --release --target <native-triple>`. Sidecar builds are locked and locate output using Cargo metadata, not an assumed target directory. `src-tauri/binaries/sidecar-build.json` records the binary hash, package version and target; it is generated evidence, not tracked source.

Production CSP permits the bundled WASM core with `wasm-unsafe-eval` but still forbids ordinary JavaScript `unsafe-eval` and remote script sources. Overlay configurations may not override any app.security field.

## Release endpoints and signing

Frontend release links use `NEXT_PUBLIC_RELEASE_REPOSITORY`. Tauri endpoint configuration uses `CINEHARBOR_RELEASE_REPOSITORY`; `scripts/sync-updater-config.mjs` resolves the repository metadata. The production updater public key remains committed. Do not rotate it merely to make a test pass: previously installed versions must validate the next release.

`TAURI_SIGNING_PRIVATE_KEY` and optional `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` belong in the approved GitHub secret store. Never print, commit, export in artifacts or request plaintext signing material. Local key material under `.tauri-updater/` is ignored. Merely configuring these variable names does not prove that the credentials exist or that signatures pass.

## Download Site

The separate `CineHarbor/cineharbor-download-site` repository exports actual public GitHub releases. Draft candidates must not appear as public downloads. Deployment-branch generation and the served production site are distinct acceptance checks. Candidate preparation does not modify a live updater manifest to refer to draft-only assets.

## 1.0.0 signing prerequisites and acceptance boundary

The preparation workflow now runs `scripts/release-signing-preflight.mjs` before
creating even a draft release. The read-only `release-prerequisites.yml` workflow
can inspect configured prerequisites on trusted main without producing installers,
creating tags/releases, changing the updater branch or printing secret values.
Its JSON reports only fixed check identifiers and statuses. A configured check
is not cryptographic proof or installed-upgrade acceptance.

The currently wired macOS release route uses the existing approved
`APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`
(Developer ID Application, never `-`) and Apple-ID notarization credentials
`APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`. Certificate values are supplied
only to the signing step, not dependency installation. Supporting a different
notarization credential route requires a reviewed adapter, not a guessed identity.
Windows requires an explicitly approved `bundle.windows.certificateThumbprint`
or `signCommand` and the corresponding provider available on the release runner.
No provider or certificate is invented by the preflight. Missing configuration is
an `EXTERNAL_BLOCKER`; ordinary unsigned verification CI remains independent.

`TAURI_SIGNING_PRIVATE_KEY` and its existing optional password remain the updater
signing identity. The approved public key and updater endpoint are unchanged.
A presence check cannot verify that the private key matches the public key.
Before release acceptance, inspect actual OS signatures/notarization, verify the
updater signature over each exact artifact, install on all three platforms, and
perform the real public `desktop-v0.1.0` to 1.0.0 upgrade retaining user data.
The existence of old `.sig` assets alone proves none of these steps.

Implementation references: Tauri's official macOS and Windows signing guides,
`https://v2.tauri.app/distribute/sign/macos/` and
`https://v2.tauri.app/distribute/sign/windows/`, accessed 2026-09-20.
