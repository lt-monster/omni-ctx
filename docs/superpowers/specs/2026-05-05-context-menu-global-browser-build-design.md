# Context Menu Global Browser Build Design

## Background

The project currently ships an ESM browser bundle:

- `dist/omni-ctx.js`

and exposes its APIs through standard ES module exports such as:

- `ContextMenu`
- `openContextMenu`
- `calculateMenuPosition`
- `handleMenuKeyboard`
- `getThemeVariables`
- `applyTheme`

This works well in:

- `type="module"` scripts
- bundler-based applications

But it does not directly support the common browser usage pattern:

```html
<script src="./dist/omni-ctx.global.js"></script>
<script>
  OmniCtx.openContextMenu(...)
</script>
```

The user wants the project to support:

- direct browser `<script>` usage without writing code inside a module script block
- direct access from normal `script` tags
- continued support for the current ESM workflow

## Goals

- Preserve the existing ESM bundle and ESM usage.
- Add a browser global bundle for plain `script` usage.
- Expose a global namespace such as `window.OmniCtx`.
- Make `openContextMenu()` usable from normal `script` tags.
- Keep declarative custom-element usage working after the global script is loaded.
- Ensure the public type declarations stay aligned with current source exports.

## Non-Goals

- Do not remove the current ESM output.
- Do not replace the existing package entry with a global-only distribution.
- Do not introduce framework wrappers.
- Do not attempt UMD/CommonJS compatibility in this iteration unless the build tool naturally makes it trivial.

## Recommended Public Distribution Model

Ship two browser-facing JavaScript outputs:

### 1. ESM bundle

Keep:

- `dist/omni-ctx.js`

Usage:

```html
<script type="module">
  import { openContextMenu } from './dist/omni-ctx.js';
  openContextMenu(...);
</script>
```

### 2. Global browser bundle

Add:

- `dist/omni-ctx.global.js`

Usage:

```html
<script src="./dist/omni-ctx.global.js"></script>
<script>
  OmniCtx.openContextMenu({
    x: 100,
    y: 200,
    items: [
      { label: '打开' },
      { label: '删除' },
    ],
  });
</script>
```

This gives the project two clear usage modes:

- modern module usage
- plain browser script usage

## Design Decision

Use a dedicated browser global build rather than forcing callers to load a module bridge and then interact from normal scripts.

This is preferred because:

- it matches browser users’ expectations
- it makes the project easier to use from static HTML pages
- it keeps the README and examples straightforward
- it avoids a confusing half-step where users still need a `type="module"` bootstrap just to expose globals

## Global Namespace

### Recommended name

Expose:

```ts
window.OmniCtx
```

This matches the project display name while remaining conventional for browser globals.

### Recommended global surface

Expose only the APIs that are useful in plain browser scenarios:

```ts
window.OmniCtx = {
  openContextMenu,
  calculateMenuPosition,
  handleMenuKeyboard,
  getThemeVariables,
  applyTheme,
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuOptionItem,
  ContextMenuToggleItem,
};
```

This allows:

- direct function usage
- optional access to classes for advanced consumers
- already-registered custom elements to be used in HTML

### What not to expose

Do not attempt to expose TypeScript-only types at runtime. Types remain in `dist/index.d.ts`, not on `window`.

## Build Strategy

### Current state

The current build script uses:

- Bun build
- one ESM output
- a manually written `dist/index.d.ts`

### Recommended build evolution

The build should produce:

- `dist/omni-ctx.js` for ESM
- `dist/omni-ctx.global.js` for browser globals
- `dist/index.d.ts` for type declarations

### Recommended implementation approach

There are two viable ways to generate the global bundle:

#### Option A: dedicated global entry file

Create a new entry such as:

- `src/global.ts`

that:

1. imports everything needed from `src/index.ts`
2. assigns the chosen runtime exports to `window.OmniCtx`
3. relies on imported modules to register custom elements as they already do today

This is the recommended approach because it is explicit and easy to test.

#### Option B: post-build wrapper

Generate the ESM bundle and then wrap selected runtime exports manually into a global script.

This is not recommended because:

- it is more fragile
- it obscures what the global build actually contains
- it is harder to maintain as public exports evolve

### Recommendation

Use:

- `src/index.ts` as the ESM entry
- `src/global.ts` as the global browser entry

## Global Entry Structure

Recommended structure for `src/global.ts`:

```ts
import {
  openContextMenu,
  calculateMenuPosition,
  handleMenuKeyboard,
  getThemeVariables,
  applyTheme,
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuOptionItem,
  ContextMenuToggleItem,
} from './index';

const OmniCtx = {
  openContextMenu,
  calculateMenuPosition,
  handleMenuKeyboard,
  getThemeVariables,
  applyTheme,
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuOptionItem,
  ContextMenuToggleItem,
};

declare global {
  interface Window {
    OmniCtx: typeof OmniCtx;
  }
}

window.OmniCtx = OmniCtx;
```

Notes:

- element registration still happens through imported component modules
- this entry is only for runtime global exposure
- it should not become the package’s primary module entry

## Type Declaration Strategy

### Current issue

The project currently writes `dist/index.d.ts` manually inside the build script. This file has already drifted from the real source at least once:

- `openContextMenu`
- `OpenContextMenuOptions`
- `ContextMenuHandle`
- updated `open()` signature

are exactly the kinds of additions that can go out of sync when declarations are handwritten.

### Recommendation

At minimum, the manual declaration block must be updated so it always reflects current public source.

Better long-term options:

1. keep manual `d.ts` output, but centralize it and verify it against current exports
2. adopt an automated declaration generation path later

### v1 recommendation

For this change set:

- update the manual `dist/index.d.ts` template to include all current exports
- make sure it covers:
  - `openContextMenu`
  - `OpenContextMenuOptions`
  - `ContextMenuHandle`
  - `MenuOpenConfig`
  - `MenuOpenInput`
  - current `ContextMenuElement.open()` signature

This keeps scope controlled while eliminating the current mismatch.

## README and Usage Documentation

The README should document both browser usage modes clearly.

### ESM example

```html
<script type="module">
  import { openContextMenu } from './dist/omni-ctx.js';

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    openContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: '打开' },
        { label: '删除' },
      ],
    });
  });
</script>
```

### Global script example

```html
<script src="./dist/omni-ctx.global.js"></script>
<script>
  document.addEventListener('contextmenu', function (event) {
    event.preventDefault();

    OmniCtx.openContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: '打开' },
        { label: '删除' },
      ],
    });
  });
</script>
```

The README should also clarify:

- use `OmniCtx` for browser global access
- use `omni-ctx` for package install/import naming

## Testing Strategy

Add tests for:

1. global entry existence
   - `src/global.ts` exists

2. global exposure source structure
   - the file assigns to `window.OmniCtx`
   - it includes `openContextMenu`
   - it includes core runtime exports

3. build output expectations
   - build script emits both:
     - `dist/omni-ctx.js`
     - `dist/omni-ctx.global.js`

4. type declaration synchronization
   - build script declaration template includes:
     - `openContextMenu`
     - `OpenContextMenuOptions`
     - `ContextMenuHandle`
     - updated `open()` input signature

5. compatibility
   - existing ESM usage remains documented and supported

## File Responsibilities

Recommended file structure:

- `src/index.ts`
  - canonical public ESM export surface

- `src/global.ts`
  - browser-global entry that assigns exports to `window.OmniCtx`

- `scripts/build.ts`
  - produces both JS outputs
  - writes synchronized type declarations

- `README.md`
  - documents both ESM and normal script usage

- `tests/*`
  - verify global entry and build expectations

## Risks and Mitigations

### Risk: global bundle diverges from ESM exports

Mitigation:

- make `src/global.ts` import from `src/index.ts`
- avoid duplicating export lists by hand in multiple places when possible

### Risk: type declarations keep drifting from runtime

Mitigation:

- update the declaration template immediately as part of this change
- add tests that assert presence of the newly exported types and signatures

### Risk: users misunderstand which file to load

Mitigation:

- document the distinction clearly:
  - `dist/omni-ctx.js` for modules
  - `dist/omni-ctx.global.js` for normal scripts

### Risk: exposing too much on `window`

Mitigation:

- expose a single namespace `window.OmniCtx`
- keep the surface intentional and documented

## Final Recommendation

Implement plain browser `script` support by adding:

- a dedicated global entry file
- a new `dist/omni-ctx.global.js` output
- a single runtime namespace: `window.OmniCtx`
- synchronized type declaration updates
- README examples for both ESM and normal script usage

This preserves the current module-first architecture while adding the browser global experience users expect from a script-tag-friendly library.
