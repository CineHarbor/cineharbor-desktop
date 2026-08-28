# Desktop Updater Release

This repository uses `.github/workflows/desktop-release.yml` for desktop releases.

- `.github/workflows/desktop-release.yml`
  Listens to pushed `desktop-v*` tags, creates or updates the matching GitHub Release with `GITHUB_TOKEN`, builds signed desktop assets, and uploads `latest.json` plus updater signatures.

## Public Desktop Release Flow

Local publishing no longer needs `gh release create` or a logged-in `gh` session.

1. Create a desktop tag such as `desktop-v200.0.1-beta.16` or `desktop-v200.0.1`.
2. Push the tag from the `main` branch: `git push origin <tag>`.
3. GitHub Actions will create or update the matching Release automatically, then upload the desktop installers and updater manifest assets.
4. On each platform the workflow checks out `CineHarbor/cineharbor-web` and `CineHarbor/cineharbor-core` at `main`, builds the web frontend (`desktop-shell-dist`) and the local-service sidecar, and feeds both into the Tauri build.

## Repository URL Sync

- Frontend release links and remote version checks use `NEXT_PUBLIC_RELEASE_REPOSITORY`.
- Tauri updater endpoints use `CINEHARBOR_RELEASE_REPOSITORY`.
- In GitHub Actions both default to `${{ github.repository }}` through `scripts/sync-updater-config.mjs`.

If you need to fetch raw files from a branch other than `main`, set `NEXT_PUBLIC_RELEASE_BRANCH`.

## Download Site

- The desktop download site lives in its own repository, `CineHarbor/cineharbor-download-site`.
- Its `.github/workflows/download-site.yml` builds the static site and publishes it to the `gh-pages` branch. It runs on pushes to `main`, on `workflow_dispatch`, and on a daily schedule that re-exports release data from `CineHarbor/cineharbor-desktop`.
- Release data is exported by `export-download-site-data.mjs` in the download-site repository. A custom domain is intentionally left unset for now.

## Required GitHub Secrets

- `TAURI_SIGNING_PRIVATE_KEY`
  The updater private key contents.
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
  Optional. Only needed if the private key was generated with a password.

## Local Key Material

- Private key path: `.tauri-updater/cineharbor-updater.key`
- Public key path: `.tauri-updater/cineharbor-updater.key.pub`

The `.tauri-updater/` directory is gitignored. The public key is already committed to `src-tauri/tauri.conf.json`.