# 初音未来 Codex Dream Skin 主题实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans`，按任务逐项实现并在任务之间复核。每一步使用 checkbox 跟踪。

**Goal:** 新增一套清透未来感的初音未来主题源目录、主题资源和可直接离线导入的 ZIP，并通过项目已有主题校验与回归检查。

**Architecture:** 主题作为独立的本地简化主题包存在于 `assets/hatsune-miku-dream-skin/`，由 `theme.json` 声明元数据/颜色/图像定位，由 `theme.css` 提供两条安全颜色规则，由两张 PNG 提供主背景和侧栏平铺纹理。ZIP 使用显式四文件列表打包到根目录，不修改现有灭尽龙安装器或引擎补丁。

**Tech Stack:** Node.js `node:test`、Node 内置 `fs`/`child_process`、PNG IHDR 读取、仓库现有 `theme-package-validator.mjs`、内置 ImageGen、macOS `/usr/bin/zip` 与 `/usr/bin/unzip`。

## Global Constraints

- 主题目录必须是 `assets/hatsune-miku-dream-skin/`。
- 主题 ID 必须是 `hatsune-miku-cyan`，使用小写连字符格式。
- `theme.json` 使用 `schemaVersion: 1`，图像引用必须是同目录内的 `background.png` 和 `sidebar-pattern.png`。
- 主背景必须为 1920×1080 PNG；侧栏纹理必须为 1024×1024 PNG。
- 主背景主体右置，左侧约 40% 保持深色低细节安全区；侧栏纹理不包含完整人物、文字、Logo 或水印。
- 颜色使用已确认的深夜蓝、薄荷青、冰蓝和少量粉紫契约；主要文字和次要文字必须通过对比度检查。
- `theme.css` 只能包含已确认的根节点和侧栏安全规则，不使用外部 URL、脚本、事件属性、布局覆盖或字体导入。
- ZIP 根目录严格包含 `background.png`、`sidebar-pattern.png`、`theme.css`、`theme.json` 四个文件，不包含外层目录、`.DS_Store` 或 `__MACOSX`。
- 不修改现有灭尽龙主题、`install-macos.sh`、引擎补丁或默认安装入口。
- 所有提交信息使用简体中文；默认在当前 `master` 分支工作，不新建分支。

---

### Task 1: 建立初音未来主题契约测试

**Files:**
- Create: `tests/hatsune-miku-theme.test.mjs`
- Read: `patches/engine/assets/theme-package-validator.mjs`

**Interfaces:**
- Consumes: `assets/hatsune-miku-dream-skin/` 源目录、`Hatsune-Miku-Dream-Skin.zip`、仓库主题校验器。
- Produces: 四个可独立运行的 `node:test` 用例，分别覆盖元数据、PNG 尺寸、源目录校验、ZIP 清单和 ZIP 内容一致性。

- [ ] **Step 1: 写入会失败的专项测试**

创建以下测试文件。当前资源尚未存在，首次运行应因缺少主题文件而失败；这是预期的红灯。

```js
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const themeRoot = path.join(repoRoot, "assets", "hatsune-miku-dream-skin");
const zipPath = path.join(repoRoot, "Hatsune-Miku-Dream-Skin.zip");
const validator = path.join(repoRoot, "patches", "engine", "assets", "theme-package-validator.mjs");
const expectedFiles = ["background.png", "sidebar-pattern.png", "theme.css", "theme.json"];
const expectedColors = {
  background: "#07131F",
  panel: "#0C2231",
  panelAlt: "#123142",
  accent: "#55E7D0",
  accentAlt: "#8BF7E9",
  secondary: "#4B8FB1",
  highlight: "#E88BD5",
  text: "#E8FBFA",
  muted: "#9BB8BE",
  line: "rgba(85, 231, 208, .28)",
};

function readPngDimensions(filePath) {
  const bytes = readFileSync(filePath);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(bytes.toString("ascii", 12, 16), "IHDR");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function zipNames(filePath) {
  return execFileSync("/usr/bin/unzip", ["-Z1", filePath], { encoding: "utf8" })
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .sort();
}

function zipMember(filePath, member) {
  return execFileSync("/usr/bin/unzip", ["-p", filePath, member]);
}

test("初音未来主题元数据符合固定契约", () => {
  const theme = JSON.parse(readFileSync(path.join(themeRoot, "theme.json"), "utf8"));
  assert.equal(theme.schemaVersion, 1);
  assert.equal(theme.id, "hatsune-miku-cyan");
  assert.equal(theme.name, "Hatsune Miku Clear Future");
  assert.equal(theme.image, "background.png");
  assert.equal(theme.sidebarImage, "sidebar-pattern.png");
  assert.equal(theme.appearance, "dark");
  assert.deepEqual(theme.art, {
    focusX: 0.78,
    focusY: 0.46,
    safeArea: "left",
    taskMode: "ambient",
  });
  assert.deepEqual(theme.colors, expectedColors);
});

test("初音未来主题图片尺寸符合 Codex 背景契约", () => {
  assert.deepEqual(readPngDimensions(path.join(themeRoot, "background.png")), {
    width: 1920,
    height: 1080,
  });
  assert.deepEqual(readPngDimensions(path.join(themeRoot, "sidebar-pattern.png")), {
    width: 1024,
    height: 1024,
  });
});

test("初音未来主题源目录通过本地简化主题校验", () => {
  const stage = mkdtempSync(path.join(os.tmpdir(), "hatsune-miku-theme-stage-"));
  try {
    const output = execFileSync(process.execPath, [
      validator,
      "--source", themeRoot,
      "--stage", stage,
      "--platform", "macos",
      "--client-version", "1.5.12",
    ], { encoding: "utf8" });
    assert.match(output, /"format":"simple"/);
    for (const name of expectedFiles) assert.equal(existsSync(path.join(stage, name)), true);
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
});

test("初音未来主题 ZIP 只有四个根文件且与源目录一致", () => {
  assert.deepEqual(zipNames(zipPath), expectedFiles);
  for (const name of expectedFiles) {
    assert.deepEqual(zipMember(zipPath, name), readFileSync(path.join(themeRoot, name)));
  }
});
```

- [ ] **Step 2: 运行专项测试确认红灯**

运行：

```bash
node --test tests/hatsune-miku-theme.test.mjs
```

预期：失败，错误应指向缺少 `assets/hatsune-miku-dream-skin/theme.json` 或主题图片；不能出现语法错误或测试文件加载错误。

- [ ] **Step 3: 提交测试基线**

```bash
git add tests/hatsune-miku-theme.test.mjs
git commit -m "新增初音未来主题契约测试"
```

---

### Task 2: 生成并整理主背景

**Files:**
- Create: `assets/hatsune-miku-dream-skin/background.png`
- Inspect: ImageGen 生成结果和最终 PNG

**Interfaces:**
- Consumes: 已批准的主背景设计规格和薄荷青/深夜蓝配色。
- Produces: 一张 1920×1080、无文字无水印、右侧主体和左侧安全区明确的主背景 PNG。

- [ ] **Step 1: 使用内置 ImageGen 生成主背景候选**

使用内置图像生成工具，不使用 CLI fallback。提示词必须明确以下约束：

```text
Use case: stylized-concept
Asset type: Codex Dream Skin desktop application background
Primary request: a polished wide background inspired by Hatsune Miku's clear futuristic virtual singer aesthetic
Scene/backdrop: a quiet deep-navy digital soundscape with translucent audio-wave ribbons and a soft atmospheric horizon
Subject: one Hatsune Miku-inspired virtual singer on the right side, recognizable by long turquoise twin-tails and a black-cyan futuristic performance outfit, calm three-quarter pose
Style/medium: refined anime-inspired digital illustration, clean cinematic lighting, restrained detail suitable for a developer tool UI
Composition/framing: 16:9 wide composition; keep the left 40% dark, uncluttered, and low-detail for sidebar and text; place the character and strongest glow on the right
Lighting/mood: clear, calm, focused, cool ambient light with a small soft magenta rim highlight
Color palette: deep navy, ink blue, mint cyan, ice blue, restrained soft magenta
Materials/textures: subtle glass-like signal lines, smooth atmospheric gradients, sparse particles
Text (verbatim): none
Constraints: no text, no logo, no watermark, no interface elements, no white background, no additional characters, no strong lens flare, no high-contrast detail in the left 40%
Avoid: busy concert stage, giant bright light source, cluttered particles, centered subject, cropped twin-tails, unreadable UI background
```

- [ ] **Step 2: 检查候选并放入主题目录**

使用 `view_image` 检查：人物是否明显偏右、左侧是否足够暗、是否出现文字/水印/第二人物、颜色是否与规格一致。将最终候选复制到 `assets/hatsune-miku-dream-skin/background.png`，保留生成源的非破坏性副本在临时目录，不将临时文件放入主题目录。

- [ ] **Step 3: 调整到固定尺寸并验证 PNG 头部**

如果生成结果不是 1920×1080，使用系统图像工具先等比填充再居中裁切，不拉伸人物；不要覆盖生成源。运行：

```bash
file assets/hatsune-miku-dream-skin/background.png
```

预期：输出包含 `PNG image data, 1920 x 1080`。

- [ ] **Step 4: 运行图片尺寸测试**

```bash
node --test tests/hatsune-miku-theme.test.mjs
```

预期：元数据测试仍因 `theme.json` 缺少而失败，图片尺寸测试中主背景断言通过；若图片尺寸失败，先修复尺寸再继续。

---

### Task 3: 生成并整理侧栏纹理

**Files:**
- Create: `assets/hatsune-miku-dream-skin/sidebar-pattern.png`
- Inspect: ImageGen 生成结果和最终 PNG

**Interfaces:**
- Consumes: 已批准的侧栏低对比纹理设计和主题颜色契约。
- Produces: 一张 1024×1024、可平铺、无人物/文字/Logo/水印的侧栏纹理 PNG。

- [ ] **Step 1: 使用内置 ImageGen 生成侧栏纹理候选**

使用以下提示词，要求纹理密度均匀且没有单一视觉焦点：

```text
Use case: stylized-concept
Asset type: seamless low-contrast sidebar texture for a dark developer tool theme
Primary request: an abstract Hatsune Miku-inspired digital audio texture, not a character portrait
Scene/backdrop: deep ink-blue field with subtle mint-cyan signal ribbons, thin grid fragments, quiet equalizer traces, and sparse soft particles
Style/medium: refined flat-digital texture with gentle depth, low contrast, suitable for repeated tiling behind navigation labels
Composition/framing: square tile; evenly distributed texture; no center focal point and no obvious seam at the edges
Lighting/mood: calm, translucent, focused, mostly dark
Color palette: #07131F, #0C2231, #123142, #55E7D0 at low opacity, tiny #E88BD5 accents
Materials/textures: faint glassy lines and soft digital grain, never noisy
Text (verbatim): none
Constraints: no person, no face, no hair, no logo, no watermark, no letters, no numbers, no white blocks, no bright focal point, no heavy noise
Avoid: character art, poster composition, strong contrast, large symbols, obvious checkerboard, visible tile seam
```

- [ ] **Step 2: 检查候选并放入主题目录**

使用 `view_image` 检查是否可平铺、是否低对比、是否完全没有人物和文字。将最终候选复制到 `assets/hatsune-miku-dream-skin/sidebar-pattern.png`。

- [ ] **Step 3: 调整到固定尺寸并验证 PNG 头部**

如需尺寸处理，使用等比裁切到 1024×1024，不改变纹理色调；运行：

```bash
file assets/hatsune-miku-dream-skin/sidebar-pattern.png
```

预期：输出包含 `PNG image data, 1024 x 1024`。

- [ ] **Step 4: 运行图片尺寸测试**

```bash
node --test tests/hatsune-miku-theme.test.mjs
```

预期：两个图片尺寸断言通过；元数据、校验和 ZIP 用例可继续因为对应文件尚未建立而失败。

---

### Task 4: 创建主题元数据与安全 CSS

**Files:**
- Create: `assets/hatsune-miku-dream-skin/theme.json`
- Create: `assets/hatsune-miku-dream-skin/theme.css`

**Interfaces:**
- Consumes: `background.png`、`sidebar-pattern.png` 和设计规格中的固定主题契约。
- Produces: 可被现有引擎 validator、staging 和 renderer 消费的主题配置与安全 CSS。

- [ ] **Step 1: 写入固定 `theme.json`**

写入规格中完整 JSON，不添加未在 validator 允许列表中的字段。颜色、文案和 `art` 值必须与专项测试完全一致；JSON 使用 UTF-8、2 空格缩进、末尾换行。

- [ ] **Step 2: 写入固定 `theme.css`**

```css
[data-ds-part="root"] {
  background-color: #07131f;
  color: #e8fbfa;
}

[data-ds-part="sidebar"] {
  background-color: #0c2231;
  border-right-color: #4b8fb1;
}
```

CSS 只包含上述两条规则和必要空白，不添加外部依赖或额外选择器。

- [ ] **Step 3: 运行专项测试使所有源目录断言通过**

```bash
node --test tests/hatsune-miku-theme.test.mjs
```

预期：元数据、图片尺寸和本地简化主题校验通过；ZIP 用例仍因 ZIP 尚未生成而失败。

- [ ] **Step 4: 检查颜色对比度**

使用一个短的 Node 内联检查或测试辅助逻辑，将 `#E8FBFA` 与 `#0C2231`、`#9BB8BE` 与 `#0C2231` 转成相对亮度并输出 WCAG 对比度；主要文字目标至少 4.5:1，次要文字目标至少 3:1。若不满足，只能调整对应文本/面板色并同步 `theme.json` 与测试，不改变主背景构图。

示例计算公式：

```js
const ratio = (lighter + 0.05) / (darker + 0.05);
```

---

### Task 5: 打包可直接导入的主题 ZIP

**Files:**
- Create: `Hatsune-Miku-Dream-Skin.zip`
- Read: `assets/hatsune-miku-dream-skin/{background.png,sidebar-pattern.png,theme.css,theme.json}`

**Interfaces:**
- Consumes: 已通过源目录测试的四个主题文件。
- Produces: 根目录直接含四个文件、无额外元数据文件的离线 ZIP。

- [ ] **Step 1: 使用临时目录和显式文件列表打包**

不要对整个主题目录执行递归打包。使用临时目录生成候选 ZIP，然后以原子移动方式放到仓库根目录：

```bash
zip_stage_dir="$(mktemp -d "${TMPDIR:-/tmp}/hatsune-miku-zip.XXXXXX")"
/usr/bin/zip -X -j "$zip_stage_dir/Hatsune-Miku-Dream-Skin.zip" \
  assets/hatsune-miku-dream-skin/background.png \
  assets/hatsune-miku-dream-skin/sidebar-pattern.png \
  assets/hatsune-miku-dream-skin/theme.css \
  assets/hatsune-miku-dream-skin/theme.json
mv "$zip_stage_dir/Hatsune-Miku-Dream-Skin.zip" ./Hatsune-Miku-Dream-Skin.zip
rmdir "$zip_stage_dir"
```

如果仓库根目录已经存在同名 ZIP，先确认它是本次生成物，再通过新的临时候选完成检查后替换；不要覆盖无法确认来源的用户文件。

- [ ] **Step 2: 运行 ZIP 清单检查**

```bash
/usr/bin/unzip -Z1 Hatsune-Miku-Dream-Skin.zip | sort
```

预期严格输出：

```text
background.png
sidebar-pattern.png
theme.css
theme.json
```

- [ ] **Step 3: 运行完整专项测试**

```bash
node --test tests/hatsune-miku-theme.test.mjs
```

预期：4 个测试全部通过，并确认 ZIP 每个成员的字节内容都与源目录对应文件一致。

- [ ] **Step 4: 提交主题源和 ZIP**

```bash
git add assets/hatsune-miku-dream-skin Hatsune-Miku-Dream-Skin.zip tests/hatsune-miku-theme.test.mjs
git commit -m "新增初音未来可导入主题"
```

---

### Task 6: 完成全量验证与交付检查

**Files:**
- Read: `README.md`
- Read: `docs/superpowers/specs/2026-08-11-hatsune-miku-dream-skin-design.md`
- Read: `assets/nergigante-dream-skin/`
- Read: `git diff`

**Interfaces:**
- Consumes: 主题源目录、ZIP、专项测试、仓库现有测试和设计规格。
- Produces: 通过/受限结果记录，以及只包含本次初音未来主题变更的最终工作区。

- [ ] **Step 1: 运行专项测试、格式检查和资源检查**

```bash
node --test tests/hatsune-miku-theme.test.mjs
git diff --check 55d09b2..HEAD
file assets/hatsune-miku-dream-skin/background.png assets/hatsune-miku-dream-skin/sidebar-pattern.png
/usr/bin/unzip -t Hatsune-Miku-Dream-Skin.zip
```

预期：专项测试全部通过、无空白错误、图片尺寸正确、ZIP 完整性检查通过。

- [ ] **Step 2: 运行现有回归测试**

```bash
node --test tests/*.test.mjs
```

如果测试因 `CODEX_DREAM_SKIN_ENGINE_DIR` 未配置或目标引擎缺失而无法运行，记录确切错误，并保留已通过的仓库内 validator 专项测试结果；如果出现与本次主题相关的失败，先定位并修复，不忽略失败。

- [ ] **Step 3: 检查变更边界和主题源/ZIP 一致性**

```bash
git status --short
git diff 55d09b2..HEAD --stat
git diff 55d09b2..HEAD -- install-macos.sh assets/nergigante-dream-skin patches/engine
```

预期：没有灭尽龙资源、安装器或引擎补丁变更；源目录四个文件与 ZIP 成员逐字节一致；只存在本规格允许的主题资源、专项测试和必要文档。

- [ ] **Step 4: 更新规划记录并交付**

将 `task_plan.md` 的 Phase 3–5、`findings.md` 和 `progress.md` 更新为实际完成状态，记录每个验证命令的实际输出和任何环境限制；最终回复提供主题目录、ZIP、设计规格、测试结果和未运行测试的原因（如有）。

## Self-Review Checklist

- [x] 规格中的四文件主题结构有对应任务。
- [x] 主背景右置与左侧安全区有独立生成和检查任务。
- [x] 侧栏纹理低对比、无人物/文字约束有独立生成和检查任务。
- [x] JSON、CSS、PNG 尺寸、validator、ZIP 清单、字节一致性和回归测试均有明确步骤。
- [x] 计划未要求修改安装器、引擎补丁或现有灭尽龙主题。
- [x] 计划中的所有路径、主题 ID、颜色和文案与已批准规格一致。
- [x] 未使用占位标记或未定义接口；每个代码步骤都给出实际命令或代码内容。
