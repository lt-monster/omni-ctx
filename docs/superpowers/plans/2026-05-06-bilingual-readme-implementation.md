# Bilingual README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the repository README into an English-first GitHub landing page with a mirrored Chinese README and a visible language switch below the badge row in both files.

**Architecture:** Keep the existing hero layout intact while splitting the current single-language README into two mirrored root files: `README.md` for English and `README_ZH.md` for Chinese. Add README-focused tests that verify the bilingual switch, shared hero structure, and English-first content intent so future README edits do not silently regress the language model.

**Tech Stack:** Markdown, HTML-in-Markdown, Bun test runner, Node `fs`

---

## File Map

- Modify: `README.md` — convert current Chinese README into the English primary README
- Create: `README_ZH.md` — preserve the Chinese README as a first-class mirrored document
- Modify: `tests/readme-hero.test.ts` — validate hero and badge structure across both README files
- Modify: `tests/readme-url-fix.test.ts` — validate language switch and absolute asset links across both README files
- Create: `tests/readme-language.test.ts` — validate English-first intro and bidirectional language switch links

---

### Task 1: Add Failing Tests For Bilingual README Structure

**Files:**
- Modify: `tests/readme-hero.test.ts`
- Modify: `tests/readme-url-fix.test.ts`
- Create: `tests/readme-language.test.ts`

- [ ] **Step 1: Expand hero tests to include both README files**

In `tests/readme-hero.test.ts`, replace the single-README setup:

```ts
const readmePath = new URL('../README.md', import.meta.url);
```

with:

```ts
const readmeEnPath = new URL('../README.md', import.meta.url);
const readmeZhPath = new URL('../README_ZH.md', import.meta.url);
```

Then replace the hero assertions that only read one file with assertions that read both files:

```ts
const readmeEn = readFileSync(readmeEnPath, 'utf8');
const readmeZh = readFileSync(readmeZhPath, 'utf8');

expect(readmeEn).toContain('<h1 align="center">OmniCtx</h1>');
expect(readmeZh).toContain('<h1 align="center">OmniCtx</h1>');
expect(readmeEn).toContain('img.shields.io/npm/v/omni-ctx');
expect(readmeZh).toContain('img.shields.io/npm/v/omni-ctx');
```

- [ ] **Step 2: Expand README asset-link tests to cover the Chinese file**

In `tests/readme-url-fix.test.ts`, replace:

```ts
const readmePath = new URL('../README.md', import.meta.url);
```

with:

```ts
const readmeEnPath = new URL('../README.md', import.meta.url);
const readmeZhPath = new URL('../README_ZH.md', import.meta.url);
```

Replace the current single-file assertions with paired assertions:

```ts
const readmeEn = readFileSync(readmeEnPath, 'utf8');
const readmeZh = readFileSync(readmeZhPath, 'utf8');

expect(readmeEn).toContain('https://raw.githubusercontent.com/lt-monster/omni-ctx/master/assets/logo/omni-ctx-logo.svg');
expect(readmeZh).toContain('https://raw.githubusercontent.com/lt-monster/omni-ctx/master/assets/logo/omni-ctx-logo.svg');
expect(readmeEn).toContain('https://github.com/lt-monster/omni-ctx/blob/master/LICENSE');
expect(readmeZh).toContain('https://github.com/lt-monster/omni-ctx/blob/master/LICENSE');
```

- [ ] **Step 3: Create a bilingual language-switch test**

Create `tests/readme-language.test.ts` with:

```ts
import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const readmeEnPath = new URL('../README.md', import.meta.url);
const readmeZhPath = new URL('../README_ZH.md', import.meta.url);

describe('bilingual README language switch', () => {
  it('creates the Chinese README file', () => {
    expect(existsSync(readmeZhPath)).toBe(true);
  });

  it('adds a bidirectional language switch below the badges', () => {
    const readmeEn = readFileSync(readmeEnPath, 'utf8');
    const readmeZh = readFileSync(readmeZhPath, 'utf8');

    expect(readmeEn).toContain('<a href="./README.md">English</a>');
    expect(readmeEn).toContain('<a href="./README_ZH.md">简体中文</a>');
    expect(readmeZh).toContain('<a href="./README.md">English</a>');
    expect(readmeZh).toContain('<a href="./README_ZH.md">简体中文</a>');
  });

  it('uses English introductory wording in the primary README', () => {
    const readmeEn = readFileSync(readmeEnPath, 'utf8');
    expect(readmeEn).toContain('OmniCtx is a Web Components-based context menu library');
    expect(readmeEn).not.toContain('OmniCtx 是一个基于 Web Components 的上下文菜单组件库');
  });
});
```

- [ ] **Step 4: Run targeted tests to verify they fail**

Run:

```bash
bun test tests/readme-hero.test.ts tests/readme-url-fix.test.ts tests/readme-language.test.ts
```

Expected: FAIL because:

- `README_ZH.md` does not exist yet
- current tests only support one README file
- `README.md` is still Chinese-first and has no language switch row

- [ ] **Step 5: Commit the failing tests**

```bash
git add tests/readme-hero.test.ts tests/readme-url-fix.test.ts tests/readme-language.test.ts
git commit -m "🧪 test: cover bilingual readme structure"
```

---

### Task 2: Add The Chinese README Mirror

**Files:**
- Create: `README_ZH.md`
- Test: `tests/readme-hero.test.ts`
- Test: `tests/readme-url-fix.test.ts`
- Test: `tests/readme-language.test.ts`

- [ ] **Step 1: Create the Chinese README file**

Create `README_ZH.md` by copying the current practical content from `README.md`, keeping:

- the same logo block
- the same centered title
- the same badge row
- the same Chinese explanatory content

Insert this language switch block directly under the badge row:

```html
<p align="center">
  <a href="./README.md">English</a> |
  <a href="./README_ZH.md">简体中文</a>
</p>
```

- [ ] **Step 2: Preserve the existing Chinese dynamic-usage guidance**

Ensure `README_ZH.md` retains these file references:

```md
- 生产环境推荐使用 `dist/omni-ctx.min.js` 或 `dist/omni-ctx.global.min.js`
- 调试时可使用未压缩的 `dist/omni-ctx.js` 或 `dist/omni-ctx.global.js`
```

- [ ] **Step 3: Run the targeted README tests**

Run:

```bash
bun test tests/readme-hero.test.ts tests/readme-url-fix.test.ts tests/readme-language.test.ts
```

Expected: still FAIL, but now the file-existence and shared hero-structure checks pass while the English README assertions still fail.

- [ ] **Step 4: Commit the Chinese README**

```bash
git add README_ZH.md tests/readme-hero.test.ts tests/readme-url-fix.test.ts tests/readme-language.test.ts
git commit -m "📝 docs: add chinese readme mirror"
```

---

### Task 3: Convert The Primary README To English

**Files:**
- Modify: `README.md`
- Test: `tests/readme-language.test.ts`

- [ ] **Step 1: Keep the existing hero and badge layout**

Leave the current top blocks structurally intact:

```html
<p align="center">
  <img src="https://raw.githubusercontent.com/lt-monster/omni-ctx/master/assets/logo/omni-ctx-logo.svg" alt="OmniCtx logo" width="140" />
</p>

<h1 align="center">OmniCtx</h1>

<p align="center">
  ...
</p>
```

Add this language switch block directly below the badge row:

```html
<p align="center">
  <a href="./README.md">English</a> |
  <a href="./README_ZH.md">简体中文</a>
</p>
```

- [ ] **Step 2: Translate the introductory paragraph and section headings**

Replace the current Chinese intro with:

```md
OmniCtx is a Web Components-based context menu library for building reusable right-click interactions in the browser. It supports both declarative markup and fully programmatic usage, making it suitable for fixed menus, runtime-generated menus, and cacheable menu instances.
```

Translate these headings:

```md
## ✨ Features
## 📦 Installation
## 🚀 Usage
## 📚 More Docs
```

- [ ] **Step 3: Translate the usage explanations while keeping code examples aligned**

Translate the surrounding prose for:

- declarative usage
- dynamic usage
- ESM/module usage
- plain `script` usage
- production vs debug build guidance

Keep the actual code examples functionally equivalent to the current ones, including:

```html
import { openContextMenu } from './dist/omni-ctx.min.js';
<script src="./dist/omni-ctx.global.min.js"></script>
```

- [ ] **Step 4: Run the targeted bilingual README tests**

Run:

```bash
bun test tests/readme-hero.test.ts tests/readme-url-fix.test.ts tests/readme-language.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the English README conversion**

```bash
git add README.md
git commit -m "📝 docs: make readme english-first"
```

---

### Task 4: Final Verification

**Files:**
- Verify: `README.md`
- Verify: `README_ZH.md`
- Verify: `tests/readme-hero.test.ts`
- Verify: `tests/readme-url-fix.test.ts`
- Verify: `tests/readme-language.test.ts`

- [ ] **Step 1: Run the full test suite**

```bash
bun test
```

Expected: all tests pass.

- [ ] **Step 2: Inspect the README pair directly**

Run:

```bash
git diff -- README.md README_ZH.md tests/readme-hero.test.ts tests/readme-url-fix.test.ts tests/readme-language.test.ts
```

Expected:

- `README.md` is English-first
- `README_ZH.md` preserves the Chinese content path
- both files contain the centered language switch row
- tests only cover bilingual README structure and language intent

- [ ] **Step 3: Commit the final verified state**

```bash
git add README.md README_ZH.md tests/readme-hero.test.ts tests/readme-url-fix.test.ts tests/readme-language.test.ts
git commit -m "✨ feat: add bilingual readme switch"
```
