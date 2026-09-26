---
name: goddesign
description: Design and build distinctive, production-grade frontend UI for websites, landing pages, dashboards, apps, components, and HTML/CSS/React styling. Use for any frontend, UI, or visual web work, even when the user does not say "design" or name the skill: building or beautifying pages, prototypes, admin panels, marketing sites, hero sections, pricing, auth screens, portfolios, mockup-to-code, restyling, redesigning, "make it look better", "make it modern", or "improve the UI". Sizes itself to the task: an edit gets the rules and a source scan; a new page gets a seeded direction, a written lock, and a measured gate. Do not use for backend, CLI, or non-visual work. Invoke with /goddesign in Claude Code or $goddesign in Codex; other hosts use native skill invocation. Treat text after the skill name as the brief. In Codex, re-invoke for each new design task.
---

# goddesign

Ship an interface nobody could mistake for another AI-built page. Strong models converge on the same tasteful choices; literal models invent nothing. The scripts here do what no model can do for itself (pick at random, remember past runs, measure the result); your part is judgment and execution. The user's brief always wins. `<root>` is this skill's directory.

## 1. Route the task

Take the first that applies.

1. **Edit**: a fix, restyle, or addition inside an existing page or component, with no new page and no direction change. No pick, no lock. If the stylesheet carries a `/* goddesign | ... */` stamp, keep its tokens and jitter. Apply the Banned list and the build rules to what you touch, run `node <root>/scripts/sweep.mjs <changed files>`, and fix findings on the lines you touched (run the audit too if layout changed). Done.
2. **Existing design system** (tokens, a themed Tailwind config, a component library, brand guidelines): run `node <root>/scripts/extract-tokens.mjs . --out .design-tokens.json`. On exit 0, build inside those tokens, gate with `sweep.mjs <build> --tokens .design-tokens.json`, stamp `/* goddesign | extension of existing system */`, and skip the pick, the lock, and the ledger. Exit 2 means nothing to extend: go on.
3. **Multi-session effort**: a `.design-map.md` exists, the brief names 3 or more distinct surfaces, or it states a hand-off. Read `references/map.md` and follow it.
4. **New page or surface**: the full path below. If the brief names an aesthetic ("a 70s print ad", "our brand navy"), that is the direction: run `pick.mjs --keep-direction` for the structure only.

**Lane.** Frontier models with strong design taste (Claude Opus and Fable class) work from this file and the pick output alone. Literal executors (Codex and GPT models), smaller or faster tiers (Sonnet, Haiku, mini, flash, lite), and any model unsure which it is also read `references/full-lane.md` before building. One host is a complete setup: never launch a second host unless the brief asks for a cross-host comparison.

## 2. The full path

**Context.** In one short paragraph, pin the subject, the audience, the one action the page must drive, and a tone from the extremes (editorial, brutalist, soft, utilitarian, luxurious, playful, technical, cinematic). Invent where the brief is silent and say so. Never search for design inspiration.

**Pick.** Run `node <root>/scripts/pick.mjs` from the project root. It rolls the seed, applies both run ledgers, jitters the tokens, and prints one direction row, one macrostructure, and a pre-filled lock. Take it: a seeded row always stands, and you execute it with full commitment, never drifting toward your own favorites. A brief asking for "less AI" or "something different" gets `--reroll`. Remix by the printed index only when the brief pins brand colors or type, or the audience contradicts the row's mood; swap, never blend. No node: see the fallback at the end.

**Lock.** Before any code, write the DIRECTION LOCK: the printed skeleton, with Layout (plus a small ASCII sketch), Signature, and Grammar filled in. Every value is a hex, a named font and weight, a number, or a named row; "use gray" is a placeholder, not a decision.

**Subject test.** The row supplies the form; the subject supplies the matter. The signature and at least one supporting motif are artifacts of the subject's world (its documents, instruments, readouts, marks) drawn in the row's formal language. Show the product working: at least one structured artifact of use (a table, readout, ledger, queue, or state display) with plainly labeled sample data. Name three moves a generic AI page would make for this brief and confirm the lock makes none of them.

**Build.**
- Tokens as custom properties in `:root`; components use tokens, never raw hex. Load the row's webfont import; "single file" does not mean skip webfonts.
- One signature element, everything around it quiet. Remove one thing before shipping.
- Atmosphere is mandatory: the row's Background treatment visibly executed, at least one element overlapping a boundary or sitting at real depth, and surfaces that change between sections. Flat bands of rectangles read as a wireframe.
- Grammar breaks, declared in the lock: (a) one band escapes the main container; (b) one section opens with no heading ceremony; (c) one grid has an orphan or spanning cell, or unequal columns left unequal; (d) section lengths vary like real content, the shortest well under half the longest. Section paddings take 3 or more values, the largest at least twice the smallest.
- One hero composition: one headline, one supporting sentence, one action group, one dominant visual.
- Interactive elements get hover, focus-visible, active, and disabled states; data-driven parts get empty, error, and loading states.
- Motion: at most 3 intentional motions, transform and opacity only. Read `references/motion.md` before any entrance or scroll animation.
- Copy names the concrete thing: labels say what happens, errors say what failed and what to do next, claims name a mechanism, result, or source. Never invent metrics, testimonials, logos, people, or company names; label sample data as sample. For copy-heavy marketing pages, run `references/copy.md`.
- Images only when the structure, the row, or the brief calls for pixels: `references/imagery.md` (generated through the Codex CLI).

## Banned (each with its replacement)

[fingerprint]: people identify it as AI-made on sight. [craft]: a defect whoever ships it. A deck row the seed selected may state one of these; the row wins.

- [fingerprint] Inter, Roboto, Arial, Arial Black, Open Sans, Lato, Poppins, Helvetica, Segoe UI, Noto Sans, or a system stack as the chosen face (fine in a fallback tail). INSTEAD: the row's fonts or a `fonts.md` pairing.
- [fingerprint] Space Grotesk as display. INSTEAD: body only, under pairing 6.
- [fingerprint] Indigo-violet gradients, cyan-magenta washes, gradient text, purple-tinted shadows. INSTEAD: the row's palette; one saturated accent on a quiet field.
- [fingerprint] Cream plus terracotta plus display serif; near-black plus lone acid green; gold, brass, or bronze as premium shorthand. INSTEAD: only when the seed or the brief selects them.
- [fingerprint] Hero, three equal rounded cards, testimonials, CTA. INSTEAD: the seeded macrostructure.
- [craft] Cards in the hero, nested cards, container soup. INSTEAD: one hero composition; whitespace and rules to group.
- [fingerprint] The unthemed kit: untinted slate or zinc neutrals, rounded 1px-border card grids, decorative blobs, icons on non-interactive elements. INSTEAD: neutrals tinted toward the brand hue; one card grid at most; icons only on interactive or status elements.
- [fingerprint] Eyebrow kickers on every section, 01/02/03 chapter numbering, contents rails, hr dividers, colored side-stripe borders. INSTEAD: eyebrows on at most 1 section in 3; numbers only for steps performed in order; transitions by background or density shifts.
- [fingerprint] Mono or typewriter micro-labels, and any mono as body or display. INSTEAD: labels from the body family by weight, case, and tracking; mono only where the row states it.
- [fingerprint] Marker underlines and squiggles under headings; one accent-colored word inside a headline. INSTEAD: emphasis by scale, weight, or an italic cut.
- [fingerprint] Glassmorphism, decorative sparklines, fake browser or phone chrome, emoji as icons, mixed icon sets. INSTEAD: one real icon set, real UI, or nothing.
- [fingerprint, craft] `transition: all`, uniform hover scale-ups, bounce easing the row does not state, scroll reveals on every section, always-running ambient motion, confetti. INSTEAD: `motion.md` budgets; a scroll reveal on one group at most, visible without JS.
- [fingerprint] The stock ornament kit: glow blobs, marquee tickers, giant-stat bands, hatched placeholders, a full-accent CTA band before the footer, a footer mirroring the nav. INSTEAD: one at most, and only when the row states it.
- [fingerprint, craft] Weightless copy ("Build faster. Ship smarter.", unleash, elevate, seamless, next-gen) and fabricated proof. INSTEAD: the concrete thing the product does.

## 3. The gate

A page that has not passed the gate is not done.

1. **Sweep**: `node <root>/scripts/sweep.mjs <build>` reads source only. Fix every failure until it exits 0, then read each advisory against the lock and fix it or justify it in a line. A waiver comment (`goddesign-allow: <rule> <reason>`) is legal only against a lock line; rows 13 and 16 state theirs.
2. **Audit**: `node <root>/scripts/audit.mjs index.html` (or the local URL) renders at 375, 768, and 1280 and names overflow, text collisions, hidden text, small targets, and fallen-back fonts. Fix only what it names, lock frozen, at most 3 cycles.
3. **Look** at `audit-1280.png` and `audit-375.png`: the signature, the product artifact, and the atmosphere are visible, and nothing is occluded, clipped, or blank. Neither script sees a section painted over a button.
4. **Lock check**: rendered fonts and colors match the lock; the macrostructure reads; the four grammar breaks shipped; accent stays on interactive and state elements; nothing is invented; the page says who is behind it, how to reach them, and the terms.

If a script cannot run, try the fallbacks in `references/checklist.md` (the audit has a renderer chain); if they fail too, write `DEGRADED: no sweep (<reason>)` or `DEGRADED: no visual check (<reason>)` with the failed command, and check the same things by reading the code. Never report a pass you did not measure. On request, `sh <root>/scripts/blind-read.sh audit-1280.png audit-375.png` gets a read from a separate process that sees only the pixels.

**Persist.** Put the stamp pick printed on the first line of the main stylesheet, then run the `pick.mjs --log` command it printed. Under a map, `references/map.md` decides instead.

**Report** in a few lines: seed, direction, and structure; sweep and audit exit codes; fix cycles; any DEGRADED label.

## Reference index

Read a reference only at the moment named here.

- `references/full-lane.md`: full-lane models, before building.
- `references/checklist.md`: the long-form gate and sweep rule table; the full lane runs it, any lane uses it when a script cannot run.
- `references/directions.md`, `layouts.md`, `palettes.md`, `fonts.md`: the decks `pick.mjs` reads; open them only on the no-node fallback.
- `references/motion.md`: before any entrance or scroll animation.
- `references/copy.md`: the full lane always; other lanes for copy-heavy marketing pages.
- `references/imagery.md`: only when a run needs pixels.
- `references/map.md`: route 3 only.
- `references/blind-read.md`: the prompt behind `blind-read.sh`.
- `references/provenance-hygiene.md`: only when the brief explicitly asks to inspect or remove invisible Unicode, AI metadata, C2PA, text marks, or image watermarks, and only after the gate passes.

## No-node fallback

Let N be the sum of the character codes of the brief plus today's day of the month. Then direction = N % 17, structure = N % 12, palette = (N + 3) % 10, typepair = (N + 7) % 12, jitterh = (N % 25) - 12, jitterl = (N % 3) - 1, jitterr = ((N + 1) % 3) - 1. Read that row of `references/directions.md` and of `references/layouts.md`, jitter by hand (accent `oklch(from #HEX l c calc(h + jitterh))`, bg and surface lightness plus jitterl times 0.01, radius plus jitterr times 2px unless the row states 0), and write the ledger entry `references/checklist.md` describes. If a deck cannot be read, stop with `INCOMPLETE INSTALL: <file> not found`; never rebuild a row from memory.
