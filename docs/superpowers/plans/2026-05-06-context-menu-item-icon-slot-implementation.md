# Context Menu Item Icon Slot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `context-menu-item` 增加 `slot="icon"` 图标插槽和 `icon-size` 属性，并保持现有 `icon` 属性兼容。

**Architecture:** 在 `context-menu-item` 的 shadow DOM 中将图标区域拆成属性图标文本节点与命名插槽两部分，通过插槽分配结果决定优先级。`icon-size` 通过 host 上的私有 CSS 变量覆盖现有主题图标尺寸变量，不修改程序化 API。

**Tech Stack:** TypeScript、自定义元素、Bun 测试

---

### Task 1: 为图标插槽行为补测试

**Files:**
- Create: `tests/context-menu-item.test.ts`
- Modify: `package.json`（无需修改，仅使用现有测试脚本）
- Test: `tests/context-menu-item.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
import { describe, expect, it } from 'bun:test';
import '../src/index';

describe('context-menu-item icon rendering', () => {
  it('renders attribute icon when only icon attribute is provided', () => {});
  it('prefers slot icon content over icon attribute', () => {});
  it('applies icon-size as host css variable', () => {});
  it('hides icon container when no icon is provided', () => {});
});
```

- [ ] **Step 2: 运行单测确认失败**

Run: `bun test tests/context-menu-item.test.ts`
Expected: FAIL，因为组件尚未提供命名插槽优先级与 `icon-size` 支持。

- [ ] **Step 3: 在测试里断言具体 DOM 行为**

```ts
const item = document.createElement('context-menu-item');
item.setAttribute('label', 'Open');
item.setAttribute('icon', '📂');
document.body.appendChild(item);

const shadow = item.shadowRoot!;
const iconContainer = shadow.querySelector('.ctx-menu-item__icon') as HTMLElement;
const iconText = shadow.querySelector('.ctx-menu-item__icon-text') as HTMLElement;
expect(iconContainer.style.display).toBe('');
expect(iconText.textContent).toBe('📂');
```

- [ ] **Step 4: 再跑一次测试并确认仍有失败项**

Run: `bun test tests/context-menu-item.test.ts`
Expected: FAIL，失败点集中在未实现的新 DOM 结构或插槽优先级。

- [ ] **Step 5: 提交**

```bash
git add tests/context-menu-item.test.ts
git commit -m "test: cover context-menu-item icon slot behavior"
```

### Task 2: 实现 `context-menu-item` 的 icon 插槽与 `icon-size`

**Files:**
- Modify: `src/components/context-menu-item.ts`
- Modify: `src/styles.ts`
- Test: `tests/context-menu-item.test.ts`

- [ ] **Step 1: 扩展模板与观察属性**

```ts
static get observedAttributes() {
  return ['label', 'icon', 'icon-size', 'shortcut', 'disabled', 'visible', 'expand-trigger'];
}
```

```ts
<span class="ctx-menu-item__icon" part="icon">
  <span class="ctx-menu-item__icon-text"></span>
  <slot name="icon"></slot>
</span>
```

- [ ] **Step 2: 监听插槽变化并更新渲染**

```ts
connectedCallback() {
  // ...
  this.shadowRoot?.querySelector('slot[name="icon"]')?.addEventListener('slotchange', this._handleIconSlotChange);
}
```

```ts
private _handleIconSlotChange = () => {
  this._updateRendering();
};
```

- [ ] **Step 3: 在渲染逻辑里实现“插槽优先，属性兜底”**

```ts
const iconSlot = this.shadowRoot.querySelector('slot[name="icon"]') as HTMLSlotElement;
const assigned = iconSlot.assignedNodes({ flatten: true }).filter((node) => {
  return !(node.nodeType === Node.TEXT_NODE && !node.textContent?.trim());
});
const hasSlottedIcon = assigned.length > 0;
const icon = this.getAttribute('icon') || '';

iconTextEl.textContent = hasSlottedIcon ? '' : icon;
iconTextEl.style.display = hasSlottedIcon ? 'none' : icon ? '' : 'none';
iconEl.style.display = hasSlottedIcon || icon ? '' : 'none';
```

- [ ] **Step 4: 应用 `icon-size` 为 host CSS 变量**

```ts
const iconSize = this.getAttribute('icon-size');
if (iconSize) {
  this.style.setProperty('--_item-icon-size', iconSize);
} else {
  this.style.removeProperty('--_item-icon-size');
}
```

- [ ] **Step 5: 为插槽内容补最小样式支持**

```ts
.ctx-menu-item__icon ::slotted(*) {
  max-width: 100%;
  max-height: 100%;
}
```

```ts
.ctx-menu-item__icon ::slotted(svg),
.ctx-menu-item__icon ::slotted(img) {
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 6: 运行测试确认通过**

Run: `bun test tests/context-menu-item.test.ts`
Expected: PASS

- [ ] **Step 7: 提交**

```bash
git add src/components/context-menu-item.ts src/styles.ts tests/context-menu-item.test.ts
git commit -m "feat: support slotted icons in context-menu-item"
```

### Task 3: 更新示例并跑相关回归

**Files:**
- Modify: `examples/index.html`
- Modify: `README.md`
- Modify: `README_ZH.md`
- Test: `tests/examples.test.ts`

- [ ] **Step 1: 在示例里增加一个插槽图标用法**

```html
<context-menu-item label="Custom Icon" icon-size="18px">
  <span slot="icon">★</span>
</context-menu-item>
```

- [ ] **Step 2: 在中英文 README 中补最小示例**

```html
<context-menu-item label="Settings" icon="⚙️"></context-menu-item>
<context-menu-item label="Brand" icon-size="18px">
  <svg slot="icon" viewBox="0 0 16 16" aria-hidden="true">...</svg>
</context-menu-item>
```

- [ ] **Step 3: 运行相关测试**

Run: `bun test tests/context-menu-item.test.ts tests/examples.test.ts`
Expected: PASS

- [ ] **Step 4: 跑全量测试确认未回归**

Run: `bun test`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add examples/index.html README.md README_ZH.md
git commit -m "docs: add icon slot examples"
```
