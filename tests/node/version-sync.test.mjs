import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
const script = path.resolve('scripts/sync-desktop-version.mjs');
const metadata = { desktopVersion: '0.1.0', upstreamVersion: '100.1.3', releaseRepository: 'CineHarbor/cineharbor-desktop', releaseBranch: 'main', updaterBranch: 'desktop-updater' };
function fixture(t, lock = 'version = 4\n\n[[package]]\nname = "cineharbor-desktop-shell"\nversion = "0.1.0"\n\n[[package]]\nname = "unrelated"\nversion = "0.1.0"\n') {
  const root = mkdtempSync(path.join(os.tmpdir(), 'cineharbor-version-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const files = { 'package.json': '{"version":"0.1.0"}', 'src-tauri/tauri.conf.json': '{"version":"0.1.0"}', 'Cargo.toml': '[workspace.package]\nversion = "0.1.0"\nedition = "2024"\n', 'Cargo.lock': lock, 'src/config/desktop-release.json': JSON.stringify(metadata) };
  for (const [file, data] of Object.entries(files)) { mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); writeFileSync(path.join(root, file), data); }
  return { root, files };
}

test('synchronizes package, Tauri, workspace, owned Cargo.lock entry and metadata together', (t) => {
  const { root } = fixture(t);
  const result = spawnSync(process.execPath, [script, '--version', '1.0.0'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  for (const file of ['package.json', 'src-tauri/tauri.conf.json']) assert.equal(JSON.parse(readFileSync(path.join(root, file))).version, '1.0.0');
  assert.equal(JSON.parse(readFileSync(path.join(root, 'src/config/desktop-release.json'))).desktopVersion, '1.0.0');
  const lock = readFileSync(path.join(root, 'Cargo.lock'), 'utf8');
  assert.match(lock, /name = "cineharbor-desktop-shell"\nversion = "1\.0\.0"/);
  assert.match(lock, /name = "unrelated"\nversion = "0\.1\.0"/);
});

test('ambiguous lock prevents every version write', (t) => {
  const block = '[[package]]\nname = "cineharbor-desktop-shell"\nversion = "0.1.0"\n';
  const { root, files } = fixture(t, block + block);
  const result = spawnSync(process.execPath, [script, '--version', '1.0.0'], { cwd: root, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  for (const [file, contents] of Object.entries(files)) assert.equal(readFileSync(path.join(root, file), 'utf8'), contents);
});
