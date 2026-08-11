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

- 尚未查看或生成本主题视觉素材；需先完成设计确认，再生成并检查主背景和侧栏纹理。
- 用户已确认采用原创灵感风格素材，并要求主背景遵循“生成候选、用户审阅、必要时重新生成”的流程。
- 用户已确认完整设计规格；实施计划拆分为测试、主背景审阅、侧栏纹理、元数据/CSS、ZIP 打包和全量验证六个任务。
