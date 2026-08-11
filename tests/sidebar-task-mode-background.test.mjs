import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { resolveEngineFile } from "./helpers/engine-path.mjs";

const sidebarImage = /var\(--dream-skin-sidebar-art, none\)/;

const taskSidebarRule = (source, mode) => {
  const pattern = new RegExp(
    `data-dream-task-mode="${mode}"[\\s\\S]*?aside\\.app-shell-left-panel \\{([\\s\\S]*?)\\n\\}`,
  );
  const match = source.match(pattern);
  assert.ok(match, `应找到 ${mode} 宽屏任务模式的侧栏规则`);
  return match[1];
};

test("宽屏 full 任务模式的侧栏保留图案层", async () => {
  const source = await readFile(await resolveEngineFile("assets/dream-skin.css"), "utf8");
  assert.match(taskSidebarRule(source, "full"), sidebarImage);
});

test("宽屏 ambient 任务模式的侧栏保留图案层", async () => {
  const source = await readFile(await resolveEngineFile("assets/dream-skin.css"), "utf8");
  assert.match(taskSidebarRule(source, "ambient"), sidebarImage);
});
