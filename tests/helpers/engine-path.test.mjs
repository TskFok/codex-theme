import assert from "node:assert/strict";
import { mkdtemp, mkdir, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { resolveEngineDir, resolveEngineFile } from "./engine-path.mjs";

const requiredFile = "assets/dream-skin.css";

const withEngineDir = async (engineDir, run) => {
  const previous = process.env.CODEX_DREAM_SKIN_ENGINE_DIR;
  process.env.CODEX_DREAM_SKIN_ENGINE_DIR = engineDir;

  try {
    await run();
  } finally {
    if (previous === undefined) {
      delete process.env.CODEX_DREAM_SKIN_ENGINE_DIR;
    } else {
      process.env.CODEX_DREAM_SKIN_ENGINE_DIR = previous;
    }
  }
};

const createEngine = async () => {
  const engineDir = await mkdtemp(path.join(os.tmpdir(), "dream-skin-engine-"));
  const filePath = path.join(engineDir, requiredFile);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, "/* fixture */\n");
  return { engineDir, filePath };
};

test("环境变量覆盖默认引擎路径", async () => {
  const { engineDir, filePath } = await createEngine();

  await withEngineDir(engineDir, async () => {
    assert.equal(await resolveEngineDir(), engineDir);
    assert.equal(await resolveEngineFile(requiredFile), filePath);
  });
});

test("拒绝相对的引擎路径", async () => {
  await withEngineDir("relative/engine", async () => {
    await assert.rejects(resolveEngineDir(), /CODEX_DREAM_SKIN_ENGINE_DIR/);
  });
});

test("拒绝不存在的引擎目录", async () => {
  const missingDir = path.join(os.tmpdir(), "dream-skin-engine-missing");

  await withEngineDir(missingDir, async () => {
    await assert.rejects(resolveEngineDir(), /CODEX_DREAM_SKIN_ENGINE_DIR/);
  });
});

test("拒绝软链接的引擎目录和请求文件", async () => {
  const { engineDir, filePath } = await createEngine();
  const engineLink = `${engineDir}-link`;
  const linkedFile = path.join(engineDir, "assets/linked.css");
  await symlink(engineDir, engineLink);
  await symlink(filePath, linkedFile);

  await withEngineDir(engineLink, async () => {
    await assert.rejects(resolveEngineDir(), /CODEX_DREAM_SKIN_ENGINE_DIR/);
  });

  await withEngineDir(engineDir, async () => {
    await assert.rejects(resolveEngineFile("assets/linked.css"), /软链接/);
  });
});
