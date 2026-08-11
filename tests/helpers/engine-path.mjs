import { lstat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const DEFAULT_ENGINE_DIR = path.join(
  os.homedir(),
  ".codex",
  "codex-dream-skin-studio",
);

const engineDirError = (message) => new Error(
  `${message}。请设置 CODEX_DREAM_SKIN_ENGINE_DIR 为 Codex Dream Skin 引擎的绝对路径。`,
);

const requireRealDirectory = async (directory) => {
  if (!path.isAbsolute(directory)) {
    throw engineDirError("引擎路径必须是绝对路径");
  }

  const resolved = path.resolve(directory);
  let stats;
  try {
    stats = await lstat(resolved);
  } catch {
    throw engineDirError("引擎目录不存在");
  }

  if (stats.isSymbolicLink() || !stats.isDirectory()) {
    throw engineDirError("引擎路径必须是非软链接目录");
  }

  return resolved;
};

export const resolveEngineDir = async () => requireRealDirectory(
  process.env.CODEX_DREAM_SKIN_ENGINE_DIR ?? DEFAULT_ENGINE_DIR,
);

export const resolveEngineFile = async (relativePath) => {
  const engineDir = await resolveEngineDir();
  if (path.isAbsolute(relativePath)) {
    throw new Error("引擎文件路径必须相对于引擎目录");
  }

  const filePath = path.resolve(engineDir, relativePath);
  if (!filePath.startsWith(`${engineDir}${path.sep}`)) {
    throw new Error("引擎文件路径不能离开引擎目录");
  }

  let stats;
  try {
    stats = await lstat(filePath);
  } catch {
    throw new Error(`找不到引擎文件：${relativePath}`);
  }

  if (stats.isSymbolicLink() || !stats.isFile()) {
    throw new Error(`引擎文件不能是软链接：${relativePath}`);
  }

  return filePath;
};
