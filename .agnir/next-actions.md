# cineharbor-desktop Next Actions

1. Run the platform-cfg repair through the complete PR CI matrix. After merge, obtain two complete successful CI executions at one exact final main SHA; strict Clippy and actual unsigned installers remain mandatory.
2. Verify real macOS arm64, macOS x64 and Windows x64 release artifacts. Distinguish unsigned build verification from signed RC acceptance. Check installed UI/WASM startup, sidecar health/crash/shutdown and playback/download.
3. Prepare signed 1.0.0 draft RCs only with the existing approved updater key; validate signatures, checksums, platform completeness and version metadata. Never replace the signing identity or publish a partial updater manifest.
4. Execute an actual old public version → 1.0.0 updater installation/restart with retained user data and correct sidecar/UI versions. Mock protocol checks or build artifacts cannot close this blocker.
5. Complete diagnostics redaction, production integration, security/license/brand/version review and the facade release matrix; checkpoint final observed truth, push, verify refs and fresh-resolve lineage.
6. Once every hard gate is observed passing at final revisions, perform the Principal-authorized public 1.0.0 publication and verify updater/download-site propagation. Do not weaken a gate to reach publication.

Continue autonomously under the Principal's 2026-09-19 authorization.
