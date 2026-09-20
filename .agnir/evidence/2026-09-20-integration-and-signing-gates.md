# Desktop aligned unit and signing gates — 2026-09-20

Base main `1fd69e23d3d493b57ac280ff72623ab0eadb7d4d`, tree `bb6ede96acdd72b4e2fdf00549c1f12c471c6e30`. Code and material Agnir state/next/evidence form one candidate. Project identity, lineage, compatibility and operation provenance remain unchanged.

## Verified inputs

- Core 246411ba6c72b5b79b6e14598228c62a16857309: all five mandatory lanes/steps passed in 35507419988 and 35507456971.
- SDK 3ab4ff8fcc38a6f0849389a7c6b66291f3ca341d: all four mandatory lanes/steps passed in 35501487450 and 35501530721.
- Web 97cf1bf55033ed16a2f0f77a97c28848aa323956: full quality/runtime passed in 35508691724 and 35508936072. Both downloaded runtime ZIP hashes matched (a31e494e9cde07bbadb61be93da48b2e95b01a0f53ac0331b146941b8d2f53c6, e802bd195fe7379cc83489eeca3a7f3463685cebd4c22143e72bdd41fbb478d7); exactly seven named smoke cases and all .exit files passed in each.

All version-bearing Desktop manifests, display metadata and the one owned Cargo.lock package are 1.0.0. Third-party lock entries, approved updater public key/endpoint and CSP were compared to base and are unchanged. The integration validator rejects mutable/mismatched Core/SDK/Web pins, mixed versions and stale owned lock entries before building; ci-checkout.py separately verifies actual checkout SHAs.

## Signing repair and evidence boundary

The old candidate workflow used APPLE_SIGNING_IDENTITY='-'. The new fail-closed prerequisite job prevents draft creation without the updater key, approved Developer ID certificate/identity, wired Apple-ID notarization credentials and explicit Windows signing-provider configuration. Actual platform signer setup/availability and cryptographic verification remain separate. The existing independent unsigned CI intentionally remains unchanged.

The new trusted-main release-prerequisites.yml is read-only and reports only fixed IDs/statuses, never secret values. Unit tests use canary strings and ensure none appear in serialized output. Configured prerequisites explicitly leave signed_artifacts_verified and installed_upgrade_verified false. Restoring the old workflow makes the new release-pipeline guard regression fail; restoring the repair passes. A stale structural CSP test was updated to require BOTH CSP and signing prerequisites, not removed.

Official Tauri signing guides were checked on 2026-09-20: https://v2.tauri.app/distribute/sign/macos/ and https://v2.tauri.app/distribute/sign/windows/. No credential/provider has been fabricated. Hosted-secret availability is not inferred from this local environment.

## Local verification

Rust 1.98.1, Node 22.16.0, pnpm 10.14.0. Desktop environment artifact 10577020086 from run 35418243801: ZIP SHA256 d94c543c4eb99e567f4175443c8273b48ca0b715ff65854788ca6dd150df344d; dependency tar 5025155cfcd2fa20fa4ccacbf455d83d73e9e0468cb709b815e50052be5438dd. Hashes and exact lock equivalence verified before restoring independent node_modules.

Typecheck, all 44 Jest tests, all 37 Node tooling tests (17 additions), CSP contract, rustfmt, Python/YAML syntax, integration metadata check and whitespace checks passed. These are portable/source gates only. Full hosted three-platform PR CI and two eventual main runs remain required.

## Exact owned blobs

- `.github/workflows/desktop-release.yml`: `c11aa2c70a319a91a619632a495228178d392e09`
- `.github/workflows/release-prerequisites.yml`: `90fb58f714c19e578ff8545d36b9ffa22aa3b754`
- `.gitignore`: `aaa5894f4dc3057218a6cc95391bb49cd596992d`
- `Cargo.lock`: `a2131fd995a7f36affddbf0655306130db6df145`
- `Cargo.toml`: `ffd91616cf3daefe514e15094d5af00a89d3b612`
- `ci/dependencies.json`: `d278404b48161e3ddaa214c7ae07613119f8e1a2`
- `docs/desktop-updater-release.md`: `46a98154794397576d53503c026d734a614097e3`
- `package.json`: `c6ed82339d40d67ed99073f3aa1567f8997f555a`
- `scripts/check-integration-versions.mjs`: `b168f6ffe52ecd2a128643e65b40ec261e08a3b6`
- `scripts/ci-checkout.py`: `6ea0d95326ebefd59056daf036155a9097049108`
- `scripts/release-signing-preflight.mjs`: `b752b93fbff91e884b91dba8739a9e653b04a6bc`
- `src-tauri/tauri.conf.json`: `bd0b8adc98adae52395a2d05cc44cedcc41bed0e`
- `src/config/desktop-release.json`: `494608ab7ef7afd40b37b81390cae8543ae74cfa`
- `tests/desktop-release-workflow-config.test.ts`: `0db753ba88e0d0514a88b5263e17af424fae1bb4`
- `tests/node/integration-versions.test.mjs`: `6c949445de1e6c0c54d132df6b7354a4cb3f3148`
- `tests/node/release-signing-preflight.test.mjs`: `17702dad665ebdf3672911935ad07e579f6c4448`

## Outstanding acceptance

Public old Desktop release 378518356 (desktop-v0.1.0, target fb227db457ad4c603cb3bbb05b68918589d6c774) was observed through GitHub. Existing .sig files are not proof of cryptographic validity or a successful updater run. Signed three-platform RC, installation/playback/download, long native capability renewal, old-to-new retained data, diagnostics/security/license/brand and production service acceptance remain open. RELEASE_READY=false; PUBLIC_RELEASE_EXECUTED=false. No public tag/release was created.
