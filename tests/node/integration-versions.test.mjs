import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkIntegration } from '../../scripts/check-integration-versions.mjs';
function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'cineharbor-integration-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const pins = { 'cineharbor-core': 'a'.repeat(40), 'cineharbor-addon-sdk': 'b'.repeat(40), 'cineharbor-web': 'c'.repeat(40) };
  const put = (repo, file, value) => { const p = path.join(root, repo, file); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, typeof value === 'string' ? value : JSON.stringify(value)); };
  for (const name of ['cineharbor-core', 'cineharbor-addon-sdk', 'cineharbor-desktop']) put(name, 'Cargo.toml', '[workspace]\nresolver = "2"\n[workspace.package]\nversion = "1.0.0"\nedition = "2024"\n[workspace.dependencies]\n');
  for (const name of ['cineharbor-desktop', 'cineharbor-web']) {
    put(name, 'package.json', { version: '1.0.0' });
    put(name, 'src/config/desktop-release.json', { desktopVersion: '1.0.0' });
  }
  put('cineharbor-desktop', 'src-tauri/tauri.conf.json', { version: '1.0.0' });
  put('cineharbor-desktop', 'Cargo.lock', 'version = 4\n[[package]]\nname = "cineharbor-desktop-shell"\nversion = "1.0.0"\n');
  put('cineharbor-desktop', 'ci/dependencies.json', pins);
  put('cineharbor-web', 'ci/dependencies.json', { 'cineharbor-core': pins['cineharbor-core'], 'cineharbor-addon-sdk': pins['cineharbor-addon-sdk'] });
  put('cineharbor-core', 'ci/dependency.json', { repository: 'cineharbor-addon-sdk', revision: pins['cineharbor-addon-sdk'] });
  return { put, pins, desktop: path.join(root, 'cineharbor-desktop') };
}
test('accepts a coherent immutable 1.0.0 integration graph', (t) => {
  const f = fixture(t); assert.equal(checkIntegration(f.desktop).version, '1.0.0');
});
test('rejects drift between Desktop and Web dependency pins', (t) => {
  const f = fixture(t); f.put('cineharbor-web', 'ci/dependencies.json', { 'cineharbor-core': 'd'.repeat(40), 'cineharbor-addon-sdk': f.pins['cineharbor-addon-sdk'] });
  assert.throws(() => checkIntegration(f.desktop), /same immutable/);
});
test('rejects a mismatched Core SDK back-reference', (t) => {
  const f = fixture(t); f.put('cineharbor-core', 'ci/dependency.json', { repository: 'cineharbor-addon-sdk', revision: 'd'.repeat(40) });
  assert.throws(() => checkIntegration(f.desktop), /exact selected SDK/);
});
test('rejects mixed display and binary versions', (t) => {
  const f = fixture(t); f.put('cineharbor-web', 'src/config/desktop-release.json', { desktopVersion: '200.0.1' });
  assert.throws(() => checkIntegration(f.desktop), /Mixed product versions/);
});
test('rejects mutable pins before inspecting or building dependencies', (t) => {
  const f = fixture(t); f.put('cineharbor-desktop', 'ci/dependencies.json', { ...f.pins, 'cineharbor-web': 'main' });
  assert.throws(() => checkIntegration(f.desktop));
});
test('rejects an owned lock entry from a different version', (t) => {
  const f = fixture(t); f.put('cineharbor-desktop', 'Cargo.lock', '[[package]]\nname = "cineharbor-desktop-shell"\nversion = "0.1.0"\n');
  assert.throws(() => checkIntegration(f.desktop), /lock version/);
});

test('accepts Windows CRLF manifests and locks without changing their bytes', (t) => {
  const f = fixture(t);
  const files = ['Cargo.lock', 'Cargo.toml'];
  for (const name of files) {
    const file = path.join(f.desktop, name);
    writeFileSync(file, readFileSync(file, 'utf8').replace(/\n/g, '\r\n'));
  }
  const before = files.map((name) => readFileSync(path.join(f.desktop, name)));
  assert.equal(checkIntegration(f.desktop).version, '1.0.0');
  files.forEach((name, i) => assert.deepEqual(readFileSync(path.join(f.desktop, name)), before[i]));
});
test('rejects stale Windows CRLF lock versions just as strictly as LF', (t) => {
  const f = fixture(t);
  f.put('cineharbor-desktop', 'Cargo.lock', '[[package]]\r\nname = "cineharbor-desktop-shell"\r\nversion = "0.1.0"\r\n');
  assert.throws(() => checkIntegration(f.desktop), /lock version/);
});
test('rejects duplicate owned lock entries regardless of line endings', (t) => {
  const f = fixture(t);
  const entry = '[[package]]\nname = "cineharbor-desktop-shell"\nversion = "1.0.0"\n';
  f.put('cineharbor-desktop', 'Cargo.lock', entry + entry.replace(/\n/g, '\r\n'));
  assert.throws(() => checkIntegration(f.desktop), /owned Desktop lock entry/);
});
