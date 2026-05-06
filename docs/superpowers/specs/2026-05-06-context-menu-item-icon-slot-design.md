# Context Menu Item Icon Slot Design

## Goal
为 `context-menu-item` 增加命名插槽图标能力，在保留现有 `icon` 属性文本图标兼容性的前提下，支持任意自定义图标节点，并新增 `icon-size` 属性控制图标尺寸。

## Requirements
- 保留现有 `icon` 属性，继续支持 emoji / 文本图标。
- 支持 `slot="icon"` 的命名插槽。
- 当插槽图标存在时，优先显示插槽内容，不再显示 `icon` 属性文本。
- 当插槽图标不存在时，回退到 `icon` 属性。
- 当两者都不存在时，隐藏图标容器。
- 新增 `icon-size` 属性，接受任意合法 CSS 尺寸字符串。
- `icon-size` 同时作用于属性图标和插槽图标容器。
- 本次不扩展程序化 API，不支持通过 `MenuItemData` 传入节点型图标。

## Proposed API
```html
<context-menu-item label="打开" icon="📂"></context-menu-item>

<context-menu-item label="打开" icon-size="20px">
  <svg slot="icon" viewBox="0 0 16 16" aria-hidden="true">
    <path d="..." />
  </svg>
</context-menu-item>
```

## Rendering Rules
- `slot="icon"` 存在且分配了节点时：
  - 显示图标容器。
  - 渲染插槽内容。
  - 隐藏属性图标文本占位。
- 仅存在 `icon` 属性时：
  - 使用现有文本渲染逻辑。
- 两者都不存在时：
  - 图标容器 `display: none`。

## Styling
- 图标容器继续复用现有 `part="icon"`。
- `icon-size` 映射到组件私有变量，覆盖主题变量 `--ctx-menu-item-icon-size`。
- 为插槽内容增加基础样式约束，使常见的 `svg`、`img`、`span` 能在容器内居中显示并跟随容器尺寸。

## Compatibility
- 不破坏现有 `icon="📂"` 写法。
- 不变更 `context-menu` 的程序化创建逻辑。
- 不新增 `context-menu-item-icon` 独立标签，避免引入额外 API 表面。

## Tests
- `icon` 属性图标正常显示。
- `slot="icon"` 优先于 `icon` 属性。
- `icon-size` 会作用到图标容器样式变量。
- 没有图标时图标容器隐藏。
