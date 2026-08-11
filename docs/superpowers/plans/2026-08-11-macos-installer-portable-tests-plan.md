# macOS 一键安装与可配置测试路径执行计划

> **给执行者：** 本计划应按 `superpowers:executing-plans` 逐项执行，并在每个任务结束后运行所列验证命令。

**目标：** 让灭尽龙主题仓库可在另一台 macOS 上通过一个命令，将经过验证的引擎补丁、主题包和启用操作安装到 Codex Dream Skin 引擎；同时让测试不再依赖开发机的硬编码路径。

**架构：** 仓库保存引擎改动的白名单补丁源（`patches/engine/`）。`install-macos.sh` 先严格校验目标引擎，再备份将被替换的文件、复制补丁、导入主题 ZIP，并按导入结果的主题 ID 与指纹启用主题。Node 测试通过统一的路径解析助手，从 `CODEX_DREAM_SKIN_ENGINE_DIR` 或默认位置取得引擎路径；安装脚本测试使用临时伪引擎并只执行 `--dry-run`。

**技术栈：** POSIX shell（macOS zsh/bash 兼容）、Node.js 原生测试运行器、现有 Codex Dream Skin 引擎脚本、ZIP 归档。

---

## Task 1：建立可移植的引擎路径解析并迁移现有测试

**文件：**

- 新建：`tests/helpers/engine-path.mjs`
- 新建：`tests/helpers/engine-path.test.mjs`
- 修改：`tests/sidebar-theme-support.test.mjs`
- 修改：`tests/sidebar-background-color-regression.test.mjs`
- 修改：`tests/sidebar-task-mode-background.test.mjs`
- 修改：`tests/sidebar-pattern-visibility.test.mjs`
- 修改：`tests/theme-title-badge.test.mjs`

**步骤：**

1. 先编写 `tests/helpers/engine-path.test.mjs`：用临时目录构造所需文件，验证环境变量覆盖默认路径、拒绝相对路径、拒绝不存在目录及软链接目标。
2. 运行 `node --test tests/helpers/engine-path.test.mjs`，确认测试先因模块缺失失败。
3. 实现 `engine-path.mjs`：导出默认引擎路径、`resolveEngineDir()` 和 `resolveEngineFile(relativePath)`；只接受绝对的真实目录，拒绝引擎根目录及所请求文件的软链接，并在错误中说明应设置的环境变量。
4. 将五个现有测试中硬编码的 `/Users/ushopal/.codex/codex-dream-skin-studio` 替换为助手；对引擎模块使用 `pathToFileURL(await resolveEngineFile(...))` 动态导入，避免在测试加载阶段就绑定本机路径。
5. 运行：

   ```bash
   node --test tests/helpers/engine-path.test.mjs tests/*.test.mjs
   ```

   预期：所有主题和侧栏回归测试通过；设置 `CODEX_DREAM_SKIN_ENGINE_DIR` 后可针对另一台机器的真实引擎运行同一套测试。

## Task 2：把已验证的引擎修复纳入补丁源

**文件：**

- 新建：`patches/engine/assets/theme-package-validator.mjs`
- 新建：`patches/engine/assets/safe-css-validator.mjs`
- 新建：`patches/engine/assets/dream-skin.css`
- 新建：`patches/engine/assets/renderer-inject.js`
- 新建：`patches/engine/scripts/extract-theme-zip-macos.sh`
- 新建：`patches/engine/scripts/stage-theme.mjs`
- 新建：`patches/engine/scripts/theme-content-fingerprint.mjs`
- 新建：`patches/engine/scripts/publish-theme-import.mjs`
- 新建：`patches/engine/scripts/injector.mjs`
- 新建：`patches/engine/scripts/switch-theme-macos.sh`

**步骤：**

1. 从当前已验证的本机引擎逐字复制以上 10 个文件到 `patches/engine/`，保持可执行脚本的可执行位。
2. 使用 `cmp -s` 逐一比较补丁源和本机引擎文件；列出缺失或不一致的文件并在继续前修正。
3. 用现有主题测试验证补丁中 `safe-css-validator.mjs`、`dream-skin.css` 和打包/导入逻辑仍满足侧栏图像、任务模式与标题隐藏的回归契约。

## Task 3：以测试驱动方式实现 `install-macos.sh`

**文件：**

- 新建：`install-macos.sh`
- 新建：`tests/install-macos.test.mjs`

**步骤：**

1. 先写安装脚本测试，构造临时伪引擎（包含 `assets/`、`scripts/`、`scripts/import-theme-zip-macos.sh`、`scripts/switch-theme-macos.sh`）；断言：
   - `--engine-dir <绝对路径> --dry-run` 成功且只打印计划；
   - 缺少目标文件、相对路径和软链接目标均失败；
   - `--no-apply` 出现在帮助和计划输出中；
   - 脚本使用明确的补丁白名单，而非通配复制。
2. 运行 `node --test tests/install-macos.test.mjs`，确认脚本缺失时测试先失败。
3. 实现 `install-macos.sh`：
   - 支持 `--engine-dir <absolute-path>`、`--dry-run`、`--no-apply`、`--help`；默认目标为 `$HOME/.codex/codex-dream-skin-studio`。
   - 校验仓库内的主题 ZIP、10 个补丁源、目标结构、目标文件和必要脚本；拒绝软链接及非绝对目标路径。
   - 在真实执行时，于 `<engine>/.nergigante-theme-backups/<UTC 时间戳>/` 按相对路径保存每一个将替换文件，再仅复制白名单中的补丁。
   - 调用目标引擎的 `import-theme-zip-macos.sh --file <仓库主题 ZIP>`，解析其 JSON 输出，必须取得合法 `id` 与 `contentFingerprint`。
   - 除非给出 `--no-apply`，调用 `switch-theme-macos.sh --id <id> --expect-fingerprint <fingerprint>`；任何失败停止并保留备份，不做隐式回滚。
   - `--dry-run` 不创建目录、不复制、不导入、不启用，只报告将执行的精确步骤。
4. 运行：

   ```bash
   node --test tests/install-macos.test.mjs
   shellcheck install-macos.sh
   ```

   若本机没有 `shellcheck`，记录原因并使用 `zsh -n install-macos.sh` 作为最低语法验证。

## Task 4：补充用户文档并更新离线分发包

**文件：**

- 新建：`README.md`
- 修改：`Nergigante-Dream-Skin-Changes.zip`

**步骤：**

1. 编写中文 README，说明前置条件、默认安装命令、`--engine-dir`、`--dry-run`、`--no-apply`、备份位置、如何以 `CODEX_DREAM_SKIN_ENGINE_DIR` 运行测试、安装后重新启动 Codex，以及失败时恢复备份的手动方式。
2. 重新生成 `Nergigante-Dream-Skin-Changes.zip`，纳入主题源、主题 ZIP、`patches/`、`install-macos.sh`、`tests/`、README 和变更说明，但不打包 `.git`、本机引擎或 Codex 应用。
3. 验证：

   ```bash
   unzip -t Nergigante-Dream-Skin-Changes.zip
   rg -n "install-macos|CODEX_DREAM_SKIN_ENGINE_DIR|--engine-dir|--dry-run|--no-apply" README.md
   ```

## Task 5：全量验收与提交

**文件：** 所有上述新增与修改文件。

**步骤：**

1. 运行完整测试：

   ```bash
   node --test tests/*.test.mjs tests/helpers/*.test.mjs
   zsh -n install-macos.sh
   unzip -t assets/Nergigante-Dream-Skin.zip
   unzip -t Nergigante-Dream-Skin-Changes.zip
   git diff --check
   ```

2. 复查 `git diff --stat`、`git status --short`，确认仅包含本任务范围的文件。
3. 以中文提交信息提交，推送当前 `master` 分支至 `origin`，并在交付中报告安装命令、测试命令、备份位置与提交哈希。
