# Agnir Decisions

## 2026-08-31 — Agnir initialization

- 本仓库以 `CineHarbor/cineharbor-desktop` 作为 Project 身份，identity `urn:cineharbor:project:cineharbor-desktop`。
- 采用 `repository-filesystem/0.1`，durable memory 落于 `.agnir/`；`AGNIR.yaml` 为 discovery anchor；根 `AGENTS.md` 仅作 locator；README `## Agnir Project Instructions` 为 canonical activation instruction。

## 2026-08-31 — 既有 Project 决策（源自 README）

- 桌面壳通过 sidecar 二进制自举 local-service，不在本仓提交二进制。
- updater 签名密钥已轮换；私钥/口令只放 secrets，严禁提交。
