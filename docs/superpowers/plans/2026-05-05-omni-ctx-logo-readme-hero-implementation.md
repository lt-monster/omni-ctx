# OmniCtx Logo And README Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a reusable SVG logo for OmniCtx and update the README top section into a centered GitHub-style hero area with logo, centered title, and centered badges.

**Architecture:** Add a single transparent SVG asset under `assets/logo/` and keep the visual concept intentionally simple: three layered rounded menu cards with three soft colors. Update only the README hero layer using GitHub-compatible centered HTML blocks so the logo, title, and badges render consistently without restructuring the rest of the document.

**Tech Stack:** SVG, Markdown, GitHub README-compatible HTML, Bun test runner

---

## File Map

- Create: `assets/logo/omni-ctx-logo.svg` — final SVG logo asset with layered menu-card composition
- Modify: `README.md` — centered hero area with logo, centered title, centered badges
- Create: `tests/readme-hero.test.ts` — verify logo asset existence and README hero structure

---

### Task 1: Add Failing Tests For The Logo Asset And README Hero

**Files:**
- Create: `tests/readme-hero.test.ts`

- [ ] **Step 1: Create a focused failing test file**

Create `tests/readme-hero.test.ts` with:

```ts
import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const readmePath = new URL('../README.md', import.meta.url);
const logoPath = new URL('../assets/logo/omni-ctx-logo.svg', import.meta.url);

describe('README hero logo', () => {
  it('creates the svg logo asset in assets/logo', () => {
    expect(existsSync(logoPath)).toBe(true);
  });

  it('references the svg logo from the readme hero area', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('assets/logo/omni-ctx-logo.svg');
    expect(readme).toContain('<p align="center">');
    expect(readme).toContain('<h1 align="center">OmniCtx</h1>');
  });

  it('centers the badge block below the title', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('[![npm version]');
    expect(readme).toContain('[![license]');
    expect(readme).toContain('[![runtime]');
    expect(readme).toContain('</p>');
  });

  it('keeps the logo svg transparent and menu-oriented', () => {
    const svg = readFileSync(logoPath, 'utf8');
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox=');
    expect(svg).toContain('rect');
    expect(svg).toContain('line');
    expect(svg).not.toContain('<text');
  });
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run:

```bash
bun test tests/readme-hero.test.ts
```

Expected: FAIL because:

- `assets/logo/omni-ctx-logo.svg` does not exist yet
- `README.md` does not yet contain the centered hero structure

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/readme-hero.test.ts
git commit -m "test: cover readme hero logo"
```

---

### Task 2: Create The SVG Logo Asset

**Files:**
- Create: `assets/logo/omni-ctx-logo.svg`
- Test: `tests/readme-hero.test.ts`

- [ ] **Step 1: Create the logo directory**

Ensure this path exists:

```text
assets/logo/
```

- [ ] **Step 2: Create the SVG asset**

Create `assets/logo/omni-ctx-logo.svg` with:

```svg
<svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="54" y="34" width="112" height="78" rx="18" fill="#BFEDE3"/>
  <rect x="74" y="50" width="112" height="78" rx="18" fill="#FFD9BF"/>
  <rect x="44" y="64" width="132" height="86" rx="20" fill="#CDEAEF"/>

  <line x1="72" y1="93" x2="148" y2="93" stroke="#5F7F86" stroke-width="8" stroke-linecap="round"/>
  <line x1="72" y1="114" x2="156" y2="114" stroke="#5F7F86" stroke-width="8" stroke-linecap="round"/>
  <line x1="72" y1="135" x2="132" y2="135" stroke="#5F7F86" stroke-width="8" stroke-linecap="round"/>

  <circle cx="154" cy="135" r="8" fill="#7ECFBF"/>
</svg>
```

This keeps the logo:

- transparent
- geometric
- menu-like
- free of embedded text

- [ ] **Step 3: Run the targeted test**

Run:

```bash
bun test tests/readme-hero.test.ts
```

Expected: still FAIL, but now only on README hero structure because the asset exists.

- [ ] **Step 4: Commit the SVG asset**

```bash
git add assets/logo/omni-ctx-logo.svg tests/readme-hero.test.ts
git commit -m "feat: add omni-ctx svg logo"
```

---

### Task 3: Update README Into A Centered Hero Layout

**Files:**
- Modify: `README.md`
- Test: `tests/readme-hero.test.ts`

- [ ] **Step 1: Replace the current top section with a centered hero**

Update the beginning of `README.md` to this structure:

```md
<p align="center">
  <img src="./assets/logo/omni-ctx-logo.svg" alt="OmniCtx logo" width="140" />
</p>

<h1 align="center">OmniCtx</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/omni-ctx">
    <img alt="npm version" src="https://img.shields.io/npm/v/omni-ctx" />
  </a>
  <a href="./LICENSE">
    <img alt="license" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components">
    <img alt="runtime" src="https://img.shields.io/badge/runtime-Web%20Components-orange.svg" />
  </a>
</p>
```

Then keep the introduction paragraph directly below that hero area.

- [ ] **Step 2: Keep the rest of the README structure intact**

Do not remove:

- project introduction
- feature list
- install section
- usage sections
- docs link

The change is visual and structural for the top hero area, not a full content rewrite.

- [ ] **Step 3: Run the targeted hero test**

Run:

```bash
bun test tests/readme-hero.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit the README hero update**

```bash
git add README.md
git commit -m "docs: center readme hero with logo"
```

---

### Task 4: Final Verification

**Files:**
- Verify: `assets/logo/omni-ctx-logo.svg`
- Verify: `README.md`
- Verify: `tests/readme-hero.test.ts`

- [ ] **Step 1: Run the full test suite**

```bash
bun test
```

Expected: all tests pass.

- [ ] **Step 2: Inspect the final diff scope**

```bash
git diff -- assets/logo/omni-ctx-logo.svg README.md tests/readme-hero.test.ts
```

Expected: diff contains only:

- the new logo SVG asset
- the centered README hero update
- the matching test file

- [ ] **Step 3: Commit the final verified state**

```bash
git add assets/logo/omni-ctx-logo.svg README.md tests/readme-hero.test.ts
git commit -m "feat: add logo and readme hero"
```
