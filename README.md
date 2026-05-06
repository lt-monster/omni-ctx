<p align="center">
  <img src="https://raw.githubusercontent.com/lt-monster/omni-ctx/master/assets/logo/omni-ctx-logo.svg" alt="OmniCtx logo" width="140" />
</p>

<h1 align="center">OmniCtx</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/omni-ctx">
    <img alt="npm version" src="https://img.shields.io/npm/v/omni-ctx" />
  </a>
  <a href="https://github.com/lt-monster/omni-ctx/blob/master/LICENSE">
    <img alt="license" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components">
    <img alt="runtime" src="https://img.shields.io/badge/runtime-Web%20Components-orange.svg" />
  </a>
</p>

<p align="center">
  <a href="./README.md">English</a> |
  <a href="./README_ZH.md">简体中文</a>
</p>

OmniCtx is a Web Components-based context menu library for building reusable right-click interactions in the browser. It supports both declarative markup and fully programmatic usage, making it suitable for fixed menus, runtime-generated menus, and cacheable menu instances.

Current stable release: `v1.1.0`

- Release notes: [`docs/releases/v1.1.0.md`](./docs/releases/v1.1.0.md)
- npm package: [`omni-ctx@1.1.0`](https://www.npmjs.com/package/omni-ctx)

## ✨ Features

- Supports both declarative usage and fully programmatic dynamic usage
- Supports runtime menu creation and menu instance reuse via `cacheKey`
- Supports theme customization and foundational styling capabilities
- Supports infinitely nested submenus
- Supports multiple menu item types, including regular items, separators, radio items, and toggle items

## 📦 Installation

Choose any one of the following package managers:

```bash
npm install omni-ctx
yarn add omni-ctx
pnpm add omni-ctx
```

If you are developing inside this repository, you can also use:

```bash
bun install
```

## 🚀 Usage

### 1. Declarative usage

This approach is a good fit when the menu structure is relatively stable and you want to maintain the menu content directly in your page template.

```html
<div id="target">Right-click here</div>

<context-menu id="menu">
  <context-menu-item label="Open" icon="📂"></context-menu-item>
  <context-menu-item label="Brand Asset" icon-size="18px">
    <svg slot="icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1.25 14 4.6v6.8L8 14.75 2 11.4V4.6L8 1.25Z" fill="currentColor" opacity="0.18" />
      <path d="M8 1.25 14 4.6v6.8L8 14.75 2 11.4V4.6L8 1.25Zm0 1.44L3.25 5.35v5.3L8 13.31l4.75-2.66v-5.3L8 2.69Z" fill="currentColor" />
      <path d="M8 4.9 10.8 6.5V9.7L8 11.3 5.2 9.7V6.5L8 4.9Z" fill="currentColor" />
    </svg>
  </context-menu-item>
  <context-menu-item label="Delete"></context-menu-item>
</context-menu>

<script type="module">
  import 'omni-ctx';

  const target = document.querySelector('#target');
  const menu = document.querySelector('#menu');

  target.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    menu.open(event);
  });
</script>
```

Notes:

- Built on native Custom Elements, with no dependency on any specific frontend framework
- Well suited for declaring and maintaining menu content directly in the page structure
- `icon` continues to support emoji and text icons, while `slot="icon"` can render custom SVG or other nodes
- `icon-size` lets you override the icon box size per item with any valid CSS size value

### 2. Dynamic usage

This approach is useful when you do not want to predefine a `<context-menu>` element and instead want to open a menu at runtime from coordinates and menu data.

#### ESM / module usage

```html
<script type="module">
  import { openContextMenu } from './dist/omni-ctx.min.js';

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    openContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: 'Open' },
        { label: 'Delete' },
      ],
    });
  });
</script>
```

#### Plain `script` usage

```html
<script src="./dist/omni-ctx.global.min.js"></script>
<script>
  document.addEventListener('contextmenu', function (event) {
    event.preventDefault();

    OmniCtx.openContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: 'Open' },
        { label: 'Delete' },
      ],
    });
  });
</script>
```

Notes:

- The module form can use the `omni-ctx` package name or the corresponding ESM build file
- The plain `script` form accesses the runtime API through the global `OmniCtx` object
- For production, prefer `dist/omni-ctx.min.js` or `dist/omni-ctx.global.min.js`
- For debugging, you can use the unminified `dist/omni-ctx.js` or `dist/omni-ctx.global.js`
- If you only use declarative tags, you can still operate menu instances from a plain `script` after loading the global build
- Without `cacheKey`, the menu is created as a one-off instance and removed after closing
- With `cacheKey`, the same runtime menu instance can be reused for high-frequency trigger scenarios

## 📚 More Docs

For more feature details, the complete API, theme configuration, and advanced usage, please refer to the project documentation:

<https://docs.omni-ctx.dev>
