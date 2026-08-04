# External evaluation: the impeccable skill, 2026-08-04

Source: `pbakaus/impeccable` (https://github.com/pbakaus/impeccable), **Apache-2.0**, author Paul Bakaus. Read at commit `620ba1fe7d87a39039a8528bfaa319ecfa893cb2`, package version **3.5.0**, cloned 2026-08-04. The changelog entry evaluated is dated 2026-07-29 and is the release the owner pointed at. The repository ships its own `NOTICE.md` (third-party notice for `skill/reference/ios.md` and `android.md`, distilled from ehmo's `platform-design-skills`, MIT).

Canonical source is `skill/` at the repository root (`skill/SKILL.src.md`, `skill/reference/*.md`, `skill/scripts/**`, `skill/agents/*.md`). The `.claude/`, `.agents/`, `.cursor/`, `.github/agents/`, `.codex/`, `.gemini/` and eleven further dot-directories are generated provider output from that one source, and were read only as evidence of per-harness emission.

**This is the second reading of this source.** impeccable was first evaluated in `design-skills-evaluation-2026-07.md`, where its detector idea, its `fail`/`advisory` severity split, and its inline waivers were borrowed and shipped as `scripts/sweep.mjs`, while its command surface, modes, per-host edit hooks, live browser mode, and 59-rule registry were declined. Those verdicts stand and are not relitigated here; this record covers only what the 2026-07-29 release added on top.

impeccable and goddesign are near neighbours: both are cross-harness frontend design skills that seed a direction, gate the build, and refuse a named list of tells. That proximity is what makes the evaluation useful and what makes most of it decline: where the two agree, goddesign usually already has the mechanism, and where they differ, the difference is usually a constraint goddesign took on deliberately.

## How this was evaluated

Seven mechanism clusters drawn from the release, each read against impeccable's implementing files and goddesign's own source, then every proposed borrow handed to an independent adversarial verifier instructed to refute by default. Twenty-four borrows were proposed; twenty-two were refuted. The verifiers did not argue from taste: they patched scratch copies of `scripts/sweep.mjs`, ran the proposed rules across all 49 artifacts in `validation/runs/` and `validation/experiments/`, ran `scripts/sweep.test.mjs`'s own separation assertions, and recovered `references/directions.md` at the commit each corpus artifact was built under. Every claim reproduced below was then re-run by hand.

This is a multi-agent read plus hand verification, stronger than the single-session read behind `wayfinder-evaluation-2026-07.md` and weaker than a validation run: it verifies mechanisms, not designs. See "Weight and limitations".

## The first finding: most of the release is doctrine, not mechanism

impeccable marks its enforceable rules with `<!-- rule:skill-* -->` ids and carries a detector with 77 rule ids of its own. Thirteen of the release's headline claims carry neither. Stated plainly, because it changes what is available to borrow:

- **The three new craft-floor refusals are prose only.** `skill/reference/craft-floor.md:38` (system display face), `:39` (unicode glyphs as an icon system), and `:35` (hard offset shadows outside a neobrutalist world) have no detector rule id. The nearest existing detector, `overused-font`, uses a font list that contains neither Impact nor Arial Black. For hard offset shadows the detector is affirmatively built the other way: `checkGlow` skips any shadow whose blur is 4px or less, which is exactly the shape the refusal names.
- **The aspect rule has no numbers.** "The surface owns its aspect" appears as four prose restatements. The only image size in the codebase is landscape and it is the default: `generate-image.mjs` takes `size` defaulting to `1536x1024`, and `parseSize` falls back to the same on malformed input. `surface-briefs.mjs` carries no aspect, viewport, orientation, or platform logic at all.
- **The `approved: true` sidecar is model-authored file editing**, instructed at `skill/reference/visualize.md:27` and verified by nothing.
- **"Sandboxed viewers stopped choking: every image opens by its workspace-relative path"** has no implementation; all four occurrences are prose instructions to the model.
- **"generate-image.mjs embeds automatically" is partially true.** The auto-embed is a `spawnSync` of `embed-prompt.mjs` inside a `try`/`catch` with `stdio: 'ignore'`, so a failed embed is silent, and nothing anywhere verifies that the embed survived.
- **The medium gate, the release's headline change, carries no rule id and no script.** It is doctrine in `skill/reference/visualize.md`.

None of this makes the ideas wrong. It does mean that adopting them into goddesign would mean authoring the mechanism from scratch, under `CONTRIBUTING.md`'s evidence bar, rather than porting one.

## The holes the source exposed, derived from goddesign's own rules

Four, and all four are derivable from goddesign's own text rather than asserted from impeccable's claims. All four are closed in v1.6.2; each is stated below as it read **before** the fix, with the file and line it stood at, so the defect stays legible to anyone auditing the change afterwards.

1. **A run that could not execute Phase 2a has no words to say.** `grep -r DEGRADED skills/goddesign/` returns `DEGRADED: no visual check` and `DEGRADED: no blind read` and nothing else. There is no `DEGRADED: no sweep`. `references/checklist.md:192` gates the visual-check label on "Only when every rung fails", so a host with no shell but a native screenshot capability completes Phase 3 clean, never fires that clause, and silently never ran Phase 2a, while `SKILL.md:176` still demands "the boolean gate sweep (pass/fail; report the pass count)" and `checklist.md:3` demands "gate pass count, and any DEGRADED notes". `SKILL.md:23` and `:75` explicitly support that host, including a full arithmetic seed fallback. `design-skills-evaluation-2026-07.md:19` names this exact failure class as the defect `sweep.mjs` was built to close; a host that cannot run the script re-enters it with no name.

2. **The deck-row-to-modulus contract is enforced for the maintainer and unenforced for every user.** `scripts/verify-install.sh:22-27` tests presence and non-emptiness only. A copied rather than symlinked install, a half-synced tree, or a stale vendored copy passes green while `references/directions.md` holds fewer than 17 rows; `SKILL.md:71-72` then rolls `% 17` and can land on a row that does not exist, and the model improvises it. That is the failure the script's own header forbids at lines 3-5. The check that would catch it exists at `scripts/lint-decks.mjs:23-43`, but `lint-decks.mjs` sits at repo level, outside `skills/goddesign/`, so an installed skill can never run it. Confirmed: `cd skills/goddesign && node ../../scripts/lint-decks.mjs` throws ENOENT.

3. **`banned-font` does not enforce its own prose, in two independent ways.** `SKILL.md:156` bans "Inter, Roboto, Arial, Open Sans, Lato, Poppins, or a system stack as a chosen face", and neither half held.

   *The named families.* `scripts/sweep.mjs:217` implements the ban as an anchored exact-match list, so `"Arial Black"` cannot match `^arial$`. The one backstop is defeated by a single global boolean: `no-webfont` (`sweep.mjs:466-468`) fires only when **no** font import exists anywhere in the build, so one legitimate `@import` for the body face silences it for every other named face. Measured: a fixture importing Hanken Grotesk for body and declaring `font-family: "Arial Black", Impact` for display, with a `6px 6px 0` hard offset shadow on its button, exits **0 green**.

   *The system stack.* The clause's own tail had never been mechanical at all. `GENERIC_FAMILY` (`sweep.mjs:198`) lumped the system-stack keywords in with the true generic families and CSS keywords and skipped the lot at `sweep.mjs:393`, before any ban was tested. Measured: `font-family: system-ui, sans-serif` as an h1's display voice exits **0 green**. This half was recorded as open when the first three items shipped, and is closed in the same release.

4. **`@theme` blocks are invisible to the sweep.** `sweep.mjs:182` explicitly anticipates them (`isRootRule` tests `/^@theme/i` against both the at-rule and the selector), but the declarations inside an `@theme{}` block are never delivered to the scanner. Measured on byte-identical token sets:
   - `:root{--bg:#FFFFFF;--text:#808080;}` reports `pure-base` and `untinted-neutral`, exit 1.
   - `@theme{--bg:#FFFFFF;--text:#808080;}` reports nothing, exit 0.

   This is not an impeccable idea; it was found chasing impeccable's "grep the built output" diagnosis and landing somewhere sharper. It matters because `@theme` is Tailwind v4's token block, `scripts/extract-tokens.mjs` reads it by design, and `SKILL.md` Step 0 item 1 routes exactly those projects into extension mode. Extension mode can therefore measure a baseline the sweep then cannot police.

## What is admitted, and its mechanical form

All six are **implemented** in v1.6.2. Each entry states the mechanism as it shipped.

1. **`DEGRADED: no sweep`, and the install note that pairs with it. IMPLEMENTED.** A clause in `references/checklist.md` under the Phase 2a fix loop, mirroring the existing `DEGRADED: no visual check` handoff clause for clause including the `./audit-handoff.sh` precedent: state the label, name the command that failed, write it into `./sweep-handoff.sh` and mark it executable, then hand-check every `[sweep]`-marked assertion in Phase 2b and report the pass count as hand-checked. The clause names the two hosts that reach the state and says explicitly that it is **not** the same state as `DEGRADED: no visual check`, because the case that motivated it is a host that renders natively and still never runs the sweep, where Phase 3 completes clean and nothing else would have said so. The checklist's opening reporting rule now also requires every pass count to say whether it was measured or hand-checked, since a number that does not say which is indistinguishable from a number nobody ran. Paired with a clause at `SKILL.md` Step 5 and three literal-string assertions in `scripts/lint-decks.mjs`. No new sweep rule id, so the two-file rule-table contract is untouched.

2. **Deck integrity in `verify-install.sh`. IMPLEMENTED.** Row counts per deck using the same patterns `lint-decks.mjs` uses, compared against the four moduli **grepped out of `SKILL.md` Step 3b** rather than hardcoded, so the check stays true when a deck grows. On mismatch it prints `INCOMPLETE INSTALL: references/directions.md has 14 rows, SKILL.md Step 3b rolls % 17 (stale or partial copy: reinstall, see docs/INSTALL.md)` and exits 1, keeping the existing exit contract. Verified against three fixtures: a healthy install (exit 0), a directions deck truncated to 14 rows (exit 1, named), and a palettes deck gutted to zero rows (exit 1, named). Paired with two assertions in `lint-decks.mjs`, both negative-tested against the pre-change file so neither passes vacuously. POSIX sh, zero dependencies, no network.

   One defect was caught during implementation and is worth recording, because it is the exact failure the check exists to prevent: `grep -c` prints its count **and exits 1 when that count is zero**, so a first draft written as `grep -cE ... || echo 0` emitted `0\n0` on a gutted deck, which made the integer comparison error out and the script report `install OK` and exit 0. A check that silently passes on the worst input is worse than no check. The shipped version branches on the printed count, never on grep's exit status.

3. **Banned bullet 1 made whole: `arial black` named, the system stack separated from the generics, Impact left out. IMPLEMENTED.** Both halves are enforcement parity for a ban goddesign already states in prose, not new tells, so `CONTRIBUTING.md:9`'s three-sourced-complaints bar does not apply to either.

   `arial black` joins the regex. The edit touches four places, not one: the regex, the `RULES` description string (which `--rules` prints and which the checklist mirrors), the Phase 2a table row, and the Banned bullet. The description string was already narrower than the implementation, naming six families where the regex held ten; it now names all ten plus the stack.

   `GENERIC_FAMILY` splits in two. It keeps only what is never a chosen face and never needs an import (`sans-serif`, `serif`, `monospace`, `cursive`, `fantasy`, `inherit`, `initial`, `unset`, `revert`, `var(`, `emoji`, `math`, `fangsong`); a new `SYSTEM_STACK` holds `system-ui`, `-apple-system`, `blinkmacsystemfont`, `ui-sans-serif`, `ui-serif`, `ui-monospace`, `ui-rounded`, and reports `banned-font` in the chosen-face position. Position is the whole rule: `firstFamily()` reads position 1 only, so a fallback tail behind a real face stays correct, and a flagged stack is dropped before `namedFaces` so it is never also reported as a face missing its import. Severity is `fail` rather than `advisory` on the house test: no lock line can make it legal, because `CONTRIBUTING.md` requires every direction row carry a real family and a working import line and none of these keywords has one. Folded into `banned-font` rather than given a new rule id, because `SKILL.md` states it as one ban in one bullet, so the rule count stays 29 and the two-file table, `sweep.test.mjs`'s table assertion, and the README's counts are all untouched.

   **Impact is declined** until it has three sourced complaints or a reproduced defect: it appears in no corpus artifact and no sentiment evidence, and it is a new family, not a re-spelling of an existing one.

4. **The `@theme` parser fix. IMPLEMENTED.** `rulesOf()` treated every at-rule as a container to walk into, which is right for `@media`, `@supports`, and `@layer` and wrong for `@theme`, whose body is bare declarations. One condition now exempts it, so it is emitted as a block and `isRootRule`'s existing `@theme` test finally has something to match. A fix to an existing rule's parser, not a new rule, so no rule id, no Phase 2a table row, and no two-file contract churn. `@theme inline` is covered by the same word boundary.

**Corpus split for items 3 and 4, measured together across all 49 artifacts in `validation/runs/` and `validation/experiments/`: 1452 findings before, 1452 after, per-file counts byte-identical, `banned-font` 6 before and 6 after.** Zero change is the expected and correct result for both, and the reason is worth stating exactly. The corpus holds six font declarations naming one of the two families, and every one puts it in fallback position 2, where `firstFamily()` never reads it:

- `"Bricolage Grotesque", "Arial Black", sans-serif` in `claude-with-skill-taskflow-a.html:53`, `claude-with-skill-taskflow-b.html:42`, and `bandquarter-gd-b.html:37`
- `'Archivo Black', 'Arial Black', sans-serif` in `wayfare-gd-a.html:32`
- `"Anton", Impact, sans-serif` in `bandquarter-fd-a.html:23` and `bandquarter-fd-c.html:23`

A seventh grep hit, `codex-baseline-taskflow.html:1342`, is the English word inside a heading ("See the impact"), which is a useful reminder that the rule reads font declarations and not page text. And no corpus artifact uses `@theme` at all, so item 4 is corpus-neutral by construction rather than by luck. Both fixes are therefore asserted rather than claimed, as two new cases in `scripts/sweep.test.mjs` (21 tests, all passing): one proving a system display face fails while the same family in fallback position stays legal, and one proving `@theme` and `@theme inline` produce the same findings as an identical `:root` block. `scripts/lint-decks.mjs` stays green at 311 checks, and the rule count stays 29.

5. **"medium" as a fourth axis on the reference-match assertion. IMPLEMENTED.** The render is now compared against the reference on layout, spacing, colour, **and medium**, so a comp region reading as a lit, dimensional object that shipped as a flat CSS panel is a deviation like any other, stated or fixed, under machinery that already exists. No new lock line, no forced raster, no new rule. This is the only part of impeccable's medium gate that survives contact with goddesign's one-composition cap: the gate axis transfers, the raster mandate does not.

6. **Two sentence-level clarifications. IMPLEMENTED.** `SKILL.md` Step 0 item 2's "reuse the stamped lock: it IS the DIRECTION LOCK" read as though the three-field stamp comment carried the token values, when the values live in `:root` and the jitter lives there in relative-color form; it now says so and tells the scoped edit to read both. And `imagery.md` now names which capture the reference-match gate compares the comp against (the 1280 full-page screenshot the audit produces, not a viewport crop), because a whole-page comp scored against a viewport crop scores only its first band.

Items 1, 2 and 3 are the load-bearing set. Item 4 is a goddesign bug that happened to surface here rather than a borrow. Items 5 and 6 are single sentences.

## What was declined, and why

Grouped by the house test each fails. The test is quoted, because the recurring reasons are meant to be reusable.

**Needs a network service, an account, or a platform** (`docs/ARCHITECTURE.md`: core design work requires no account, network service, or platform):
- `generate-image.mjs` itself, whose generation path is the OpenAI images API. goddesign's `genimage.sh` delegates to whatever image-capable CLI the host already has, and that difference is deliberate.
- The decision board and its liveness protocol (heartbeat, server restart, sandbox permission handling). The whole mechanism presupposes a local HTTP server the agent signals.

**Needs host-specific config files** (only `name` and `description` frontmatter is portable, and the skill must behave identically on Claude Code and Codex):
- The four native subagent roles emitted per harness into `.github/agents/`, `.cursor/agents/`, and eleven more. This is impeccable's central architectural bet and it is exactly the bet goddesign declined; a reviewer that is read-only on Cursor and inline elsewhere is a skill that behaves differently by host.
- The installer that knows each platform's project and user paths and warns about shadowing.
- The asset-producer subagent and its manifest, and the finish reviewer's mandatory MATERIAL row and rebuild directive, both of which derive their power from a fresh subagent.

**Advice rather than a number, a hex, a greppable string, or a yes/no test** (`CONTRIBUTING.md:69`):
- The orientation rule keyed to surface type. impeccable states it four times in prose and implements one landscape default.
- The `approved: true` prompt sidecar, workspace-relative image paths, "name the face's compression class", and "write down a field's approximate density and coverage".

**Would import a rule that skipped goddesign's evidence bar** (`CONTRIBUTING.md:9`: three independent sourced public complaints with URLs, or a defect reproduced in a validation run):
- **Impact** as a banned family, and **unicode glyphs standing in for an icon system**. Both are registry entries in impeccable and neither has sourced evidence. `design-skills-evaluation-2026-07.md` already declined bulk-importing that registry on this exact ground; taking one entry retail is the same move at smaller scale, and it lands an unsourced entry beside sourced ones, which is what makes the `[fingerprint]` and `[craft]` tags mean something.
- **A hard-offset-shadow sweep rule.** The strongest-looking candidate in the whole evaluation, and it dies on its own arithmetic. The rule fires on 7 of 30 goddesign artifacts, but five of those are artifacts faithfully executing the deck row they locked, as the deck stated it at build time: `git show 32ef709:skills/goddesign/references/directions.md` has Brutalist Raw at `4px 4px 0` and Playful Pop at `6px 6px 0`. That deck defect was caught by the owner on `bandquarter-gd-b` and fixed the same day in commit `e5255b8`, and the post-fix corpus shows **zero** recurrence. Compliance with a since-changed spec is not "a defect reproduced in a validation run". Worse, a patched sweep run against `scripts/sweep.test.mjs`'s own separation corpus takes `claude-with-skill-taskflow-a.html` from 1 failure to 4, tripping the test's `assert.ok(n <= 2, "...a skill run over 2 means a new false positive")`, and it collides head-on with the Step 4d craft floor, which prescribes layered shadows at a 2:1 offset ratio. If the owner wants the gap closed, the honest form is prose only: a Banned-list entry and a checklist line, no sweep rule until a post-`e5255b8` artifact reproduces the defect.
- **Making the blind read's identity verdict binding.** `validation/experiments/blind-read-calibration-2026-07/README.md` established that the reader recovers subject and signature reliably but does not rank good pages against each other, which is why the verdict is advisory. Promoting it would contradict goddesign's own calibration, which is worse than skipping the bar.

**Turns an execution skill into a planning skill, or adds subagent fan-out** (declined on the record in `wayfinder-evaluation-2026-07.md` and `adhd-evaluation-2026-07.md`):
- The one-question stack init recorded in PRODUCT.md. `SKILL.md:43` tells the model to invent confidently where the brief is silent and not to stall on questions, and the EXPAND lane bans "architecture instead of pixels".
- The comp approval point as a blocking stop-and-wait, and the user scope decision about dropping an image-native region.

**Inapplicable by construction:**
- The contract living as the root layout body's first child so no compiler can strip it. goddesign's stamp is a source artifact with two source-reading consumers; moving it into emitted markup would not survive the same compilers and would break the extension-mode and scoped-edit paths that read it.
- Portrait at device viewport for native apps. goddesign is web-only per `SKILL.md:3` and `scripts/audit.mjs`.
- The rebuild directive naming assets to produce, which would fight `imagery.md:49`'s one-composition cap rather than fill a hole.

**Refuted borrows whose hole turned out to be cosmetic** (recorded so a future maintainer does not re-propose them): the derived verdict word, a comp-aspect line in the prompt, the poster/vignette regenerate trigger, the two-strikes region escalation, the no-crop asset-resolution rule, the `<image>.json` sidecar, and the seed-in-the-stamp change. Each is argued in full in the workflow transcript; the short version is that goddesign's existing acceptance line, one-composition cap, lock freeze, and `:root` token store already carry the weight, and the proposed replacements cost invariants to buy nothing measurable.

## What is goddesign-native, and needs nothing

Eighteen of impeccable's mechanisms have a goddesign analogue already in place. The ones worth naming, because they are the ones that look like gaps and are not:

- **The mechanical net on every host.** impeccable's release adds "run the detector once before the finish review on harnesses with no design hook". `scripts/sweep.mjs` has been mandatory on every host and in every mode since v1.6.0, with no hook, no browser, and no network. goddesign got there first and by a different route.
- **The prompt travelling with the asset.** goddesign persists the generation prompt in the DIRECTION LOCK and gates it at `checklist.md:163` ("its prompt is stated in the lock"). impeccable's in-file carrier solves a problem goddesign does not have, and would not survive goddesign's own `cwebp` and `sips -Z` compression step at `imagery.md:53` anyway.
- **The reviewer reading only pixels.** `references/blind-read.md` plus `scripts/blind-read.sh` run from an isolated temp directory on anonymized copies, so the reader sees no code, no lock, no repo rules, and no method-revealing filenames. That is a stronger isolation guarantee than "spawns fresh".
- **Refusing the argmax.** impeccable's roll assigns which of the model's own candidates gets built. goddesign's entire Step 3 variance engine is that idea, with a shell-derived seed, four decks, a two-ledger rotation, a popularity cap, and Step 3d jitter on top.
- **Withdrawing a thin pool while keeping its machinery.** goddesign's `WITHDRAWN-` prefix convention does the same job for evidence.
- **The lock has no substitute and no skip condition.** Already stated at `SKILL.md:13` and enforced by `no-stamp`.

On the thin-pool question specifically: impeccable's fix is for small per-surface pools repeating their weakest option. goddesign has 17 direction rows, one global seed, and a popularity cap that rests any row appearing 3 or more times in the last 8 entries, so the starvation case is not reachable in a normal run. It is worth one look inside `references/map.md`, where a per-map structure pool is genuinely small, but that is a goddesign question and not a borrow.

## License and attribution

impeccable is **Apache-2.0**, copyright Paul Bakaus, and ships a `NOTICE.md`. **No text, code, prompt content, or rule id was copied.** Every mechanism admitted above is goddesign-native prose or code written against impeccable's diagnosis. If goddesign later copies impeccable material verbatim, Apache-2.0 section 4 requires retaining the licence, the attribution notices, and a copy of impeccable's `NOTICE.md` contents in any distributed derivative, which is a heavier obligation than the MIT sources evaluated previously; record it in a third-party notices file and beside the copied material.

## Weight and limitations

This is an evaluation record. All six admitted items shipped in v1.6.2; the declines are the larger half of the finding and are the part most worth re-reading before the next external source is evaluated.

It is stronger evidence than `wayfinder-evaluation-2026-07.md` in that the refutations are measured rather than argued: the sweep was patched and re-run across the full 49-artifact corpus, `sweep.test.mjs`'s separation assertions were executed against the patched script, and the deck was recovered at each artifact's build commit. Every claim reproduced in this file was then re-run by hand, including the two fixtures that establish holes 3 and 4.

It is weaker than a validation run in the way every such record is: **no page has been designed under any of these changes.** Items 3 and 4 alter `sweep.mjs` behaviour, so both carry the corpus split `CONTRIBUTING.md` requires, and both are corpus-neutral, which is the honest reading of their evidence: they close escapes the corpus never exercised. The proof they work is the fixtures, not the corpus. Items 1, 2, 5 and 6 add no rule and change no visual behaviour, so they enter as structural machinery under the `CONTRIBUTING.md` clause that exempts machinery from tell evidence while holding it to the same mechanical bar; item 2 additionally carries three install fixtures and item 1 carries three lint assertions, all negative-tested.

Two limits worth naming rather than burying. Item 1 is a **label**, not an enforcer: nothing can make a model say `DEGRADED: no sweep`, in the same way nothing can make it say `DEGRADED: no visual check`. What the change buys is that the words now exist, the lint keeps them existing, and the reporting rule makes an unqualified pass count a visible omission. And item 2 checks row **counts**, not row **contents**: a deck with 17 rows where one has been corrupted still passes. Counting is what the seed's failure mode actually needs, since the modulus can only overrun the end, but it is not a checksum and should not be read as one.

One scope note on item 3. It shipped in two passes: the named-family escape first, then the system-stack half, which was recorded as open in between and closed before release. The corpus decided its shape. Before writing the rule, all 25 system-stack keyword usages across the corpus were located, and **every one sits in position 2 or later** (`"Anton", system-ui, sans-serif`, `"IBM Plex Mono", ui-monospace, monospace`). That is what made a position-1 rule safe: the false-positive surface people fear here is the fallback tail, and the corpus says the fallback tail is the only way this codebase has ever used these keywords.

Bullet 1 of the Banned list is now fully mechanized. Other bullets are not, and the honest statement is that this release fixed one bullet rather than the list: bullet 4 (the cream plus terracotta reflex), bullet 12 (marker underlines and squiggles), bullet 13 (glassmorphism, emoji as icons, mixed icon sets), bullet 17 (an accent-colored span inside a headline), and parts of bullet 3 (cyan-magenta washes, purple-tinted drop shadows) all resolve to strings or counts and have no sweep rule. Each needs its own corpus split and false-positive analysis. That list is the natural next piece of work and is recorded here so it does not have to be rediscovered.

One asymmetry is worth stating: impeccable ships a live browser-editing surface, a decision board, native subagents on thirteen harnesses, and an image-generation API path. goddesign has none of those and declines all of them here. That is a real difference in ambition, not a gap this record is papering over. The declines are consistent with `docs/ARCHITECTURE.md`'s stated constraints, and if the owner wants to revisit the constraints themselves, that is a separate decision this evaluation does not make.

## Kill criterion, recorded in advance

- **Item 1** (`DEGRADED: no sweep`) comes out if no run in the next validation round can reach the state it names, i.e. if every host that lacks a shell also lacks a native screenshot capability. Then the label is ceremony and `checklist.md:192` already covers the real cases.
- **Item 2** (deck integrity) comes out if it fires on any correct install across the maintainer's own hosts, since a preflight that cries wolf gets disabled and then the install is less checked than before.
- **Item 1** (`DEGRADED: no sweep`) comes out if no run in the next validation round can reach the state it names, i.e. if every host that cannot run `node` also cannot render. Then the label is ceremony and `checklist.md`'s existing "report which half of the gate did run" clause already covers the real cases.
- **Item 2** (deck integrity) comes out if it fires on any correct install across the maintainer's own hosts, since a preflight that cries wolf gets disabled and then the install is less checked than before it existed.
- **Item 3** (`arial black`, and the system stack) comes out if it ever reports a family or a keyword in fallback position, or if a direction row is added that states a system display face as its concept, which would make the ban wrong rather than under-enforced. The system-stack half additionally comes out if it fires on a form-control or code-block reset that the craft floor would defend, since that is the one legitimate position-1 use anyone has proposed and the corpus contains none.
- **Item 4** (`@theme`) comes out if emitting `@theme` as a block produces a finding on any artifact whose `:root` equivalent would not, which would mean the exemption changed parsing rather than restored it.
- **Items 5 and 6** come out if the added sentences are ever cited to justify generating a raster the structure never asked for, or to reopen a lock during a scoped edit. Both are clarifications, and a clarification that grows scope has stopped being one.

Items 3 and 4 were corpus-neutral at merge and both carry a regression test, so their criterion is what a future run does, not what the existing corpus does.

The recorded next action is the standard maintainer proof from `validation/runs/kilnhouse-2026-07/README.md`, with two deliberate arms: one built on Tailwind v4, so an `@theme` token block passes through the gate for the first time in a real run, and one run on a host that cannot execute the sweep, so the new degraded label is exercised rather than assumed.
