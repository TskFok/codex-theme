import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const cssPath = "/Users/ushopal/.codex/codex-dream-skin-studio/assets/dream-skin.css";

test("主题不在顶部生成名称与品牌标识", async () => {
  const source = await readFile(cssPath, "utf8");
  const marker = 'main:is(.main-surface, [data-app-shell-main-surface], [class*="_MainContentSurface_"]):not(:has([role="main"])) > header';
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, "应找到主题标题伪元素规则");
  const rule = source.slice(start, source.indexOf("\n}", start) + 2);

  assert.match(rule, /content:\s*none\s*!important/);
});

test("主题不在顶部生成在线状态标识", async () => {
  const source = await readFile(cssPath, "utf8");
  const marker = 'main:is(.main-surface, [data-app-shell-main-surface], [class*="_MainContentSurface_"]):not(:has([role="main"])) > header';
  const first = source.indexOf(marker);
  const start = source.indexOf(marker, first + marker.length);
  assert.notEqual(start, -1, "应找到主题状态伪元素规则");
  const rule = source.slice(start, source.indexOf("\n}", start) + 2);

  assert.match(rule, /content:\s*none\s*!important/);
});
