# Context Menu Programmatic Open Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the new `context-menu` programmatic opening flow so `open()` supports legacy `param`, direct `MenuItemData[]`, and `{ items, param, replace }` config input, while preserving declarative content and documenting the new API in `README.md`.

**Architecture:** Extend the public types first, then refactor `ContextMenu` so `open()` normalizes its second argument into a single internal structure. Reuse one internal item-creation path for both `addItem()` and programmatic rendering, mark generated nodes as programmatic, and ensure programmatic cleanup only removes generated nodes instead of declarative child content.

**Tech Stack:** TypeScript, Web Components, Bun test runner

---

## File Map

- Modify: `src/types.ts` — add `MenuOpenConfig`, `MenuOpenInput`, and update the `ContextMenuElement.open()` signature
- Modify: `src/components/context-menu.ts` — add input normalization, shared item creation, programmatic render/cleanup helpers, and new `open()` behavior
- Modify: `tests/integration.test.ts` — add tests for new input forms, replacement behavior, and coexistence with declarative content
- Modify: `README.md` — add direct `open()` programmatic examples and clarify supported object form

---

### Task 1: Extend Public Types For Programmatic `open()`

**Files:**
- Modify: `src/types.ts`
- Test: `tests/integration.test.ts`

- [ ] **Step 1: Write the failing type-surface test**

Add the following test block near the existing `describe('ContextMenu programmatic API', ...)` section in `tests/integration.test.ts`:

```ts
  it('exports MenuOpenConfig, MenuOpenInput, and updated open signature', () => {
    const src = require('node:fs').readFileSync(
      new URL('../src/types.ts', import.meta.url),
      'utf8'
    );

    expect(src).toContain('export interface MenuOpenConfig');
    expect(src).toContain('export type MenuOpenInput');
    expect(src).toContain('open(event: MouseEvent | { x: number; y: number }, input?: MenuOpenInput): void;');
  });
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run:

```bash
bun test tests/integration.test.ts
```

Expected: FAIL because `MenuOpenConfig`, `MenuOpenInput`, and the updated `open()` signature are not yet present in `src/types.ts`.

- [ ] **Step 3: Add the new exported types and update the interface**

In `src/types.ts`, insert the new types after `MenuItemData` and update `ContextMenuElement`:

```ts
export interface MenuOpenConfig {
  items: MenuItemData[];
  param?: MenuParam;
  replace?: boolean;
}

export type MenuOpenInput = MenuParam | MenuItemData[] | MenuOpenConfig;
```

Then change:

```ts
  open(event: MouseEvent | { x: number; y: number }, param?: MenuParam): void;
```

to:

```ts
  open(event: MouseEvent | { x: number; y: number }, input?: MenuOpenInput): void;
```

- [ ] **Step 4: Re-export the new types from the package entry**

In `src/index.ts`, extend the `export type { ... }` block to include:

```ts
  MenuOpenConfig,
  MenuOpenInput,
```

This keeps the new public API available from the package root.

- [ ] **Step 5: Run the targeted test to verify it passes**

Run:

```bash
bun test tests/integration.test.ts
```

Expected: PASS for the new type-surface test.

- [ ] **Step 6: Commit the type changes**

```bash
git add src/types.ts src/index.ts tests/integration.test.ts
git commit -m "feat: add programmatic open types"
```

---

### Task 2: Add Failing Tests For Programmatic Open Behavior

**Files:**
- Modify: `tests/integration.test.ts`
- Reference: `src/components/context-menu.ts`

- [ ] **Step 1: Add runtime behavior tests that describe the intended API**

Append a new `describe('ContextMenu open input variants', ...)` block to `tests/integration.test.ts`:

```ts
describe('ContextMenu open input variants', () => {
  const loadSource = () =>
    require('node:fs').readFileSync(
      new URL('../src/components/context-menu.ts', import.meta.url),
      'utf8'
    );

  it('normalizes array input for open()', () => {
    const src = loadSource();
    expect(src).toContain("Array.isArray(input)");
    expect(src).toContain("items: input");
  });

  it('treats object input with items as config', () => {
    const src = loadSource();
    expect(src).toContain("'items' in input");
    expect(src).toContain('replace: input.replace ?? true');
  });

  it('marks programmatic nodes so declarative children are preserved', () => {
    const src = loadSource();
    expect(src).toContain('data-programmatic');
    expect(src).toContain('_clearProgrammaticItems');
  });

  it('reuses shared item creation for addItem and programmatic rendering', () => {
    const src = loadSource();
    expect(src).toContain('_createItemElement');
    expect(src).toContain('_renderProgrammaticItems');
  });
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run:

```bash
bun test tests/integration.test.ts
```

Expected: FAIL because the current source does not contain the normalization helper, shared item creation helper, or programmatic node marker.

- [ ] **Step 3: Keep the failing tests in place**

Do not modify the tests yet. These tests will guide the implementation in the next task.

- [ ] **Step 4: Commit the failing test additions**

```bash
git add tests/integration.test.ts
git commit -m "test: cover programmatic open variants"
```

---

### Task 3: Implement Programmatic `open()` Normalization And Rendering

**Files:**
- Modify: `src/components/context-menu.ts`
- Test: `tests/integration.test.ts`

- [ ] **Step 1: Update the imports and add internal helper types/constants**

At the top of `src/components/context-menu.ts`, update the type import:

```ts
import type {
  MenuParam,
  MenuStyle,
  MenuTheme,
  MenuSize,
  MenuItemData,
  MenuDirection,
  MenuOpenInput,
  MenuOpenConfig,
} from '../types';
```

Then add the internal marker and normalized shape below `TEMPLATE`:

```ts
const PROGRAMMATIC_ATTR = 'data-programmatic';

interface NormalizedOpenInput {
  param: MenuParam | null;
  items: MenuItemData[] | null;
  replace: boolean;
}
```

- [ ] **Step 2: Change `open()` to accept the new union input**

Replace:

```ts
  open(event: MouseEvent | { x: number; y: number }, param?: MenuParam): void {
    this._menuParam = param || null;
    if ('clientX' in event) {
      this.show(event.clientX, event.clientY);
    } else {
      this.show(event.x, event.y);
    }
  }
```

with:

```ts
  open(event: MouseEvent | { x: number; y: number }, input?: MenuOpenInput): void {
    const normalized = this._normalizeOpenInput(input);
    this._menuParam = normalized.param;

    if (normalized.items) {
      if (normalized.replace) this._clearProgrammaticItems();
      this._renderProgrammaticItems(normalized.items);
    }

    if ('clientX' in event) {
      this.show(event.clientX, event.clientY);
    } else {
      this.show(event.x, event.y);
    }
  }
```

- [ ] **Step 3: Add the normalization helper**

Add this private method before `_applySizeConstraints()`:

```ts
  private _normalizeOpenInput(input?: MenuOpenInput): NormalizedOpenInput {
    if (input == null) {
      return { param: null, items: null, replace: true };
    }

    if (Array.isArray(input)) {
      return {
        param: null,
        items: input,
        replace: true,
      };
    }

    if (typeof input === 'object' && input !== null && 'items' in input) {
      const config = input as MenuOpenConfig;
      return {
        param: config.param || null,
        items: config.items,
        replace: config.replace ?? true,
      };
    }

    return {
      param: input as MenuParam,
      items: null,
      replace: true,
    };
  }
```

- [ ] **Step 4: Factor item creation into a shared helper**

Replace the current body of `addItem(data: MenuItemData): void` with a call to a new shared helper:

```ts
  addItem(data: MenuItemData): void {
    const el = this._createItemElement(data);
    if (el) this.appendChild(el);
  }
```

Then add this helper below `clearItems()`:

```ts
  private _createItemElement(data: MenuItemData): HTMLElement | null {
    if (data.type === 'separator') {
      return document.createElement('context-menu-separator');
    }

    const el = document.createElement(
      data.type === 'option' ? 'context-menu-option-item' : 'context-menu-item',
    );
    const label = typeof data.label === 'function' ? data.label(this._menuParam || undefined) : data.label;
    el.setAttribute('label', label);
    if (data.id) { el.setAttribute('data-id', data.id); this._itemMap.set(data.id, data); }
    if (data.name) el.setAttribute('name', data.name);
    if (data.value) el.setAttribute('value', data.value);
    if (data.icon) el.setAttribute('icon', data.icon);
    if (data.shortcut) el.setAttribute('shortcut', data.shortcut);
    if (data.disabled) el.setAttribute('disabled', '');
    if (data.checked) el.setAttribute('checked', '');
    if (data.type === 'option' && data.onChange) {
      el.addEventListener('option-change', (event) => {
        data.onChange?.((event as CustomEvent).detail.value, this._menuParam || undefined);
      });
    }
    if (data.handler && data.type !== 'option') {
      el.addEventListener('menu-select', () => {
        data.handler!(this._menuParam || undefined);
      });
    }
    if (data.children) {
      const sub = document.createElement('context-menu') as ContextMenu;
      data.children.forEach((child) => {
        const childEl = sub._createItemElement(child);
        if (childEl) {
          childEl.setAttribute(PROGRAMMATIC_ATTR, 'true');
          sub.appendChild(childEl);
        }
      });
      el.appendChild(sub);
    }

    return el;
  }
```

- [ ] **Step 5: Add programmatic render and cleanup helpers**

Add these methods below `_createItemElement`:

```ts
  private _renderProgrammaticItems(items: MenuItemData[]): void {
    items.forEach((item) => {
      const el = this._createItemElement(item);
      if (!el) return;
      el.setAttribute(PROGRAMMATIC_ATTR, 'true');
      this.appendChild(el);
    });
  }

  private _clearProgrammaticItems(): void {
    this.querySelectorAll(`:scope > [${PROGRAMMATIC_ATTR}="true"]`).forEach((node) => {
      const id = node.getAttribute('data-id');
      if (id) this._itemMap.delete(id);
      node.remove();
    });
  }
```

- [ ] **Step 6: Keep `clearItems()` destructive and explicit**

Leave `clearItems()` as the full-clear public API:

```ts
  clearItems(): void {
    this._itemMap.clear();
    while (this.firstChild) this.removeChild(this.firstChild);
  }
```

Do not switch `clearItems()` to `_clearProgrammaticItems()`. The spec requires `clearItems()` to keep its current explicit destructive behavior.

- [ ] **Step 7: Run the targeted tests to verify the new behavior**

Run:

```bash
bun test tests/integration.test.ts
```

Expected: PASS for:

- the new type-surface test
- the programmatic open source-structure tests
- the existing programmatic API tests

- [ ] **Step 8: Commit the implementation**

```bash
git add src/components/context-menu.ts tests/integration.test.ts
git commit -m "feat: support programmatic open input"
```

---

### Task 4: Add Behavioral Tests For Preservation And Replacement

**Files:**
- Modify: `tests/integration.test.ts`
- Modify: `src/components/context-menu.ts` if any small fix is needed

- [ ] **Step 1: Add DOM-level tests for declarative preservation and replacement**

Append this test block to `tests/integration.test.ts`:

```ts
describe('ContextMenu programmatic DOM behavior', () => {
  it('preserves declarative children when opening with programmatic items', async () => {
    await import('../src/index');

    const menu = document.createElement('context-menu') as any;
    const staticItem = document.createElement('context-menu-item');
    staticItem.setAttribute('label', 'Static');
    menu.appendChild(staticItem);
    document.body.appendChild(menu);

    menu.open({ x: 10, y: 20 }, [{ label: 'Dynamic' }]);

    expect(menu.querySelector('context-menu-item[label="Static"]')).toBeTruthy();
    expect(menu.querySelector('context-menu-item[label="Dynamic"]')).toBeTruthy();

    menu.remove();
  });

  it('replaces prior programmatic children by default', async () => {
    await import('../src/index');

    const menu = document.createElement('context-menu') as any;
    document.body.appendChild(menu);

    menu.open({ x: 10, y: 20 }, [{ label: 'First' }]);
    menu.open({ x: 10, y: 20 }, [{ label: 'Second' }]);

    expect(menu.querySelector('context-menu-item[label="First"]')).toBeNull();
    expect(menu.querySelector('context-menu-item[label="Second"]')).toBeTruthy();

    menu.remove();
  });

  it('appends programmatic children when replace is false', async () => {
    await import('../src/index');

    const menu = document.createElement('context-menu') as any;
    document.body.appendChild(menu);

    menu.open({ x: 10, y: 20 }, [{ label: 'First' }]);
    menu.open({ x: 10, y: 20 }, {
      items: [{ label: 'Second' }],
      replace: false,
    });

    expect(menu.querySelector('context-menu-item[label="First"]')).toBeTruthy();
    expect(menu.querySelector('context-menu-item[label="Second"]')).toBeTruthy();

    menu.remove();
  });
});
```

- [ ] **Step 2: Run the targeted tests**

Run:

```bash
bun test tests/integration.test.ts
```

Expected: PASS. If any fail, make only the minimal code adjustment needed in `src/components/context-menu.ts`.

- [ ] **Step 3: Run the full test suite**

Run:

```bash
bun test
```

Expected: all tests pass with `0 fail`.

- [ ] **Step 4: Commit the behavioral coverage**

```bash
git add tests/integration.test.ts src/components/context-menu.ts
git commit -m "test: verify programmatic open DOM behavior"
```

---

### Task 5: Update `README.md` With The New API

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add the new types to the TypeScript API section**

In the “导出的类型” table, add rows for:

```md
| `MenuOpenConfig` | `open()` 的配置对象：`{ items, param?, replace? }` |
| `MenuOpenInput` | `open()` 支持的第二参数联合类型：`MenuParam \| MenuItemData[] \| MenuOpenConfig` |
```

- [ ] **Step 2: Add a new “编程式 open() 用法” section**

Insert a new section after “⚡ 动态添加菜单项” with the following content:

```md
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
```

- [ ] **Step 3: Update the `<context-menu>` methods table**

Change the `open(event, param?)` row to:

```md
| `open(event, input?)` | 根据鼠标事件或 `{ x, y }` 坐标打开菜单，`input` 支持 `MenuParam`、`MenuItemData[]` 或 `{ items, param?, replace? }` |
```

- [ ] **Step 4: Run a quick text check**

Run:

```bash
bun test tests/integration.test.ts
```

Expected: PASS. The README change itself is doc-only, so this is a lightweight regression check after the API wording update.

- [ ] **Step 5: Commit the documentation**

```bash
git add README.md
git commit -m "docs: describe programmatic open api"
```

---

### Task 6: Final Verification

**Files:**
- Verify: `src/types.ts`
- Verify: `src/index.ts`
- Verify: `src/components/context-menu.ts`
- Verify: `tests/integration.test.ts`
- Verify: `README.md`

- [ ] **Step 1: Run the full test suite**

```bash
bun test
```

Expected: all tests pass.

- [ ] **Step 2: Run the build**

```bash
bun run build
```

Expected: build completes successfully and regenerates the package output.

- [ ] **Step 3: Inspect the git diff**

```bash
git diff -- src/types.ts src/index.ts src/components/context-menu.ts tests/integration.test.ts README.md
```

Expected: diff contains only the programmatic `open()` feature, associated tests, and README documentation updates.

- [ ] **Step 4: Commit the final verification state**

```bash
git add src/types.ts src/index.ts src/components/context-menu.ts tests/integration.test.ts README.md
git commit -m "feat: add programmatic open support"
```
