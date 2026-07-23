# Direction Deck

17 complete aesthetic directions, indexed 0-16 (row 16 is the first human-genome row, derived from a real human-built site). Pick the row your seed selected. Each row is a full package: execute it as written. Do not blend rows. Do not substitute values unless the user's brief or the reroll rule forces it; when it does, swap in a row from `palettes.md` or `fonts.md` by index and say so. One systematic exception: SKILL.md Step 3d's seeded jitter rotates the accent hue and nudges bg/surface lightness via the relative-color idiom below; the jittered values are the values you execute.

Colors are hex and are the source of truth. Derive hover/active shades with relative color: `oklch(from var(--accent) calc(l - 0.1) c h)`.

Every direction uses the shared spacing token scale (4, 8, 12, 16, 24, 32, 48, 64, 96, 128) unless its row says "dense" (drop 96/128, add 2) or "airy" (add 160).

Mono faces appear only in rows where mono is the concept (1 Industrial, 3 Terminal Core, 6 Lo-Fi Riso, 8 Data-Dense). Do not add a mono utility face to any other row; their labels come from the body family with weight, case, and tracking.

---

## 0. Swiss International

Fits: product marketing, agencies, portfolios, docs. Discipline and clarity.
- Colors: bg #FAFAF8, surface #F0F0EC, text #111114, muted #55565C, accent #E63312
- Type: display Archivo 800 (tight, -0.03em), body Schibsted Grotesk 400/500, labels Archivo 500 uppercase +10% tracking
- Import: `https://fonts.googleapis.com/css2?family=Archivo:wght@500;800&family=Schibsted+Grotesk:wght@400;500&display=swap`
- Radius: 0. Shadows: none; structure comes from 1px #D8D8D2 rules and whitespace.
- Background: flat; make the layout grid visible (exposed column rules or a thin baseline grid on one band).
- Signature: one oversized numeral or a single thick red rule that aligns the whole page.
- Motion: 150ms linear fades only. No entrance choreography.

## 1. Industrial

Fits: dev tools, infrastructure, hardware, logistics.
- Colors: bg #12110E, surface #1A1A18, text #E6E6E2, muted #8A8A84, accent #FF4F00 (international safety orange; amber/gold on dark is a flagged tell, do not warm this toward yellow)
- Type: display Big Shoulders 800 (condensed, uppercase), body IBM Plex Sans 400, numerals JetBrains Mono 500
- Import: `https://fonts.googleapis.com/css2?family=Big+Shoulders:opsz,wght@10..72,800&family=IBM+Plex+Sans:wght@400;600&family=JetBrains+Mono:wght@500&display=swap`
- Radius: 2px. Borders: 1px #2A2A26. Shadows: none.
- Background: solid; one fine 45deg hazard-stripe strip (accent at 15% opacity) used exactly once as a divider.
- Signature: spec-sheet blocks: labeled data rows with mono numerals, like a machine faceplate.
- Motion: 250ms linear. State changes snap; nothing bounces.

## 2. Brutalist Raw

Fits: statement sites, studios, events, personal sites.
- Colors: bg #F2EFE9, surface #E7E2D8, text #151410, muted #5C5952, accent #D8008F (magenta; the red-orange it replaced collided with Swiss, do not drift back warm)
- Type: display Syne 800 at enormous sizes (12-20vw allowed, crop at container edges), body Libre Franklin 400, labels Libre Franklin 600 uppercase +8% tracking
- Import: `https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Libre+Franklin:wght@400;600&display=swap`
- Radius: 0. Borders: 2px solid #151410. Shadow: none; depth comes from raw overlap and borders alone. Hard offset shadows belong to row 14 exclusively; the offset-shadow-plus-tilt kit is a flagged Claude default.
- Background: solid. Let type collide with edges and section boundaries on purpose.
- Signature: one element that crosses a section boundary (a word, an image, a rule).
- Motion: one overshoot on the hero only, 350ms cubic-bezier(0.34,1.56,0.64,1). Everything else instant.

## 3. Terminal Core

Fits: CLIs, security, dev infrastructure, hacker-adjacent products.
- Colors: bg #0A0E0A, surface #101710, text #D2E8D2, muted #6E8A6E, accent #33FF66 (amber variant: #FFB000 if the brief reads industrial)
- Type: display and UI IBM Plex Mono 600 (headings uppercase, +8% tracking), long body IBM Plex Sans 400
- Import: `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400&display=swap`
- Radius: 2px. Borders: 1px #1E2A1E.
- Background: solid; optional single scanline or vignette layer at under 5% opacity.
- Signature: prompt-prefixed headings ("$ deploy") and one blinking block cursor (steps(1) animation, honors reduced motion).
- Motion: one typewriter reveal in the hero (30ms per character, once). Elsewhere instant.

## 4. Retro-Futuristic

Fits: music, gaming, events, consumer apps with attitude.
- Colors: bg #05060E, surface #101226, text #EDEDF7, muted #8B8DA6, accent #61F4DE, secondary #FF6AD5 (this row legitimately uses two accents)
- Type: display Michroma 400 (wide, uppercase), body Albert Sans 400, labels Albert Sans 600 uppercase +12% tracking
- Import: `https://fonts.googleapis.com/css2?family=Michroma&family=Albert+Sans:wght@400;600&display=swap`
- Radius: 8px. Borders: 1px rgba(97,244,222,0.25).
- Background: dark gradient mesh (3 radial-gradients, blurred 28px) plus one horizon grid in the hero only.
- Signature: neon glow (layered text-shadow in accent) on exactly one element.
- Motion: 400ms ease-out entrances; a slow 8s hue drift on the hero glow only.

## 5. Organic Modern

Fits: wellness, food, sustainability, crafts.
- Colors: bg #EFEDE3, surface #E4E1D2, text #23291F, muted #5E644E, accent #3E5A3A, warm secondary #C89B3C
- Type: display Young Serif 400, body Nunito Sans 400, labels Nunito Sans 700 uppercase +8% tracking
- Import: `https://fonts.googleapis.com/css2?family=Young+Serif&family=Nunito+Sans:wght@400;700&display=swap`
- Radius: 20px, plus one organic blob mask (border-radius: 40% 60% 55% 45% / 55% 45% 60% 40%) on a single image.
- Background: paper grain (SVG feTurbulence, 8-12% opacity) over the bg color.
- Signature: one full-width inversion band (background flips to the deepest green, light text) used exactly once.
- Motion: 500ms ease-out, gentle rises. Nothing bounces.

## 6. Lo-Fi Riso

Fits: zines, newsletters, community projects, indie tools.
- Colors: bg #F6F3EB, surface #ECE8DC, text #24242C, accent #0078BF (riso blue), secondary #FF48B0 (fluoro pink), muted #62626E
- Type: display Alfa Slab One 400, body Atkinson Hyperlegible 400, utility Space Mono 400 (typewriter is authentic risograph print craft; mono is deliberate in this row)
- Import: `https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Atkinson+Hyperlegible:wght@400;700&family=Space+Mono&display=swap`
- Radius: 4px. Borders: 2px solid #24242C.
- Background: halftone dot pattern (radial-gradient dots) at 6% opacity on one band.
- Signature: misregistration: one heading with `text-shadow: 2px 0 #FF48B0`, and one sticker element rotated -3deg.
- Motion: 200ms steps(3) or none. Deliberately lo-fi.

## 7. Editorial Magazine

Fits: content-led products, journals, agencies, longform.
- Colors: bg #FBFAF7, surface #F1EFE8, text #16150F, muted #6B685C, accent #B01C2E
- Type: display Newsreader 600 (opsz high), body Source Serif 4 400, kickers Archivo 600 uppercase +10% tracking
- Import: `https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,600&family=Source+Serif+4:opsz,wght@8..60,400&family=Archivo:wght@600&display=swap`
- Radius: 0-2px. Dividers: double rule (3px + 1px pair), never a lone hairline everywhere.
- Background: solid paper.
- Signature: a drop cap and one pull quote that crosses column boundaries.
- Motion: 250ms fades. Content leads; motion follows.

## 8. Data-Dense Pro

Fits: dashboards, analytics, trading, internal tools. Dense spacing scale.
- Colors: bg #1A1815, surface #22201C, text #EDEDE6, muted #9A9A8E, accent #FAFF69, positive #4ADE80, negative #F87171
- Type: display Familjen Grotesk 600, body IBM Plex Sans 400, numerals IBM Plex Mono 500 with `font-variant-numeric: tabular-nums`
- Import: `https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@600&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap`
- Radius: 4px. Rules: 1px #2E2E2A. Shadows: none; layers separate by surface lightness.
- Background: solid. Density is the aesthetic: compressed spacing (2, 4, 8, 12, 16, 24).
- Signature: dense stat tables with mono numerals; charts only when the data is real.
- Motion: 120-180ms linear on state changes only. Zero entrance choreography.

## 9. Cinematic Dark

Fits: film, photography, luxury tech, portfolio.
- Colors: bg #0B0B0F, surface #14141C, text #EAE8E4, muted #8F8D96, accent #38B6FF (ice; the crimson it replaced clustered with Editorial and Playful, do not drift back red)
- Type: display Cormorant Garamond 600 at large sizes only (56px+), body Public Sans 400, labels Public Sans 600 uppercase +10% tracking
- Import: `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Public+Sans:wght@400;600&display=swap`
- Radius: 8px. Shadows: soft layered, hue-tinted toward bg.
- Background: radial vignette plus film grain at 6%; full-bleed imagery treated duotone (bg + accent).
- Signature: letterboxed full-bleed hero; optional slow 8s Ken Burns drift (must honor reduced motion).
- Motion: 600ms ease-out entrances, 40ms stagger, then quiet.

## 10. Playful Pop

Fits: consumer apps, community, education, marketing with energy.
- Colors: bg #FFF8EF, surface #FFEFD9, text #201A33, muted #6E6680, accent #FF4D6D, secondary #2EC4B6, highlight #FFC53D
- Type: display Bricolage Grotesque 800, body Karla 400, labels Karla 700 uppercase +8% tracking
- Import: `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Karla:wght@400;700&display=swap`
- Radius: 16px. Borders: 2px solid #201A33. Shadow: die-cut sticker treatment: a 3px paper-colored outline ring (`box-shadow: 0 0 0 3px` in bg) under one soft 12%-opacity drop; never a hard offset (that belongs to row 14 exclusively).
- Background: solid warm; one oversized tilted shape or sticker (max one).
- Signature: springy buttons: this is the one row allowed cubic-bezier(0.34,1.56,0.64,1) on hover, 250ms.
- Motion: 250ms spring on interactive elements; entrances 300ms ease-out.

## 11. Luxury Serif

Fits: fashion, jewelry, hospitality, premium services. Airy spacing scale.
- Colors: bg #0E0C08, surface #171410, text #EFE9DC, muted #9C917C, accent #C9CFDA (cool platinum against the warm base; no gold), hairline #2E2A22
- Type: display Bodoni Moda 500 (huge, tight), body Manrope 300/400, labels Manrope 600 uppercase +12% tracking
- Import: `https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500&family=Manrope:wght@300;400;600&display=swap`
- Radius: 0. Rules: 1px #2E2A22.
- Background: solid; section padding 128-160px; whitespace is the luxury.
- Signature: enormous didone numerals or prices; letter-spaced caps labels.
- Motion: 500ms opacity fades only. Nothing moves position.

## 12. Neo-Grotesque Poster

Fits: agencies, campaigns, launches, portfolios.
- Colors: bg #EDEDEB, surface #E2E2DF, text #0F0F10, muted #5F5F63, accent #2B4BFF
- Type: display Anton 400 uppercase at 12-20vw, body Hanken Grotesk 400, labels Hanken Grotesk 600 uppercase +10% tracking
- Import: `https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;600&display=swap`
- Radius: 0. Borders: 1px #C9C9C4.
- Background: solid; the type is the layout. Compose words as blocks; crop one at the viewport edge.
- Signature: one word deliberately breaking its container.
- Motion: one marquee strip (30s linear, pausable, reduced-motion safe); subtle skew on hover.

## 13. Art Deco Geometric

Fits: events, restaurants, bars, boutique brands.
- Colors: bg #101C1C, surface #162626, text #EAE3CF, muted #93998C, accent #D4AF37 (period metallic: the deck's one deliberate gold row), secondary #1F6F5C
- Type: display Poiret One 400 (large, letter-spaced), body Josefin Sans 300/400, labels Josefin Sans 600 uppercase
- Import: `https://fonts.googleapis.com/css2?family=Poiret+One&family=Josefin+Sans:wght@300;400;600&display=swap`
- Radius: 0; one chamfered panel via clip-path.
- Background: one band with a geometric SVG pattern (sunburst or fan) at 6-10% opacity; 3px double gold borders.
- Signature: a fan or sunburst divider drawn in accent.
- Motion: 400ms ease-out; one gold line draw-in (stroke-dashoffset) on first section.

## 14. Neobrutalist Web

Fits: SaaS with attitude, indie tools, portfolios. Chosen deliberately, never as a reflex.
- Colors: bg #F5F5F0, surface #FCFCF9, text #141310, muted #55555A, accent #00D26A (green; the ultramarine it replaced twinned with Neo-Grotesque Poster), secondary #FFDD33
- Type: display Darker Grotesque 800, body Jost 400, labels Jost 600 uppercase +8% tracking
- Import: `https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@800&family=Jost:wght@400;600&display=swap`
- Radius: 10px everywhere. Border: 3px solid #141310. Shadow: `5px 5px 0 #141310`.
- Background: solid; one oversized outlined shape behind a section.
- Signature: chunky tag chips and a toggle that looks physically pressable.
- Motion: hover translate(-2px,-2px) with shadow growing to 7px, 150ms; press inverts it.

## 15. Soft Craft

Fits: note apps, journals, education, personal tools.
- Colors: bg #F7F4EE, surface #EFEAE0, text #2E2A24, muted #6C6459, accent #4E7A6A, highlight #F2C14E
- Type: display Gloock 400, body DM Sans 400, labels DM Sans 600 uppercase +8% tracking
- Import: `https://fonts.googleapis.com/css2?family=Gloock&family=DM+Sans:opsz,wght@9..40,400;9..40,600&display=swap`
- Radius: 12px. Shadow: soft, layered, tinted toward bg hue.
- Background: paper grain at 6%.
- Signature: a scalloped or torn-paper section divider (SVG mask).
- Motion: 300ms ease-out; one card tilts 2deg on hover, nothing else.

## 16. Trade Counter

Fits: local services, trades, shops, clinics, anything that lives on phone calls and trust. Genome: vantage=5 | source=unrecorded-preschema | captured=2026-07 (derived from a real human-built local trade site, the deck's first externally-sourced row; its human traits are the point, do not polish them away; predates the v1.3.0 provenance schema, so the source domain was not retained).
- Colors: bg #F6F6F4, surface #ECECEA, text #17181A, muted #5E6065, accent #E42313 signal red. This row overrides the accent budget: the accent floods entire CTA bands at full coverage, plus buttons; everywhere else stays neutral.
- Type: ONE family only: Poppins 300/500/700/800. No display face, no mono; hierarchy comes from weight and size alone. Single-family weight-driven type is the genome; adding a second face breaks the row.
- Import: `https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700;800&display=swap`
- Radius: 4px on buttons and cards; bands are sharp.
- Background: flat white and gray utility bands separated by diagonal slash cuts (clip-path); one near-black band; one full-red band. No textures, no gradients, no tinted neutrals: raw utility grays are correct here.
- Signature: the phone number as a first-class element: in a utility topbar (hours + email + tel) above the nav, in the header, and huge on the red band, all real tel: links. Secondary devices: one red corner triangle, a business-facts footer (address, hours, 24/7 line in plain columns).
- Grammar: this row ships its own human grammar: two-tier header, no eyebrow ceremony anywhere (one plain-caps kicker line allowed on the red band only), uneven band densities (tight topbar, open hero, dense footer), a testimonial strip with real-sounding names labeled as sample.
- Motion: hovers at 150ms only. Nothing animates on scroll or load.
