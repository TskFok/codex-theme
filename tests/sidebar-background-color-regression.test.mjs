import assert from "node:assert/strict";
import test from "node:test";

import { compileSafeCss } from "/Users/ushopal/.codex/codex-dream-skin-studio/assets/safe-css-validator.mjs";

test("侧栏背景色不会清除主题侧栏图片", () => {
  const css = compileSafeCss(
    '[data-ds-part="sidebar"] { background-color: #15131a; }',
  );

  assert.doesNotMatch(
    css,
    /\[data-ds-part="sidebar"\][\s\S]*background-image:\s*none/,
  );
});
