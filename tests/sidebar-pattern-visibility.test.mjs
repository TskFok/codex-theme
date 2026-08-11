import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const cssPath = "/Users/ushopal/.codex/codex-dream-skin-studio/assets/dream-skin.css";

test("侧栏图案以普通图层叠加，避免被 soft-light 压暗", async () => {
  const source = await readFile(cssPath, "utf8");
  const sidebarLayers = source.match(
    /var\(--dream-skin-sidebar-art, none\) !important;[\s\S]*?background-blend-mode:\s*[^;]+;/g,
  ) ?? [];

  assert.ok(sidebarLayers.length >= 6, "应覆盖所有侧栏图片规则");
  for (const layer of sidebarLayers) {
    assert.match(layer, /background-blend-mode:\s*normal, normal/);
  }
});

test("深色 ambient 任务模式为侧栏图案保留足够亮度", async () => {
  const source = await readFile(cssPath, "utf8");

  assert.match(source, /--ds-task-immersive-sidebar:\s*rgb\(var\(--ds-panel-rgb\) \/ \.46\)/);
  assert.match(source, /--ds-task-immersive-edge:\s*rgb\(var\(--ds-bg-rgb\) \/ \.58\)/);
});
