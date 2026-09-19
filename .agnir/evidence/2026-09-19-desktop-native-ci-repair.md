# Desktop native CI failure repair — 2026-09-19

Project/lineage: urn:cineharbor:project:cineharbor-desktop / urn:cineharbor:lineage:cineharbor-desktop. Activation files and selected continuity were read; Agnir 1.0 and operations 1.0.2 provenance are unchanged. Source baseline e75f214c9d78a8b64addcbbc1bb5df2932495ad9 was materialized by facade source-audit run 35424839669 attempt 3, artifact 10583024189; ZIP SHA256 c8617d7a3708745926f5bdf82627c3072827f2ac26be0947db336108e06d6240 was verified.

## Observed failure, not inferred from the chat interface

Desktop CI run https://github.com/CineHarbor/cineharbor-desktop/actions/runs/35438175264 failed. Jobs 105887026722 and 105887026905 passed portable quality and real frontend export. Native jobs 105887447378, 105887447416 and 105887447459 passed sidecar build/check/tests but failed strict Clippy. The Windows log records 25 passing native tests, 13 lint diagnostics, then MODULE_NOT_FOUND for scripts/desktop-before-build.mjs. Both macOS unsigned bundle steps succeeded. Windows uploaded only sidecar metadata, not an installer.

## Reviewed changes and validation

Remove the stale Windows beforeBuildCommand override, retaining explicit workflow preparation and production security. Four new build-overlay tests reproduce the original failure and pass with the repair. Verified dependency archive 5025155cfcd2fa20fa4ccacbf455d83d73e9e0468cb709b815e50052be5438dd matches the current pnpm-lock.yaml exactly. Local Node 22.16.0: 44 Jest tests and 20 Node tests passed with zero skips; typecheck and CSP check passed. An initial tooling attempt lacked installed TypeScript, failed, and was rerun successfully after importing the verified dependencies; it was not counted as passing.

Rust changes follow the observed compiler diagnostics: combine nested guards without changing order, use the unit Exit variant and range containment, and use tail results in mutually exclusive platform blocks. Password checks, downloaded-version validation, resume-offset validation and update-signature verification remain present. No allow attributes, weaker lint flags, signature bypass or changed release version are introduced.

lib.rs preimage SHA256: 5c833c4eabaec636153b976a3f899558508d52692f976b41a32f91fec7d32536.
lib.rs reviewed formatted postimage SHA256: 18144b099a3f582c590c513c8b96cac5aca22ed58e1213d2db6266107284f521.

The deterministic one-time transformer reproduced this exact postimage locally and rejected a changed preimage. cargo fmt --all -- --check and git diff --check passed. The writer checks main freshness, reconciles the checkpoint, retires itself, non-force pushes and verifies the destination. It does not certify native builds before execution.

**DESKTOP_CI_REPAIR = applied.**

Native post-repair results, final-main repeated CI, signed RCs, actual installation/update/data retention and production service acceptance are still required. RELEASE_READY remains false; no final public release is authorized or executed by this repair.

The exact Rust repair was applied and portable pre-commit gates passed in Actions run 35441354006. The temporary writer was retired in this same revision. Native CI, signed RC and real updater acceptance remain pending; RELEASE_READY stays false.
