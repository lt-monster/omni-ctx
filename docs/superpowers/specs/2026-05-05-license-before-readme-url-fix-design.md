# License Before README URL Fix Design

## Background

The published npm package currently shows a broken logo in the npm README.

The root cause is already identified:

- `README.md` references `./assets/logo/omni-ctx-logo.svg`
- the npm package only publishes `dist/` plus package metadata
- the SVG file is not included in the published package

The user selected the strategy of using absolute repository URLs for README assets in the future, but the repository URL is not available yet.

The user also requested that the repository add a root-level MIT license file now.

## Goals

- Add a standard MIT `LICENSE` file at the repository root.
- Keep the current README unchanged for now.
- Defer the README absolute URL fix until the repository URL is provided.
- Avoid publishing a partial npm fix that still leaves the logo broken.

## Non-Goals

- Do not guess or fabricate a repository URL.
- Do not publish a new npm version yet.
- Do not change the current README image/link targets until the real repository URL is known.

## Chosen Approach

Implement only the part that is fully deterministic now:

- create `LICENSE` with standard MIT text

Do not yet:

- replace logo URL in `README.md`
- replace `LICENSE` link target in `README.md`
- publish a new npm version

## Rationale

This keeps the repository legally and structurally correct without introducing placeholder links that would need another correction.

Publishing now would not solve the actual npm README logo issue, because that issue depends on the final repository URL.

## Implementation Scope

### Create

- `LICENSE`

### Leave unchanged for now

- `README.md`
- `package.json`
- npm package version

## Future Follow-Up

Once the repository URL is available, perform a second small change set:

1. replace the logo `src` in `README.md` with an absolute repository URL
2. replace the `LICENSE` link in `README.md` with an absolute repository URL
3. release a new patch version to npm

## Verification

For this current change:

- verify `LICENSE` exists at repository root
- verify the file contains standard MIT license text

For the later follow-up:

- verify npm README renders the logo correctly
- verify the license link resolves correctly from npm

## Final Recommendation

Proceed now with a root-level MIT `LICENSE` only.

Wait for the repository URL before making README asset-link changes or publishing a new npm version.
