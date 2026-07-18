# Macrostructures

12 page skeletons, indexed 0-11. The seed picks one; it decides what the page IS before any styling. The macrostructure must not match any of the last 3 entries in `.design-log.json` (the same rule as SKILL.md Step 3a).

A macrostructure is a reading order, not a theme. Any direction can wear any macrostructure.

## The deck

0. **Marquee Hero**: full-bleed hero owns the first viewport as one composition; sections below alternate density (loud, quiet, loud). For launches and single-product stories.
1. **Split Studio**: persistent two-column split; left column is identity/navigation (sticky), right column scrolls content. For portfolios, studios, docs-like marketing.
2. **Long Document**: one readable column (65ch), strong typographic hierarchy, generous margins with side notes. No numbered chapters and no contents rail: wayfinding comes from running heads and scale shifts, and section transitions are background-value or density changes, never rules. For manifests, essays, changelogs, docs.
3. **Stat-Led**: the number is the hero. One enormous metric or price up top, supporting proof below in a strict grid. For analytics, pricing-first, performance claims. Only with real numbers.
4. **Workbench**: app-frame layout: top bar, dense main panel, supporting rails. For dashboards and tools; marketing pages may embed ONE workbench screenshot-style panel instead of faking browser chrome.
5. **Manifesto**: oversized declarative text IS the page. Sections are sentences at 8-16vw, details in small type between them. For studios, campaigns, opinionated products.
6. **Letter**: the page reads as a letter from a person: salutation, body, signature. Narrow column, personal voice, one accent flourish. For founders' notes, invitations, personal tools.
7. **Specimen**: type-specimen energy: the content displayed as a systematic catalog of styles, weights, sizes. For font-adjacent, design tools, portfolios.
8. **Catalogue**: uniform repeating item grid with obsessive consistency (image, name, meta), filters up top. For shops, galleries, directories, integrations.
9. **Offset Cascade**: sections alternate a 60/40 horizontal offset (left-weighted, then right-weighted), and each section's lead element overlaps the previous section's tail by 48-96px via negative margin, so the eye travels diagonally down the page. No two consecutive sections share a background value. For launches, portfolios, story-driven marketing.
10. **Photographic**: imagery dominates 60%+ of every viewport; text overlays or interleaves in narrow bands. Only when real (or locally generated placeholder-labeled) imagery exists.
11. **Bento Anchor**: interlocking cell grid, but with a mandatory anchor cell about 2x the area of the next largest, `grid-auto-flow: dense`, no empty voids, no two cells with identical content-shape. For feature overviews with 4+ genuinely parallel items.

## Hero budget (applies to whatever the first viewport is)

The first viewport reads as ONE composition: brand, one headline (2-3 lines max at its clamp ceiling; state the clamp and max-width before coding), one supporting sentence of at most 20 words, one CTA group, one dominant visual element. No cards in the hero. No floating badges, chips, stat clusters, or fake UI screenshots unless the brief demands them.

## Section rules

- One job per section. If a section does two things, split it or cut one.
- Cardless by default: prefer whitespace, rules, and type hierarchy to group content. Cards are for genuinely parallel, repeated items (3+ of the same kind).
- Never nest cards. Never stack wrapper containers with their own padding ("container soup").
- Eyebrow labels (small uppercase kickers) on at most one section in three, set in the body family, never in a mono face.
- Numbered scaffolding (01/02/03) only when the user will literally perform the steps in order (a setup guide, a recipe); never as wayfinding or decor. No chapter labels, no book-style contents blocks.
- No `hr` elements or uniform hairline dividers between sections; transition by shifting background value, changing grid density, or a full-bleed moment.
- Alternate section rhythm: a loud section (big type or imagery) followed by a quiet one. Uniform density reads as template.

## Responsive rules

- Breakpoints to verify: 375, 768, 1280. No horizontal scroll from 320 to 1920 (`overflow-x: clip` on body plus real fixes: `minmax(0, 1fr)` in grids, `min-width: 0` on flex children, `overflow-wrap: anywhere` on long strings).
- The macrostructure may collapse (Split Studio stacks; Bento becomes a single column with the anchor first) but the reading order must survive.
- Touch targets 44px minimum on mobile; inputs at least 16px font-size.
