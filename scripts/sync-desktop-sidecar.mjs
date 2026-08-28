#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, chmodSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { reportGitHubError } from './ci-annotations.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const desktopRoot = join(__dirname, '..');

function readArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 ? process.argv[index + 1] : null;
}

try {
  const isRelease = process.argv.includes('--release');
  // The local service is a separate cargo package in cineharbor-core. CI
  // checks it out alongside this repo and passes --core-dir; local packaging
  // defaults to a sibling core checkout.
  const coreDir = resolve(
    readArg('core-dir') || join(desktopRoot, '..', 'cineharbor-core')
  );
  const targetTriple = execFileSync('rustc', ['--print', 'host-tuple'], {
    cwd: coreDir,
    encoding: 'utf8',
  }).trim();

  const sidecarName = process.platform === 'win32'
    ? 'cineharbor-local-service.exe'
    : 'cineharbor-local-service';

  execFileSync(
    'cargo',
    ['build', '-p', 'cineharbor-local-service', ...(isRelease ? ['--release'] : [])],
    {
      cwd: coreDir,
      stdio: 'inherit',
    }
  );

  const profile = isRelease ? 'release' : 'debug';
  const builtBinaryPath = join(coreDir, 'target', profile, sidecarName);
  if (!existsSync(builtBinaryPath)) {
    throw new Error(`Missing built sidecar binary: ${builtBinaryPath}`);
  }

  const outputDir = join(desktopRoot, 'src-tauri', 'binaries');
  mkdirSync(outputDir, { recursive: true });

  const outputBinaryPath = join(
    outputDir,
    `cineharbor-local-service-${targetTriple}${process.platform === 'win32' ? '.exe' : ''}`
  );

  copyFileSync(builtBinaryPath, outputBinaryPath);
  if (process.platform !== 'win32') {
    chmodSync(outputBinaryPath, 0o755);
  }

  console.log(`Synced desktop sidecar to ${outputBinaryPath}`);
} catch (error) {
  reportGitHubError('desktop-sync-sidecar', error);
  process.exit(error?.status ?? 1);
}