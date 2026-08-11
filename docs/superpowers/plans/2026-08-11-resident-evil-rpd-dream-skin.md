# 生化危机 R.P.D. Night Watch 主题实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans`，按任务逐项实现并在任务之间复核。步骤使用 checkbox 跟踪。

**Goal:** 新增一套以里昂和艾达王为核心、经过用户审阅主背景、可通过现有主题校验并可离线导入的 R.P.D. Night Watch 主题。

**Architecture:** 主题作为独立的本地简化主题包存在于 `assets/resident-evil-dream-skin/`，由 `theme.json` 声明元数据、颜色和图像定位，由 `theme.css` 提供两条安全颜色规则，由两张 PNG 提供主背景和侧栏纹理。专项测试复用初音未来主题的 Node 内置测试模式，ZIP 使用显式四文件列表打包，不修改现有安装器、引擎补丁或其他主题。

**Tech Stack:** Node.js `node:test`、Node 内置 `fs`/`child_process`、PNG IHDR 读取、仓库现有 `theme-package-validator.mjs`、内置 ImageGen、macOS `/usr/bin/zip` 与 `/usr/bin/unzip`。

## Global Constraints

- 主题目录固定为 `assets/resident-evil-dream-skin/`。
- 主题 ID 固定为 `resident-evil-rpd`，名称固定为 `Resident Evil R.P.D. Night Watch`。
- `theme.json` 使用 `schemaVersion: 1`，图像引用固定为同目录内的 `background.png` 和 `sidebar-pattern.png`。
- 主背景必须为 1920×1080 PNG；侧栏纹理必须为 1024×1024 PNG。
- 主背景左侧约 40% 保持深色低细节安全区，里昂和艾达王位于右侧；主背景必须先展示给用户审阅，用户确认后才可写入主题目录。
- 主背景不满意时按用户反馈重新生成，旧候选不覆盖、不进入主题 ZIP 或提交记录。
- 素材使用原创灵感风格，不直接复用游戏截图、官方 Logo、官方标志或官方宣传图构图。
- `theme.css` 只能包含固定的 root 与 sidebar 安全颜色规则，不使用外部 URL、脚本、事件属性、布局覆盖或字体导入。
- ZIP 根目录严格包含 `background.png`、`sidebar-pattern.png`、`theme.css`、`theme.json` 四个文件，不包含外层目录、`.DS_Store`、`__MACOSX` 或临时候选资源。
- 不修改 `install-macos.sh`、`patches/engine/`、`assets/nergigante-dream-skin/` 或 `assets/hatsune-miku-dream-skin/`。
- 默认在当前 `master` 分支工作，不新建分支；所有提交信息使用简体中文。
- 按 TDD 顺序执行：先写测试并确认红灯，再创建主题资源和配置。

---

### Task 1: 建立生化危机主题契约测试

**Files:**
- Create: `tests/resident-evil-theme.test.mjs`
- Read: `patches/engine/assets/theme-package-validator.mjs`
- Read: `tests/hatsune-miku-theme.test.mjs`

**Interfaces:**
- Consumes: `assets/resident-evil-dream-skin/` 源目录、`Resident-Evil-RPD-Dream-Skin.zip` 和仓库现有主题校验器。
- Produces: 主题元数据、PNG 尺寸、validator staging、CSS 安全边界、ZIP 清单和 ZIP/源目录字节一致性的自动化断言。

- [ ] **Step 1: 写入会失败的专项测试**

创建以下完整测试文件；此时主题目录和主题 ZIP 尚不存在，第一次运行必须红灯。

```js
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const themeRoot = path.join(repoRoot, "assets", "resident-evil-dream-skin");
const zipPath = path.join(repoRoot, "Resident-Evil-RPD-Dream-Skin.zip");
const validator = path.join(repoRoot, "patches", "engine", "assets", "theme-package-validator.mjs");
const expectedFiles = ["background.png", "sidebar-pattern.png", "theme.css", "theme.json"];
const expectedColors = {
  background: "#090B0F",
  panel: "#12171D",
  panelAlt: "#1B242B",
  accent: "#C4434D",
  accentAlt: "#E06B64",
  secondary: "#4C6470",
  highlight: "#D59A58",
  text: "#F0ECE6",
  muted: "#A4AFB3",
  line: "rgba(196, 67, 77, .30)",
};
const expectedCss = `[data-ds-part="root"] {
  background-color: #090b0f;
  color: #f0ece6;
}

[data-ds-part="sidebar"] {
  background-color: #12171d;
  border-right-color: #4c6470;
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

test("生化危机 R.P.D. 主题元数据符合固定契约", () => {
  const theme = JSON.parse(readFileSync(path.join(themeRoot, "theme.json"), "utf8"));
  assert.equal(theme.schemaVersion, 1);
  assert.equal(theme.id, "resident-evil-rpd");
  assert.equal(theme.name, "Resident Evil R.P.D. Night Watch");
  assert.equal(theme.image, "background.png");
  assert.equal(theme.sidebarImage, "sidebar-pattern.png");
  assert.equal(theme.appearance, "dark");
  assert.deepEqual(theme.art, {
    focusX: 0.82,
    focusY: 0.48,
    safeArea: "left",
    taskMode: "ambient",
  });
  assert.deepEqual(theme.colors, expectedColors);
});

test("生化危机 R.P.D. 主题图片尺寸符合 Codex 背景契约", () => {
  assert.deepEqual(readPngDimensions(path.join(themeRoot, "background.png")), {
    width: 1920,
    height: 1080,
  });
  assert.deepEqual(readPngDimensions(path.join(themeRoot, "sidebar-pattern.png")), {
    width: 1024,
    height: 1024,
  });
});

test("生化危机 R.P.D. 主题 CSS 只包含固定安全规则", () => {
  assert.equal(readFileSync(path.join(themeRoot, "theme.css"), "utf8"), expectedCss);
});

test("生化危机 R.P.D. 主题源目录通过本地简化主题校验", () => {
  const stage = mkdtempSync(path.join(os.tmpdir(), "resident-evil-rpd-theme-stage-"));
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

test("生化危机 R.P.D. 主题 ZIP 只有四个根文件且与源目录一致", () => {
  assert.deepEqual(zipNames(zipPath), expectedFiles);
  for (const name of expectedFiles) {
    assert.deepEqual(zipMember(zipPath, name), readFileSync(path.join(themeRoot, name)));
  }
});
```

- [ ] **Step 2: 运行测试确认红灯**

运行：

```bash
node --test tests/resident-evil-theme.test.mjs
```

预期：测试加载成功但因缺少 `assets/resident-evil-dream-skin/theme.json` 或图片而失败；不能出现测试文件语法错误或 validator 模块加载错误。

- [ ] **Step 3: 提交测试基线**

```bash
git add tests/resident-evil-theme.test.mjs
git commit -m "新增生化危机主题契约测试"
```

提交后运行 `git status --short --branch`，确认没有漏加测试文件。

---

### Task 2: 生成主背景候选并完成用户审阅

**Files:**
- Preview only: built-in ImageGen generated output outside the repository
- Create after user approval: `assets/resident-evil-dream-skin/background.png`

**Interfaces:**
- Consumes: 已确认的 R.P.D. 夜巡设计、左侧安全区、冷蓝/警戒红配色和原创灵感约束。
- Produces: 一张用户明确确认过的 1920×1080 主背景 PNG；未确认候选不能被主题或 ZIP 引用。

- [ ] **Step 1: 用内置 ImageGen 生成第一版候选**

使用内置图像生成工具，不使用 CLI fallback。生成提示词如下：

```text
Use case: stylized-concept
Asset type: Codex Dream Skin desktop application background
Primary request: a polished original-inspired survival-horror action illustration centered on Leon and Ada Wong, suitable as a dark developer-tool background
Scene/backdrop: a rainy night urban police district dissolving into a dim biological laboratory corridor, with wet glass reflections, restrained emergency lights, and deep atmospheric shadows
Subject: Leon on the right foreground in a calm, vigilant law-enforcement action pose; Ada Wong on the mid-right behind him with a controlled, mysterious stance and a restrained dark-red rim light; both characters should be distinct and readable without copying any specific official promotional composition
Style/medium: cinematic anime-realistic digital illustration, refined and restrained, suitable for a developer workspace rather than a poster
Composition/framing: 16:9 wide composition; keep the left 40% dark, uncluttered, and low-detail for sidebar and text; place both characters and the strongest visual contrast on the right; keep faces and upper bodies inside the safe crop
Lighting/mood: cold blue police ambience, muted charcoal shadows, narrow warning-red highlights, a tiny amount of amber signal light, tense but focused
Color palette: obsidian black, ink blue, steel blue, warning red, muted wine red, restrained amber
Materials/textures: rain on glass, soft fog, subtle laboratory reflections, sparse dust motes, no noisy particles
Text (verbatim): none
Constraints: no text, no logo, no watermark, no interface elements, no official emblem, no third character, no bright white background, no centered composition, no high-contrast detail in the left 40%
Avoid: poster typography, game screenshot look, copied key art, busy action explosion, giant lens flare, cropped faces, duplicated limbs, unreadable UI background
```

- [ ] **Step 2: 展示候选并暂停等待用户审阅**

将生成结果直接展示给用户，同时说明候选仍在主题目录之外。检查以下项目后再等待用户反馈：

- 里昂和艾达王是否都位于右侧且关系清楚。
- 左侧约 40% 是否足够暗、空、适合文字和侧栏。
- 是否出现第三角色、文字、Logo、水印或官方标志。
- 脸部、手部、服装和光线是否出现明显生成瑕疵。
- 整体是否符合冷蓝警务与暗红危险感。

用户回复“确认”或明确同义表达后才进入下一步；如果用户提出修改意见，停留在本任务内重新生成，不复制候选到主题目录。

- [ ] **Step 3: 根据反馈做单变量重生成**

每次只改变用户指出的主要因素。例如用户要求“左侧更暗”，只加强左侧负空间和降低背景细节；用户要求“艾达更明显”，只调整艾达的位置、轮廓光和人物层次。保留已确认的 16:9 构图、左侧安全区和双人右置关系。每一版使用新的候选文件，不覆盖上一版。

- [ ] **Step 4: 用户确认后复制并校验最终 PNG**

将用户确认的候选先复制到固定的临时路径 `/private/tmp/resident-evil-rpd-background-approved.png`，再进行尺寸处理。若候选不是 1920×1080，先以不拉伸人物的方式等比缩放并居中裁切，再将处理结果保存为 `assets/resident-evil-dream-skin/background.png`。macOS 可使用临时目录和 `sips`：

```bash
image_stage_dir="$(mktemp -d "${TMPDIR:-/tmp}/resident-evil-rpd-image.XXXXXX")"
sips --resampleWidth 1920 --out "$image_stage_dir/background-wide.png" "/private/tmp/resident-evil-rpd-background-approved.png"
sips --cropToHeightWidth 1080 1920 --out "$image_stage_dir/background.png" "$image_stage_dir/background-wide.png"
cp "$image_stage_dir/background.png" assets/resident-evil-dream-skin/background.png
rm -f "$image_stage_dir/background-wide.png" "$image_stage_dir/background.png"
rmdir "$image_stage_dir"
file assets/resident-evil-dream-skin/background.png
```

预期输出包含 `PNG image data, 1920 x 1080`。不要把未确认候选、源文件副本或临时处理文件放入主题目录。

---
### Task 3: 生成并检查侧栏平铺纹理

**Files:**
- Preview only: built-in ImageGen generated output outside the repository
- Create: `assets/resident-evil-dream-skin/sidebar-pattern.png`

**Interfaces:**
- Consumes: R.P.D. 档案/实验室纹理方向、主题黑曜灰/冷蓝/警戒红配色。
- Produces: 一张低对比、可平铺、无人物和文字的 1024×1024 PNG。

- [ ] **Step 1: 用内置 ImageGen 生成侧栏纹理候选**

使用以下提示词；不要生成角色肖像或海报式构图：

```text
Use case: stylized-concept
Asset type: seamless low-contrast sidebar texture for a dark developer tool theme
Primary request: an abstract R.P.D.-inspired case-file and biological-lab texture, not a character portrait
Scene/backdrop: deep obsidian and ink-blue field with faint dossier grids, thin case-file lines, restrained warning chevrons, quiet laboratory glass marks, and sparse red signal points
Subject: no person, no face, no character, no focal object
Style/medium: refined flat-digital texture with gentle depth, suitable for repeated tiling behind navigation labels
Composition/framing: square tile; evenly distributed texture; no center focal point; edges must not show an obvious seam
Lighting/mood: dark, calm, translucent, low contrast, focused
Color palette: #090B0F, #12171D, #1B242B, #4C6470, low-opacity #C4434D, tiny #D59A58 accents
Materials/textures: faint glass lines, paper-like dossier grain, subtle procedural marks, never noisy
Text (verbatim): none
Constraints: no person, no face, no hair, no logo, no official emblem, no watermark, no letters, no numbers, no bright focal point, no white blocks, no heavy noise
Avoid: character art, poster composition, strong contrast, large symbols, visible checkerboard, visible tile seam
```

- [ ] **Step 2: 检查并复制纹理**

检查候选没有人物、脸部、文字、数字或明显焦点，并且四边视觉连续。将选定候选复制为 `assets/resident-evil-dream-skin/sidebar-pattern.png`；如尺寸不为 1024×1024，等比裁切后再运行：

```bash
file assets/resident-evil-dream-skin/sidebar-pattern.png
```

预期输出包含 `PNG image data, 1024 x 1024`。若检查失败，重新生成或替换候选，不修改已确认的主背景。

- [ ] **Step 3: 运行专项测试观察图片断言进度**

```bash
node --test tests/resident-evil-theme.test.mjs
```

预期：图片尺寸相关断言通过；元数据、CSS、validator 或 ZIP 断言可以继续因对应文件尚未创建而失败。若测试出现语法错误，先修复测试或路径，不继续生成配置。

---

### Task 4: 创建主题元数据和安全 CSS

**Files:**
- Create: `assets/resident-evil-dream-skin/theme.json`
- Create: `assets/resident-evil-dream-skin/theme.css`

**Interfaces:**
- Consumes: 已确认的 `background.png`、`sidebar-pattern.png` 和 Task 1 的契约测试。
- Produces: 可被现有 validator 和 renderer 消费的固定主题配置与安全 CSS。

- [ ] **Step 1: 写入固定 `theme.json`**

写入下面的 UTF-8 JSON，使用 2 个空格缩进和末尾换行；不添加 validator 未允许的字段：

```json
{
  "schemaVersion": 1,
  "id": "resident-evil-rpd",
  "name": "Resident Evil R.P.D. Night Watch",
  "brandSubtitle": "R.P.D. SURVIVAL UNIT",
  "tagline": "Cold streets. Red signals. Keep moving.",
  "projectPrefix": "选择项目 · ",
  "projectLabel": "◉  选择项目",
  "statusText": "R.P.D. SIGNAL ONLINE",
  "quote": "SURVIVE THE NIGHT",
  "image": "background.png",
  "sidebarImage": "sidebar-pattern.png",
  "appearance": "dark",
  "art": {
    "focusX": 0.82,
    "focusY": 0.48,
    "safeArea": "left",
    "taskMode": "ambient"
  },
  "colors": {
    "background": "#090B0F",
    "panel": "#12171D",
    "panelAlt": "#1B242B",
    "accent": "#C4434D",
    "accentAlt": "#E06B64",
    "secondary": "#4C6470",
    "highlight": "#D59A58",
    "text": "#F0ECE6",
    "muted": "#A4AFB3",
    "line": "rgba(196, 67, 77, .30)"
  }
}
```

- [ ] **Step 2: 写入固定 `theme.css`**

写入下面的安全 CSS，不增加选择器、外部依赖、布局声明或图像重置：

```css
[data-ds-part="root"] {
  background-color: #090b0f;
  color: #f0ece6;
}

[data-ds-part="sidebar"] {
  background-color: #12171d;
  border-right-color: #4c6470;
}
```

- [ ] **Step 3: 运行对比度检查**

用以下 Node 内联脚本计算主文字和次要文字相对于面板色的 WCAG 对比度：

```bash
node --input-type=module -e '
const colors = { panel: "#12171D", text: "#F0ECE6", muted: "#A4AFB3" };
const linear = (hex) => hex.match(/[0-9a-f]{2}/gi).map((pair) => parseInt(pair, 16) / 255).map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => { const [r, g, b] = linear(hex); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (foreground, background) => { const light = Math.max(luminance(foreground), luminance(background)); const dark = Math.min(luminance(foreground), luminance(background)); return (light + 0.05) / (dark + 0.05); };
console.log(JSON.stringify({ text: ratio(colors.text, colors.panel), muted: ratio(colors.muted, colors.panel) }));
'
```

预期：`text` 至少为 `4.5`，`muted` 至少为 `3`。若失败，只调整 `muted` 或面板颜色并同步 `theme.json`、测试预期和设计记录，不改变背景构图或主题 ID。

- [ ] **Step 4: 运行源目录专项测试**

```bash
node --test tests/resident-evil-theme.test.mjs
```

预期：元数据、图片尺寸、CSS 和源目录 validator 这 4 个测试通过；ZIP 测试在 ZIP 尚未创建时仍然红灯，不能把该阶段描述为全绿。

---

### Task 5: 打包并验证可离线导入 ZIP

**Files:**
- Create: `Resident-Evil-RPD-Dream-Skin.zip`
- Read: `assets/resident-evil-dream-skin/{background.png,sidebar-pattern.png,theme.css,theme.json}`

**Interfaces:**
- Consumes: 已通过源目录专项测试的四个主题文件。
- Produces: 根目录直接含四个文件、无额外元数据的离线 ZIP。

- [ ] **Step 1: 生成临时 ZIP 候选**

使用显式文件列表，不递归打包整个目录：

```bash
zip_stage_dir="$(mktemp -d "${TMPDIR:-/tmp}/resident-evil-rpd-zip.XXXXXX")"
/usr/bin/zip -X -j "$zip_stage_dir/Resident-Evil-RPD-Dream-Skin.zip" \
  assets/resident-evil-dream-skin/background.png \
  assets/resident-evil-dream-skin/sidebar-pattern.png \
  assets/resident-evil-dream-skin/theme.css \
  assets/resident-evil-dream-skin/theme.json
```

在移动候选前确认仓库根目录没有无法确认来源的同名 ZIP；若存在旧候选，先用 `git status --short` 和 `unzip -Z1` 确认它属于本次主题，再用已验证的新候选替换。不要覆盖其他主题 ZIP。

- [ ] **Step 2: 检查临时 ZIP 清单与完整性**

```bash
/usr/bin/unzip -Z1 "$zip_stage_dir/Resident-Evil-RPD-Dream-Skin.zip" | sort
/usr/bin/unzip -t "$zip_stage_dir/Resident-Evil-RPD-Dream-Skin.zip"
```

预期清单严格为：

```text
background.png
sidebar-pattern.png
theme.css
theme.json
```

且 `unzip -t` 退出码为 0。检查通过后再移动到仓库根目录，并清理空的临时目录：

```bash
mv "$zip_stage_dir/Resident-Evil-RPD-Dream-Skin.zip" ./Resident-Evil-RPD-Dream-Skin.zip
rmdir "$zip_stage_dir"
```

- [ ] **Step 3: 运行 ZIP/源目录一致性专项测试**

```bash
node --test tests/resident-evil-theme.test.mjs
```

预期：5 个测试全部通过；测试会逐个比较 ZIP 成员与源目录文件的字节内容。

- [ ] **Step 4: 提交主题资源和 ZIP**

```bash
git add assets/resident-evil-dream-skin Resident-Evil-RPD-Dream-Skin.zip
git commit -m "新增生化危机 R.P.D. 可导入主题"
```

仅在用户确认主背景、专项测试全绿且 ZIP 完整性通过后提交，不把预览候选或临时文件加入 Git。

---

### Task 6: 完成全量验证和变更边界检查

**Files:**
- Read: `docs/superpowers/specs/2026-08-11-resident-evil-rpd-dream-skin-design.md`
- Read: `docs/superpowers/plans/2026-08-11-resident-evil-rpd-dream-skin.md`
- Read: `git diff` and `git status`

**Interfaces:**
- Consumes: 已提交的主题资源、专项测试、主题 validator 和现有回归测试。
- Produces: 可复核的验证结果和只包含本主题范围的工作区。

- [ ] **Step 1: 运行专项验证命令**

```bash
node --test tests/resident-evil-theme.test.mjs
git diff --check
file assets/resident-evil-dream-skin/background.png assets/resident-evil-dream-skin/sidebar-pattern.png
/usr/bin/unzip -t Resident-Evil-RPD-Dream-Skin.zip
/usr/bin/unzip -Z1 Resident-Evil-RPD-Dream-Skin.zip | sort
```

预期：5 个专项测试通过、`git diff --check` 无输出、两张 PNG 尺寸正确、ZIP 完整性退出码为 0、ZIP 清单严格为四个根文件。

- [ ] **Step 2: 运行全量回归测试**

```bash
node --test tests/*.test.mjs
```

如果测试因 `CODEX_DREAM_SKIN_ENGINE_DIR` 未配置或目标 Dream Skin 引擎缺失而受限，记录完整错误和受限测试；与本主题无关的环境限制不能被描述为主题失败。若出现主题相关失败，先修复并重新运行全量测试。

- [ ] **Step 3: 检查变更边界和提交内容**

```bash
git status --short --branch
git diff HEAD~1..HEAD --stat
git diff HEAD~1..HEAD -- install-macos.sh patches/engine assets/nergigante-dream-skin assets/hatsune-miku-dream-skin
```

预期：当前分支仍为 `master`；最终主题提交只包含 `assets/resident-evil-dream-skin/`、`Resident-Evil-RPD-Dream-Skin.zip` 和主题专项测试；安装器、引擎补丁与其他主题没有变更。若设计/规划文档已在前置提交中存在，不重复修改或打包预览候选。

- [ ] **Step 4: 更新规划记录**

在 `task_plan.md` 中将 Phase 3–5 更新为实际状态，在 `findings.md` 记录用户最终确认的背景候选和任何尺寸/validator 结果，在 `progress.md` 记录每个命令的实际输出和外部引擎测试限制。规划记录不得写入未验证的“应该通过”等判断，只记录命令和真实结果。

---

## Self-Review Checklist

- [x] 主题目录、主题 ID、名称、图片尺寸、颜色、CSS 规则和 ZIP 名称与已确认设计规格一致。
- [x] 主背景生成任务明确要求先展示给用户，且提供不覆盖旧候选的重生成路径。
- [x] 测试任务包含实际测试代码、红灯命令和通过条件。
- [x] 图片任务给出完整 ImageGen 提示词和明确的视觉检查条件。
- [x] 配置任务给出完整 JSON、CSS 和对比度命令。
- [x] 打包任务使用显式四文件列表，并验证 ZIP 清单、完整性和字节一致性。
- [x] 全量验证任务记录外部 Dream Skin 引擎缺失时的受限处理，不把环境缺失当作通过。
- [x] 计划未要求修改安装器、引擎补丁或既有主题。
- [x] 所有任务均有明确文件边界、输入/输出接口和可执行命令。
