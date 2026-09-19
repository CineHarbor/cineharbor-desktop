#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DESKTOP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function prepareSidecar({ coreDir = path.resolve(DESKTOP_ROOT, '../cineharbor-core'), desktopRoot = DESKTOP_ROOT, release = false, target, run = execFileSync } = {}) {
  coreDir = path.resolve(coreDir);
  if (!existsSync(path.join(coreDir, 'Cargo.lock'))) throw new Error('A locked Core checkout is required');
  const capture = { cwd: coreDir, encoding: 'utf8', timeout: 60_000 };
  const triple = target || run('rustc', ['--print', 'host-tuple'], capture).trim();
  if (!/^[a-zA-Z0-9_]+(?:-[a-zA-Z0-9_]+){2,3}$/.test(triple)) throw new Error('Invalid Rust target triple');
  const metadata = JSON.parse(run('cargo', ['metadata', '--locked', '--no-deps', '--format-version', '1'], capture));
  const pkg = metadata.packages.find((entry) => entry.name === 'cineharbor-local-service');
  if (!pkg || typeof metadata.target_directory !== 'string') throw new Error('Missing local-service package or Cargo target directory');
  run('cargo', ['build', '--locked', '-p', 'cineharbor-local-service', ...(release ? ['--release'] : []), ...(target ? ['--target', triple] : [])], { cwd: coreDir, stdio: 'inherit', timeout: 60 * 60_000 });
  const extension = triple.includes('-windows-') ? '.exe' : '';
  const source = path.join(metadata.target_directory, ...(target ? [triple] : []), release ? 'release' : 'debug', `cineharbor-local-service${extension}`);
  if (!existsSync(source)) throw new Error(`Missing built sidecar: ${source}`);
  const outputDir = path.join(desktopRoot, 'src-tauri/binaries');
  mkdirSync(outputDir, { recursive: true });
  const destination = path.join(outputDir, `cineharbor-local-service-${triple}${extension}`);
  const staging = `${destination}.${process.pid}.tmp`;
  try {
    copyFileSync(source, staging);
    if (!extension) chmodSync(staging, 0o755);
    const sha256 = createHash('sha256').update(readFileSync(staging)).digest('hex');
    renameSync(staging, destination);
    writeFileSync(path.join(outputDir, 'sidecar-build.json'), JSON.stringify({ package: pkg.name, version: pkg.version, target: triple, profile: release ? 'release' : 'debug', sha256 }, null, 2) + '\n');
    console.log(`SIDECAR_BUILD=${JSON.stringify({ target: triple, version: pkg.version, sha256 })}`);
    return destination;
  } finally {
    rmSync(staging, { force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const options = { release: false };
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--release') options.release = true;
      else if (['--core-dir', '--target'].includes(args[i]) && args[i + 1] && !args[i + 1].startsWith('--')) options[args[i++] === '--target' ? 'target' : 'coreDir'] = args[i];
      else throw new Error(`Unknown or incomplete option: ${args[i]}`);
    }
    prepareSidecar(options);
  } catch (error) {
    console.error(`SIDECAR_BUILD_FAILED: ${error.message}`);
    process.exitCode = 1;
  }
}
