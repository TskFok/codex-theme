# Final Fantasy VII Remake Flowerfield Dusk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增一套以蒂法与艾丽斯为核心、可离线导入的 Final Fantasy VII Remake Flowerfield Dusk 主题。

**Architecture:** 新主题使用独立资源目录和根目录 ZIP，复用已有 `theme.json`、安全 `theme.css`、PNG 尺寸约束、主题 validator 与专项测试模式。已确认的主背景只复制并规范化尺寸，侧栏纹理单独生成，避免改动既有主题和引擎逻辑。

**Tech Stack:** PNG、JSON、受限 CSS、Node.js `node:test`、现有主题校验器、macOS `sips`、`zip`/`unzip`。

## Global Constraints

- 默认在当前 `master` 分支修改，不新建分支。
- 用户确认的花田黄昏主背景必须作为最终 `background.png`，不覆盖原始生成候选。
- 主背景尺寸固定为 1920×1080；侧栏纹理尺寸固定为 1024×1024。
- 主题源目录和 ZIP 都只能包含 `background.png`、`sidebar-pattern.png`、`theme.css`、`theme.json`。
- 不修改现有主题、安装器或 `patches/engine/`。
- 测试先于主题配置和 ZIP；提交信息如需提交必须使用简体中文。

## 文件结构

- Create: `assets/final-fantasy-vii-remake-dream-skin/background.png` — 用户确认的花田黄昏主背景。
- Create: `assets/final-fantasy-vii-remake-dream-skin/sidebar-pattern.png` — 低对比花瓣与暮色抽象纹理。
- Create: `assets/final-fantasy-vii-remake-dream-skin/theme.json` — 主题元数据、艺术定位和颜色。
- Create: `assets/final-fantasy-vii-remake-dream-skin/theme.css` — 两条安全 CSS 规则。
- Create: `Final-Fantasy-VII-Remake-Dream-Skin.zip` — 四文件根目录离线导入包。
- Create: `tests/final-fantasy-vii-theme.test.mjs` — 主题契约与打包一致性测试。
- Create: `docs/superpowers/specs/2026-08-12-final-fantasy-vii-remake-dream-skin-design.md` — 已确认设计规格。

### Task 1: 写入专项契约测试并确认红灯

**Files:**
- Create: `tests/final-fantasy-vii-theme.test.mjs`

- [ ] **Step 1: 写测试**

覆盖主题元数据、两张 PNG 尺寸、固定 CSS、源目录 validator，以及 ZIP 根清单和成员字节一致性。

- [ ] **Step 2: 运行红灯**

运行 `node --test tests/final-fantasy-vii-theme.test.mjs`；预期因新主题目录和 ZIP 尚不存在而失败，失败原因必须指向目标资源缺失。

### Task 2: 整理主背景并生成侧栏纹理

**Files:**
- Create: `assets/final-fantasy-vii-remake-dream-skin/background.png`
- Create: `assets/final-fantasy-vii-remake-dream-skin/sidebar-pattern.png`

- [ ] **Step 1: 复制确认背景候选**

将已确认的生成图复制到临时处理路径，使用 `sips -z 1080 1920` 生成 1920×1080 PNG；不修改生成目录原图。

- [ ] **Step 2: 生成侧栏纹理**

使用内置 ImageGen 生成无人物、无文字、低对比、适合平铺的花瓣/草线/暮色抽象纹理。

- [ ] **Step 3: 检查图片**

使用 `file` 检查 PNG 类型和尺寸，使用图像查看确认主背景左侧安全区与侧栏纹理无明显焦点。

### Task 3: 创建主题配置并通过源目录校验

**Files:**
- Create: `assets/final-fantasy-vii-remake-dream-skin/theme.json`
- Create: `assets/final-fantasy-vii-remake-dream-skin/theme.css`

- [ ] **Step 1: 写入固定 JSON/CSS**

使用设计规格中的 `ff7-remake-flowerfield` 元数据、`#211B2A` 暮色底色、玫瑰粉强调色和两条安全 CSS 规则。

- [ ] **Step 2: 运行专项测试**

运行专项测试，确认元数据、尺寸、CSS 和源目录 validator 通过；若 ZIP 尚未生成，仅允许 ZIP 断言暂时失败。

### Task 4: 打包并验证离线 ZIP

**Files:**
- Create: `Final-Fantasy-VII-Remake-Dream-Skin.zip`

- [ ] **Step 1: 显式四文件打包**

从主题目录执行 `zip -X -j`，只纳入四个固定文件，避免外层目录和隐藏文件进入 ZIP。

- [ ] **Step 2: 验证 ZIP**

运行 `unzip -Z1 Final-Fantasy-VII-Remake-Dream-Skin.zip`、`unzip -t` 和专项测试；预期清单严格为四个根文件且成员字节与源目录一致。

### Task 5: 全量验证与边界审查

**Files:**
- Verify only: `assets/final-fantasy-vii-remake-dream-skin/`, `Final-Fantasy-VII-Remake-Dream-Skin.zip`, `tests/final-fantasy-vii-theme.test.mjs`

- [ ] **Step 1: 运行全量测试**

运行 `node --test tests/*.test.mjs`，记录完整通过数或明确外部引擎缺失原因。

- [ ] **Step 2: 检查变更边界**

运行 `git diff --check` 和 `git status --short`，确认没有改动既有主题、安装器或引擎补丁。
