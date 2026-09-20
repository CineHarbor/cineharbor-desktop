#!/usr/bin/env python3
"""Materialize only the three declared immutable sibling dependencies."""
import json
import os
from pathlib import Path
import re
import subprocess


def checkout(root):
    pins = json.loads((root / 'ci/dependencies.json').read_text())
    if set(pins) != {'cineharbor-core', 'cineharbor-addon-sdk', 'cineharbor-web'}:
        raise ValueError('Unexpected integration dependency set')
    # Validate the entire plan before creating any directory.
    for name, revision in pins.items():
        if not isinstance(revision, str) or not re.fullmatch(r'[0-9a-f]{40}', revision):
            raise ValueError('Dependency must use an immutable 40-character revision')
        if (root.parent / name).exists() or (root.parent / name).is_symlink():
            raise ValueError(f'Refusing to overwrite existing sibling: {name}')
    for name, revision in pins.items():
        destination = root.parent / name
        subprocess.run(['git', 'init', str(destination)], check=True, timeout=60)
        commands = [
            ['remote', 'add', 'origin', f'https://github.com/CineHarbor/{name}.git'],
            ['fetch', '--depth', '1', 'origin', revision],
            ['checkout', '--detach', 'FETCH_HEAD'],
        ]
        for args in commands:
            subprocess.run(['git', '-C', str(destination), *args], check=True, timeout=300)
        actual = subprocess.check_output(['git', '-C', str(destination), 'rev-parse', 'HEAD'], text=True, timeout=30).strip()
        if actual != revision:
            raise RuntimeError('Integration revision mismatch')
        print(f'CineHarbor/{name}@{actual}')
        if os.environ.get('GITHUB_STEP_SUMMARY'):
            with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as stream:
                stream.write(f'\nIntegration dependency: `CineHarbor/{name}@{actual}`\n')

    subprocess.run(['node', str(root / 'scripts/check-integration-versions.mjs'), str(root)], check=True, timeout=30)

if __name__ == '__main__':
    checkout(Path(__file__).resolve().parents[1])
