# watermarks-remover evaluation, 2026-08

## Question

Which mechanisms in
[`guillaumemeyer/watermarks-remover`](https://github.com/guillaumemeyer/watermarks-remover)
improve a goddesign delivery without turning a design skill into an
anti-detection tool, adding a required dependency, degrading finished copy or
pixels by default, or destroying the provenance of its own validation record?

## Source frozen for this evaluation

- Repository: `guillaumemeyer/watermarks-remover`
- License: MIT
- Release: v0.4.0, published 2026-08-13
- Commit: `28eca2d91fd485213045b86896db671937432a48`
- Evaluated files: `skills/remove-ai-marks/SKILL.md`, its five references,
  seventeen scripts, tests, README, and license

No source code was copied. The shipped adapter delegates to a separately
installed companion and leaves its version and license boundary intact.

## What the source offers

The project separates several channels that are often collapsed into the word
"watermark":

| Channel | Mechanism | Confidence or cost |
|---|---|---|
| Invisible Unicode, bidi marks, tag characters, and exotic spaces | Deterministic text inspection and normalization | Verifiable by codepoint count |
| C2PA, EXIF, XMP, document properties, HTML metadata, Markdown frontmatter | Format-aware inspection and container cleaning | Verifiable for hard-bound fields, format-dependent |
| Statistical text marks | Paraphrase, humanize, back-translation, or structural regeneration | Best-effort and potentially voice-flattening |
| Pixel-domain image marks | External CtrlRegen pixel regeneration and optional reverse-SynthID scoring | Heavy, lossy, and not a universal certification |
| Directory and website surfaces | Aggregate reports with confidence classes | Useful for inventory, not an instruction to clean every hit |

Its strongest transferable discipline is procedural: inspect first, distinguish
confirmed from probable or informational findings, mutate a new output, inspect
again, and report verifiable changes separately from residual risk.

## Direct calibration on this repository

The installed v0.4.0 companion was run from the repository root with its default
hidden-directory exclusions plus explicit skips for dependency, build, study
work, and sealed directories:

```sh
python3 ~/.codex/skills/remove-ai-marks/scripts/audit_dir.py . --json \
  --skip .git,node_modules,dist,.vinext,.vite,.wrangler,work,sealed,outputs
```

The scanner classified 258 files:

| Measure | Result |
|---|---:|
| Confirmed findings | 3 |
| Probable findings | 15 |
| Informational findings | 2 |
| Likely false positives | 1 |
| Files marked actionable | 8 |
| Files with C2PA indicators | 4 |
| Files with AI-metadata indicators | 5 |
| Files with suspicious text | 3 |

The output contained both genuine signal and evidence against automatic use:

1. Three PNG files contained a parsed `caBX` chunk and were correctly reported
   as confirmed possible C2PA containers.
2. `skills/goddesign/SKILL.md` was marked probable because its frontmatter
   description contains the words that define an AI design skill. That text is
   functional metadata, not a provenance carrier to delete.
3. Two WebP validation images were treated as text, producing nonsense Unicode
   findings from compressed bytes. WebP is not listed in the upstream supported
   format matrix.
4. The frozen Study A corpus contains one left-to-right mark and was reported as
   probable. Even if the codepoint is removable in an ordinary deliverable,
   altering a frozen corpus would invalidate hashes and erase captured evidence.
5. C2PA inside generated-image validation proofs is itself provenance. Removing
   it would make the evidence weaker, not the product cleaner.

This calibration is not a defect score for the upstream project. It answers the
integration question: its reports require context, supported-format routing,
and a hard boundary around evidence.

## Adopted

| Mechanism | goddesign implementation | Boundary |
|---|---|---|
| Inspect before mutation | `references/provenance-hygiene.md` starts every requested pass with the narrowest inspect command | Post-gate and prompt-specified only |
| Confidence classes | Confirmed and probable findings are candidates; informational and likely-false-positive findings never trigger automatic mutation | Human or agent judgment remains in the loop |
| Clean a copy, then verify | New `*.cleaned.*` output is the default and the matching inspect command runs afterward | In-place cleaning requires an explicit request |
| Companion discovery | `scripts/provenance-hygiene.sh` locates an installed skill through an environment override, project-local directories, or common user skill directories | No install, update, account, or network side effect |
| Full capability delegation | The adapter exposes file, image, rewrite, directory, and website commands | The reference, not the adapter, decides when each is legal |
| Mutation invalidates checks | Source changes re-run the sweep; statistical rewrites and pixel regeneration re-run the full gate | A cleaned artifact cannot inherit a stale visual verdict |
| Honest reporting | Verifiable actions, best-effort work, and residual limits are separate fields | Never claim human authorship or universal undetectability |

## Declined

| Candidate | Reason |
|---|---|
| Default execution on every design | Provenance removal is not visual quality and the skill's purpose remains a good interface |
| Triggering goddesign on watermark-removal requests alone | That would widen a frontend skill into an unrelated file-cleaning product |
| Bundling or forking the upstream scripts | It duplicates a fast-moving independent project and obscures its license and update boundary |
| Automatic Layer B rewrite | It can flatten voice, change precision, and reshape layout after the page passed QA |
| Automatic pixel removal | It regenerates image content, requires a heavy external backend, and can alter the locked medium or subject |
| Whole-repository cleaning | Mixed trees contain unsupported binaries, source metadata, historical artifacts, and evidence whose provenance must remain intact |
| Cleaning `validation/` | Frozen hashes, receipts, C2PA, and captured codepoints are part of the record |
| Automatic website crawl | Core design stays offline and account-free; remote inspection runs only when the prompt asks for it |
| "Proves human-written" or "undetectable" language | Removal of one channel says nothing about authorship or vendor-only detectors |
| Recalibrating the design decks from hygiene hits | Unicode and metadata findings do not measure visual quality, distinctiveness, or outside judgment |

## Shipped contract

The feature remains in goddesign only while all of these hold:

1. A normal design run never reads the hygiene reference or invokes the
   companion.
2. The user must explicitly request the hygiene channel.
3. Missing Python or a missing companion reports
   `OPTIONAL HYGIENE UNAVAILABLE` and never changes the design score.
4. Frozen validation evidence is never mutated.
5. Statistical rewrite and pixel regeneration remain explicit, lossy paths.
6. Any mutation re-runs the checks it can invalidate.
7. Reports separate verified removals from best-effort work and residual risk.

If this optional lane begins influencing the DIRECTION LOCK, design score,
trigger surface, or ordinary dependency floor, remove it from goddesign and
leave the independent companion as a separately invoked skill.
