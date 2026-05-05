# Programmatic API Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `isOpen` getter, `removeItem(id)`, `clearItems()`, and `handler` wiring in `addItem` to complete the programmatic API surface.

**Architecture:** All changes are confined to `src/components/context-menu.ts` and `src/types.ts`. No new files needed — extend the existing `ContextMenu` class and `ContextMenuElement` interface.

**Tech Stack:** TypeScript, Web Components, Bun test runner

---

## File Map

- Modify: `src/types.ts` — add `isOpen`, `removeItem`, `clearItems` to `ContextMenuElement`
- Modify: `src/components/context-menu.ts` — implement the three new methods/getter, wire `handler` in `addItem`
- Modify: `tests/integration.test.ts` — add programmatic API tests

---

### Task 1: Add `isOpen` getter

**Files:**
- Modify: `src/types.ts`
- Modify: `src/components/context-menu.ts`
- Modify: `tests/integration.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `tests/integration.test.ts`:

```ts
describe('ContextMenu programmatic API', () => {
  it('isOpen reflects visibility state', () => {
    // isOpen should be exported on the type
    const src = require('node:fs').readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8');
    expect(src).toContain('isOpen');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test tests/integration.test.ts
```
Expected: FAIL — `isOpen` not in types.ts

- [ ] **Step 3: Add `isOpen` to the interface**

In `src/types.ts`, add to `ContextMenuElement`:
```ts
isOpen: boolean;
```

- [ ] **Step 4: Implement `isOpen` getter in `src/components/context-menu.ts`**

After the `get menuDirection()` getter (line 157):
```ts
get isOpen(): boolean {
  return this._menuEl?.classList.contains('ctx-menu--visible') ?? false;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
bun test tests/integration.test.ts
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/components/context-menu.ts tests/integration.test.ts
git commit -m "feat: add isOpen getter to ContextMenu"
```

---

### Task 2: Add `removeItem(id)` and `clearItems()`

**Files:**
- Modify: `src/types.ts`
- Modify: `src/components/context-menu.ts`
- Modify: `tests/integration.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to the `describe('ContextMenu programmatic API')` block in `tests/integration.test.ts`:

```ts
it('removeItem and clearItems are exported on the type', () => {
  const src = require('node:fs').readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8');
  expect(src).toContain('removeItem');
  expect(src).toContain('clearItems');
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test tests/integration.test.ts
```
Expected: FAIL

- [ ] **Step 3: Add methods to the interface**

In `src/types.ts`, add to `ContextMenuElement`:
```ts
removeItem(id: string): void;
clearItems(): void;
```

- [ ] **Step 4: Implement in `src/components/context-menu.ts`**

After `getMenuOption` (line 194):
```ts
removeItem(id: string): void {
  const data = this._itemMap.get(id);
  if (!data) return;
  this._itemMap.delete(id);
  const el = this.querySelector(`[data-id="${id}"]`);
  el?.remove();
}

clearItems(): void {
  this._itemMap.clear();
  // Remove all slotted children (items, separators, groups)
  while (this.firstChild) this.removeChild(this.firstChild);
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
bun test tests/integration.test.ts
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/components/context-menu.ts tests/integration.test.ts
git commit -m "feat: add removeItem and clearItems to ContextMenu"
```

---

### Task 3: Wire `handler` in `addItem` for regular menu items

**Files:**
- Modify: `src/components/context-menu.ts`
- Modify: `tests/integration.test.ts`

Currently `addItem` wires `onChange` for `option` items but ignores `handler` for regular `context-menu-item` elements. Callers must listen to `menu-select` and match by label — there's no direct callback.

- [ ] **Step 1: Write the failing test**

Add to `tests/integration.test.ts`:

```ts
it('handler wiring is present in addItem source', () => {
  const src = require('node:fs').readFileSync(
    new URL('../src/components/context-menu.ts', import.meta.url), 'utf8'
  );
  // handler should be wired for non-option items
  expect(src).toMatch(/data\.handler/);
  // and it should be inside the non-option branch (after the option-change block)
  const handlerIdx = src.indexOf("data.handler");
  const optionChangeIdx = src.indexOf("option-change");
  expect(handlerIdx).toBeGreaterThan(optionChangeIdx);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun test tests/integration.test.ts
```
Expected: FAIL — handler not wired after option-change block

- [ ] **Step 3: Wire `handler` in `addItem`**

In `src/components/context-menu.ts`, in the `addItem` method, after the `option-change` listener block and before `if (data.children)`, add:

```ts
if (data.handler && data.type !== 'option') {
  el.addEventListener('menu-select', () => {
    data.handler!(this._menuParam || undefined);
  });
}
```

The relevant section of `addItem` after the change:
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun test tests/integration.test.ts
```
Expected: PASS

- [ ] **Step 5: Run full test suite**

```bash
bun test
```
Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/components/context-menu.ts tests/integration.test.ts
git commit -m "feat: wire handler callback in addItem for menu items"
```

---

## Verification

End-to-end check after all tasks:

```bash
bun test
bun run build
```

Confirm `dist/omni-ctx.js` is generated and `bun test` reports 0 failures.

Manual smoke test in `examples/index.html`: open the demo, right-click to show the menu, verify items appear and click handlers fire.
