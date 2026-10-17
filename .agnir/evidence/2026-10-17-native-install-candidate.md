# Real unsigned native installation candidate — 2026-10-17

Base Desktop main: `39d885531144636487bad37af497373ca4ca6a78`, with two complete unsigned-native build matrices (35510892612, 35511311874). The Principal prioritized real installation and moved production signing/notarization to the later public release; no signing key/configuration is changed here.

Candidate: separately on Windows x64, macOS Intel and macOS Apple Silicon, download the actual SHA/run-bound native installer artifact; install with NSIS /S and a temporary destination or mount DMG and copy its .app to temp Applications; inspect installed desktop and packaged local-service sidecar, log SHA-256 hashes, launch the **installed** binary for 10 seconds, stop and restart for a second 10 seconds. Archive result and failure logs. Any failed platform blocks green CI. Portable unit contract checks prevent silent removal of installation jobs.

These steps prove neither interactive UI/playback/download nor installed data preservation, signed/OS-trusted RC, notarization or a genuine updater. Before green hosted CI, claim installed acceptance **NOT_YET_VERIFIED**. Main runs and exact artifact evidence to be recorded after merge. RELEASE_READY=false; PUBLIC_RELEASE_EXECUTED=false.
