import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  chmod,
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INSTALLER = join(REPOSITORY_ROOT, "install-macos.sh");
const PATCH_FILES = [
  "assets/theme-package-validator.mjs",
  "assets/safe-css-validator.mjs",
  "assets/dream-skin.css",
  "assets/renderer-inject.js",
  "scripts/extract-theme-zip-macos.sh",
  "scripts/stage-theme.mjs",
  "scripts/theme-content-fingerprint.mjs",
  "scripts/publish-theme-import.mjs",
  "scripts/injector.mjs",
  "scripts/switch-theme-macos.sh",
];
const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

async function makeTemporaryDirectory(prefix) {
  const path = await mkdtemp(join(tmpdir(), prefix));
  temporaryDirectories.push(path);
  return path;
}

async function writeExecutable(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
  await chmod(path, 0o755);
}

async function makeFakeEngine({ importOutput } = {}) {
  const engineDir = await makeTemporaryDirectory("nergigante-engine-");

  for (const relativePath of PATCH_FILES) {
    const target = join(engineDir, relativePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, `original:${relativePath}\n`, "utf8");
  }

  const importResult = importOutput ?? JSON.stringify({
    id: "nergigante-dark-ui",
    contentFingerprint: "a".repeat(64),
  });
  await writeExecutable(
    join(engineDir, "scripts/import-theme-zip-macos.sh"),
    `#!/bin/zsh\nprintf '%s\\n' \"$*\" > \"$MOCK_IMPORT_LOG\"\nprintf '%s\\n' '${importResult}'\n`,
  );
  await writeExecutable(
    join(engineDir, "scripts/switch-theme-macos.sh"),
    "#!/bin/zsh\nprintf '%s\\n' \"$*\" > \"$MOCK_SWITCH_LOG\"\n",
  );
  await writeFile(join(engineDir, "assets/unrelated.txt"), "keep me\n", "utf8");

  return engineDir;
}

async function runInstaller(argumentsList, environment = {}) {
  try {
    const result = await execFileAsync("zsh", [INSTALLER, ...argumentsList], {
      cwd: REPOSITORY_ROOT,
      env: { ...process.env, ...environment },
    });
    return { code: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return {
      code: error.code ?? 1,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? "",
    };
  }
}

test("干运行仅输出十项白名单计划且不改动伪引擎", async () => {
  const engineDir = await makeFakeEngine();
  const switchLog = join(engineDir, "switch.log");
  const originalContents = new Map(
    await Promise.all(PATCH_FILES.map(async (relativePath) => [
      relativePath,
      await readFile(join(engineDir, relativePath), "utf8"),
    ])),
  );

  const result = await runInstaller(
    ["--engine-dir", engineDir, "--dry-run"],
    { MOCK_SWITCH_LOG: switchLog },
  );

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /干运行/);
  for (const relativePath of PATCH_FILES) {
    assert.match(result.stdout, new RegExp(relativePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(await readFile(join(engineDir, relativePath), "utf8"), originalContents.get(relativePath));
  }
  assert.doesNotMatch(result.stdout, /unrelated\.txt/);
  await assert.rejects(lstat(join(engineDir, ".nergigante-theme-backups")));
  await assert.rejects(lstat(switchLog));
});

test("拒绝相对引擎路径、缺失目标文件和软链接目标", async () => {
  const relativeResult = await runInstaller(["--engine-dir", "relative-engine", "--dry-run"]);
  assert.notEqual(relativeResult.code, 0);
  assert.match(relativeResult.stderr, /绝对路径/);

  const missingEngine = await makeFakeEngine();
  await unlink(join(missingEngine, "assets/dream-skin.css"));
  const missingResult = await runInstaller(["--engine-dir", missingEngine, "--dry-run"]);
  assert.notEqual(missingResult.code, 0);
  assert.match(missingResult.stderr, /缺少目标文件/);

  const linkedEngine = await makeFakeEngine();
  const linkedTarget = join(linkedEngine, "assets/renderer-inject.js");
  await unlink(linkedTarget);
  await symlink(join(linkedEngine, "assets/dream-skin.css"), linkedTarget);
  const linkedResult = await runInstaller(["--engine-dir", linkedEngine, "--dry-run"]);
  assert.notEqual(linkedResult.code, 0);
  assert.match(linkedResult.stderr, /软链接/);
});

test("帮助与不启用干运行计划说明 --no-apply", async () => {
  const helpResult = await runInstaller(["--help"]);
  assert.equal(helpResult.code, 0, helpResult.stderr);
  assert.match(helpResult.stdout, /--no-apply/);

  const engineDir = await makeFakeEngine();
  const dryRunResult = await runInstaller(["--engine-dir", engineDir, "--dry-run", "--no-apply"]);
  assert.equal(dryRunResult.code, 0, dryRunResult.stderr);
  assert.match(dryRunResult.stdout, /--no-apply/);
});

test("真实不启用安装备份并仅替换白名单文件", async () => {
  const engineDir = await makeFakeEngine();
  const switchLog = join(engineDir, "switch.log");
  const importLog = join(engineDir, "import.log");
  const result = await runInstaller(
    ["--engine-dir", engineDir, "--no-apply"],
    { MOCK_IMPORT_LOG: importLog, MOCK_SWITCH_LOG: switchLog },
  );

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /已跳过启用/);
  for (const relativePath of PATCH_FILES) {
    const patched = await readFile(join(engineDir, relativePath), "utf8");
    const expected = await readFile(join(REPOSITORY_ROOT, "patches/engine", relativePath), "utf8");
    assert.equal(patched, expected, relativePath);
  }
  assert.equal(await readFile(join(engineDir, "assets/unrelated.txt"), "utf8"), "keep me\n");
  assert.equal(
    await readFile(importLog, "utf8"),
    `--file ${join(REPOSITORY_ROOT, "assets/Nergigante-Dream-Skin.zip")}\n`,
  );
  await assert.rejects(lstat(switchLog));

  const backupRoot = join(engineDir, ".nergigante-theme-backups");
  const backupEntries = await readdir(backupRoot);
  assert.equal(backupEntries.length, 1);
  const backupFile = join(backupRoot, backupEntries[0], "assets/dream-skin.css");
  assert.equal(await readFile(backupFile, "utf8"), "original:assets/dream-skin.css\n");
});

test("导入返回的非法 JSON 使安装失败且保留备份", async () => {
  const engineDir = await makeFakeEngine({ importOutput: "not-json" });
  const result = await runInstaller(["--engine-dir", engineDir, "--no-apply"]);

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /JSON/);
  const backupEntries = await readdir(join(engineDir, ".nergigante-theme-backups"));
  assert.equal(backupEntries.length, 1);
});
