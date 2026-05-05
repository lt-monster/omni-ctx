# License And README URL Fix Design

## Background

The published npm package currently shows a broken logo in the npm README.

The root cause is already identified:

- `README.md` references `./assets/logo/omni-ctx-logo.svg`
- the npm package only publishes `dist/` plus package metadata
- the SVG file is not included in the published package

The user selected the strategy of using absolute repository URLs for README assets and has now provided the repository URL:

- `https://github.com/lt-monster/omni-ctx`

The user also requested that the repository add a root-level MIT license file.

## Goals

- Add a standard MIT `LICENSE` file at the repository root.
- Replace the README logo path with an absolute repository URL.
- Replace the README license link with an absolute repository URL.
- Make the README render correctly on npm after a follow-up patch release.

## Non-Goals

- Do not keep using relative README asset URLs for npm-facing content.
- Do not guess any branch name other than the one currently used by the repository.

## Chosen Approach

Implement the full npm README fix now:

- create `LICENSE` with standard MIT text
- change the README logo image source to an absolute GitHub raw URL
- change the README license link to an absolute GitHub URL

Use these repository targets:

- logo image source:
  - `https://raw.githubusercontent.com/lt-monster/omni-ctx/master/assets/logo/omni-ctx-logo.svg`
- license link:
  - `https://github.com/lt-monster/omni-ctx/blob/master/LICENSE`

## Rationale

This fixes the actual npm rendering issue at the source:

- npm can load the logo from a public absolute URL
- the license link no longer points to a file that is absent from the published tarball
- the repository also gains a proper root-level MIT license file

## Implementation Scope

### Create

- `LICENSE`

### Modify

- `README.md`

## Future Follow-Up

After the repository fix is merged:

1. bump the package version with a patch release
2. publish the updated package to npm
3. verify npm package page renders the logo correctly

## Verification

For this current change:

- verify `LICENSE` exists at repository root
- verify the file contains standard MIT license text
- verify `README.md` references the new absolute logo URL
- verify `README.md` references the new absolute license URL

For the npm follow-up:

- verify npm README renders the logo correctly
- verify the license link resolves correctly from npm

## Final Recommendation

Proceed with:

- adding the root-level MIT `LICENSE`
- updating `README.md` to use repository absolute URLs

Then publish a patch version to npm so the package page picks up the corrected README.
