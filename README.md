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

- **updater 签名密钥已轮换**：`plugins.updater.pubkey` 已是本项目独立密钥对的公钥，
  `bundle.createUpdaterArtifacts` 为 `true`。打包时用私钥签名：
  `TAURI_SIGNING_PRIVATE_KEY_PATH=~/.config/cineharbor/updater.key pnpm tauri build`。
  私钥/口令属机密，只放 secrets，**严禁提交**（本机示例路径在仓库外）。
  端点指向 `CineHarbor/cineharbor-desktop@desktop-updater`。
- 应用图标已在 P6 换为 CineHarbor 品牌资产（`src-tauri/icons/`）。
## Agnir Project Instructions

本项目使用 **Agnir**（project-owned durable continuity protocol）持久保存可恢复的 Project 连续性，本仓库根目录是已授权的 Project Entry Point。开始任何 Project 工作前：

1. 读取顶层 `AGNIR.yaml`，校验兼容线、Project identity 与 lineage；
2. 加载 Current State（`.agnir/state.md`）与 Next Actions（`.agnir/next-actions.md`）；
3. 需要时再加载 Decisions（`.agnir/decisions.md`）与 Evidence（`.agnir/evidence/`）；
4. durable Agnir Project truth 优先于聊天记录与 Agent 私有记忆，除非被更新的 Principal 指令或直接观测到的当前 Project 事实覆盖；
5. 在保存进度、checkpoint 或结束工作时，把重要的 state / next-action / decision / evidence 变更写回 `AGNIR.yaml` 声明的 durable memory 位置。
6. 在 repository / VCS 上下文中，把已授权的 `commit`、`提交`、`提交代码` 或同义请求视为 checkpoint boundary：先 reconcile Agnir 再 commit，优先把 Project 改动与 Agnir 改动放进同一 revision；`commit and push`、`提交推送` 或同义请求表示 checkpoint + commit + push，并在声明了 authoritative ref 时验证推送结果。
