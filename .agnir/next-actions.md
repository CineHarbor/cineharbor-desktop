# cineharbor-desktop Next Actions

1. Observe the one-time owned Rust formatting checkpoint and its helper retirement, then inspect every mandatory native CI step. Repair failures without deleting gates; obtain two complete successful runs at final main.
2. Verify real macOS arm64, macOS x64 and Windows x64 installers. Distinguish unsigned build verification from signed RC acceptance. Check installed UI/WASM startup, sidecar health/crash/shutdown and playback/download.
3. Prepare signed draft RCs only with the existing approved updater key; validate all signatures, checksums, platform completeness and version metadata. Never rewrite an already-public release or publish a partial updater manifest.
4. Execute actual old-to-new updater installation/restart with retained user data and correct sidecar/UI versions. Mock protocol checks or build artifacts cannot close this blocker.
5. Complete diagnostics redaction, deployment integration, security/license/brand review and the facade release matrix; checkpoint final observed truth, push, verify refs and fresh-resolve lineage. Keep RELEASE_READY false until genuinely complete. Do not perform final public release.
