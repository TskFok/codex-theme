# 桂林山水 Codex Dream Skin 主题实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在当前分支新增一套明亮清晰、摄影感的桂林山水 Codex Dream Skin 主题，并交付源目录、专项测试、README 条目和可离线导入 ZIP。

**Architecture:** 复用现有本地简化主题契约，不修改引擎、安装器或既有主题。主题由四个根文件组成：`theme.json` 声明浅色 shell、颜色和图片定位；`theme.css` 只提供 root/sidebar 的安全后备颜色；两张 PNG 由现有引擎负责作为主背景和侧栏纹理叠加。专项测试沿用现有主题测试模板，验证元数据、图片尺寸、校验器、CSS 和 ZIP 字节一致性。

**Tech Stack:** Node.js ESM、`node:test`、项目内 `theme-package-validator.mjs`、macOS `sips`、`zip`/`unzip`、ImageGen、`view_image`。

## Global Constraints

- 始终使用简体中文沟通；所有 Git 提交信息使用简体中文。
- 默认在当前 `master` 分支工作，不创建新分支。
- 主题 ID 固定为 `guilin-li-river`，主题名称固定为 `Guilin Li River Morning Mist`。
- `theme.json` 使用 `schemaVersion: 1`、`appearance: "light"`、`safeArea: "left"`、`taskMode: "ambient"`。
- 主背景必须是 1920×1080 PNG，侧栏纹理必须是 1024×1024 PNG。
- ZIP 根目录严格只包含 `background.png`、`sidebar-pattern.png`、`theme.css`、`theme.json`。
- 主背景必须先在临时位置完成视觉检查并获得用户确认，确认前不得写入主题源目录。
- `theme.css` 只允许现有安全 CSS 的 root/sidebar 两条规则，不引入外链、脚本、布局或动画。
- 不修改安装器、引擎补丁、既有主题资源或其他主题 ZIP。
- 禁止在循环遍历中查询 SQL；本任务无 SQL 操作。

## 文件地图

| 文件 | 责任 |
| --- | --- |
| `tests/guilin-landscape-theme.test.mjs` | 桂林山水主题的固定元数据、图片、CSS、校验器和 ZIP 契约测试 |
| `assets/guilin-landscape-dream-skin/theme.json` | 主题 ID、文案、浅色模式、图片引用、定位参数和颜色对象 |
| `assets/guilin-landscape-dream-skin/theme.css` | root/sidebar 的安全后备颜色 |
| `assets/guilin-landscape-dream-skin/background.png` | 用户确认后的 1920×1080 漓江晨雾主背景 |
| `assets/guilin-landscape-dream-skin/sidebar-pattern.png` | 1024×1024 低对比侧栏纹理 |
| `Guilin-Landscape-Dream-Skin.zip` | 四个源文件的根目录离线主题包 |
| `README.md` | 主题数量和主题表中的新条目 |
| `docs/superpowers/specs/2026-08-12-guilin-landscape-dream-skin-design.md` | 已确认的设计规格，实施时作为契约来源 |

---

### Task 1: 建立桂林山水主题专项测试红灯基线

**Files:**
- Create: `tests/guilin-landscape-theme.test.mjs`
- Test: `tests/guilin-landscape-theme.test.mjs`

**Interfaces:**
- Consumes: `assets/guilin-landscape-dream-skin/`、`Guilin-Landscape-Dream-Skin.zip`、`patches/engine/assets/theme-package-validator.mjs`。
- Produces: 后续主题资源、CSS 和 ZIP 必须满足的 5 个 `node:test` 契约测试。

- [ ] **Step 1: 创建固定契约测试文件**

写入下面的完整测试代码。测试只读取明确的主题路径，使用 PNG 头部读取尺寸，使用 `unzip -Z1` 读取 ZIP 根清单，并把 ZIP 成员与源文件逐字节比较。

```js
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const themeRoot = path.join(repoRoot, "assets", "guilin-landscape-dream-skin");
const zipPath = path.join(repoRoot, "Guilin-Landscape-Dream-Skin.zip");
const validator = path.join(repoRoot, "patches", "engine", "assets", "theme-package-validator.mjs");
const expectedFiles = ["background.png", "sidebar-pattern.png", "theme.css", "theme.json"];
const expectedColors = {
  background: "#EEF7F2",
  panel: "#FAFDFB",
  panelAlt: "#DDEFE7",
  accent: "#246D63",
  accentAlt: "#3D8979",
  secondary: "#4E6F76",
  highlight: "#9A6A32",
  text: "#173D39",
  muted: "#4A6664",
  line: "rgba(36, 109, 99, .26)",
};
const expectedCss = `[data-ds-part="root"] {
  background-color: #eef7f2;
  color: #173d39;
}

[data-ds-part="sidebar"] {
  background-color: #fafdfb;
  border-right-color: #4e6f76;
}
`;

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
  return execFileSync("/usr/bin/unzip", ["-p", filePath, member], {
    maxBuffer: 16 * 1024 * 1024,
  });
}

test("桂林山水主题元数据符合固定契约", () => {
  const theme = JSON.parse(readFileSync(path.join(themeRoot, "theme.json"), "utf8"));
  assert.equal(theme.schemaVersion, 1);
  assert.equal(theme.id, "guilin-li-river");
  assert.equal(theme.name, "Guilin Li River Morning Mist");
  assert.equal(theme.image, "background.png");
  assert.equal(theme.sidebarImage, "sidebar-pattern.png");
  assert.equal(theme.appearance, "light");
  assert.deepEqual(theme.art, {
    focusX: 0.8,
    focusY: 0.46,
    safeArea: "left",
    taskMode: "ambient",
  });
  assert.deepEqual(theme.colors, expectedColors);
});

test("桂林山水主题图片尺寸符合 Codex 背景契约", () => {
  assert.deepEqual(readPngDimensions(path.join(themeRoot, "background.png")), {
    width: 1920,
    height: 1080,
  });
  assert.deepEqual(readPngDimensions(path.join(themeRoot, "sidebar-pattern.png")), {
    width: 1024,
    height: 1024,
  });
});

test("桂林山水主题 CSS 只包含固定安全规则", () => {
  assert.equal(readFileSync(path.join(themeRoot, "theme.css"), "utf8"), expectedCss);
});

test("桂林山水主题源目录通过本地简化主题校验", () => {
  const stage = mkdtempSync(path.join(os.tmpdir(), "guilin-li-river-theme-stage-"));
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

test("桂林山水主题 ZIP 只有四个根文件且与源目录一致", () => {
  assert.deepEqual(zipNames(zipPath), expectedFiles);
  for (const name of expectedFiles) {
    assert.deepEqual(zipMember(zipPath, name), readFileSync(path.join(themeRoot, name)));
  }
});
```

- [ ] **Step 2: 运行专项测试确认红灯**

Run: `node --test tests/guilin-landscape-theme.test.mjs`

Expected: 5 个测试均失败，失败原因指向缺少 `theme.json`、PNG、`theme.css` 或 ZIP；测试文件本身应能加载，不能出现语法错误或断言模板错误。

- [ ] **Step 3: 检查测试边界并提交测试基线**

Run: `git diff --check`

确认测试只引用桂林山水的新路径，不修改现有主题测试和引擎文件，然后提交：

```bash
git add tests/guilin-landscape-theme.test.mjs
git commit -m "新增桂林山水主题契约测试"
```

---

### Task 2: 生成并确认漓江晨雾主背景

**Files:**
- Create: `assets/guilin-landscape-dream-skin/background.png`
- Temporary: `/private/tmp/guilin-landscape-background-candidate.png`

**Interfaces:**
- Consumes: 设计规格中的“漓江晨雾”构图、安全区和色调要求。
- Produces: 经用户确认的 1920×1080 `background.png`，右侧为主景，左侧为低细节安全区。

- [ ] **Step 1: 读取图像生成技能并生成候选**

在第一次调用图像生成工具前完整读取 `/Users/ushopal/.codex/skills/.system/imagegen/SKILL.md`，然后使用 ImageGen 生成全新图像；新图像调用不传入参考图路径或最近图像数量。使用以下提示词：

```text
Create an original-inspired realistic landscape photograph for a desktop productivity app theme, wide 16:9 composition inspired by Guilin and the Li River at early morning. Keep the left 40 percent pale, misty, uncluttered, and low-detail for UI sidebar and text readability. Place layered karst peaks, a calm jade-green river, and a small traditional bamboo raft concentrated on the right side. Use clear natural dawn light, soft white mist, restrained warm-gold sunlight touching the peaks, fresh teal and jade greens, realistic atmospheric perspective, crisp but calm photographic detail. No people close-up, no text, no logo, no watermark, no UI, no border, no oversaturated cyan, no heavy HDR, no dramatic flare, no dense objects in the left safe area, no central focal point that competes with text.
```

把工具返回的本地候选文件复制为 `/private/tmp/guilin-landscape-background-candidate.png`，不直接写入 `assets/`。

- [ ] **Step 2: 视觉检查候选并请求用户确认**

使用 `view_image` 检查候选，确认：

- 山峰和竹筏是否集中在右侧；
- 左侧约 40% 是否足够浅、空、低细节；
- 薄雾、青绿色水面和暖金光是否自然；
- 是否出现文字、Logo、水印、界面元素或强眩光；
- 主体是否会被 16:9 裁切破坏。

向用户展示候选并暂停，等待用户确认或具体修改意见。若用户要求修改，只针对主背景重新生成候选；未经确认不得创建或覆盖 `assets/guilin-landscape-dream-skin/background.png`。

- [ ] **Step 3: 用户确认后处理为最终尺寸**

确认后创建主题目录，并将候选处理为准确的 1920×1080 PNG。优先使用 `sips` 保持候选构图：

```bash
mkdir -p assets/guilin-landscape-dream-skin
sips --resampleHeightWidth 1080 1920 \
  /private/tmp/guilin-landscape-background-candidate.png \
  --out assets/guilin-landscape-dream-skin/background.png
```

如果原图比例导致主体或安全区明显变形，先用 `sips --resampleWidth 1920` 等比放大，再用 `sips --cropToHeightWidth 1080 1920` 裁切，并再次用 `view_image` 检查右侧主体和左侧安全区。

- [ ] **Step 4: 验证 PNG 头部与尺寸**

Run: `file assets/guilin-landscape-dream-skin/background.png`

Run: `sips -g pixelWidth -g pixelHeight assets/guilin-landscape-dream-skin/background.png`

Expected: PNG 文件，`pixelWidth: 1920`、`pixelHeight: 1080`；最终预览仍符合用户确认的构图。

---

### Task 3: 生成并检查低对比侧栏纹理

**Files:**
- Create: `assets/guilin-landscape-dream-skin/sidebar-pattern.png`
- Temporary: `/private/tmp/guilin-landscape-sidebar-candidate.png`

**Interfaces:**
- Consumes: 已确认的浅色 UI 配色和侧栏低干扰要求。
- Produces: 1024×1024、可平铺、没有明显焦点的浅玉青侧栏纹理。

- [ ] **Step 1: 生成侧栏纹理候选**

使用 ImageGen 生成全新纹理，使用以下提示词：

```text
Create an original-inspired subtle seamless-feeling square texture for a light desktop productivity app sidebar, 1:1 composition. Base color is very pale jade white with low-contrast translucent layers. Use evenly distributed abstract Guilin landscape contour lines, gentle Li River ripples, distant rounded karst silhouettes, and sparse bamboo-leaf shadows. Keep the contrast restrained so dark navigation text remains highly readable. No people, no faces, no readable text, no logo, no watermark, no border, no bright white blocks, no dense noise, no central focal point, no strong vignette, no dramatic highlights. Calm, airy, clean, refined, suitable for continuous tiling.
```

把工具返回的候选文件复制为 `/private/tmp/guilin-landscape-sidebar-candidate.png`。

- [ ] **Step 2: 视觉检查并处理为 1024×1024**

使用 `view_image` 检查候选的对比度、纹理密度、可平铺感和禁用元素。确认后处理：

```bash
sips --resampleHeightWidth 1024 1024 \
  /private/tmp/guilin-landscape-sidebar-candidate.png \
  --out assets/guilin-landscape-dream-skin/sidebar-pattern.png
```

如果等比裁切比直接缩放更能保留纹理均匀性，则先等比放大、居中裁切为正方形，再输出到同一路径。

- [ ] **Step 3: 验证侧栏 PNG 尺寸**

Run: `sips -g pixelWidth -g pixelHeight assets/guilin-landscape-dream-skin/sidebar-pattern.png`

Expected: `pixelWidth: 1024`、`pixelHeight: 1024`；`view_image` 复核没有人物、文字、Logo、水印或明显中心焦点。

---

### Task 4: 写入主题元数据与安全 CSS

**Files:**
- Create: `assets/guilin-landscape-dream-skin/theme.json`
- Create: `assets/guilin-landscape-dream-skin/theme.css`
- Test: `tests/guilin-landscape-theme.test.mjs`

**Interfaces:**
- Consumes: Task 1 的契约测试与 Task 2–3 的两张 PNG。
- Produces: 可通过前 4 个专项测试的主题源目录；ZIP 测试在打包前保持唯一失败。

- [ ] **Step 1: 创建固定 `theme.json`**

写入以下内容，键名、大小写、数值和文案保持一致：

```json
{
  "schemaVersion": 1,
  "id": "guilin-li-river",
  "name": "Guilin Li River Morning Mist",
  "brandSubtitle": "LI RIVER MORNING MIST",
  "tagline": "Clear water, quiet peaks, steady focus.",
  "projectPrefix": "选择项目 · ",
  "projectLabel": "◉  选择项目",
  "statusText": "LI RIVER SIGNAL ONLINE",
  "quote": "MOVE WITH THE MIST",
  "image": "background.png",
  "sidebarImage": "sidebar-pattern.png",
  "appearance": "light",
  "art": {
    "focusX": 0.8,
    "focusY": 0.46,
    "safeArea": "left",
    "taskMode": "ambient"
  },
  "colors": {
    "background": "#EEF7F2",
    "panel": "#FAFDFB",
    "panelAlt": "#DDEFE7",
    "accent": "#246D63",
    "accentAlt": "#3D8979",
    "secondary": "#4E6F76",
    "highlight": "#9A6A32",
    "text": "#173D39",
    "muted": "#4A6664",
    "line": "rgba(36, 109, 99, .26)"
  }
}
```

- [ ] **Step 2: 创建固定 `theme.css`**

写入以下内容，不添加任何其他规则：

```css
[data-ds-part="root"] {
  background-color: #eef7f2;
  color: #173d39;
}

[data-ds-part="sidebar"] {
  background-color: #fafdfb;
  border-right-color: #4e6f76;
}
```

- [ ] **Step 3: 运行专项测试确认源目录状态**

Run: `node --test tests/guilin-landscape-theme.test.mjs`

Expected: 元数据、图片尺寸、CSS、源目录校验 4 个测试通过；ZIP 测试唯一失败，原因是 ZIP 尚未生成。

- [ ] **Step 4: 检查主题校验器与差异**

Run: `git diff --check`

Run: `node patches/engine/assets/theme-package-validator.mjs --source assets/guilin-landscape-dream-skin --stage /private/tmp/guilin-landscape-stage --platform macos --client-version 1.5.12`

Expected: 输出包含 `"format":"simple"`，staging 目录包含四个主题根文件；不要修改引擎目录中的任何文件。

- [ ] **Step 5: 提交主题源目录与专项测试**

```bash
git add tests/guilin-landscape-theme.test.mjs assets/guilin-landscape-dream-skin
git commit -m "创建桂林山水主题源文件"
```

---

### Task 5: 更新 README、打包并通过专项测试

**Files:**
- Modify: `README.md`
- Create: `Guilin-Landscape-Dream-Skin.zip`
- Test: `tests/guilin-landscape-theme.test.mjs`

**Interfaces:**
- Consumes: Task 4 已通过源目录校验的四个主题文件。
- Produces: 根目录四文件 ZIP、README 主题条目和 5/5 通过的桂林山水专项测试。

- [ ] **Step 1: 更新 README 主题数量和主题表**

将 README 开头的“5 个可导入”改为“6 个可导入”，并在 Final Fantasy VII 行之后加入：

```markdown
| [`Guilin-Landscape-Dream-Skin.zip`](Guilin-Landscape-Dream-Skin.zip) | Guilin Li River Morning Mist | `guilin-li-river` | `assets/guilin-landscape-dream-skin/` |
```

其他安装器、补丁和已有主题说明保持不变；README 不应暗示安装器默认启用桂林山水主题。

- [ ] **Step 2: 使用显式文件列表重建 ZIP**

先删除同名的本次构建产物（目标仅限根目录 `Guilin-Landscape-Dream-Skin.zip`），再从仓库根目录执行：

```bash
/bin/rm -f Guilin-Landscape-Dream-Skin.zip
/usr/bin/zip -X -j Guilin-Landscape-Dream-Skin.zip \
  assets/guilin-landscape-dream-skin/background.png \
  assets/guilin-landscape-dream-skin/sidebar-pattern.png \
  assets/guilin-landscape-dream-skin/theme.css \
  assets/guilin-landscape-dream-skin/theme.json
```

`-X` 去除额外属性，`-j` 确保 ZIP 根目录不带源目录前缀。

- [ ] **Step 3: 检查 ZIP 清单和完整性**

Run: `/usr/bin/unzip -Z1 Guilin-Landscape-Dream-Skin.zip`

Expected 清单排序后严格为：

```text
background.png
sidebar-pattern.png
theme.css
theme.json
```

Run: `/usr/bin/unzip -t Guilin-Landscape-Dream-Skin.zip`

Expected: `No errors detected` 或等价的完整性成功输出；不能出现 `.DS_Store`、`__MACOSX/` 或外层目录。

- [ ] **Step 4: 运行桂林山水专项测试**

Run: `node --test tests/guilin-landscape-theme.test.mjs`

Expected: 5 个测试全部通过。

- [ ] **Step 5: 提交 README 与 ZIP**

```bash
git add README.md Guilin-Landscape-Dream-Skin.zip
git commit -m "打包桂林山水主题并更新说明"
```

---

### Task 6: 完成全量验证和交付边界检查

**Files:**
- Verify: `tests/*.test.mjs`
- Verify: `assets/guilin-landscape-dream-skin/*`
- Verify: `Guilin-Landscape-Dream-Skin.zip`
- Verify: `README.md`

**Interfaces:**
- Consumes: Task 5 已提交的主题源文件、ZIP、专项测试和 README。
- Produces: 可交付的验证结果、无越界修改的 Git 工作区，以及必要的环境限制记录。

- [ ] **Step 1: 运行专项测试与全量测试**

Run: `node --test tests/guilin-landscape-theme.test.mjs`

Expected: 5/5 通过。

Run: `node --test tests/*.test.mjs`

Expected: 所有可运行测试通过。如果测试因缺少 `CODEX_DREAM_SKIN_ENGINE_DIR` 或默认引擎目录而无法运行，记录具体缺失路径和受限测试数量，不伪造通过结果；桂林山水专项测试、校验器和 ZIP 检查仍必须通过。

- [ ] **Step 2: 复核源目录与 ZIP 的逐字节一致性**

Run：

```bash
node - <<'NODE'
const { execFileSync } = require("node:child_process");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const source = path.join(root, "assets", "guilin-landscape-dream-skin");
const zip = path.join(root, "Guilin-Landscape-Dream-Skin.zip");
const names = ["background.png", "sidebar-pattern.png", "theme.css", "theme.json"];
for (const name of names) {
  const packed = execFileSync("/usr/bin/unzip", ["-p", zip, name]);
  const original = readFileSync(path.join(source, name));
  if (!packed.equals(original)) throw new Error(`ZIP member differs: ${name}`);
}
console.log("ZIP members match source files byte-for-byte");
NODE
```

Expected: 输出 `ZIP members match source files byte-for-byte`。

- [ ] **Step 3: 复核图片尺寸、主题条目和变更边界**

Run: `sips -g pixelWidth -g pixelHeight assets/guilin-landscape-dream-skin/background.png assets/guilin-landscape-dream-skin/sidebar-pattern.png`

Expected: 主背景 1920×1080，侧栏纹理 1024×1024。

Run: `rg -n "6 个可导入|guilin-li-river|Guilin-Landscape-Dream-Skin" README.md`

Expected: README 同时包含主题数量、主题 ID、ZIP 名称和源目录信息。

Run: `git status --short` 和 `git diff 8808add..HEAD --name-only`

Expected：变更仅包含桂林山水主题资源、主题 ZIP、README、专项测试及本任务文档；不包含安装器、引擎补丁、既有主题或其他主题 ZIP。

- [ ] **Step 4: 清理本次视觉预览的临时会话目录**

视觉伴侣产生的 `.superpowers/brainstorm/38237-1786513896/` 只用于本次设计预览，不属于主题交付物。确认浏览器不再需要该页面后，删除这个明确的临时目录，再检查 `git status --short`，不得删除仓库中的任何主题或文档文件。

- [ ] **Step 5: 交付最终路径和验证结论**

最终回复中提供：

- `assets/guilin-landscape-dream-skin/` 源目录链接；
- `Guilin-Landscape-Dream-Skin.zip` 下载链接；
- 专项测试、全量测试和环境限制的真实结果；
- 主背景与侧栏纹理尺寸；
- 未修改安装器、引擎补丁和既有主题的边界确认。
