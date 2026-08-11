import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { resolveEngineFile } from "./helpers/engine-path.mjs";

test("侧栏背景色不会清除主题侧栏图片", async () => {
  const validatorPath = await resolveEngineFile("assets/safe-css-validator.mjs");
  const { compileSafeCss } = await import(pathToFileURL(validatorPath).href);
  const css = compileSafeCss(
    '[data-ds-part="sidebar"] { background-color: #15131a; }',
  );

  assert.doesNotMatch(
    css,
    /\[data-ds-part="sidebar"\][\s\S]*background-image:\s*none/,
  );
});
