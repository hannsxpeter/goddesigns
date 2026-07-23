# Seam-1 experiment: does a seeded subject-vantage beat the in-context Subject test? 2026-07-22

Origin: the ADHD evaluation (`validation/adhd-evaluation-2026-07.md`) surfaced four native leverage seams. Seam 1, the highest-value one, is the hypothesis that goddesign's Subject test (`skills/goddesign/SKILL.md` Step 4b) would produce a more distinctive signature if the subject's world were mined from a seeded vantage before the aesthetic deck is read, instead of chosen once in-context with no candidate set. This is the first controlled test of that hypothesis. Nothing here has been shipped into the skill.

## Method: a controlled A/B with form held constant

One brief, one fixed direction, one fixed structure, both arms built by Codex gpt-5.6-sol at xhigh reasoning (the EXPAND lane, the enumerated-execution host). The only variable is how the page signature is chosen.

- Seed: 4230224098 (reproducible: `winecellar` + fixed minute stamp `202607230000` through the skill's own cksum formula).
- Direction 11 Luxury Serif, Structure 4 Workbench. This pairing is the fair-test crux: Luxury Serif plus wine is exactly the attractor trap (the generic cream-and-gold "fine wine" look, itself on the Banned list), so each arm must escape the same trap through its signature.
- Subject (identical): "Cellar & Harvest," cellar-and-harvest management software for a small independent winery. Audience: winemakers and cellar hands, not consumers. Shared lock in full: `/scratchpad/seam1/LOCK.md` (tokens post-jitter h-6 L+0.01 r+0, Bodoni Moda 500 / Manrope, radius 0, 500ms opacity motion, four declared grammar breaks, all identical across arms).
- Arm A (control): goddesign's current Subject test, reproduced verbatim. Builder picks the signature in context, one paragraph, no candidate set.
- Arm B (treatment): a validation-only ten-row subject-vantage deck (`/scratchpad/seam1/vantages.md`). The seed selected vantage 9 ("the map or floorplan: the spatial artifact") and artifact index 0. The builder stands at that vantage, enumerates exactly three concrete spatial artifacts of this winery, and ships the first as the signature.

## What each arm produced

- Arm A signature: a fermentation run sheet for Pinot Noir lot CH-26-014, centered on Tank T07, with a five-day falling Brix curve, pH, cap temperature, a punch-down schedule, additions, and a timestamped cellar log. This is the instrument-and-readout artifact: the model's strong default for "show winemaking working."
- Arm B signature: a "North cellar topping route," the barrel room drawn as a physical floor map (bays by varietal, racks, tiers, barrel positions with ullage and free SO2, a service aisle, a topping-cart staging area) with a sequenced four-stop walking route and consistent volume totals. The three artifacts Arm B enumerated were the topping route sheet (shipped), a harvest hose-path and valve-isolation overlay, and a forklift barrel-move slip. The vantage read the cellar as space you walk, not rows you read.

The central observation: holding form constant, the seeded spatial vantage moved the signature off the model's default (a tank you read) onto a non-default artifact (a route you walk). That signature diversification is exactly what seam 1 claimed the mechanism would do, demonstrated once.

## Results

Measured audit (`scripts/audit.mjs`, real Playwright, viewports 375 / 768 / 1280): both arms exit 0. No horizontal overflow, no hidden-text reveal bugs, no text-on-text collisions, no sub-24px targets, both webfonts loaded (Bodoni Moda + Manrope, no silent fallback), on every viewport.

Lock compliance (greps): both clean. No gold, no banned fonts (the only `Inter`/`Roboto` matches are the substring `pointer`), zero inline `style` attributes, each hex once in `:root`, `!important` only inside the prefers-reduced-motion kill switch.

Proxy blind read (Codex gpt-5.6-sol xhigh, shown only the two desktop renders as Page 1 and Page 2, blind to which method built which, structured output):

| | Arm A (fermentation) | Arm B (route/map) |
| --- | --- | --- |
| Embodiment 0-10 | 9.0 | 9.2 |
| Distinctiveness 0-10 | 7.7 | 8.8 |
| Blind ranking | | first |

The juror ranked Arm B first, reasoning that the spatial operations diagram is "more memorable and harder to mistake for generic premium-wine branding" and states "a more specific product thesis." It flagged Arm A's own composition as the more formulaic of the two: "repeated oversized serif declarations separated by large empty fields feel like a generated luxury landing-page formula." Both arms scored near-identical on embodiment; the separation was distinctiveness.

## Weight and limitations

This is one data point, not proof, and it is deliberately reported as such. One subject, one sample per arm, one juror, and the juror is a model of the same family as the builders, the exact methodological weakness this project charged against ADHD's own benchmark (`validation/adhd-evaluation-2026-07.md`, "The benchmark"). The embodiment scores were within 0.2, so the control is not weak; it is excellent, and the vantage arm won on distinctiveness alone. The experiment ran on the Codex host only: the no-shell index fallback and a Claude-host arm are untested, and generalization across other subjects and directions is untested. Per the seam's own kill criterion, the decider is the owner's blind ranking, not the proxy juror's.

## Decision gate

Ship the vantage deck into the skill (a `references/vantages.md`, a seeded vantage and artifact index in Step 3b, resolution before the deck in Step 3c, `Vantage:` and `Artifacts:` lock lines, a checklist persistence line) only if BOTH hold: the owner's blind ranking prefers or ties Arm B, AND the result repeats across at least two more subjects on different directions so this is not a one-brief artifact. Otherwise record the outcome and keep the mechanism out, the same containment the SVG-first experiment received.

## Owner verdict (round 1)

Tie, too close to call. Recorded as a weak positive: holding form constant, the vantage arm did no harm (both audit-green, embodiment within 0.2) and shifted the signature onto a genuinely non-default spatial artifact, which the proxy juror scored as more distinctive, but the owner's eye did not separate them decisively on one brief. The gate's first condition (owner prefers or ties Arm B) is met by the tie; the second (repeat across more subjects) is not yet. The vantage deck therefore stays OUT of the skill, and a two-subject repeat on different directions is triggered to test whether the distinctiveness edge holds or was a one-brief artifact. Round-2 results append below.

Artifacts committed alongside this doc: `subject-vantage-armA.html` / `.png` (control) and `subject-vantage-armB.html` / `.png` (vantage). Working copies with mobile shots and `SIGNATURE.md` in `/scratchpad/seam1/`; proxy read in `/scratchpad/seam1/blind-result.json`.
