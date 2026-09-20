import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { inspectReleaseSigning } from '../../scripts/release-signing-preflight.mjs';
const complete = {
  TAURI_SIGNING_PRIVATE_KEY: 'test-updater-canary', APPLE_CERTIFICATE: 'test-cert-canary',
  APPLE_CERTIFICATE_PASSWORD: 'test-password-canary', APPLE_SIGNING_IDENTITY: 'Developer ID Application: Fixture (ABCDE12345)',
  APPLE_ID: 'private-canary@example.invalid', APPLE_PASSWORD: 'private-notary-canary', APPLE_TEAM_ID: 'ABCDE12345',
};
const provider = { bundle: { windows: { signCommand: 'approved-signer %1' } } };

test('missing credentials are explicit blockers, not successful signing', () => {
  const report = inspectReleaseSigning();
  assert.equal(report.prerequisites_configured, false);
  assert.equal(report.checks.length, 6);
  assert.ok(report.checks.every((c) => c.status === 'EXTERNAL_BLOCKER'));
});
for (const identity of ['', '-', 'Apple Development: Fixture', 'Developer ID Application: invalid']) {
  test(`rejects non-distribution identity ${JSON.stringify(identity)}`, () => {
    const r = inspectReleaseSigning({ ...complete, APPLE_SIGNING_IDENTITY: identity }, provider);
    assert.equal(r.prerequisites_configured, false);
    assert.equal(r.checks.find((c) => c.id === 'APPLE_DEVELOPER_ID').status, 'EXTERNAL_BLOCKER');
  });
}
test('partial notarization credentials cannot pass', () => {
  const r = inspectReleaseSigning({ ...complete, APPLE_TEAM_ID: '' }, provider);
  assert.equal(r.checks.find((c) => c.id === 'APPLE_ID_NOTARIZATION').status, 'EXTERNAL_BLOCKER');
});
test('configured prerequisites never assert signed or installed acceptance', () => {
  const r = inspectReleaseSigning(complete, provider);
  assert.equal(r.prerequisites_configured, true);
  assert.equal(r.signed_artifacts_verified, false);
  assert.equal(r.installed_upgrade_verified, false);
  const text = JSON.stringify(r);
  for (const value of Object.values(complete)) assert.ok(!text.includes(value));
});
test('approved certificate thumbprint is an alternative to provider signCommand', () => {
  const config = { bundle: { windows: { certificateThumbprint: 'a'.repeat(40) } } };
  assert.equal(inspectReleaseSigning(complete, config).prerequisites_configured, true);
  config.bundle.windows.certificateThumbprint = 'not-a-certificate';
  assert.equal(inspectReleaseSigning(complete, config).prerequisites_configured, false);
});
test('the candidate pipeline is draft-only and fails before creating assets without prerequisites', () => {
  const text = readFileSync('.github/workflows/desktop-release.yml', 'utf8');
  assert.match(text, /ensure_release:[\s\S]*?needs: \[csp_preflight, signing_preflight\]/);
  assert.match(text, /signing_preflight:[\s\S]*?release-signing-preflight\.mjs/);
  assert.doesNotMatch(text, /APPLE_SIGNING_IDENTITY: ['"]?-['"]?/);
  assert.match(text, /APPLE_SIGNING_IDENTITY: \$\{\{ secrets\.APPLE_SIGNING_IDENTITY \}\}/);
  assert.match(text, /releaseDraft: true/);
});

test('structured provider command retains its resource argument', () => {
  const config = { bundle: { windows: { signCommand: { cmd: 'approved-signer', args: ['%1'] } } } };
  assert.equal(inspectReleaseSigning(complete, config).prerequisites_configured, true);
  config.bundle.windows.signCommand.args = [];
  assert.equal(inspectReleaseSigning(complete, config).prerequisites_configured, false);
});

test('Apple secrets are scoped to signing, not dependency installation', () => {
  const text = readFileSync('.github/workflows/desktop-release.yml', 'utf8');
  const publishJob = text.slice(text.indexOf('  publish_release:'), text.indexOf('  release_outcome:'));
  const beforeSigning = publishJob.slice(0, publishJob.indexOf('      - name: Build and upload release assets'));
  assert.doesNotMatch(beforeSigning, /secrets\.APPLE_/);
});
