# Sidebar Image Compiler Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve a theme's sidebar image when its safe CSS also sets a sidebar background color.

**Architecture:** The safe CSS compiler currently treats a sidebar color declaration as an instruction to erase all core background imagery. Narrow that behavior so it remains for main and home surfaces only. The regression test exercises the exported compiler with the same sidebar declaration used by the Nergigante theme and asserts that the generated runtime CSS retains no image-reset declaration.

**Tech Stack:** Node.js built-in test runner, ESM, local Codex Dream Skin engine.

## Global Constraints

- Only modify the local Dream Skin engine compiler and a focused workspace regression test.
- Preserve main and home background-image reset behavior.
- Do not alter the Codex application bundle.
- Verify both compiled CSS and the currently running Codex renderer after applying the theme.

---

### Task 1: Prevent sidebar color overrides from erasing the sidebar image

**Files:**
- Create: `tests/sidebar-background-color-regression.test.mjs`
- Modify: `/Users/ushopal/.codex/codex-dream-skin-studio/assets/safe-css-validator.mjs:6,529-534`

**Interfaces:**
- Consumes: `compileSafeCss(source)` exported by `safe-css-validator.mjs`.
- Produces: Runtime community-layer CSS that leaves `background-image` unspecified for `[data-ds-part="sidebar"]` color declarations.

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { compileSafeCss } from "/Users/ushopal/.codex/codex-dream-skin-studio/assets/safe-css-validator.mjs";

test("侧栏背景色不会清除主题侧栏图片", () => {
  const css = compileSafeCss('[data-ds-part="sidebar"] { background-color: #15131a; }');
  assert.doesNotMatch(css, /\[data-ds-part="sidebar"\][\s\S]*background-image:\s*none/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/sidebar-background-color-regression.test.mjs`

Expected: FAIL because `compileSafeCss` emits `background-image: none !important` for the sidebar rule.

- [ ] **Step 3: Write minimal implementation**

```js
const CORE_BACKGROUND_IMAGE_PARTS = new Set(["main", "home"]);
```

Keep the existing conditional compiler logic unchanged so only the sidebar is excluded from automatic image reset.

- [ ] **Step 4: Run focused tests to verify the compiler behavior**

Run: `node --test tests/sidebar-background-color-regression.test.mjs tests/sidebar-theme-support.test.mjs`

Expected: both tests PASS.


- [ ] **Step 5: Verify the live renderer**

Run: `/Users/ushopal/.codex/codex-dream-skin-studio/scripts/switch-theme-macos.sh --id nergigante-dark-ui`

Then query the local Codex renderer's computed sidebar style through its debug port.

Expected: the active sidebar has `background-image` with two layers, the second layer is the sidebar image Blob URL, and no matching community-layer sidebar rule contains `background-image: none`.
