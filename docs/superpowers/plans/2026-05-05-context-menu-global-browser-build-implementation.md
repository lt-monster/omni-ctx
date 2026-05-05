# Context Menu Global Browser Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browser global build so the library supports both ESM usage and plain `script` usage through `window.OmniCtx`, while keeping type declarations and README examples synchronized with the actual runtime API.

**Architecture:** Keep `src/index.ts` as the canonical ESM entry and add `src/global.ts` as a dedicated browser-global entry that imports from `src/index.ts` and assigns a curated runtime surface to `window.OmniCtx`. Update the build script to emit both `dist/omni-ctx.js` and `dist/omni-ctx.global.js`, and bring the handwritten `dist/index.d.ts` template back in sync with the current exported APIs.

**Tech Stack:** TypeScript, Bun build, Web Components, Bun test runner

---

## File Map

- Create: `src/global.ts` — browser global entry that assigns selected runtime exports to `window.OmniCtx`
- Modify: `scripts/build.ts` — emit both ESM and global outputs, update handwritten declaration content
- Modify: `README.md` — document both module usage and plain `script` usage
- Modify: `tests/integration.test.ts` — add export/build declaration assertions tied to the new public surface
- Create: `tests/global-build.test.ts` — verify global entry source and build-script output expectations

---

### Task 1: Add Failing Tests For Global Entry And Build Outputs

**Files:**
- Modify: `tests/integration.test.ts`
- Create: `tests/global-build.test.ts`

- [ ] **Step 1: Add failing assertions for declaration synchronization**

Append this block to `tests/integration.test.ts`:

```ts
describe('Build declaration sync', () => {
  it('build script declaration template includes runtime function API and updated open signature', () => {
    const src = require('node:fs').readFileSync(
      new URL('../scripts/build.ts', import.meta.url),
      'utf8'
    );

    expect(src).toContain('export interface OpenContextMenuOptions');
    expect(src).toContain('export interface ContextMenuHandle');
    expect(src).toContain('export interface MenuOpenConfig');
    expect(src).toContain('export type MenuOpenInput');
    expect(src).toContain('open(event: MouseEvent | { x: number; y: number }, input?: MenuOpenInput): void;');
    expect(src).toContain('export declare function openContextMenu(');
  });
});
```

- [ ] **Step 2: Create a focused failing test file for the global entry and build outputs**

Create `tests/global-build.test.ts` with:

```ts
import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const globalEntryPath = new URL('../src/global.ts', import.meta.url);
const buildScriptPath = new URL('../scripts/build.ts', import.meta.url);

describe('global browser build source', () => {
  it('creates a dedicated global entry file', () => {
    expect(existsSync(globalEntryPath)).toBe(true);
  });

  it('assigns exported APIs to window.OmniCtx', () => {
    const source = readFileSync(globalEntryPath, 'utf8');
    expect(source).toContain('window.OmniCtx = OmniCtx');
    expect(source).toContain('openContextMenu');
    expect(source).toContain('ContextMenu');
    expect(source).toContain('ContextMenuItem');
  });

  it('build script emits both esm and global browser outputs', () => {
    const source = readFileSync(buildScriptPath, 'utf8');
    expect(source).toContain("resolve(distDir, 'omni-ctx.js')");
    expect(source).toContain("resolve(distDir, 'omni-ctx.global.js')");
    expect(source).toContain("entrypoints: [resolve(root, 'src/index.ts')]");
    expect(source).toContain("entrypoints: [resolve(root, 'src/global.ts')]");
  });
});
```

- [ ] **Step 3: Run the targeted tests to verify they fail**

Run:

```bash
bun test tests/integration.test.ts tests/global-build.test.ts
```

Expected: FAIL because:

- `src/global.ts` does not exist
- `scripts/build.ts` does not emit `dist/omni-ctx.global.js`
- the handwritten declaration template does not yet include the new runtime exports and updated `open()` signature

- [ ] **Step 4: Commit the failing tests**

```bash
git add tests/integration.test.ts tests/global-build.test.ts
git commit -m "test: cover global browser build entry"
```

---

### Task 2: Add The Global Browser Entry

**Files:**
- Create: `src/global.ts`
- Test: `tests/global-build.test.ts`

- [ ] **Step 1: Create the global entry file**

Create `src/global.ts` with:

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

- [ ] **Step 2: Run the targeted tests**

Run:

```bash
bun test tests/global-build.test.ts
```

Expected: still FAIL, but now only on the build-script assertions, because the global entry file exists and assigns `window.OmniCtx`.

- [ ] **Step 3: Commit the global entry**

```bash
git add src/global.ts tests/global-build.test.ts
git commit -m "feat: add browser global entry"
```

---

### Task 3: Update The Build Script For Dual Outputs And Declaration Sync

**Files:**
- Modify: `scripts/build.ts`
- Test: `tests/integration.test.ts`
- Test: `tests/global-build.test.ts`

- [ ] **Step 1: Split the build into two Bun builds**

Replace the single `Bun.build(...)` call in `scripts/build.ts` with two named build calls:

```ts
const esmResult = await Bun.build({
  entrypoints: [resolve(root, 'src/index.ts')],
  target: 'browser',
  format: 'esm',
  minify: true,
});

const globalResult = await Bun.build({
  entrypoints: [resolve(root, 'src/global.ts')],
  target: 'browser',
  format: 'iife',
  minify: true,
  naming: 'omni-ctx.global.js',
});
```

Then validate both:

```ts
if (!esmResult.success) {
  for (const log of esmResult.logs) console.error(log);
  process.exit(1);
}

if (!globalResult.success) {
  for (const log of globalResult.logs) console.error(log);
  process.exit(1);
}
```

- [ ] **Step 2: Write both JS outputs to disk**

Replace the old single-output logic with:

```ts
const esmOutput = esmResult.outputs[0];
const globalOutput = globalResult.outputs[0];

if (!esmOutput || !globalOutput) {
  console.error('Build succeeded without emitting all expected output files.');
  process.exit(1);
}

await writeFile(resolve(distDir, 'omni-ctx.js'), await esmOutput.text());
await writeFile(resolve(distDir, 'omni-ctx.global.js'), await globalOutput.text());
```

- [ ] **Step 3: Update the handwritten declaration template**

In the large `writeFile(resolve(distDir, 'index.d.ts'), \`...\`)` block, add and update these sections:

1. After `MenuItemData`, insert:

```ts
export interface MenuOpenConfig {
  items: MenuItemData[];
  param?: MenuParam;
  replace?: boolean;
}

export type MenuOpenInput = MenuParam | MenuItemData[] | MenuOpenConfig;

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

2. Change the `ContextMenuElement.open()` line from:

```ts
  open(event: MouseEvent | { x: number; y: number }, param?: MenuParam): void;
```

to:

```ts
  open(event: MouseEvent | { x: number; y: number }, input?: MenuOpenInput): void;
```

3. Change the `ContextMenu` class declaration line from:

```ts
  open(event: MouseEvent | { x: number; y: number }, param?: MenuParam): void;
```

to:

```ts
  open(event: MouseEvent | { x: number; y: number }, input?: MenuOpenInput): void;
```

4. Before `calculateMenuPosition`, add:

```ts
export declare function openContextMenu(options: OpenContextMenuOptions): ContextMenuHandle;
```

- [ ] **Step 4: Update the completion log**

Replace:

```ts
console.log('Built dist/omni-ctx.js with minification enabled.');
```

with:

```ts
console.log('Built dist/omni-ctx.js and dist/omni-ctx.global.js with minification enabled.');
```

- [ ] **Step 5: Run the targeted tests to verify they pass**

Run:

```bash
bun test tests/integration.test.ts tests/global-build.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run the build**

Run:

```bash
bun run build
```

Expected: both `dist/omni-ctx.js` and `dist/omni-ctx.global.js` are generated successfully.

- [ ] **Step 7: Commit the build updates**

```bash
git add scripts/build.ts tests/integration.test.ts tests/global-build.test.ts dist/omni-ctx.js dist/omni-ctx.global.js dist/index.d.ts
git commit -m "build: add global browser bundle"
```

---

### Task 4: Update README For ESM And Plain Script Usage

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the “动态使用” section to show both usage modes**

In `README.md`, replace the current dynamic usage block with two short subsections:

```md
#### ESM / 模块方式
```

followed by:

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

Then add:

```md
#### 普通 `script` 方式
```

followed by:

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

- [ ] **Step 2: Add a short note clarifying naming**

Under the dynamic usage section, add:

```md
补充说明：

- 模块方式使用包名 `omni-ctx` 或对应的 ESM 构建文件
- 普通 `script` 方式通过全局对象 `OmniCtx` 访问运行时 API
- 如果只使用声明式标签，加载全局构建后也可以在普通 `script` 中直接操作菜单实例
```

- [ ] **Step 3: Run a regression check after the README update**

Run:

```bash
bun test tests/integration.test.ts tests/global-build.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit the documentation update**

```bash
git add README.md
git commit -m "docs: add plain script usage guide"
```

---

### Task 5: Final Verification

**Files:**
- Verify: `src/global.ts`
- Verify: `scripts/build.ts`
- Verify: `README.md`
- Verify: `tests/integration.test.ts`
- Verify: `tests/global-build.test.ts`

- [ ] **Step 1: Run the full test suite**

```bash
bun test
```

Expected: all tests pass.

- [ ] **Step 2: Run the build**

```bash
bun run build
```

Expected: build completes successfully and emits:

- `dist/omni-ctx.js`
- `dist/omni-ctx.global.js`
- `dist/index.d.ts`

- [ ] **Step 3: Inspect the final diff scope**

```bash
git diff -- src/global.ts scripts/build.ts README.md tests/integration.test.ts tests/global-build.test.ts dist/index.d.ts dist/omni-ctx.js dist/omni-ctx.global.js
```

Expected: diff contains only the global browser build support, synchronized declaration updates, matching tests, and README documentation.

- [ ] **Step 4: Commit the final verified state**

```bash
git add src/global.ts scripts/build.ts README.md tests/integration.test.ts tests/global-build.test.ts dist/index.d.ts dist/omni-ctx.js dist/omni-ctx.global.js
git commit -m "feat: support plain script browser usage"
```
