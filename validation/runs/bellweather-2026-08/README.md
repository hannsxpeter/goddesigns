# Bellweather Salt Works, 2026-08-04

A gated goddesign run on Claude Code, made to close the standing gap in `validation/research/impeccable-evaluation-2026-08.md`: every v1.6.2 change had shipped without a single page being designed under it. This run exercises all five fixes against a real build and a real render.

It is **one gated run, not the maintainer proof**. No baseline arm, no second host, no same-brief pair. It proves the mechanisms work on a real page; it does not move the README's core claim.

## Why a Tailwind v4 shape

The run was briefed onto Tailwind v4 deliberately, because v1.6.2 fixed `@theme` blindness in `scripts/sweep.mjs` and nothing in the corpus used `@theme`.

The build measured the thing first. A browser was given a page whose only token source was `@theme`:

```css
@theme { --color-bg: #0E0C08; }
:root  { --fallback: #123456; }
body   { background: var(--color-bg, var(--fallback)); }
```

The rendered body pixel came back `(18, 52, 86)`, which is `#123456`, the fallback. **Browsers drop `@theme` contents entirely without a Tailwind build.** That is precisely why the sweep fix mattered: in a v4 repo the authored tokens live somewhere only a source reader can see, so the gate has to read them there or it does not read them at all.

So the run ships both halves of the real pipeline:

- `styles.src.css` is the authored v4 source. Tokens in `@theme`. This is the artifact that exercises the parser fix.
- `styles.css` is the built output the page links. Same tokens emitted to `:root`, which is what Tailwind v4 does and what the browser needs.

`styles.css` is generated from `styles.src.css`; edit the source. Both carry the stamp and both were swept.

## DIRECTION LOCK

```
Seed: 2110904443 | Structure: 4 Workbench | Direction: 11 Luxury Serif
Rolled 10 Playful Pop; advanced to 11 because the ledger's last two entries are both
light paper and both "other" accent, and Playful Pop (#FFF8EF) would make it three.
Rotation: differs from last run on paper band (dark) + accent band (neutral)
Tokens: --bg #0E0C08 | --surface #171410 | --text #EFE9DC | --muted #9C917C
        --accent #C9CFDA | --hairline #2E2A22
Jitter: h+9 L+0 r+0 | --accent: oklch(from #C9CFDA l c calc(h + 9)) -> H 262.7 to 271.7
        bg/surface L+0 and radius 0 are the roll's own values, not skips
Type: Bodoni Moda 500 display / Manrope 300+400 body / Manrope 600 caps labels +12%
Scale: body 17px/1.55 | display 1.08 | hero ceiling 6rem (row states no vw range)
Layout: app-frame. Top bar, one dense pan-log panel, supporting rails.
Signature: the harvest-window Baume reading as an enormous didone numeral
Grammar: (a) pan log full-bleed, overlaps hero by -96px | (b) grain band opens on bare
  numerals, no heading ceremony | (c) pan log's bittern row spans all columns; grain
  grid's pack note spans | (d) tours band is the shortest by a wide margin
  paddings 64/96/128/160
Motion: 2 total. Hero opacity fade 500ms; hover opacity and border-color 200ms.
  No scroll reveal anywhere, and no script on the page at all.
Atmosphere: solid ground per row; depth from the panel overlapping the hero boundary,
  a 1px hairline pan lattice in the grain band, and the bg -> surface shift
```

The subject supplies the matter: degrees Baume is the density reading that decides the day a pan is raked, so the signature is the operation's governing instrument rather than an ornament, and the pan log is the product working rather than asserted.

## Gate results

**Phase 2a, sweep: exit 0**, across all three files. Two advisories, both `ornament-kit` "hatched placeholder fill" on the pan lattice. Justified against the lock rather than fixed: the lattice is the declared Atmosphere layer, drawn in the row's own 1px hairline, standing for the pan grid seen from above. It is ground treatment, not a placeholder tile covering absent content. This is the legal case advisory severity exists for.

**Phase 3, audit: exit 0** at 375, 768, and 1280. No overflow, no collisions, no hidden text, no undersized targets, no font fallback. Both webfonts confirmed loaded (`Bodoni Moda`, `Manrope`), and the import answers HTTP 200.

**Blind read: identity strong.** A separate process, shown only the two screenshots and never the code or the lock, returned:

```json
{
  "paper_band": "dark",
  "display_class": "serif",
  "signature": "oversized 26.5 salinity reading paired with the pan log",
  "subject": "an artisanal tidal salt works selling sea salt, sharing harvest conditions, and booking tours",
  "identity": "strong"
}
```

Paper band, display class, signature, and subject all match the lock. It read `accent_band` as "warm ivory" where the lock says cool platinum; that is the expected reading of a deliberately near-neutral accent (OKLCH chroma 0.0166), where the dominant light value on the page is the ivory text rather than the accent. The `ai_tell` it named was the demo labelling itself (sample email, 555 number, disclaimer), which the honesty gate requires of a demonstration build.

## Correction: this run's own tokens were not scanned when it was gated

Recorded rather than quietly re-run, because the run's Phase 2a result was weaker than it looked at the time.

`rulesOf()` in `sweep.mjs` read everything before the first `{` as the selector. A statement at-rule such as `@import` ends in a semicolon and carries no block, so the text before the next brace still began with `@`, the parser read the **next** rule as an at-rule container, and its declarations were never scanned. This stylesheet leads with the mandated webfont `@import` and then the token block, which is exactly the shape the skill prescribes, so **the token block was swallowed**.

Measured by injecting a banned face into the token block of the shipped `styles.css`: the sweep reported green. After the parser fix it reports `banned-font ... (--font-body)` on the same file.

The fix is in `sweep.mjs`, with a regression test. The corpus split for it was zero change across all 49 pre-existing artifacts, and three files in the repo had a swallowed first rule: both of this run's stylesheets and `validation/runs/kilnhouse-2026-07/codex-v2-meridian.html`. This run was re-gated afterwards and is still **sweep exit 0**, so its result stands; what changed is that the result is now actually evidence.

## Three defects the run caught, and which half caught them

Recorded because the split is the point of having two halves plus a human look.

1. **An `<hr>` divider in the footer.** Caught by reading the Banned list while writing, before any gate ran. Would have been a `hr-divider` fail.
2. **Contact links 22px tall, under the 24px target floor.** Caught by **the audit**, invisible to the sweep. Fixed by giving them a 44px minimum height. One fix cycle, lock frozen.
3. **The secondary CTA occluded on mobile.** Caught by **looking at the render**, and by neither half of the gate. The panel's declared `-96px` overlap is grammar break (a); below 900px the hero's bottom padding was 64px, so the panel slid up over the "Book a harvest tour" button and painted it out. Z-order occlusion by a sibling section is not a text-on-text collision and not an opacity-0 reveal, so `audit.mjs` reports clean. Fixed by raising the mobile hero bottom padding to 160px so the overlap lands on padding, never on content.

A fourth, smaller one: the secondary button's border was `--hairline` on the page ground, measured at **1.37:1**, under the craft floor's 3:1 for a UI boundary, which is why it read as absent even where it was not occluded. Moved to `--muted` at 6.28:1.

Defect 3 is the useful finding for the skill itself. It is a real defect class that both mechanical halves are blind to, and it argues that Phase 3's "render the page and look at it" is load-bearing rather than ceremonial.

## What each v1.6.2 fix did here

- **`@theme` parsing**: `styles.src.css` was swept as a first-class file and its token block was read. Before v1.6.2 that block was invisible and the file would have passed without its tokens ever being checked.
- **System stack in the chosen-face position**: `--font-body: Manrope, ui-sans-serif, sans-serif` puts `ui-sans-serif` in the fallback tail, where the new rule correctly stays silent. The run is a live negative test of the narrowing.
- **`arial black`**: not exercised. No system display face was used.
- **Deck integrity in `verify-install.sh`**: ran green at Step 0 preflight.
- **`DEGRADED: no sweep`**: not exercised. Both halves ran, so no degraded state was reached and none is claimed.

## Files

| File | What it is |
|---|---|
| `index.html` | The page. No script tag; renders complete with JS off. |
| `styles.src.css` | Authored Tailwind v4 source, tokens in `@theme`. |
| `styles.css` | Built output the page links, tokens on `:root`. Generated. |
| `shot-1280.png`, `shot-375.png` | Full-page captures fed to the blind read. |
| `audit-1280.png`, `audit-768.png`, `audit-375.png` | The audit's own captures. |
| `hero-375.png` | Mobile hero viewport after the defect 3 fix, showing both CTAs clear of the panel. |
| `audit.json` | Measured audit output, exit 0. |
| `.design-log.json` | The run's ledger entry. |

## Effect on the corpus

This run adds `index.html` to `validation/runs/`, taking the sweep corpus from 49 HTML artifacts to 50. The corpus splits quoted in `CHANGELOG.md` for v1.6.2 (1452 findings before and after) were measured at 49, before this run existed, and remain accurate as of that measurement. `scripts/sweep.test.mjs`'s separation test picks named directories (kilnhouse, wayfare, ledgerbird) and does not include this one, so the assertions are unaffected. It is a clean goddesign artifact at exit 0, so it belongs to the skill-run population if the separation test is ever widened.

## Honesty

Bellweather Salt Works is not a real company. Every pan reading, contact route, and commercial term on the page is illustrative sample data, labelled as such on the page itself and in the table caption. No testimonials, logos, or people were invented, and no raster imagery was generated. The salt-making vernacular (degrees Baume, concentrator and crystallizer pans, fleur de sel and coarse grades, bittern draw-off) is real domain language, used because specificity is the anti-slop lever.
