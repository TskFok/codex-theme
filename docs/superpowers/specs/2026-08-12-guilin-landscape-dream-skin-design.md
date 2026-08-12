# 桂林山水 Codex Dream Skin 主题设计规格

## 状态

- 日期：2026-08-12
- 状态：已获用户确认，等待规格文档复核后进入实施计划
- 目标：在现有主题包结构中新增一套明亮清晰、摄影感的桂林山水主题，并提供可直接离线导入的 ZIP。

## 已确认的设计决策

| 决策 | 结论 |
| --- | --- |
| 主视觉类型 | 真实感山水摄影 |
| 主背景构图 | “漓江晨雾”：山峰与竹筏集中在右侧，左侧保留 UI 安全区 |
| 摄影色调 | 清晨薄雾、青绿色山水、少量暖金阳光 |
| UI 方向 | “漓江晨雾·清透浅色” |
| 外观模式 | `appearance: "light"` |
| 交付范围 | 源目录、主题 ZIP、专项测试、README 更新 |
| 工作分支 | 当前分支，不新建分支 |

## 目标与非目标

### 目标

1. 新增独立的 `assets/guilin-landscape-dream-skin/` 主题源目录。
2. 主题能通过项目已有的本地简化主题校验、staging 和导入链路。
3. 主题呈现清晨漓江、喀斯特山峰和薄雾的摄影氛围，同时适合长时间阅读 Codex 内容。
4. 使用浅色面板、深青色文字和受控的玉青强调色，保持清晰层次与可读性。
5. 生成根目录文件清单明确、可离线导入的 `Guilin-Landscape-Dream-Skin.zip`。

### 非目标

- 不修改现有主题资源、安装器入口或引擎补丁。
- 不添加新的引擎运行逻辑、布局逻辑、动画逻辑或外部字体依赖。
- 不添加图片内文字、Logo、水印、广告、界面控件或额外主题资源。
- 不使用高饱和蓝绿、强眩光或高频细节覆盖左侧文字安全区。
- 不把完整山峰、竹筏或其他高对比主体直接平铺到侧栏纹理中。

## 交付结构

源目录与 ZIP 的内容保持一致：

```text
assets/guilin-landscape-dream-skin/
├── theme.json
├── theme.css
├── background.png
└── sidebar-pattern.png

Guilin-Landscape-Dream-Skin.zip
```

ZIP 根目录必须直接包含上述四个文件，不能包含外层目录、隐藏文件、设计稿或其他未声明资源。主题包不包含 `manifest.json`，继续使用仓库现有的本地简化主题格式。

## 主题元数据

`theme.json` 使用 schema version 1，并采用以下固定配置：

```json
{
  "schemaVersion": 1,
  "id": "guilin-li-river",
  "name": "Guilin Li River Morning Mist",
  "brandSubtitle": "LI RIVER MORNING MIST",
  "tagline": "Clear water, quiet peaks, steady focus.",
  "projectPrefix": "选择项目 · ",
  "projectLabel": "◉  选择项目",
  "statusText": "LI RIVER SIGNAL ONLINE",
  "quote": "MOVE WITH THE MIST",
  "image": "background.png",
  "sidebarImage": "sidebar-pattern.png",
  "appearance": "light",
  "art": {
    "focusX": 0.8,
    "focusY": 0.46,
    "safeArea": "left",
    "taskMode": "ambient"
  },
  "colors": {
    "background": "#EEF7F2",
    "panel": "#FAFDFB",
    "panelAlt": "#DDEFE7",
    "accent": "#246D63",
    "accentAlt": "#3D8979",
    "secondary": "#4E6F76",
    "highlight": "#9A6A32",
    "text": "#173D39",
    "muted": "#4A6664",
    "line": "rgba(36, 109, 99, .26)"
  }
}
```

`focusX` 与 `focusY` 将主体定位在背景右侧中上区域；`safeArea: "left"` 让现有引擎在左侧应用更强的遮罩；`taskMode: "ambient"` 保留任务视图的山水氛围但不让图片压过内容。`appearance: "light"` 使用引擎已支持的浅色 shell，不需要增加运行时逻辑。

## 颜色职责与可读性

| 颜色 | 用途 |
| --- | --- |
| `#EEF7F2` | 页面底色、图片后备底色 |
| `#FAFDFB` | 侧栏和主要面板 |
| `#DDEFE7` | 次级面板、悬浮层或选中背景 |
| `#246D63` | 主强调、焦点、主要边界 |
| `#3D8979` | 浅色强调、图形细节和大字号状态 |
| `#4E6F76` | 次级边界、辅助信息和侧栏分隔线 |
| `#9A6A32` | 少量暖金高光、装饰和较大字号状态 |
| `#173D39` | 主要文字 |
| `#4A6664` | 次要文字 |
| `rgba(36, 109, 99, .26)` | 分隔线与弱边框 |

主文字、次要文字、主强调色和次级强调色在浅色面板上的对比度目标均不低于 WCAG AA 普通文字要求。浅色强调色和暖金色用于装饰、边框或较大字号状态，不单独承担普通正文、错误或成功语义。

## 视觉资源设计

### 主背景

- 文件：`background.png`
- 尺寸：1920×1080
- 格式：PNG；不依赖透明通道
- 画面类型：自然光下的原创灵感摄影风格桂林山水
- 构图：漓江与喀斯特山峰从中景延伸到右侧，竹筏或小舟作为小尺度视觉锚点；左侧约 40% 保持浅色、薄雾化、低细节，供侧栏和正文使用。
- 光线：清晨薄雾、青绿色水面、柔和暖金阳光；保持真实、通透、不过度 HDR。
- 禁止：图片内文字、Logo、水印、界面元素、过度饱和色块、强烈眩光、左侧密集山体细节和会抢夺正文注意力的中心焦点。

主背景生成后先保存在临时位置进行视觉检查。检查重点为右侧主体位置、左侧安全区、浅色 shell 下的文字可读性、画面是否自然以及禁用元素；只有用户确认候选后，才写入主题源目录。若不符合要求，只重生成主背景，不改变已确认的元数据和配色。

### 侧栏纹理

- 文件：`sidebar-pattern.png`
- 尺寸：1024×1024
- 格式：PNG；适合平铺
- 内容：低对比浅玉青底色、抽象等高线、水波、远山轮廓和少量竹影。
- 视觉要求：密度均匀、无明显中心焦点，不干扰侧栏导航文字和图标。
- 禁止：人物、可读文字、Logo、水印、白色大块、高频噪点和高亮装饰。

## 安全 CSS

`theme.css` 只保留与现有主题相同的两条安全规则：

```css
[data-ds-part="root"] {
  background-color: #eef7f2;
  color: #173d39;
}

[data-ds-part="sidebar"] {
  background-color: #fafdfb;
  border-right-color: #4e6f76;
}
```

不添加 `@import`、脚本、事件属性、外部 URL、布局覆盖、固定定位或会影响引擎导航与交互的规则。背景图、主题变量、浅色 shell、任务模式和侧栏图片叠加由现有引擎负责。

## 实现与数据流

1. 新增 `tests/guilin-landscape-theme.test.mjs`，先验证缺失主题资源时能按预期失败，建立 TDD 红灯基线。
2. 生成主背景候选到临时路径，进行尺寸、内容和安全区检查；经用户确认后处理为 1920×1080 并写入主题目录。
3. 生成侧栏纹理候选，检查低对比、平铺适配和禁用元素，再处理为 1024×1024 并写入主题目录。
4. 创建 `theme.json` 与 `theme.css`，使图片引用、颜色键、定位参数和安全 CSS 与本规格完全一致。
5. 更新 README 的主题数量和主题表，加入桂林山水主题 ZIP、名称、ID 和源目录。
6. 使用显式四文件列表打包 `Guilin-Landscape-Dream-Skin.zip`，避免隐藏文件或外层目录进入包内。
7. 运行专项测试、主题校验器、PNG 尺寸检查、ZIP 清单检查、ZIP 完整性检查和全量测试。

数据流保持现有主题链路：`theme.json` 声明背景与侧栏图片 → 校验器检查源目录和安全 CSS → staging 复制稳定文件 → 导入脚本发布主题 → 引擎根据 `appearance`、`art` 与 `colors` 注入视觉变量。

## 测试与验收

专项测试覆盖：

- JSON 可解析，`schemaVersion`、ID、名称、图片引用、`appearance`、`art` 和 `colors` 完全符合本规格。
- `background.png` 的 PNG 头部声明尺寸为 1920×1080。
- `sidebar-pattern.png` 的 PNG 头部声明尺寸为 1024×1024。
- 图片引用指向主题目录中的普通文件，扩展名与实际 PNG 内容一致。
- `theme.css` 内容严格匹配两条安全规则，并通过 `safe-css-validator.mjs`。
- 源目录通过 `theme-package-validator.mjs` 的 local simplified validation，并正确生成 staging 文件。
- ZIP 根目录清单严格等于 `background.png`、`sidebar-pattern.png`、`theme.css`、`theme.json`。
- ZIP 成员与源目录文件逐字节一致，且 `unzip -t` 无损坏。

回归测试运行 `node --test tests/*.test.mjs`。若本机未配置 Dream Skin 引擎，则记录依赖引擎的测试限制，并至少完成桂林山水专项资源检查、主题校验器和 ZIP 检查。

## 错误处理与回滚边界

- 主背景候选不满足构图、安全区或视觉禁用项：只重生成主背景，保留已确认的色彩、文案和定位参数。
- 侧栏纹理对比度过高或出现焦点：只重生成或重新处理侧栏纹理，不改变主背景。
- JSON 或 CSS 被校验器拒绝：按具体字段缩小改动，优先回到本规格的固定契约。
- ZIP 清单不正确：使用显式文件列表重新打包，不覆盖现有其他主题 ZIP。
- 任意验证失败时，不修改安装器、引擎目录、引擎补丁或既有主题资源。

## 完成标准

以下条件全部满足时视为完成：

1. 主题源目录和 ZIP 均存在，且 ZIP 内容与源目录一致。
2. 主背景与侧栏纹理满足尺寸、构图、低干扰和禁用元素要求。
3. `theme.json`、`theme.css` 和主题 ZIP 均通过项目现有校验。
4. 桂林山水专项测试和可运行的全量回归测试通过，环境限制已明确记录。
5. README 已列出主题，Git 变更范围未超出本规格。
