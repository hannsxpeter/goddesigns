# Comp-first pipeline: end-to-end proof, 2026-07-18

The owner proposed it: when image generation is available, generate an image of what the site should look like, then replicate it in HTML. Validated same day, full pipeline:

1. **Comp**: genimage.sh (codex rung) rendered a lock-derived full-page mockup of a cinematic venue-management landing page (comp-first-proof.png). The comp arrived with legible, coherent content, including arithmetically correct settlement math.
2. **Replication**: a Claude builder read the comp and rebuilt it as production HTML (comp-first-replication.html/png) under the authority rules: comp governs composition, lock governs values, zero text transcription. Compositional fidelity is high: offset calendar-as-hero, full-bleed generated concert band with 80px overlap, settlement split resolving to a giant ice payout, grouped bar-closeout table.
3. **Principled deviations only**: fresh demo data with exact arithmetic (the comp's own column math was wrong; the build cross-foots), accent restricted per lock where the comp overused it, added interaction/hold/disabled states, Sample-data honesty labels, responsive stacking below 960px.
4. **Imagery chain fired organically mid-run**: the builder (Claude host) called genimage.sh for the concert band, compressed 2172px source to a 32KB webp sibling, disclosed AI generation in alt text.
5. **Audit loop earned its keep**: cycle 2 root-caused a subtle overflow (sr-only spans escaping the scroll clip via the wrong positioning context); green by cycle 3.

Verdict: the image model is a viable muse and the code model a faithful craftsman; comp-first stands as the EXPAND-lane default and a DIVERGE option. The three DNA sources (deck, human genomes, image comps) are all now proven in runs.

## SVG-first: FAILED

Owner-proposed fallback (build the whole site as SVG, then convert). The experiment failed, per the owner's verdict, and the record should say so plainly: the comp shipped with misaligned sections (hand-placing thousands of coordinates at page scale is the medium working against the task), the render pipeline hung repeatedly (top-level file:// SVGs with remote font @imports stall Chromium's load event; procedural filters over a 3420px canvas are expensive), a clean render of the final comp was never obtained, and the conversion step never ran. No part of the hypothesis was validated. What the failure cost: one agent run and an hour. What it bought: the failure modes are now known, and the test-first protocol did its job: nothing touched the skill. Raster comp-first remains the only proven page-scale comp avenue.
