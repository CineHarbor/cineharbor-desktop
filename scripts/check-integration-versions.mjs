import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const json = (root, file) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
function workspaceVersion(root) {
  const text = readFileSync(path.join(root, 'Cargo.toml'), 'utf8');
  const section = text.match(/^\[workspace\.package\]\s*\n([\s\S]*?)(?=^\[|$(?![\s\S]))/m)?.[1];
  const values = [...(section ?? '').matchAll(/^version\s*=\s*"([^"]+)"\s*$/gm)];
  assert.equal(values.length, 1, 'Expected one workspace package version');
  return values[0][1];
}
export function checkIntegration(root) {
  const names = ['cineharbor-addon-sdk', 'cineharbor-core', 'cineharbor-web'];
  const pins = json(root, 'ci/dependencies.json');
  assert.deepEqual(Object.keys(pins).sort(), names);
  for (const revision of Object.values(pins)) assert.match(revision, /^[a-f0-9]{40}$/);
  const sibling = (name) => path.join(path.dirname(root), name);
  const web = sibling('cineharbor-web');
  const webPins = json(web, 'ci/dependencies.json');
  assert.deepEqual(webPins, { 'cineharbor-core': pins['cineharbor-core'], 'cineharbor-addon-sdk': pins['cineharbor-addon-sdk'] },
    'Desktop and Web must use the same immutable Core/SDK sources');
  const corePin = json(sibling('cineharbor-core'), 'ci/dependency.json');
  assert.deepEqual(corePin, { repository: 'cineharbor-addon-sdk', revision: pins['cineharbor-addon-sdk'] },
    'Core must build with the exact selected SDK');
  const version = json(root, 'package.json').version;
  assert.equal(version, '1.0.0');
  const versions = [workspaceVersion(root), workspaceVersion(sibling('cineharbor-core')),
    workspaceVersion(sibling('cineharbor-addon-sdk')), json(root, 'src-tauri/tauri.conf.json').version,
    json(root, 'src/config/desktop-release.json').desktopVersion,
    json(web, 'package.json').version, json(web, 'src/config/desktop-release.json').desktopVersion];
  assert.ok(versions.every((v) => v === version), 'Mixed product versions cannot form a 1.0.0 candidate');
  const lock = readFileSync(path.join(root, 'Cargo.lock'), 'utf8');
  const owned = [...lock.matchAll(/\[\[package\]\]\nname = "cineharbor-desktop-shell"\nversion = "([^"]+)"/g)];
  assert.equal(owned.length, 1);
  assert.equal(owned[0][1], version, 'Desktop lock version must match its manifest');
  return { version, dependencies: pins, scope: 'metadata consistency; checkout revisions are verified separately by ci-checkout.py' };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(checkIntegration(path.resolve(process.argv[2] ?? process.cwd())))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
