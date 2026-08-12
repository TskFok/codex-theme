# Findings & Decisions

## Requirements

- 用户希望在项目中创建“生化危机”主题。
- 视觉内容以主角里昂和艾达王为主。
- 主题结构参考项目中的其他主题。
- 始终使用简体中文沟通；提交信息必须为简体中文。
- 默认修改当前分支，不新建分支。
- 主背景必须先交由用户审阅；若不满意，需要保留重生成路径，未确认的候选不得进入最终主题目录。

## Research Findings

- 当前仓库是 Codex Dream Skin 主题资源与 macOS 离线导入工具项目。
- `assets/hatsune-miku-dream-skin/` 与 `assets/nergigante-dream-skin/` 都采用 `theme.json`、`theme.css`、`background.png`、`sidebar-pattern.png`。
- `theme.json` 需要 `schemaVersion: 1`、`id`、`name`、`image`；项目主题还使用 `sidebarImage`、`appearance`、`art` 和 10 个颜色键。
- `theme.css` 当前仅使用 root 与 sidebar 两条安全颜色规则；校验器会拒绝不安全 CSS 和非主题根文件。
- 主题 ZIP 必须直接在根目录放置 `background.png`、`sidebar-pattern.png`、`theme.css`、`theme.json` 四个文件，不能包含外层目录、`.DS_Store` 或 `__MACOSX`。
- `tests/hatsune-miku-theme.test.mjs` 是最近主题专项测试的可复用模板；现有测试还覆盖侧栏图片 staging、主题支持和安装器行为。
- 当前工作区无未提交改动，且 agentmemory 没有可恢复的会话记录。

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| 新主题目录拟定为 `assets/resident-evil-dream-skin/` | 与现有主题目录命名一致，便于离线分发和测试定位 |
| 主题资源使用原创灵感风格素材 | 保留人物气质和主题识别度，同时避免直接复制游戏截图/官方 Logo 的包内依赖 |
| 视觉构图默认主角靠右、左侧低细节 | 适配现有背景中的侧栏和文本安全区 |
| 主题色采用黑曜灰、警戒红、酒红、冷白与少量琥珀 | 连接 R.P.D. 警务感、实验室阴影和艾达的红色视觉线索 |
| 主背景不通过审阅就不落盘为最终资源 | 保证视觉质量由用户把关，且支持有针对性的迭代 |
| 主背景使用 R.P.D. 夜巡构图 | 用户已确认：左侧低细节安全区，里昂/艾达王位于右侧，冷蓝与警戒红形成对照 |

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| 无法通过 memory_sessions 找到上次会话 | 检查工作区和 git 历史，以最近主题作为结构参考；在设计确认前不直接写实现 |

## Resources

- `assets/hatsune-miku-dream-skin/`
- `assets/nergigante-dream-skin/`
- `tests/hatsune-miku-theme.test.mjs`
- `patches/engine/assets/theme-package-validator.mjs`
- `docs/superpowers/specs/2026-08-11-hatsune-miku-dream-skin-design.md`
- `docs/superpowers/plans/2026-08-11-hatsune-miku-dream-skin.md`

## Visual/Browser Findings

- 本主题视觉素材已完成生成、人工检查与落盘；主背景严格经过用户审阅确认后才写入最终主题目录。
- 用户已确认采用原创灵感风格素材，并要求主背景遵循“生成候选、用户审阅、必要时重新生成”的流程。
- 第一版主背景候选已生成并经用户确认；预览文件位于 `/Users/ushopal/.codex/generated_images/019ff051-77eb-7d12-bd5c-f7bbaf451923/exec-02eb86c8-3ebb-4ec9-9ebb-47b5d2bde323.png`，最终处理版本已复制到仓库。
- 视觉检查：候选为宽幅构图；左侧约 40% 深色、低细节，适合侧栏和文字；里昂位于右侧前景，艾达王位于中右侧后方；场景包含雨夜城市、玻璃反射和实验室容器；冷蓝主氛围与暗红轮廓光清晰；当前预览未见文字、Logo、水印或第三角色。
- 待用户审阅重点：两位角色的脸部/手部细节、人物是否足够贴合期望、右侧裁切是否适合实际 UI，以及整体是否需要更暗、更偏警务或更突出艾达。
- 用户已确认第一版主背景。确认后的原图尺寸为 1672×941，已等比处理并裁切为 `assets/resident-evil-dream-skin/background.png`，最终尺寸为 1920×1080；原始候选仍保留在生成目录，未进入 Git。
- 最终主背景复核：左侧约 40% 保持深色低细节；里昂位于右侧前景，艾达王位于中右侧；雨夜城市、玻璃和实验室元素清晰；未见文字、Logo、水印或第三角色。
- 用户已确认完整设计规格；实施计划拆分为测试、主背景审阅、侧栏纹理、元数据/CSS、ZIP 打包和全量验证六个任务。
- 侧栏纹理候选已生成并通过视觉检查；预览文件位于 `/Users/ushopal/.codex/generated_images/019ff051-77eb-7d12-bd5c-f7bbaf451923/exec-352fa895-a6c5-4fde-ade2-5453d45f94db.png`，处理后的 1024×1024 版本已复制到仓库。
- 侧栏纹理视觉检查：深色档案网格、实验室线稿、低亮度红色警示线和抽象试管/圆环图形均匀分布；未见人物、可读文字、Logo、水印或明显中心焦点，适合平铺。
- 主题配置已按固定契约写入 `theme.json` 和 `theme.css`；对比度检查结果为主文字 15.3049:1、次要文字 8.0285:1。
- `Resident-Evil-RPD-Dream-Skin.zip` 已使用显式四文件列表打包；清单严格为 `background.png`、`sidebar-pattern.png`、`theme.css`、`theme.json`，源目录与 ZIP 成员逐字节一致。
- 专项测试 5/5、全量测试 24/24 通过；变更边界检查确认未修改安装器、引擎补丁或既有灭尽龙/初音未来主题。
