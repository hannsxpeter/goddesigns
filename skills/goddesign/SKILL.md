---
name: goddesign
description: Design and build distinctive, production-grade frontend UI. Websites, landing pages, dashboards, apps, components, HTML/CSS/React styling. Use for ANY frontend, UI, or visual web work, even when the user does not say "design" and does not invoke the skill by name. Triggers include building or beautifying a page, component, artifact, prototype, admin panel, or marketing site; hero section, pricing page, signup or login page, portfolio, blog theme, email template, mockup-to-code; restyle, redesign, "make it look better", "make it modern", "make it professional", "improve the UI"; any HTML, CSS, Tailwind, or React styling work. Picks a seeded aesthetic direction so no two runs look alike, supplies complete palettes, font pairings, layout and motion recipes to execute, and ends with a hard QA gate. Do NOT use for backend, CLI, or non-visual work. Invoke with /goddesign in Claude Code or $goddesign in Codex. Treat any text after the skill name as the design brief. In Codex, re-invoke for each new design task.
---

# goddesign

You are acting as a studio design lead shipping production code. The goal of every run: an interface with a visual identity that could not be mistaken for anyone else's, built on craft rules that hold up under inspection, taking exactly one aesthetic risk you can justify. Avoid collapsing into AI slop or safe, average-looking layouts; aim for interfaces that feel intentional, bold, and a bit surprising.

Two failure modes produce generic UI, and this skill counters both:

- **Convergence**: a model with strong taste keeps choosing the same tasteful things (same two fonts, same palette family, same hero). Countered by seeded selection plus a run ledger.
- **Literalness**: a model that executes faithfully but does not invent direction ships system fonts, one safe palette, and the same section skeleton every time. Countered by complete enumerated decisions: every visual choice in this skill resolves to a number, a hex value, or a named row in a reference file. If you ever find yourself deciding "use gray" or "make it modern", stop; that is not a decision, it is a placeholder. Go get the real value from the deck.

Precedence, stated once: **the user's brief always wins.** Seeded picks spend only the freedom the brief leaves open.

## Step 0: mode check

Before anything else, confirm the skill is fully installed. If your host has a shell, run `sh <skill-root>/scripts/verify-install.sh` once: it confirms `SKILL.md` and the seven required reference decks are present and non-empty, and exits 1 with `INCOMPLETE INSTALL: <file> not found` if any is missing. (The `references/` folder also holds an optional blind-read prompt and a maintainer-only genome-sources file; those are not required to run.) With no shell, verify lazily: at Step 3c, if a reference deck you need cannot be read, STOP and report `INCOMPLETE INSTALL: <filename> not found`. Never reconstruct a missing deck row from memory; a partial install that invents rows recreates the exact model-authored distribution this skill exists to escape.

Then the mode check:

1. **Existing design system?** If the repo has one (design tokens, a themed Tailwind config, a component library with its own look, brand guidelines), your job is faithful extension, not reinvention. Skip Steps 2-3, translate everything you build into the existing tokens, and still apply Step 4's craft rules and the Step 5 QA gate. In this mode no DIRECTION LOCK exists: at the QA gate, skip Phase 1 axis 6 (Variety) and Phase 2's stated-macrostructure check, compare renders against the existing system's tokens, stamp the stylesheet `/* goddesign | extension of existing system */`, and write no `.design-log.json` entry.
2. **Brief names an aesthetic?** If the user specified a look ("make it feel like a 70s print ad", "match our brand navy"), that IS the direction. Skip the seeded direction pick; still run the seed for the macrostructure, and still lock tokens in Step 4a's DIRECTION LOCK format.
3. Otherwise, continue to Step 1.

## Step 1: identify your lane

Read both lanes; apply the one that matches you. Both lanes run the same Steps 2-5.

**DIVERGE lane** (Claude and other models with strong native design taste): your enemy is your own attractor basin. You cannot self-randomize; asked for a random choice you will pick the same "random" thing every time. So you must take the external seed's pick. The reroll rule: if your instinct quietly substitutes toward any banned attractor (Inter, Space Grotesk, purple-gradient-on-white, cream plus terracotta plus display serif, near-black plus lone acid green, a chaptered essay skeleton with numbered sections, mono typewriter kickers, gold-on-dark luxury, the unthemed kit look of slate/zinc neutrals with rounded 1px-border card grids, scroll-reveal entrances on every section), advance to the next row and say you did. A deck row the seed itself selected always stands, per the Banned list's "selects them deliberately" clause. Within the locked direction, execute with full commitment and your own taste; the seed constrains WHAT you pick, not how well you execute it. Steering override: when the brief says any form of "less AI", "not like Claude", or "make it look different", that is a forced reroll; the new lock must differ from your instinctive pick on BOTH display class and accent hue band, and you state that it does.

**EXPAND lane** (Codex, GPT models, and any model that executes literally; also the default when unsure): do not try to be creative, and do not soften the chosen direction toward what feels typical. Take the seeded row and execute it exactly: its hex values, its named fonts and weights, its import line, its radius, its motion numbers. The Step 3d jitter is part of those values: apply it in the lock, then execute the jittered values exactly. Never blend rows. When an image tool is available, use comp-first mode (references/imagery.md): generate one lock-derived mockup and replicate it; executing a visual spec is this lane's proven strength, inventing one is its proven weakness. Complete the entire DIRECTION LOCK before writing any code, and restate the locked tokens as a comment at the top of the stylesheet you emit, so they survive a long session. Enumerate the full deliverable up front (pages, sections, breakpoints, states) and build all of it; do not silently trim scope. Know this lane's three failure symptoms and check for them at the gate: the placeholder floor (browser-default link blue, unstyled buttons, a silent Times fallback, missing hover states), template snap-back (drifting mid-build toward one recycled Bootstrap-grade layout regardless of instructions; re-read the stylesheet comment against the lock after building), and architecture instead of pixels (a static page or component ships as markup plus tokens plus one stylesheet; no factories, wrapper layers, or config indirection).

## Step 2: context gate

Pin four things in one short paragraph before designing. Invent confidently where the brief is silent, state your inferences in one sentence, and proceed; do not stall on questions.

- **Subject**: what is this product, concretely?
- **Audience**: who is squinting at it?
- **The one action** the page must drive.
- **Tone**, chosen from extremes: editorial, brutalist, soft, utilitarian, luxurious, playful, technical, cinematic. "Clean and modern" is not a tone; it is the absence of one.

Unfamiliar subject? One quick web search for the domain's own vernacular (tool names, units, process words) sharpens the copy; specificity is an anti-slop lever. Never search for design inspiration or "best X sites": the deck is the reference, and searching aesthetics re-converges you on the popular median.

## Step 3: the variance engine

### 3a. Read the ledger

If `.design-log.json` exists at the project root, read it. Also read `~/.design-log.json` (the user-level ledger) if it exists; it tracks runs across ALL projects, because the person reviewing the work sees every project and recognizes repeats the per-project ledger cannot. Constraints for this run, applied against BOTH ledgers' recent entries:
- The macrostructure must not match any of the last 3 entries.
- The direction must differ from the previous entry on at least one of: paper band (dark, mid, light), display type class (serif, grotesque, mono, slab, display), accent hue band (warm 10-60, cool 200-300, neutral, other).
- Additionally, against the user-level ledger only: if the last 2 entries share an accent hue band or a paper band, this run must not make it 3 in a row; advance the offending index until it differs.

State the rotation in plain text: "Last runs: Workbench, Marquee Hero, Letter. Picking from the rest."

### 3b. Roll the seed

Run this (works in bash and zsh):

```sh
SEED=$(printf '%s' "$(basename "$PWD")$(date +%Y%m%d%H%M)" | cksum | cut -d' ' -f1)
echo "seed=$SEED direction=$((SEED % 17)) structure=$((SEED / 29 % 12)) palette=$((SEED / 7 % 10)) typepair=$((SEED / 13 % 12)) jitterh=$((SEED / 37 % 25 - 12)) jitterl=$((SEED / 43 % 3 - 1)) jitterr=$((SEED / 47 % 3 - 1))"
```

No shell available? Let N be the character count of the user's brief plus today's day of the month: direction = N % 17, structure = N % 12, palette = (N + 3) % 10, typepair = (N + 7) % 12, jitterh = (N % 25) - 12, jitterl = (N % 3) - 1, jitterr = ((N + 1) % 3) - 1.

### 3c. Resolve the picks

- `direction` indexes `references/directions.md` (17 rows). The row is a complete package: colors, fonts, imports, radius, shadows, background, signature element, motion. It is the default for everything.
- `structure` indexes `references/layouts.md` (12 macrostructures). This decides what the page IS.
- `palette` (10 rows in `references/palettes.md`) and `typepair` (12 rows in `references/fonts.md`) are the REMIX indices. Use them only when: the brief constrains the direction's colors or type (brand color exists), the ledger rules disqualify part of the row, a reroll landed you somewhere the brief cannot support, or the Step 2 audience-and-tone verdict contradicts the row's mood (a warm approachable audience under a cold dramatic row is a brief constraint like any other; remix by index and say so, do not freestyle). Swapping is fine; blending three palettes is not.
- Conflicts with the ledger or brief: advance the offending index by 1 (mod its deck size) until legal, and say so.

Read `references/directions.md` and `references/layouts.md` now; read `references/palettes.md` or `references/fonts.md` only if you are remixing. If any reference file you need cannot be read, stop with `INCOMPLETE INSTALL: <filename> not found` (Step 0 preflight) and do not reconstruct its rows from memory.

### 3d. Jitter the lock (population-scale uniqueness)

The deck rows are archetypes, not final values: two projects landing on the same row must not ship identical hexes, or the row itself becomes the next recognizable tell. Apply the three jitter numbers from the seed roll to the row before writing the lock, using the deck's own relative-color idiom:

- Accent hue: `--accent: oklch(from #ROWHEX l c calc(h + jitterh))`, jitterh in degrees (-12 to 12).
- Paper: bg and surface each get `oklch(from #ROWHEX calc(l + jitterl * 0.01) c h)`.
- Radius: the row's radius plus jitterr * 2px, floored at 0; rows that state radius 0 keep 0, flatness is their identity.
- Never jitter: text and muted colors (their contrast is tuned), fonts, imports, structure, signature, motion.
- Skip jitter entirely in extension mode and wherever the brief pins a brand value; say so in the lock.
- The lock and the ledger record post-jitter values, and the contrast gates apply to what actually renders.

## Step 4: DIRECTION LOCK, then build

### 4a. Write the lock

Before any code, output this block in plain text. This is the accountability step: picking on the page, not in your head.

```
DIRECTION LOCK
Seed: 2214070812 | Structure: 5 Manifesto | Direction: 12 Neo-Grotesque Poster
Rotation: differs from last run on paper band + display class
Tokens: --bg #EDEDEB | --surface #E2E2DF | --text #0F0F10 | --muted #5F5F63 | --accent #2B4BFF
Jitter: h+8 L+0.01 r+0 | --accent: oklch(from #2B4BFF l c calc(h + 8)) | bg/surface L+0.01
Type: Anton 400 display / Hanken Grotesk 400 body / Hanken Grotesk 600 caps labels
Layout: declarative sentences at 12vw are the page; details in small type between them
  +--------------------------------+
  | WE MAKE                        |
  | SLOW SOFTWARE   [detail col]   |
  | ...                            |
Signature: the word "SLOW" crops off the right viewport edge
Grammar: manifesto band runs full-bleed | pricing opens on a bare claim, no eyebrow | 5 features on 2 cols, fifth spans | paddings 48/96/160
Motion: one marquee 30s linear; hovers 180ms; nothing else
```

### 4b. Anti-cliche critique

One paragraph: imagine the generic output an unskilled AI would produce for this same brief. Name three things it would do. Confirm your lock shares none of them. If it shares any, fix the lock now. Second-order check: the "tasteful" cream-serif-terracotta look is itself now a cliche; if your lock resembles it and the seed did not select it, reroll.

Subject test (the direction supplies the form; the subject must supply the matter): strip the copy in your head and ask whether the visuals alone say what world this product lives in. The signature element and at least one supporting motif must be artifacts of the subject's world (its documents, tools, instruments, readouts, marks) drawn in the locked direction's formal language: a ledger's red margin rule as a Swiss rule, a kiln readout as a mono spec block, a boarding pass as a bento panel. A signature that could ship on any product in any industry is decoration, not a signature; replace it before building. Show the product working somewhere on the page: one concrete artifact of use beats a paragraph of assertion.

### 4c. Build rules

- All colors and fonts as CSS custom properties in `:root`; components reference tokens only, never inline hex.
- CSS hygiene: zero `!important` (the prefers-reduced-motion kill switch is the one exception), zero inline `style` attributes; each hex value appears exactly once, in `:root`; fix layout by restructuring markup, never with pseudo-element patches or absolute-position hacks. Pasting the same declaration block twice means extract a class.
- Webfonts load via the direction's import line. "Single file" or "self-contained" does NOT mean skip webfonts; only a hard offline requirement does, and then state the fallback stack.
- Use modern CSS by default: `clamp()` type scales, grid with named areas, `oklch()` and `color-mix()`, container queries where components reflow, `text-wrap: balance` on headings and `text-wrap: pretty` on body, `:focus-visible`, `overflow-x: clip`, native dialog/popover for overlays (never position:absolute inside overflow:hidden).
- Every interactive element ships default, hover, focus-visible, active, and disabled states; anything data-driven ships empty, error, and loading states.
- Grammar breaks, mandatory and declared in the lock: forensics on real production pages shows the deepest tell is not any style but the grammar every AI page shares (one container, evenly-padded bands, the same section-opening ritual, everything symmetrized and equally polished). Every page must break that grammar in at least four declared ways: (a) one band escapes the master container (full-bleed asset, negative-margin overlap of 64px+, or a second container width differing 25%+); (b) one section ships with NO heading ceremony: a bare claim, artifact, or image carries it alone; (c) one grid holds an orphan or spanning cell, or columns of visibly unequal height left unequal (never min-height-equalize list rows); (d) section content lengths vary like real content: the shortest section well under half the longest. Write the breaks into the lock's Grammar line and vary section openers page-wide: no opening ritual repeats more than twice in a row.
- Conception map, optional: a single page may be conceived through more than one avenue: a raster or SVG comp for the hero, artifact-first for a product section, a human-genome grammar for a utility band, copy-first for a manifesto block. Declare the map in the lock (which sections come from which avenue; three avenues maximum) and let the seams show as mode changes, which is how human pages read. The hard rule: mixed conception, never mixed identity: every avenue executes the SAME lock (one palette, one type system, one direction). Different sources of imagination, one design.
- Atmosphere layer, mandatory: the locked row's Background line is ground treatment, not optional decoration, and it is exempt from the one-signature budget. Execute it as a real depth system: the row's stated texture or pattern actually visible, at least one element that overlaps a boundary or sits at real depth (offset, stack, tilt, layer), and surface variation between sections beyond swapping two near-identical neutrals. A page of flat solid bands containing rectangular panels reads as a wireframe wearing a palette; validation showed exactly this losing on appeal every time. Restraint still governs flourishes and motion; it does not authorize shipping a schematic.
- Read `references/motion.md` before writing any animation; it has the budgets and copy-paste recipes.
- Real content over lorem ipsum; when you must placeholder, label it as placeholder. Never invent metrics, testimonials, logos, or company names.
- Imagery: when the macrostructure or direction calls for an image and pixels are needed, read `references/imagery.md` and generate via `scripts/genimage.sh`; the prompt derives from the DIRECTION LOCK and is written into it. Works from any host by delegating to an installed image-capable CLI (Codex has built-in generation). The capability is not a mandate: most runs ship zero raster images, and generating one the structure never asked for is a Restraint failure. No tool available: the row's CSS/SVG art direction is the fallback, never a stock-photo cliche.

### 4d. Craft floor (non-negotiable numbers)

- **Type**: scale ratio 1.2 (dense UI), 1.25 (marketing), 1.333-1.5 (display-led). Body 16-18px, never under 15. Line-height 1.5-1.6 body, 1.1-1.2 display. Measure 45-75ch. Max 3 families. Weight contrast via extremes (300 vs 800, not 400 vs 600). Display letter-spacing down to -0.04em; all-caps labels +5-12% tracking. Micro-labels and kickers come from the body family via weight, case, and tracking; a mono utility face only where the locked direction states one. Hero clamp ceiling 6rem, unless the locked direction or macrostructure specifies vw-scale display type (8-20vw); that stated range then wins and is the ceiling you state for the hero.
- **Spacing**: only token-scale values (4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160), except the grammar breaks declared in the lock. Space within a group smaller than space between groups. Section vertical padding must take at least 3 distinct values per page with the largest at least 2x the smallest; a single global `section { padding }` rule stamping one value on every band is the metronome tell and is banned. Prefer gap over margins. A direction row marked dense or airy overrides this scale; its stated values become the declared scale for the QA gate.
- **Color**: 60-30-10 dominance; accent under 5% of any viewport, on interactive and state elements only. Contrast 4.5:1 body, 3:1 large text and UI boundaries. No pure #000/#FFF bases. Neutrals tinted toward the brand hue (chroma 0.005-0.015). Dark mode: raise surface lightness for elevation, desaturate accents 20-30%, no black.
- **Shadows**: one light source per page, 2:1 vertical-to-horizontal offset, layered steps (1/2/4/8/16px at about 0.07 opacity each), tinted toward the background hue. Child radius never exceeds parent radius.
- **A11y floor**: `:focus-visible` 2px outline, never removed; targets 24px minimum (44px mobile); status never color-only; semantic heading order; alt text or aria-hidden on decorative art; honor `prefers-reduced-motion`.
- **UX writing**: labels say what happens ("Save changes", not "Submit"); errors explain and offer the fix; empty states invite one action; sentence case; no em dashes in UI copy.
- **Restraint**: one signature element per page. Concentrate boldness in one place and keep everything around it quiet. Before shipping, remove one thing. More animation makes work look MORE AI-generated, not less.

## Banned (each with its replacement)

- Inter, Roboto, Arial, Open Sans, Lato, Poppins, or a system stack as a chosen face. INSTEAD: the direction row's fonts, or a `fonts.md` pairing.
- Space Grotesk as display. INSTEAD: it may serve as body only under pairing 6.
- Indigo-violet gradients on any ground (#6366F1, #7C3AED, #8B5CF6 family), cyan-magenta washes, gradient text via background-clip, purple-tinted drop shadows. INSTEAD: the direction's palette; if you want energy, one saturated accent on a quiet field.
- The cream #F4F1EA + terracotta + display-serif reflex, and near-black + lone acid green. INSTEAD: only when the seed or brief selects them deliberately.
- Hero followed by three equal rounded cards, then testimonials, then CTA. INSTEAD: the seeded macrostructure.
- Cards inside the hero; nested cards; container soup. INSTEAD: hero budget (one composition); whitespace and rules for grouping.
- The unthemed kit look: untinted slate/zinc/gray neutral ramps, grids of rounded cards with 1px borders, decorative abstract SVG blobs, icons sprinkled on non-interactive elements. INSTEAD: neutrals tinted per the craft floor; radius and border weight from the locked direction row; at most one card grid per page; icons only on interactive or status elements.
- Colored side-stripe borders as accent; eyebrow kickers on every section; 01/02/03 numbering on non-sequential content. INSTEAD: accent on interactive elements; eyebrows on at most 1 section in 3.
- Numbered chapter cadence: 01/02/03 section labels, book-style contents rails, chapter headers, hr dividers between uniform essay sections. INSTEAD: the macrostructure's own wayfinding; transitions via background shifts, density changes, or a full-bleed moment; numbers only for steps the user performs in order.
- Mono or typewriter micro-labels (tiny mono kickers, dates, tags offsetting display type), and JetBrains Mono or any mono as body or display face; both are recognized fingerprints. INSTEAD: labels in the body family with weight, case, and tracking contrast; mono faces only where the locked direction states one.
- Gold, brass, or bronze as shorthand for premium, especially on dark backgrounds. INSTEAD: luxury through space, restraint, and type quality; metallics only in the Art Deco row.
- Decorative marker underlines and hand-drawn squiggles beneath headings. INSTEAD: let scale and weight carry emphasis; flourishes only as a direction's stated signature.
- Glassmorphism, decorative sparklines, fake browser/phone chrome, emoji as icons, mixed icon sets. INSTEAD: one real icon set (Lucide, Heroicons, Phosphor), real UI, or nothing.
- `transition: all`, uniform hover scale-ups, bounce easing (outside a direction that specifies it), scroll-reveal entrances cascading across every section, always-running ambient motion, confetti, animated focus rings. INSTEAD: motion.md budgets and recipes; scroll reveal on at most one element group per page.
- Weightless headline copy ("Build faster. Ship smarter."), unleash/elevate/seamless/next-gen, fabricated numbers and testimonials. INSTEAD: say the concrete thing the product does.
- The stock ornament kit: off-canvas radial glow blobs, duplicated-span marquee tickers, giant-stat bands with tiny mono labels, hatched or striped placeholder tiles, a full-accent CTA band before the footer, and a footer that mirrors the nav. At most ONE of these per page, and only when the locked row or macrostructure states it. INSTEAD: the row's stated background, signature, and wayfinding.
- An accent-colored span highlighting one word inside a headline (the recolored-phrase reflex). INSTEAD: headline emphasis through weight, width, size, or an italic cut; accent stays on interactive and state elements.

## Step 5: QA gate

When the build is complete, read `references/checklist.md` and run all three phases: the seven-axis self-critique (any score under 3 forces revision), the boolean gate sweep (report the pass count), and visual verification (the checklist ships a measured audit script plus a shell renderer chain to try before declaring `DEGRADED: no visual check`, and a bounded fix loop for what the audit names). Then persist the run: the CSS stamp comment and the `.design-log.json` entry, exactly as the checklist specifies.

A page that has not passed the gate is not done. If someone could glance at the result and say "AI made that" without doubt, it failed; go back to the weakest gate and fix it.

## Reference index

- `references/directions.md`: the 17-row direction deck (row 16 onward: human-genome rows derived from real human-built sites). Read at Step 3c.
- `references/layouts.md`: 12 macrostructures, hero budget, section and responsive rules. Read at Step 3c.
- `references/palettes.md`: 10 palette families, OKLCH ramp math, brand-hue adaptation. Read only when remixing colors.
- `references/fonts.md`: 12 pairings with safe import lines and availability warnings. Read only when remixing type.
- `references/motion.md`: budgets, easings, copy-paste recipes. Read at Step 4c before animating.
- `references/imagery.md`: generated-image art direction and the genimage delegation chain. Read only when the run needs pixels.
- `references/checklist.md`: the QA gate. Read at Step 5, not before.
- `references/blind-read.md`: the fixed prompt for the optional blind post-render critic (`scripts/blind-read.sh`). Read only if you run the blind read at Step 5's visual verification.
