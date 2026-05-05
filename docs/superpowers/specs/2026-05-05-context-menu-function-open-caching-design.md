# Context Menu Function Open With Caching Design

## Background

The current library already exposes a `ContextMenu` Web Component and supports:

- declarative usage through authored `<context-menu>` markup
- imperative opening on an existing element instance through `open()` / `show()`
- dynamic item creation through `addItem()`, `addSeparator()`, `removeItem()`, and `clearItems()`

However, the actual requested usage is different from “extend an existing menu instance.”

The user wants a mode where callers do **not** need to author any `<context-menu>` element in advance. Instead, they want to provide:

- `x`
- `y`
- a menu items array

and have the library dynamically create, render, open, and manage the menu at runtime.

The user also clarified an additional requirement:

- although the menu is dynamically generated, it should optionally be cached and reused later, so repeated openings do not have to recreate the menu host and its DOM every time

The user chose the design direction:

- keep the current component-based implementation internally
- add a top-level function API externally
- support cache reuse through `cacheKey`

## Goals

- Add a first-class top-level function API for opening a menu without predeclared markup.
- Reuse the existing `ContextMenu` component internally instead of introducing a second rendering system.
- Allow callers to open a one-off runtime menu with only coordinates and items.
- Allow callers to opt into reusable cached runtime menus through `cacheKey`.
- Keep declarative `<context-menu>` usage fully supported and unchanged.
- Keep existing instance methods such as `menu.open(...)` available for callers who already manage their own menu elements.

## Non-Goals

- Do not remove or replace the existing declarative component API.
- Do not require all dynamic menus to be cached.
- Do not automatically infer cache identity from menu structure.
- Do not build a virtual-DOM or diff engine for menu items in this iteration.
- Do not introduce framework bindings.

## Recommended Public API

### Primary function

Add a top-level exported function:

```ts
openContextMenu(options: OpenContextMenuOptions): ContextMenuHandle
```

Recommended options:

```ts
interface OpenContextMenuOptions {
  x: number;
  y: number;
  items: MenuItemData[];
  param?: MenuParam;
  cacheKey?: string;
}
```

Recommended handle:

```ts
interface ContextMenuHandle {
  element: ContextMenu;
  close(): void;
  destroy(): void;
}
```

### Example: one-off menu

```ts
openContextMenu({
  x: 120,
  y: 240,
  items: [
    { label: '打开', handler: () => {} },
    { type: 'separator' },
    { label: '删除', handler: () => {} },
  ],
  param: { id: 1 },
});
```

### Example: cached menu

```ts
const handle = openContextMenu({
  cacheKey: 'file-menu',
  x: 120,
  y: 240,
  items: [
    { label: '打开' },
    { label: '重命名' },
    { label: '删除' },
  ],
  param: { fileId: 'A-01' },
});

handle.close();   // close only, keep cache
handle.destroy(); // remove element and clear cache
```

## Design Decision

Use a top-level function API as the main solution for runtime-created menus, while continuing to implement rendering and behavior on top of the existing `ContextMenu` element.

This is preferred over continuing to overload instance `open()` because:

- the user specifically does not want to pre-author `<context-menu>`
- the mental model is “open a menu here right now,” not “find an existing component instance and open it”
- the existing component remains a strong internal primitive for rendering, positioning, keyboard interaction, close handling, and submenu behavior

This results in a layered model:

- declarative callers use `<context-menu>`
- instance-oriented callers use `menu.open(...)`
- runtime callers use `openContextMenu(...)`

## Core Architecture

### Internal layering

Recommended flow:

1. `openContextMenu(options)` receives coordinates, items, optional `param`, and optional `cacheKey`
2. the function resolves or creates a `ContextMenu` element
3. the function renders the requested `items` into that element
4. the element is attached to `document.body` if needed
5. the function opens the menu using the existing menu positioning/open logic
6. a handle is returned so the caller can close or destroy the runtime menu

### Why reuse `ContextMenu`

Reusing the existing element avoids duplicating:

- open and close behavior
- viewport-aware positioning
- overlay behavior
- keyboard support
- submenu rendering
- item event wiring

The function API should be a higher-level lifecycle wrapper, not a second independent menu implementation.

## Caching Model

### Chosen strategy

Use explicit cache keys:

```ts
Map<string, CachedRuntimeMenu>
```

where `CachedRuntimeMenu` conceptually contains:

```ts
interface CachedRuntimeMenu {
  element: ContextMenu;
}
```

### Why `cacheKey`

The user selected cache reuse by explicit key because it is:

- predictable
- caller-controlled
- easier to reason about than implicit structural matching
- simpler to maintain than automatic menu hashing or diff-based reuse

### Cache behavior

#### Without `cacheKey`

- create a fresh runtime `ContextMenu`
- render items
- open at `x/y`
- when closed, remove the element from DOM
- do not keep it in cache

This is the one-off runtime menu mode.

#### With `cacheKey`

- if the key is missing from the cache:
  - create a `ContextMenu`
  - store it in cache
- if the key already exists:
  - reuse the existing `ContextMenu`
  - do not recreate the host element

In both cases:

- re-render or refresh current menu content for this open call
- update current `param`
- open at the new `x/y`

### What is cached

Cache the **menu host instance**, not a guarantee that item content is permanently immutable.

That means reuse should avoid:

- repeated `document.createElement('context-menu')`
- repeated shadow-root/template setup
- repeated `document.body` attachment churn for cached menus

But the content may still be refreshed between openings when the caller provides different `items`.

## Refresh Strategy

### Recommended first version

For cached menus, reuse the host instance but rebuild runtime item children on each `openContextMenu()` call.

That means:

- cached: reuse `ContextMenu` element
- refreshed: clear previous runtime children inside that element
- rebuilt: render current `items` again for the new open

This is the recommended v1 because it gives the main caching benefit without introducing complex structural diffing.

### Why not cache item DOM forever

Always reusing the old child nodes without refresh would be fragile because:

- item labels can depend on current `param`
- enabled/disabled status may vary by context
- handlers may differ between calls
- child menu trees may change

So the stable reusable unit should be:

- the menu instance

not necessarily:

- the previous rendered item subtree

## Lifecycle Rules

### `close()`

`handle.close()` should:

- close the menu if it is open
- preserve the cached instance if `cacheKey` exists
- for non-cached menus, allow normal runtime cleanup to remove the one-off element

### `destroy()`

`handle.destroy()` should:

- close the menu if needed
- remove the element from the DOM
- remove the cache entry if the menu was cached

### Auto-cleanup

#### Non-cached menu

After a non-cached runtime menu closes, it should be removed from the DOM automatically.

#### Cached menu

After a cached runtime menu closes, it should remain eligible for reuse and should not be destroyed automatically.

The element may remain attached in a hidden state or be detached and retained by the cache, but the behavior must be consistent.

Recommendation for v1:

- keep cached menus attached to `document.body`
- hide them on close
- reuse them in place

This is simpler than repeatedly detaching and reattaching cached nodes.

## Event and Close Semantics

The runtime function must preserve the close behavior already implemented in `ContextMenu`, including:

- click outside
- escape
- scroll
- right click elsewhere
- menu select
- API close

For runtime-created menus, an additional lifecycle rule is needed:

- after a close event completes, the function-level lifecycle controller decides whether the instance should be destroyed or kept cached

This means the runtime wrapper needs a post-close hook or listener that distinguishes:

- one-off instance
- cached instance

## Rendering Strategy

### Runtime-generated children

Runtime menus should render their item children programmatically.

Because this mode does not start from authored markup, the runtime wrapper should:

- create or reuse a `ContextMenu`
- clear prior runtime-generated child items for that runtime menu
- render the new `items`

### Recommended helper boundaries

Add internal helpers such as:

- `createRuntimeContextMenu()`
- `getOrCreateCachedContextMenu(cacheKey)`
- `renderRuntimeItems(menu, items, param)`
- `cleanupRuntimeContextMenu(menu, mode)`

The naming can vary, but the responsibilities should stay separated:

- cache resolution
- rendering
- lifecycle cleanup
- handle creation

## Relationship To Existing Instance API

### Existing `menu.open(...)`

The existing instance API should remain supported.

However, it should no longer be treated as the primary answer to this requirement.

### Recommended coexistence

- `menu.open(...)` remains for callers with a real element instance
- `openContextMenu(...)` becomes the primary solution for “no `<context-menu>` tag needed”

This avoids conflating:

- instance control
- runtime factory behavior

## Public Types To Add

Recommended additions in `src/types.ts`:

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

The package entry should export:

- `openContextMenu`
- `OpenContextMenuOptions`
- `ContextMenuHandle`

## File Responsibilities

Recommended file responsibilities:

- `src/components/context-menu.ts`
  - keep component-level menu behavior
  - expose or support helper paths needed for runtime rendering

- `src/runtime/open-context-menu.ts`
  - top-level runtime function
  - cache management
  - lifecycle and cleanup behavior
  - returned handle implementation

- `src/types.ts`
  - function options and handle types

- `src/index.ts`
  - public export wiring

This keeps runtime factory logic separate from the core component class instead of growing `context-menu.ts` into a mixed-responsibility file.

## Testing Strategy

Add tests for:

1. public API export
   - `openContextMenu` is exported from package entry
   - `OpenContextMenuOptions` and `ContextMenuHandle` are exported

2. runtime creation
   - calling `openContextMenu` creates a runtime `context-menu`
   - no authored `<context-menu>` is required

3. one-off lifecycle
   - without `cacheKey`, close removes the runtime element

4. cached lifecycle
   - with `cacheKey`, repeated opens reuse the same element instance
   - close does not destroy the cached instance
   - destroy removes the cached instance

5. runtime content refresh
   - repeated opens with same `cacheKey` can refresh items and `param`

6. event behavior
   - handlers still receive the current `param`
   - submenu `children` still work

7. compatibility
   - existing declarative usage is unaffected
   - existing instance `open()` continues working

## Risks and Mitigations

### Risk: cache retains stale content

If cached menus permanently retain previous child nodes, content may drift from current call inputs.

Mitigation:

- cache the host instance
- refresh runtime children per open call

### Risk: memory leaks from cached menus

If cached instances are never destroyed, long-lived pages can accumulate hidden menus.

Mitigation:

- require explicit `destroy()`
- document that cached menus are caller-managed reusable resources

### Risk: runtime wrapper duplicates component logic

Mitigation:

- keep open/close/render primitives in or near the component layer
- let `openContextMenu()` orchestrate lifecycle, not reimplement menu behavior

### Risk: ambiguous close cleanup rules

Mitigation:

- define clear split:
  - non-cached: auto-destroy on close
  - cached: hide on close, destroy only on `destroy()`

## Final Recommendation

Implement the new requirement as:

- a top-level `openContextMenu(options)` function
- optional `cacheKey` for reusable runtime menu instances
- returned `ContextMenuHandle` with `close()` and `destroy()`
- internal reuse of the existing `ContextMenu` component

Keep existing declarative and instance APIs, but treat them as separate usage modes rather than the primary answer to this feature.

This gives the library three coherent layers:

- declarative component usage for authored menus
- instance API for callers who own a menu element
- function API for runtime-generated menus with optional caching
