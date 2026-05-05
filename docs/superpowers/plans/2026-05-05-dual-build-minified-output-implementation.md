# Dual Build Minified Output Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce both unminified and minified ESM/global browser bundles, point the default package entry to the minified ESM output, and document the new production versus debug file choices clearly.

**Architecture:** Expand the current two-build Bun pipeline into four explicit build jobs: unminified and minified variants for both ESM and browser-global entrypoints. Keep declaration generation unchanged, switch package metadata to the minified ESM artifact, and update README and tests so the new output contract is explicit and verifiable.

**Tech Stack:** TypeScript, Bun build, Markdown, npm package metadata, Bun test runner

---

## File Map

- Modify: `scripts/build.ts` — emit four JS artifacts instead of two
- Modify: `package.json` — point default entry to `dist/omni-ctx.min.js`
- Modify: `README.md` — document production and debug build file names
- Modify: `tests/global-build.test.ts` — assert four output files and both minified/unminified build jobs
- Create: `tests/package-exports.test.ts` — verify package entrypoints target the minified ESM build

---

### Task 1: Add Failing Tests For Four Output Files And Package Entrypoints

**Files:**
- Modify: `tests/global-build.test.ts`
- Create: `tests/package-exports.test.ts`

- [ ] **Step 1: Expand the build-script assertions**

In `tests/global-build.test.ts`, replace the build output assertions:

```ts
expect(source).toContain("resolve(distDir, 'omni-ctx.js')");
expect(source).toContain("resolve(distDir, 'omni-ctx.global.js')");
expect(source).toContain("entrypoints: [resolve(root, 'src/index.ts')]");
expect(source).toContain("entrypoints: [resolve(root, 'src/global.ts')]");
```

with:

```ts
expect(source).toContain("resolve(distDir, 'omni-ctx.js')");
expect(source).toContain("resolve(distDir, 'omni-ctx.min.js')");
expect(source).toContain("resolve(distDir, 'omni-ctx.global.js')");
expect(source).toContain("resolve(distDir, 'omni-ctx.global.min.js')");
expect(source).toContain("entrypoints: [resolve(root, 'src/index.ts')]");
expect(source).toContain("entrypoints: [resolve(root, 'src/global.ts')]");
expect(source).toContain('minify: false');
expect(source).toContain('minify: true');
```

- [ ] **Step 2: Create a new package metadata test**

Create `tests/package-exports.test.ts` with:

```ts
import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

const packageJsonPath = new URL('../package.json', import.meta.url);
const readmePath = new URL('../README.md', import.meta.url);

describe('package entrypoints for dual builds', () => {
  it('points the default package entry to the minified ESM build', () => {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    expect(pkg.main).toBe('./dist/omni-ctx.min.js');
    expect(pkg.exports['.'].import).toBe('./dist/omni-ctx.min.js');
    expect(pkg.types).toBe('./dist/index.d.ts');
  });

  it('documents both production and debug browser files in the readme', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('dist/omni-ctx.global.min.js');
    expect(readme).toContain('dist/omni-ctx.global.js');
    expect(readme).toContain('dist/omni-ctx.min.js');
    expect(readme).toContain('dist/omni-ctx.js');
  });
});
```

- [ ] **Step 3: Run targeted tests to verify they fail**

Run:

```bash
bun test tests/global-build.test.ts tests/package-exports.test.ts
```

Expected: FAIL because:

- `scripts/build.ts` only emits two outputs
- `package.json` still points to `dist/omni-ctx.js`
- `README.md` does not yet explain `.min.js` versus debug files

- [ ] **Step 4: Commit the failing tests**

```bash
git add tests/global-build.test.ts tests/package-exports.test.ts
git commit -m "🧪 test: cover dual build minified outputs"
```

---

### Task 2: Expand The Build Script To Emit Four Artifacts

**Files:**
- Modify: `scripts/build.ts`
- Test: `tests/global-build.test.ts`

- [ ] **Step 1: Replace the current two-build setup with four build jobs**

In `scripts/build.ts`, replace the current `esmResult` / `globalResult` section with:

```ts
const esmDebugResult = await Bun.build({
  entrypoints: [resolve(root, 'src/index.ts')],
  target: 'browser',
  format: 'esm',
  minify: false,
});

const esmMinResult = await Bun.build({
  entrypoints: [resolve(root, 'src/index.ts')],
  target: 'browser',
  format: 'esm',
  minify: true,
});

const globalDebugResult = await Bun.build({
  entrypoints: [resolve(root, 'src/global.ts')],
  target: 'browser',
  format: 'iife',
  minify: false,
});

const globalMinResult = await Bun.build({
  entrypoints: [resolve(root, 'src/global.ts')],
  target: 'browser',
  format: 'iife',
  minify: true,
});
```

- [ ] **Step 2: Validate all four build results**

Replace the old success checks with:

```ts
for (const result of [esmDebugResult, esmMinResult, globalDebugResult, globalMinResult]) {
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    process.exit(1);
  }
}
```

- [ ] **Step 3: Write all four outputs to `dist/`**

Replace the old two-output write block with:

```ts
const esmDebugOutput = esmDebugResult.outputs[0];
const esmMinOutput = esmMinResult.outputs[0];
const globalDebugOutput = globalDebugResult.outputs[0];
const globalMinOutput = globalMinResult.outputs[0];

if (!esmDebugOutput || !esmMinOutput || !globalDebugOutput || !globalMinOutput) {
  console.error('Build succeeded without emitting all expected output files.');
  process.exit(1);
}

await writeFile(resolve(distDir, 'omni-ctx.js'), await esmDebugOutput.text());
await writeFile(resolve(distDir, 'omni-ctx.min.js'), await esmMinOutput.text());
await writeFile(resolve(distDir, 'omni-ctx.global.js'), await globalDebugOutput.text());
await writeFile(resolve(distDir, 'omni-ctx.global.min.js'), await globalMinOutput.text());
```

- [ ] **Step 4: Update the build completion log**

Replace:

```ts
console.log('Built dist/omni-ctx.js and dist/omni-ctx.global.js with minification enabled.');
```

with:

```ts
console.log('Built dist/omni-ctx.js, dist/omni-ctx.min.js, dist/omni-ctx.global.js, and dist/omni-ctx.global.min.js.');
```

- [ ] **Step 5: Run the targeted build-script test**

Run:

```bash
bun test tests/global-build.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run the build and inspect generated artifacts**

Run:

```bash
bun run build
```

Expected:

- `dist/omni-ctx.js`
- `dist/omni-ctx.min.js`
- `dist/omni-ctx.global.js`
- `dist/omni-ctx.global.min.js`

are all generated successfully.

- [ ] **Step 7: Commit the build-script changes**

```bash
git add scripts/build.ts dist/omni-ctx.js dist/omni-ctx.min.js dist/omni-ctx.global.js dist/omni-ctx.global.min.js tests/global-build.test.ts
git commit -m "📦 build: emit debug and minified bundles"
```

---

### Task 3: Point Package Metadata To The Minified ESM Entry

**Files:**
- Modify: `package.json`
- Test: `tests/package-exports.test.ts`

- [ ] **Step 1: Update the package entrypoints**

In `package.json`, change:

```json
"main": "./dist/omni-ctx.js"
```

to:

```json
"main": "./dist/omni-ctx.min.js"
```

And change:

```json
"import": "./dist/omni-ctx.js"
```

to:

```json
"import": "./dist/omni-ctx.min.js"
```

- [ ] **Step 2: Run the package metadata test**

Run:

```bash
bun test tests/package-exports.test.ts
```

Expected: still FAIL, but now only on README assertions because package metadata points to the minified ESM build.

- [ ] **Step 3: Commit the package entry update**

```bash
git add package.json tests/package-exports.test.ts
git commit -m "📦 build: point package entry to minified esm"
```

---

### Task 4: Update README For Production And Debug File Choices

**Files:**
- Modify: `README.md`
- Test: `tests/package-exports.test.ts`

- [ ] **Step 1: Update the ESM example to use the production file name**

In `README.md`, change:

```html
import { openContextMenu } from './dist/omni-ctx.js';
```

to:

```html
import { openContextMenu } from './dist/omni-ctx.min.js';
```

- [ ] **Step 2: Update the plain script example to use the production global file**

Change:

```html
<script src="./dist/omni-ctx.global.js"></script>
```

to:

```html
<script src="./dist/omni-ctx.global.min.js"></script>
```

- [ ] **Step 3: Add a short production versus debug note**

Under the existing dynamic usage notes, add:

```md
- 生产环境推荐使用 `dist/omni-ctx.min.js` 或 `dist/omni-ctx.global.min.js`
- 调试时可使用未压缩的 `dist/omni-ctx.js` 或 `dist/omni-ctx.global.js`
```

- [ ] **Step 4: Run the package/readme test**

Run:

```bash
bun test tests/package-exports.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the README update**

```bash
git add README.md
git commit -m "📝 docs: document minified and debug bundles"
```

---

### Task 5: Final Verification

**Files:**
- Verify: `scripts/build.ts`
- Verify: `package.json`
- Verify: `README.md`
- Verify: `tests/global-build.test.ts`
- Verify: `tests/package-exports.test.ts`

- [ ] **Step 1: Run the full test suite**

```bash
bun test
```

Expected: all tests pass.

- [ ] **Step 2: Run the build**

```bash
bun run build
```

Expected: all four JS files are regenerated successfully.

- [ ] **Step 3: Run npm pack dry-run**

```bash
npm pack --dry-run
```

Expected:

- tarball contains:
  - `dist/omni-ctx.js`
  - `dist/omni-ctx.min.js`
  - `dist/omni-ctx.global.js`
  - `dist/omni-ctx.global.min.js`
- package metadata points to `1.0.1` unless version bump is separately requested later

- [ ] **Step 4: Inspect final diff scope**

```bash
git diff -- scripts/build.ts package.json README.md tests/global-build.test.ts tests/package-exports.test.ts dist/omni-ctx.js dist/omni-ctx.min.js dist/omni-ctx.global.js dist/omni-ctx.global.min.js
```

Expected: diff contains only the dual-output build implementation, package entry changes, README updates, and related tests.

- [ ] **Step 5: Commit the final verified state**

```bash
git add scripts/build.ts package.json README.md tests/global-build.test.ts tests/package-exports.test.ts dist/omni-ctx.js dist/omni-ctx.min.js dist/omni-ctx.global.js dist/omni-ctx.global.min.js
git commit -m "✨ feat: add debug and minified build outputs"
```
