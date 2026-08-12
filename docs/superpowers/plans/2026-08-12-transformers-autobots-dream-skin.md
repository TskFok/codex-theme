# Transformers Autobots Cinematic Dream Skin 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在当前分支新增一套以擎天柱/汽车人为明确识别点、电影级金属质感的 Codex Dream Skin 主题，并产出可离线导入的 ZIP。

**Architecture:** 主题复用仓库已验证的简化四文件契约：主题目录包含 `background.png`、`sidebar-pattern.png`、`theme.json`、`theme.css`；根目录 ZIP 使用显式文件列表且成员与源文件保持字节一致。主背景使用用户确认的已生成图，主体固定在右侧、左侧保持深色 UI 安全区；侧栏使用独立的低对比机械金属抽象纹理。

**Tech Stack:** PNG 资源、JSON、受限 CSS、Node.js `node:test`、现有主题 validator、macOS `sips`、`zip`/`unzip`、Git。

## 全局约束

- 默认在当前 `master` 分支修改，不新建分支。
- 只新增 Transformers 主题资源、专项测试、设计/计划记录、README 条目和主题 ZIP。
- 主题源目录与 ZIP 只能包含 `background.png`、`sidebar-pattern.png`、`theme.css`、`theme.json`。
- `background.png` 必须为 1920×1080 PNG；`sidebar-pattern.png` 必须为 1024×1024 PNG。
- 主背景为用户已确认的擎天柱/汽车人画面：右侧主体，左侧暗色低细节安全区；不得重新生成或改写已确认背景。
- 不新增文字、水印、界面控件或额外角色；侧栏纹理不出现完整人物、脸部、武器、徽标或可读文字。
- CSS 只包含 `[data-ds-part="root"]` 与 `[data-ds-part="sidebar"]` 两组安全规则。
- 禁止在循环遍历中查询 SQL；本任务不引入 SQL。
- Git 提交信息必须使用简体中文。

---

### Task 1: 建立 Transformers 主题契约测试

**Files:**
- Create: `tests/transformers-autobots-theme.test.mjs`
- Read: `tests/devil-may-cry-5-theme.test.mjs`

**Interfaces:**
- Consumes: 未来的 `assets/transformers-autobots-dream-skin/` 与根目录 `Transformers-Autobots-Dream-Skin.zip`。
- Produces: 主题元数据、PNG 尺寸、CSS 安全规则、validator、ZIP 清单与字节一致性断言。

- [ ] **Step 1: 创建专项测试，固定主题契约。**

测试必须检查：

```js
const themeRoot = path.join(repoRoot, "assets", "transformers-autobots-dream-skin");
const zipPath = path.join(repoRoot, "Transformers-Autobots-Dream-Skin.zip");
const expectedFiles = ["background.png", "sidebar-pattern.png", "theme.css", "theme.json"];
const expectedColors = {
  background: "#080C13",
  panel: "#111A25",
  panelAlt: "#1D2A38",
  accent: "#2E78B7",
  accentAlt: "#7CB6E8",
  secondary: "#4B6175",
  highlight: "#D18A48",
  text: "#E9F0F5",
  muted: "#9EAFBC",
  line: "rgba(46, 120, 183, .30)",
};
```

主题固定元数据：

```js
theme.schemaVersion === 1
theme.id === "transformers-autobots-cinematic"
theme.name === "Transformers Autobots Cinematic"
theme.brandSubtitle === "AUTOBOT COMMAND NETWORK"
theme.tagline === "Freedom is built from steel and resolve."
theme.statusText === "AUTOBOT SIGNAL ONLINE"
theme.quote === "ROLL OUT. STAY THE COURSE."
theme.image === "background.png"
theme.sidebarImage === "sidebar-pattern.png"
theme.appearance === "dark"
theme.art === { focusX: 0.82, focusY: 0.46, safeArea: "left", taskMode: "ambient" }
```

CSS 断言必须精确匹配：

```css
[data-ds-part="root"] {
  background-color: #080c13;
  color: #e9f0f5;
}

[data-ds-part="sidebar"] {
  background-color: #111a25;
  border-right-color: #4b6175;
}
```

图片断言读取 PNG IHDR，背景要求 `1920×1080`，侧栏要求 `1024×1024`；validator 使用 macOS、client-version `1.5.12`；ZIP 只允许四个根文件，并逐个比较 ZIP 成员与源文件字节。

- [ ] **Step 2: 先运行专项测试确认红灯。**

运行：

```bash
node --test tests/transformers-autobots-theme.test.mjs
```

预期：测试文件可收集，但因主题资源目录及 ZIP 尚未创建而失败；失败原因应是缺少目标资源，而非语法错误。

---

### Task 2: 落盘用户确认的主背景

**Files:**
- Source: `/Users/ushopal/.codex/generated_images/019ff4cd-0c74-7452-b3a7-cad6f447214f/exec-3d762972-323b-4a99-9667-cedfb7c2d6ba.png`
- Create: `assets/transformers-autobots-dream-skin/background.png`

**Interfaces:**
- Consumes: 用户已确认的 ImageGen 背景。
- Produces: 主题所需的非透明 1920×1080 PNG。

- [ ] **Step 1: 验证源文件并创建主题目录。**

```bash
test -f /Users/ushopal/.codex/generated_images/019ff4cd-0c74-7452-b3a7-cad6f447214f/exec-3d762972-323b-4a99-9667-cedfb7c2d6ba.png
file /Users/ushopal/.codex/generated_images/019ff4cd-0c74-7452-b3a7-cad6f447214f/exec-3d762972-323b-4a99-9667-cedfb7c2d6ba.png
mkdir -p assets/transformers-autobots-dream-skin
```

- [ ] **Step 2: 复制已是 1920×1080 的确认背景，不裁剪、不镜像、不重绘。**

```bash
cp /Users/ushopal/.codex/generated_images/019ff4cd-0c74-7452-b3a7-cad6f447214f/exec-3d762972-323b-4a99-9667-cedfb7c2d6ba.png \
  assets/transformers-autobots-dream-skin/background.png
file assets/transformers-autobots-dream-skin/background.png
```

---

### Task 3: 生成并规范化侧栏纹理

**Files:**
- Create: `assets/transformers-autobots-dream-skin/sidebar-pattern.png`
- Temporary: ImageGen 返回的侧栏纹理候选

**Interfaces:**
- Consumes: 主背景的枪灰、钢蓝、汽车人红色金属基调。
- Produces: 1024×1024、低对比、适合平铺的抽象机械纹理。

- [ ] **Step 1: 使用内置 ImageGen 生成侧栏纹理。**

```text
Use case: stylized-concept
Asset type: 1024x1024 low-contrast tiled sidebar texture for a dark desktop UI theme
Primary request: Create an abstract, seamless-feeling mechanical metal texture inspired by a cinematic Autobot command interface.
Scene/backdrop: near-black graphite alloy surface with overlapping armor plates, shallow panel seams, tiny rivets, subtle machined grooves, faint rain-streaked steel, and very soft blue-gray haze.
Style/medium: photorealistic live-action VFX material study, restrained and tile-friendly.
Composition/framing: no central object or emblem; visual weight distributed evenly; no perspective lines that create a focal point; suitable for low-contrast sidebar tiling.
Lighting/mood: near-black ambient light, soft cool-blue reflections, barely visible muted red edge accents, no bright hotspot.
Color palette: graphite black, gunmetal, desaturated steel blue, muted Autobot red, tiny amber-brown wear marks.
Constraints: no characters, faces, weapons, vehicle silhouettes, logos, text, numbers, symbols, signatures, watermark, border, bright center, neon, or readable markings; avoid obvious repetition seams.
```

- [ ] **Step 2: 检查候选并复制为 1024×1024 PNG。**

确认无人物、脸部、武器、车辆轮廓、徽标、文字、水印、中心高亮和明显拼接边界；然后使用 `sips` 规范化：

```bash
/usr/bin/sips -s format png -z 1024 1024 <侧栏候选路径> \
  --out assets/transformers-autobots-dream-skin/sidebar-pattern.png
file assets/transformers-autobots-dream-skin/sidebar-pattern.png
```

---

### Task 4: 写入主题配置与安全 CSS

**Files:**
- Create: `assets/transformers-autobots-dream-skin/theme.json`
- Create: `assets/transformers-autobots-dream-skin/theme.css`

**Interfaces:**
- Consumes: 两张规范化 PNG。
- Produces: validator 可接受的四文件源主题。

- [ ] **Step 1: 使用 `apply_patch` 创建 `theme.json`。**

写入 Task 1 固定的全部字段；颜色对象必须与 `expectedColors` 完全一致，引用文件必须存在。

- [ ] **Step 2: 使用 `apply_patch` 创建 `theme.css`。**

CSS 必须精确匹配：

```css
[data-ds-part="root"] {
  background-color: #080c13;
  color: #e9f0f5;
}

[data-ds-part="sidebar"] {
  background-color: #111a25;
  border-right-color: #4b6175;
}
```

- [ ] **Step 3: 运行源目录专项测试和 validator。**

```bash
node --test tests/transformers-autobots-theme.test.mjs
stage_dir="$(mktemp -d /tmp/transformers-autobots-stage.XXXXXX)"
node patches/engine/assets/theme-package-validator.mjs \
  --source assets/transformers-autobots-dream-skin \
  --stage "$stage_dir" \
  --platform macos \
  --client-version 1.5.12
rm -rf "$stage_dir"
```

预期：源目录文件、图片尺寸、JSON、CSS 和 validator 通过；ZIP 断言在打包前暂时失败。

---

### Task 5: 打包主题 ZIP 并验证

**Files:**
- Create: `Transformers-Autobots-Dream-Skin.zip`

**Interfaces:**
- Consumes: 已通过 validator 的四文件源目录。
- Produces: 只有四个根文件、与源文件字节一致的 ZIP。

- [ ] **Step 1: 使用显式文件列表打包。**

```bash
/usr/bin/zip -X -q Transformers-Autobots-Dream-Skin.zip -j \
  assets/transformers-autobots-dream-skin/background.png \
  assets/transformers-autobots-dream-skin/sidebar-pattern.png \
  assets/transformers-autobots-dream-skin/theme.css \
  assets/transformers-autobots-dream-skin/theme.json
```

- [ ] **Step 2: 验证 ZIP 完整性、成员清单和专项测试。**

```bash
/usr/bin/unzip -t Transformers-Autobots-Dream-Skin.zip
/usr/bin/unzip -Z1 Transformers-Autobots-Dream-Skin.zip | sort
node --test tests/transformers-autobots-theme.test.mjs
```

期望清单：

```text
background.png
sidebar-pattern.png
theme.css
theme.json
```

---

### Task 6: 更新 README 并执行全量验收

**Files:**
- Modify: `README.md`
- Verify: 主题源目录、主题 ZIP、专项测试与全量测试

**Interfaces:**
- Consumes: 已验证的主题包。
- Produces: README 主题列表、全量回归结果和交付范围检查。

- [ ] **Step 1: 使用 `apply_patch` 在 README 顶部数量与主题表新增一行。**

将主题数量从 6 个更新为 7 个，并添加：

```markdown
| [`Transformers-Autobots-Dream-Skin.zip`](Transformers-Autobots-Dream-Skin.zip) | Transformers Autobots Cinematic | `transformers-autobots-cinematic` | `assets/transformers-autobots-dream-skin/` |
```

- [ ] **Step 2: 执行最终验证。**

```bash
file assets/transformers-autobots-dream-skin/background.png assets/transformers-autobots-dream-skin/sidebar-pattern.png
/usr/bin/unzip -t Transformers-Autobots-Dream-Skin.zip
node --test tests/transformers-autobots-theme.test.mjs
node --test tests/*.test.mjs
git diff --check
```

若全量测试因本机缺少外部 Dream Skin 引擎而失败，只记录确切失败信息，不改动无关代码。

- [ ] **Step 3: 检查交付范围和 ZIP/源文件字节一致性。**

```bash
git status --short
git diff --stat
for name in background.png sidebar-pattern.png theme.css theme.json; do
  cmp -s "assets/transformers-autobots-dream-skin/$name" <(/usr/bin/unzip -p Transformers-Autobots-Dream-Skin.zip "$name")
done
```

预期：变更仅涉及本主题资源、专项测试、README 和主题 ZIP；ZIP 成员逐个与源文件一致。

