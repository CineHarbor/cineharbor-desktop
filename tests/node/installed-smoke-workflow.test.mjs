import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read = (name) => readFileSync(new URL('../../' + name, import.meta.url), 'utf8');
test('three independent OS-hosted installation gates follow the real unsigned native bundle builds', () => {
  const ci = read('.github/workflows/ci.yml');
  const section = ci.slice(ci.indexOf('  installed:'), ci.indexOf('  repeat_verified_main:'));
  assert.match(section, /needs: \[quality, frontend, native\]/);
  for (const target of ['x86_64-pc-windows-msvc','x86_64-apple-darwin','aarch64-apple-darwin']) assert.ok(section.includes(target));
  assert.ok(section.includes('actions/download-artifact@v4'));
  assert.ok(section.includes('desktop-native-'));
  assert.match(ci, /needs: \[quality, frontend, native, installed\]/);
});
test('real installer execution and two starts, not mocks or signing bypasses', () => {
  const mac = read('scripts/installed-smoke-macos.sh');
  const win = read('scripts/installed-smoke-windows.ps1');
  for(const token of ['hdiutil attach','ditto','Contents/MacOS','for attempt in 1 2','kill -0','signed_verification=false']) assert.ok(mac.includes(token), token);
  for(const token of ['Start-Process -FilePath $installer.FullName','Get-ChildItem -LiteralPath $installDir','for ($attempt = 1; $attempt -le 2; $attempt++)','$application.HasExited','signed_verification = $false']) assert.ok(win.includes(token), token);
});
