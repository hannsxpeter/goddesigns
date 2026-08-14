# Prompt-specified provenance hygiene

This is an optional delivery post-process, not a design mechanism. Run it only
when the user's prompt explicitly asks to inspect or remove invisible Unicode,
AI metadata, C2PA or Content Credentials, statistical text marks, or image
watermarks. A normal goddesign run never invokes it, never depends on it, and
never changes its QA score because the companion is unavailable.

The implementation delegates to the independent MIT-licensed
[`remove-ai-marks`](https://github.com/guillaumemeyer/watermarks-remover)
skill. `scripts/provenance-hygiene.sh` locates an existing install in common
project and user skill directories or through `REMOVE_AI_MARKS_SKILL_DIR`. It
does not install, update, copy, or phone home on behalf of the companion.

## Boundaries

- Process only content the user owns or is authorized to modify.
- Never describe a cleaned result as proven human-made or undetectable.
- Never clean `validation/`, frozen study inputs, receipts, manifests, signed
  artifacts, or captured evidence. Provenance can be the evidence there.
- Never make statistical rewriting or pixel regeneration automatic. Both can
  degrade the deliverable and require an explicit prompt request.
- Never make a remote website crawl, model endpoint, or external detector a
  dependency of ordinary design work.
- Prefer a new `*.cleaned.*` output. Use in-place cleaning only when the user
  explicitly asks for it and understands that the companion creates a backup
  only for its text cleaner, not for every container operation.

## Sequence

Run this only after the page has passed the normal goddesign gate. The design
gate answers whether the interface is good. This pass answers a separate
delivery-hygiene request.

1. Locate the companion:

   ```sh
   sh <skill-root>/scripts/provenance-hygiene.sh locate
   ```

2. Inspect before changing bytes. Use the narrowest command that fits:

   ```sh
   sh <skill-root>/scripts/provenance-hygiene.sh inspect-file public/hero.png --json
   sh <skill-root>/scripts/provenance-hygiene.sh inspect-image public/hero.png --json
   sh <skill-root>/scripts/provenance-hygiene.sh audit-dir dist --json
   sh <skill-root>/scripts/provenance-hygiene.sh audit-site --base https://example.com --json
   ```

   Treat `confirmed` and `probable` findings as candidates for action.
   `informational` and `likely_false_positive` findings are context, not an
   instruction to rewrite a file. Use directory audit only on a staging tree of
   formats the companion supports. As of upstream v0.4.0, unknown binary formats
   such as WebP can be classified as text and produce meaningless Unicode hits.

3. Clean only the requested channel, to a new output:

   ```sh
   sh <skill-root>/scripts/provenance-hygiene.sh clean-file public/hero.png -o public/hero.cleaned.png --json
   sh <skill-root>/scripts/provenance-hygiene.sh clean-file index.html -o index.cleaned.html --json
   ```

   The deterministic path covers invisible Unicode and supported container or
   image metadata. Keep non-AI metadata on images with
   `--keep-non-ai-metadata` when privacy stripping was not requested.

4. Use the lossy paths only when the prompt names them:

   ```sh
   sh <skill-root>/scripts/provenance-hygiene.sh rewrite-text copy.md -o copy.cleaned.md --strength paraphrase
   sh <skill-root>/scripts/provenance-hygiene.sh clean-image hero.png -o hero.cleaned.png --remove-pixel ctrlregen
   ```

   Statistical rewriting is best-effort and can flatten voice or change
   precision. Pixel removal regenerates pixels, requires the companion's
   external backend, can alter detail, and cannot certify official detector
   failure. Preserve facts, names, numbers, public identifiers, alt meaning,
   and functional strings.

5. Re-inspect the cleaned output with the matching inspect command. Report
   counts and actions separately from residual risk. Hard-bound metadata can be
   verified as removed; statistical text marks, soft-bound C2PA, and residual
   pixel marks cannot be universally certified.

6. Re-run the checks invalidated by the mutation:
   - Metadata-only image cleaning: compare pixel dimensions and render once.
   - HTML, Markdown, or source cleaning: re-run the source sweep and the
     relevant functional tests.
   - Statistical rewrite or pixel regeneration: re-run the full goddesign gate,
     including the visual audit, because copy shape or image content changed.

## Reporting

Keep this result separate from the design verdict:

```text
Provenance hygiene: requested and completed
Verified removal: 2 invisible codepoints; 1 PNG C2PA chunk
Best-effort work: none
Residual limits: soft binding and vendor-only detectors were not tested
Design QA: unchanged; post-clean render rechecked
```

If the companion or Python is missing, report
`OPTIONAL HYGIENE UNAVAILABLE: <reason>`. Do not call the design run degraded,
lower its score, or withhold the already-complete interface.
