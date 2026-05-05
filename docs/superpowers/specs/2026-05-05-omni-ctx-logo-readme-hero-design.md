# OmniCtx Logo And README Hero Design

## Background

The project currently has a text-first README with:

- a plain `# OmniCtx` heading
- badges near the top
- a short product introduction

The user now wants a more polished GitHub-style project homepage presentation by adding:

- a custom SVG logo
- centered hero layout at the top of `README.md`
- centered title
- centered badges

The logo should:

- visually communicate “menu”
- use fresh, minimal, soft colors
- use three colors
- feel appropriate for an open-source component library

## Goals

- Create a reusable SVG logo asset for the project.
- Make the logo clearly suggest menu structure.
- Use a soft, fresh, minimal visual style.
- Use exactly three main colors in the logo.
- Update the README top section so the logo, title, and badges are centered.
- Keep the result compatible with GitHub README rendering.

## Non-Goals

- Do not create a mascot-style illustration.
- Do not create a complex 3D or heavily shaded logo.
- Do not redesign the entire README beyond the top hero area unless needed for alignment consistency.
- Do not replace the project name text with text embedded inside the SVG.

## Chosen Visual Direction

The chosen concept is:

- stacked menu cards

This direction was selected because it:

- communicates “menu” immediately
- works naturally with three soft colors
- stays simple and scalable in SVG
- fits a GitHub repository homepage better than decorative illustration styles

## Logo Concept

### Core shape

The logo should be built from:

- three rounded rectangular cards
- slightly offset in depth/layer order
- each card containing short horizontal menu lines

This should create the impression of:

- layered context menus
- structured list items
- lightweight UI primitives

### Composition

Recommended composition:

- one primary front card
- one partially visible secondary card behind it
- one partially visible tertiary card behind that

The cards should be offset just enough to imply layers, but not so much that the logo becomes visually busy.

### Internal detail

Inside the visible front card:

- 2 to 3 short rounded horizontal lines

Optional:

- a small circular or dot-like marker aligned with one row to hint at a menu action point

This detail should remain subtle. The logo should still read clearly at small sizes.

## Color Direction

Use three soft, fresh colors:

1. soft teal / blue-green
2. light mint green
3. gentle apricot / peach

These colors should be:

- low to medium saturation
- light and approachable
- clean rather than playful

### Recommended palette character

The palette should feel:

- modern
- calm
- UI-oriented
- open-source friendly

It should avoid:

- neon tones
- very dark colors
- highly corporate blues
- overly candy-like pastels

## SVG Style Rules

### Shape styling

- rounded corners throughout
- minimal or no outline
- very light shadowing only if necessary
- avoid gradients unless extremely subtle

### Visual complexity

Keep the SVG simple enough that it:

- renders crisply on GitHub
- scales down well
- can be reused later in docs or package pages

### Background

The SVG should use:

- transparent background

This ensures it works in README contexts and future reuse.

## README Hero Layout

The README hero area should be restructured as:

1. centered logo
2. centered title
3. centered badges
4. then the existing project introduction paragraph

### Recommended GitHub-compatible structure

Use HTML alignment blocks:

```html
<p align="center">
  <img ... />
</p>

<h1 align="center">OmniCtx</h1>

<p align="center">
  ...
</p>
```

This is preferred because GitHub README rendering handles this pattern reliably.

### Title treatment

Keep:

- `OmniCtx`

as real README text, not text embedded into the SVG.

This preserves:

- searchability
- copyability
- accessibility
- cleaner repository rendering

### Badge placement

The badges should remain individual badge links, but be wrapped in a centered block beneath the title.

## File Structure

Recommended files:

- `assets/logo/omni-ctx-logo.svg`
  - the final SVG logo asset

- `README.md`
  - updated top hero layout

If the repository does not yet have an `assets` directory, create it with a focused structure:

- `assets/logo/`

This keeps the logo reusable and prevents burying it inside docs-only locations.

## README Content Boundaries

Only the top presentation layer should change materially:

- add centered logo
- center the title
- center the badges

The rest of the README can remain largely as-is unless spacing or structure must be adjusted for visual consistency.

## Testing And Verification

Verification should cover:

1. file existence
   - logo SVG exists in the intended path

2. README usage
   - README references the SVG correctly
   - title is centered
   - badges are centered

3. rendering sanity
   - the SVG is valid XML/SVG
   - the README still renders cleanly in Markdown/GitHub-style viewers

4. visual fit
   - logo remains readable at small hero size
   - hero section looks balanced at the top of the README

## Risks And Mitigations

### Risk: logo becomes too decorative

Mitigation:

- keep the icon geometric
- use UI-card semantics rather than illustration

### Risk: logo does not clearly communicate “menu”

Mitigation:

- use visible list-line structure
- use layered card composition

### Risk: README top becomes visually heavy

Mitigation:

- keep logo compact
- keep whitespace generous
- center only the hero section, not the entire README

### Risk: embedded text in SVG creates poor README behavior

Mitigation:

- keep project name outside the logo
- render the title as normal README heading text

## Final Recommendation

Implement:

- a transparent SVG logo based on three layered menu cards
- three soft colors: teal, mint, and apricot
- a centered README hero section with logo, title, and badges

This gives the project a cleaner open-source homepage identity while keeping the design minimal, readable, and appropriate for a UI component library.
