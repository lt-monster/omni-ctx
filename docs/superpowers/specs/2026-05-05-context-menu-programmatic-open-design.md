# Context Menu Programmatic Open Design

## Background

The current `context-menu` component supports:

- declarative usage via nested Web Components in HTML
- imperative item creation through `addItem()`, `addSeparator()`, `removeItem()`, and `clearItems()`
- menu opening through `open(event, param?)` and `show(x, y, param?)`

What is still missing is a first-class programmatic opening flow where callers can open a menu directly from `open()` and provide the menu content in the same call.

The requested enhancement is:

- keep existing declarative usage unchanged
- support imperative usage without predeclaring menu items in markup
- allow menu data to come from either an array of menu items or a configuration object
- support direct opening through `open()`

The user clarified that the object form should be a configuration object, not a plain key-value map.

## Goals

- Preserve existing `open(event, param?)` behavior.
- Extend `open()` so it can accept programmatic menu content.
- Support both `MenuItemData[]` and a config object containing `items`.
- Keep declarative DOM content and programmatic content able to coexist.
- Reuse the existing `MenuItemData` structure rather than introducing a second menu schema.
- Make the behavior predictable across repeated `open()` calls.

## Non-Goals

- Do not support plain key-value object shortcuts such as `{ open: 'Open', save: 'Save' }`.
- Do not redesign `show()` into a second content-loading API.
- Do not replace or remove existing declarative slots and child composition.
- Do not introduce framework-specific wrappers.

## Recommended API

### `open()` overload shape

Keep the current call form and add two new accepted forms:

```ts
menu.open(eventOrPoint, param?)
menu.open(eventOrPoint, items)
menu.open(eventOrPoint, { items, param, replace })
```

Where:

```ts
type MenuOpenSource = MenuItemData[];

interface MenuOpenConfig {
  items: MenuItemData[];
  param?: MenuParam;
  replace?: boolean;
}
```

`eventOrPoint` remains:

```ts
MouseEvent | { x: number; y: number }
```

### Example usage

Use existing behavior:

```ts
menu.open(event, { fileId: '1' });
```

Open directly from an array:

```ts
menu.open(event, [
  { label: 'Open', handler: () => {} },
  { type: 'separator' },
  { label: 'Delete', handler: () => {} },
]);
```

Open from a config object:

```ts
menu.open({ x: 100, y: 160 }, {
  items: [
    { label: 'Copy' },
    { label: 'Paste' },
  ],
  param: { source: 'editor' },
  replace: true,
});
```

## Design Decision

Use `open()` as the single public entry point for declarative opening and programmatic opening.

This is preferred over adding `openWithItems()` or `setItems()` because:

- it matches the requested mental model: “open the menu and provide its data in one call”
- it avoids fragmenting the API surface into multiple opening methods
- it keeps the library intuitive for callers who want one imperative entry point

The trade-off is added complexity in argument normalization. That complexity should stay internal and not leak to the public API.

## Argument Normalization

Internally, `open()` should normalize its second argument into a single structure:

```ts
interface NormalizedOpenInput {
  param: MenuParam | null;
  items: MenuItemData[] | null;
  replace: boolean;
}
```

Normalization rules:

- if the second argument is omitted, treat it as `{ param: null, items: null, replace: true }`
- if the second argument is an array, treat it as `{ items: arg, param: null, replace: true }`
- if the second argument is a config object with `items`, extract `items`, optional `param`, and optional `replace`
- otherwise, treat the second argument as the legacy `param`

This preserves backward compatibility while allowing the new forms to coexist safely.

## Rendering Strategy

### Content categories

The menu content should be treated as two categories:

- declarative content: child nodes that were authored directly in markup
- programmatic content: child nodes created from `open(..., items)` or `open(..., { items })`

### Core rule

Programmatic rendering must only manage programmatic nodes. It must never remove user-authored declarative nodes unless a future explicit API says so.

This avoids surprising behavior such as:

- predeclared header/footer or static menu items disappearing
- reusable menus losing their static structure after one imperative open

### Proposed implementation

Add internal helpers:

- `_normalizeOpenInput(arg)`
- `_renderProgrammaticItems(items)`
- `_clearProgrammaticItems()`

Generated nodes should be marked with an internal attribute, for example:

```ts
data-programmatic="true"
```

This lets the component remove only nodes created by the programmatic open flow.

## `replace` Behavior

`replace` applies only to programmatic nodes.

Default behavior:

- `replace: true`

Meaning:

- before rendering new programmatic items, remove previous programmatic items
- keep declarative items untouched

Optional behavior:

- `replace: false`

Meaning:

- append new programmatic items after existing programmatic items
- still leave declarative items untouched

This provides flexibility for advanced composition without turning the first version into a full runtime menu builder.

## Interaction With Existing Methods

### `addItem()`

`addItem()` should remain public and continue to create a menu item from `MenuItemData`.

To support programmatic rendering cleanly, add a private internal path or option that allows created nodes to be marked as programmatic. Two acceptable implementation directions:

1. add a private helper such as `_createItemElement(data, options?)`
2. extend `addItem()` internally so the render path can tag created nodes before append

Recommendation:

- factor element creation into a private helper

This avoids duplicating logic for:

- label resolution
- option change wiring
- handler wiring
- submenu creation

### `clearItems()`

Current `clearItems()` removes all child nodes. That is acceptable for explicit manual cleanup because it is already a destructive API.

However, `open(..., items)` should not call `clearItems()` directly, because it would delete declarative content too.

Instead:

- retain `clearItems()` as-is for explicit full clearing
- add `_clearProgrammaticItems()` for the new `open()` flow

### `show()`

`show(x, y, param?)` should stay focused on coordinates and visibility. No new content-loading behavior should be added there in this iteration.

This keeps `show()` as a lower-level primitive and `open()` as the ergonomic public entry.

## Types To Update

Update `src/types.ts` to express the new input shapes.

Recommended additions:

```ts
export interface MenuOpenConfig {
  items: MenuItemData[];
  param?: MenuParam;
  replace?: boolean;
}

export type MenuOpenInput = MenuParam | MenuItemData[] | MenuOpenConfig;
```

Then update the `ContextMenuElement` interface:

```ts
open(event: MouseEvent | { x: number; y: number }, input?: MenuOpenInput): void;
```

Implementation detail:

The runtime will still need a robust type guard because `MenuParam` is an open object shape and may overlap structurally with config objects.

The safest discriminator is:

- config object if it is a non-array object and has an `items` property
- array if `Array.isArray(arg)` is true
- otherwise legacy `param`

## Data Compatibility

The new flow should reuse existing `MenuItemData` without introducing a second tree model.

That means programmatic open must support all currently supported fields that `addItem()` already knows how to render, including:

- `label`
- `icon`
- `shortcut`
- `disabled`
- `checked`
- `name`
- `value`
- `type`
- `children`
- `handler`
- `onChange`

Submenus should continue to work through nested `children`.

## Event and State Behavior

When opening from programmatic input:

- `menuParam` should reflect `config.param` when provided
- when opening from an array without config, `menuParam` should be `null`
- item handlers should continue receiving `menuParam`
- `isOpen` semantics do not change
- close behavior does not change

Repeated opens should behave as follows:

- opening with no items after a programmatic open should not automatically delete prior programmatic items unless the caller explicitly changed content or cleared it
- opening with new `items` and default `replace: true` replaces the prior programmatic nodes

This creates stable, unsurprising behavior.

## Test Plan

Add tests that verify:

1. legacy compatibility
   - `open(event, param)` still works
   - type definitions still allow old usage

2. programmatic array input
   - `open(event, itemsArray)` renders items
   - handlers and submenu children still wire correctly

3. programmatic config input
   - `open(event, { items, param })` renders items
   - `menuParam` is set from config

4. replacement rules
   - consecutive `open(..., { items })` calls replace old programmatic items by default
   - `replace: false` appends instead of replacing

5. coexistence with declarative content
   - predeclared child nodes remain after programmatic open
   - only programmatic nodes are cleaned by the internal programmatic clear path

6. destructive explicit clear behavior
   - `clearItems()` still removes all child nodes, including declarative ones, because that is its existing explicit behavior

## Files Expected To Change

- `src/types.ts`
  - add `MenuOpenConfig`
  - add `MenuOpenInput`
  - update `ContextMenuElement.open()` signature

- `src/components/context-menu.ts`
  - add argument normalization for `open()`
  - add internal programmatic render and cleanup helpers
  - mark generated nodes as programmatic
  - reuse existing item creation logic

- `README.md`
  - document direct `open()` programmatic usage
  - document array form and config object form
  - clarify that simple key-value objects are not supported

- `tests/integration.test.ts`
  - add coverage for the new input forms and coexistence behavior

## Risks and Mitigations

### Risk: `MenuParam` and config object overlap

Because `MenuParam` is an open object, a config object is structurally compatible with it.

Mitigation:

- treat any non-array object with `items` as config
- treat everything else as legacy `param`

### Risk: programmatic open deletes user-authored content

Mitigation:

- never call `clearItems()` from the programmatic open path
- only remove nodes marked as programmatic

### Risk: duplicated rendering logic

Mitigation:

- factor creation logic into one private helper used by both `addItem()` and programmatic rendering

## Final Recommendation

Implement support for:

- `open(eventOrPoint, MenuItemData[])`
- `open(eventOrPoint, { items, param, replace? })`

Keep:

- declarative HTML composition
- existing `open(event, param?)`
- existing `show(x, y, param?)`

Do not support in this iteration:

- plain key-value menu objects
- content loading through `show()`

This gives the library a coherent combined model:

- declarative when the menu is static
- programmatic when the menu is dynamic
- one `open()` entry point for both
