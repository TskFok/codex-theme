#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="${0:A:h}"
THEME_ZIP="$SCRIPT_DIR/assets/Nergigante-Dream-Skin.zip"
PATCH_ROOT="$SCRIPT_DIR/patches/engine"
DEFAULT_ENGINE_DIR="${HOME:-}/.codex/codex-dream-skin-studio"

PATCH_FILES=(
  "assets/theme-package-validator.mjs"
  "assets/safe-css-validator.mjs"
  "assets/dream-skin.css"
  "assets/renderer-inject.js"
  "scripts/extract-theme-zip-macos.sh"
  "scripts/stage-theme.mjs"
  "scripts/theme-content-fingerprint.mjs"
  "scripts/publish-theme-import.mjs"
  "scripts/injector.mjs"
  "scripts/switch-theme-macos.sh"
)

ENGINE_DIR="$DEFAULT_ENGINE_DIR"
DRY_RUN=false
NO_APPLY=false

fail() {
  print -u2 -- "错误：$*"
  exit 1
}

usage() {
  cat <<'EOF'
用法：./install-macos.sh [选项]

将灭尽龙主题补丁与主题包安装到 Codex Dream Skin 引擎。

选项：
  --engine-dir <绝对路径>  指定 Codex Dream Skin 引擎目录
  --dry-run                 仅校验并输出精确安装计划，不修改任何文件
  --no-apply                导入主题但不立即启用
  --help                    显示此帮助

默认引擎目录：$HOME/.codex/codex-dream-skin-studio
EOF
}

assert_directory_not_link() {
  local path="$1"
  local label="$2"
  [[ ! -L "$path" ]] || fail "$label 不能是软链接：$path"
  [[ -d "$path" ]] || fail "$label 不存在或不是目录：$path"
}

assert_regular_not_link() {
  local path="$1"
  local label="$2"
  [[ ! -L "$path" ]] || fail "$label 不能是软链接：$path"
  [[ -f "$path" ]] || fail "$label 不存在或不是普通文件：$path"
}

assert_engine_file_safe() {
  local relative_path="$1"
  local current="$ENGINE_DIR"
  local remainder="$relative_path"
  local component

  while [[ "$remainder" == */* ]]; do
    component="${remainder%%/*}"
    remainder="${remainder#*/}"
    current="$current/$component"
    assert_directory_not_link "$current" "目标目录"
  done
  assert_regular_not_link "$current/$remainder" "缺少目标文件"
}

while (( $# > 0 )); do
  case "$1" in
    --engine-dir)
      (( $# >= 2 )) || fail "--engine-dir 需要一个绝对路径参数"
      ENGINE_DIR="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-apply)
      NO_APPLY=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "未知参数：$1"
      ;;
  esac
done

[[ "$ENGINE_DIR" = /* ]] || fail "--engine-dir 必须是绝对路径：$ENGINE_DIR"
assert_directory_not_link "$ENGINE_DIR" "引擎目录"
assert_regular_not_link "$THEME_ZIP" "仓库主题 ZIP"

for relative_path in "${PATCH_FILES[@]}"; do
  assert_regular_not_link "$PATCH_ROOT/$relative_path" "补丁源文件"
  assert_engine_file_safe "$relative_path"
done
assert_engine_file_safe "scripts/import-theme-zip-macos.sh"

BACKUP_ROOT="$ENGINE_DIR/.nergigante-theme-backups"
if [[ -e "$BACKUP_ROOT" || -L "$BACKUP_ROOT" ]]; then
  assert_directory_not_link "$BACKUP_ROOT" "备份根目录"
fi

print_plan() {
  print -- "干运行：已完成只读校验，以下步骤不会实际执行。"
  print -- "备份位置：$BACKUP_ROOT/<UTC 时间戳>/"
  for relative_path in "${PATCH_FILES[@]}"; do
    print -- "替换白名单文件：$relative_path"
  done
  print -- "导入主题包：$THEME_ZIP"
  if [[ "$NO_APPLY" == true ]]; then
    print -- "启用步骤：已通过 --no-apply 跳过"
  else
    print -- "启用步骤：使用导入结果中的 id 与 contentFingerprint"
  fi
}

if [[ "$DRY_RUN" == true ]]; then
  print_plan
  exit 0
fi

timestamp="$(date -u '+%Y%m%dT%H%M%SZ')"
BACKUP_DIR="$BACKUP_ROOT/$timestamp"
[[ ! -e "$BACKUP_DIR" && ! -L "$BACKUP_DIR" ]] || fail "备份目录已存在：$BACKUP_DIR"
umask 077
mkdir -p "$BACKUP_DIR"

for relative_path in "${PATCH_FILES[@]}"; do
  target="$ENGINE_DIR/$relative_path"
  backup_target="$BACKUP_DIR/$relative_path"
  mkdir -p "${backup_target:h}"
  /bin/cp -p "$target" "$backup_target"
done

for relative_path in "${PATCH_FILES[@]}"; do
  /bin/cp -p "$PATCH_ROOT/$relative_path" "$ENGINE_DIR/$relative_path"
done

print -- "已备份并写入 10 个白名单补丁文件。"
if ! import_output="$("$ENGINE_DIR/scripts/import-theme-zip-macos.sh" --file "$THEME_ZIP")"; then
  fail "主题导入失败；备份已保留在：$BACKUP_DIR"
fi

if ! import_metadata="$(node -e '
let value;
try {
  value = JSON.parse(process.argv[1]);
} catch {
  process.exit(1);
}
if (typeof value.id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value.id)) process.exit(1);
if (typeof value.contentFingerprint !== "string" || !/^[0-9a-fA-F]{64}$/.test(value.contentFingerprint)) process.exit(1);
process.stdout.write(`${value.id}\t${value.contentFingerprint.toLowerCase()}`);
' "$import_output")"; then
  fail "导入结果不是有效 JSON，或缺少合法 id/contentFingerprint；备份已保留在：$BACKUP_DIR"
fi

theme_id="${import_metadata%%$'\t'*}"
content_fingerprint="${import_metadata#*$'\t'}"
print -- "主题已导入：$theme_id"

if [[ "$NO_APPLY" == true ]]; then
  print -- "已跳过启用（--no-apply）。备份保留在：$BACKUP_DIR"
  exit 0
fi

if ! "$ENGINE_DIR/scripts/switch-theme-macos.sh" \
  --id "$theme_id" \
  --expect-fingerprint "$content_fingerprint"; then
  fail "主题已导入但启用失败；备份已保留在：$BACKUP_DIR"
fi

print -- "灭尽龙主题已导入并启用。备份保留在：$BACKUP_DIR"
