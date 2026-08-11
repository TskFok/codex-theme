# 初音未来 Codex Dream Skin 主题设计规格

## 状态

- 日期：2026-08-11
- 状态：已获用户确认，等待规格文档复核后实现
- 目标：在现有主题包结构中新增一套清透未来感的初音未来主题，并提供可直接离线导入的 ZIP。

## 目标与非目标

### 目标

1. 新增独立的 `assets/hatsune-miku-dream-skin/` 主题源目录。
2. 主题能通过项目已有的本地简化主题校验、staging 和导入链路。
3. 主题视觉体现初音未来的青绿色虚拟歌手特征，同时适合长时间阅读 Codex 内容。
4. 主背景保留左侧暗部安全区，侧栏纹理不遮挡导航文字。
5. 生成一个根目录文件清单明确、可离线导入的 `Hatsune-Miku-Dream-Skin.zip`。

### 非目标

- 不修改现有灭尽龙主题的文件、默认安装器入口或现有引擎补丁。
- 不添加新的引擎运行逻辑、布局逻辑或外部字体依赖。
- 不添加水印、Logo、界面控件、广告文案或额外装饰资源。
- 不把完整人物直接平铺到侧栏纹理中。

## 交付结构

源目录与 ZIP 的内容保持一致：

```text
assets/hatsune-miku-dream-skin/
├── theme.json
├── theme.css
├── background.png
└── sidebar-pattern.png

Hatsune-Miku-Dream-Skin.zip
```

ZIP 根目录必须直接包含上述 4 个文件，不能包含外层目录、隐藏文件、设计稿或其他未声明资源。主题包不包含 `manifest.json`，使用仓库现有的本地简化主题格式。

## 主题元数据

`theme.json` 使用 schema version 1，并采用以下稳定配置：

```json
{
  "schemaVersion": 1,
  "id": "hatsune-miku-cyan",
  "name": "Hatsune Miku Clear Future",
  "brandSubtitle": "CODEX DREAM SKIN",
  "tagline": "A clear signal from the future, tuned for focus.",
  "projectPrefix": "选择项目 · ",
  "projectLabel": "◉  选择项目",
  "statusText": "SIGNAL ONLINE",
  "quote": "TUNE YOUR FOCUS",
  "image": "background.png",
  "sidebarImage": "sidebar-pattern.png",
  "appearance": "dark",
  "art": {
    "focusX": 0.78,
    "focusY": 0.46,
    "safeArea": "left",
    "taskMode": "ambient"
  },
  "colors": {
    "background": "#07131F",
    "panel": "#0C2231",
    "panelAlt": "#123142",
    "accent": "#55E7D0",
    "accentAlt": "#8BF7E9",
    "secondary": "#4B8FB1",
    "highlight": "#E88BD5",
    "text": "#E8FBFA",
    "muted": "#9BB8BE",
    "line": "rgba(85, 231, 208, .28)"
  }
}
```

`focusX` 与 `focusY` 将人物主体定位在背景右侧中上区域；`safeArea: "left"` 让引擎在左侧应用更强的遮罩；`taskMode: "ambient"` 保持任务视图有背景氛围但不让图像压过内容。

## 视觉设计

### 主背景

- 文件：`background.png`
- 尺寸：1920×1080
- 格式：PNG；不依赖透明通道
- 构图：右侧为初音未来的未来感虚拟歌手形象，青绿色长双马尾、黑青色演出服、少量柔和粉紫边缘光；左侧至少约 40% 为深色、低细节的留白/雾化空间。
- 氛围：清透、安静、带轻微数字音频信号感；避免舞台强光、满屏粒子、过度锐利的高亮和复杂文字区域。
- 禁止：图片内文字、Logo、水印、界面控件、纯白大面积背景和会与正文争夺注意力的高亮光斑。

主背景使用内置图像生成流程生成，生成后必须检查主体位置、左侧可读性、色彩统一性和禁用元素；若不符合安全区要求，只进行针对构图的单项重生成。

### 侧栏纹理

- 文件：`sidebar-pattern.png`
- 尺寸：1024×1024
- 格式：PNG；适合平铺
- 内容：低对比青色数据波纹、细网格、音频频谱线和少量深蓝粒子；纹理密度均匀，避免单个明显焦点。
- 禁止：完整人物、人物脸部、白色大块、文字、Logo、水印和高频噪点。

### 颜色职责

| 颜色 | 用途 |
|------|------|
| `#07131F` | 页面底色、图像后备底色 |
| `#0C2231` | 侧栏和主要面板 |
| `#123142` | 次级面板、悬浮层或选中背景 |
| `#55E7D0` | 主强调、焦点和积极状态 |
| `#8BF7E9` | 主强调的浅色变体、细节高光 |
| `#4B8FB1` | 次级强调、边界和辅助信息 |
| `#E88BD5` | 少量粉紫高光，不承担唯一语义 |
| `#E8FBFA` | 主要文字 |
| `#9BB8BE` | 次要文字 |
| `rgba(85, 231, 208, .28)` | 分隔线与弱边框 |

实现时需单独检查主要文字和次要文字在深色面板上的对比度；粉紫只作为装饰或辅助状态，不能单独承载错误、成功或选中语义。

## 安全 CSS

`theme.css` 只保留与现有主题相同的两条安全规则：

```css
[data-ds-part="root"] {
  background-color: #07131f;
  color: #e8fbfa;
}

[data-ds-part="sidebar"] {
  background-color: #0c2231;
  border-right-color: #4b8fb1;
}
```

不添加 `@import`、脚本、事件属性、外部 URL、布局覆盖、固定定位或会影响引擎导航与交互的规则。通用背景图、主题变量、任务模式和侧栏平铺由引擎根据 `theme.json` 负责注入。

## 实现与数据流

1. 使用内置图像生成流程分别生成主背景和侧栏纹理，生成结果先保存到工作区，再检查图片内容和尺寸。
2. 创建 `theme.json` 与 `theme.css`，文件名与图片引用保持同目录、同名契约。
3. 用主题校验器对源目录执行 local simplified validation，并将结果 staging 到临时目录。
4. 使用显式文件列表将源目录四个文件打包到 ZIP 根目录，避免把隐藏文件或外层目录带入包内。
5. 用 ZIP 清单检查和主题校验器再次验证 ZIP；失败时只修复对应的元数据、CSS、资源或打包步骤，不改变引擎补丁和安装器。

## 测试与验收

### 静态资源检查

- `theme.json` 可解析，`schemaVersion`、`id`、`name`、`image`、`sidebarImage`、`art` 和 `colors` 满足校验器契约。
- `background.png` 的 PNG 头部声明尺寸为 1920×1080。
- `sidebar-pattern.png` 的 PNG 头部声明尺寸为 1024×1024。
- 两个图片引用都指向主题目录内存在的普通文件，文件扩展名与实际 PNG 内容一致。
- `theme.css` 通过 `safe-css-validator.mjs`。

### 导入包检查

- ZIP 根目录清单严格等于：`background.png`、`sidebar-pattern.png`、`theme.css`、`theme.json`。
- 主题校验器能接受 ZIP 解压后的源目录，并成功写入空 staging 目录。
- ZIP 不包含 `__MACOSX`、`.DS_Store`、外层主题目录或未声明资源。

### 回归检查

- 运行现有 `node --test tests/*.test.mjs`；若本机没有配置 Dream Skin 引擎，则记录环境缺失并至少运行与主题资源无外部依赖的专项检查。
- 检查 Git 变更只包含初音未来主题资源、主题规格/必要说明和专项验证文件，不修改灭尽龙资源、安装器或引擎补丁。

## 错误处理与回滚边界

- 图像生成结果不满足右侧主体/左侧安全区：只重生成对应图片，保留已确认的配色和文案。
- JSON 或 CSS 被校验器拒绝：按错误字段缩小改动，优先回到本规格中的固定契约。
- ZIP 文件清单不正确：删除临时 ZIP 并使用显式四文件列表重新打包；不覆盖现有灭尽龙 ZIP。
- 任何验证失败都不修改现有安装器、引擎目录或已存在的灭尽龙资源。

## 完成标准

当以下条件同时满足时视为完成：主题源目录和 ZIP 均存在且内容一致；主背景和侧栏纹理满足尺寸与视觉安全区；主题 JSON/CSS/ZIP 全部通过校验；专项和可运行的现有回归测试通过；Git 变更范围没有超出本规格。
