# cineharbor-desktop Next Actions — 2026-10-17

1. Run the exact-artifact installed acceptance job on Windows x64, macOS Intel and Apple Silicon CI. Verify real DMG/NSIS installation, executable and sidecar, process launch/restart, hashes and retained failure logs. Fail closed on unavailable installer or GUI; repair actual failures rather than removing the gate. Require two full main runs at a final immutable SHA.
2. Exercise real installed profile/settings/database persistence, installed sidecar lifecycle, playback, media downloads and recovery. Consider an isolated upgrade rehearsal from the genuinely public 0.1.0 baseline, clearly separate from signed-updater acceptance.
3. Address current dependency security findings, production app/addon/browser runtime, native diagnostics and license/brand review without weakening contracts.
4. **Deferred by Principal to public release only:** Developer ID/notarization, Windows approved signing provider and signed old-to-new updater. Never claim unsigned smoke to be signed or publish an unsigned candidate as official.
5. Reconcile canonical facade evidence and keep RELEASE_READY=false / PUBLIC_RELEASE_EXECUTED=false until observed evidence satisfies the applicable gates.
