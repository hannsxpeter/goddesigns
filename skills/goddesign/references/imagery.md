# Imagery

Load only when the run needs pixels: the seeded macrostructure is Photographic, the direction row's signature calls for an image, or the brief demands product or atmospheric imagery. Any other run gets no raster imagery; whitespace, type, and the row's stated art carry the page.

## Generating

Pixels come from `scripts/genimage.sh` next to this skill (it delegates to an installed image-capable CLI; Codex has built-in generation, and hosts without native image tools, including Claude, get pixels by shelling out):

```sh
sh <skill-root>/scripts/genimage.sh "<art-directed prompt>" hero.png
```

Exit 0 writes the file; exit 2 means no capable tool, and the fallback is the direction row's CSS/SVG art direction, never a stock-photo cliche and never skipping the visual moment the structure demands.

## The prompt is part of the DIRECTION LOCK

A generated image freestyled outside the lock is slop with extra steps. Derive every prompt from the lock and write the prompt into the lock before generating:

```
<subject from the brief>, <medium the row implies: flat riso-print illustration /
duotone photograph / blueprint line drawing / archival etching / macro product photo>,
palette strictly limited to <the locked hexes, named>, single subject with negative
space where the headline sits, one light source matching the page's shadow direction,
no text or lettering, no watermark, no glossy 3d render look, no neon purple-blue,
no photorealistic human faces
```

The negative clauses are mandatory: the default AI-image look (glossy 3D, neon gradients, uncanny people, baked-in gibberish text) is a recognized tell that undoes everything else the skill enforces.

## Comp-first mode (the image model as muse, the code model as craftsman)

When an image tool is available (native, or via genimage.sh), a run may generate ONE design comp after the DIRECTION LOCK and before any code: a mockup of what the page should look like, which the build then replicates. This plays to a measured strength: literal-execution models reproduce a given design far better than they invent one, and an image model's aesthetic distribution is different DNA from a code model's. Recommended by default on the EXPAND lane; optional on DIVERGE.

The comp prompt derives from the lock, like every image prompt:

```
flat full-page website mockup, straight-on screenshot, no device frame, no browser
chrome, no perspective, <macrostructure in one clause>, <subject> as the content world
with <its artifacts named>, palette strictly limited to <locked hexes named>,
<display class> headlines, greeked placeholder text acceptable, <the row's atmosphere>,
<the declared grammar breaks, e.g. one full-bleed band, uneven section rhythm>,
no glassmorphism, no purple-blue gradients, no glossy 3d render look, no watermark
```

Rules of authority: the comp governs composition, proportions, density rhythm, and atmosphere; the LOCK stays authoritative for exact hexes, font families, spacing tokens, and all copy. Comp text may come out legible and even coherent (validated in testing: correct settlement math, plausible band names), but never transcribe it into the build; treat it as layout-weight evidence only, and write real copy fresh. Where comp and lock conflict, the lock wins. One comp, maximum one regeneration, then build. At Phase 3, the comp is the run's own reference: the reference-match gate compares the rendered page against it side by side, and layout drift from the comp needs the same stated justification as any reference mismatch. Save the comp next to the page as comp.png; it ships with the run's artifacts.

## Rules

- One generated composition per page maximum; it lives inside the hero budget or the row's stated image slot.
- Never bake text into an image; type is HTML.
- Honesty: never generate people presented as customers, team, or testimonials; humans appear only as clearly illustrative figures. Product-screenshot imagery is labeled demo, same as data.
- Alt text always; `aria-hidden` only if the image is purely decorative AND the row says so.
- Single-file builds: a raster over 200KB stays a sibling file next to index.html, not a base64 blob. Compress (`cwebp`, `sips -Z`, or whatever exists) toward the display size; a 1254px source shown at 600px ships resized.
- The QA gate checks: image matches the locked palette and mood on the rendered page; if it fights the lock, regenerate with a corrected prompt or fall back to the row's art. Maximum 2 regeneration attempts, then fall back; do not keep pulling the slot machine.
