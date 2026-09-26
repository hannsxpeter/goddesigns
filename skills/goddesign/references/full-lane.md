# Full lane

Read this before building when SKILL.md's lane rule puts you here: literal executors (Codex and GPT models), smaller or faster tiers (Sonnet, Haiku, mini, flash, lite), or any model unsure which lane it is in. Frontier models with strong design taste skip it, because they already do most of what it enumerates; everything here is either a number such a model would pick anyway or a guard against a failure this kind of model has actually shown.

Your risk is the opposite of convergence: inventing nothing. So nothing below asks you to be creative. It asks you to execute values.

## Execute the row exactly

- Take the row `pick.mjs` printed and execute it as written: its hex values, named fonts and weights, import line, radius, and motion numbers, with the printed jitter applied. Never blend rows, and never soften the row toward what feels typical.
- Complete the whole DIRECTION LOCK before writing code, then restate the locked tokens as a comment at the top of the stylesheet you emit, so they survive a long session.
- Enumerate the full deliverable up front (pages, sections, breakpoints, states) and build all of it. Never silently trim scope.
- When an image tool is available, use comp-first mode (`imagery.md`): generate one lock-derived mockup and replicate it. Executing a visual spec is this lane's measured strength; inventing one is its measured weakness.

Three failure symptoms to check at the gate:

1. **The placeholder floor**: browser-default link blue, unstyled buttons, a silent Times fallback, missing hover states.
2. **Template snap-back**: drifting mid-build toward one recycled Bootstrap-grade layout whatever the lock says. After building, re-read the stylesheet comment against the lock.
3. **Architecture instead of pixels**: a static page or component ships as markup plus tokens plus one stylesheet; no factories, wrapper layers, or config indirection.

## Build rules, enumerated

- All colors and fonts as CSS custom properties in `:root`; components reference tokens only.
- CSS hygiene: zero `!important` (the `prefers-reduced-motion` kill switch is the one exception); zero inline `style` attributes; each hex appears exactly once, in `:root`; fix layout by restructuring markup, never with pseudo-element patches or absolute-position hacks; a declaration block pasted twice becomes a class.
- Modern CSS by default: `clamp()` type scales, grid with named areas, `oklch()` and `color-mix()`, container queries where components reflow, `text-wrap: balance` on headings and `text-wrap: pretty` on body, `:focus-visible`, `overflow-x: clip`, and native `dialog` or `popover` for overlays (never `position: absolute` inside `overflow: hidden`).
- Every interactive element ships default, hover, focus-visible, active, and disabled states; anything data-driven ships empty, error, and loading states.
- Conception map, optional: a page may take different sections from up to three avenues (an image comp for the hero, artifact-first for a product section, a human-genome grammar for a utility band). Declare which sections come from which avenue in the lock. Mixed conception, never mixed identity: every avenue executes the same lock.

## The craft floor

- **Type**: scale ratio 1.2 (dense UI), 1.25 (marketing), or 1.333-1.5 (display-led). Body 16-18px, never under 15. Line height 1.5-1.6 for body, 1.1-1.2 for display. Measure 45-75ch. At most 3 families. Weight contrast from extremes (300 against 800, not 400 against 600). Display letter-spacing down to -0.04em; all-caps labels at +5-12% tracking. Hero clamp ceiling 6rem, unless the row or the macrostructure states vw-scale display type (8-20vw), which then wins.
- **Spacing**: token-scale values only (4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160), except the grammar breaks declared in the lock. Space inside a group is smaller than space between groups. Section vertical padding takes at least 3 distinct values, the largest at least twice the smallest; one global `section { padding }` rule is banned. Prefer `gap` to margins. A row marked dense or airy overrides this scale.
- **Color**: 60-30-10 dominance; the accent under 5% of any viewport, on interactive and state elements only. Contrast 4.5:1 for body text, 3:1 for large text and UI boundaries. No pure #000 or #FFF bases. Neutrals tinted toward the brand hue (chroma 0.005-0.015). Dark mode: raise surface lightness for elevation, desaturate accents 20-30%, never black.
- **Shadows**: one light source, 2:1 vertical-to-horizontal offset, layered steps (1/2/4/8/16px at about 0.07 opacity each), tinted toward the background hue. A child's radius never exceeds its parent's.
- **Accessibility**: a 2px `:focus-visible` outline, never removed; targets at least 24px (44px on mobile); status never color-only; semantic heading order; alt text, or `aria-hidden` on decorative art; honor `prefers-reduced-motion`.
- **UX writing**: labels say what happens ("Save changes", not "Submit"); errors explain and offer the fix; empty states invite one action; sentence case; no em dashes in UI copy.
- **Restraint**: one signature element per page; concentrate boldness in one place and keep the rest quiet. Before shipping, remove one thing. More animation makes a page look more AI-generated, not less.

## Copy and gate

- After the visible copy exists, read `copy.md` and run its four-pass review before the gate.
- Run the gate in `checklist.md`: the sweep and the audit first, then its Phase 2b assertions by hand with the lock in front of you. Report the Phase 2b pass count as hand-checked.
- Second-order check: the predictable tasteful alternative (cream ground, display serif, terracotta accent) is slop too. If the page matches it and the seed did not choose it, redo the pick with `--reroll`.
