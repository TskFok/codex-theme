import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const themeRoot = path.join(repoRoot, "assets", "final-fantasy-vii-remake-dream-skin");
const zipPath = path.join(repoRoot, "Final-Fantasy-VII-Remake-Dream-Skin.zip");
const validator = path.join(repoRoot, "patches", "engine", "assets", "theme-package-validator.mjs");
const expectedFiles = ["background.png", "sidebar-pattern.png", "theme.css", "theme.json"];
const expectedColors = {
  background: "#211B2A",
  panel: "#2B2232",
  panelAlt: "#3C2A3E",
  accent: "#D98997",
  accentAlt: "#F1B1A8",
  secondary: "#6D7B8D",
  highlight: "#D7AF63",
  text: "#F6EFEA",
  muted: "#C2B3B1",
  line: "rgba(217, 137, 151, .28)",
};
const expectedCss = `[data-ds-part="root"] {
  background-color: #211b2a;
  color: #f6efea;
}

[data-ds-part="sidebar"] {
  background-color: #2b2232;
  border-right-color: #6d7b8d;
}
`;

function readPngDimensions(filePath) {
  const bytes = readFileSync(filePath);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(bytes.toString("ascii", 12, 16), "IHDR");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function zipNames(filePath) {
  return execFileSync("/usr/bin/unzip", ["-Z1", filePath], { encoding: "utf8" })
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .sort();
}

function zipMember(filePath, member) {
  return execFileSync("/usr/bin/unzip", ["-p", filePath, member], {
    maxBuffer: 16 * 1024 * 1024,
  });
}

test("最终幻想 VII 重制版花田黄昏主题元数据符合固定契约", () => {
  const theme = JSON.parse(readFileSync(path.join(themeRoot, "theme.json"), "utf8"));
  assert.equal(theme.schemaVersion, 1);
  assert.equal(theme.id, "ff7-remake-flowerfield");
  assert.equal(theme.name, "Final Fantasy VII Remake Flowerfield Dusk");
  assert.equal(theme.image, "background.png");
  assert.equal(theme.sidebarImage, "sidebar-pattern.png");
  assert.equal(theme.appearance, "dark");
  assert.deepEqual(theme.art, {
    focusX: 0.80,
    focusY: 0.48,
    safeArea: "left",
    taskMode: "ambient",
  });
  assert.deepEqual(theme.colors, expectedColors);
});

test("最终幻想 VII 重制版花田黄昏主题图片尺寸符合 Codex 背景契约", () => {
  assert.deepEqual(readPngDimensions(path.join(themeRoot, "background.png")), {
    width: 1920,
    height: 1080,
  });
  assert.deepEqual(readPngDimensions(path.join(themeRoot, "sidebar-pattern.png")), {
    width: 1024,
    height: 1024,
  });
});

test("最终幻想 VII 重制版花田黄昏主题 CSS 只包含固定安全规则", () => {
  assert.equal(readFileSync(path.join(themeRoot, "theme.css"), "utf8"), expectedCss);
});

test("最终幻想 VII 重制版花田黄昏主题源目录通过本地简化主题校验", () => {
  const stage = mkdtempSync(path.join(os.tmpdir(), "ff7-remake-flowerfield-theme-stage-"));
  try {
    const output = execFileSync(process.execPath, [
      validator,
      "--source", themeRoot,
      "--stage", stage,
      "--platform", "macos",
      "--client-version", "1.5.12",
    ], { encoding: "utf8" });
    assert.match(output, /"format":"simple"/);
    for (const name of expectedFiles) assert.equal(existsSync(path.join(stage, name)), true);
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
});

test("最终幻想 VII 重制版花田黄昏主题 ZIP 只有四个根文件且与源目录一致", () => {
  assert.deepEqual(zipNames(zipPath), expectedFiles);
  for (const name of expectedFiles) {
    assert.deepEqual(zipMember(zipPath, name), readFileSync(path.join(themeRoot, name)));
  }
});
