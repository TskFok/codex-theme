import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, cpSync, existsSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const engineRoot = "/Users/ushopal/.codex/codex-dream-skin-studio";
const validator = path.join(engineRoot, "assets/theme-package-validator.mjs");
const background = path.join(repoRoot, "assets/nergigante-dream-skin/background.png");
const sidebarPattern = path.join(repoRoot, "assets/nergigante-dream-skin/sidebar-pattern.png");

test("主题包应安全接受并 staging 侧栏图片资源", () => {
  const source = mkdtempSync(path.join(os.tmpdir(), "dream-skin-sidebar-source-"));
  const stage = mkdtempSync(path.join(os.tmpdir(), "dream-skin-sidebar-stage-"));
  writeFileSync(path.join(source, "theme.json"), `${JSON.stringify({
    schemaVersion: 1,
    id: "sidebar-image-fixture",
    name: "Sidebar Image Fixture",
    image: "background.png",
    sidebarImage: "sidebar-pattern.png",
  })}\n`);
  writeFileSync(path.join(source, "theme.css"), "[data-ds-part=\"sidebar\"] { background-color: #15131a; }\n");
  cpSync(background, path.join(source, "background.png"));
  cpSync(sidebarPattern, path.join(source, "sidebar-pattern.png"));

  execFileSync(process.execPath, [
    validator,
    "--source", source,
    "--stage", stage,
    "--platform", "macos",
    "--client-version", "1.5.12",
  ], { encoding: "utf8", stdio: "pipe" });

  assert.equal(existsSync(path.join(stage, "sidebar-pattern.png")), true);
});
