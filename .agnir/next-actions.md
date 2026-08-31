# cineharbor-desktop Next Actions

0. **提交并推送本次 Agnir 初始化**（`AGNIR.yaml` / `AGENTS.md` / `.agnir/` / README 段），当前均为未提交改动。

1. 打包前先在 `cineharbor-core` 产出 sidecar：`cargo build --release -p cineharbor-local-service`，拷入 `src-tauri/binaries/`。
2. `cargo check` / `cargo test -p cineharbor-desktop-shell --lib`。
3. 打包：`pnpm tauri build`（需先提供 `desktop-shell-dist`）。
4. updater 签名用 `TAURI_SIGNING_PRIVATE_KEY_PATH=~/.config/cineharbor/updater.key pnpm tauri build`；私钥严禁提交。
