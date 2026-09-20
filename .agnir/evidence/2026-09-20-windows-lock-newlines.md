# Windows checkout newline repair — 2026-09-20

Base candidate fd304b5f41c6d56e3b1acc66d7fca5ef4370b1c3; tree 63c5aca6d430fb86e0aa7f791df79a37efc86a38. PR #2 run 35509724548 Windows job 106075738202 fetched the correct immutable Core/SDK/Web revisions, then failed the integration validator (`0 !== 1`) before native compilation. The Cargo.lock matcher required literal LF while Windows Git checked out CRLF. Portable and actual pinned WASM/static export had passed, but these do not waive Windows verification.

Normalize CRLF in memory for Cargo manifests/lock parsing; never rewrite input files. Improve the owned-entry count error. Add three regressions: valid CRLF files pass with byte preservation, stale CRLF lock versions fail, and duplicate mixed-newline owned entries fail. All three regressions fail on the predecessor parser. With the repair, all nine integration tests, all 40 Node tooling tests, all 44 Jest tests, typecheck, CSP, owned rustfmt, metadata validation and whitespace checks pass. Dependency pins, manifests, locks, signing identities and CI gates are unchanged by this follow-up.

Existing toolchain/environment provenance remains in the integration-and-signing evidence. Require a fresh complete PR matrix and two complete runs at eventual main. RELEASE_READY=false; PUBLIC_RELEASE_EXECUTED=false.
