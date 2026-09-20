import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Presence/configuration checks are prerequisites, never cryptographic or
// installed-upgrade acceptance. Never include environment values in output.
export function inspectReleaseSigning(env = {}, config = {}) {
  const present = (key) => typeof env[key] === 'string' && env[key].trim().length > 0;
  const checks = [];
  const add = (id, ready) => checks.push({ id, status: ready ? 'configured' : 'EXTERNAL_BLOCKER' });
  add('UPDATER_SIGNING_KEY', present('TAURI_SIGNING_PRIVATE_KEY'));
  add('APPLE_CERTIFICATE', present('APPLE_CERTIFICATE'));
  add('APPLE_CERTIFICATE_PASSWORD', present('APPLE_CERTIFICATE_PASSWORD'));
  add('APPLE_DEVELOPER_ID', /^Developer ID Application: .+\([A-Z0-9]{10}\)$/.test(env.APPLE_SIGNING_IDENTITY ?? ''));
  add('APPLE_ID_NOTARIZATION', ['APPLE_ID', 'APPLE_PASSWORD', 'APPLE_TEAM_ID'].every(present));
  const windows = config.bundle?.windows ?? {};
  // Provider provisioning is deliberately not guessed. The release runner
  // must have access to the approved certificate/provider described here.
  const configuredCommand = windows.signCommand;
  const command = typeof configuredCommand === 'string' ? configuredCommand
    : (configuredCommand && typeof configuredCommand.cmd === 'string' && Array.isArray(configuredCommand.args)
      && configuredCommand.args.every((a) => typeof a === 'string')
      ? [configuredCommand.cmd, ...configuredCommand.args].join(' ') : '');
  const configuredWindows = (typeof windows.certificateThumbprint === 'string'
    && /^[a-fA-F0-9]{40}$/.test(windows.certificateThumbprint))
    || (typeof command === 'string' && command.trim().length > 0 && command.includes('%1'));
  add('WINDOWS_SIGNING_PROVIDER', Boolean(configuredWindows));
  return { schema_version: 1, prerequisites_configured: checks.every((c) => c.status === 'configured'),
    signed_artifacts_verified: false, installed_upgrade_verified: false, checks };
}

export function runPreflight(root = process.cwd(), env = process.env) {
  const config = JSON.parse(readFileSync(path.join(root, 'src-tauri/tauri.conf.json'), 'utf8'));
  const windows = JSON.parse(readFileSync(path.join(root, 'src-tauri/tauri.windows.conf.json'), 'utf8'));
  const ciOverlay = JSON.parse(readFileSync(path.join(root, 'src-tauri/tauri.windows.ci.conf.json'), 'utf8'));
  const effective = { bundle: { windows: {
    ...config.bundle?.windows, ...windows.bundle?.windows, ...ciOverlay.bundle?.windows,
  } } };
  const report = inspectReleaseSigning(env, effective);
  if (env.GITHUB_SHA && /^[a-f0-9]{40}$/.test(env.GITHUB_SHA)) report.revision = env.GITHUB_SHA;
  writeFileSync(path.join(root, 'release-signing-prerequisites.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  return report.prerequisites_configured ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = runPreflight(); }
  catch { console.error('Release signing prerequisite configuration could not be read.'); process.exitCode = 1; }
}
