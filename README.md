# Codex Dream Skin 主题包（macOS）

本仓库提供 7 个可导入的 Codex Dream Skin 主题包，以及让侧栏暗纹正常显示所需的 Dream Skin 引擎补丁。安装器只会修改指定的 Dream Skin 引擎目录；不会修改 `/Applications/Codex.app`。

## 主题包

| 主题包 | 主题名称 | 主题 ID | 主题源目录 |
| --- | --- | --- | --- |
| [`Devil-May-Cry-5-Dream-Skin.zip`](Devil-May-Cry-5-Dream-Skin.zip) | Devil May Cry 5 Crimson Requiem | `devil-may-cry-5-crimson` | `assets/devil-may-cry-5-dream-skin/` |
| [`Final-Fantasy-VII-Remake-Dream-Skin.zip`](Final-Fantasy-VII-Remake-Dream-Skin.zip) | Final Fantasy VII Remake Flowerfield Dusk | `ff7-remake-flowerfield` | `assets/final-fantasy-vii-remake-dream-skin/` |
| [`Guilin-Landscape-Dream-Skin.zip`](Guilin-Landscape-Dream-Skin.zip) | Guilin Li River Morning Mist | `guilin-li-river` | `assets/guilin-landscape-dream-skin/` |
| [`Hatsune-Miku-Dream-Skin.zip`](Hatsune-Miku-Dream-Skin.zip) | Hatsune Miku Clear Future | `hatsune-miku-cyan` | `assets/hatsune-miku-dream-skin/` |
| [`Nergigante-Dream-Skin.zip`](assets/Nergigante-Dream-Skin.zip) | Nergigante Dark UI | `nergigante-dark-ui` | `assets/nergigante-dream-skin/` |
| [`Resident-Evil-RPD-Dream-Skin.zip`](Resident-Evil-RPD-Dream-Skin.zip) | Resident Evil R.P.D. Night Watch | `resident-evil-rpd` | `assets/resident-evil-dream-skin/` |
| [`Transformers-Autobots-Dream-Skin.zip`](Transformers-Autobots-Dream-Skin.zip) | Transformers Autobots Cinematic | `transformers-autobots-cinematic` | `assets/transformers-autobots-dream-skin/` |

`Nergigante-Dream-Skin-Changes.zip` 是包含安装器、引擎补丁和文档的完整离线分发包，不是单独的主题包。

## 前置条件

- macOS。
- 已安装兼容版本的 Codex Dream Skin 引擎，默认位置为 `~/.codex/codex-dream-skin-studio`。
- 系统可使用 `zsh` 与 `node`。
- 已将本仓库完整下载或克隆到本机；不要单独移动 `install-macos.sh`，它需要同目录的 `assets/` 与 `patches/`。

## 一键安装灭尽龙主题

在仓库根目录执行：

```zsh
./install-macos.sh
```

脚本会依次校验引擎与主题文件、备份将被替换的十个补丁文件、复制补丁、导入 `nergigante-dark-ui` 主题并立即启用它。

安装完成后，请完全退出并重新启动 Codex，使界面重新加载主题样式。

## 可选参数

```zsh
./install-macos.sh [--engine-dir <绝对路径>] [--dry-run] [--no-apply]
```

- `--engine-dir <绝对路径>`：指定非默认的 Codex Dream Skin 引擎目录。

  ```zsh
  ./install-macos.sh --engine-dir /绝对路径/codex-dream-skin-studio
  ```

- `--dry-run`：只进行只读校验并列出备份、补丁、导入和启用计划；不会写入文件、导入主题或创建备份。

  ```zsh
  ./install-macos.sh --dry-run
  ```

- `--no-apply`：完成备份、补丁复制和主题导入，但不立即切换到该主题。

  ```zsh
  ./install-macos.sh --no-apply
  ```

参数可以组合，例如先检查指定引擎：

```zsh
./install-macos.sh --engine-dir /绝对路径/codex-dream-skin-studio --dry-run
```

## 备份与手动恢复

每次实际安装都会把原文件备份到目标引擎内：

```text
<引擎目录>/.nergigante-theme-backups/<UTC 时间戳>/
```

脚本在导入或启用失败时会保留该备份并退出，但**不会自动回滚**。如需恢复，先完全退出 Codex，选择最近一次备份目录，并将其中的文件复制回对应引擎位置：

```zsh
ENGINE_DIR="$HOME/.codex/codex-dream-skin-studio"
BACKUP_DIR="$ENGINE_DIR/.nergigante-theme-backups/<UTC 时间戳>"

for file in \
  assets/theme-package-validator.mjs \
  assets/safe-css-validator.mjs \
  assets/dream-skin.css \
  assets/renderer-inject.js \
  scripts/extract-theme-zip-macos.sh \
  scripts/stage-theme.mjs \
  scripts/theme-content-fingerprint.mjs \
  scripts/publish-theme-import.mjs \
  scripts/injector.mjs \
  scripts/switch-theme-macos.sh; do
  /bin/cp -p "$BACKUP_DIR/$file" "$ENGINE_DIR/$file"
done
```

若安装时使用了 `--engine-dir`，请把 `ENGINE_DIR` 改为同一个绝对路径。恢复后重新启动 Codex。

## 验证与测试

测试默认检查当前用户目录下的 Dream Skin 引擎。若引擎位于其他位置，使用 `CODEX_DREAM_SKIN_ENGINE_DIR` 指定其绝对路径：

```zsh
CODEX_DREAM_SKIN_ENGINE_DIR="/绝对路径/codex-dream-skin-studio" \
  node --test tests/*.test.mjs
```

测试路径拒绝软链接，并要求目标引擎具备相关补丁文件。安装器本身也可先用 `--dry-run` 验证，不会影响现有主题。

## 离线分发包

`Nergigante-Dream-Skin-Changes.zip` 是可离线传递的分发快照，包含主题资源、主题 ZIP、补丁源、安装器、测试、README、变更说明、两份设计规格和本次执行计划；不包含 Codex 应用、Dream Skin 引擎本体或 Git 元数据。

主题设计与侧栏修复细节见 [变更说明](docs/灭尽龙主题侧栏修复变更说明.md)。
