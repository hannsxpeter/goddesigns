# External evaluation: three public design skills, 2026-07-31

Three published frontend-design skills for coding agents were read in full against goddesign and its gate. All three were evaluated at the commits below; versions and licences are recorded because attribution depends on them.

| Source | What it is | Licence | Read at |
|---|---|---|---|
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | One skill, 23 sub-commands, a live browser iteration mode, and a standalone CLI that runs 59 deterministic detector rules with no model and no API key | Apache 2.0, Paul Bakaus | package 3.5.0, skill 4.0.4, `3293081` (2026-07-30) |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | A plugin bundling six skills (brand, design-system, design, slides, ui-styling, banner-design) over a searchable local database: 84 UI styles, 192 palettes, 74 font pairings, 22 stacks, plus token generators and token validators | MIT, Next Level Builder | 2.11.0, `ec1f2a9` (2026-07-31) |
| [amaancoderx/npxskillui](https://github.com/amaancoderx/npxskillui) (`skillui`) | A CLI that reverse-engineers a design system out of a URL, a git repo, or a local directory by pure static analysis, and writes it out as tokens, references, and a skill | MIT, Amaan | 1.3.4, `bc913a8` (2026-05-08) |

The three sit at different distances from goddesign, and the distance is what decided each borrow. impeccable is the nearest neighbour: same problem, same two failure modes, a large overlapping ban list, and a different answer to who checks the work. ui-ux-pro-max is a catalogue skill: it answers "what should this look like" by lookup, which is the mechanism goddesign exists to avoid. skillui is not a design skill at all; it is an extractor, and that is exactly why it had something goddesign lacked.

## The hole all three exposed

goddesign's QA gate has three phases. Phase 1 is advisory by construction. Phase 3 is measured by `scripts/audit.mjs`, which needs Playwright and a browser and exits 2 when it cannot get one. Phase 2, the boolean sweep, is the pass/fail half that is supposed to hold in every environment, and until this release **every one of its 40-plus assertions was executed by the model that had just written the code**, including the ones written as literal greps ("Grep case-insensitively: `#6366f1`, `#7c3aed`, `#8b5cf6`, `font-family: Inter` ...").

Two consequences follow from rules already in the skill rather than from anything the three sources say:

1. **In a sandbox the gate has no objective half at all.** `audit.mjs` documents exit 2 for a blocked browser spawn, and `scripts/codex-audit-loop.sh` exists precisely because sandboxed Codex hits it. On that path Phase 3 degrades to `DEGRADED: no visual check` and Phase 2 is self-report, so a run can be declared gate-passing with nothing mechanical behind it.
2. **The EXPAND lane's named failure symptoms are exactly the greppable ones.** That lane warns about the placeholder floor (link blue, unstyled buttons, a silent Times fallback) and template snap-back, then tells the model to "re-read the stylesheet comment against the lock after building". A literal-execution model self-checking for literal-execution failure is the weakest possible arrangement, and the checklist already says as much about Phase 1.

impeccable proves the fix is available: its detector runs the same class of rules with no LLM, no API key, and no browser, from a CLI and from an edit-time hook. Nothing in goddesign's design forbids that; it simply had not been built.

## What was borrowed

### From impeccable: the deterministic detector, as `scripts/sweep.mjs`

Three mechanisms transfer, and only mechanisms.

1. **The greppable half of the gate belongs to a script.** `sweep.mjs` reads source only (`.html`, `.css`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`), needs no browser, no network, no model, and no dependency, and reports 29 rules with file, line, and the offending value. Exit 0 green, 1 named failures, 2 nothing scannable.
2. **Severity is split.** A rule is `fail` or `advisory`. Advisory findings are reported and never fail the gate, because each has a legal case a script cannot read: a mono face in the slot a direction row states, a spacing value that is one of the grammar breaks declared in the lock, an ornament the locked row names. impeccable derives its advisory set from the rule registry; goddesign does the same from its rule table.
3. **Waivers are inline, file-scoped, and must state a reason.** goddesign's rules have more legal exceptions than most lint rules, because half of them are "banned unless the seed or the brief selected it deliberately". Without an escape hatch the script would be gamed or ignored; without a mandatory reason the hatch would be used silently. So `/* goddesign-allow: metallic-premium the Art Deco row is the one row that states metallics */` waives that rule for that file, and a waiver with a reason under 8 characters is itself reported as `waiver-without-reason`.

Every rule in the sweep is drawn from goddesign's own Banned list, craft floor, and checklist. None was imported from impeccable's registry: the two lists overlap heavily on the public tells (overused faces, purple gradients, gradient text, side-tab borders, cream defaults, buzzwords) because both trace to the same public complaints, but goddesign admits a tell only through the evidence bar in `CONTRIBUTING.md`, and importing another project's rule set would route around it. Where the two disagree, goddesign's own rule won: it bans mono microlabels outright and metallics outside one row, neither of which impeccable flags; impeccable flags kickers, oversized H1s, and hairline-plus-shadow, which goddesign covers in prose and gate assertions the sweep does not yet measure.

### From skillui: measured token extraction, as `scripts/extract-tokens.mjs`

goddesign has two places where token facts were established by eye, and both violate the skill's own rule that every decision resolves to a number, a hex, or a named row:

- **Extension mode.** Step 0 item 1 sends a repo that already has a design system into faithful extension, and the gate says to "compare renders against the existing system's tokens". Nothing produced that list.
- **The genome lane.** `CONTRIBUTING.md` asks a contributor to extract a real site's type system, palette, radius, grammar, and density "every field as values, never adjectives". The measured half of that was manual.

skillui does exactly this extraction, deterministically, by static analysis. `extract-tokens.mjs` takes the local-static half: it reads W3C design-token JSON (including the `tokens/*.json` skillui itself emits), CSS custom properties, `@theme` blocks, Tailwind config, and `@font-face` and import declarations, then reports resolved roles (bg, surface, text, muted, accent, border), fonts, radii, spacing, imports, and the palette by frequency. Exit 2 is a real answer, not an error: `NO DESIGN SYSTEM FOUND` means this is not extension mode, so roll the seed and take the full path.

Role inference is the part that had to be goddesign-native. skillui infers roles for its own DESIGN.md; goddesign needs them in the five slots the DIRECTION LOCK uses, so the extractor prints a `Tokens:` line in lock format and names any role it could not resolve rather than guessing one. An unresolved role is reported as unresolved, because "use gray" is the failure this whole skill is built against.

### From ui-ux-pro-max: token conformance as a gate, folded into `--tokens`

ui-ux-pro-max ships validators (`validate-tokens.cjs`, `html-token-validator.py`, `slide-token-validator.py`) whose job is to prove generated markup uses only values the design system declares. That is goddesign's extension-mode gate stated as a check instead of as a comparison done by eye. It ships as one flag rather than a second script: `sweep.mjs <build> --tokens .design-tokens.json` reports every hex, font, and radius the build introduced that the baseline does not have, as `token-drift`. The extractor produces the baseline, so the two borrows compose into one loop.

## What was declined, and why

**impeccable**

- **The 23-command surface** (`polish`, `bolder`, `quieter`, `distill`, `delight`, `overdrive`, and the rest). This is a different product shape: a design vocabulary you converse in across many sessions. goddesign is one skill that takes a brief and ships a gated page, and its multi-session answer is already the design map. Adding twenty verbs would add twenty routing decisions and no mechanism.
- **The four modes** (Persuade, Operate, Read, Experience). Genuinely good vocabulary, and declined as advice rather than mechanism: goddesign's Step 2 context gate already pins subject, audience, the one action, and a tone chosen from extremes, in one paragraph, and none of those four modes resolves to a number, a hex, or a named row.
- **Edit-time hooks.** impeccable installs provider-native hook manifests into `.claude/settings.local.json`, `.cursor/hooks.json`, `.codex/hooks.json`, and `.github/hooks/impeccable.json`. `docs/ARCHITECTURE.md` states that goddesign uses only `name` and `description` frontmatter and no host-specific syntax anywhere; four per-host manifests is that constraint abandoned. The sweep is a command any host can run instead.
- **Live browser mode.** A local server, a session store, framework adapters for Next, Nuxt, Astro, SvelteKit, TanStack Start, and Vite, and a manual-edit transaction log. Large, valuable, and dependent on a running network service, which core design work is documented not to require.
- **PRODUCT.md, DESIGN.md, and the config sidecar.** A persistent project-context layer with its own staleness detector and `doctor` repair command. goddesign's persistence is deliberately two files, `.design-log.json` and `.design-map.md`, and the stylesheet stamp; a third stateful artifact would need its own drift story before it earned a place.
- **Importing the 59-rule registry.** Rejected on the evidence bar, not on quality. A tell enters goddesign through three sourced public complaints or a defect reproduced in a validation run, and lands in three places by hand. Bulk-importing rules would put unsourced entries beside sourced ones and make the Banned list's `[fingerprint]` and `[craft]` tags meaningless.

**ui-ux-pro-max**

- **The catalogue: 84 styles, 192 palettes, 74 font pairings.** Declined as a direct contradiction of the variance engine's design. goddesign's decks are small on purpose and capped: no more than 2 rows per 30-degree accent hue band, no two rows sharing a paper band and an accent band, each depth language belonging to exactly one row, and `scripts/lint-decks.mjs` fails the build when a cap breaks. A 192-entry palette set cannot carry those caps, and rows without provenance cannot enter the human-genome lane at all.
- **The design system generator** (project requirements in, recommended pattern and section list out). This is the convergence engine goddesign exists to fight: a lookup from category to layout is how every AI landing page arrived at hero, three cards, testimonials, CTA. goddesign deliberately rolls a seed instead of recommending.
- **The shadcn-plus-Tailwind assumption.** `ui-styling` is built on a specific component library and utility framework. goddesign emits tokens and one stylesheet and stays framework-neutral.
- **The slides, banner, logo, and brand-identity skills.** Out of scope: not frontend UI.

**skillui**

- **The `--url` crawl and `--mode ultra`.** Fetching a live site, driving Playwright through a scroll journey, and capturing interaction diffs is the richer half, and it needs the network and a browser. goddesign takes the local-static half only, the same trade it took with wayfinder's markdown fallback. The URL path remains the documented way to source a genome from a live site, run by a contributor, outside a design run.
- **The `.skill` packaging and generated `CLAUDE.md`.** goddesign is one skill with one install path; a second generated skill format would fork it.
- **Its DESIGN.md output as an artifact.** The extractor emits a baseline JSON the gate consumes, not a document the model reads and paraphrases. A document would reintroduce the interpretation step the measurement exists to remove.

## Calibration, measured

Both scripts were run over the existing validation corpus. This is a false-positive and separation check, not a validation result: the corpus is author-run, and the sweep was written after these artifacts existed.

- **19 goddesign artifacts** (skill runs across kilnhouse, wayfare, ledgerbird, bandquarter, comp-first): 14 exit 0 with zero failures. Five carry findings, six failures in total. Every one was inspected and every one is a true positive against a rule the skill already had: two pages carry a numbered chapter cadence (`01`/`02`/`03` section labels) that the ban post-dates, one carries a raw hex in `.btn-primary:active` instead of a `:root` token, one carries an em dash in copy, and one band experiment carries a 3px colored left border on a `.slot` container plus only two distinct section paddings.
- **18 unskilled and frontend-design artifacts** from the same corpus: all 18 fail, between 6 and 70 failures each, median around 22. The rules that separate hardest are `no-stamp`, `hex-outside-root`, `inline-style`, `no-focus-visible`, and `reveal-cascade`, the last being the documented defect that rendered two baseline pages completely blank in static capture.

The separation itself is asserted in CI. `scripts/sweep.test.mjs` runs 19 tests on every push: the rule table's size and contents, the waiver contract (a reasoned waiver suppresses one rule in one file, a reasonless one is a failure and suppresses nothing), one test per fixed false positive, the extraction round trip, and the corpus split, which fails the build if any skill run reports more than two failures or any comparison run reports none.

Four false positives were found and fixed during calibration, and each fix is a rule the script now states rather than assumes: a `:root` block preceded by a comment read as a component rule; `&#8594;` read as a hex literal; a comment reading "the one allowed `!important` kill switch" read as an `!important`; and a mono face in a `--font-mono` slot read as body type. A fifth was narrowed rather than removed: a colored side border is reported only on a container (a container-shaped selector, or a rule that also paints padding or a ground), so a drawn rail or route line is not a card stripe.

## License and attribution

impeccable is Apache 2.0 (Paul Bakaus); ui-ux-pro-max is MIT (Copyright (c) 2024 Next Level Builder); skillui is MIT (Amaan). **No text, code, rule definition, prompt content, or data file was copied from any of the three.** `scripts/sweep.mjs` and `scripts/extract-tokens.mjs` are goddesign-native code implementing goddesign's own checklist and Banned list; what was taken is the diagnosis and three structural ideas (run the greppable rules deterministically, split severity, waive inline with a mandatory reason) plus the observation that token extraction can be static. If goddesign later copies text or code from any of these, retain the full licence notice for the copied portion beside the copied material and in a third-party notices file, and note that Apache 2.0 additionally requires stating the changes made.

## Weight and limitations

This is an evaluation and implementation record, not a validation result, and its weight is the same as `wayfinder-evaluation-2026-07.md`: a single-session read followed by implementation, not an adversarially filtered multi-agent investigation.

Two limits are worth stating plainly. First, the sweep was calibrated against a corpus that already existed, so its 14-of-19 clean rate on goddesign artifacts measures agreement with rules those runs were built under, not predictive power on runs not yet made. Second, static analysis has a hard ceiling that the rule table makes visible: it can prove a `:focus-visible` rule exists but not that every interactive element gets one, prove an import line is present but not that it answers 200, and see nothing at all about collisions, clipped labels, or blank bands. That is why `references/checklist.md` now states the sweep and the audit as complements and forbids either from excusing the other.

Per the evidence bar in `CONTRIBUTING.md`, this enters as mechanical enforcement rather than as new rules: the sweep adds no banned pattern, changes no craft-floor number, and touches no visual rule. It moves existing assertions from the model to a script.

Kill criterion, recorded in advance. The sweep comes out, or its rule set is cut back, if either holds on the next maintainer validation round: a green sweep on a page that the QA gate or the owner then rejects on a defect the sweep claims to cover, meaning the rules are decorative; or the waiver line becomes routine, defined as more than one waiver per page across a validation round, meaning the rules are mis-tuned and are being annotated away rather than obeyed. The validating run is the recorded next action.
