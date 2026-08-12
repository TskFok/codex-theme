# Devil May Cry 5 Crimson Requiem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户确认的右置高清背景与匹配的侧栏纹理、主题元数据和安全 CSS 组装成可验证、可离线导入的 Devil May Cry 5 Dream Skin 主题包。

**Architecture:** 主题继续使用仓库当前的简化主题契约：一个主题目录内放置 `background.png`、`sidebar-pattern.png`、`theme.css` 和 `theme.json`，ZIP 根目录与源目录保持字节一致。主背景来自用户确认的生成式扩展候选，尺寸统一为 1920×1080；侧栏纹理单独生成并压低对比度，避免把主背景人物复用到侧栏。

**Tech Stack:** PNG 资源、Node.js `node:test`、现有 `theme-package-validator.mjs`、macOS `/usr/bin/sips`、`/usr/bin/unzip`、`/usr/bin/zip`、Git。

## Global Constraints

- 默认在当前 `master` 分支修改，不新建分支。
- 主题源目录只能包含 `background.png`、`sidebar-pattern.png`、`theme.css`、`theme.json`。
- `background.png` 必须是 1920×1080 PNG；`sidebar-pattern.png` 必须是 1024×1024 PNG。
- 主背景原图主体保持在右侧；左侧约 38%–40% 必须为暗色低细节安全区。
- 不新增文字、Logo、水印、界面控件、额外角色或明显拼接缝。
- CSS 只能包含 `[data-ds-part="root"]` 和 `[data-ds-part="sidebar"]` 两组固定安全规则。
- 禁止在循环遍历中查询 SQL；本任务不引入 SQL。
- Git 提交信息必须使用简体中文。
- 不修改既有主题、安装器或 `patches/engine/` 文件。

---

### Task 1: 准备并规范化已确认的背景资源

**Files:**
- Source: `/Users/ushopal/.codex/generated_images/019ff3ff-d6e9-7280-8dec-13e60f2508a6/exec-7bc30420-6c9b-45fc-baba-c4d4b7f9d5c8.png`
- Create: `assets/devil-may-cry-5-dream-skin/background.png`

**Interfaces:**
- Consumes: 用户确认的右置扩展预览 PNG。
- Produces: 非透明 1920×1080 PNG，保持确认候选的可见内容与右置构图。

- [ ] **Step 1: 验证确认候选。**

运行：

```bash
test -f /Users/ushopal/.codex/generated_images/019ff3ff-d6e9-7280-8dec-13e60f2508a6/exec-7bc30420-6c9b-45fc-baba-c4d4b7f9d5c8.png
file /Users/ushopal/.codex/generated_images/019ff3ff-d6e9-7280-8dec-13e60f2508a6/exec-7bc30420-6c9b-45fc-baba-c4d4b7f9d5c8.png
```

预期：文件存在，且 `file` 报告为 PNG。

- [ ] **Step 2: 只做尺寸规范化，不裁剪、不镜像、不重绘。**

```bash
mkdir -p assets/devil-may-cry-5-dream-skin
/usr/bin/sips -s format png -z 1080 1920 \
  /Users/ushopal/.codex/generated_images/019ff3ff-d6e9-7280-8dec-13e60f2508a6/exec-7bc30420-6c9b-45fc-baba-c4d4b7f9d5c8.png \
  --out assets/devil-may-cry-5-dream-skin/background.png
file assets/devil-may-cry-5-dream-skin/background.png
```

预期：输出为 `PNG image data, 1920 x 1080`。

- [ ] **Step 3: 提交背景资源。**

```bash
git add assets/devil-may-cry-5-dream-skin/background.png
git commit -m "加入鬼泣5主题确认背景"
```

### Task 2: 先写并运行鬼泣5专项契约测试

**Files:**
- Create: `tests/devil-may-cry-5-theme.test.mjs`
- Read: `tests/resident-evil-theme.test.mjs`

**Interfaces:**
- Consumes: 未来的 `assets/devil-may-cry-5-dream-skin/` 和根目录 `Devil-May-Cry-5-Dream-Skin.zip`。
- Produces: 固定元数据、PNG 尺寸、CSS 安全规则、validator staging、ZIP 清单和字节一致性断言。

- [ ] **Step 1: 从现有 Resident Evil 专项测试复制测试骨架，并替换为鬼泣5固定值。**

测试文件必须使用以下常量：

```js
const themeRoot = path.join(repoRoot, "assets", "devil-may-cry-5-dream-skin");
const zipPath = path.join(repoRoot, "Devil-May-Cry-5-Dream-Skin.zip");
const expectedFiles = ["background.png", "sidebar-pattern.png", "theme.css", "theme.json"];
const expectedColors = {
  background: "#0B0D12",
  panel: "#151820",
  panelAlt: "#24232A",
  accent: "#B64558",
  accentAlt: "#E38B8D",
  secondary: "#596879",
  highlight: "#C99763",
  text: "#F1ECE7",
  muted: "#B0A8A6",
  line: "rgba(182, 69, 88, .30)",
};
```

元数据断言必须匹配：

```js
theme.schemaVersion === 1
theme.id === "devil-may-cry-5-crimson"
theme.name === "Devil May Cry 5 Crimson Requiem"
theme.image === "background.png"
theme.sidebarImage === "sidebar-pattern.png"
theme.appearance === "dark"
theme.art === { focusX: 0.80, focusY: 0.48, safeArea: "left", taskMode: "ambient" }
```

图片断言必须读取 PNG IHDR，要求背景为 `1920×1080`、侧栏为 `1024×1024`；CSS 断言必须精确匹配规格中的两组规则；validator 测试必须调用：

```bash
node patches/engine/assets/theme-package-validator.mjs \
  --source assets/devil-may-cry-5-dream-skin \
  --stage "$stage_dir" \
  --platform macos \
  --client-version 1.5.12
```

ZIP 测试必须用 `unzip -Z1` 检查四个根文件，并逐个用 `unzip -p` 与源文件做字节比较。

- [ ] **Step 2: 在资源尚未完整时运行专项测试，确认红灯原因是缺文件。**

```bash
node --test tests/devil-may-cry-5-theme.test.mjs
```

预期：测试收集成功，因 `sidebar-pattern.png`、`theme.json`、`theme.css` 或 ZIP 尚未存在而失败，不得出现语法错误。

- [ ] **Step 3: 提交红灯测试。**

```bash
git add tests/devil-may-cry-5-theme.test.mjs
git commit -m "新增鬼泣5主题契约测试"
```

### Task 3: 生成并规范化低对比侧栏纹理

**Files:**
- Create: `assets/devil-may-cry-5-dream-skin/sidebar-pattern.png`
- Temporary: ImageGen 返回的侧栏候选 PNG，使用工具实际返回的完整绝对路径

**Interfaces:**
- Consumes: 已确认背景的黑曜石、钢蓝、暗酒红视觉基调。
- Produces: 1024×1024 抽象 PNG，适合低对比平铺。

- [ ] **Step 1: 使用内置 ImageGen 生成一个侧栏纹理候选。**

使用以下提示词：

```text
Use case: stylized-concept
Asset type: 1024x1024 low-contrast tiled sidebar texture for a dark desktop UI theme
Primary request: Create an abstract, seamless-feeling dark texture inspired by a demon-hunter battlefield: wet black organic ridges, faint graphite stone, thin muted crimson fissures, cool blue-gray smoke, and sparse brushed-metal flecks.
Composition/framing: no central subject, evenly distributed visual weight, no recognizable object, suitable for low-contrast sidebar tiling.
Lighting/mood: near-black ambient light with restrained cool haze and barely visible wine-red accents.
Color palette: graphite black, charcoal, gunmetal, desaturated steel blue, muted wine red; no neon colors.
Constraints: no characters, faces, weapons, logos, text, numbers, symbols, signatures, watermark, border, or bright focal point; no pure white; no hard seams.
Avoid: poster composition, high contrast, centered emblem, readable marks, duplicated figures, saturated red, purple neon, glossy plastic.
```

- [ ] **Step 2: 视觉检查候选，再复制到主题目录。**

确认候选没有人物、脸部、武器主体、文字、Logo、水印、中心高亮和明显接缝；若不符合，只重新生成侧栏候选，不重新生成或修改已确认背景。

- [ ] **Step 3: 规范化尺寸并检查文件类型。**

```bash
# 先将 ImageGen 工具实际返回的完整绝对路径存入 devil_may_cry_sidebar_source
/usr/bin/sips -s format png -z 1024 1024 \
  "$devil_may_cry_sidebar_source" \
  --out assets/devil-may-cry-5-dream-skin/sidebar-pattern.png
file assets/devil-may-cry-5-dream-skin/sidebar-pattern.png
```

预期：`PNG image data, 1024 x 1024`。

### Task 4: 写入主题元数据与安全 CSS

**Files:**
- Create: `assets/devil-may-cry-5-dream-skin/theme.json`
- Create: `assets/devil-may-cry-5-dream-skin/theme.css`

**Interfaces:**
- Consumes: 两张已规范化 PNG。
- Produces: validator 可接受的四文件源主题。

- [ ] **Step 1: 写入规格中固定的 `theme.json`。**

必须包含 `schemaVersion: 1`、主题 ID `devil-may-cry-5-crimson`、`background.png` 和 `sidebar-pattern.png` 引用，以及规格中完整的文案、`art` 和颜色对象；不得增加未约定字段。

- [ ] **Step 2: 写入规格中固定的 `theme.css`。**

```css
[data-ds-part="root"] {
  background-color: #0b0d12;
  color: #f1ece7;
}

[data-ds-part="sidebar"] {
  background-color: #151820;
  border-right-color: #596879;
}
```

- [ ] **Step 3: 运行源目录专项测试和 validator。**

```bash
node --test tests/devil-may-cry-5-theme.test.mjs
stage_dir="$(mktemp -d /tmp/devil-may-cry-5-stage.XXXXXX)"
node patches/engine/assets/theme-package-validator.mjs \
  --source assets/devil-may-cry-5-dream-skin \
  --stage "$stage_dir" \
  --platform macos \
  --client-version 1.5.12
rm -rf "$stage_dir"
```

预期：PNG、JSON、CSS 相关断言和 validator 通过；只有 ZIP 相关断言可以在打包前暂不通过。

- [ ] **Step 4: 提交四文件源主题。**

```bash
git add assets/devil-may-cry-5-dream-skin
git commit -m "完成鬼泣5主题源文件"
```

### Task 5: 打包并验证离线导入 ZIP

**Files:**
- Create: `Devil-May-Cry-5-Dream-Skin.zip`

**Interfaces:**
- Consumes: validator 已通过的源目录。
- Produces: 根目录严格为四个文件、成员与源文件字节一致的 ZIP。

- [ ] **Step 1: 用显式文件列表重新创建 ZIP。**

```bash
/bin/rm -f Devil-May-Cry-5-Dream-Skin.zip
/usr/bin/zip -q Devil-May-Cry-5-Dream-Skin.zip -j \
  assets/devil-may-cry-5-dream-skin/background.png \
  assets/devil-may-cry-5-dream-skin/sidebar-pattern.png \
  assets/devil-may-cry-5-dream-skin/theme.css \
  assets/devil-may-cry-5-dream-skin/theme.json
```

- [ ] **Step 2: 检查 ZIP 完整性、清单和专项测试。**

```bash
/usr/bin/unzip -t Devil-May-Cry-5-Dream-Skin.zip
/usr/bin/unzip -Z1 Devil-May-Cry-5-Dream-Skin.zip | sort
node --test tests/devil-may-cry-5-theme.test.mjs
```

预期清单严格为：

```text
background.png
sidebar-pattern.png
theme.css
theme.json
```

- [ ] **Step 3: 提交 ZIP。**

```bash
git add Devil-May-Cry-5-Dream-Skin.zip
git commit -m "打包鬼泣5可导入主题"
```

### Task 6: 全量回归与最终交付检查

**Files:**
- Verify: `assets/devil-may-cry-5-dream-skin/*`
- Verify: `Devil-May-Cry-5-Dream-Skin.zip`
- Verify: `tests/devil-may-cry-5-theme.test.mjs`

**Interfaces:**
- Consumes: 所有主题资源、测试和 ZIP。
- Produces: 完整回归验证结果与干净的交付范围。

- [ ] **Step 1: 检查变更范围和空白错误。**

```bash
git status --short
git diff --check
git diff HEAD~4..HEAD --name-only
```

预期：只出现鬼泣5资源、专项测试、规格/计划记录和 ZIP，不出现既有主题或引擎补丁变更。

- [ ] **Step 2: 运行 PNG、ZIP、专项和完整测试。**

```bash
file assets/devil-may-cry-5-dream-skin/background.png assets/devil-may-cry-5-dream-skin/sidebar-pattern.png
/usr/bin/unzip -t Devil-May-Cry-5-Dream-Skin.zip
node --test tests/devil-may-cry-5-theme.test.mjs
node --test tests/*.test.mjs
```

预期：尺寸、ZIP 完整性、专项测试和既有回归测试全部通过；若完整测试受外部 Dream Skin 引擎缺失影响，记录确切错误，不修改无关代码。

- [ ] **Step 3: 逐个确认 ZIP 成员与源文件字节一致。**

```bash
for name in background.png sidebar-pattern.png theme.css theme.json; do
  cmp -s "assets/devil-may-cry-5-dream-skin/$name" <(/usr/bin/unzip -p Devil-May-Cry-5-Dream-Skin.zip "$name")
done
```

预期：命令以退出码 0 结束且无输出。
