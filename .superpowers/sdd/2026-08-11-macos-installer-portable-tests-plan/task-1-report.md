# Task 1 报告：可移植引擎路径解析与测试迁移

## 变更

- 新增 `tests/helpers/engine-path.mjs`：导出默认引擎路径、`resolveEngineDir()` 与 `resolveEngineFile(relativePath)`；只接受绝对存在的真实目录，拒绝引擎根目录及目标文件软链接，并在引擎目录错误中提示设置 `CODEX_DREAM_SKIN_ENGINE_DIR`。
- 新增 `tests/helpers/engine-path.test.mjs`：覆盖环境变量覆盖、相对路径、不存在目录、引擎根目录软链接与目标文件软链接。
- 迁移五个侧栏与主题回归测试：移除本机硬编码路径；读取引擎资源时使用路径助手；导入 `safe-css-validator.mjs` 时使用 `pathToFileURL(await resolveEngineFile(...))` 动态导入。

## 测试命令与输出摘要

1. `node --test tests/helpers/engine-path.test.mjs`
   - 初次执行：因 `engine-path.mjs` 尚未创建，以 `ERR_MODULE_NOT_FOUND` 失败，完成测试先行验证。
   - 实现后执行：4/4 通过。
2. `node --test tests/helpers/engine-path.test.mjs tests/*.test.mjs`
   - 12/12 通过，0 失败。
3. `CODEX_DREAM_SKIN_ENGINE_DIR=/Users/ushopal/.codex/codex-dream-skin-studio node --test tests/helpers/engine-path.test.mjs tests/*.test.mjs`
   - 12/12 通过，0 失败，确认环境变量指定的引擎路径生效。

## 自检

- `git diff --check` 通过，无空白错误。
- 对 Task 1 涉及的测试与助手目录执行硬编码路径检索，无匹配项。
- 本次仅暂存任务简报列出的测试文件、新路径助手及本报告；既有未跟踪的安装计划文件未纳入提交。

## 提交哈希

待创建提交后回填。

## 疑虑

暂无功能性疑虑。测试夹具使用系统临时目录，未主动清理；这不影响测试结果，临时文件由系统临时目录策略回收。
