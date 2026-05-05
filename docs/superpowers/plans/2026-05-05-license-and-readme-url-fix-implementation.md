# License And README URL Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a root-level MIT license, switch README logo and license references to absolute GitHub URLs, and prepare a patch release so the npm package page renders correctly.

**Architecture:** Keep the runtime package contents unchanged except for a patch version bump, and fix the npm README issue entirely at the README layer by replacing relative links with public repository URLs. Add one focused test file that verifies `LICENSE` exists and that the README top block uses the expected absolute URLs for npm-safe rendering.

**Tech Stack:** Markdown, plain text license file, Bun test runner, npm package metadata

---

## File Map

- Create: `LICENSE` — standard MIT license text at repository root
- Create: `tests/readme-url-fix.test.ts` — verify license file existence and README absolute URLs
- Modify: `README.md` — replace relative logo and license links with absolute GitHub URLs
- Modify: `package.json` — bump patch version for republishing

---

### Task 1: Add Failing Tests For License And README URL Safety

**Files:**
- Create: `tests/readme-url-fix.test.ts`

- [ ] **Step 1: Create the failing test file**

Create `tests/readme-url-fix.test.ts` with:

```ts
import { describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

const readmePath = new URL('../README.md', import.meta.url);
const licensePath = new URL('../LICENSE', import.meta.url);

describe('README npm-safe asset links', () => {
  it('creates a root MIT license file', () => {
    expect(existsSync(licensePath)).toBe(true);
  });

  it('uses an absolute github raw url for the logo', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('https://raw.githubusercontent.com/lt-monster/omni-ctx/master/assets/logo/omni-ctx-logo.svg');
  });

  it('uses an absolute github url for the license link', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('https://github.com/lt-monster/omni-ctx/blob/master/LICENSE');
  });

  it('keeps the centered hero block intact', () => {
    const readme = readFileSync(readmePath, 'utf8');
    expect(readme).toContain('<p align="center">');
    expect(readme).toContain('<h1 align="center">OmniCtx</h1>');
  });
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run:

```bash
bun test tests/readme-url-fix.test.ts
```

Expected: FAIL because:

- `LICENSE` does not exist yet
- `README.md` still uses relative logo and license paths

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/readme-url-fix.test.ts
git commit -m "🧪 test: cover npm-safe readme asset links"
```

---

### Task 2: Add The Root MIT License

**Files:**
- Create: `LICENSE`
- Test: `tests/readme-url-fix.test.ts`

- [ ] **Step 1: Create the root MIT license file**

Create `LICENSE` with:

```text
MIT License

Copyright (c) 2026 lt-monster

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Run the targeted test**

Run:

```bash
bun test tests/readme-url-fix.test.ts
```

Expected: still FAIL, but now only on README URL assertions because `LICENSE` exists.

- [ ] **Step 3: Commit the license file**

```bash
git add LICENSE tests/readme-url-fix.test.ts
git commit -m "📝 docs: add MIT license"
```

---

### Task 3: Replace Relative README Links With Absolute Repository URLs

**Files:**
- Modify: `README.md`
- Test: `tests/readme-url-fix.test.ts`

- [ ] **Step 1: Update the hero logo image source**

Change:

```html
<img src="./assets/logo/omni-ctx-logo.svg" alt="OmniCtx logo" width="140" />
```

to:

```html
<img src="https://raw.githubusercontent.com/lt-monster/omni-ctx/master/assets/logo/omni-ctx-logo.svg" alt="OmniCtx logo" width="140" />
```

- [ ] **Step 2: Update the hero license link**

Change:

```html
<a href="./LICENSE">
```

to:

```html
<a href="https://github.com/lt-monster/omni-ctx/blob/master/LICENSE">
```

- [ ] **Step 3: Run the targeted test**

Run:

```bash
bun test tests/readme-url-fix.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit the README URL fix**

```bash
git add README.md
git commit -m "📝 docs: use absolute github links in readme hero"
```

---

### Task 4: Bump Patch Version For npm Republish

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update the package version**

Change in `package.json`:

```json
"version": "1.0.0"
```

to:

```json
"version": "1.0.1"
```

- [ ] **Step 2: Verify the package metadata change**

Run:

```bash
npm pack --dry-run --json
```

Expected:

- package version shows `1.0.1`
- tarball still contains only package-safe files

- [ ] **Step 3: Commit the version bump**

```bash
git add package.json
git commit -m "📦 build: bump version to 1.0.1"
```

---

### Task 5: Final Verification Before Republish

**Files:**
- Verify: `LICENSE`
- Verify: `README.md`
- Verify: `tests/readme-url-fix.test.ts`
- Verify: `package.json`

- [ ] **Step 1: Run the full test suite**

```bash
bun test
```

Expected: all tests pass.

- [ ] **Step 2: Run the build**

```bash
bun run build
```

Expected: build succeeds without changing the intended public outputs.

- [ ] **Step 3: Run npm pack dry-run**

```bash
npm pack --dry-run
```

Expected:

- package version is `1.0.1`
- README is included
- runtime package contents remain clean

- [ ] **Step 4: Inspect final diff scope**

```bash
git diff -- LICENSE README.md package.json tests/readme-url-fix.test.ts
```

Expected: diff contains only the license addition, README URL fix, version bump, and matching tests.

- [ ] **Step 5: Commit the final verified state**

```bash
git add LICENSE README.md package.json tests/readme-url-fix.test.ts
git commit -m "🔧 fix: prepare npm readme asset link patch release"
```
