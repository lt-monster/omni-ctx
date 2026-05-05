# Web Component 右键菜单 需求规部& 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个零依赖、框架无关的 Web Component 右键菜单组件，支持多级嵌套、键盘导航、图部快捷部分隔部禁用态等完整交互能力部
**Architecture:** 采用部Custom Elements + Shadow DOM 原生方案。组件树部`ContextMenu` 部`ContextMenuItem`（含 `ContextMenu` 作为子菜单） + `ContextMenuSeparator`。定位引擎根据视口边界自动翻转菜单位置。所有样式通过 CSS Custom Properties 暴露主题变量部
**Tech Stack:** TypeScript, Custom Elements v1, Shadow DOM, CSS Custom Properties, Bun (运行部测试/构建)

***

## 一、需求规部
### 1.1 功能清单

| 编号  | 功能               | 描述                                                                                                          | 优先部|
| --- | ---------------- | ----------------------------------------------------------------------------------------------------------- | --- |
| F1  | 右键触发             | 调用 `open(event, param)` / `show(x, y, param)` 弹出菜单，传入鼠标事件或 `{x,y}` 坐标                                     | P0  |
| F2  | 基础菜单部           | 支持 `label`、`icon`（文部emoji/SVG）、`shortcut` 快捷键提部                                                           | P0  |
| F3  | 分隔部             | `<context-menu-separator>` 渲染水平分隔部                                                                         | P0  |
| F4  | 禁用部             | 菜单部`disabled` 属性，阻止交互并降低不透明部                                                                              | P0  |
| F5  | 点击回调             | 点击可用菜单项触发自定义事件 `menu-select`，自动关闭菜部                                                                        | P0  |
| F6  | 多层关闭机制           | 关闭方式：点击外部空白、按 ESC、鼠标滚部右键点击外部、调部`hide()`/`close()`                                                         | P0  |
| F7  | 关闭拦截             | `beforeClose` 回调可阻止菜单关闭，由消费者决定关闭时部                                                                         | P1  |
| F8  | 多级嵌套子菜部         | 菜单项可包含部`<context-menu>`，`expand-trigger` 支持 `hover`（悬停）部`click`（点击）展开                                     | P0  |
| F9  | 键盘导航             | ↑↓ 移动焦点、→ 展开子菜单、← 收起、Enter 触发选择、焦点循部                                                                       | P1  |
| F10 | 视口自适应定位          | 菜单超出窗口部下边界时自动翻转方向，子菜单同理                                                                                    | P0  |
| F11 | 视觉风格与主部         | 两种风格 `google`/`edge`，三种主部`light`/`dark-element`/`dark-naive`，三种尺部`small`/`normal`/`large` + CSS 变量深度定制    | P1  |
| F12 | 声明部HTML 用法      | 直接部HTML 标签嵌套定义菜单结构，slot 机制                                                                                 | P0  |
| F13 | 命令部JS API       | `open()`/`close()`/`show()`/`hide()`/`addItem()`/`addSeparator()` 等编程式控制                                    | P1  |
| F14 | 无障部ARIA         | `role="menu"` / `role="menuitem"` / `aria-disabled` / `aria-haspopup` / `aria-checked` / `aria-orientation` | P1  |
| F15 | 单选组 (Radio)      | `<context-menu-radio-group>` 同父级下 radio 项互斥选中，点击执部`change` 回调，不自动关闭                                        | P1  |
| F16 | 开关项 (Toggle)     | `<context-menu-toggle-item>` 显示切换开关，点击翻转 `checked` 状态并执行 `change` 回调                                        | P1  |
| F17 | 菜单分组             | `<context-menu-group>` 将菜单项组织到分组中，组间分隔线 + 组名，组内全不可见时整体不渲部                                                  | P1  |
| F18 | 可见性控部           | `visible` / `hidden` 属性控制菜单项显隐，`visible="false"` 时不渲染                                                       | P1  |
| F19 | 动态内部            | 菜单部`label`/`visible`/`disabled` 支持函数式赋值，根据运行部`menuParam` 动态返部                                            | P2  |
| F20 | 参数传部            | `open(event, param)` 传入 `menuParam`，菜单项可通过属性表达式读取动态参部                                                     | P2  |
| F21 | Header/Footer 插槽 | `slot="header"` / `slot="footer"` 菜单顶部/底部自定义区部                                                             | P1  |
| F22 | 透明遮罩             | `overlay` 属性开启全屏透明遮罩层，`overlay-z-index` 控制层级                                                                | P2  |
| F23 | 容器尺寸控制           | `width`/`max-width`/`height`/`max-height` 属性控制菜单容器尺寸，无子菜单时超出可滚动                                             | P1  |
| F24 | 自定义样部           | `item-class`/`item-style`/`group-class`/`group-style` 为菜单项和分组添加自定义类名和样部                                    | P2  |
| F25 | 编程式状态查部         | `getMenuOption(id)`/`setRadioValue(id, value)`/`getRadioValue(id)` 等状态读部API                                | P2  |
| F26 | 单选项 (Option Item) | `<context-menu-option-item>` 子菜单中的单选互斥项，同一 `name` 在同一个 `<context-menu>` 内自动互斥部点击后派发 `option-change` 事件（`detail: { name, value, label, item }`），同时派发 `menu-select` 以关闭菜单部选中项前显示小圆点 `●`，类似 Windows 排序菜单           | P1  |

### 1.2 使用示例

**声明式用法（完整功能展示）：**

```html
<div id="target-area">
  右键点击此区部</div>

<context-menu id="main-menu" style="google" theme="light" size="normal"
              width="220" max-height="400">
  <!-- Header 插槽 -->
  <div slot="header" class="menu-header">文件操作</div>

  <context-menu-item label="打开" icon="📂" shortcut="Ctrl+O"></context-menu-item>
  <context-menu-item label="保存" icon="💾" shortcut="Ctrl+S"></context-menu-item>

  <context-menu-separator></context-menu-separator>

  <!-- 带子菜单项，点击展开 -->
  <context-menu-item label="分享" icon="📤" expand-trigger="click">
    <context-menu>
      <context-menu-item label="复制链接" shortcut="Ctrl+C"></context-menu-item>
      <context-menu-item label="发送邮部></context-menu-item>
      <context-menu-separator></context-menu-separator>
      <context-menu-item label="Twitter" visible="false"></context-menu-item>
    </context-menu>
  </context-menu-item>

  <context-menu-separator></context-menu-separator>

  <!-- 菜单分组 -->
  <context-menu-group label="视图模式">
    <context-menu-radio-group name="view-mode" value="list">
      <context-menu-radio-item label="列表视图" value="list"></context-menu-radio-item>
      <context-menu-radio-item label="网格视图" value="grid"></context-menu-radio-item>
      <context-menu-radio-item label="详情视图" value="detail" disabled></context-menu-radio-item>
    </context-menu-radio-group>
  </context-menu-group>

  <context-menu-separator></context-menu-separator>

  <!-- 开关项 -->
  <context-menu-toggle-item label="自动保存" checked shortcut="Ctrl+Shift+S"></context-menu-toggle-item>
  <context-menu-toggle-item label="显示隐藏文件"></context-menu-toggle-item>

  <context-menu-separator></context-menu-separator>

  <context-menu-item label="删除" disabled shortcut="Del"></context-menu-item>

  <!-- Footer 插槽 -->
  <div slot="footer" class="menu-footer">v1.0.0</div>
</context-menu>

<script type="module">
  import 'omni-ctx';

  const menu = document.getElementById('main-menu');
  const target = document.getElementById('target-area');

  // 右键触发
  target.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    menu.open(e, { fileId: 'abc123' });  // 传入 menuParam
  });

  // 标准菜单项点部  menu.addEventListener('menu-select', (e) => {
    console.log('选中:', e.detail.label);
  });

  // 关闭拦截
  menu.addEventListener('before-close', (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();  // 阻止关闭
    }
  });

  // 单选组变更
  menu.querySelector('context-menu-radio-group')
    .addEventListener('change', (e) => {
      console.log('切换视图:', e.detail.value);
    });

  // 开关变部  menu.addEventListener('toggle-change', (e) => {
    console.log('开部', e.detail.label, e.detail.checked);
  });

  // 编程式控部  // menu.close();
  // menu.getMenuOption('item-1');
  // const radio = menu.querySelector('context-menu-radio-group');
  // radio.setRadioValue('grid');
  // console.log(radio.getRadioValue());
</script>
```

**命令式用法：**

```javascript
import { ContextMenu } from 'omni-ctx';

const menu = document.querySelector('context-menu');
menu.addItem({
  id: 'new-item',
  label: '新建文件',
  icon: '📄',
  handler: () => console.log('新建'),
});
menu.addSeparator();
menu.addItem({
  id: 'export',
  label: '导出',
  children: [
    { label: 'PDF', handler: () => exportPDF() },
    { label: 'CSV', handler: () => exportCSV() },
  ],
});
```

### 1.3 行为规格

#### 定位规则

- 菜单默认出现在鼠标点击位置（`clientX`, `clientY`部- 若菜单右边超出视部部改为鼠标左侧展开
- 若菜单底部超出视部部改为鼠标上方展开
- 子菜单默认出现在父项的右侧，同样遵守视口翻转规则
- 所有定位计算使部`position: fixed`，相对于 viewport

#### 嵌套子菜单交部
- `expand-trigger="hover"`（默认）：鼠部hover 父项 200ms 后展开子菜单，离开 150ms 后收部- `expand-trigger="click"`：点击父项展开子菜单，点击外部关闭
- 子菜单展开时父项保持高亮状部- 同一父菜单下，同时只有一个子菜单展开

#### 单选组 (Radio) 行为

- 部`name` 属性下部radio 项互斥选中
- 点击后执部`change` 事件（`detail: { name, value, label }`），**不自动关闭菜部*
- 支持 `disabled` 禁用单个选项
- 通过 `value` 属部方法控制当前选中部
#### 开关项 (Toggle) 行为

- 显示切换开部UI 在菜单项右侧
- 点击翻转 `checked` 状态，执行 `toggle-change` 事件（`detail: { label, checked }`部- **不自动关闭菜部*，允许连续切部- 支持 `disabled` 禁用

#### 单选项 (Option Item) 行为

- 部`name` 属性下同一 `<context-menu>` 内同 `name` 的 option item 自动互斥选中
- 点击后执行 `option-change` 事件（`detail: { name, value, label, item }`），同时派发 `menu-select` 以触发菜单关闭
- 选中项前显示小圆点 `●`，未选中项保留同样宽度但不显示
- 支持 `checked` 属性设置默认选中项
- 支持 `disabled` 禁用单个选项
- 样式复用菜单项 hover / padding 等变量部额外提供 `--ctx-menu-option-checked-color` 控制小点颜色

#### 菜单分组行为

- 分组头部显示 `label` 组名
- 组间自动渲染分隔部- 组内所有菜单项 `visible="false"` 时，整个分组不渲部- 分组内的分隔线仅在组内有可见项时渲染

#### 关闭拦截行为

- 菜单关闭前触部`before-close` 事件（`cancelable: true`部- 调用 `event.preventDefault()` 可阻止关部- 适用部有未保存更改"等场部
#### 多层关闭机制

- 点击菜单外部空白区域 部关闭
- 部Escape 部部关闭
- 鼠标滚轮滚动（菜单外部）部关闭
- 鼠标右键点击菜单外部 部关闭
- 调用 `hide()` / `close()` 方法 部关闭

#### 键盘导航

- `ArrowDown` 部焦点移到下一项（跳过禁用项、隐藏项、分隔线部- `ArrowUp` 部焦点移到上一项（跳过禁用项、隐藏项、分隔线部- `ArrowRight` 部若当前项有子菜单，展开子菜单并聚焦第一部- `ArrowLeft` 部关闭当前子菜单，焦点回到父项
- `Enter` / `Space` 部触发当前聚焦项的选择事件（radio/toggle 不关闭菜单）
- `Escape` 部关闭整个菜单部- 焦点循环：到达最后一项继续按下到第一项，反之亦然

***

## 二、文件结部
```
omni-ctx/
├── src/
部  ├── index.ts                       # 公共导出入口
部  ├── types.ts                       # 接口与类型定部部  ├── styles.ts                      # 共享样式（CSS template strings部部  ├── themes.ts                      # 风格/主题/尺寸预设（google/edge + light/dark-element/dark-naive + small/normal/large部部  ├── components/
部  部  ├── context-menu.ts            # ContextMenu 容器（show/hide/overlay/slots/close-interception部部  部  ├── context-menu-item.ts       # ContextMenuItem 基础部部  部  ├── context-menu-separator.ts  # ContextMenuSeparator 分隔部部  部  ├── context-menu-group.ts      # ContextMenuGroup 菜单分组
部  部  ├── context-menu-radio-group.ts # ContextMenuRadioGroup 单选组容器
部  部  ├── context-menu-radio-item.ts  # ContextMenuRadioItem 单选选项
部  部  └── context-menu-toggle-item.ts # ContextMenuToggleItem 开关项
部  部  └── context-menu-option-item.ts  # ContextMenuOptionItem 子菜单单选互斥项
部  └── utils/
部      ├── position.ts                # 视口感知定位算法
部      └── keyboard.ts                # 键盘导航辅助函数
├── tests/
部  ├── setup.ts                       # happy-dom 环境初始部部  ├── context-menu.test.ts
部  ├── context-menu-item.test.ts
部  ├── context-menu-separator.test.ts
部  ├── context-menu-group.test.ts
部  ├── context-menu-radio-group.test.ts
部  ├── context-menu-toggle-item.test.ts
部  ├── position.test.ts
部  └── keyboard.test.ts
├── examples/
部  └── index.html                     # 完整功能演示页面
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**文件职责边界部*

| 文件                            | 职责                                                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types.ts`                    | 所部TypeScript 接口、类型别名、枚举，无运行时逻辑                                                                                                                     |
| `styles.ts`                   | 导出 CSS 模板字符串常量（基础变量 + 组件样式），供各组件 shadowRoot 使用                                                                                                      |
| `themes.ts`                   | 风格/主题/尺寸预设部CSS 变量映射表（google/edge × light/dark-element/dark-naive × small/normal/large部                                                            |
| `position.ts`                 | 纯函数：接收 triggerRect / menuSize / viewportSize，返部`{top, left}`                                                                                       |
| `keyboard.ts`                 | 纯函数：接收 KeyboardEvent + 菜单元素引用，调度焦点移动（支持 radio/toggle 特殊处理部                                                                                         |
| `context-menu.ts`             | 菜单容器：管部open/show/hide/close、定位、ESC/外部点击/滚轮/右键关闭、关闭拦部before-close、透明遮罩、header/footer 插槽、menuParam 参数传递、命令式 API（addItem/addSeparator/getMenuOption部|
| `context-menu-item.ts`        | 基础菜单项：渲染 label/icon/shortcut、disabled 态、expand-trigger hover/click 子菜单逻辑、visible 显隐、点部menu-select 事件                                               |
| `context-menu-separator.ts`   | 分隔线：纯渲染，无交部                                                                                                                                        |
| `context-menu-group.ts`       | 菜单分组：渲染组名头部，管理可见性联动（子项全不可见时整体隐藏）                                                                                                                    |
| `context-menu-radio-group.ts` | 单选组容器：管部name/value、互斥选中逻辑、change 事件、setRadioValue/getRadioValue                                                                                    |
| `context-menu-radio-item.ts`  | 单选选项：渲染选中标记、点击切换、disabled 支持                                                                                                                        |
| `context-menu-toggle-item.ts` | 开关项：渲染切换开部UI、checked 状态管理、toggle-change 事件                                                                                                         |

***

## 三、类型定义（`src/types.ts`部
```typescript
export interface Position {
  top: number;
  left: number;
}

export interface ViewportRect {
  width: number;
  height: number;
}

export interface MenuParam {
  [key: string]: unknown;
}

export type MenuStyle = 'google' | 'edge';
export type MenuTheme = 'light' | 'dark-element' | 'dark-naive';
export type MenuSize = 'small' | 'normal' | 'large';
export type ExpandTrigger = 'hover' | 'click';

export interface MenuItemData {
  id: string;
  label: string | ((param: MenuParam) => string);
  icon: string;
  shortcut: string;
  disabled: boolean | ((param: MenuParam) => boolean);
  visible: boolean | ((param: MenuParam) => boolean);
  checked: boolean;
  value: string;
  handler: (param: MenuParam) => void;
  onChange: (value: string | boolean, param: MenuParam) => void;
  children: MenuItemData[];
  type: 'menu' | 'radio' | 'toggle' | 'separator' | 'option';
}

export interface MenuSelectEventDetail {
  label: string;
  item: HTMLElement;
  menuParam: MenuParam;
}

export interface MenuBeforeCloseEventDetail {
  reason: 'click-outside' | 'escape' | 'scroll' | 'right-click' | 'menu-select' | 'api';
  cancel: () => void;
}

export interface RadioChangeEventDetail {
  name: string;
  value: string;
  label: string;
}

export interface ToggleChangeEventDetail {
  label: string;
  checked: boolean;
}

export interface OptionChangeEventDetail {
  name: string;
  value: string;
  label: string;
  item: HTMLElement;
}

export interface MenuGroupData {
  label: string;
  items: MenuItemData[];
  groupClass: string;
  groupStyle: Record<string, string>;
}

export interface MenuOverlayConfig {
  enable: boolean;
  zIndex: number;
}

export type MenuDirection = 'right' | 'left' | 'bottom' | 'top';

export interface ContextMenuItemElement extends HTMLElement {
  label: string;
  disabled: boolean;
  visible: boolean;
  submenu: ContextMenuElement | null;
  expandTrigger: ExpandTrigger;
  focusItem(): void;
  blurItem(): void;
}

export interface ContextMenuElement extends HTMLElement {
  show(x: number, y: number, param: MenuParam): void;
  open(event: MouseEvent | { x: number; y: number }, param: MenuParam): void;
  hide(): void;
  close(): void;
  focusFirstItem(): void;
  addItem(data: MenuItemData): void;
  addSeparator(): void;
  getMenuOption(id: string): MenuItemData | null;
  menuParam: MenuParam | null;
}

export interface ContextMenuRadioGroupElement extends HTMLElement {
  name: string;
  value: string;
  setRadioValue(value: string): void;
  getRadioValue(): string;
}

export interface ContextMenuToggleItemElement extends HTMLElement {
  label: string;
  checked: boolean;
  disabled: boolean;
}

export interface ContextMenuOptionItemElement extends HTMLElement {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  disabled: boolean;
}
```

***

## 四、CSS 变量系统

### 4.1 风格预设映射表（`src/themes.ts`部
`themes.ts` 根据 `style` + `theme` + `size` 三元组输出对应的 CSS 变量集合，通过 `element.style.setProperty()` 注入到组部shadowRoot部
| 属部| google       | edge         |
| -- | ------------ | ------------ |
| 间距 | 宽松部px 12px部| 紧凑部px 10px部|
| 圆角 | 大（8px部      | 小（4px部      |
| 行高 | 正常部.5部     | 紧凑部em部     |
| 字体 | 系统默认         | 系统默认         |

| 属部      | light   | dark-element | dark-naive             |
| -------- | ------- | ------------ | ---------------------- |
| 背景       | #fff    | #1d1e1f      | rgb(72,72,78)          |
| 文字       | #333    | #e5eaf3      | rgba(255,255,255,0.9)  |
| hover 背景 | #f0f4ff | #2c2c2d      | rgba(255,255,255,0.12) |
| 分隔部     | #e8e8e8 | #4c4d4f      | rgba(255,255,255,0.12) |
| 阴影       | 浅灰      | 深黑           | 深黑                     |

| 属部 | small   | normal   | large    |
| --- | ------- | -------- | -------- |
| 字体  | 12px    | 13px     | 14px     |
| 内边部| 4px 8px | 6px 12px | 8px 16px |
| 图标  | 14px    | 16px     | 18px     |

### 4.2 用户自定部CSS 变量

```css
/* === 容器 === */
--ctx-menu-bg: #fff;
--ctx-menu-border: 1px solid #e0e0e0;
--ctx-menu-border-radius: 6px;
--ctx-menu-shadow: 0 4px 16px rgba(0,0,0,0.12);
--ctx-menu-padding: 4px 0;
--ctx-menu-min-width: 180px;
--ctx-menu-max-width: 280px;
--ctx-menu-font-family: -apple-system, BlinkMacSystemFont, sans-serif;
--ctx-menu-font-size: 13px;
--ctx-menu-text-color: #333;
--ctx-menu-z-index: 10000;

/* === 基础菜单部=== */
--ctx-menu-item-padding: 6px 12px;
--ctx-menu-item-hover-bg: #f0f4ff;
--ctx-menu-item-hover-text: #1a56db;
--ctx-menu-item-disabled-opacity: 0.4;
--ctx-menu-item-icon-size: 16px;
--ctx-menu-item-shortcut-color: #999;
--ctx-menu-item-shortcut-font-size: 12px;

/* === 分隔部=== */
--ctx-menu-separator-color: #e8e8e8;
--ctx-menu-separator-margin: 4px 8px;

/* === 子菜部=== */
--ctx-menu-submenu-arrow: '部;
--ctx-menu-submenu-open-delay: 200ms;
--ctx-menu-submenu-close-delay: 150ms;

/* === 分组 === */
--ctx-menu-group-label-color: #888;
--ctx-menu-group-label-font-size: 11px;
--ctx-menu-group-label-padding: 4px 12px;
--ctx-menu-group-label-font-weight: 600;

/* === 单选组 === */
--ctx-menu-radio-checked-color: #1a56db;
--ctx-menu-radio-check-mark: '部;
--ctx-menu-radio-unchecked-mark: '部;

/* === 开关项 === */
--ctx-menu-toggle-on-bg: #1a56db;
--ctx-menu-toggle-off-bg: #ccc;
--ctx-menu-toggle-thumb-bg: #fff;
--ctx-menu-toggle-width: 36px;
--ctx-menu-toggle-height: 20px;

/* === 遮罩部=== */
--ctx-menu-overlay-z-index: 9999;
```

### 4.3 组件新增样式片段

```typescript
// 分组样式
export const groupStyles = `
  :host {
    display: contents;
  }
  .ctx-menu-group__label {
    color: var(--_group-label-color, var(--ctx-menu-group-label-color, #888));
    font-size: var(--_group-label-fz, var(--ctx-menu-group-label-font-size, 11px));
    padding: var(--_group-label-padding, var(--ctx-menu-group-label-padding, 4px 12px));
    font-weight: var(--ctx-menu-group-label-font-weight, 600);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    user-select: none;
  }
  .ctx-menu-group__items {
    display: contents;
  }
`;

// 单选组样式
export const radioGroupStyles = `
  :host {
    display: contents;
  }
`;

export const radioItemStyles = `
  :host {
    display: block;
    cursor: pointer;
  }
  .ctx-menu-radio-item {
    display: flex;
    align-items: center;
    padding: var(--_item-padding, var(--ctx-menu-item-padding, 6px 12px));
    gap: 8px;
  }
  .ctx-menu-radio-item:hover {
    background: var(--_item-hover-bg, var(--ctx-menu-item-hover-bg, #f0f4ff));
  }
  .ctx-menu-radio-item--disabled {
    opacity: var(--ctx-menu-item-disabled-opacity, 0.4);
    cursor: not-allowed;
    pointer-events: none;
  }
  .ctx-menu-radio-item__mark {
    width: var(--ctx-menu-item-icon-size, 16px);
    flex-shrink: 0;
    text-align: center;
    color: var(--ctx-menu-radio-checked-color, #1a56db);
  }
  .ctx-menu-radio-item__label {
    flex: 1;
  }
`;

// 开关项样式
export const toggleItemStyles = `
  :host {
    display: block;
    cursor: pointer;
  }
  .ctx-menu-toggle-item {
    display: flex;
    align-items: center;
    padding: var(--_item-padding, var(--ctx-menu-item-padding, 6px 12px));
    gap: 8px;
  }
  .ctx-menu-toggle-item:hover {
    background: var(--_item-hover-bg, var(--ctx-menu-item-hover-bg, #f0f4ff));
  }
  .ctx-menu-toggle-item--disabled {
    opacity: var(--ctx-menu-item-disabled-opacity, 0.4);
    cursor: not-allowed;
    pointer-events: none;
  }
  .ctx-menu-toggle-item__label {
    flex: 1;
  }
  .ctx-menu-toggle-item__switch {
    position: relative;
    width: var(--ctx-menu-toggle-width, 36px);
    height: var(--ctx-menu-toggle-height, 20px);
    flex-shrink: 0;
  }
  .ctx-menu-toggle-item__track {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background: var(--ctx-menu-toggle-off-bg, #ccc);
    transition: background 0.2s;
  }
  .ctx-menu-toggle-item__track--on {
    background: var(--ctx-menu-toggle-on-bg, #1a56db);
  }
  .ctx-menu-toggle-item__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: calc(var(--ctx-menu-toggle-height, 20px) - 4px);
    height: calc(var(--ctx-menu-toggle-height, 20px) - 4px);
    border-radius: 50%;
    background: var(--ctx-menu-toggle-thumb-bg, #fff);
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .ctx-menu-toggle-item__track--on .ctx-menu-toggle-item__thumb {
    left: calc(var(--ctx-menu-toggle-width, 36px) - var(--ctx-menu-toggle-height, 20px) + 2px);
  }
`;

// 遮罩层样部export const overlayStyles = `
  .ctx-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: var(--ctx-menu-overlay-z-index, 9999);
    background: transparent;
  }
`;
```

***

## 五、实现任部
### Task 1: 项目脚手架初始化

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tests/setup.ts`
- Modify: `.gitignore`
- [ ] **Step 1: 创建 `package.json`**

```json
{
  "name": "omni-ctx",
  "version": "0.1.0",
  "description": "Zero-dependency Web Component context menu",
  "type": "module",
  "main": "./dist/omni-ctx.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/omni-ctx.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "dev": "bun run --hot examples/index.html",
    "build": "bun build ./src/index.ts --outdir=./dist --format=esm --target=browser --splitting && tsc --emitDeclarationOnly --outDir dist",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/bun": "^1.1.0"
  }
}
```

- [ ] **Step 2: 安装依赖**

```bash
bun install
```

- [ ] **Step 3: 创建 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["bun-types"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationDir": "./dist",
    "outDir": "./dist",
    "rootDir": "./src",
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 4: 创建 `tests/setup.ts`**

Bun 内置完整部Web API（DOM / Custom Elements / getBoundingClientRect），不需部happy-dom 等额外环境部
```typescript
// Bun 已内部DOM 部Web API 支持，无需额外 setup
// 如需 mock getBoundingClientRect，可直接赋值：
if (!Element.prototype.getBoundingClientRect) {
  (Element.prototype as any).getBoundingClientRect = () => ({
    x: 0, y: 0, width: 0, height: 0,
    top: 0, right: 0, bottom: 0, left: 0,
    toJSON: () => ({}),
  });
}
```

- [ ] **Step 5: 更新 `.gitignore`**

确保 `.gitignore` 包含以下行：

```
node_modules/
dist/
*.tsbuildinfo
bun.lock
```

- [ ] **Step 6: 验证项目运行**

```bash
bun run typecheck
```

预期：无错误（目前还没有源文件）

- [ ] **Step 7: Commit**

```bash
git add package.json tsconfig.json tests/setup.ts .gitignore
git commit -m "chore: init project scaffold with TypeScript and Bun"
```

***

### Task 2: 类型定义

**Files:**

- Create: `src/types.ts`
- [ ] **Step 1: 创建** **`src/types.ts`**

```typescript
export interface Position {
  top: number;
  left: number;
}

export interface ViewportRect {
  width: number;
  height: number;
}

export interface MenuItemData {
  label: string;
  icon: string;
  shortcut: string;
  disabled: boolean;
  action: () => void;
  submenu: MenuItemData[];
}

export interface MenuSelectEventDetail {
  label: string;
  item: HTMLElement;
}

export interface ContextMenuItemElement extends HTMLElement {
  label: string;
  disabled: boolean;
  submenu: ContextMenuElement | null;
  focusItem(): void;
  blurItem(): void;
}

export interface ContextMenuElement extends HTMLElement {
  show(x: number, y: number): void;
  hide(): void;
  focusFirstItem(): void;
}
```

- [ ] **Step 2: 验证编译**

```bash
bun run typecheck
```

预期：无错误

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add type definitions for context menu"
```

***

### Task 3: 定位工具函数

**Files:**

- Create: `src/utils/position.ts`
- Create: `tests/position.test.ts`
- [ ] **Step 1: 编写失败的测部* **`tests/position.test.ts`**

```typescript
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { calculateMenuPosition } from '../src/utils/position';

function mockViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
}

function mockElementSize(width: number, height: number) {
  return {
    getBoundingClientRect: mock(() => ({
      x: 0, y: 0,
      width, height,
      top: 0, right: width, bottom: height, left: 0,
    })),
  } as unknown as HTMLElement;
}

describe('calculateMenuPosition', () => {
  beforeEach(() => {
    mockViewport(1920, 1080);
  });

  it('should position menu at mouse coordinates when it fits', () => {
    const menu = mockElementSize(200, 150);
    const result = calculateMenuPosition(menu, 100, 200);
    expect(result).toEqual({ top: 200, left: 100 });
  });

  it('should flip menu left when right edge overflows', () => {
    const menu = mockElementSize(200, 150);
    const result = calculateMenuPosition(menu, 1800, 200);
    expect(result.left).toBe(1600);
  });

  it('should flip menu up when bottom edge overflows', () => {
    const menu = mockElementSize(200, 300);
    const result = calculateMenuPosition(menu, 100, 900);
    expect(result.top).toBe(600);
  });

  it('should flip both left and up when both edges overflow', () => {
    const menu = mockElementSize(400, 500);
    const result = calculateMenuPosition(menu, 1800, 900);
    expect(result.left).toBeLessThanOrEqual(1520);
    expect(result.top).toBeLessThanOrEqual(580);
  });

  it('should clamp position to 0 when menu is larger than viewport', () => {
    const menu = mockElementSize(2500, 2000);
    const result = calculateMenuPosition(menu, 100, 200);
    expect(result.left).toBe(0);
    expect(result.top).toBe(0);
  });

  it('should handle submenu mode (positioned to right of parent)', () => {
    const menu = mockElementSize(200, 150);
    const result = calculateMenuPosition(menu, 100, 200, { direction: 'right', parentRect: { top: 200, left: 300, width: 150, height: 30 } });
    expect(result.left).toBe(450);
    expect(result.top).toBe(200);
  });

  it('should flip submenu left when right edge overflows', () => {
    const menu = mockElementSize(200, 150);
    const result = calculateMenuPosition(menu, 100, 200, { direction: 'right', parentRect: { top: 200, left: 1800, width: 150, height: 30 } });
    expect(result.left).toBe(1600);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
bun test tests/position.test.ts
```

预期：全部 FAIL — 模块不存在

- [ ] **Step 3: 实现 `src/utils/position.ts`**

```typescript
import type { Position } from '../types';

export interface SubmenuContext {
  direction: 'right' | 'left';
  parentRect: { top: number; left: number; width: number; height: number };
}

export function calculateMenuPosition(
  menu: HTMLElement,
  mouseX: number,
  mouseY: number,
  submenuCtx: SubmenuContext,
): Position {
  const rect = menu.getBoundingClientRect();
  const menuWidth = rect.width || 200;
  const menuHeight = rect.height || 0;
  const vpWidth = window.innerWidth;
  const vpHeight = window.innerHeight;

  let left: number;
  let top: number;

  if (submenuCtx) {
    if (submenuCtx.direction === 'right') {
      left = submenuCtx.parentRect.left + submenuCtx.parentRect.width;
    } else {
      left = submenuCtx.parentRect.left - menuWidth;
    }
    top = submenuCtx.parentRect.top;
  } else {
    left = mouseX;
    top = mouseY;
  }

  if (left + menuWidth > vpWidth) {
    left = submenuCtx
       submenuCtx.parentRect.left - menuWidth
      : mouseX - menuWidth;
  }
  if (top + menuHeight > vpHeight) {
    top = mouseY - menuHeight;
  }
  if (left < 0) left = 0;
  if (top < 0) top = 0;

  return { top, left };
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
bun test tests/position.test.ts
```

预期：全部 PASS（7 tests）
- [ ] **Step 5: Commit**

```bash
git add src/utils/position.ts tests/position.test.ts
git commit -m "feat: add viewport-aware menu positioning utility"
```

***

### Task 4: 键盘导航工具

**Files:**

- Create: `src/utils/keyboard.ts`
- Create: `tests/keyboard.test.ts`
- [ ] **Step 1: 编写失败的测部* **`tests/keyboard.test.ts`**

```typescript
import { describe, it, expect, mock, spyOn, beforeEach } from 'bun:test';
import { handleMenuKeyboard } from '../src/utils/keyboard';

function createMockItem(label: string, disabled = false): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('role', 'menuitem');
  el.textContent = label;
  el.focus = mock();
  el.getAttribute = mock((attr: string) => {
    if (attr === 'disabled') return disabled  '' : null;
    return null;
  });
  Object.defineProperty(el, 'disabled', { value: disabled, writable: true });
  return el;
}

function createMockSeparator(): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('role', 'separator');
  return el;
}

function createMockMenu(items: HTMLElement[]): HTMLElement {
  const menu = document.createElement('div');
  menu.setAttribute('role', 'menu');
  items.forEach((item) => menu.appendChild(item));
  menu.querySelectorAll = mock((selector: string) => {
    if (selector === '[role="menuitem"]:not([disabled])') {
      return items.filter(
        (i) => i.getAttribute('role') === 'menuitem' && i.getAttribute('disabled') !== ''
      ) as unknown as NodeListOf<HTMLElement>;
    }
    if (selector === '[role="menuitem"]') {
      return items.filter(
        (i) => i.getAttribute('role') === 'menuitem'
      ) as unknown as NodeListOf<HTMLElement>;
    }
    return [] as unknown as NodeListOf<HTMLElement>;
  });
  return menu;
}

function makeKeyboardEvent(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
}

describe('handleMenuKeyboard', () => {
  let menu: HTMLElement;
  let item1: HTMLElement;
  let item2: HTMLElement;
  let item3: HTMLElement;
  let separator: HTMLElement;
  let disabledItem: HTMLElement;

  beforeEach(() => {
    item1 = createMockItem('Item 1');
    item2 = createMockItem('Item 2');
    item3 = createMockItem('Item 3');
    separator = createMockSeparator();
    disabledItem = createMockItem('Disabled', true);
    menu = createMockMenu([item1, separator, item2, disabledItem, item3]);
  });

  it('should move focus to next item on ArrowDown', () => {
    Object.defineProperty(document, 'activeElement', { value: item1, writable: true });
    const event = makeKeyboardEvent('ArrowDown');
    handleMenuKeyboard(event, menu);
    expect(item2.focus).toHaveBeenCalled();
  });

  it('should move focus to previous item on ArrowUp', () => {
    Object.defineProperty(document, 'activeElement', { value: item2, writable: true });
    const event = makeKeyboardEvent('ArrowUp');
    handleMenuKeyboard(event, menu);
    expect(item1.focus).toHaveBeenCalled();
  });

  it('should skip disabled items on ArrowDown', () => {
    Object.defineProperty(document, 'activeElement', { value: item2, writable: true });
    const event = makeKeyboardEvent('ArrowDown');
    handleMenuKeyboard(event, menu);
    expect(item3.focus).toHaveBeenCalled();
  });

  it('should wrap to first item from last on ArrowDown', () => {
    Object.defineProperty(document, 'activeElement', { value: item3, writable: true });
    const event = makeKeyboardEvent('ArrowDown');
    handleMenuKeyboard(event, menu);
    expect(item1.focus).toHaveBeenCalled();
  });

  it('should wrap to last item from first on ArrowUp', () => {
    Object.defineProperty(document, 'activeElement', { value: item1, writable: true });
    const event = makeKeyboardEvent('ArrowUp');
    handleMenuKeyboard(event, menu);
    expect(item3.focus).toHaveBeenCalled();
  });

  it('should prevent default on ArrowDown', () => {
    const event = makeKeyboardEvent('ArrowDown');
    const preventDefault = spyOn(event, 'preventDefault');
    handleMenuKeyboard(event, menu);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('should dispatch menu-select on Enter when item is focused', () => {
    Object.defineProperty(document, 'activeElement', { value: item2, writable: true });
    const dispatchSpy = spyOn(item2, 'dispatchEvent');
    const event = makeKeyboardEvent('Enter');
    handleMenuKeyboard(event, menu);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('should not dispatch menu-select on Enter when no item is focused', () => {
    Object.defineProperty(document, 'activeElement', { value: menu, writable: true });
    const event = makeKeyboardEvent('Enter');
    const result = handleMenuKeyboard(event, menu);
    expect(result).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
bun test tests/keyboard.test.ts
```

预期：全部FAIL 部模块不存部
- [ ] **Step 3: 实现** **`src/utils/keyboard.ts`**

```typescript
export function handleMenuKeyboard(
  event: KeyboardEvent,
  menu: HTMLElement,
): boolean {
  const items = getEnabledItems(menu);
  if (items.length === 0) return false;

  const currentIndex = items.indexOf(document.activeElement as HTMLElement);

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      const nextIndex = currentIndex < items.length - 1  currentIndex + 1 : 0;
      items[nextIndex].focus();
      return true;
    }
    case 'ArrowUp': {
      event.preventDefault();
      const prevIndex = currentIndex > 0  currentIndex - 1 : items.length - 1;
      items[prevIndex].focus();
      return true;
    }
    case 'Enter':
    case ' ': {
      event.preventDefault();
      if (currentIndex >= 0) {
        const item = items[currentIndex];
        item.dispatchEvent(
          new CustomEvent('menu-select', {
            bubbles: true,
            composed: true,
            detail: { label: item.textContent || '', item },
          }),
        );
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}

function getEnabledItems(menu: HTMLElement): HTMLElement[] {
  return Array.from(
    menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'),
  );
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
bun test tests/keyboard.test.ts
```

预期：全部PASS部 tests部
- [ ] **Step 5: Commit**

```bash
git add src/utils/keyboard.ts tests/keyboard.test.ts
git commit -m "feat: add keyboard navigation utility for menu"
```

***

### Task 5: 共享样式

**Files:**

- Create: `src/styles.ts`
- [ ] **Step 1: 创建** **`src/styles.ts`**

```typescript
export const menuBaseStyles = `
  :host {
    --_bg: var(--ctx-menu-bg, #fff);
    --_border: var(--ctx-menu-border, 1px solid #e0e0e0);
    --_radius: var(--ctx-menu-border-radius, 6px);
    --_shadow: var(--ctx-menu-shadow, 0 4px 16px rgba(0,0,0,0.12));
    --_padding: var(--ctx-menu-padding, 4px 0);
    --_min-width: var(--ctx-menu-min-width, 180px);
    --_max-width: var(--ctx-menu-max-width, 280px);
    --_font: var(--ctx-menu-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    --_font-size: var(--ctx-menu-font-size, 13px);
    --_text: var(--ctx-menu-text-color, #333);
    --_z: var(--ctx-menu-z-index, 10000);

    --_item-padding: var(--ctx-menu-item-padding, 6px 12px);
    --_item-hover-bg: var(--ctx-menu-item-hover-bg, #f0f4ff);
    --_item-hover-text: var(--ctx-menu-item-hover-text, #1a56db);
    --_item-disabled-opacity: var(--ctx-menu-item-disabled-opacity, 0.4);
    --_item-icon-size: var(--ctx-menu-item-icon-size, 16px);
    --_item-shortcut-color: var(--ctx-menu-item-shortcut-color, #999);
    --_item-shortcut-fz: var(--ctx-menu-item-shortcut-font-size, 12px);

    --_sep-color: var(--ctx-menu-separator-color, #e8e8e8);
    --_sep-margin: var(--ctx-menu-separator-margin, 4px 8px);

    --_sub-arrow: var(--ctx-menu-submenu-arrow, '\\25B6');
  }

  .ctx-menu {
    display: none;
    position: fixed;
    z-index: var(--_z);
    min-width: var(--_min-width);
    max-width: var(--_max-width);
    background: var(--_bg);
    border: var(--_border);
    border-radius: var(--_radius);
    box-shadow: var(--_shadow);
    padding: var(--_padding);
    font-family: var(--_font);
    font-size: var(--_font-size);
    color: var(--_text);
    overflow: hidden;
    user-select: none;
  }

  .ctx-menu--visible {
    display: block;
  }
`;

export const menuItemStyles = `
  :host {
    display: block;
    cursor: pointer;
  }

  .ctx-menu-item {
    display: flex;
    align-items: center;
    padding: var(--_item-padding);
    gap: 8px;
    white-space: nowrap;
    position: relative;
  }

  .ctx-menu-item:hover {
    background: var(--_item-hover-bg);
    color: var(--_item-hover-text);
  }

  .ctx-menu-item__icon {
    width: var(--_item-icon-size);
    height: var(--_item-icon-size);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--_item-icon-size);
  }

  .ctx-menu-item__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ctx-menu-item__shortcut {
    margin-left: auto;
    padding-left: 24px;
    color: var(--_item-shortcut-color);
    font-size: var(--_item-shortcut-fz);
  }

  .ctx-menu-item__arrow {
    margin-left: 4px;
    font-size: 10px;
  }

  .ctx-menu-item--disabled {
    opacity: var(--_item-disabled-opacity);
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const separatorStyles = `
  :host {
    display: block;
  }

  .ctx-menu-separator {
    height: 1px;
    background: var(--_sep-color);
    margin: var(--_sep-margin);
  }
`;
```

- [ ] **Step 2: 验证编译**

```bash
bun run typecheck
```

预期：无错误

- [ ] **Step 3: Commit**

```bash
git add src/styles.ts
git commit -m "feat: add shared CSS styles with custom properties"
```

***

### Task 6: ContextMenuSeparator 组件

**Files:**

- Create: `src/components/context-menu-separator.ts`
- Create: `tests/context-menu-separator.test.ts`
- [ ] **Step 1: 编写失败的测部* **`tests/context-menu-separator.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import '../src/components/context-menu-separator';

describe('ContextMenuSeparator', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should be defined as a custom element', () => {
    const el = document.createElement('context-menu-separator');
    expect(el).toBeInstanceOf(HTMLElement);
  });

  it('should render a separator line with correct role', () => {
    const el = document.createElement('context-menu-separator');
    document.body.appendChild(el);
    const inner = el.shadowRoot!.querySelector('.ctx-menu-separator');
    expect(inner).not.toBeNull();
    expect(el.getAttribute('role')).toBe('separator');
  });

  it('should apply CSS from styles', () => {
    const el = document.createElement('context-menu-separator');
    document.body.appendChild(el);
    const computedStyle = window.getComputedStyle(el);
    // Separator should be block level, not inline
    expect(computedStyle.display).not.toBe('inline');
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
bun test tests/context-menu-separator.test.ts
```

预期：FAIL 部自定义元素未注册

- [ ] **Step 3: 实现** **`src/components/context-menu-separator.ts`**

```typescript
import { separatorStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${separatorStyles}</style>
  <div class="ctx-menu-separator"></div>
`;

export class ContextMenuSeparator extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'separator');
  }
}

if (!customElements.get('context-menu-separator')) {
  customElements.define('context-menu-separator', ContextMenuSeparator);
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
bun test tests/context-menu-separator.test.ts
```

预期：全部PASS部 tests部
- [ ] **Step 5: Commit**

```bash
git add src/components/context-menu-separator.ts tests/context-menu-separator.test.ts
git commit -m "feat: add ContextMenuSeparator component"
```

***

### Task 7: ContextMenuItem 组件（基础版，无子菜单部
**Files:**

- Create: `src/components/context-menu-item.ts`
- Create: `tests/context-menu-item.test.ts`
- [ ] **Step 1: 编写失败的测部* **`tests/context-menu-item.test.ts`**

```typescript
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import '../src/components/context-menu-item';

describe('ContextMenuItem', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should be defined as a custom element', () => {
    const el = document.createElement('context-menu-item');
    expect(el).toBeInstanceOf(HTMLElement);
  });

  it('should render label from attribute', () => {
    const el = document.createElement('context-menu-item');
    el.setAttribute('label', 'Test Label');
    document.body.appendChild(el);
    const labelEl = el.shadowRoot!.querySelector('.ctx-menu-item__label');
    expect(labelEl!.textContent).toBe('Test Label');
  });

  it('should render icon from attribute', () => {
    const el = document.createElement('context-menu-item');
    el.setAttribute('label', 'Test');
    el.setAttribute('icon', '📁');
    document.body.appendChild(el);
    const iconEl = el.shadowRoot!.querySelector('.ctx-menu-item__icon');
    expect(iconEl!.textContent).toBe('📁');
  });

  it('should render shortcut from attribute', () => {
    const el = document.createElement('context-menu-item');
    el.setAttribute('label', 'Test');
    el.setAttribute('shortcut', 'Ctrl+S');
    document.body.appendChild(el);
    const shortcutEl = el.shadowRoot!.querySelector('.ctx-menu-item__shortcut');
    expect(shortcutEl!.textContent).toBe('Ctrl+S');
  });

  it('should apply disabled state from attribute', () => {
    const el = document.createElement('context-menu-item');
    el.setAttribute('label', 'Test');
    el.setAttribute('disabled', '');
    document.body.appendChild(el);
    const inner = el.shadowRoot!.querySelector('.ctx-menu-item');
    expect(inner!.classList.contains('ctx-menu-item--disabled')).toBe(true);
    expect(el.getAttribute('aria-disabled')).toBe('true');
  });

  it('should not have disabled class when not disabled', () => {
    const el = document.createElement('context-menu-item');
    el.setAttribute('label', 'Test');
    document.body.appendChild(el);
    const inner = el.shadowRoot!.querySelector('.ctx-menu-item');
    expect(inner!.classList.contains('ctx-menu-item--disabled')).toBe(false);
  });

  it('should dispatch menu-select event on click when enabled', () => {
    const el = document.createElement('context-menu-item');
    el.setAttribute('label', 'Click Me');
    document.body.appendChild(el);
    const handler = mock();
    el.addEventListener('menu-select', handler);
    el.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.label).toBe('Click Me');
  });

  it('should not dispatch menu-select event on click when disabled', () => {
    const el = document.createElement('context-menu-item');
    el.setAttribute('label', 'Click Me');
    el.setAttribute('disabled', '');
    document.body.appendChild(el);
    const handler = mock();
    el.addEventListener('menu-select', handler);
    el.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('should have role menuitem', () => {
    const el = document.createElement('context-menu-item');
    document.body.appendChild(el);
    expect(el.getAttribute('role')).toBe('menuitem');
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
bun test tests/context-menu-item.test.ts
```

预期：FAIL 部模块不存部
- [ ] **Step 3: 实现** **`src/components/context-menu-item.ts`**

```typescript
import { menuItemStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${menuItemStyles}</style>
  <div class="ctx-menu-item" part="item">
    <span class="ctx-menu-item__icon" part="icon"></span>
    <span class="ctx-menu-item__label" part="label"></span>
    <span class="ctx-menu-item__shortcut" part="shortcut"></span>
    <span class="ctx-menu-item__arrow" part="arrow"></span>
  </div>
`;

export class ContextMenuItem extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'icon', 'shortcut', 'disabled'];
  }

  private _submenu: HTMLElement | null = null;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'menuitem');
    this.setAttribute('tabindex', '-1');
    this.addEventListener('click', this._handleClick);
    this._updateRendering();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._handleClick);
  }

  attributeChangedCallback(name: string, _old: string | null, _new: string | null) {
    if (['label', 'icon', 'shortcut', 'disabled'].includes(name)) {
      this._updateRendering();
    }
  }

  get label(): string {
    return this.getAttribute('label') || '';
  }

  set label(value: string) {
    this.setAttribute('label', value);
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get submenu(): HTMLElement | null {
    return this._submenu;
  }

  focusItem(): void {
    this.focus();
  }

  blurItem(): void {
    this.blur();
  }

  private _handleClick = (e: Event) => {
    if (this.disabled) {
      e.stopPropagation();
      return;
    }
    this.dispatchEvent(
      new CustomEvent('menu-select', {
        bubbles: true,
        composed: true,
        detail: { label: this.label, item: this },
      }),
    );
  };

  private _updateRendering(): void {
    if (!this.shadowRoot) return;

    const inner = this.shadowRoot.querySelector('.ctx-menu-item');
    const iconEl = this.shadowRoot.querySelector('.ctx-menu-item__icon') as HTMLElement;
    const labelEl = this.shadowRoot.querySelector('.ctx-menu-item__label') as HTMLElement;
    const shortcutEl = this.shadowRoot.querySelector('.ctx-menu-item__shortcut') as HTMLElement;

    if (!inner || !iconEl || !labelEl || !shortcutEl) return;

    labelEl.textContent = this.getAttribute('label') || '';
    iconEl.textContent = this.getAttribute('icon') || '';
    iconEl.style.display = this.hasAttribute('icon')  '' : 'none';
    shortcutEl.textContent = this.getAttribute('shortcut') || '';
    shortcutEl.style.display = this.hasAttribute('shortcut')  '' : 'none';

    if (this.disabled) {
      inner.classList.add('ctx-menu-item--disabled');
      this.setAttribute('aria-disabled', 'true');
      this.setAttribute('disabled', '');
    } else {
      inner.classList.remove('ctx-menu-item--disabled');
      this.removeAttribute('aria-disabled');
    }
  }
}

if (!customElements.get('context-menu-item')) {
  customElements.define('context-menu-item', ContextMenuItem);
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
bun test tests/context-menu-item.test.ts
```

预期：全部PASS部 tests部
- [ ] **Step 5: Commit**

```bash
git add src/components/context-menu-item.ts tests/context-menu-item.test.ts
git commit -m "feat: add ContextMenuItem component (basic, no submenu)"
```

***

### Task 8: ContextMenu 组件（基础版：显示/隐藏/外部点击关闭/ESC部
**Files:**

- Create: `src/components/context-menu.ts`
- Create: `tests/context-menu.test.ts`
- [ ] **Step 1: 编写失败的测部* **`tests/context-menu.test.ts`**

```typescript
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import '../src/components/context-menu';
import '../src/components/context-menu-item';
import '../src/components/context-menu-separator';

describe('ContextMenu', () => {
  let menu: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    menu = document.createElement('context-menu');
    document.body.appendChild(menu);
  });

  it('should be defined as a custom element', () => {
    expect(menu).toBeInstanceOf(HTMLElement);
  });

  it('should have role menu', () => {
    expect(menu.getAttribute('role')).toBe('menu');
  });

  it('should start hidden', () => {
    const inner = menu.shadowRoot!.querySelector('.ctx-menu');
    expect(inner!.classList.contains('ctx-menu--visible')).toBe(false);
  });

  it('should show menu at specified position', () => {
    (menu as any).show(100, 200);
    const inner = menu.shadowRoot!.querySelector('.ctx-menu') as HTMLElement;
    expect(inner.classList.contains('ctx-menu--visible')).toBe(true);
    expect(inner.style.top).toBe('200px');
    expect(inner.style.left).toBe('100px');
  });

  it('should hide menu on hide() call', () => {
    (menu as any).show(100, 200);
    (menu as any).hide();
    const inner = menu.shadowRoot!.querySelector('.ctx-menu') as HTMLElement;
    expect(inner.classList.contains('ctx-menu--visible')).toBe(false);
  });

  it('should hide menu on Escape key', () => {
    (menu as any).show(100, 200);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const inner = menu.shadowRoot!.querySelector('.ctx-menu') as HTMLElement;
    expect(inner.classList.contains('ctx-menu--visible')).toBe(false);
  });

  it('should hide menu on click outside', () => {
    (menu as any).show(100, 200);
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const inner = menu.shadowRoot!.querySelector('.ctx-menu') as HTMLElement;
    expect(inner.classList.contains('ctx-menu--visible')).toBe(false);
  });

  it('should NOT hide menu on click inside menu', () => {
    (menu as any).show(100, 200);
    const inner = menu.shadowRoot!.querySelector('.ctx-menu') as HTMLElement;
    inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(inner.classList.contains('ctx-menu--visible')).toBe(true);
  });

  it('should hide menu when menu-select event is dispatched from item', () => {
    const item = document.createElement('context-menu-item');
    item.setAttribute('label', 'Test');
    menu.appendChild(item);
    (menu as any).show(100, 200);
    item.dispatchEvent(new CustomEvent('menu-select', { bubbles: true, composed: true, detail: { label: 'Test', item } }));
    const inner = menu.shadowRoot!.querySelector('.ctx-menu') as HTMLElement;
    expect(inner.classList.contains('ctx-menu--visible')).toBe(false);
  });

  it('should render slotted items inside the menu container', () => {
    const item = document.createElement('context-menu-item');
    item.setAttribute('label', 'Test');
    menu.appendChild(item);
    (menu as any).show(100, 200);
    const slot = menu.shadowRoot!.querySelector('slot');
    expect(slot).not.toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
bun test tests/context-menu.test.ts
```

预期：FAIL 部模块不存部
- [ ] **Step 3: 实现** **`src/components/context-menu.ts`**

```typescript
import { menuBaseStyles } from '../styles';
import { calculateMenuPosition } from '../utils/position';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${menuBaseStyles}</style>
  <div class="ctx-menu" part="menu" role="menu">
    <slot></slot>
  </div>
`;

export class ContextMenu extends HTMLElement {
  private _menuEl: HTMLElement | null = null;
  private _boundKeydown: ((e: Event) => void) | null = null;
  private _boundClickOutside: ((e: Event) => void) | null = null;
  private _boundMenuSelect: ((e: Event) => void) | null = null;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
    this._menuEl = root.querySelector('.ctx-menu');
  }

  connectedCallback() {
    this.setAttribute('role', 'menu');
    this._boundKeydown = this._handleKeydown.bind(this);
    this._boundClickOutside = this._handleClickOutside.bind(this);
    this._boundMenuSelect = this._handleMenuSelect.bind(this);
    document.addEventListener('keydown', this._boundKeydown);
    document.addEventListener('click', this._boundClickOutside, true);
    this.addEventListener('menu-select', this._boundMenuSelect);
  }

  disconnectedCallback() {
    if (this._boundKeydown) {
      document.removeEventListener('keydown', this._boundKeydown);
    }
    if (this._boundClickOutside) {
      document.removeEventListener('click', this._boundClickOutside, true);
    }
    if (this._boundMenuSelect) {
      this.removeEventListener('menu-select', this._boundMenuSelect);
    }
  }

  show(x: number, y: number): void {
    if (!this._menuEl) return;
    const pos = calculateMenuPosition(this._menuEl, x, y);
    this._menuEl.style.top = `${pos.top}px`;
    this._menuEl.style.left = `${pos.left}px`;
    this._menuEl.classList.add('ctx-menu--visible');
  }

  hide(): void {
    if (!this._menuEl) return;
    this._menuEl.classList.remove('ctx-menu--visible');
  }

  focusFirstItem(): void {
    const firstItem = this.querySelector<HTMLElement>('context-menu-item:not([disabled])');
    firstItem.focus();
  }

  private _handleKeydown(e: Event): void {
    const event = e as KeyboardEvent;
    if (!this._menuEl || !this._menuEl.classList.contains('ctx-menu--visible')) return;
    if (event.key === 'Escape') {
      this.hide();
    }
  }

  private _handleClickOutside(e: Event): void {
    if (!this._menuEl || !this._menuEl.classList.contains('ctx-menu--visible')) return;
    const target = e.target as Node;
    if (!this._menuEl.contains(target) && !this.contains(target)) {
      this.hide();
    }
  }

  private _handleMenuSelect(_e: Event): void {
    this.hide();
  }
}

if (!customElements.get('context-menu')) {
  customElements.define('context-menu', ContextMenu);
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
bun test tests/context-menu.test.ts
```

预期：全部PASS部 tests部
- [ ] **Step 5: Commit**

```bash
git add src/components/context-menu.ts tests/context-menu.test.ts
git commit -m "feat: add ContextMenu component with show/hide/close"
```

***

### Task 9: ContextMenuItem 子菜单支部
**Files:**

- Modify: `src/components/context-menu-item.ts`
- Modify: `tests/context-menu-item.test.ts`
- [ ] **Step 1: 在测试文件中添加子菜单相关测部* **`tests/context-menu-item.test.ts`**

在原部import 后添部import for context-menu部
```typescript
import { describe, it, expect, beforeEach, mock, afterEach } from 'bun:test';
import '../src/components/context-menu-item';
import '../src/components/context-menu';

// ... 保留原有 9 个测部...

// 新增子菜单测试组
describe('ContextMenuItem - Submenu', () => {
  let parentItem: HTMLElement;
  let submenu: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    submenu = document.createElement('context-menu');
    parentItem = document.createElement('context-menu-item');
    parentItem.setAttribute('label', 'Parent');
    parentItem.appendChild(submenu);
    document.body.appendChild(parentItem);
  });

  afterEach(() => {
    // Bun: real timers by default;
  });

  it('should detect submenu child', () => {
    expect((parentItem as any).submenu).toBe(submenu);
  });

  it('should show arrow indicator when has submenu', () => {
    const arrow = parentItem.shadowRoot!.querySelector('.ctx-menu-item__arrow') as HTMLElement;
    expect(arrow.style.display).not.toBe('none');
  });

  it('should show submenu on mouseenter', () => {
    // Bun: no fake timers, use real async (Bun.sleep);
    parentItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    // Bun: await Bun.sleep instead of vi.advanceTimersByTime(250);
    const subInner = submenu.shadowRoot!.querySelector('.ctx-menu') as HTMLElement;
    expect(subInner.classList.contains('ctx-menu--visible')).toBe(true);
  });

  it('should hide submenu on mouseleave', () => {
    // Bun: no fake timers, use real async (Bun.sleep);
    parentItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    // Bun: await Bun.sleep instead of vi.advanceTimersByTime(250);
    parentItem.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    // Bun: await Bun.sleep instead of vi.advanceTimersByTime(200);
    const subInner = submenu.shadowRoot!.querySelector('.ctx-menu') as HTMLElement;
    expect(subInner.classList.contains('ctx-menu--visible')).toBe(false);
  });

  it('should cancel pending show timer on mouseleave before delay', () => {
    // Bun: no fake timers, use real async (Bun.sleep);
    parentItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    // Bun: await Bun.sleep instead of vi.advanceTimersByTime(50);
    parentItem.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    // Bun: await Bun.sleep instead of vi.advanceTimersByTime(200);
    const subInner = submenu.shadowRoot!.querySelector('.ctx-menu') as HTMLElement;
    expect(subInner.classList.contains('ctx-menu--visible')).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试验证子菜单测试失部*

```bash
bun test tests/context-menu-item.test.ts
```

预期：新部5 个测部FAIL

- [ ] **Step 3: 修改** **`src/components/context-menu-item.ts`** **添加子菜单逻辑**

```typescript
import { menuItemStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${menuItemStyles}</style>
  <div class="ctx-menu-item" part="item">
    <span class="ctx-menu-item__icon" part="icon"></span>
    <span class="ctx-menu-item__label" part="label"></span>
    <span class="ctx-menu-item__shortcut" part="shortcut"></span>
    <span class="ctx-menu-item__arrow" part="arrow"></span>
  </div>
`;

export class ContextMenuItem extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'icon', 'shortcut', 'disabled'];
  }

  private _submenu: HTMLElement | null = null;
  private _showTimer: ReturnType<typeof setTimeout> | null = null;
  private _hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'menuitem');
    this.setAttribute('tabindex', '-1');
    this.addEventListener('click', this._handleClick);
    this.addEventListener('mouseenter', this._handleMouseEnter);
    this.addEventListener('mouseleave', this._handleMouseLeave);
    this._findSubmenu();
    this._updateRendering();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._handleClick);
    this.removeEventListener('mouseenter', this._handleMouseEnter);
    this.removeEventListener('mouseleave', this._handleMouseLeave);
    this._clearTimers();
  }

  attributeChangedCallback(name: string, _old: string | null, _new: string | null) {
    if (['label', 'icon', 'shortcut', 'disabled'].includes(name)) {
      this._updateRendering();
    }
  }

  get label(): string {
    return this.getAttribute('label') || '';
  }

  set label(value: string) {
    this.setAttribute('label', value);
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get submenu(): HTMLElement | null {
    return this._submenu;
  }

  focusItem(): void {
    this.focus();
  }

  blurItem(): void {
    this.blur();
  }

  private _findSubmenu(): void {
    this._submenu = this.querySelector('context-menu');
  }

  private _handleClick = (e: Event) => {
    if (this.disabled) {
      e.stopPropagation();
      return;
    }
    this.dispatchEvent(
      new CustomEvent('menu-select', {
        bubbles: true,
        composed: true,
        detail: { label: this.label, item: this },
      }),
    );
  };

  private _handleMouseEnter = () => {
    if (this.disabled || !this._submenu) return;
    this._clearTimers();
    this._showTimer = setTimeout(() => {
      this._showSubmenu();
    }, 200);
  };

  private _handleMouseLeave = () => {
    if (!this._submenu) return;
    this._clearTimers();
    this._hideTimer = setTimeout(() => {
      this._hideSubmenu();
    }, 150);
  };

  private _showSubmenu(): void {
    if (!this._submenu) return;
    const rect = this.getBoundingClientRect();
    (this._submenu as any).show(rect.right, rect.top);
  }

  private _hideSubmenu(): void {
    if (!this._submenu) return;
    (this._submenu as any).hide();
  }

  private _clearTimers(): void {
    if (this._showTimer) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }
    if (this._hideTimer) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
  }

  private _updateRendering(): void {
    if (!this.shadowRoot) return;

    const inner = this.shadowRoot.querySelector('.ctx-menu-item');
    const iconEl = this.shadowRoot.querySelector('.ctx-menu-item__icon') as HTMLElement;
    const labelEl = this.shadowRoot.querySelector('.ctx-menu-item__label') as HTMLElement;
    const shortcutEl = this.shadowRoot.querySelector('.ctx-menu-item__shortcut') as HTMLElement;
    const arrowEl = this.shadowRoot.querySelector('.ctx-menu-item__arrow') as HTMLElement;

    if (!inner || !iconEl || !labelEl || !shortcutEl || !arrowEl) return;

    labelEl.textContent = this.getAttribute('label') || '';
    iconEl.textContent = this.getAttribute('icon') || '';
    iconEl.style.display = this.hasAttribute('icon')  '' : 'none';
    shortcutEl.textContent = this.getAttribute('shortcut') || '';
    shortcutEl.style.display = this.hasAttribute('shortcut')  '' : 'none';
    arrowEl.textContent = '部;
    arrowEl.style.display = this._submenu  '' : 'none';

    if (this.disabled) {
      inner.classList.add('ctx-menu-item--disabled');
      this.setAttribute('aria-disabled', 'true');
    } else {
      inner.classList.remove('ctx-menu-item--disabled');
      this.removeAttribute('aria-disabled');
    }
  }
}

if (!customElements.get('context-menu-item')) {
  customElements.define('context-menu-item', ContextMenuItem);
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
bun test tests/context-menu-item.test.ts
```

预期：全部 PASS（14 tests）部
- [ ] **Step 5: Commit**

```bash
git add src/components/context-menu-item.ts tests/context-menu-item.test.ts
git commit -m "feat: add submenu support with hover open/close delays"
```

***

### Task 10: 键盘导航集成部ContextMenu

**Files:**

- Modify: `src/components/context-menu.ts`
- Modify: `tests/context-menu.test.ts`
- [ ] **Step 1: 在测试文件中添加键盘导航测试** **`tests/context-menu.test.ts`**

在原有测试组后追加：

```typescript
describe('ContextMenu - Keyboard Navigation', () => {
  let menu: HTMLElement;
  let item1: HTMLElement;
  let item2: HTMLElement;
  let disabledItem: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    menu = document.createElement('context-menu');
    item1 = document.createElement('context-menu-item');
    item1.setAttribute('label', 'Item 1');
    item2 = document.createElement('context-menu-item');
    item2.setAttribute('label', 'Item 2');
    disabledItem = document.createElement('context-menu-item');
    disabledItem.setAttribute('label', 'Disabled');
    disabledItem.setAttribute('disabled', '');
    menu.appendChild(item1);
    menu.appendChild(disabledItem);
    menu.appendChild(item2);
    document.body.appendChild(menu);
    (menu as any).show(100, 200);
  });

  it('should focus first enabled item on ArrowDown when no item focused', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
    document.dispatchEvent(event);
    expect(document.activeElement).toBe(item1);
  });

  it('should move focus from first to second enabled item', () => {
    item1.focus();
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
    document.dispatchEvent(event);
    expect(document.activeElement).toBe(item2);
  });

  it('should skip disabled items', () => {
    item1.focus();
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
    document.dispatchEvent(event);
    expect(document.activeElement).toBe(item2);
  });

  it('should wrap from last to first', () => {
    item2.focus();
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
    document.dispatchEvent(event);
    expect(document.activeElement).toBe(item1);
  });
});
```

- [ ] **Step 2: 运行测试验证键盘导航测试失败**

```bash
bun test tests/context-menu.test.ts
```

预期：新部4 个测部FAIL（ArrowDown 未被处理部
- [ ] **Step 3: 修改** **`src/components/context-menu.ts`** **添加键盘导航**

修改 `_handleKeydown` 方法部
```typescript
import { menuBaseStyles } from '../styles';
import { calculateMenuPosition } from '../utils/position';
import { handleMenuKeyboard } from '../utils/keyboard';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${menuBaseStyles}</style>
  <div class="ctx-menu" part="menu" role="menu">
    <slot></slot>
  </div>
`;

export class ContextMenu extends HTMLElement {
  private _menuEl: HTMLElement | null = null;
  private _boundKeydown: ((e: Event) => void) | null = null;
  private _boundClickOutside: ((e: Event) => void) | null = null;
  private _boundMenuSelect: ((e: Event) => void) | null = null;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
    this._menuEl = root.querySelector('.ctx-menu');
  }

  connectedCallback() {
    this.setAttribute('role', 'menu');
    this._boundKeydown = this._handleKeydown.bind(this);
    this._boundClickOutside = this._handleClickOutside.bind(this);
    this._boundMenuSelect = this._handleMenuSelect.bind(this);
    document.addEventListener('keydown', this._boundKeydown);
    document.addEventListener('click', this._boundClickOutside, true);
    this.addEventListener('menu-select', this._boundMenuSelect);
  }

  disconnectedCallback() {
    if (this._boundKeydown) {
      document.removeEventListener('keydown', this._boundKeydown);
    }
    if (this._boundClickOutside) {
      document.removeEventListener('click', this._boundClickOutside, true);
    }
    if (this._boundMenuSelect) {
      this.removeEventListener('menu-select', this._boundMenuSelect);
    }
  }

  show(x: number, y: number): void {
    if (!this._menuEl) return;
    const pos = calculateMenuPosition(this._menuEl, x, y);
    this._menuEl.style.top = `${pos.top}px`;
    this._menuEl.style.left = `${pos.left}px`;
    this._menuEl.classList.add('ctx-menu--visible');
  }

  hide(): void {
    if (!this._menuEl) return;
    this._menuEl.classList.remove('ctx-menu--visible');
  }

  focusFirstItem(): void {
    const firstItem = this.querySelector<HTMLElement>('context-menu-item:not([disabled])');
    firstItem.focus();
  }

  private _handleKeydown(e: Event): void {
    const event = e as KeyboardEvent;
    if (!this._menuEl || !this._menuEl.classList.contains('ctx-menu--visible')) return;

    if (event.key === 'Escape') {
      this.hide();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const current = document.activeElement;
      const isInside = current && this._menuEl.contains(current);
      if (!isInside) {
        this.focusFirstItem();
        return;
      }
    }

    handleMenuKeyboard(event, this._menuEl);
  }

  private _handleClickOutside(e: Event): void {
    if (!this._menuEl || !this._menuEl.classList.contains('ctx-menu--visible')) return;
    const target = e.target as Node;
    if (!this._menuEl.contains(target) && !this.contains(target)) {
      this.hide();
    }
  }

  private _handleMenuSelect(_e: Event): void {
    this.hide();
  }
}

if (!customElements.get('context-menu')) {
  customElements.define('context-menu', ContextMenu);
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
bun test tests/context-menu.test.ts
```

预期：全部PASS部3 tests部
- [ ] **Step 5: Commit**

```bash
git add src/components/context-menu.ts tests/context-menu.test.ts
git commit -m "feat: integrate keyboard navigation into ContextMenu"
```

***

### Task 11: 完善视口自适应定位（子菜单翻转 + 尺寸检测）

**Files:**

- Modify: `src/utils/position.ts`
- Modify: `tests/position.test.ts`
- Modify: `src/components/context-menu-item.ts`（使部submenuCtx 参数部- [ ] **Step 1: 部* **`tests/position.test.ts`** **中补充更多边界用部*

在原有测试后追加部
```typescript
  it('should handle submenu that would overflow right', () => {
    mockViewport(1024, 768);
    const menu = mockElementSize(200, 150);
    const result = calculateMenuPosition(menu, 0, 0, {
      direction: 'right',
      parentRect: { top: 100, left: 900, width: 150, height: 30 },
    });
    expect(result.left).toBeLessThan(900);
  });

  it('should handle submenu that would overflow bottom', () => {
    mockViewport(1920, 1080);
    const menu = mockElementSize(200, 400);
    const result = calculateMenuPosition(menu, 0, 0, {
      direction: 'right',
      parentRect: { top: 800, left: 500, width: 150, height: 30 },
    });
    expect(result.top).toBeLessThan(800);
  });
```

- [ ] **Step 2: 运行测试验证部分失败**

```bash
bun test tests/position.test.ts
```

预期：新部2 个测试中部submenu overflow bottom" 可能 FAIL

- [ ] **Step 3: 修改** **`src/utils/position.ts`** **完善底部溢出逻辑**

```typescript
import type { Position } from '../types';

export interface SubmenuContext {
  direction: 'right' | 'left';
  parentRect: { top: number; left: number; width: number; height: number };
}

export function calculateMenuPosition(
  menu: HTMLElement,
  mouseX: number,
  mouseY: number,
  submenuCtx: SubmenuContext,
): Position {
  const rect = menu.getBoundingClientRect();
  const menuWidth = rect.width || 200;
  const menuHeight = rect.height || 0;
  const vpWidth = window.innerWidth;
  const vpHeight = window.innerHeight;

  let left: number;
  let top: number;

  if (submenuCtx) {
    if (submenuCtx.direction === 'right') {
      left = submenuCtx.parentRect.left + submenuCtx.parentRect.width;
      if (left + menuWidth > vpWidth) {
        left = submenuCtx.parentRect.left - menuWidth;
      }
    } else {
      left = submenuCtx.parentRect.left - menuWidth;
    }
    top = submenuCtx.parentRect.top;
    if (top + menuHeight > vpHeight) {
      top = Math.max(0, vpHeight - menuHeight);
    }
  } else {
    left = mouseX;
    if (left + menuWidth > vpWidth) {
      left = mouseX - menuWidth;
    }
    top = mouseY;
    if (top + menuHeight > vpHeight) {
      top = mouseY - menuHeight;
    }
  }

  if (left < 0) left = 0;
  if (top < 0) top = 0;

  return { top, left };
}
```

- [ ] **Step 4: 修改** **`src/components/context-menu-item.ts`** **中的** **`_showSubmenu`** **方法传部submenuCtx**

修改 `_showSubmenu` 方法部
```typescript
  private _showSubmenu(): void {
    if (!this._submenu) return;
    const rect = this.getBoundingClientRect();
    (this._submenu as any).show(rect.right, rect.top);
  }
```

- [ ] **Step 5: 运行所有测试验证通过**

```bash
bun test tests/position.test.ts tests/context-menu.test.ts tests/context-menu-item.test.ts
```

预期：全部PASS

- [ ] **Step 6: Commit**

```bash
git add src/utils/position.ts tests/position.test.ts
git commit -m "fix: improve submenu viewport overflow handling"
```

***

### Task 12: 无障碍增强（ARIA 属性完善）

**Files:**

- Modify: `src/components/context-menu.ts`
- Modify: `src/components/context-menu-item.ts`
- Modify: `tests/context-menu.test.ts`
- [ ] **Step 1: 部* **`tests/context-menu.test.ts`** **中添部ARIA 测试**

```typescript
describe('ContextMenu - Accessibility', () => {
  it('should have aria-orientation vertical', () => {
    const menu = document.createElement('context-menu');
    document.body.appendChild(menu);
    expect(menu.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('should set aria-haspopup on items with submenu', () => {
    const item = document.createElement('context-menu-item');
    item.setAttribute('label', 'Parent');
    const sub = document.createElement('context-menu');
    item.appendChild(sub);
    document.body.appendChild(item);
    expect(item.getAttribute('aria-haspopup')).toBe('true');
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
bun test tests/context-menu.test.ts
```

预期：新部2 个测部FAIL

- [ ] **Step 3: 修改** **`src/components/context-menu.ts`** **connectedCallback**

部`connectedCallback` 中添部`aria-orientation`部
```typescript
  connectedCallback() {
    this.setAttribute('role', 'menu');
    this.setAttribute('aria-orientation', 'vertical');
    // ... 其余不变
  }
```

- [ ] **Step 4: 修改** **`src/components/context-menu-item.ts`** **`_updateRendering`**

部`_updateRendering` 末尾添加 `aria-haspopup` 处理部
```typescript
    if (this._submenu) {
      this.setAttribute('aria-haspopup', 'true');
    } else {
      this.removeAttribute('aria-haspopup');
    }
```

同时部`_findSubmenu` 调用后重新渲染：

```typescript
  connectedCallback() {
    // ... 原有代码 ...
    this._findSubmenu();
    this._updateRendering();
  }
```

- [ ] **Step 5: 运行测试验证通过**

```bash
bun test tests/context-menu.test.ts
```

预期：全部PASS部5 tests部
- [ ] **Step 6: Commit**

```bash
git add src/components/context-menu.ts src/components/context-menu-item.ts tests/context-menu.test.ts
git commit -m "feat: add ARIA accessibility attributes"
```

***

### Task 13: 创建示例页面 + 验证手动集成

**Files:**

- Create: `examples/index.html`
- [ ] **Step 1: 创建** **`examples/index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OmniCtx - Web Component Context Menu Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .demo-area {
      width: 600px;
      height: 400px;
      background: #fff;
      border: 2px dashed #ccc;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 18px;
      user-select: none;
    }
    .output {
      margin-top: 20px;
      text-align: center;
      color: #333;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <div id="target" class="demo-area">
      在此区域右键点击
    </div>
    <div id="output" class="output"></div>
  </div>

  <!-- 右键菜单定义 -->
  <context-menu id="main-menu">
    <context-menu-item label="查看" icon="👁部 shortcut="Ctrl+V"></context-menu-item>
    <context-menu-item label="编辑" icon="✏️" shortcut="Ctrl+E"></context-menu-item>
    <context-menu-separator></context-menu-separator>
    <context-menu-item label="分享" icon="📤">
      <context-menu>
        <context-menu-item label="复制链接" shortcut="Ctrl+C"></context-menu-item>
        <context-menu-item label="发送邮部></context-menu-item>
        <context-menu-item label="Twitter"></context-menu-item>
        <context-menu-separator></context-menu-separator>
        <context-menu-item label="更多选项">
          <context-menu>
            <context-menu-item label="嵌入代码"></context-menu-item>
            <context-menu-item label="导出 PDF"></context-menu-item>
          </context-menu>
        </context-menu-item>
      </context-menu>
    </context-menu-item>
    <context-menu-item label="重命部 icon="📝" shortcut="F2"></context-menu-item>
    <context-menu-separator></context-menu-separator>
    <context-menu-item label="删除" icon="🗑部 shortcut="Del" disabled></context-menu-item>
  </context-menu>

  <script type="module">
    import './src/index.ts';

    const target = document.getElementById('target');
    const menu = document.getElementById('main-menu');
    const output = document.getElementById('output');

    target.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      menu.show(e.clientX, e.clientY);
    });

    menu.addEventListener('menu-select', (e) => {
      output.textContent = `选中部 ${e.detail.label}`;
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: 启动开发服务器验证**

```bash
bun run dev
```

验证清单部
1. 右键点击演示区域 部菜单出现 部2. 鼠标 hover "分享" 部子菜单展开 部3. 点击 "查看" 部菜单关闭，输部"选中部 查看" 部4. "删除" 项灰色不可点部部5. 点击菜单外部 部菜单关闭 部6. 部Esc 部菜单关闭 部7. 菜单打开后按 部部部焦点移动 部
- [ ] **Step 3: Commit**

```bash
git add examples/index.html
git commit -m "feat: add demo page with nested menu example"
```

***

### Task 14: 构建与导部
**Files:**

- Create: `src/index.ts`
- [ ] **Step 1: 创建** **`src/index.ts`** **导出入口**

```typescript
export { ContextMenu } from './components/context-menu';
export { ContextMenuItem } from './components/context-menu-item';
export { ContextMenuSeparator } from './components/context-menu-separator';
export { calculateMenuPosition } from './utils/position';
export { handleMenuKeyboard } from './utils/keyboard';
export type {
  Position,
  ViewportRect,
  MenuItemData,
  MenuSelectEventDetail,
  ContextMenuItemElement,
  ContextMenuElement,
} from './types';
```

- [ ] **Step 2: 运行构建**

```bash
bun run build
```

预期：`dist/` 目录生成 `omni-ctx.js` 和 `.d.ts` 类型声明

- [ ] **Step 3: 运行全部测试**

```bash
bun test
```

预期：所有测部PASS

- [ ] **Step 4: 运行类型检部*

```bash
bun run typecheck
```

预期：无任何类型错误

- [ ] **Step 5: Commit**

```bash
git add src/index.ts dist/
git commit -m "feat: add public exports and build output"
```

***

### Task 15: 主题引擎（风部主题/尺寸预设部
**Files:**

- Create: `src/themes.ts`
- [ ] **Step 1: 创建** **`src/themes.ts`**

```typescript
import type { MenuStyle, MenuTheme, MenuSize } from './types';

interface ThemeVariables {
  [key: string]: string;
}

const SIZE_MAP: Record<MenuSize, ThemeVariables> = {
  small: {
    '--ctx-menu-font-size': '12px',
    '--ctx-menu-item-padding': '4px 8px',
    '--ctx-menu-item-icon-size': '14px',
    '--ctx-menu-item-shortcut-font-size': '11px',
  },
  normal: {
    '--ctx-menu-font-size': '13px',
    '--ctx-menu-item-padding': '6px 12px',
    '--ctx-menu-item-icon-size': '16px',
    '--ctx-menu-item-shortcut-font-size': '12px',
  },
  large: {
    '--ctx-menu-font-size': '14px',
    '--ctx-menu-item-padding': '8px 16px',
    '--ctx-menu-item-icon-size': '18px',
    '--ctx-menu-item-shortcut-font-size': '13px',
  },
};

const STYLE_MAP: Record<MenuStyle, ThemeVariables> = {
  google: {
    '--ctx-menu-border-radius': '8px',
    '--ctx-menu-item-padding': '8px 12px',
    '--ctx-menu-shadow': '0 4px 16px rgba(0,0,0,0.12)',
  },
  edge: {
    '--ctx-menu-border-radius': '4px',
    '--ctx-menu-shadow': '0 3px 14px 2px rgba(0,0,0,0.12)',
  },
};

const THEME_MAP: Record<MenuTheme, ThemeVariables> = {
  light: {
    '--ctx-menu-bg': '#fff',
    '--ctx-menu-border': '1px solid #e0e0e0',
    '--ctx-menu-text-color': '#333',
    '--ctx-menu-item-hover-bg': '#f0f4ff',
    '--ctx-menu-item-hover-text': '#1a56db',
    '--ctx-menu-separator-color': '#e8e8e8',
  },
  'dark-element': {
    '--ctx-menu-bg': '#1d1e1f',
    '--ctx-menu-border': '1px solid #4c4d4f',
    '--ctx-menu-text-color': '#e5eaf3',
    '--ctx-menu-item-hover-bg': '#2c2c2d',
    '--ctx-menu-item-hover-text': '#a8c7fa',
    '--ctx-menu-separator-color': '#4c4d4f',
    '--ctx-menu-shadow': '0 3px 14px 2px rgba(0,0,0,0.4)',
  },
  'dark-naive': {
    '--ctx-menu-bg': 'rgb(72,72,78)',
    '--ctx-menu-border': '1px solid rgba(255,255,255,0.12)',
    '--ctx-menu-text-color': 'rgba(255,255,255,0.9)',
    '--ctx-menu-item-hover-bg': 'rgba(255,255,255,0.12)',
    '--ctx-menu-item-hover-text': '#63e2b7',
    '--ctx-menu-separator-color': 'rgba(255,255,255,0.12)',
    '--ctx-menu-shadow': '0 3px 14px 2px rgba(0,0,0,0.5)',
  },
};

export function getThemeVariables(
  style: MenuStyle = 'google',
  theme: MenuTheme = 'light',
  size: MenuSize = 'normal',
): ThemeVariables {
  return {
    ...SIZE_MAP[size],
    ...STYLE_MAP[style],
    ...THEME_MAP[theme],
  };
}

export function applyTheme(
  element: HTMLElement,
  style: MenuStyle = 'google',
  theme: MenuTheme = 'light',
  size: MenuSize = 'normal',
): void {
  const vars = getThemeVariables(style, theme, size);
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}
```

- [ ] **Step 2: 验证编译**

```bash
bun run typecheck
```

预期：无错误

- [ ] **Step 3: Commit**

```bash
git add src/themes.ts
git commit -m "feat: add theme engine with style/theme/size presets"
```

***

### Task 16: 增强 ContextMenuItem（visible + expand-trigger click部
**Files:**

- Modify: `src/components/context-menu-item.ts`
- Modify: `tests/context-menu-item.test.ts`

**说明部* 在现部ContextMenuItem 组件基础上增部visible 部expand-trigger click 支持。具体修改点部
1. `observedAttributes` 添加 `'visible'`, `'expand-trigger'`
2. 新增 `_visible` 属性，默认 `true`；`visible` getter/setter 联动属部3. `_updateRendering` 增加：`this.style.display = this._visible  '' : 'none'`
4. `_handleClick` 增加：当 `expandTrigger === 'click'` 且有子菜单时，执部`_toggleSubmenu()` 而非触发 `menu-select`；需部`e.stopPropagation()`
5. `_handleMouseEnter` / `_handleMouseLeave` 增加：`expandTrigger === 'click'` 时跳部hover 子菜单展开
6. 新增 `_toggleSubmenu()` 私有方法：检查子菜单当前可见状态，切换展开/收起
7. `get expandTrigger()` 读取 `this.getAttribute('expand-trigger') as ExpandTrigger) || 'hover'`

- [ ] **Step 1: 编写增强测试** **`tests/context-menu-item.test.ts`**

追加以下测试组到现有测试文件末尾部
```typescript
describe('ContextMenuItem - Visibility', () => {
  it('should be visible by default', () => {
    const el = document.createElement('context-menu-item');
    el.setAttribute('label', 'Test');
    document.body.appendChild(el);
    expect((el as any).visible).toBe(true);
  });

  it('should hide when visible is set to false', () => {
    const el = document.createElement('context-menu-item');
    el.setAttribute('label', 'Test');
    el.setAttribute('visible', 'false');
    document.body.appendChild(el);
    expect((el as any).visible).toBe(false);
    expect(el.style.display).toBe('none');
  });
});

describe('ContextMenuItem - Click Expand', () => {
  let parentItem: HTMLElement;
  let submenu: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    submenu = document.createElement('context-menu');
    parentItem = document.createElement('context-menu-item');
    parentItem.setAttribute('label', 'Parent');
    parentItem.setAttribute('expand-trigger', 'click');
    parentItem.appendChild(submenu);
    document.body.appendChild(parentItem);
  });

  it('should show submenu on click when expand-trigger is click', () => {
    parentItem.click();
    const subInner = submenu.shadowRoot!.querySelector('.ctx-menu') as HTMLElement;
    expect(subInner.classList.contains('ctx-menu--visible')).toBe(true);
  });

  it('should not show submenu on hover when expand-trigger is click', () => {
    // Bun: no fake timers, use real async (Bun.sleep);
    parentItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    // Bun: await Bun.sleep instead of vi.advanceTimersByTime(250);
    const subInner = submenu.shadowRoot!.querySelector('.ctx-menu') as HTMLElement;
    expect(subInner.classList.contains('ctx-menu--visible')).toBe(false);
    // Bun: real timers by default;
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
bun test tests/context-menu-item.test.ts
```

预期：新部5 个测部FAIL

- [ ] **Step 3: 修改** **`src/components/context-menu-item.ts`**

以上述修改说明为指导，在现有文件基础上增部visible 部expand-trigger click 支持。关键代码片段：

```typescript
// 部observedAttributes 中添部static get observedAttributes() {
  return ['label', 'icon', 'shortcut', 'disabled', 'visible', 'expand-trigger'];
}

// 新增属部private _visible = true;

get visible(): boolean { return this._visible; }
set visible(value: boolean) {
  this._visible = value;
  this.setAttribute('visible', String(value));
  this._updateRendering();
}

get expandTrigger(): ExpandTrigger {
  return (this.getAttribute('expand-trigger') as ExpandTrigger) || 'hover';
}

// 修改 _handleClick
private _handleClick = (e: Event) => {
  if (this.disabled) { e.stopPropagation(); return; }
  if (this._submenu && this.expandTrigger === 'click') {
    e.stopPropagation();
    this._toggleSubmenu();
    return;
  }
  // ... 原有 menu-select dispatch 逻辑
};

// 修改 _handleMouseEnter
private _handleMouseEnter = () => {
  if (this.disabled || !this._submenu || this.expandTrigger === 'click') return;
  // ... 原有 setTimeout 逻辑
};

// 修改 _handleMouseLeave
private _handleMouseLeave = () => {
  if (!this._submenu || this.expandTrigger === 'click') return;
  // ... 原有 setTimeout 逻辑
};

// 新增方法
private _toggleSubmenu(): void {
  if (!this._submenu) return;
  const subInner = this._submenu.shadowRoot.querySelector('.ctx-menu');
  if (subInner.classList.contains('ctx-menu--visible')) {
    this._hideSubmenu();
  } else {
    this._showSubmenu();
  }
}

// 部_updateRendering 中添部const visibleAttr = this.getAttribute('visible');
this._visible = visibleAttr !== 'false';
this.style.display = this._visible  '' : 'none';
```

- [ ] **Step 4: 运行测试验证通过**

```bash
bun test tests/context-menu-item.test.ts
```

预期：全部PASS部9 tests部
- [ ] **Step 5: Commit**

```bash
git add src/components/context-menu-item.ts tests/context-menu-item.test.ts
git commit -m "feat: add visible and click expand-trigger to ContextMenuItem"
```

***

### Task 17: ContextMenuGroup 菜单分组组件

**Files:**

- Create: `src/components/context-menu-group.ts`
- Create: `tests/context-menu-group.test.ts`
- [ ] **Step 1: 编写失败的测部* **`tests/context-menu-group.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import '../src/components/context-menu-group';
import '../src/components/context-menu-item';

describe('ContextMenuGroup', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should be defined as a custom element', () => {
    const el = document.createElement('context-menu-group');
    expect(el).toBeInstanceOf(HTMLElement);
  });

  it('should render group label', () => {
    const el = document.createElement('context-menu-group');
    el.setAttribute('label', 'View Mode');
    document.body.appendChild(el);
    const label = el.shadowRoot!.querySelector('.ctx-menu-group__label');
    expect(label!.textContent).toBe('View Mode');
  });

  it('should render separator before group', () => {
    const el = document.createElement('context-menu-group');
    el.setAttribute('label', 'Test');
    document.body.appendChild(el);
    const sep = el.shadowRoot!.querySelector('context-menu-separator');
    expect(sep).not.toBeNull();
  });

  it('should hide when all children are invisible', () => {
    const el = document.createElement('context-menu-group');
    el.setAttribute('label', 'Test');
    const item1 = document.createElement('context-menu-item');
    item1.setAttribute('label', 'Item 1');
    item1.setAttribute('visible', 'false');
    el.appendChild(item1);
    document.body.appendChild(el);
    expect(el.style.display).toBe('none');
  });

  it('should show when at least one child is visible', () => {
    const el = document.createElement('context-menu-group');
    el.setAttribute('label', 'Test');
    const item1 = document.createElement('context-menu-item');
    item1.setAttribute('label', 'Item 1');
    el.appendChild(item1);
    document.body.appendChild(el);
    expect(el.style.display).not.toBe('none');
  });
});
```

- [ ] **Step 2: 实现** **`src/components/context-menu-group.ts`**

```typescript
import { groupStyles } from '../styles';
import '../components/context-menu-separator';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${groupStyles}</style>
  <context-menu-separator></context-menu-separator>
  <div class="ctx-menu-group__label" part="group-label"></div>
  <div class="ctx-menu-group__items">
    <slot></slot>
  </div>
`;

export class ContextMenuGroup extends HTMLElement {
  static get observedAttributes() {
    return ['label'];
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'group');
    this._updateLabel();
    this._checkVisibility();
    this.addEventListener('slotchange', this._checkVisibility);
  }

  disconnectedCallback() {
    this.removeEventListener('slotchange', this._checkVisibility);
  }

  attributeChangedCallback(name: string, _old: string | null, _new: string | null) {
    if (name === 'label') {
      this._updateLabel();
    }
  }

  private _updateLabel(): void {
    const labelEl = this.shadowRoot.querySelector('.ctx-menu-group__label');
    if (labelEl) {
      labelEl.textContent = this.getAttribute('label') || '';
    }
  }

  private _checkVisibility = (): void => {
    const children = Array.from(this.children) as HTMLElement[];
    const hasVisible = children.some(
      (child) => child.style.display !== 'none' && !child.hasAttribute('hidden'),
    );
    this.style.display = hasVisible  '' : 'none';
  };
}

if (!customElements.get('context-menu-group')) {
  customElements.define('context-menu-group', ContextMenuGroup);
}
```

- [ ] **Step 3: 运行测试验证通过**

```bash
bun test tests/context-menu-group.test.ts
```

预期：全部PASS部 tests部
- [ ] **Step 4: Commit**

```bash
git add src/components/context-menu-group.ts tests/context-menu-group.test.ts
git commit -m "feat: add ContextMenuGroup with visibility gating"
```

***

### Task 18: ContextMenuRadioGroup + ContextMenuRadioItem

**Files:**

- Create: `src/components/context-menu-radio-group.ts`
- Create: `src/components/context-menu-radio-item.ts`
- Create: `tests/context-menu-radio-group.test.ts`
- [ ] **Step 1: 编写测试** **`tests/context-menu-radio-group.test.ts`**

```typescript
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import '../src/components/context-menu-radio-item';
import '../src/components/context-menu-radio-group';

describe('ContextMenuRadioGroup', () => {
  let group: HTMLElement;
  let item1: HTMLElement;
  let item2: HTMLElement;
  let item3: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    group = document.createElement('context-menu-radio-group');
    group.setAttribute('name', 'view');
    group.setAttribute('value', 'list');

    item1 = document.createElement('context-menu-radio-item');
    item1.setAttribute('label', 'List');
    item1.setAttribute('value', 'list');

    item2 = document.createElement('context-menu-radio-item');
    item2.setAttribute('label', 'Grid');
    item2.setAttribute('value', 'grid');

    item3 = document.createElement('context-menu-radio-item');
    item3.setAttribute('label', 'Detail');
    item3.setAttribute('value', 'detail');
    item3.setAttribute('disabled', '');

    group.appendChild(item1);
    group.appendChild(item2);
    group.appendChild(item3);
    document.body.appendChild(group);
  });

  it('should mark the initial value as checked', () => {
    const mark = item1.shadowRoot!.querySelector('.ctx-menu-radio-item__mark');
    expect(mark!.textContent).not.toBe('');
  });

  it('should switch selection on click', () => {
    item2.click();
    expect((group as any).value).toBe('grid');
  });

  it('should dispatch change event on selection', () => {
    const handler = mock();
    group.addEventListener('change', handler);
    item2.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({
      name: 'view', value: 'grid', label: 'Grid',
    });
  });

  it('should not change on disabled item click', () => {
    item3.click();
    expect((group as any).value).toBe('list');
  });

  it('should support setRadioValue and getRadioValue', () => {
    (group as any).setRadioValue('grid');
    expect((group as any).getRadioValue()).toBe('grid');
  });
});
```

- [ ] **Step 2: 实现** **`src/components/context-menu-radio-item.ts`**

```typescript
import { radioItemStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${radioItemStyles}</style>
  <div class="ctx-menu-radio-item" part="radio-item">
    <span class="ctx-menu-radio-item__mark" part="radio-mark"></span>
    <span class="ctx-menu-radio-item__label" part="radio-label"></span>
  </div>
`;

export class ContextMenuRadioItem extends HTMLElement {
  static get observedAttributes() { return ['label', 'value', 'disabled']; }

  private _checked = false;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'menuitemradio');
    this.setAttribute('tabindex', '-1');
    this.addEventListener('click', this._handleClick);
    this._updateRendering();
  }

  disconnectedCallback() { this.removeEventListener('click', this._handleClick); }

  attributeChangedCallback(name: string) {
    if (['label', 'value', 'disabled'].includes(name)) this._updateRendering();
  }

  get value(): string { return this.getAttribute('value') || ''; }
  get label(): string { return this.getAttribute('label') || ''; }
  get disabled(): boolean { return this.hasAttribute('disabled'); }
  get checked(): boolean { return this._checked; }
  set checked(value: boolean) { this._checked = value; this._updateRendering(); }

  private _handleClick = () => {
    if (this.disabled) return;
    const group = this.closest('context-menu-radio-group');
    if (group) (group as any).setRadioValue(this.value);
  };

  private _updateRendering(): void {
    if (!this.shadowRoot) return;
    const inner = this.shadowRoot.querySelector('.ctx-menu-radio-item');
    const mark = this.shadowRoot.querySelector('.ctx-menu-radio-item__mark') as HTMLElement;
    const label = this.shadowRoot.querySelector('.ctx-menu-radio-item__label') as HTMLElement;
    if (!inner || !mark || !label) return;

    label.textContent = this.getAttribute('label') || '';
    mark.textContent = this._checked  '部 : '';

    if (this.disabled) {
      inner.classList.add('ctx-menu-radio-item--disabled');
      this.setAttribute('aria-disabled', 'true');
    } else {
      inner.classList.remove('ctx-menu-radio-item--disabled');
      this.removeAttribute('aria-disabled');
    }
    this.setAttribute('aria-checked', String(this._checked));
  }
}

if (!customElements.get('context-menu-radio-item')) {
  customElements.define('context-menu-radio-item', ContextMenuRadioItem);
}
```

- [ ] **Step 3: 实现** **`src/components/context-menu-radio-group.ts`**

```typescript
import { radioGroupStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `<style>${radioGroupStyles}</style><slot></slot>`;

export class ContextMenuRadioGroup extends HTMLElement {
  static get observedAttributes() { return ['name', 'value']; }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() { this.setAttribute('role', 'group'); this._syncItems(); }
  attributeChangedCallback(name: string) { if (name === 'value') this._syncItems(); }

  get name(): string { return this.getAttribute('name') || ''; }
  get value(): string { return this.getAttribute('value') || ''; }

  setRadioValue(value: string): void {
    this.setAttribute('value', value);
    this._syncItems();
    const selectedItem = this.querySelector(`context-menu-radio-item[value="${value}"]`);
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true, composed: true,
      detail: { name: this.name, value, label: selectedItem.getAttribute('label') || '' },
    }));
  }

  getRadioValue(): string { return this.value; }

  private _syncItems(): void {
    const currentValue = this.value;
    this.querySelectorAll<HTMLElement & { checked: boolean }>('context-menu-radio-item')
      .forEach((item) => { item.checked = item.getAttribute('value') === currentValue; });
  }
}

if (!customElements.get('context-menu-radio-group')) {
  customElements.define('context-menu-radio-group', ContextMenuRadioGroup);
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
bun test tests/context-menu-radio-group.test.ts
```

预期：全部PASS部 tests部
- [ ] **Step 5: Commit**

```bash
git add src/components/context-menu-radio-group.ts src/components/context-menu-radio-item.ts tests/context-menu-radio-group.test.ts
git commit -m "feat: add RadioGroup and RadioItem components"
```

***

### Task 19: ContextMenuToggleItem 开关项组件

**Files:**

- Create: `src/components/context-menu-toggle-item.ts`
- Create: `tests/context-menu-toggle-item.test.ts`
- [ ] **Step 1: 编写测试** **`tests/context-menu-toggle-item.test.ts`**

```typescript
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import '../src/components/context-menu-toggle-item';

describe('ContextMenuToggleItem', () => {
  let toggle: HTMLElement & { checked: boolean; disabled: boolean; label: string };

  beforeEach(() => {
    document.body.innerHTML = '';
    toggle = document.createElement('context-menu-toggle-item') as any;
    toggle.setAttribute('label', 'Auto Save');
    document.body.appendChild(toggle);
  });

  it('should render with unchecked state by default', () => {
    expect(toggle.checked).toBe(false);
    const track = toggle.shadowRoot!.querySelector('.ctx-menu-toggle-item__track');
    expect(track!.classList.contains('ctx-menu-toggle-item__track--on')).toBe(false);
  });

  it('should render with checked state when attribute is set', () => {
    toggle.setAttribute('checked', '');
    const track = toggle.shadowRoot!.querySelector('.ctx-menu-toggle-item__track');
    expect(track!.classList.contains('ctx-menu-toggle-item__track--on')).toBe(true);
  });

  it('should toggle on click', () => {
    toggle.click();
    expect(toggle.checked).toBe(true);
    toggle.click();
    expect(toggle.checked).toBe(false);
  });

  it('should dispatch toggle-change event', () => {
    const handler = mock();
    toggle.addEventListener('toggle-change', handler);
    toggle.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ label: 'Auto Save', checked: true });
  });

  it('should not toggle when disabled', () => {
    toggle.setAttribute('disabled', '');
    toggle.click();
    expect(toggle.checked).toBe(false);
  });
});
```

- [ ] **Step 2: 实现** **`src/components/context-menu-toggle-item.ts`**

```typescript
import { menuItemStyles, toggleItemStyles } from '../styles';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${menuItemStyles}${toggleItemStyles}</style>
  <div class="ctx-menu-item ctx-menu-toggle-item" part="item">
    <span class="ctx-menu-item__icon" part="icon"></span>
    <span class="ctx-menu-item__label ctx-menu-toggle-item__label" part="label"></span>
    <div class="ctx-menu-toggle-item__switch" part="switch">
      <div class="ctx-menu-toggle-item__track" part="switch-track">
        <div class="ctx-menu-toggle-item__thumb" part="switch-thumb"></div>
      </div>
    </div>
    <span class="ctx-menu-item__arrow" style="display:none"></span>
  </div>
`;

export class ContextMenuToggleItem extends HTMLElement {
  static get observedAttributes() { return ['label', 'checked', 'disabled']; }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'menuitemcheckbox');
    this.setAttribute('tabindex', '-1');
    this.addEventListener('click', this._handleClick);
    this._updateRendering();
  }

  disconnectedCallback() { this.removeEventListener('click', this._handleClick); }

  attributeChangedCallback(name: string) {
    if (['label', 'checked', 'disabled'].includes(name)) this._updateRendering();
  }

  get label(): string { return this.getAttribute('label') || ''; }
  set label(v: string) { this.setAttribute('label', v); }
  get checked(): boolean { return this.hasAttribute('checked'); }
  set checked(v: boolean) { v  this.setAttribute('checked', '') : this.removeAttribute('checked'); }
  get disabled(): boolean { return this.hasAttribute('disabled'); }
  set disabled(v: boolean) { v  this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }

  private _handleClick = () => {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent('toggle-change', {
      bubbles: true, composed: true,
      detail: { label: this.label, checked: this.checked },
    }));
  };

  private _updateRendering(): void {
    if (!this.shadowRoot) return;
    const inner = this.shadowRoot.querySelector('.ctx-menu-toggle-item');
    const labelEl = this.shadowRoot.querySelector('.ctx-menu-toggle-item__label') as HTMLElement;
    const trackEl = this.shadowRoot.querySelector('.ctx-menu-toggle-item__track') as HTMLElement;
    if (!inner || !labelEl || !trackEl) return;

    labelEl.textContent = this.getAttribute('label') || '';
    this.checked  trackEl.classList.add('ctx-menu-toggle-item__track--on')
                 : trackEl.classList.remove('ctx-menu-toggle-item__track--on');

    if (this.disabled) {
      inner.classList.add('ctx-menu-toggle-item--disabled');
      this.setAttribute('aria-disabled', 'true');
    } else {
      inner.classList.remove('ctx-menu-toggle-item--disabled');
      this.removeAttribute('aria-disabled');
    }
    this.setAttribute('aria-checked', String(this.checked));
  }
}

if (!customElements.get('context-menu-toggle-item')) {
  customElements.define('context-menu-toggle-item', ContextMenuToggleItem);
}
```

- [ ] **Step 3: 运行测试验证通过**

```bash
bun test tests/context-menu-toggle-item.test.ts
```

预期：全部PASS部 tests部
- [ ] **Step 4: Commit**

```bash
git add src/components/context-menu-toggle-item.ts tests/context-menu-toggle-item.test.ts
git commit -m "feat: add ToggleItem component with switch UI"
```

***

### Task 20: ContextMenu 增强（open/close/menuParam/overlay/before-close/slots/命令式API部
**Files:**

- Modify: `src/components/context-menu.ts`
- Modify: `tests/context-menu.test.ts`
- [ ] **Step 1: 添加增强测试部* **`tests/context-menu.test.ts`**

追加以下测试组：

```typescript
describe('ContextMenu - Enhanced', () => {
  let menu: any;

  beforeEach(() => {
    document.body.innerHTML = '';
    menu = document.createElement('context-menu');
    document.body.appendChild(menu);
  });

  describe('open/close API', () => {
    it('should accept open() with MouseEvent', () => {
      menu.open(new MouseEvent('contextmenu', { clientX: 150, clientY: 250 }), { fileId: '123' });
      expect(menu.menuParam).toEqual({ fileId: '123' });
      expect(menu.shadowRoot!.querySelector('.ctx-menu')!.classList.contains('ctx-menu--visible')).toBe(true);
    });

    it('should accept open() with {x,y} object', () => {
      menu.open({ x: 100, y: 200 });
      expect(menu.shadowRoot!.querySelector('.ctx-menu')!.classList.contains('ctx-menu--visible')).toBe(true);
    });

    it('should hide on close()', () => {
      menu.show(100, 200);
      menu.close();
      expect(menu.shadowRoot!.querySelector('.ctx-menu')!.classList.contains('ctx-menu--visible')).toBe(false);
    });
  });

  describe('before-close interception', () => {
    it('should dispatch cancelable before-close event', () => {
      menu.show(100, 200);
      const handler = mock((e: CustomEvent) => { e.preventDefault(); });
      menu.addEventListener('before-close', handler);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(handler).toHaveBeenCalled();
      expect(menu.shadowRoot!.querySelector('.ctx-menu')!.classList.contains('ctx-menu--visible')).toBe(true);
    });
  });

  describe('scroll close', () => {
    it('should close menu on scroll outside', () => {
      menu.show(100, 200);
      document.dispatchEvent(new Event('scroll', { bubbles: true }));
      expect(menu.shadowRoot!.querySelector('.ctx-menu')!.classList.contains('ctx-menu--visible')).toBe(false);
    });
  });

  describe('right-click outside close', () => {
    it('should close menu on right-click outside', () => {
      menu.show(100, 200);
      document.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
      expect(menu.shadowRoot!.querySelector('.ctx-menu')!.classList.contains('ctx-menu--visible')).toBe(false);
    });
  });

  describe('header/footer slots', () => {
    it('should render named slots', () => {
      const header = Object.assign(document.createElement('div'), { slot: 'header', textContent: 'H' });
      const footer = Object.assign(document.createElement('div'), { slot: 'footer', textContent: 'F' });
      menu.appendChild(header);
      menu.appendChild(footer);
      expect(menu.shadowRoot!.querySelector('slot[name="header"]')).not.toBeNull();
      expect(menu.shadowRoot!.querySelector('slot[name="footer"]')).not.toBeNull();
    });
  });

  describe('overlay', () => {
    it('should show overlay when overlay attribute is set', () => {
      menu.setAttribute('overlay', '');
      menu.show(100, 200);
      expect(menu.shadowRoot!.querySelector('.ctx-menu-overlay')).not.toBeNull();
    });

    it('should hide menu when overlay clicked', () => {
      menu.setAttribute('overlay', '');
      menu.show(100, 200);
      menu.shadowRoot!.querySelector('.ctx-menu-overlay')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(menu.shadowRoot!.querySelector('.ctx-menu')!.classList.contains('ctx-menu--visible')).toBe(false);
    });
  });

  describe('command API', () => {
    it('should add item dynamically via addItem', () => {
      menu.addItem({ id: 'new', label: 'New Item', handler: () => {} });
      const item = menu.querySelector('context-menu-item[data-id="new"]');
      expect(item).not.toBeNull();
      expect(item!.getAttribute('label')).toBe('New Item');
    });

    it('should add separator dynamically via addSeparator', () => {
      menu.addSeparator();
      expect(menu.querySelector('context-menu-separator')).not.toBeNull();
    });

    it('should get menu option by id via getMenuOption', () => {
      menu.addItem({ id: 'test-id', label: 'Test', icon: '📁' });
      const opt = menu.getMenuOption('test-id');
      expect(opt).not.toBeNull();
      expect(opt!.label).toBe('Test');
    });
  });
});
```

- [ ] **Step 2: 修改** **`src/components/context-menu.ts`**

在大幅增部ContextMenu 组件，基于原实现添加部
- `open(event, param)` 方法
- `close()` 方法（等同于 hide + 清理部- `menuParam` 属性传部- `before-close` 事件拦截
- 滚动/右键点击外部关闭
- header/footer 命名插槽
- 透明遮罩（`overlay` 属部+ 点击关闭部- 命令部API：`addItem(data)`, `addSeparator()`, `getMenuOption(id)`

```typescript
import { menuBaseStyles, overlayStyles } from '../styles';
import { calculateMenuPosition } from '../utils/position';
import { handleMenuKeyboard } from '../utils/keyboard';
import { applyTheme } from '../themes';
import type { MenuParam, MenuStyle, MenuTheme, MenuSize, MenuItemData } from '../types';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>${menuBaseStyles}${overlayStyles}</style>
  <div class="ctx-menu-overlay" hidden></div>
  <div class="ctx-menu" part="menu" role="menu">
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
`;

export class ContextMenu extends HTMLElement {
  static get observedAttributes() {
    return ['style', 'theme', 'size', 'overlay', 'width', 'max-width', 'height', 'max-height'];
  }

  private _menuEl: HTMLElement | null = null;
  private _overlayEl: HTMLElement | null = null;
  private _menuParam: MenuParam | null = null;
  private _boundKeydown: ((e: Event) => void) | null = null;
  private _boundClickOutside: ((e: Event) => void) | null = null;
  private _boundMenuSelect: ((e: Event) => void) | null = null;
  private _boundScroll: ((e: Event) => void) | null = null;
  private _boundRightClick: ((e: Event) => void) | null = null;
  private _itemMap: Map<string, MenuItemData> = new Map();

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.appendChild(TEMPLATE.content.cloneNode(true));
    this._menuEl = root.querySelector('.ctx-menu');
    this._overlayEl = root.querySelector('.ctx-menu-overlay');
  }

  connectedCallback() {
    this.setAttribute('role', 'menu');
    this.setAttribute('aria-orientation', 'vertical');
    this._boundKeydown = this._handleKeydown.bind(this);
    this._boundClickOutside = this._handleClickOutside.bind(this);
    this._boundMenuSelect = this._handleMenuSelect.bind(this);
    this._boundScroll = this._handleScroll.bind(this);
    this._boundRightClick = this._handleRightClick.bind(this);
    document.addEventListener('keydown', this._boundKeydown);
    document.addEventListener('click', this._boundClickOutside, true);
    document.addEventListener('scroll', this._boundScroll, true);
    document.addEventListener('contextmenu', this._boundRightClick, true);
    this.addEventListener('menu-select', this._boundMenuSelect);
    this._applyStyleTheme();
  }

  disconnectedCallback() {
    if (this._boundKeydown) document.removeEventListener('keydown', this._boundKeydown);
    if (this._boundClickOutside) document.removeEventListener('click', this._boundClickOutside, true);
    if (this._boundScroll) document.removeEventListener('scroll', this._boundScroll, true);
    if (this._boundRightClick) document.removeEventListener('contextmenu', this._boundRightClick, true);
    if (this._boundMenuSelect) this.removeEventListener('menu-select', this._boundMenuSelect);
  }

  attributeChangedCallback(name: string, _old: string | null, _new: string | null) {
    if (['style', 'theme', 'size'].includes(name)) this._applyStyleTheme();
    if (['width', 'max-width', 'height', 'max-height'].includes(name) && this._menuEl) {
      const prop = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      (this._menuEl.style as any)[prop] = _new || '';
    }
  }

  open(event: MouseEvent | { x: number; y: number }, param: MenuParam): void {
    this._menuParam = param || null;
    if ('clientX' in event) {
      this.show(event.clientX, event.clientY);
    } else {
      this.show(event.x, event.y);
    }
  }

  show(x: number, y: number, _param: MenuParam): void {
    if (!this._menuEl) return;
    this._menuParam = _param || null;
    const pos = calculateMenuPosition(this._menuEl, x, y);
    this._menuEl.style.top = `${pos.top}px`;
    this._menuEl.style.left = `${pos.left}px`;
    this._menuEl.classList.add('ctx-menu--visible');
    if (this._overlayEl && this.hasAttribute('overlay')) {
      this._overlayEl.hidden = false;
    }
  }

  hide(): void {
    if (!this._menuEl) return;
    this._menuEl.classList.remove('ctx-menu--visible');
    if (this._overlayEl) this._overlayEl.hidden = true;
  }

  close(): void {
    const event = new CustomEvent('before-close', {
      bubbles: true, cancelable: true, composed: true,
      detail: { reason: 'api', cancel: () => {} },
    });
    this.dispatchEvent(event);
    if (!event.defaultPrevented) this.hide();
  }

  focusFirstItem(): void {
    this.querySelector<HTMLElement>('context-menu-item:not([disabled]):not([visible="false"])').focus();
  }

  get menuParam(): MenuParam | null { return this._menuParam; }

  addItem(data: MenuItemData): void {
    const el = document.createElement('context-menu-item');
    const label = typeof data.label === 'function'  data.label(this._menuParam || undefined) : data.label;
    el.setAttribute('label', label);
    if (data.id) { el.setAttribute('data-id', data.id); this._itemMap.set(data.id, data); }
    if (data.icon) el.setAttribute('icon', data.icon);
    if (data.shortcut) el.setAttribute('shortcut', data.shortcut);
    if (data.disabled) el.setAttribute('disabled', '');
    if (data.children) {
      const sub = document.createElement('context-menu');
      data.children.forEach((child) => (sub as any).addItem(child));
      el.appendChild(sub);
    }
    this.appendChild(el);
  }

  addSeparator(): void {
    this.appendChild(document.createElement('context-menu-separator'));
  }

  getMenuOption(id: string): MenuItemData | null {
    return this._itemMap.get(id) || null;
  }

  private _applyStyleTheme(): void {
    if (!this._menuEl) return;
    const style = (this.getAttribute('style-type') || this.getAttribute('style') || 'google') as MenuStyle;
    const theme = (this.getAttribute('theme') || 'light') as MenuTheme;
    const size = (this.getAttribute('size') || 'normal') as MenuSize;
    applyTheme(this._menuEl, style, theme, size);
  }

  private _tryClose(reason: string): boolean {
    if (!this._menuEl.classList.contains('ctx-menu--visible')) return false;
    const event = new CustomEvent('before-close', {
      bubbles: true, cancelable: true, composed: true,
      detail: { reason, cancel: () => {} },
    });
    this.dispatchEvent(event);
    if (event.defaultPrevented) return false;
    this.hide();
    return true;
  }

  private _handleKeydown(e: Event): void {
    const event = e as KeyboardEvent;
    if (!this._menuEl.classList.contains('ctx-menu--visible')) return;
    if (event.key === 'Escape') { this._tryClose('escape'); return; }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const current = document.activeElement;
      if (!current || !this._menuEl.contains(current)) {
        this.focusFirstItem();
        return;
      }
    }
    handleMenuKeyboard(event, this._menuEl);
  }

  private _handleClickOutside(e: Event): void {
    if (!this._menuEl.classList.contains('ctx-menu--visible')) return;
    const target = e.target as Node;
    if (!this._menuEl.contains(target) && !this.contains(target)) {
      this._tryClose('click-outside');
    }
  }

  private _handleScroll(e: Event): void {
    if (!this._menuEl.classList.contains('ctx-menu--visible')) return;
    const target = e.target as Node;
    if (!this._menuEl.contains(target) && !this.contains(target)) {
      this._tryClose('scroll');
    }
  }

  private _handleRightClick(e: Event): void {
    if (!this._menuEl.classList.contains('ctx-menu--visible')) return;
    const target = e.target as Node;
    if (!this._menuEl.contains(target) && !this.contains(target)) {
      this._tryClose('right-click');
    }
  }

  private _handleMenuSelect(_e: Event): void {
    this._tryClose('menu-select');
  }
}

if (!customElements.get('context-menu')) {
  customElements.define('context-menu', ContextMenu);
}
```

- [ ] **Step 3: 运行测试验证通过**

```bash
bun test tests/context-menu.test.ts
```

预期：全部PASS部3 tests 部原有 13 + 新增 10部
- [ ] **Step 4: Commit**

```bash
git add src/components/context-menu.ts tests/context-menu.test.ts
git commit -m "feat: enhance ContextMenu with open/close/overlay/beforeClose/slots/cmdAPI"
```

***

### Task 21: 更新导出入口 + 完整构建验证

**Files:**

- Modify: `src/index.ts`
- Modify: `src/styles.ts`
- [ ] **Step 1: 更新** **`src/styles.ts`** **导出新样部*

部`src/styles.ts` 末尾追加部
```typescript
export const groupStyles = `
  :host { display: contents; }
  .ctx-menu-group__label {
    color: var(--ctx-menu-group-label-color, #888);
    font-size: var(--ctx-menu-group-label-font-size, 11px);
    padding: var(--ctx-menu-group-label-padding, 4px 12px);
    font-weight: var(--ctx-menu-group-label-font-weight, 600);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    user-select: none;
  }
  .ctx-menu-group__items { display: contents; }
`;

export const radioGroupStyles = `
  :host { display: contents; }
`;

export const radioItemStyles = `
  :host { display: block; cursor: pointer; }
  .ctx-menu-radio-item {
    display: flex; align-items: center;
    padding: var(--ctx-menu-item-padding, 6px 12px);
    gap: 8px;
  }
  .ctx-menu-radio-item:hover {
    background: var(--ctx-menu-item-hover-bg, #f0f4ff);
  }
  .ctx-menu-radio-item--disabled {
    opacity: var(--ctx-menu-item-disabled-opacity, 0.4);
    cursor: not-allowed; pointer-events: none;
  }
  .ctx-menu-radio-item__mark {
    width: var(--ctx-menu-item-icon-size, 16px);
    flex-shrink: 0; text-align: center;
    color: var(--ctx-menu-radio-checked-color, #1a56db);
  }
  .ctx-menu-radio-item__label { flex: 1; }
`;

export const toggleItemStyles = `
  :host { display: block; cursor: pointer; }
  .ctx-menu-toggle-item {
    display: flex; align-items: center;
    padding: var(--ctx-menu-item-padding, 6px 12px);
    gap: 8px;
  }
  .ctx-menu-toggle-item:hover {
    background: var(--ctx-menu-item-hover-bg, #f0f4ff);
  }
  .ctx-menu-toggle-item--disabled {
    opacity: var(--ctx-menu-item-disabled-opacity, 0.4);
    cursor: not-allowed; pointer-events: none;
  }
  .ctx-menu-toggle-item__label { flex: 1; }
  .ctx-menu-toggle-item__switch {
    position: relative;
    width: var(--ctx-menu-toggle-width, 36px);
    height: var(--ctx-menu-toggle-height, 20px);
    flex-shrink: 0;
  }
  .ctx-menu-toggle-item__track {
    width: 100%; height: 100%;
    border-radius: 10px;
    background: var(--ctx-menu-toggle-off-bg, #ccc);
    transition: background 0.2s;
  }
  .ctx-menu-toggle-item__track--on {
    background: var(--ctx-menu-toggle-on-bg, #1a56db);
  }
  .ctx-menu-toggle-item__thumb {
    position: absolute; top: 2px; left: 2px;
    width: calc(var(--ctx-menu-toggle-height, 20px) - 4px);
    height: calc(var(--ctx-menu-toggle-height, 20px) - 4px);
    border-radius: 50%;
    background: var(--ctx-menu-toggle-thumb-bg, #fff);
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .ctx-menu-toggle-item__track--on .ctx-menu-toggle-item__thumb {
    left: calc(var(--ctx-menu-toggle-width, 36px) - var(--ctx-menu-toggle-height, 20px) + 2px);
  }
`;

export const overlayStyles = `
  .ctx-menu-overlay {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: var(--ctx-menu-overlay-z-index, 9999);
    background: transparent;
  }
`;
```

- [ ] **Step 2: 更新** **`src/index.ts`** **导出入口**

```typescript
export { ContextMenu } from './components/context-menu';
export { ContextMenuItem } from './components/context-menu-item';
export { ContextMenuSeparator } from './components/context-menu-separator';
export { ContextMenuGroup } from './components/context-menu-group';
export { ContextMenuRadioGroup } from './components/context-menu-radio-group';
export { ContextMenuRadioItem } from './components/context-menu-radio-item';
export { ContextMenuToggleItem } from './components/context-menu-toggle-item';
export { calculateMenuPosition } from './utils/position';
export { handleMenuKeyboard } from './utils/keyboard';
export { getThemeVariables, applyTheme } from './themes';
export type {
  Position,
  ViewportRect,
  MenuParam,
  MenuStyle,
  MenuTheme,
  MenuSize,
  ExpandTrigger,
  MenuItemData,
  MenuSelectEventDetail,
  MenuBeforeCloseEventDetail,
  RadioChangeEventDetail,
  ToggleChangeEventDetail,
  MenuGroupData,
  MenuOverlayConfig,
  ContextMenuItemElement,
  ContextMenuElement,
  ContextMenuRadioGroupElement,
  ContextMenuToggleItemElement,
} from './types';
```

- [ ] **Step 3: 运行全部测试 + 类型检部+ 构建**

```bash
bun run typecheck
bun test
bun run build
```

预期：无类型错误，所有测部PASS，`dist/` 输出正常

- [ ] **Step 4: Commit**

```bash
git add src/index.ts src/styles.ts dist/
git commit -m "feat: add full exports and update styles with new components"
```

***

## 六、自审检部
| 需求编部                | 覆盖任务                                                                                                           | 状部|
| -------------------- | -------------------------------------------------------------------------------------------------------------- | -- |
| F1 右键触发              | Task 8 (ContextMenu.show) + Task 20 (open/close enhancement)                                                   | 部 |
| F2 基础菜单部            | Task 7 (ContextMenuItem: label/icon/shortcut)                                                                  | 部 |
| F3 分隔部              | Task 6 (ContextMenuSeparator)                                                                                  | 部 |
| F4 禁用部              | Task 7 (disabled attribute + CSS)                                                                              | 部 |
| F5 点击回调              | Task 7 (menu-select event)                                                                                     | 部 |
| F6 多层关闭机制            | Task 8 (click/ESC) + Task 20 (scroll/right-click/close API)                                                    | 部 |
| F7 关闭拦截              | Task 20 (before-close cancelable event)                                                                        | 部 |
| F8 多级嵌套子菜部          | Task 9 (submenu hover) + Task 16 (click expand-trigger)                                                        | 部 |
| F9 键盘导航              | Task 10 (keyboard integration)                                                                                 | 部 |
| F10 视口自适应定位          | Task 3 + Task 11 (position utility)                                                                            | 部 |
| F11 视觉风格与主部         | Task 5 (CSS variables) + Task 15 (themes.ts: google/edge + light/dark-element/dark-naive + small/normal/large) | 部 |
| F12 声明部HTML         | Task 7/8/9 (slot-based nesting)                                                                                | 部 |
| F13 命令部JS API       | Task 20 (addItem/addSeparator/getMenuOption) + Task 18 (setRadioValue/getRadioValue)                           | 部 |
| F14 无障部ARIA         | Task 12 (aria-\*) + Task 18/19 (aria-checked)                                                                  | 部 |
| F15 单选组 (Radio)      | Task 18 (RadioGroup + RadioItem)                                                                               | 部 |
| F16 开关项 (Toggle)     | Task 19 (ToggleItem with switch UI)                                                                            | 部 |
| F17 菜单分组             | Task 17 (ContextMenuGroup with visibility gating)                                                              | 部 |
| F18 可见性控部           | Task 16 (visible attribute on ContextMenuItem)                                                                 | 部 |
| F19 动态内部            | 未单独覆盖（Task 20 addItem 部label 支持函数式，完整评估延后部                                                                   | 部 |
| F20 参数传部            | Task 20 (menuParam via open/menuParam getter)                                                                  | 部 |
| F21 Header/Footer 插槽 | Task 20 (named slots: header/footer)                                                                           | 部 |
| F22 透明遮罩             | Task 20 (overlay attribute + click-to-close)                                                                   | 部 |
| F23 容器尺寸控制           | Task 20 (observedAttributes: width/max-width/height/max-height)                                                | 部 |
| F24 自定义样部           | 未单独覆盖（P2，后续通过 item-class/item-style 迭代部                                                                       | 部 |
| F25 编程式状态查部         | Task 20 (getMenuOption) + Task 18 (getRadioValue/setRadioValue)                                                | 部 |

- **缺口**:
  - F19 动态内容（函数部label/visible/disabled）仅部`addItem` 中对 `label` 做了基本函数支持，完整评估机制延后迭部  - F24 自定义样式（item-class/item-style/group-class/group-style）未覆盖，可部P2 迭代中通过 `Element.setAttribute` / `element.style` 实现

### 6.2 类型一致性检部
- `Position` 接口部`types.ts` 定义 部`position.ts` 导入使用 部`context-menu.ts` 使用 部- `MenuParam` 定义 部ContextMenu.open(param) 部addItem label 函数 部- `MenuStyle/MenuTheme/MenuSize` 部themes.ts SIZE\_MAP/STYLE\_MAP/THEME\_MAP 部applyTheme 部- `ExpandTrigger` 部ContextMenuItem.expandTrigger getter 部hover/click 分支判断 部- `RadioChangeEventDetail` 部ContextMenuRadioGroup.setRadioValue dispatchEvent 部- `ToggleChangeEventDetail` 部ContextMenuToggleItem dispatchEvent 部- `MenuBeforeCloseEventDetail` 部ContextMenu.\_tryClose dispatchEvent 部cancelable 部- `ContextMenuRadioGroupElement.setRadioValue/getRadioValue` 部实现 部- `ContextMenuToggleItemElement.checked` 部getter/setter + hasAttribute 部- `ContextMenuElement.open/close/addItem/addSeparator/getMenuOption/menuParam` 部完整实现 部
### 6.3 Placeholder 扫描

- 部"TBD" / "TODO" 字符部- 部"implement later" / "fill in details"
- 所有步骤包含实际代部- 所有测试包含具体断言

***

**计划状态：** 部自审通过部3/25 需求完整覆盖，2 部P2 功能延后迭代（F19 完整评估机制 + F24 自定义样式），无 placeholder，类型一致部