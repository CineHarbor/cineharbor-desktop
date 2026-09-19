# Desktop candidate safety and clean native CI

Baseline main: 24af78a011c42aadadbb4ae5c90bbeb95a250493; tree 1ddcf6ad6c6cb7e130f0c3711eab00819d21cdf5. Source audit run 35424839669 attempt 2, artifact 10582965396 matched this revision. Activation/anchor/selected state and decisions were loaded; identity, lineage and Agnir provenance remain unchanged.

The old release workflow could create a public release before builds, classified one successful platform as sufficient, then updated the live updater branch. It also used mutable cross-repository main checkouts with inconsistent directories and an unpinned toolchain. The candidate now creates drafts only, refuses public-release mutation, requires exactly three successful platforms and leaves the live updater untouched. New main CI executes real pinned integration/native builds; its unsigned bundle overlay cannot override CSP or updater trust.

Sidecar build regressions cover target-specific filenames including Windows .exe, explicit target selection, Cargo target_directory, --locked, provenance and failure preservation. Version regressions prove that the owned lockfile version and metadata update with manifests and that ambiguous input causes no writes. CSP regression requires wasm-unsafe-eval while refusing ordinary unsafe-eval in production. Tauri's documented WASM requirement: https://v2.tauri.app/security/csp/ . No updater public-key rotation or verification bypass is introduced.

Actual local results (Node v22.16.0): TypeScript --noEmit passed; CSP checker passed; Jest 44 tests passed; Node 16 tests passed; zero skipped tests. Workflow YAML parsed successfully. The pinned Web commit a8aff083638adc4d77ec6c7729599c654547e77d contains a locally verified real Rust/WASM plus 17-page static Desktop export.

Baseline cargo fmt failed. The dedicated normalizer is restricted to current main, owned Rust formatting and coherent evidence/state updates, verifies the source ref, pushes non-force, fresh-resolves continuity and retires itself. Its future success is not claimed here. Native check/test/Clippy/bundles, signed RCs, real installation/upgrade and production services are also not claimed by portable tests or prepared CI.

Checkpoint evaluation reconciles these material implementation changes with durable state and next actions. Publish this coherent candidate only against the resolved parent; reject races as AGNIR_CHECKPOINT_CONFLICT, verify the destination ref and fresh-resolve AGNIR.yaml plus selected continuity. RELEASE_READY remains false.
