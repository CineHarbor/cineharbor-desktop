# Native platform cfg repair — 2026-09-19

## Observed run

Repository: `CineHarbor/cineharbor-desktop`
Source: `8f5c74dc7c6cbf9e3f115c6c9bd09f315cf12f39`
Workflow run: `35441377610`

Observed results:
- portable release safety/tooling/Rust formatting: success;
- pinned WASM and real Desktop static export: success;
- Windows x64: success, including strict Clippy and unsigned NSIS installer;
- macOS Intel: failed only at strict Clippy;
- macOS Apple Silicon: failed only at strict Clippy;
- both macOS jobs otherwise completed sidecar build, cargo check, tests and unsigned installer bundle steps successfully.

The macOS Clippy logs identified the same 12 `dead_code` diagnostics: seven Windows WMI/PowerShell DTOs and five Windows-only formatting helpers. The same items are used on the Windows target, as confirmed by the successful Windows strict-Clippy job.

## Repair

Add `#[cfg(target_os = "windows")]` to:
- WindowsDiagnosticSnapshot
- WindowsOsSnapshot
- WindowsComputerSnapshot
- WindowsCpuSnapshot
- WindowsGpuSnapshot
- WindowsNetworkAdapterSnapshot
- WindowsPortOccupantsPayload
- format_optional_bool
- format_string_list
- format_memory_kib
- format_byte_quantity
- format_bit_rate

No `allow(dead_code)`, lint relaxation, job skip or platform exclusion is introduced.

## Acceptance semantics

This evidence explains the repair only. The branch must pass complete PR CI, then the merged main revision must execute the mandatory matrix twice successfully before this blocker is closed.
