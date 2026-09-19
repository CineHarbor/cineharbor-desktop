#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  assertValidSemver,
  parseCliArgs,
  parseReleaseVersionFromTag,
  readDesktopReleaseMetadata,
} from './desktop-release-utils.mjs';

function readTopLevelJsonVersionField(filePath, content) {
  try {
    JSON.parse(content);
  } catch {
    throw new Error(`Could not parse strict JSON in ${filePath}`);
  }

  const sourceFile = ts.parseJsonText(filePath, content);
  if (sourceFile.parseDiagnostics.length > 0) {
    throw new Error(`Could not parse JSON in ${filePath}`);
  }

  const rootObject = sourceFile.statements[0]?.expression;
  if (!rootObject || !ts.isObjectLiteralExpression(rootObject)) {
    throw new Error(`Could not find a top-level version field in ${filePath}`);
  }

  const versionProperties = rootObject.properties.filter(
    (property) =>
      ts.isPropertyAssignment(property) &&
      ((ts.isIdentifier(property.name) && property.name.text === 'version') ||
        (ts.isStringLiteral(property.name) && property.name.text === 'version'))
  );

  if (
    versionProperties.length !== 1 ||
    !ts.isStringLiteral(versionProperties[0].initializer)
  ) {
    throw new Error(
      `Could not find an unambiguous top-level version field in ${filePath}`
    );
  }

  const versionLiteral = versionProperties[0].initializer;
  return {
    end: versionLiteral.end,
    start: versionLiteral.getStart(sourceFile),
    value: versionLiteral.text,
  };
}

function planJsonVersionWrite(filePath, content, version) {
  const versionField = readTopLevelJsonVersionField(filePath, content);
  if (versionField.value === version) {
    return null;
  }

  return `${content.slice(0, versionField.start)}${JSON.stringify(
    version
  )}${content.slice(versionField.end)}`;
}

function planWorkspaceCargoVersion(content, version) {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  let inWorkspacePackage = false;
  const versionLines = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (/^\[.*\]$/.test(trimmedLine)) {
      inWorkspacePackage = trimmedLine === '[workspace.package]';
      continue;
    }

    if (
      inWorkspacePackage &&
      /^\s*version\s*=/.test(line) &&
      !/^\s*version\s*=\s*"[^"\\r\\n]*"\s*(?:#.*)?$/.test(line)
    ) {
      throw new Error(
        'Could not find an unambiguous [workspace.package] version field: expected one string value'
      );
    }

    if (
      inWorkspacePackage &&
      /^\s*version\s*=\s*"[^"\\r\\n]*"\s*(?:#.*)?$/.test(line)
    ) {
      versionLines.push(line);
    }
  }

  if (versionLines.length !== 1) {
    const problem = versionLines.length === 0 ? 'missing' : 'duplicate';
    throw new Error(
      `Could not find an unambiguous [workspace.package] version field: ${problem} version field`
    );
  }

  const updatedLines = lines.map((line) => {
    if (line === versionLines[0]) {
      return line.replace(/(\s*version\s*=\s*")[^"]+(".*)/, `$1${version}$2`);
    }

    return line;
  });

  const updatedContent = updatedLines.join(eol);
  return content === updatedContent ? null : updatedContent;
}

function planLockedShellVersion(content, version) {
  const blocks = content.split(/(?=^\[\[package\]\]\s*$)/m);
  const indexes = blocks.flatMap((block, index) => /^name\s*=\s*"cineharbor-desktop-shell"\s*$/m.test(block) ? [index] : []);
  if (indexes.length !== 1) throw new Error('Expected exactly one locked desktop shell package');
  const index = indexes[0];
  const matches = [...blocks[index].matchAll(/^version\s*=\s*"([^"\r\n]+)"\s*$/gm)];
  if (matches.length !== 1 || /^source\s*=/m.test(blocks[index])) throw new Error('Ambiguous or nonlocal locked desktop shell');
  if (matches[0][1] === version) return null;
  blocks[index] = blocks[index].replace(/^(version\s*=\s*")[^"\r\n]+("\s*)$/m, `$1${version}$2`);
  return blocks.join('');
}

function resolveVersion(args, metadata) {
  const explicitVersion = args.get('version');
  if (explicitVersion) {
    return assertValidSemver(explicitVersion, 'desktop release version');
  }

  const releaseTag = args.get('tag');
  if (releaseTag) {
    return assertValidSemver(
      parseReleaseVersionFromTag(releaseTag),
      'desktop release version'
    );
  }

  return assertValidSemver(metadata.desktopVersion, 'desktop base version');
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const projectRoot = process.cwd();
  const metadata = await readDesktopReleaseMetadata(projectRoot);
  const version = resolveVersion(args, metadata);

  const packageJsonPath = path.join(projectRoot, 'package.json');
  const tauriConfigPath = path.join(
    projectRoot,
    'src-tauri',
    'tauri.conf.json'
  );
  const cargoTomlPath = path.join(projectRoot, 'Cargo.toml');
  const lockPath = path.join(projectRoot, 'Cargo.lock');
  const metadataPath = path.join(projectRoot, 'src/config/desktop-release.json');
  const [packageJsonContent, tauriConfigContent, cargoTomlContent, lockContent, metadataContent] =
    await Promise.all([
      fs.readFile(packageJsonPath, 'utf8'),
      fs.readFile(tauriConfigPath, 'utf8'),
      fs.readFile(cargoTomlPath, 'utf8'),
      fs.readFile(lockPath, 'utf8'),
      fs.readFile(metadataPath, 'utf8'),
    ]);
  const plannedWrites = [
    [
      packageJsonPath,
      planJsonVersionWrite(packageJsonPath, packageJsonContent, version),
    ],
    [
      tauriConfigPath,
      planJsonVersionWrite(tauriConfigPath, tauriConfigContent, version),
    ],
    [cargoTomlPath, planWorkspaceCargoVersion(cargoTomlContent, version)],
    [lockPath, planLockedShellVersion(lockContent, version)],
    [metadataPath, JSON.parse(metadataContent).desktopVersion === version ? null : JSON.stringify({ ...JSON.parse(metadataContent), desktopVersion: version }, null, 2) + '\n'],
  ];

  for (const [filePath, content] of plannedWrites) {
    if (content !== null) {
      await fs.writeFile(filePath, content, 'utf8');
    }
  }

  console.log(`Synced desktop version: ${version}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
