# cineharbor-desktop Current State

CineHarbor 桌面客户端（Tauri），对应 Stremio `stremio-shell`。P5 阶段迁入并改名。

- `src-tauri/`：Tauri 壳（启动/守护 local-service sidecar、本地访问令牌、桌面更新、profile-sync 诊断等）。
- `Cargo.toml`：shell 工作区清单（`license = CC-BY-NC-SA-4.0`，版本 0.1.0）。
- local-service 本体在 `cineharbor-core`；桌面壳以 sidecar 二进制自举（`src-tauri/binaries/cineharbor-local-service-{target-triple}`，构建期产出，不入本仓）。
- updater 签名密钥已轮换为本项目独立密钥对；私钥/口令属机密，只放 secrets，严禁提交；端点指向 `CineHarbor/cineharbor-desktop@desktop-updater`。
- 应用图标已换为 CineHarbor 品牌资产（`src-tauri/icons/`）。
- Agnir 操作基线：`iorLab/agnir` 稳定发布 `v1.0.0`（revision `6d16dcfd17b8e9f22fd25804e22b9f8a516d06c3`，distribution `agnir-agent-skill`）；2026-09-01 经 Principal 授权完成兼容线迁移 Core `0.1` → `1.0`（经 0.2 lineage 迁移 + 稳定晋升）。
