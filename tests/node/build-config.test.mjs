import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const readConfig = async (name) => JSON.parse(await readFile(path.join(root, 'src-tauri', name), 'utf8'));

// Frontend export and target-specific sidecar preparation are explicit workflow
// steps. A platform overlay must not reintroduce a second, stale build path.
test('the base build uses the prepared frontend without an implicit build hook', async () => {
  const { build } = await readConfig('tauri.conf.json');
  assert.equal(build.frontendDist, '../desktop-shell-dist');
  assert.equal(build.beforeBuildCommand, '');
});

for (const overlay of ['tauri.windows.conf.json', 'tauri.ci.conf.json', 'tauri.windows.ci.conf.json']) {
  test(`${overlay} cannot restore the retired frontend preparation hook`, async () => {
    const base = await readConfig('tauri.conf.json');
    const platform = await readConfig(overlay);
    const effective = { ...base.build, ...platform.build };
    assert.equal(effective.frontendDist, '../desktop-shell-dist');
    assert.ok(effective.beforeBuildCommand == null || effective.beforeBuildCommand === '',
      `${overlay} must use the frontend and sidecar prepared before Tauri bundling`);
    assert.equal(platform.app?.security, undefined, 'build overlays must not replace production security');
  });
}
