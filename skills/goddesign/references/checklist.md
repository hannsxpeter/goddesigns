# QA Gate

Load this file only when the build is complete. Run all three phases. Report the results in your final message: scores, gate pass count, and any DEGRADED notes. Do not skip phases to save time; an unverified page is not done.

Extension mode (Step 0 item 1: extending an existing design system; no DIRECTION LOCK exists): skip Phase 1 axis 6 and the Phase 2 stated-macrostructure gate; in Phase 3 compare the render against the existing system's tokens; in Persist, stamp the stylesheet `/* goddesign | extension of existing system */` and skip the `.design-log.json` entry.

## Phase 1: pre-emit self-critique (before declaring done)

Score your build 1-5 on each axis. Any score below 3 forces a revision pass before you continue.

1. **Philosophy**: does the page have one clear point of view a viewer could name?
2. **Hierarchy**: does the eye land on the single most important thing first?
3. **Execution**: are spacing, alignment, and states consistent to the token scale?
4. **Specificity**: could this design only belong to THIS product, or would it fit any product?
5. **Restraint**: is there exactly one signature risk, with everything around it quiet?
6. **Variety**: does it differ from this project's previous runs (check `.design-log.json`)?

## Phase 2: boolean gate sweep

One testable assertion per line. Check each; count passes; fix fails or state why they stand.

Tokens
- [ ] Every color and font in components references a `:root` token; zero inline hex in component rules.
- [ ] No banned values anywhere. Grep case-insensitively: `#6366f1`, `#7c3aed`, `#8b5cf6`, `font-family: Inter`, `Space Grotesk` (outside pairing 6), `JetBrains Mono` (outside a direction that states it), `transition: all`, `background-clip: text`, `!important` (outside the reduced-motion kill switch), `style="` in markup and `style={{` in JSX, `border-left` used as a colored accent stripe, `<hr`, `Courier`.
- [ ] All spacing and font sizes sit on the declared scales; no orphan values like 13px or 27px.
- [ ] The Step 3d jitter is stated in the lock and present in the tokens (accent hue rotated, paper lightness nudged via relative color), or its skip reason is stated (extension mode, brand pin).

Typography
- [ ] At most 3 families; display face appears in at most 2 slot types.
- [ ] Labels and kickers use the body family (weight, case, tracking); a mono face appears only if the locked direction states one.
- [ ] Body measure 45-75ch; body size 16px+; display line-height 1.1-1.2; body 1.5-1.6.
- [ ] H1 renders in 3 lines or fewer at its stated max-width and clamp ceiling.
- [ ] Webfonts actually load (the import URL is present and correct), not silently falling back; when network is available, `curl -sI` the import URL and expect 200 (sandboxed with no network: state the skip).

Color
- [ ] Accent occupies at most about 5% of any viewport and appears only on interactive or state elements.
- [ ] Contrast: 4.5:1 body, 3:1 large text and UI boundaries and focus rings.
- [ ] No pure #000/#FFF page background; neutrals carry 0.005+ chroma (row hexes and their Step 3d jittered derivatives are exempt); dark surfaces are not black.
- [ ] No gold, brass, or bronze premium shorthand; metallics only when the locked row states them.

Layout
- [ ] First viewport is one composition within the hero budget (no cards, badges, or stat chips in the hero).
- [ ] Not the banned skeleton (hero, three equal cards, testimonials, CTA) unless the brief demanded it.
- [ ] No nested cards, no container soup; eyebrow count within 1 per 3 sections.
- [ ] No numbered chapter cadence, contents rails, or hr dividers; sections transition by background or density shifts.
- [ ] At most one card grid per page; card radius and border weight come from the locked direction row, not kit defaults; no decorative abstract blobs unless the locked row states one.
- [ ] The stated macrostructure is recognizable on the rendered page.

States
- [ ] Every interactive element has visible :focus-visible (2px outline, never removed), hover, active, and disabled.
- [ ] Empty, error, and loading states designed where data can be empty, fail, or load.
- [ ] Destructive actions require confirmation; status is never color-only.

Motion
- [ ] At most 3 intentional motions; transform/opacity only; budgets respected.
- [ ] Scroll-triggered entrances on at most one element group; no reveal cascade across sections; no always-running ambient motion outside the one budgeted signature.
- [ ] No content hidden at opacity 0 pending an observer without the `html.js` guard and reveal timeout; the page renders complete with JS disabled and in a full-page capture.
- [ ] `prefers-reduced-motion` honored.

Responsive
- [ ] No horizontal scroll 320-1920px; verified at 375, 768, 1280.
- [ ] Touch targets 44px+ on mobile; inputs 16px+ font-size.

Brief
- [ ] The brief re-read as a checklist: every requested page, section, state, and behavior exists in the build; nothing silently trimmed.
- [ ] If the brief supplied a reference (image, mockup, URL, existing screens), the render was compared against it side by side; it matches on layout, spacing, and color, or the deviations are stated and justified.

Honesty
- [ ] No invented metrics, fake testimonials, fake logos, or fake company names; placeholders labeled as placeholders.
- [ ] Generated imagery (if any): its prompt is stated in the lock; it matches the locked palette on the rendered page; no text baked into images; alt text present; no generated people presented as customers, team, or testimonials; rasters over 200KB ship as sibling files, not base64.

## Phase 3: visual verification

Render the page and look at it. Screenshot at 375, 768, and 1280 and compare what you see against the DIRECTION LOCK tokens: if the rendered page's fonts, colors, or structure drift from the locked direction, the direction did not hold; fix it. Confirm the locked signature element is visible in the screenshots; a lock whose stated risk never rendered is a failed run, not a soft pass. Then inspect every screenshot for layout damage: overlapping or colliding text, clipped labels, elements escaping their containers, and blank bands where content should be (a scroll-reveal that never fired). These are exactly the defects that reading code cannot catch.

Before eyeballing, run the measured audit that ships with this skill (it also produces the screenshots). The script sits at `../scripts/audit.mjs` relative to this checklist; resolve the path from wherever you read the skill:

`node <skill-root>/scripts/audit.mjs index.html`

It reports horizontal overflow, text-on-text collisions, text hidden at effective opacity 0 (the reveal bug), sub-24px interactive targets, and webfonts that silently fell back, as JSON per viewport. Exit 0 green, 1 named failures, 2 unavailable.

Self-correction loop, bounded: on exit 1, fix ONLY the named failures. The DIRECTION LOCK is frozen during this loop: no changing direction, palette, type, or structure to make a failure go away. Re-run the audit after each fix. Stop at green or after 3 cycles, and report any residual failures honestly in your final message. On exit 2, fall back to the renderer chain below.

No browser tool and no audit script? Try the shell renderer chain before giving up, in order, from the project directory (repeat each at 375x812, 768x1024, 1280x900):

1. `playwright screenshot --viewport-size=1280,900 --full-page file://$PWD/index.html shot-1280.png`
2. `npx playwright screenshot` with the same arguments, if the bare CLI is missing
3. `chrome --headless=new --window-size=1280,900 --screenshot=shot-1280.png file://$PWD/index.html` (also try `chromium`, `google-chrome`)

Open the produced images with your host's image-reading capability and run the same inspection.

Only when every rung fails (no binary, or the sandbox blocks browser spawn) state exactly: `DEGRADED: no visual check` in your final message, name the command that failed and why, and print the exact renderer command an operator can run afterward. Also write that command into `./audit-handoff.sh` and mark it executable, so operators and wrappers can pick it up mechanically. (Operators: `scripts/codex-audit-loop.sh` next to the audit script automates the whole handoff for sandboxed Codex, auditing outside the sandbox and feeding failures back into the session.) Then re-read the emitted CSS top-to-bottom against the lock instead. In the EXPAND lane, a DEGRADED run must additionally re-check the emitted code against every Banned list item, because literal-execution models snap back to their default template when unwatched.

## Acceptance line

If someone could glance at this and say "AI made that" without doubt, it failed. Then apply the second-order check: the predictable tasteful alternative (cream background, display serif, terracotta accent) is also slop now. If your page matches that description and the seed did not choose it, redo the divergence step.

## Persist the run

1. First line of the main stylesheet: `/* goddesign | structure: <name> | direction: <name> | accent: <hue> */`
2. `.design-log.json` at the project root is one JSON array of entry objects, newest last. Read it (treat a missing or unparseable file as `[]`), push this run's entry, keep only the last 20, and rewrite the whole file. Entry shape:

```json
{ "date": "<YYYY-MM-DD>", "structure": "<name>", "direction": "<name>", "paper": "dark|mid|light", "display": "serif|grotesque|mono|slab|display", "accent_hue_deg": "<0-359 or null>" }
```

`accent_hue_deg` is the accent's OKLCH hue in degrees, written as a number; write null when the accent is neutral (chroma below 0.02), so the neutral hue band in SKILL.md Step 3a stays recoverable from the ledger.
