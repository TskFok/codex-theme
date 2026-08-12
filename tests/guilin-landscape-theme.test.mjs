import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const themeRoot = path.join(repoRoot, "assets", "guilin-landscape-dream-skin");
const zipPath = path.join(repoRoot, "Guilin-Landscape-Dream-Skin.zip");
const validator = path.join(repoRoot, "patches", "engine", "assets", "theme-package-validator.mjs");
const expectedFiles = ["background.png", "sidebar-pattern.png", "theme.css", "theme.json"];
const expectedColors = {
  background: "#EEF7F2",
  panel: "#FAFDFB",
  panelAlt: "#DDEFE7",
  accent: "#246D63",
  accentAlt: "#3D8979",
  secondary: "#4E6F76",
  highlight: "#9A6A32",
  text: "#173D39",
  muted: "#4A6664",
  line: "rgba(36, 109, 99, .26)",
};
const expectedCss = `[data-ds-part="root"] {
  background-color: #eef7f2;
  color: #173d39;
}

[data-ds-part="sidebar"] {
  background-color: #fafdfb;
  border-right-color: #4e6f76;
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

test("桂林山水主题元数据符合固定契约", () => {
  const theme = JSON.parse(readFileSync(path.join(themeRoot, "theme.json"), "utf8"));
  assert.equal(theme.schemaVersion, 1);
  assert.equal(theme.id, "guilin-li-river");
  assert.equal(theme.name, "Guilin Li River Morning Mist");
  assert.equal(theme.image, "background.png");
  assert.equal(theme.sidebarImage, "sidebar-pattern.png");
  assert.equal(theme.appearance, "light");
  assert.deepEqual(theme.art, {
    focusX: 0.8,
    focusY: 0.46,
    safeArea: "left",
    taskMode: "ambient",
  });
  assert.deepEqual(theme.colors, expectedColors);
});

test("桂林山水主题图片尺寸符合 Codex 背景契约", () => {
  assert.deepEqual(readPngDimensions(path.join(themeRoot, "background.png")), {
    width: 1920,
    height: 1080,
  });
  assert.deepEqual(readPngDimensions(path.join(themeRoot, "sidebar-pattern.png")), {
    width: 1024,
    height: 1024,
  });
});

test("桂林山水主题 CSS 只包含固定安全规则", () => {
  assert.equal(readFileSync(path.join(themeRoot, "theme.css"), "utf8"), expectedCss);
});

test("桂林山水主题源目录通过本地简化主题校验", () => {
  const stage = mkdtempSync(path.join(os.tmpdir(), "guilin-li-river-theme-stage-"));
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

test("桂林山水主题 ZIP 只有四个根文件且与源目录一致", () => {
  assert.deepEqual(zipNames(zipPath), expectedFiles);
  for (const name of expectedFiles) {
    assert.deepEqual(zipMember(zipPath, name), readFileSync(path.join(themeRoot, name)));
  }
});
