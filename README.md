# OmniCtx

OmniCtx 是一个零运行时依赖的 Web Component 右键菜单组件库。它基于原生 Custom Elements 实现，适合在任意前端项目中快速加入可主题化、可键盘操作、支持子菜单的上下文菜单。

## ✨ 功能特性

- 原生 Web Component，无框架绑定，支持直接在 HTML 中使用。
- 提供菜单项、分割线、分组、单选组、单选项和开关项等组件。
- 支持浅色主题、Element 风格深色主题、Naive UI 风格深色主题。
- 支持 Google / Edge 两种菜单样式和 small / normal / large 三种尺寸。
- 支持右键坐标打开、API 坐标打开、视口边界自动避让。
- 支持子菜单、菜单头部与底部插槽。
- 支持键盘方向键导航、Enter / Space 选择、Escape 关闭。
- 支持点击外部、滚动、再次右键、菜单选择和 API 调用等关闭场景。

## 📦 环境要求

项目使用 Bun 作为开发、构建和测试运行时。

```bash
bun install
```

## 🚀 快速开始

开发模式会启动本地示例页面，并在浏览器请求入口文件时重新构建源码。

```bash
bun run dev
```

默认访问地址：

```text
http://localhost:3000
```

## 🧩 基础用法

```html
<div id="target">Right-click here</div>

<context-menu id="menu" style-type="google" theme="light" size="normal">
  <div slot="header">File Operations</div>

  <context-menu-item label="Open" icon="📂" shortcut="Ctrl+O"></context-menu-item>
  <context-menu-item label="Save" icon="💾" shortcut="Ctrl+S"></context-menu-item>

  <context-menu-separator></context-menu-separator>

  <context-menu-item label="Share">
    <context-menu>
      <context-menu-item label="Copy Link"></context-menu-item>
      <context-menu-item label="Send Email"></context-menu-item>
    </context-menu>
  </context-menu-item>

  <context-menu-separator></context-menu-separator>

  <context-menu-toggle-item label="Auto Save" checked></context-menu-toggle-item>
</context-menu>

<script type="module">
  import './src/index.ts';

  const target = document.querySelector('#target');
  const menu = document.querySelector('#menu');

  target.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    menu.open(event, { targetId: 'target' });
  });

  menu.addEventListener('menu-select', (event) => {
    console.log('selected:', event.detail.label);
  });
</script>
```

构建后可以从包入口导入：

```ts
import 'omni-ctx';
```

## 🧱 组件

### `<context-menu>`

菜单根组件。

常用属性：

| 属性 | 可选值 | 说明 |
| --- | --- | --- |
| `style-type` | `google`、`edge` | 菜单视觉风格 |
| `theme` | `light`、`dark-element`、`dark-naive` | 菜单主题 |
| `size` | `small`、`normal`、`large` | 菜单尺寸 |
| `overlay` | 布尔属性 | 打开菜单时显示遮罩层 |
| `width` | CSS 长度 | 固定菜单宽度 |
| `max-width` | CSS 长度 | 最大宽度 |
| `height` | CSS 长度 | 固定菜单高度 |
| `max-height` | CSS 长度 | 最大高度，超出时显示竖向滚动条 |
| `no-inherit-height` | 布尔属性 | 禁止子菜单从父菜单继承 `height` / `max-height`，保持自身无高度约束 |

方法：

| 方法 | 说明 |
| --- | --- |
| `open(event, input?)` | 根据鼠标事件或 `{ x, y }` 坐标打开菜单，`input` 支持 `MenuParam`、`MenuItemData[]` 或 `{ items, param?, replace? }` |
| `show(x, y, param?)` | 在指定坐标打开菜单 |
| `hide()` | 直接隐藏菜单 |
| `close()` | 触发 `before-close` 后关闭菜单 |
| `focusFirstItem()` | 聚焦第一个可用菜单项 |
| `addItem(data)` | 通过数据动态添加菜单项 |
| `addSeparator()` | 动态添加分割线 |
| `getMenuOption(id)` | 根据 id 获取动态添加的菜单配置 |
| `removeItem(id)` | 根据 id 移除通过 `addItem` 添加的菜单项 |
| `clearItems()` | 移除所有动态添加的菜单项 |

插槽：

| 插槽 | 说明 |
| --- | --- |
| 默认插槽 | 菜单主体内容 |
| `header` | 菜单头部 |
| `footer` | 菜单底部 |

### `<context-menu-item>`

普通菜单项，也可以包含子级 `<context-menu>` 作为子菜单。

属性：

| 属性 | 说明 |
| --- | --- |
| `label` | 菜单文本 |
| `icon` | 图标文本 |
| `shortcut` | 快捷键提示 |
| `disabled` | 禁用菜单项 |
| `visible="false"` | 隐藏菜单项 |
| `expand-trigger` | 子菜单展开方式，支持 `hover` 和 `click` |

### `<context-menu-separator>`

菜单分割线。

### `<context-menu-group>`

菜单分组组件，通过 `label` 属性显示分组标题。

```html
<context-menu-group label="View Mode">
  <context-menu-item label="List View"></context-menu-item>
  <context-menu-item label="Grid View"></context-menu-item>
</context-menu-group>
```

### `<context-menu-radio-group>` 和 `<context-menu-radio-item>`

单选菜单组。

```html
<context-menu-radio-group name="view-mode" value="list">
  <context-menu-radio-item label="List View" value="list"></context-menu-radio-item>
  <context-menu-radio-item label="Grid View" value="grid"></context-menu-radio-item>
</context-menu-radio-group>
```

`context-menu-radio-group` 提供 `setRadioValue(value)` 和 `getRadioValue()` 方法，并在值变化时派发 `change` 事件。

### `<context-menu-toggle-item>`

开关菜单项。

```html
<context-menu-toggle-item label="Auto Save" checked></context-menu-toggle-item>
```

点击后会切换 `checked` 状态，并派发 `toggle-change` 事件。

### `<context-menu-option-item>`

子菜单中的单选项，类似 Windows 排序菜单。同一 `name` 的项在某一个 `<context-menu>` 内自动互斥，选中项前显示小圆点 `●`。

```html
<context-menu-item label="排序" icon="↕">
  <context-menu>
    <context-menu-option-item name="sort" value="asc" label="升序"></context-menu-option-item>
    <context-menu-option-item name="sort" value="desc" label="降序"></context-menu-option-item>
    <context-menu-option-item name="sort" value="none" label="不排序" checked></context-menu-option-item>
  </context-menu>
</context-menu-item>
```

属性：

| 属性 | 说明 |
| --- | --- |
| `name` | 选项组名称，同 name 自动互斥 |
| `value` | 选项值 |
| `label` | 显示文本 |
| `checked` | 当前选中状态 |
| `disabled` | 禁用该选项 |

## 📡 事件

| 事件名 | 触发组件 | 说明 |
| --- | --- | --- |
| `menu-select` | `context-menu-item`, `context-menu-option-item` | 菜单项被选择时触发 |
| `before-close` | `context-menu` | 菜单关闭前触发，可通过 `event.preventDefault()` 阻止关闭 |
| `change` | `context-menu-radio-group` | 单选组值变化时触发 |
| `toggle-change` | `context-menu-toggle-item` | 开关项状态变化时触发 |
| `option-change` | `context-menu-option-item` | 单选项值变化时触发，detail: `{ name, value, label, item }` |

`before-close` 的 `detail.reason` 可能值包括：

```ts
'click-outside' | 'escape' | 'scroll' | 'right-click' | 'menu-select' | 'api'
```

## 🛠️ TypeScript API

### 导出的类

| 类名 | 说明 |
| --- | --- |
| `ContextMenu` | 菜单根组件类，管理菜单的打开/关闭/定位、遮罩层、动态添加项等方法 |
| `ContextMenuItem` | 普通菜单项类，支持图标、快捷键、子菜单展开（hover / click），点击派发 `menu-select` |
| `ContextMenuSeparator` | 分割线组件类，纯渲染无交互 |
| `ContextMenuGroup` | 菜单分组组件类，通过 `label` 属性显示分组标题 |
| `ContextMenuRadioGroup` | 单选组容器类，管理同组内 `radio-item` 的互斥选中逻辑，提供 `setRadioValue` / `getRadioValue` 方法 |
| `ContextMenuRadioItem` | 单选选项类，选中时显示 `●` 标记，值变化由 `radio-group` 控制 |
| `ContextMenuToggleItem` | 开关项类，点击切换 `checked` 状态并派发 `toggle-change` 事件 |
| `ContextMenuOptionItem` | 子菜单单选项类，同一 `name` 在同一个 `<context-menu>` 内自动互斥，选中项前显示小圆点 |

### 导出的函数

| 函数 | 说明 |
| --- | --- |
| `calculateMenuPosition(menu, mouseX, mouseY, vpWidth, vpHeight, submenuCtx?)` | 计算菜单在视口内的最佳显示位置，自动根据边界翻转方向，返回 `{ top, left }` |
| `handleMenuKeyboard(event, menu, activeEl?)` | 处理菜单的键盘方向键导航（↑↓←→ Enter Escape），返回 `boolean` 表示是否已处理 |
| `getThemeVariables(style?, theme?, size?)` | 根据风格、主题、尺寸三元组返回对应的 CSS 变量键值对集合 |
| `applyTheme(element, style?, theme?, size?)` | 将风格/主题/尺寸对应的 CSS 变量应用到指定元素的 `style` 上 |

### 导出的类型

| 类型 | 说明 |
| --- | --- |
| `Position` | 坐标 `{ top: number; left: number }` |
| `ViewportRect` | 视口尺寸 `{ width: number; height: number }` |
| `MenuParam` | 打开菜单时传入的上下文参数，键值对自由扩展 |
| `MenuStyle` | 菜单视觉风格：`'google' \| 'edge'` |
| `MenuTheme` | 菜单主题：`'light' \| 'dark-element' \| 'dark-naive'` |
| `MenuSize` | 菜单尺寸：`'small' \| 'normal' \| 'large'` |
| `ExpandTrigger` | 子菜单展开触发方式：`'hover' \| 'click'` |
| `MenuItemData` | `addItem()` 的参数结构，包含 `id`、`label`、`icon`、`shortcut`、`disabled`、`checked`、`name`、`value`、`type`、`children`、`handler`、`onChange` 等字段 |
| `MenuOpenConfig` | `open()` 的配置对象：`{ items, param?, replace? }` |
| `MenuOpenInput` | `open()` 支持的第二参数联合类型：`MenuParam \| MenuItemData[] \| MenuOpenConfig` |
| `MenuSelectEventDetail` | `menu-select` 事件的 detail 结构：`{ label, item, menuParam? }` |
| `MenuBeforeCloseEventDetail` | `before-close` 事件的 detail 结构：`{ reason, cancel }` |
| `RadioChangeEventDetail` | radio `change` 事件的 detail 结构：`{ name, value, label }` |
| `ToggleChangeEventDetail` | toggle `toggle-change` 事件的 detail 结构：`{ label, checked }` |
| `OptionChangeEventDetail` | option `option-change` 事件的 detail 结构：`{ name, value, label, item }` |
| `MenuGroupData` | 菜单分组数据结构：`{ label, items, groupClass?, groupStyle? }` |
| `MenuOverlayConfig` | 遮罩层配置：`{ enable, zIndex }` |
| `ContextMenuItemElement` | `ContextMenuItem` 实例接口，含 `label`、`disabled`、`visible`、`submenu`、`expandTrigger`、`focusItem()`、`blurItem()` |
| `ContextMenuElement` | `ContextMenu` 实例接口，含 `show()`、`open()`、`hide()`、`close()`、`addItem()`、`removeItem()`、`clearItems()`、`isOpen`、`menuParam` 等 |
| `ContextMenuRadioGroupElement` | `ContextMenuRadioGroup` 实例接口，含 `name`、`value`、`setRadioValue()`、`getRadioValue()` |
| `ContextMenuToggleItemElement` | `ContextMenuToggleItem` 实例接口，含 `label`、`checked`、`disabled` |
| `ContextMenuOptionItemElement` | `ContextMenuOptionItem` 实例接口，含 `name`、`value`、`label`、`checked`、`disabled` |

## ⚡ 动态添加菜单项

```ts
const menu = document.querySelector('context-menu');

menu.addItem({
  id: 'open',
  label: 'Open',
  icon: '📂',
  shortcut: 'Ctrl+O',
  handler: (param) => {
    console.log(param);
  },
});

menu.addSeparator();
menu.addItem({
  label: 'Share',
  children: [
    { label: 'Copy Link' },
    { label: 'Send Email' },
  ],
});

// 移除指定项
menu.removeItem('open');

// 清空所有动态项
menu.clearItems();

// 查询菜单是否已打开
console.log(menu.isOpen); // true | false
```

## 🧠 编程式 `open()` 用法

除了声明式在 HTML 中预先编写菜单结构外，也可以在调用 `open()` 时直接传入菜单数据。

### 1. 传入数组

```ts
const menu = document.querySelector('context-menu');

menu.open(event, [
  { label: '打开', icon: '📂', handler: () => console.log('open') },
  { type: 'separator' },
  { label: '删除', icon: '🗑️', handler: () => console.log('delete') },
]);
```

### 2. 传入配置对象

```ts
menu.open({ x: 120, y: 200 }, {
  items: [
    { label: '复制' },
    { label: '粘贴' },
  ],
  param: { source: 'editor', docId: 'A-01' },
  replace: true,
});
```

### 3. 行为说明

- `open(event, param)` 旧用法保持不变
- `open(event, items)` 会使用传入数组渲染本次菜单内容
- `open(event, { items, param, replace })` 可同时传菜单项、上下文参数和替换策略
- `replace` 默认为 `true`，只会替换上一次通过编程式 `open()` 生成的菜单项，不会删除声明式写在 DOM 中的静态菜单项
- 当前不支持 `{ open: '打开', save: '保存' }` 这类简单键值对象，对象形式必须为配置对象

## 🎨 主题定制

组件通过 CSS 自定义属性控制样式。可以直接在 CSS 中覆盖变量，也可以使用 `getThemeVariables` / `applyTheme` 在 JavaScript 中批量设置。

### 可修改的 CSS 变量

#### 菜单外观

| CSS 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--ctx-menu-bg` | 菜单背景色 | `#fff` |
| `--ctx-menu-border` | 菜单边框（完整简写） | `1px solid #e0e0e0` |
| `--ctx-menu-border-radius` | 菜单圆角半径 | `6px` |
| `--ctx-menu-shadow` | 菜单阴影（完整简写） | `0 4px 16px rgba(0,0,0,0.12)` |
| `--ctx-menu-padding` | 菜单内边距 | `4px 0` |
| `--ctx-menu-min-width` | 菜单最小宽度 | `180px` |
| `--ctx-menu-max-width` | 菜单最大宽度 | `280px` |
| `--ctx-menu-max-height` | 菜单最大高度 | `none` |
| `--ctx-menu-overflow-y` | 菜单纵向溢出行为 | `visible` |
| `--ctx-menu-scrollbar-width` | 滚动条宽度 | `5px` |
| `--ctx-menu-scrollbar-track` | 滚动条轨道颜色 | `transparent` |
| `--ctx-menu-scrollbar-thumb` | 滚动条滑块颜色 | `#c4c4c4` |
| `--ctx-menu-scrollbar-thumb-hover` | 滚动条滑块悬停颜色 | `#a0a0a0` |
| `--ctx-menu-font-family` | 菜单字体 | 系统默认 |
| `--ctx-menu-font-size` | 菜单基础字号 | `13px` |
| `--ctx-menu-text-color` | 菜单文字颜色 | `#333` |
| `--ctx-menu-z-index` | 菜单层叠顺序 | `10000` |

#### 菜单项

| CSS 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--ctx-menu-item-padding` | 菜单项内边距 | `6px 12px` |
| `--ctx-menu-item-hover-bg` | 菜单项悬停背景色 | `#f0f4ff` |
| `--ctx-menu-item-hover-text` | 菜单项悬停文字颜色 | `#1a56db` |
| `--ctx-menu-item-disabled-opacity` | 禁用项不透明度 | `0.4` |
| `--ctx-menu-item-icon-size` | 图标尺寸（宽高相等） | `16px` |
| `--ctx-menu-item-shortcut-color` | 快捷键文字颜色 | `#999` |
| `--ctx-menu-item-shortcut-font-size` | 快捷键字号 | `12px` |

#### 分割线

| CSS 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--ctx-menu-separator-color` | 分割线颜色 | `#e8e8e8` |
| `--ctx-menu-separator-margin` | 分割线外边距 | `4px 8px` |

#### 子菜单箭头

| CSS 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--ctx-menu-submenu-arrow` | 子菜单箭头字符 | `▶` |

#### 分组标题

| CSS 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--ctx-menu-group-label-color` | 分组标题颜色 | `#888` |
| `--ctx-menu-group-label-font-size` | 分组标题字号 | `11px` |
| `--ctx-menu-group-label-padding` | 分组标题内边距 | `4px 12px` |
| `--ctx-menu-group-label-font-weight` | 分组标题字重 | `600` |

#### 单选组

| CSS 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--ctx-menu-radio-checked-color` | 已选中单选标记颜色 | `#1a56db` |

#### 单选项 (Option)

| CSS 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--ctx-menu-option-checked-color` | 已选中选项小点颜色 | 继承自 `--ctx-menu-radio-checked-color` |

#### 开关 (Toggle)

| CSS 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--ctx-menu-toggle-width` | 开关宽度 | `36px` |
| `--ctx-menu-toggle-height` | 开关高度 | `20px` |
| `--ctx-menu-toggle-off-bg` | 开关关闭态背景色 | `#ccc` |
| `--ctx-menu-toggle-on-bg` | 开关打开态背景色 | `#1a56db` |
| `--ctx-menu-toggle-thumb-bg` | 开关滑块背景色 | `#fff` |

#### 遮罩层

| CSS 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `--ctx-menu-overlay-z-index` | 遮罩层层叠顺序 | `9999` |

### 使用方式

在 CSS 中直接覆盖：

```css
context-menu {
  --ctx-menu-bg: #ffffff;
  --ctx-menu-text-color: #222222;
  --ctx-menu-item-hover-bg: #f0f4ff;
  --ctx-menu-border-radius: 8px;
  --ctx-menu-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
```

在 JavaScript 中使用主题工具函数：

```ts
import { applyTheme, getThemeVariables } from 'omni-ctx';

const vars = getThemeVariables('google', 'dark-element', 'normal');
applyTheme(document.querySelector('context-menu')!, 'google', 'dark-element', 'normal');
```

## ✅ 构建与测试

```bash
# 构建 dist
bun run build

# 运行测试
bun test

# 监听测试
bun run test:watch
```

## 📁 项目结构

```text
src/
  components/      Web Component 组件实现
  utils/           定位与键盘交互工具
  styles.ts        组件样式
  themes.ts        主题变量和主题应用函数
  types.ts         TypeScript 类型定义
examples/
  index.html       本地演示页面
tests/
  *.test.ts        Bun 测试用例
```

## 📄 License

MIT
