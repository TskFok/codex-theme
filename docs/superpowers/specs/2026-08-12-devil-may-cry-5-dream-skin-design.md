# Devil May Cry 5 Crimson Requiem 主题设计规格

## 目标

在现有 Codex Dream Skin 主题项目中新增一套受《鬼泣5》战斗氛围启发的暗色主题。主题沿用项目已验证的简化四文件结构，主背景使用用户确认的右置扩展候选，能够通过本地主题校验器并打包为可离线导入的 ZIP。

## 已确认的视觉方案

- 主背景使用用户确认的附件编辑候选：原始战斗画面整体位于右侧，左侧约 38%–40% 为暗色、低细节安全区。
- 原图中的人物、恶魔、武器、动作、光影与主要材质不主动重绘或替换；只进行高分辨率落盘和主题所需的尺寸统一。
- 整体色彩为石墨黑、冷钢蓝、灰白、暗酒红和少量铜色高光，保持高速战斗、恶魔肉瘤环境与压迫感。
- 背景不包含新增文字、Logo、水印、界面控件或标题处理。
- 侧栏纹理使用与主背景匹配的抽象暗纹，不出现完整人物、脸部、可读文字或单一高亮焦点。

## 主题包结构

```text
assets/devil-may-cry-5-dream-skin/
├── background.png
├── sidebar-pattern.png
├── theme.css
└── theme.json

Devil-May-Cry-5-Dream-Skin.zip
```

ZIP 根目录严格包含上述四个文件，不包含外层目录、`.DS_Store`、`__MACOSX` 或临时候选资源。

## 主背景

- 文件：`background.png`
- 格式：PNG，1920×1080，非透明背景。
- 内容：用户确认的右置扩展候选，完整保留右侧原图主体，左侧暗色低细节区域作为侧栏和正文文字安全区。
- 禁止：文字、Logo、水印、界面控件、额外角色、明显拼接缝、过曝白色大块和覆盖正文的高细节焦点。

## 侧栏纹理

- 文件：`sidebar-pattern.png`
- 格式：PNG，1024×1024，适合低对比平铺。
- 内容：抽象黑曜石/湿润有机纹理、细微暗红裂隙、冷蓝灰雾和少量金属颗粒，视觉焦点均匀分散。
- 禁止：完整人物、脸部、武器主体、可读文字、Logo、水印、霓虹色和明显拼接边界。

## 固定元数据

`theme.json` 使用 `schemaVersion: 1`，固定关键字段如下：

```json
{
  "schemaVersion": 1,
  "id": "devil-may-cry-5-crimson",
  "name": "Devil May Cry 5 Crimson Requiem",
  "brandSubtitle": "DEMON HUNTER SIGNAL",
  "tagline": "Style is the edge between chaos and control.",
  "projectPrefix": "选择项目 · ",
  "projectLabel": "◉  选择项目",
  "statusText": "DEMON HUNTER SIGNAL ONLINE",
  "quote": "STAY SHARP. KEEP MOVING.",
  "image": "background.png",
  "sidebarImage": "sidebar-pattern.png",
  "appearance": "dark",
  "art": {
    "focusX": 0.80,
    "focusY": 0.48,
    "safeArea": "left",
    "taskMode": "ambient"
  },
  "colors": {
    "background": "#0B0D12",
    "panel": "#151820",
    "panelAlt": "#24232A",
    "accent": "#B64558",
    "accentAlt": "#E38B8D",
    "secondary": "#596879",
    "highlight": "#C99763",
    "text": "#F1ECE7",
    "muted": "#B0A8A6",
    "line": "rgba(182, 69, 88, .30)"
  }
}
```

## CSS 边界

`theme.css` 只包含现有主题契约允许的根节点和侧栏两条安全规则，不引入外部 URL、字体、脚本、布局覆盖或额外选择器：

```css
[data-ds-part="root"] {
  background-color: #0b0d12;
  color: #f1ece7;
}

[data-ds-part="sidebar"] {
  background-color: #151820;
  border-right-color: #596879;
}
```

## 测试与验收

- 新增专项 `node:test`，覆盖固定元数据、PNG 尺寸、CSS 安全规则、源目录 validator、ZIP 根文件清单和 ZIP/源目录字节一致性。
- `background.png` 必须为 1920×1080；`sidebar-pattern.png` 必须为 1024×1024。
- 源目录必须通过 `theme-package-validator.mjs`，ZIP 必须只包含四个根文件。
- 运行鬼泣5专项测试、全量 `node --test tests/*.test.mjs`、`git diff --check`、PNG 检查和 `unzip -t`。
- 不修改现有灭尽龙、初音未来、生化危机、最终幻想 VII 主题、安装器或引擎补丁。

## 实现边界

- 主背景确认后才复制到主题源目录；预览原文件保留在 Codex 生成目录，不作为 ZIP 临时成员。
- 主题文件只新增鬼泣5主题资源、专项测试、设计/规划记录和最终 ZIP。
- 若生成式扩展区域与原图衔接不自然，只修正新增背景区域，不改变用户已确认的原图主体。
