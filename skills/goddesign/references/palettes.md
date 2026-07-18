# Palette Families and Color Math

Use this file when the brief constrains the direction's colors (brand hue exists), when the reroll rule forces a palette swap, or when you need to extend a direction's 5 tokens into a full ramp. Otherwise the direction row's colors stand as written.

## The 10 families (indexed 0-9)

Each family gives the 5 required roles. Values are OKLCH: `oklch(L C H)`. These are the anchors; build ramps with the math below.

0. **Forest and Bone** (light, natural, calm)
   bg oklch(0.97 0.010 110) | surface oklch(0.93 0.015 110) | text oklch(0.22 0.030 145) | muted oklch(0.50 0.030 140) | accent oklch(0.45 0.110 150)
1. **Oxide** (dark, mechanical, warm accent)
   bg oklch(0.18 0.010 260) | surface oklch(0.24 0.012 260) | text oklch(0.93 0.005 80) | muted oklch(0.65 0.010 80) | accent oklch(0.62 0.160 45)
2. **Ultramarine and Chalk** (light, gallery, one loud blue)
   bg oklch(0.96 0.005 250) | surface oklch(0.91 0.010 250) | text oklch(0.20 0.020 260) | muted oklch(0.52 0.020 255) | accent oklch(0.45 0.260 264)
3. **Phosphor** (dark, CRT, electric green)
   bg oklch(0.15 0.020 150) | surface oklch(0.20 0.025 150) | text oklch(0.90 0.060 145) | muted oklch(0.62 0.050 148) | accent oklch(0.85 0.230 145)
4. **High Desert** (light, warm mineral, cool accent)
   bg oklch(0.95 0.020 85) | surface oklch(0.90 0.030 80) | text oklch(0.25 0.020 60) | muted oklch(0.52 0.030 70) | accent oklch(0.45 0.120 250) | secondary oklch(0.70 0.130 80)
5. **Ink and Tomato** (light, editorial, hot accent)
   bg oklch(0.97 0.005 220) | surface oklch(0.92 0.008 220) | text oklch(0.19 0.015 250) | muted oklch(0.50 0.015 240) | accent oklch(0.58 0.210 30)
6. **Glacier** (light, cool, quiet)
   bg oklch(0.96 0.010 220) | surface oklch(0.91 0.015 220) | text oklch(0.25 0.040 250) | muted oklch(0.53 0.030 235) | accent oklch(0.40 0.100 250)
7. **Aubergine and Verdigris** (dark, plush, cool patina accent)
   bg oklch(0.19 0.030 330) | surface oklch(0.25 0.035 330) | text oklch(0.92 0.010 90) | muted oklch(0.68 0.020 60) | accent oklch(0.70 0.100 160)
8. **Butter and Cocoa** (light, warm, edible)
   bg oklch(0.96 0.030 90) | surface oklch(0.92 0.040 88) | text oklch(0.25 0.040 55) | muted oklch(0.50 0.040 70) | accent oklch(0.42 0.090 55) | highlight oklch(0.83 0.160 90)
9. **Concrete and Signal** (neutral, architectural, one safety accent)
   bg oklch(0.94 0.005 260) | surface oklch(0.89 0.006 260) | text oklch(0.21 0.005 260) | muted oklch(0.52 0.006 260) | accent oklch(0.58 0.160 45)

## Ramp math (when you need more than 5 tokens)

- Step lightness on an S-curve, hold hue constant: L = 0.96, 0.93, 0.88, 0.80, 0.70, 0.55, 0.42, 0.32, 0.22.
- Chroma follows a bell over the ramp: 0.02-0.04 at both ends, peak 0.09-0.20 in the middle steps. Never exceed 0.32 (the sRGB ceiling, reached only near blue and magenta hues); most hues clip between roughly 0.14 and 0.26 at mid lightness and lower at the ramp ends, so if a color renders duller than specified, lower C until it is back in gamut.
- Neutrals are never zero-chroma: tint them toward the brand hue at C = 0.005-0.015.
- Secondary hues come from fixed offsets of the anchor hue: +180 (complement), +120 (triad), or +30 (analogous). Pick one offset, not several.
- Interactive states, no manual conversion needed:
  `--accent-hover: oklch(from var(--accent) calc(l - 0.1) c h);`
  `--accent-active: oklch(from var(--accent) calc(l - 0.16) c h);`
  `--accent-subtle: oklch(from var(--accent) 0.93 calc(c * 0.25) h);`

## Brand hue adaptation

When the brief supplies a brand color: set it as the accent anchor, rebuild the ramp around its hue with the math above, and re-tint all neutrals toward that hue at C = 0.005-0.015. Keep the chosen direction's lightness bands (a dark direction stays dark).

## Hard rules

- 60-30-10: bg family covers about 60% of any viewport, surfaces about 30%, accent at most 5%. Accent goes on CTAs, links, and state only.
- Contrast floors: 4.5:1 body text, 3:1 for text 24px+ (or 18.66px bold+) and for UI component boundaries and focus rings.
- Never pure #000 or #FFF as page background; never zero-chroma gray text on a colored background.
- Dark mode: surfaces at L 0.15-0.25 in the brand hue, accents desaturated 20-30% versus light mode, elevation expressed by raising surface L by 0.05-0.08 per level, not by bigger shadows.
