import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { prepareSidecar } from '../../scripts/sync-desktop-sidecar.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'cineharbor-sidecar-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const coreDir = path.join(root, 'core');
  const desktopRoot = path.join(root, 'desktop');
  const customTarget = path.join(root, 'shared-target');
  mkdirSync(coreDir); mkdirSync(desktopRoot);
  writeFileSync(path.join(coreDir, 'Cargo.lock'), 'version = 4');
  return { root, coreDir, desktopRoot, customTarget };
}

for (const [triple, target, release] of [['x86_64-unknown-linux-gnu', undefined, false], ['aarch64-apple-darwin', 'aarch64-apple-darwin', true], ['x86_64-pc-windows-msvc', 'x86_64-pc-windows-msvc', true]]) {
  test(`uses Cargo target directory and target-specific suffix: ${triple}`, (t) => {
    const f = fixture(t); const calls = [];
    const result = prepareSidecar({ ...f, target, release, run(command, args) {
      calls.push([command, ...args]);
      if (command === 'rustc') return triple;
      assert.ok(args.includes('--locked'));
      if (args[0] === 'metadata') return JSON.stringify({ target_directory: f.customTarget, packages: [{ name: 'cineharbor-local-service', version: '0.1.0' }] });
      const dir = path.join(f.customTarget, ...(target ? [target] : []), release ? 'release' : 'debug');
      mkdirSync(dir, { recursive: true });
      writeFileSync(path.join(dir, `cineharbor-local-service${triple.includes('windows') ? '.exe' : ''}`), 'test executable');
      return '';
    } });
    assert.equal(readFileSync(result, 'utf8'), 'test executable');
    const info = JSON.parse(readFileSync(path.join(f.desktopRoot, 'src-tauri/binaries/sidecar-build.json'), 'utf8'));
    assert.equal(info.target, triple); assert.equal(info.version, '0.1.0'); assert.match(info.sha256, /^[a-f0-9]{64}$/);
    if (target) assert.ok(calls.some((args) => args.includes('--target') && args.includes(target)));
  });
}

test('rejects invalid target and absent lock before starting build', (t) => {
  const f = fixture(t);
  assert.throws(() => prepareSidecar({ ...f, target: '../../escape', run() { assert.fail(); } }), /Invalid Rust target/);
  rmSync(path.join(f.coreDir, 'Cargo.lock'));
  assert.throws(() => prepareSidecar({ ...f, run() { assert.fail(); } }), /locked Core checkout/);
});

test('build failure never publishes a stale or missing executable', (t) => {
  const f = fixture(t);
  assert.throws(() => prepareSidecar({ ...f, target: 'aarch64-apple-darwin', run(command, args) {
    if (args[0] === 'metadata') return JSON.stringify({ target_directory: f.customTarget, packages: [{ name: 'cineharbor-local-service', version: '0.1.0' }] });
    throw new Error('compiler failed');
  } }), /compiler failed/);
  assert.equal(existsSync(path.join(f.desktopRoot, 'src-tauri/binaries')), false);
});
