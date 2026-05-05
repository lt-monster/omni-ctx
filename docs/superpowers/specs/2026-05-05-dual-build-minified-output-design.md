# Dual Build Minified Output Design

## Background

The project currently builds two browser JavaScript outputs:

- `dist/omni-ctx.js`
- `dist/omni-ctx.global.js`

Both are already generated with Bun's `minify: true`, so the current build is compressed by default. However, the distribution model has two limitations:

- there is no explicit unminified output for debugging
- there is no conventional `.min.js` artifact that clearly signals production-ready minified output

The user wants the build system to make JavaScript compression/minification explicit and provide a clearer production distribution model.

## Goals

- Produce both unminified and minified JavaScript outputs.
- Keep support for both ESM and browser global usage.
- Make minified outputs explicit via `.min.js` naming.
- Preserve a debug-friendly unminified build.
- Make package entrypoints clearly point to the chosen default artifact.
- Update tests and documentation so the build contract is explicit.

## Non-Goals

- Do not change the library runtime API.
- Do not introduce a new bundler.
- Do not add source maps in this iteration unless already trivial.
- Do not change type declaration generation beyond what is needed to keep outputs aligned.

## Chosen Approach

Adopt a dual-output strategy for both module formats:

### Unminified outputs

- `dist/omni-ctx.js`
- `dist/omni-ctx.global.js`

### Minified outputs

- `dist/omni-ctx.min.js`
- `dist/omni-ctx.global.min.js`

This gives four total JavaScript artifacts and makes the compressed distribution visible and conventional.

## Recommended Package Entry Strategy

Point the package default entry to the minified ESM build:

- `main`: `./dist/omni-ctx.min.js`
- `exports["."].import`: `./dist/omni-ctx.min.js`

Keep type declarations unchanged:

- `types`: `./dist/index.d.ts`

### Rationale

For npm consumers, a default production-ready entry is the most practical choice.

The unminified ESM file still remains available for:

- debugging
- local inspection
- advanced direct-file usage

## Browser Global Usage

For plain browser `script` usage:

- recommend `dist/omni-ctx.global.min.js` for production
- keep `dist/omni-ctx.global.js` available for debugging

This preserves the existing global namespace behavior:

- `window.OmniCtx`

## Build Strategy

The build should generate four JavaScript outputs instead of two.

### ESM

1. unminified:
   - entry: `src/index.ts`
   - format: `esm`
   - minify: `false`
   - output: `dist/omni-ctx.js`

2. minified:
   - entry: `src/index.ts`
   - format: `esm`
   - minify: `true`
   - output: `dist/omni-ctx.min.js`

### Global

3. unminified:
   - entry: `src/global.ts`
   - format: `iife`
   - minify: `false`
   - output: `dist/omni-ctx.global.js`

4. minified:
   - entry: `src/global.ts`
   - format: `iife`
   - minify: `true`
   - output: `dist/omni-ctx.global.min.js`

## File Responsibilities

### `scripts/build.ts`

This becomes responsible for:

- running four Bun build jobs
- writing four JavaScript artifacts
- keeping `dist/index.d.ts` generation intact
- logging a clear summary of all generated outputs

### `package.json`

This becomes responsible for:

- exposing the minified ESM build as the default package entry
- keeping type declarations mapped correctly

### `README.md`

This should document:

- default npm/module usage
- explicit file names for minified and unminified browser builds
- when to use `.min.js` versus unminified `.js`

### Tests

Tests should verify:

- all four JavaScript outputs are referenced by the build script
- package entrypoints point to the selected default minified ESM build
- build documentation remains aligned with the actual artifact names

## README Guidance

The README should make the output model explicit.

### Recommended phrasing

- Production browser usage:
  - `dist/omni-ctx.global.min.js`
- Debug browser usage:
  - `dist/omni-ctx.global.js`

- Production direct ESM file usage:
  - `dist/omni-ctx.min.js`
- Debug direct ESM file usage:
  - `dist/omni-ctx.js`

If examples use package import syntax:

```ts
import { openContextMenu } from 'omni-ctx';
```

that should resolve to the default minified ESM build through package metadata.

## Testing Strategy

Add or update tests to cover:

1. build script emits:
   - `dist/omni-ctx.js`
   - `dist/omni-ctx.min.js`
   - `dist/omni-ctx.global.js`
   - `dist/omni-ctx.global.min.js`

2. build script includes both:
   - minified build jobs
   - unminified build jobs

3. package metadata points to:
   - `./dist/omni-ctx.min.js`

4. documentation references the explicit minified global build where appropriate

## Risks And Mitigations

### Risk: more build steps increase maintenance cost

Mitigation:

- keep all build jobs in one script
- make naming systematic and predictable

### Risk: README examples drift from actual artifact names

Mitigation:

- add tests that inspect README and build script strings

### Risk: consumers are confused by multiple files

Mitigation:

- clearly separate production versus debug usage in README
- keep package import default simple

### Risk: package entry accidentally points to the wrong file

Mitigation:

- add tests for `package.json`
- explicitly verify `npm pack --dry-run` after the change

## Final Recommendation

Implement an explicit dual-output distribution model:

- unminified `.js` files for debugging
- minified `.min.js` files for production
- default package import pointing to the minified ESM build

This gives the project a more standard library distribution layout and makes compression/minification a visible, testable part of the build contract.
