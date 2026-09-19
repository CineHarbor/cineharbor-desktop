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
