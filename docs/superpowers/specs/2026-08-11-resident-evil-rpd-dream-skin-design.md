# 生化危机 R.P.D. Night Watch Codex Dream Skin 主题设计规格

## 目标

在现有 Codex Dream Skin 主题项目中新增一套以里昂和艾达王为视觉核心的生化危机主题。主题必须沿用项目已验证的简化主题包结构，能够通过本地主题校验器并打包为可离线导入的 ZIP。

主题视觉采用已确认的“R.P.D. 夜巡”路线：深色警务与生化实验室氛围、左侧界面安全区、右侧双人主视觉、冷蓝与警戒红对照。素材使用原创灵感风格的生成式插画和纹理，不直接复用游戏截图、官方 Logo 或官方素材。

## 用户已确认的设计决策

- 采用视觉路线 A：R.P.D. 夜巡。
- 主背景必须先生成候选并展示给用户审阅。
- 用户不满意时允许根据反馈重新生成，旧候选不被覆盖。
- 只有用户明确确认后，主背景候选才可以复制为最终 `background.png` 并进入 ZIP。
- 主题继续使用项目现有的四文件简化包结构。
- 默认在当前 `master` 分支修改，不新建分支。

## 主题包结构

主题源目录为 `assets/resident-evil-dream-skin/`，包含且只包含以下四个文件：

```text
assets/resident-evil-dream-skin/
├── background.png
├── sidebar-pattern.png
├── theme.css
└── theme.json
```

离线导入包为 `Resident-Evil-RPD-Dream-Skin.zip`，ZIP 根目录严格包含上述四个文件，不包含外层目录、`.DS_Store`、`__MACOSX` 或临时候选资源。

不修改 `install-macos.sh`、`patches/engine/`、`assets/nergigante-dream-skin/` 或 `assets/hatsune-miku-dream-skin/`。

## 视觉设计

### 主背景

- 尺寸固定为 1920×1080 PNG。
- 左侧约 40% 使用深色、低细节构图，作为侧栏和界面文字的安全区。
- 里昂位于右侧偏前景，呈冷峻、克制的行动姿态。
- 艾达王位于右侧或中右侧，用暗红轮廓光与里昂区分，并保持两人之间的视觉层次。
- 场景融合雨夜城市、警务灯光、玻璃反射和生化实验室暗部元素。
- 主色为黑曜灰、冷蓝和警戒红，辅以少量琥珀色信号光。
- 不包含文字、Logo、水印、界面元素、官方生化危机标志或第三角色。
- 人物与场景使用原创灵感风格表达，不复制具体官方宣传图构图。

主背景生成和落盘必须遵循以下门控流程：

```text
生成候选（主题目录之外）
        ↓
展示给用户审阅
        ├── 不满意：按反馈生成新候选，保留旧候选，不覆盖
        └── 确认：复制为 assets/resident-evil-dream-skin/background.png
```

用户审阅前，候选只作为预览资源存在，不得进入主题源目录、ZIP 或提交记录。重新生成时优先只改变用户指出的因素，例如人物位置、光线、背景细节或颜色比例，保留已确认的安全区和主题方向。

### 侧栏纹理

- 尺寸固定为 1024×1024 PNG。
- 使用深色档案网格、案件线条、警示斜线、低亮度信号节点和抽象实验室纹理。
- 纹理需要低对比、均匀分布并适合平铺，不设置单一视觉焦点。
- 不包含人物、脸部、文字、数字、Logo、官方生化危机标志或明显水印。
- 侧栏纹理由实现阶段生成并进行本地视觉检查；如果不满足平铺、低对比或无文字约束，则重新生成或替换候选。

## 主题元数据契约

`theme.json` 使用 `schemaVersion: 1`，固定内容如下：

```json
{
  "schemaVersion": 1,
  "id": "resident-evil-rpd",
  "name": "Resident Evil R.P.D. Night Watch",
  "brandSubtitle": "R.P.D. SURVIVAL UNIT",
  "tagline": "Cold streets. Red signals. Keep moving.",
  "projectPrefix": "选择项目 · ",
  "projectLabel": "◉  选择项目",
  "statusText": "R.P.D. SIGNAL ONLINE",
  "quote": "SURVIVE THE NIGHT",
  "image": "background.png",
  "sidebarImage": "sidebar-pattern.png",
  "appearance": "dark",
  "art": {
    "focusX": 0.82,
    "focusY": 0.48,
    "safeArea": "left",
    "taskMode": "ambient"
  },
  "colors": {
    "background": "#090B0F",
    "panel": "#12171D",
    "panelAlt": "#1B242B",
    "accent": "#C4434D",
    "accentAlt": "#E06B64",
    "secondary": "#4C6470",
    "highlight": "#D59A58",
    "text": "#F0ECE6",
    "muted": "#A4AFB3",
    "line": "rgba(196, 67, 77, .30)"
  }
}
```

实现时如果对比度测试发现次要文字未达到既定可读性目标，只调整 `muted` 或对应面板颜色，并同步专项测试；不改变主背景构图。

## CSS 边界

`theme.css` 只提供根节点和侧栏的安全颜色规则，不引入外部 URL、字体、脚本、事件属性、布局覆盖或额外选择器：

```css
[data-ds-part="root"] {
  background-color: #090b0f;
  color: #f0ece6;
}

[data-ds-part="sidebar"] {
  background-color: #12171d;
  border-right-color: #4c6470;
}
```

背景图像的位置、裁切、安全区和任务模式由 `theme.json.art` 交给现有 Dream Skin 引擎处理，不在主题 CSS 中重复实现。

## 实现与测试

实现遵循 TDD 顺序：

1. 新增 `tests/resident-evil-theme.test.mjs`，覆盖主题元数据、PNG 尺寸、源目录 validator、ZIP 根文件清单和 ZIP/源目录字节一致性。
2. 先运行专项测试确认因主题资源不存在而红灯，且失败原因是缺少目标文件而不是测试语法错误。
3. 生成和审阅主背景；只有用户确认后才落盘。
4. 生成侧栏纹理、主题 JSON、主题 CSS，并运行专项测试使源目录相关断言通过。
5. 使用显式四文件列表打包 ZIP，运行 ZIP 清单与完整性检查。
6. 运行专项测试、`git diff --check`、PNG 文件检查、`unzip -t` 和 `node --test tests/*.test.mjs`。

专项测试的固定断言包括：

- `schemaVersion` 为 1，主题 ID、名称、图片引用、`appearance`、`art` 和颜色对象完全匹配设计契约。
- `background.png` 为 1920×1080，`sidebar-pattern.png` 为 1024×1024。
- 主题源目录通过现有 `theme-package-validator.mjs` 并成功 staging 四个文件。
- ZIP 清单排序后严格等于 `background.png`、`sidebar-pattern.png`、`theme.css`、`theme.json`。
- ZIP 每个成员与源目录对应文件字节一致。

## 错误处理与回滚边界

- 主背景不符合右侧构图、左侧安全区、角色关系或无文字要求：保留候选在主题目录之外，按反馈重新生成。
- 生成图片尺寸不正确：只对已确认候选执行非破坏性尺寸处理，不覆盖原始候选；处理后再次检查 PNG 头部尺寸。
- 侧栏纹理出现人物、文字、明显焦点或拼接缝：只替换侧栏候选，不修改已确认的主背景。
- JSON/CSS 被 validator 拒绝：根据具体字段或安全 CSS 错误做最小范围修正。
- ZIP 清单或字节一致性失败：删除临时 ZIP 候选，使用显式四文件列表重新打包；不触碰既有主题包。
- 全量测试因本机未配置 Dream Skin 引擎而受限时，记录确切环境错误，并保留所有不依赖外部引擎的专项验证结果。

## 完成标准

只有同时满足以下条件才视为完成：

- 用户已明确确认最终主背景。
- 主题源目录和离线 ZIP 均存在且内容一致。
- 两张 PNG 满足尺寸和视觉约束。
- JSON、CSS 和主题 ZIP 通过本地 validator、专项测试和 ZIP 完整性检查。
- 可运行的现有回归测试通过，或对外部引擎缺失作出明确记录。
- Git 变更仅包含本主题资源、专项测试、设计/规划记录和必要说明。
