# Bilingual README Design

## Background

The repository currently uses a single `README.md` whose content is primarily Chinese.

The user wants the project README experience to support both Chinese and English, with a visible language switch placed below the badge row. The user also clarified the priority decision:

- `README.md` should become the English primary README
- Chinese content should still be available through a dedicated switch target

This means the repository homepage on GitHub will default to the English README, while Chinese content will be accessible from the same hero area.

## Goals

- Make the repository README available in both English and Chinese.
- Keep a visible language switch directly below the badge row.
- Use `README.md` as the English primary README.
- Add a dedicated Chinese README file for mirrored content.
- Preserve the existing hero area:
  - centered logo
  - centered title
  - centered badge row
- Keep the existing information architecture aligned across both languages.

## Non-Goals

- Do not change the project runtime API.
- Do not redesign the existing README hero layout beyond adding language links.
- Do not introduce machine-generated translation toggles or JavaScript-based switching.
- Do not add more languages in this iteration.

## Chosen Approach

Use a two-file README model:

- `README.md` as the English primary README
- `README_ZH.md` as the Chinese README

Both files should include the same top hero area and a language switch block directly under the badges.

### Language switch block

Use a centered switch block such as:

```html
<p align="center">
  <a href="./README.md">English</a> |
  <a href="./README_ZH.md">简体中文</a>
</p>
```

This block should exist in both files so users can switch in either direction.

## File Responsibilities

### `README.md`

Responsibilities:

- serve as the GitHub-default README
- provide the English project description
- include the same major sections as the Chinese version
- include the language switch below badges

### `README_ZH.md`

Responsibilities:

- provide the Chinese version of the README
- mirror the English README structure closely
- include the same hero area and language switch

### Tests

Tests should verify:

- `README_ZH.md` exists
- both README files include language switch links
- both README files include the logo hero area
- both README files include badge links
- the English README is no longer primarily Chinese content

## Content Structure

Both files should follow the same structure as closely as practical:

1. hero logo
2. title
3. badge row
4. language switch row
5. short project introduction
6. features
7. installation
8. usage
9. declarative usage
10. dynamic usage
11. build artifact guidance
12. more documentation

## Translation Strategy

The English README should not be a shortened placeholder. It should be a real first-class README, not just a landing page that redirects to Chinese.

The Chinese README should remain complete and should preserve the current project-facing clarity for Chinese readers.

The two files do not need to be character-for-character equivalent, but they should remain structurally aligned and describe the same product capabilities.

## README Hero Rules

Keep the existing hero layout intact in both files:

- centered SVG logo
- centered `OmniCtx` title
- centered badge block

Add the language switch as a separate centered row directly below the badge block and above the introductory paragraph.

This preserves the current visual hierarchy while making language selection obvious.

## Relative Linking Rules

Because both README files live at the repository root:

- `README.md` should link to `./README_ZH.md`
- `README_ZH.md` should link to `./README.md`

The existing absolute GitHub logo URL and license URL can remain unchanged in both files.

## Testing Strategy

Add or update README-focused tests to cover:

1. `README_ZH.md` exists
2. `README.md` contains language switch links
3. `README_ZH.md` contains language switch links
4. both files contain:
   - logo image
   - title
   - badge links
5. English README contains English introductory wording rather than the current Chinese-first text

## Risks And Mitigations

### Risk: bilingual files drift over time

Mitigation:

- keep the same section order in both files
- add tests for key shared structure
- prefer mirrored edits when README changes later

### Risk: hero area becomes cluttered

Mitigation:

- keep the switch row minimal
- place it below badges as a dedicated centered line
- avoid adding extra labels or buttons

### Risk: English README feels incomplete

Mitigation:

- translate the full practical content, not just the intro
- keep code examples aligned across languages

### Risk: README tests become fragile

Mitigation:

- test for durable structural markers and links
- avoid overfitting tests to exact paragraph wording except where language intent matters

## Final Recommendation

Implement a two-file bilingual README system:

- `README.md` as the English primary README
- `README_ZH.md` as the Chinese README
- a centered language switch row below badges in both files

This gives GitHub a clean English-first landing page while preserving a complete Chinese reading path with minimal UI complexity.
