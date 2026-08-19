# Validation

This is the evidence library. Every rule in goddesign traces back to something
in this directory, and so does every claim on the front page.

It is organized so the different kinds of evidence do not get confused with each
other. A published study, a repeatable method, a bounded experiment, and a
comparison run all carry different weight, and mixing them is how projects end
up over-claiming.

## Start here

If you are evaluating whether this project's claims hold up, read these five in
order:

1. [Public sentiment evidence](research/sentiment-evidence-2026-07.md): the
   346-comment study of what people actually say about AI-designed sites. This
   is the source of most banned patterns.
2. [Kilnhouse comparative run](runs/kilnhouse-2026-07/README.md): the main
   demonstration. Seven runs of one brief, seven distinct designs, plus the
   unskilled baselines that reproduced the catalogued failures.
3. [External validation protocol](protocols/external-validation-protocol.md):
   the study designed to test the core claim with outside judges, pre-registered
   with the bars fixed in advance.
4. [Study A frozen protocol](studies/study-a-2026-07/protocol.md) and its
   [completion audit](studies/study-a-2026-07/completion-audit.md): where that
   study currently stands, requirement by requirement.
5. [The withdrawal record](runs/kilnhouse-2026-07/WITHDRAWN-codex-baseline-kilnhouse.md):
   a test capture that was retracted after it turned out to be contaminated,
   along with every claim it touched.

## What is proven and what is not

Stated plainly, because the distinction is the point:

- **Author-run testing (complete).** The variance mechanism produces genuinely
  different designs run to run. The automated checks catch real defects,
  including ones human review missed. The source scan cleanly separates
  goddesign pages from pages built without it. All of this is reproducible from
  the artifacts in `runs/` and `experiments/`.
- **External validation (not complete).** Whether outside judges can tell
  goddesign pages from human-designed ones is the actual claim, and it is not
  settled. Study A generation is finished and the corpus is frozen; the outside
  rater responses are not in. Until they are, this project does not claim
  external validation, and the evidence badge on the front page stays as it is.

Author-run proofs move the machinery. Only external studies move the claim.

## Directory map

| Directory | What lives there |
|---|---|
| [`research/`](research/) | Sourced evidence reviews and evaluations of other people's work |
| [`protocols/`](protocols/) | Repeatable and pre-registered methods |
| [`experiments/`](experiments/) | Bounded tests of a single mechanism, each dated folder self-contained |
| [`runs/`](runs/) | Comparative render runs, with the built pages and screenshots kept alongside the report |
| [`studies/`](studies/) | Full evidence programs, including inputs, public receipts, and completion audits |
| [`tools/`](tools/) | Command-line entry points used only by validation work |

## Mechanism evaluations

Other people's design skills and reasoning skills, read against goddesign. Each
record states what was borrowed, what was declined and why, and the kill
criterion the borrowed mechanism ships under. Declining well is as much of the
record as adopting.

- [ADHD reasoning skill](research/adhd-evaluation-2026-07.md): parallel fan-out
  declined; four native leverage seams surfaced instead.
- [wayfinder skill](research/wayfinder-evaluation-2026-07.md): seven structural
  disciplines shipped as the design map; the issue-tracker substrate declined.
- [impeccable, ui-ux-pro-max, skillui](research/design-skills-evaluation-2026-07.md):
  the deterministic source scan, the severity split, inline waivers, and static
  token extraction shipped; the command surface, catalogue decks, edit-time
  hooks, live browser mode, and pattern generator declined.
- [impeccable v3.5.0, second pass](research/impeccable-evaluation-2026-08.md): no
  new mechanisms, but four places where goddesign stated a rule and did not
  enforce it. All four fixed.
- [Banned-list mechanization](research/banned-list-mechanization-2026-08.md): an
  attempt that produced zero new rules, kept as a refusal record because the
  reason generalizes.
- [watermarks-remover](research/watermarks-remover-evaluation-2026-08.md): its
  inspect-clean-verify discipline and confidence reporting ship as an optional,
  prompt-specified delivery adapter; default cleaning, automatic rewrites,
  evidence mutation, and anti-detection claims are declined.
- [pstack unslop](research/unslop-evaluation-2026-08.md): its post-draft review
  loop, specificity test, and source-or-delete discipline ship as a mode-aware
  frontend copy pass; universal word and grammar bans, automatic rewriting, and
  authorship implications are declined.

## Conventions

- Dated units use `name-YYYY-MM`.
- A dated experiment or run uses `README.md` as its entry point.
- Public protocols, metadata, receipts, and audits are tracked in git.
- Study `work/` and `sealed/` directories stay ignored: they hold generated
  working data or sensitive runtime material.
- Withdrawn evidence keeps a `WITHDRAWN-` prefix and is retained byte-unchanged
  rather than deleted, with a companion record naming every claim it touched.
- Captured provenance is immutable. Historical transcripts inside ignored working
  directories can retain the absolute paths that existed when the run occurred.
