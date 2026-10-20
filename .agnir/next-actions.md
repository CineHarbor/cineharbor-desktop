# cineharbor-desktop Next Actions — patched cross-repo candidate 2026-10-18

1. Require two successful full Web main CI rounds on c9f76d1c after Web PR #4, and two complete independent Rust CI runs already observed on patched Core dc94a185 and SDK 10ce024c.
2. Complete full Desktop PR CI for the new immutable graph including quality/frontend/native three OS builds and real installed sidecar HTTP health/config/SQLite data retention, then merge and verify two full main CI passes. Repair actual failures rather than skip installed tests.
3. Expand to installed account/settings/profile/media playback/download acceptance, old version data upgrade rehearsal, and native diagnostics; manual end-user GUI acceptance is still required after automated gates.
4. Resolve remaining Web Node dependency security advisories and Desktop rustls direct lock/maintenance issues; repeat fresh audits and update the facade release matrix.
5. Signing/notarization and signed updater are deferred to separately authorized public release (not passed); no public 1.0.0 publication. RELEASE_READY=false.
