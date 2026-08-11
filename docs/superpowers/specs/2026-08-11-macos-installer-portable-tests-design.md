# macOS 一键安装与可移植测试设计

## 目标

让 `codex-theme` 能在另一台 macOS 电脑上以一个命令安装灭尽龙主题补丁、导入主题并应用，同时让全部测试不再依赖开发者个人目录。

## 范围

- 将本次修改过的 Dream Skin 引擎文件以可审查的源码形式放入仓库。
- 提供 `install-macos.sh`，在已安装的 Dream Skin 引擎上备份、安装补丁、导入主题并应用。
- 使用环境变量配置测试目标引擎目录。
- 提供安装、验证和恢复说明。

不包含 Dream Skin 引擎本体、Codex 应用本体或 Windows/Linux 安装器。

## 目录与职责

```text
patches/engine/assets/     已修改的引擎资源源码
patches/engine/scripts/    已修改的引擎脚本源码
install-macos.sh           macOS 安装入口
tests/helpers/engine-path.mjs
                           校验并解析测试目标引擎目录
tests/install-macos.test.mjs
                           安装器静态契约与 dry-run 回归测试
README.md                  使用、安装、验证和回滚说明
```

主题资源继续保留在 `assets/`；`Nergigante-Dream-Skin-Changes.zip` 是分发快照，但不再是安装器的唯一源码来源。

## 安装器设计

### 参数

```text
./install-macos.sh [--engine-dir <absolute-path>] [--dry-run] [--no-apply]
```

- 默认引擎目录为 `~/.codex/codex-dream-skin-studio`。
- `--engine-dir` 必须是绝对路径，且目标必须包含 `assets/`、`scripts/`、`scripts/import-theme-zip-macos.sh` 与 `scripts/switch-theme-macos.sh`。
- `--dry-run` 只输出将备份、复制及调用的操作，不写入文件也不导入主题。
- `--no-apply` 完成备份、补丁复制和主题导入，但不切换当前主题。

### 数据流

1. 解析参数并定位仓库根目录。
2. 校验 macOS、Node.js、主题 ZIP、补丁文件与已安装引擎结构。
3. 将被替换的引擎文件逐个备份到目标引擎下的 `.nergigante-theme-backups/<UTC 时间戳>/`。
4. 以白名单形式复制 `patches/engine/assets/` 和 `patches/engine/scripts/` 中的补丁文件；不递归覆盖整个引擎目录。
5. 调用目标引擎的 `import-theme-zip-macos.sh --file assets/Nergigante-Dream-Skin.zip`。
6. 解析导入脚本输出的 JSON，读取 `id` 与 `contentFingerprint`。
7. 除非传入 `--no-apply`，调用 `switch-theme-macos.sh --id <id> --expect-fingerprint <fingerprint>`。
8. 输出备份目录、主题 ID 与后续验证命令。

导入或应用失败时，安装器保留备份目录并以非零状态退出；不自动回滚补丁文件，避免覆盖用户在失败后做出的诊断修改。README 提供手动恢复命令。

## 测试路径设计

`tests/helpers/engine-path.mjs` 导出 `resolveEngineDir()`：

- 优先读取 `CODEX_DREAM_SKIN_ENGINE_DIR`。
- 未设置时回退到当前用户主目录下的 `.codex/codex-dream-skin-studio`。
- 要求路径为绝对路径、真实目录且不为符号链接，并要求所需测试文件存在。
- 测试通过该函数构造所有引擎文件路径，不再引用 `/Users/ushopal`。

安装器测试在 `--dry-run` 下针对临时模拟引擎执行，断言：不创建备份、不覆盖补丁文件、输出含导入与应用步骤。静态契约测试验证脚本保留 `--engine-dir`、`--dry-run`、`--no-apply` 参数和补丁白名单。

## 安全与兼容性

- 仅修改用户显式指定或默认的 Dream Skin 引擎目录，绝不修改 `/Applications/Codex.app`。
- 备份目标精确到被覆盖的文件，不删除目标目录。
- 复制前拒绝符号链接目标和缺失的引擎结构。
- 主题导入与应用复用引擎已有的校验、内容指纹和可见渲染验证机制。
- 新电脑应运行与补丁兼容的 Dream Skin 引擎版本；安装器会报告缺失脚本或资源，而不是猜测替代实现。

## 验收标准

1. `./install-macos.sh --dry-run --engine-dir <模拟引擎目录>` 不产生写入，并显示完整安装计划。
2. 正常安装会创建单独备份目录、复制白名单补丁、导入主题并应用 `nergigante-dark-ui`。
3. `CODEX_DREAM_SKIN_ENGINE_DIR=<路径> node --test tests/*.test.mjs` 能在非 `ushopal` 用户目录下运行。
4. README 给出安装、dry-run、no-apply、验证和手动回滚示例。
