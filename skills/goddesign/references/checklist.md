# QA Gate

Load this file only when the build is complete. Run all three phases. What decides done: Phase 2's boolean sweep and Phase 3's measured audit are the pass/fail gate. Phase 1 is advisory with mandatory evidence citations; it catches what booleans cannot, and its known weakness (you grade your own homework) is why it cannot pass or fail a run by itself. Report the results in your final message: cited scores, gate pass count, and any DEGRADED notes. Do not skip phases to save time; an unverified page is not done.

Host scope comes from the prompt. Run this gate on the active host by default. Use another host only when the user explicitly requests cross-host comparison, replication, or compatibility testing, or when a named maintainer protocol requires it. A missing second host never changes the design score or creates a `DEGRADED` note. If prompt-requested cross-host scope is unavailable, report that task-scope limitation separately from this gate.

Extension mode (Step 0 item 1: extending an existing design system; no DIRECTION LOCK exists): skip Phase 1 axis 6 and the Phase 2 stated-macrostructure gate; in Phase 3 compare the render against the existing system's tokens; in Persist, stamp the stylesheet `/* goddesign | extension of existing system */` and skip the `.design-log.json` entry.

## Phase 1: pre-emit self-critique (advisory, evidence-cited)

Score your build 1-5 on each of the seven axes. This phase is advisory: the same context that made every design choice now grades them, so a bare number proves nothing. Counter that mechanically: every score must cite the element, line, or screenshot region that earns it (a selector, a token, a pixel region). A score without a citation is recorded as 1. A cited score of 1 or 2 triggers one revision attempt at the cited spot, then you move on and report honestly; a cited score of 3+ you could defend to a skeptic stands.

1. **Philosophy**: does the page have one clear point of view a viewer could name?
2. **Hierarchy**: does the eye land on the single most important thing first?
3. **Execution**: are spacing, alignment, and states consistent to the token scale?
4. **Specificity**: could this design only belong to THIS product, or would it fit any product? Test: with the copy stripped, do the visuals alone identify the product's world, and does the page show the product working somewhere (an artifact of use, not just assertion)?
5. **Restraint**: is there exactly one signature risk, with everything around it quiet?
6. **Variety**: does it differ from this project's previous runs (check `.design-log.json`)?
7. **Credibility**: would a cautious first-time visitor trust this page with money or data? Controlled studies show trust and credibility are the dimensions where AI-built pages measurably lag human ones; the fix is real information stated plainly, never invented proof.

## Phase 2: boolean gate sweep

One testable assertion per line. Check each; count passes; fix fails or state why they stand.

Tokens
- [ ] Every color and font in components references a `:root` token; zero inline hex in component rules.
- [ ] No banned values anywhere. Grep case-insensitively: `#6366f1`, `#7c3aed`, `#8b5cf6`, `font-family: Inter`, `Space Grotesk` (outside pairing 6), `JetBrains Mono` (outside a direction that states it), `transition: all`, `background-clip: text`, `!important` (outside the reduced-motion kill switch), `style="` in markup and `style={{` in JSX, `border-left` used as a colored accent stripe, `<hr`, `Courier`.
- [ ] All spacing and font sizes sit on the declared scales; no orphan values like 13px or 27px (the grammar breaks declared in the lock are exempt).
- [ ] The Step 3d jitter is stated in the lock and present in the tokens (accent hue rotated, paper lightness nudged via relative color), or its skip reason is stated (extension mode, brand pin).

Typography
- [ ] At most 3 families; display face appears in at most 2 slot types.
- [ ] Labels and kickers use the body family (weight, case, tracking); a mono face appears only if the locked direction states one.
- [ ] Body measure 45-75ch; body size 16px+; display line-height 1.1-1.2; body 1.5-1.6.
- [ ] H1 renders in 3 lines or fewer at its stated max-width and clamp ceiling.
- [ ] Webfonts actually load (the import URL is present and correct), not silently falling back; when network is available, `curl -sI` the import URL and expect 200 (sandboxed with no network: state the skip).

Color
- [ ] Accent occupies at most about 5% of any viewport and appears only on interactive or state elements (a row that explicitly states full-coverage accent bands overrides this; verify the row states it).
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
- [ ] The page contains at least one structured artifact of the product working (a table, readout, ledger, document, queue, or state display, with plausible labeled demo data); a page of pure assertion fails this gate regardless of how beautiful its typography is.
- [ ] The atmosphere layer is perceptible in the render: the row's background treatment is visible (texture, pattern, vignette, duotone ground, or photographic band), at least one element overlaps a boundary or sits at real depth, and no section is a flat solid band containing only rectangular panels.

States
- [ ] Every interactive element has visible :focus-visible (2px outline, never removed), hover, active, and disabled.
- [ ] Empty, error, and loading states designed where data can be empty, fail, or load.
- [ ] Destructive actions require confirmation; status is never color-only.

Grammar (the anti-metronome sweep; each break must also be declared in the lock)
- [ ] Section vertical paddings take at least 3 distinct values, largest at least 2x smallest; no single global `section { padding }` rule.
- [ ] At least one band escapes the master container (full-bleed, negative-margin overlap 64px+, or a second container width differing 25%+).
- [ ] At least one section has no heading ceremony: no eyebrow, no label-heading-lead ritual; a bare claim, artifact, or image carries it.
- [ ] At least one grid has an orphan or spanning cell, or visibly unequal columns left unequal; no min-height equalization on list rows.
- [ ] At most 2 uppercase micro-labels outside the nav; no accent-colored span inside any h1 or h2; no section-opening ritual repeats more than twice in a row.
- [ ] At least 2 distinct hover grammars on the page; a translateY lift is at most one of them.
- [ ] At most one item from the stock ornament kit (glow blob, marquee ticker, stat band, hatched placeholder, full-accent CTA band, mirrored footer), and only if the locked row states it.

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
- [ ] If the brief supplied a reference (image, mockup, URL, existing screens), or the run generated its own comp (comp-first mode), the render was compared against it side by side; it matches on layout, spacing, and color, or the deviations are stated and justified.

Honesty and trust surface
- [ ] No invented metrics, fake testimonials, fake logos, or fake company names; placeholders labeled as placeholders.
- [ ] The trust surface exists: the page answers who is behind the product (a real about or credits line, never invented people), how to reach them (a working contact route), and the material terms of the offer (pricing terms, cancellation, data handling where the product implies them). Demo builds label these sample like all other data; real projects state them truthfully or the gate fails.
- [ ] Generated imagery (if any): its prompt is stated in the lock; it matches the locked palette on the rendered page; no text baked into images; alt text present; no generated people presented as customers, team, or testimonials; rasters over 200KB ship as sibling files, not base64.

## Phase 3: visual verification

Render the page and look at it. Screenshot at 375, 768, and 1280 and compare what you see against the DIRECTION LOCK tokens: if the rendered page's fonts, colors, or structure drift from the locked direction, the direction did not hold; fix it. Confirm the locked signature element is visible in the screenshots; a lock whose stated risk never rendered is a failed run, not a soft pass. Then inspect every screenshot for layout damage: overlapping or colliding text, clipped labels, elements escaping their containers, and blank bands where content should be (a scroll-reveal that never fired). These are exactly the defects that reading code cannot catch.

Before eyeballing, run the measured audit that ships with this skill (it also produces the screenshots). The script sits at `../scripts/audit.mjs` relative to this checklist; resolve the path from wherever you read the skill:

`node <skill-root>/scripts/audit.mjs index.html`

For a dynamic application served locally, pass its HTTP URL instead:
`node <skill-root>/scripts/audit.mjs http://localhost:3000/`.

It reports horizontal overflow, text-on-text collisions, text hidden at effective opacity 0 (the reveal bug), sub-24px interactive targets, and webfonts that silently fell back, as JSON per viewport. Exit 0 green, 1 named failures, 2 unavailable.

Self-correction loop, bounded: on exit 1, fix ONLY the named failures. The DIRECTION LOCK is frozen during this loop: no changing direction, palette, type, or structure to make a failure go away. Re-run the audit after each fix. Stop at green or after 3 cycles, and report any residual failures honestly in your final message. On exit 2, fall back to the renderer chain below.

Blind read, default when tooling exists (advisory verdict, mandatory attempt). The measured audit checks whether the page is broken; it says nothing about whether the page's identity lands, and Phase 1's self-critique is written by the context holding the answer key. So when an image-capable CLI is present (Codex or Claude Code), the blind read is the default, not an option: run `sh <skill-root>/scripts/blind-read.sh shot-1280.png shot-375.png` on the screenshots the audit produced, and skip it only with a stated reason (no image CLI, sandbox block), recorded as `DEGRADED: no blind read (<reason>)`. It shows a fresh process ONLY the pixels, never your code or your DIRECTION LOCK, and returns the page's reconstructed structure, paper band, display class, accent band, signature, subject, and one AI tell as JSON (prompt in `references/blind-read.md`). It runs from an isolated temp directory on anonymized copies of the screenshots, so it sees pixels only: no code, no lock, no repo rules, no method-revealing filenames. Compare the reconstruction against the lock: if the blind reader names a different subject than you locked, misses your signature, or returns `identity` "weak", that is a strong signal your Specificity is not landing even though the page renders; revisit Phase 1 axis 4 and decide whether to fix. The verdict stays advisory, not an automatic gate failure: calibration (`validation/experiments/blind-read-calibration-2026-07/README.md`) showed the reader recovers subject and signature reliably but does not rank good pages against each other, so a clean recovery is necessary, not sufficient, and a mismatch is a prompt to reconsider, not a verdict. Exit 2 prints `DEGRADED: no blind read`; then rely on your own Phase 3 inspection, with no penalty. Never feed the lock or the code into the blind read; its whole value is that it did not see them.

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
2. `.design-log.json` at the project root is one JSON array of entry objects, newest last. Read it (treat a missing or unparseable file as `[]`), push this run's entry, keep only the last 20, and rewrite the whole file. Append the same entry to `~/.design-log.json` (the user-level cross-project ledger, same format, keep last 40) so rotation holds across projects, not just within one. Entry shape:

```json
{ "date": "<YYYY-MM-DD>", "structure": "<name>", "direction": "<name>", "paper": "dark|mid|light", "display": "serif|grotesque|mono|slab|display", "accent_hue_deg": "<0-359 or null>" }
```

`accent_hue_deg` is the accent's OKLCH hue in degrees, written as a number; write null when the accent is neutral (chroma below 0.02), so the neutral hue band in SKILL.md Step 3a stays recoverable from the ledger.
