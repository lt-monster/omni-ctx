# Context Menu Function Open With Caching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a top-level `openContextMenu()` API that opens a runtime-created context menu from `{ x, y, items }`, optionally reuses it by `cacheKey`, and documents the new behavior in `README.md`.

**Architecture:** Reuse the existing `ContextMenu.open({ x, y }, { items, param, replace })` capability internally instead of reimplementing rendering. Add a dedicated runtime module responsible for cache lookup, lazy element creation, lifecycle interception, and returning a `close()` / `destroy()` handle, while keeping existing declarative and instance APIs intact.

**Tech Stack:** TypeScript, Web Components, Bun test runner

---

## File Map

- Modify: `src/types.ts` — add `OpenContextMenuOptions` and `ContextMenuHandle`
- Create: `src/runtime/open-context-menu.ts` — implement runtime factory, `cacheKey` cache, and returned handle
- Modify: `src/index.ts` — export `openContextMenu` and new public types
- Modify: `tests/integration.test.ts` — add source-surface assertions for new exports and runtime file usage
- Create: `tests/runtime-open.test.ts` — add focused source-level tests for caching and lifecycle behavior
- Modify: `README.md` — document the top-level function API and caching rules

---

### Task 1: Add Failing Tests For The New Public Function API

**Files:**
- Modify: `tests/integration.test.ts`
- Create: `tests/runtime-open.test.ts`

- [ ] **Step 1: Write the failing export and type-surface tests**

Append the following block to `tests/integration.test.ts`:

```ts
describe('ContextMenu function API exports', () => {
  it('exports openContextMenu from the package entry source', () => {
    const src = require('node:fs').readFileSync(
      new URL('../src/index.ts', import.meta.url),
      'utf8'
    );

    expect(src).toContain("export { openContextMenu } from './runtime/open-context-menu'");
  });

  it('exports OpenContextMenuOptions and ContextMenuHandle from the type model', () => {
    const src = require('node:fs').readFileSync(
      new URL('../src/types.ts', import.meta.url),
      'utf8'
    );

    expect(src).toContain('export interface OpenContextMenuOptions');
    expect(src).toContain('export interface ContextMenuHandle');
    expect(src).toContain('cacheKey?: string;');
    expect(src).toContain('element: ContextMenuElement;');
    expect(src).toContain('destroy(): void;');
  });
});
```

- [ ] **Step 2: Create a focused failing runtime-source test file**

Create `tests/runtime-open.test.ts` with:

```ts
import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const runtimePath = new URL('../src/runtime/open-context-menu.ts', import.meta.url);

describe('openContextMenu runtime source', () => {
  it('creates a dedicated runtime module', () => {
    expect(existsSync(runtimePath)).toBe(true);
  });

  it('defines a cache keyed by cacheKey', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain('new Map<string, ContextMenu>()');
    expect(source).toContain('cacheKey');
  });

  it('reuses ContextMenu.open for runtime rendering', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain("menu.open({ x, y }, { items, param, replace: true })");
  });

  it('returns close and destroy handle methods', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain('close: () =>');
    expect(source).toContain('destroy: () =>');
  });
});
```

- [ ] **Step 3: Run the targeted tests to verify they fail**

Run:

```bash
bun test tests/integration.test.ts tests/runtime-open.test.ts
```

Expected: FAIL because:

- `src/index.ts` does not export `openContextMenu`
- `src/types.ts` does not define `OpenContextMenuOptions` or `ContextMenuHandle`
- `src/runtime/open-context-menu.ts` does not exist yet

- [ ] **Step 4: Commit the failing tests**

```bash
git add tests/integration.test.ts tests/runtime-open.test.ts
git commit -m "test: cover runtime context menu function api"
```

---

### Task 2: Add The New Public Types And Package Exports

**Files:**
- Modify: `src/types.ts`
- Modify: `src/index.ts`
- Test: `tests/integration.test.ts`

- [ ] **Step 1: Add the new public types**

In `src/types.ts`, add these interfaces after `MenuOpenInput`:

```ts
export interface OpenContextMenuOptions {
  x: number;
  y: number;
  items: MenuItemData[];
  param?: MenuParam;
  cacheKey?: string;
}

export interface ContextMenuHandle {
  element: ContextMenuElement;
  close(): void;
  destroy(): void;
}
```

This intentionally reuses the existing `ContextMenuElement` type rather than coupling the public handle to the concrete class import.

- [ ] **Step 2: Export the new function placeholder and public types**

In `src/index.ts`, add:

```ts
export { openContextMenu } from './runtime/open-context-menu';
```

immediately after the component exports.

Also extend the type export block with:

```ts
  OpenContextMenuOptions,
  ContextMenuHandle,
```

- [ ] **Step 3: Create a temporary runtime stub so exports resolve**

Create `src/runtime/open-context-menu.ts` with:

```ts
import type { ContextMenuHandle, OpenContextMenuOptions } from '../types';

export function openContextMenu(_options: OpenContextMenuOptions): ContextMenuHandle {
  throw new Error('openContextMenu is not implemented yet');
}
```

This is only the minimal compile-time placeholder to turn the export surface green before implementing the real runtime logic in the next task.

- [ ] **Step 4: Run the targeted tests**

Run:

```bash
bun test tests/integration.test.ts tests/runtime-open.test.ts
```

Expected: still FAIL, but the failures should now be reduced to runtime-source behavior assertions such as missing cache map and missing `menu.open(...)` usage.

- [ ] **Step 5: Commit the type and export surface**

```bash
git add src/types.ts src/index.ts src/runtime/open-context-menu.ts
git commit -m "feat: add runtime context menu api types"
```

---

### Task 3: Implement `openContextMenu()` With `cacheKey` Reuse

**Files:**
- Modify: `src/runtime/open-context-menu.ts`
- Test: `tests/runtime-open.test.ts`

- [ ] **Step 1: Replace the stub with the real runtime implementation**

Update `src/runtime/open-context-menu.ts` to:

```ts
import { ContextMenu } from '../components/context-menu';
import type { ContextMenuHandle, ContextMenuElement, OpenContextMenuOptions } from '../types';

const runtimeMenuCache = new Map<string, ContextMenu>();

function createRuntimeContextMenu(): ContextMenu {
  const menu = document.createElement('context-menu') as ContextMenu;
  document.body.appendChild(menu);
  return menu;
}

function getOrCreateRuntimeContextMenu(cacheKey?: string): ContextMenu {
  if (!cacheKey) return createRuntimeContextMenu();

  const cached = runtimeMenuCache.get(cacheKey);
  if (cached) {
    if (!cached.isConnected) document.body.appendChild(cached);
    return cached;
  }

  const menu = createRuntimeContextMenu();
  runtimeMenuCache.set(cacheKey, menu);
  return menu;
}

function destroyRuntimeContextMenu(menu: ContextMenu, cacheKey?: string): void {
  if (cacheKey) runtimeMenuCache.delete(cacheKey);
  menu.remove();
}

function attachRuntimeLifecycle(menu: ContextMenu, cacheKey?: string): void {
  if ((menu as any).__runtimeLifecycleAttached) return;

  const originalHide = menu.hide.bind(menu);
  menu.hide = () => {
    originalHide();
    if (!cacheKey) {
      menu.remove();
    }
  };

  (menu as any).__runtimeLifecycleAttached = true;
}

export function openContextMenu(options: OpenContextMenuOptions): ContextMenuHandle {
  const { cacheKey, items, param, x, y } = options;
  const menu = getOrCreateRuntimeContextMenu(cacheKey);

  attachRuntimeLifecycle(menu, cacheKey);
  menu.open({ x, y }, { items, param, replace: true });

  return {
    element: menu as ContextMenuElement,
    close: () => {
      menu.close();
    },
    destroy: () => {
      destroyRuntimeContextMenu(menu, cacheKey);
    },
  };
}
```

- [ ] **Step 2: Tighten the runtime-source tests around lifecycle behavior**

Extend `tests/runtime-open.test.ts` with:

```ts
  it('creates and reuses runtime menus through helper functions', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain('function createRuntimeContextMenu()');
    expect(source).toContain('function getOrCreateRuntimeContextMenu(cacheKey?: string)');
    expect(source).toContain('runtimeMenuCache.get(cacheKey)');
    expect(source).toContain('runtimeMenuCache.set(cacheKey, menu)');
  });

  it('keeps cached menus and removes one-off menus on hide', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain('const originalHide = menu.hide.bind(menu)');
    expect(source).toContain('menu.hide = () => {');
    expect(source).toContain('if (!cacheKey) {');
    expect(source).toContain('menu.remove();');
  });

  it('destroys cached menus explicitly', () => {
    const source = readFileSync(runtimePath, 'utf8');
    expect(source).toContain('runtimeMenuCache.delete(cacheKey)');
    expect(source).toContain('destroyRuntimeContextMenu(menu, cacheKey)');
  });
```

- [ ] **Step 3: Run the targeted tests to verify they pass**

Run:

```bash
bun test tests/integration.test.ts tests/runtime-open.test.ts
```

Expected: PASS for both files.

- [ ] **Step 4: Run the full test suite**

Run:

```bash
bun test
```

Expected: all tests pass.

- [ ] **Step 5: Commit the runtime implementation**

```bash
git add src/runtime/open-context-menu.ts tests/runtime-open.test.ts tests/integration.test.ts
git commit -m "feat: add cached runtime context menu function"
```

---

### Task 4: Document The Function API In `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add `openContextMenu()` to the TypeScript API section**

In the “导出的函数” table, add this row:

```md
| `openContextMenu(options)` | 动态创建并打开运行时菜单，无需预先编写 `<context-menu>`，支持 `cacheKey` 复用实例并返回带 `close()` / `destroy()` 的句柄 |
```

In the “导出的类型” table, add:

```md
| `OpenContextMenuOptions` | 顶层函数 `openContextMenu()` 的参数：`{ x, y, items, param?, cacheKey? }` |
| `ContextMenuHandle` | `openContextMenu()` 返回句柄：`{ element, close(), destroy() }` |
```

- [ ] **Step 2: Add a new section for runtime function usage**

Insert this section after “⚡ 动态添加菜单项”:

```md
## 🚀 无标签动态打开菜单

如果不想预先编写 `<context-menu>` 标签，可以直接使用顶层函数 `openContextMenu()`。

### 1. 一次性菜单

```ts
import { openContextMenu } from 'omni-ctx';

openContextMenu({
  x: 120,
  y: 200,
  items: [
    { label: '打开', icon: '📂', handler: () => console.log('open') },
    { type: 'separator' },
    { label: '删除', icon: '🗑️', handler: () => console.log('delete') },
  ],
  param: { fileId: 'A-01' },
});
```

### 2. 使用 `cacheKey` 复用菜单实例

```ts
const handle = openContextMenu({
  cacheKey: 'file-menu',
  x: 120,
  y: 200,
  items: [
    { label: '打开' },
    { label: '重命名' },
    { label: '删除' },
  ],
  param: { fileId: 'A-01' },
});

handle.close();   // 关闭，但保留缓存
handle.destroy(); // 关闭并销毁缓存实例
```

### 3. 缓存规则

- 不传 `cacheKey`：按一次性菜单处理，关闭后自动移除
- 传 `cacheKey`：复用同一个运行时菜单宿主实例
- 复用时默认会根据本次 `items` 和 `param` 刷新菜单内容
- 当前缓存的是菜单实例，不是永久冻结的菜单项 DOM
```

- [ ] **Step 3: Keep the existing instance API docs**

Do not remove the existing `<context-menu>` / `menu.open(...)` documentation. This feature is additive, not a replacement.

- [ ] **Step 4: Run a regression check after the README update**

Run:

```bash
bun test tests/integration.test.ts tests/runtime-open.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the documentation**

```bash
git add README.md
git commit -m "docs: add runtime openContextMenu guide"
```

---

### Task 5: Final Verification

**Files:**
- Verify: `src/types.ts`
- Verify: `src/runtime/open-context-menu.ts`
- Verify: `src/index.ts`
- Verify: `tests/integration.test.ts`
- Verify: `tests/runtime-open.test.ts`
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

Expected: build completes successfully.

- [ ] **Step 3: Inspect the final diff scope**

```bash
git diff -- src/types.ts src/runtime/open-context-menu.ts src/index.ts tests/integration.test.ts tests/runtime-open.test.ts README.md
```

Expected: diff shows only the new function API, cache/lifecycle runtime module, matching tests, and README documentation.

- [ ] **Step 4: Commit the final verified state**

```bash
git add src/types.ts src/runtime/open-context-menu.ts src/index.ts tests/integration.test.ts tests/runtime-open.test.ts README.md
git commit -m "feat: add openContextMenu with cacheKey reuse"
```
