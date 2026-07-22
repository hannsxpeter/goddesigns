# External evaluation: the ADHD reasoning skill, 2026-07-22

Source: UditAkhourii/adhd (https://github.com/uditakhourii/adhd), MIT licensed, "Copyright (c) 2026 ADHD contributors." A skill for coding agents: tree-of-thought with pruning, built on the Claude and Codex Agent SDK. It fans out N isolated parallel reasoning branches under different cognitive frames (each forbidden from evaluating), then a separate critic pass scores each idea on novelty, viability, and fit, flags traps, clusters, and deepens the top three by a weighted 0.35 / 0.40 / 0.25 rank.

This is a reasoning skill, not a design skill. It was surfaced as a candidate to borrow from because it targets the same enemy goddesign targets, premature convergence, with the opposite medicine. That relationship is the whole finding, so it is stated first.

## The relationship, and why it constrains what is safe to borrow

goddesign fights convergence with curation and enumeration: a finite seeded deck, a run ledger, seeded jitter, a DIRECTION LOCK written before any code, and a measured QA gate. It deliberately distrusts the model's own generation, because that generation is the disease being treated. ADHD fights the same convergence by adding more structured generation: isolation during divergence, judgment deferred to a separate pass.

So ADHD's runtime cure is wrong for goddesign at the point where it would do the most damage. Five isolated generation branches multiply the exact model distribution the skill exists to escape, cost five to ten times a normal run, and depend on parallel isolated agents that the Codex CLI host cannot guarantee. What ADHD correctly identifies is one narrow seam: goddesign seeds and rotates form, but its highest-leverage matter decision, the Subject-test signature (`skills/goddesign/SKILL.md` Step 4b), is still authored once, in the same context that later judges it, with no candidate set and no cross-run memory.

Verdict: borrow ADHD's cognitive frames as deterministic subject vantages, and borrow its critic-isolation principle as a small optional post-render test. Decline the fan-out, the score chips, and the weighting. Keep the deck, ledger, DIRECTION LOCK, and measured gate as the execution system.

## How this was evaluated

A four-phase multi-agent investigation, not a single read: four independent recon readers over both repositories (ADHD mechanics, ADHD implementation and benchmark, goddesign's gate and deck, goddesign's evidence bar and rejected experiments); six proposal angles generating thirty candidate ways to leverage ADHD; a four-lens adversarial attack on every candidate (duplication of an existing mechanism, cross-host breakage, cost and taste theater, evidence and license); and a final synthesis. Thirteen candidates survived (fewer than two kill votes), seventeen were killed. The final synthesis was run on Codex gpt-5.6-sol at xhigh reasoning. The dominant kill reason, by a wide margin, was duplicate-of-existing-mechanism: most tempting borrowings turn out to be things the deck, jitter, ledger, lock, Banned list, or gate already do.

## The four leverage seams (candidates, not yet shipped)

None of these has entered the skill. Each is recorded here as a hypothesis with a kill criterion, per the evidence bar. The Subject-test seam (1) is the highest-value one and its validation experiment is the recorded next action.

1. **Seed the Subject test before the aesthetic deck.** A compact subject-vantage deck (`references/vantages.md`) plus a seeded vantage and artifact index resolved in Step 3c before `directions.md`, with `Vantage:` and `Artifacts:` lock lines. The vantage names three artifacts from the subject's world; the seed picks one as the signature. Not covered today: the current Subject test is one paragraph with three examples, no candidate set, no seed, no ledger memory. Cross-host: same markdown rows and integer arithmetic, degrades to the existing character-count fallback with no shell. Cost: zero extra model calls. Kill it if the owner does not prefer or tie the new signatures in a blind ranking, because variance without appeal repeats the Wayfare failure.

2. **Point the vantages at human genomes, not at new model-authored styles.** Maintainer-time sourcing vantages (`references/genome-sources.md`) plus a `CONTRIBUTING.md` intake line requiring `Genome: vantage / source / captured`, a two-rows-per-vantage cap, and no shared vantage across the two newest genome rows. This runs only at deck-maintenance time, so design runs stay identical across hosts. It fixes the admitted weakness that genome intake is still "the owner supplies admired sites" and only one of seventeen rows is externally sourced.

3. **Fail loudly on an incomplete install.** Step 0 verifies all seven reference files are readable, else stops with `INCOMPLETE INSTALL: <file> not found`; Step 3c forbids reconstructing a missing row from memory. Host-neutral file check, near-zero cost. ADHD's single-file packaging exposed the hole: goddesign tells the model to read the decks but never checks they arrived, so a partial install can silently recreate the model-authored distribution the skill exists to avoid.

4. **Prototype one blind critic after rendering, not a critic swarm before building.** A fresh process (`scripts/blind-read.sh`) sees only the 375 / 768 / 1280 screenshots and reconstructs seven fixed fields (structure, paper band, display class, accent band, signature, subject, one concrete AI tell). This is the validated form of ADHD's isolation claim, aimed at the render rather than at generation. Validation-first: calibrate on archived owner-first and owner-last renders (Ledgerbird, Wayfare, Bandquarter) and ship only if it separates the known winners from the known failures on subject and signature. Degrades to `DEGRADED: no blind read`. Cost roughly fifteen to forty seconds, five to ten percent of a run, not ADHD's ten-call premium.

## What was declined, and why

- **The parallel fan-out.** Five to ten times cost, depends on parallel isolation Codex cannot guarantee, and generates more material from the same distribution instead of supplying external design DNA. Simulating it sequentially in the builder's context is worse: ADHD itself says that breaks the isolation invariant, so it would add ceremony without changing the generator.
- **The score chips and the 0.35 / 0.40 / 0.25 weighting.** The seven-axis gate already covers the relevant concerns, and the weights have no design evidence behind them.
- **A run-local Trap line, discarded-obvious-answer block, or ledger provocation.** The Banned list and anti-cliche critique already occupy that surface. Without a reproduced defect and owner-ranked renders, these are self-authored, self-checked taste theater.
- **ADHD's frame selector as an engine.** goddesign's seed plus two ledgers are strictly more reproducible than an unseeded selector.
- **Turning the engineering frames into new aesthetic directions.** `docs/ARCHITECTURE.md` already states a model cannot author its way out of its own distribution; the frames are useful for finding real-world genomes and subject artifacts, not for authoring more model-drawn rows.

## The benchmark

ADHD's reported deltas do not support adopting its machinery; they are hypotheses to test under goddesign's own standard proof. Grounded in `bench/results.json`: four problems (lru-100ms, llm-hang-cli, rate-limit-leader, fuzzy-bug), two samples each (one baseline arm A, one ADHD arm B), scored on breadth, novelty, trap detection, actionability, and builder usefulness. There is one sample per arm, no variance or significance test, and no stated control for output length or model. Two structural problems stand out. Trap detection shows the baseline scoring 2 on every problem while ADHD scores 9 or 10, which is a format artifact: ADHD always prints a traps section and the baseline is never asked for one. And one of the four problems, llm-hang-cli, was won by the baseline on builder usefulness, 9 versus 4, with the judge noting the baseline "gives me a production-ready strategy I can implement with confidence" while ADHD's top pick "introduces UX complexity without solving the core reliability problem." A benchmark whose own showcase includes a loss for the method is not admission evidence.

## License and attribution

ADHD is MIT. If goddesign later copies ADHD prompt text, frame rows, or code, retain "Copyright (c) 2026 ADHD contributors" and the full MIT notice for the copied portion, in a third-party notices file and beside the copied material. No such copying has occurred as of this record: the four seams above are goddesign-native rules inspired by ADHD's diagnosis, not transcriptions of its text.

## Weight and limitations

This is an evaluation record, not a validation result. Nothing here touched the shipped skill. The ADHD mechanics and MIT license were read directly from the source repository; the benchmark critique is grounded in `bench/results.json` as fetched on 2026-07-22; the leverage seams and decline reasons are the output of the multi-agent investigation described above and inherit its limits (agent-generated proposals, adversarially filtered, not yet run against real renders). The next concrete step is the seam-1 experiment: one same-brief, fixed-direction pair on each host, current Subject test versus a validation-only seeded pre-deck vantage and artifact pick, blind-ranked by the owner before any skill edit.
