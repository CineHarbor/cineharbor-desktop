# cineharbor-desktop

CineHarbor 桌面客户端（Tauri），对应 Stremio 的 stremio-shell。P5 阶段从旧项目迁入并改名。

## 结构

- `src-tauri/` —— Tauri 壳（启动/守护 local-service sidecar、本地访问令牌、桌面更新、profile-sync 诊断等）
- `Cargo.toml` —— shell 工作区清单（`license = CC-BY-NC-SA-4.0`，版本 0.1.0）
- `config.example.json` —— local-service 默认配置示例（无密钥）

local-service 本体在 `cineharbor-core` 仓；桌面壳以 **sidecar 二进制**方式自举
（`src-tauri/binaries/cineharbor-local-service-{target-triple}`，构建期由 `cineharbor-core` 产出，
不在本仓提交）。

## 构建

```bash
# 1) 产出 sidecar（在 cineharbor-core）
cargo build --release -p cineharbor-local-service
cp target/release/cineharbor-local-service \
   ../cineharbor-desktop/src-tauri/binaries/cineharbor-local-service-$(rustc -vV | sed -n 's/host: //p')

# 2) 检查/测试壳
cargo check
cargo test -p cineharbor-desktop-shell --lib

# 3) 打包（需先提供前端发行目录 desktop-shell-dist）
pnpm tauri build
```

## 说明 / 待办

- **updater 签名公钥未轮换**：`tauri.conf.json` 里 `plugins.updater.pubkey` 仍沿用旧项目公钥，
  发版前必须用新密钥对重签并替换（同时把 `bundle.createUpdaterArtifacts` 恢复为 `true`，
  并设 `TAURI_SIGNING_PRIVATE_KEY`），端点已指向 `CineHarbor/cineharbor-desktop@desktop-updater`。
- 应用图标（`src-tauri/icons/`）仍为旧项目资源，待 P6 品牌资产到位后整体替换。