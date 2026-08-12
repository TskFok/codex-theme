# Final Fantasy VII Remake Flowerfield Dusk 主题设计规格

## 目标

在现有 Codex Dream Skin 主题项目中新增一套以蒂法与艾丽斯为视觉核心的《最终幻想 VII 重制版》灵感主题。主题沿用项目已验证的简化四文件结构，能够通过本地主题校验器并打包为可离线导入的 ZIP。

## 已确认的视觉方案

- 主背景采用用户确认的“花田黄昏”路线。
- 蒂法位于右侧前景，艾丽斯位于中右侧后方，保持清晰的双人层次。
- 左侧约 40% 保持较暗、低细节，作为侧栏和正文文字安全区。
- 场景为暮色花田、远山与低对比工业天际线，使用金色夕光、粉色霞光和蓝紫暮色阴影。
- 主背景不包含文字、Logo、水印、界面控件或第三角色。
- 主背景候选已由用户审阅并确认；确认后的候选才进入主题源目录。

## 主题包结构

```text
assets/final-fantasy-vii-remake-dream-skin/
├── background.png
├── sidebar-pattern.png
├── theme.css
└── theme.json

Final-Fantasy-VII-Remake-Dream-Skin.zip
```

ZIP 根目录严格包含上述四个文件，不包含外层目录、`.DS_Store`、`__MACOSX` 或临时候选资源。

## 主背景

- 文件：`background.png`
- 格式：PNG，1920×1080，非透明背景
- 内容：用户确认的花田黄昏候选，保留蒂法/艾丽斯的相对位置和左侧安全区。
- 禁止：文字、Logo、水印、界面控件、第三角色、过曝白色大块和会覆盖正文的高细节焦点。

## 侧栏纹理

- 文件：`sidebar-pattern.png`
- 格式：PNG，1024×1024，适合低对比平铺
- 内容：抽象花瓣、细草线、暮色颗粒和柔和玫瑰/蓝紫色调。
- 禁止：完整人物、脸部、可读文字、Logo、水印和单一中心焦点。

## 固定元数据

`theme.json` 使用 `schemaVersion: 1`，固定关键字段如下：

```json
{
  "schemaVersion": 1,
  "id": "ff7-remake-flowerfield",
  "name": "Final Fantasy VII Remake Flowerfield Dusk",
  "brandSubtitle": "SECTOR 5 FLOWERFIELD",
  "tagline": "Where the evening light remembers.",
  "projectPrefix": "选择项目 · ",
  "projectLabel": "◉  选择项目",
  "statusText": "FLOWERFIELD SIGNAL ONLINE",
  "quote": "KEEP WALKING TOWARD THE LIGHT",
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
    "background": "#211B2A",
    "panel": "#2B2232",
    "panelAlt": "#3C2A3E",
    "accent": "#D98997",
    "accentAlt": "#F1B1A8",
    "secondary": "#6D7B8D",
    "highlight": "#D7AF63",
    "text": "#F6EFEA",
    "muted": "#C2B3B1",
    "line": "rgba(217, 137, 151, .28)"
  }
}
```

## CSS 边界

`theme.css` 只包含现有主题契约允许的根节点和侧栏两条安全规则，不引入外部 URL、字体、脚本、布局覆盖或额外选择器：

```css
[data-ds-part="root"] {
  background-color: #211b2a;
  color: #f6efea;
}

[data-ds-part="sidebar"] {
  background-color: #2b2232;
  border-right-color: #6d7b8d;
}
```

## 测试与验收

- 新增专项 `node:test`，覆盖固定元数据、PNG 尺寸、CSS 安全规则、源目录 validator、ZIP 根文件清单和 ZIP/源目录字节一致性。
- `background.png` 必须为 1920×1080；`sidebar-pattern.png` 必须为 1024×1024。
- 源目录必须通过 `theme-package-validator.mjs`，ZIP 必须只包含四个根文件。
- 运行 FF7 专项测试、全量 `node --test tests/*.test.mjs`、`git diff --check`、PNG 检查和 `unzip -t`。
- 不修改现有灭尽龙、初音未来、生化危机主题、安装器或引擎补丁。
