# pstack unslop evaluation, 2026-08

## Question

Which parts of pstack's `unslop` writing skill improve copy inside a goddesign
delivery without turning a frontend skill into a universal prose regulator, an
authorship detector, or an automatic rewrite pass that invalidates finished
layouts?

## Source frozen for this evaluation

- Repository: [`cursor/plugins`](https://github.com/cursor/plugins)
- File: [`pstack/skills/unslop/SKILL.md`](https://github.com/cursor/plugins/blob/60c641e4fad674784b30abcf9f8915dea39df38d/pstack/skills/unslop/SKILL.md)
- Commit: `60c641e4fad674784b30abcf9f8915dea39df38d`
- Evaluated: 2026-08-19
- License: MIT, Copyright (c) 2026 Lauren Tan

No upstream text or code was copied. The implementation below restates the
process in goddesign's own mode-aware contract and retains this source and
license record.

## What the source offers

The source combines a short review loop with a catalog of 31 writing patterns.
Its most useful idea is procedural: scan the draft, rewrite without changing
meaning, restore voice, then inspect the result again for obvious machine-like
habits. The strongest individual checks ask for concrete facts, named sources,
plain words, shorter sentences, and copy that could not move unchanged to an
unrelated project.

The catalog is broader than goddesign can safely adopt as a hard rule set. It
also bans punctuation, vocabulary, and grammatical forms that remain correct in
technical or transactional copy. A frontend skill needs to distinguish a button
label from a manifesto rather than impose one voice on both.

## Adopted

| Mechanism | goddesign implementation | Boundary |
|---|---|---|
| Post-draft review loop | `references/copy.md` defines scan, rewrite, restore voice, and self-audit passes | Runs after visible copy exists and before the QA gate |
| Copy modes | Each block selects transactional or marketing mode | Predictability wins in controls; voice belongs in marketing copy |
| Concrete claims | Manual gate asks for a mechanism, observable result, real example, or source | No facts, metrics, or certainty may be invented |
| Substitution test | Copy that could move unchanged to another product is rewritten with subject-specific nouns or cut | Legal text and user-supplied terminology remain authoritative |
| Source-or-delete | Vague attribution names its source or disappears | A scanner finding remains advisory because a citation may live elsewhere in the block |
| Three mechanical candidates | `vague-attribution`, `filler-copy`, and `formulaic-copy` scan visible markup | Advisory only; every finding is read in context |
| Layout invalidation | Substantial copy changes after screenshots force the full gate to run again | A rewritten artifact never inherits stale visual evidence |

## Declined

| Candidate | Reason |
|---|---|
| "Must always apply" trigger | Goddesign owns frontend copy only, and different blocks need different modes |
| Universal vocabulary blacklist | Technical terms can be exact; context decides whether a word is jargon |
| Blanket bans on parentheses, curly quotes, passive voice, or adverbs | Each form has clear and accessible uses |
| Intentional messiness | Uneven rhythm can help marketing copy, but errors and inconsistent labels damage usability |
| Automatic rewriting | It can change facts, brand voice, legal meaning, wrapping, height, and responsive behavior |
| Human-authorship implications | A style review cannot establish who wrote text or what detector will classify it |
| Hard-fail status for the three new patterns | The scanner cannot see a nearby citation, a deliberate quotation, or all domain context |

## Calibration

The three new rules were run across the 49 non-withdrawn HTML artifacts under
`validation/runs/` and `validation/experiments/`. They produced zero findings in
all three categories, so this release introduces no corpus false positives and
does not change the existing failure separation.

A deterministic regression fixture supplies one visible positive for each rule,
checks the reported source line, and places duplicate phrases inside a script and
an HTML comment. The visible phrases report once; hidden text does not report;
the process exits green because all three rules are advisory.

This calibration proves source routing, severity, and corpus neutrality. It does
not prove that the patterns separate human and generated writing. The rules ship
as copy-quality prompts with that narrower claim, and they should be removed or
narrowed if future artifacts produce noisy findings.

## Shipped contract

The copy lane remains in goddesign only while all of these hold:

1. It reviews visible copy inside a frontend delivery and does not widen the
   skill's trigger surface to general writing.
2. Transactional and marketing blocks remain distinct modes.
3. The three mechanical patterns remain advisory and receive contextual review.
4. User facts, terminology, legal text, and voice remain authoritative.
5. The pass never claims human authorship or detector evasion.
6. Substantial post-render copy changes repeat the full design gate.
