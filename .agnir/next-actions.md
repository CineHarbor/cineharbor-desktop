# cineharbor-desktop Next Actions — 2026-10-18

1. Verify two complete main CI runs at merged SHA 40e073df after three native installed-app smoke tests succeeded in PR run 39041060877.
2. Validate new installed sidecar/SQLite persistence candidate through all required PR jobs; after merge inspect two full main runs including actual OS installs, sidecar loopback /health and retained per-user SQLite marker. Fail closed and repair host-path/service errors rather than weakening checks.
3. Extend to real login/settings/profile persistence, downloaded media, installed playback and explicit sidecar shutdown/recovery; distinguish from basic process/DB smoke.
4. Fix SDK/Core/Desktop rustls and critical/high Web dependencies, integrate new immutable SHAs and all mandatory CI; resolve remaining security/architecture/license/production checks.
5. Signing/notarization, official signed RC and verified signed old-to-new updater deferred to separate public release authorization (not waived); RELEASE_READY=false and PUBLIC_RELEASE_EXECUTED=false.
