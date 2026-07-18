# Sentiment evidence: public discourse on AI frontend design (2026-07-18)

Source: 346 verified public comments (220 verbatim, 67 paraphrased, 12 link-corrected, 47 non-HN source-checked) collected and re-verified against live sources on 2026-07-18. Buckets: claude_positive 97, claude_negative 100, codex_positive 59, codex_negative 90. Clustered by three independent analysis passes. Counts below are distinct supporting comments per cluster; sample quotes are copied exactly from sources.


## Claude-lane anti-patterns (from claude_negative, 100 comments)

### Instantly recognizable homogeneous output (the Claude fingerprint at a glance) (15)

People identify Claude/skill-built sites on sight; every vibe-coded app 'looks identical' and templates 'repeat constantly' across projects. PARTIALLY COVERED: this is goddesign's core mission (seeded direction, run ledger, Variety axis), but the ledger is per-project, while the complaint is cross-site sameness of a global attractor.

- "Identical looking slop? Every Claude-based vibe coded app looks identical." (https://news.ycombinator.com/item?id=48942866)
- "It's remarkable how easy it is to identify websites built with the 'frontend-design' skill in Claude" (https://news.ycombinator.com/item?id=48497957)
- "The default output is technically correct but visually interchangeable with every other AI-generated interface" (https://learnedcontext.com/learn/claude-code-vs-codex)

Rule implied: Make the rotation bite even without a ledger: QA gate asserts the DIRECTION LOCK differs from the model's known global attractor set (not just the project's last 3 runs) on at least 2 of paper band, display class, accent hue band, macrostructure; maintain that attractor set as an updatable list in the skill and fail the gate on any lock matching it.

### Claude Code's own TUI/app UX reads as vibe-coded slop (12)

Complaints about Anthropic's own tool surfaces, not generated sites: React-in-terminal jank, constant dancing/bouncing animation, truncated file views, scroll breakage, 'no regards for UX'. NEW and mostly OUT OF SCOPE for SKILL.md (it excludes CLI work), but it is evidence that ambient motion and rendering jank are read as slop.

- "The real problem is their ridiculous 'React rendering in the terminal' UI." (https://news.ycombinator.com/item?id=46986379)
- "the CC UI/UX itself: it felt like the fetal alcohol syndrome lovechild of a Las Vegas slot machine and Tiktok. Everything was dancing and bouncing around... telling me nothing" (https://news.ycombinator.com/item?id=46985055)
- "Seeing 1-6 lines of a file that's being read is extremely frustrating, the UX of Claude code is average at best." (https://news.ycombinator.com/item?id=46982210)

Rule implied: Add a gate assertion usable on any build: zero always-running ambient animation outside the single budgeted signature motion; no per-section scroll-triggered fade/translate cascades; interaction must not produce visible jank (no layout thrash; animations on transform/opacity only).

### Unthemed component-kit defaults (shadcn/Tailwind slate-zinc, rounded-2xl 1px-border cards, Lucide sprinkling, SVG blob) (11)

The composite kit fingerprint: out-of-the-box shadcn/Tailwind CSS, slate-or-zinc neutrals, grids of rounded cards with 1px borders, random icons, abstract header blobs, 'beige SaaS dashboard'. PARTIALLY COVERED: Inter and hero-plus-three-cards and cards-in-hero are banned, but default shadcn/Tailwind neutral ramps, rounded-2xl-with-1px-border card grids, decorative SVG blobs, and icon sprinkling are not named.

- "Tailwind, shadcn/ui, Lucide icons, a slate-or-zinc palette, a hero with a soft purple-to-blue gradient, cards with a 1px border and rounded-2xl corners, an abstract SVG blob somewhere in the header." (https://dev.to/kkk_dev_1b0a00f5047cb4de6/why-every-claude-code-built-site-looks-the-same-and-the-image-layer-that-breaks-it-37jp)
- "The UI they spit out basically sucks. Everything looks like the same beige SaaS dashboard: rounded cards, random gradient, Tailwind presets copy-pasted until entropy." (https://news.ycombinator.com/item?id=46957026)
- "Figma Make and Claude Code are really just using the out of the box CSS from shadcn that's why everything looks the same" (https://news.ycombinator.com/item?id=45696099)

Rule implied: Extend the Banned list: untinted Tailwind/shadcn slate/zinc/gray neutral ramps as final palette; rounded-2xl plus 1px-border card grids; abstract decorative SVG blobs; icons on elements that are not interactive or status. Gate sweep: neutrals must be hue-tinted (chroma 0.005-0.015, already a floor), card radius/border must come from the locked direction, max one card grid per page.

### Purple/blue gradient reflex (10)

The canonical tell: purple-to-blue gradients, purple accents and drop shadows, rainbow washes, usually on white; several commenters note the ban itself and predict the next latch-on pattern. ALREADY BANNED in SKILL.md (indigo-violet gradients on white, cyan-magenta washes, gradient text), but only as generation guidance, not as a verifiable sweep, and drop shadows and dark-background variants are not named.

- "Claude will nearly always make a purple or blue website with gross rainbow gradients." (https://news.ycombinator.com/item?id=47466876)
- "The overuse of blue and purple gradient fills on the landing page is a telltale sign of AI slop." (https://news.ycombinator.com/item?id=48749396)
- "The blue/purple gradient is a Claude favourite. Also CSS animation with stuff fading in and moving in Y axis." (https://news.ycombinator.com/item?id=45551558)

Rule implied: Turn the ban into a QA sweep: grep emitted CSS for #6366F1/#7C3AED/#8B5CF6-family hexes and any linear/radial gradient whose stops both sit in hue 230-290; zero matches allowed unless the seeded direction states them. Extend the ban to purple-tinted drop shadows and to dark backgrounds, not just white.

### Flat hierarchy and broken spatial rhythm (6)

Zero visual hierarchy (every section at the same volume), inconsistent paddings/margins with no rhythm, many font sizes with no scale, dense tiny flat layouts that feel dated, and weak spatial reasoning overall. PARTIALLY COVERED: the craft floor fixes scale ratios and token spacing, but nothing asserts hierarchy contrast BETWEEN sections or one focal point per viewport.

- "Zero hierarchy. Every section screams at the same volume... a Frankenmix of Apple, Material, shadcn, and Dribbble shots in one component tree." (https://news.ycombinator.com/item?id=46957026)
- "The palette looks a lot like the basic colors from Bootstrap... why so many different font sizes with no hyerarchy? the paddings and margins are inconsistent and don't convey visual rythm." (https://news.ycombinator.com/item?id=47753708)
- "based on when i experimented with claude ... it was terrible at spatial relationships... which is exactly what you need for front-end stuff lol" (https://nerdy.dev/why-ai-sucks-at-front-end)

Rule implied: Gate assertions: exactly one dominant focal element per viewport; every font size on the page maps to a declared scale step (no orphan sizes); adjacent heading levels differ by at least one full scale step; no two adjacent sections share both background treatment and layout pattern (density must visibly vary down the page).

### Sterile timidity sold as bold (6)

Dull, soulless, most-generic-choice-possible output, then self-congratulatory copy calling it 'bold' and 'edgy'; 'painfully average' pages with a 'generic sterile feeling'. PARTIALLY COVERED: the skill demands one justified aesthetic risk and an anti-cliche critique, but nothing verifies the claimed risk actually exists in the render or polices self-praise.

- "Claude Design... does incredibly dull and uninspiring designs and then writes little puff pieces about how 'bold' and 'edgy' they are" (https://news.ycombinator.com/item?id=48709467)
- "By default it tries not to offend anybody, so it picks the most generic choices possible." (https://www.aidesigner.ai/blog/claude-code-frontend-design)
- "many Show HN projects now have a generic sterile feeling that tells me they are purely AI-generated." (https://www.adriankrebs.ch/blog/design-slop/)

Rule implied: The DIRECTION LOCK must name the one aesthetic risk as a concrete property plus value (e.g. 'display type crops off viewport edge'), and the QA gate fails if that exact element is absent from the screenshot; ban adjectives like bold/edgy/striking in the model's own summary unless it cites the lock line that delivers them; a lone accent color or font choice does not count as the signature element.

### Steering resistance: reverts to Claude-style even when told not to, fails iteration edits (5)

Explicit requests to look different produce 'the claudiest website ever'; the skill 'only gets you so far' and needs constant steering; post-hoc edits fail and design language drifts across iterations. NEW in mechanism: the DIVERGE reroll rule targets initial generation, but nothing handles user-requested divergence or re-gating after iteration edits.

- "prompted Fable to improve the frontend to make it look different from Claude style... it gave me the shittiest more claudiest website ever, basically ignoring everything I asked" (https://news.ycombinator.com/item?id=48498088)
- "these models really struggle with front-end design. Something like /frontend-design skill is good but only gets you so far. It still requires a ton of steering" (https://news.ycombinator.com/item?id=47564716)
- "I got very frustrated with LLMs and their inability to apply good taste or maintain consistent design languages." (https://news.ycombinator.com/item?id=48758168)

Rule implied: Add a rule: any brief containing 'not like Claude / look different / less AI' is a forced reroll that must change BOTH display class and accent hue band from the current page, verified in the new lock; any iteration edit re-runs the boolean gate sweep on touched sections and re-checks the stamped tokens so the design language cannot drift.

### Undisciplined CSS: duplication, !important, inline overrides, overflow clipping bugs (4)

Massively duplicated stylesheets, changes slammed in with !important or inline styles, tooltips clipped by parent borders ('I see this mistake ALL the time'), and overdesigned hard-to-read code. PARTIALLY COVERED: tokens-only and native popover/dialog rules exist, but !important, duplication, and an overflow-clip check are not stated or tested.

- "Claude Code generated a 2000-line CSS file for a 7000-line app... where almost every single color, component, class and style is duplicated at least two times." (https://news.ycombinator.com/item?id=47819704)
- "Opus/Sonnet seem to have far less taste and discipline in writing CSS - constantly they are trying to slam in changes with !important or inline styles." (https://news.ycombinator.com/item?id=47820233)
- "The tooltip in the 'day 1' to 'day 14' cards gets cut off by the border (I see this mistake ALL the time with AI-generated frontends btw)" (https://news.ycombinator.com/item?id=47754524)

Rule implied: Add code-level gate sweeps: zero !important and zero style attributes in emitted markup/CSS; no duplicated declaration blocks (grep repeated selectors/hex values, each hex appears only in :root); every tooltip/dropdown/menu renders in the top layer (popover/dialog) and a QA screenshot verifies one open overlay is not clipped by any ancestor.

### Font tells: default serif display, mono kickers, JetBrains Mono / console-font body (4)

The post-purple tells: habitual serif headlines, serif-plus-mono-kicker landing pages, JetBrains Mono as a near-certain Opus fingerprint, and hard-to-read console fonts with crammed tiny text. PARTIALLY COVERED: mono/typewriter kickers and mono-only-when-stated are banned, but JetBrains Mono is not named anywhere and the serif-display reflex is banned only in the cream-terracotta combo.

- "Jetbrains Mono is as strong of a tell for web as... >99% of webpages created in the last month with Jetbrains Mono will be Opus. This is the archetypical Opus vibecoded web frontend." (https://news.ycombinator.com/item?id=47177336)
- "I'm so sick of this landing page style. It's another iteration of 'purple gradient' slop. The other one is serif headline with mono kickers... You've got yourself a Claude coded page." (https://news.ycombinator.com/item?id=48401736)
- "Claude Code's frontend design is quite a fan of serif fonts from what I've seen in the past." (https://news.ycombinator.com/item?id=47393152)

Rule implied: Name JetBrains Mono in the Banned list: no mono face as body or display unless the seeded direction row states one; serif display is legal only when the seeded row or brief selects it, never as the unforced fallback; where a direction allows mono body text, keep it at 15px minimum and 45-75ch measure.

### uncategorized (18)

Blanket quality verdicts with no concrete named pattern: 'Claude is bad at UI', competitor-X-is-better (v0, Gemini, GPT-5), 'so close but so far', 'ugly but functional', hype dismissals, and the LMArena-aesthetic-bias observation. NEW but not directly encodable as a bannable value. Note: 9 further dataset entries were exact duplicates (same author and URL) of comments already counted in the clusters above, so all 100 items are accounted for.

- "I've had terrible luck with codex, claude, and gemini at doing frontend. It's always so close but so far" (https://news.ycombinator.com/item?id=47278774)
- "v0 creates some of the most beautiful designs and mockups... Even better than anything I've seen from Claude Code." (https://news.ycombinator.com/item?id=46570937)

Rule implied: No single bannable value; these support keeping the existing hard QA gate ('if someone could glance and say AI made that, it failed') and argue for making the 375/768/1280 screenshot comparison fail-closed rather than allowing the DEGRADED no-visual-check fallback.


## Codex-lane anti-patterns (from codex_negative, 90 comments)

### Worst-in-class verdict without a named defect (20)

The largest bucket: flat judgments that Codex/GPT frontend output is ugly, awkward, or simply worse than Claude/Gemini, with no specific design flaw named. Reviewers cannot articulate what is wrong; the page just fails the glance test.

- "Codex is abysmal for UI design imo." (https://news.ycombinator.com/item?id=47845013)
- "Codex usually knocks backend/highly logical tasks out of the park while fairly basic front-end/UI tasks it stumbles over at times." (https://news.ycombinator.com/item?id=46859419)
- "Using codex for front end design is like asking the valedictorian mega nerd to paint your portrait. Gemini and Claude are both artists." (https://news.ycombinator.com/item?id=47747314)

Rule implied: Since no defect is named, the only countermeasure is the outcome gate: on EXPAND-lane (Codex) hosts, Step 5's three-phase QA gate must be mandatory and a 'DEGRADED: no visual check' result must count as a FAILED run, not a pass; require the manual boolean sweep plus the six-axis critique with any score under 3 forcing revision. SKILL.md coverage: partial; Step 5 exists but the DEGRADED escape hatch lets exactly these models ship unseen output.

### One-template gravity: bans and references do not stick (11)

GPT-line models snap back to one training-data template (Bootstrap carousel, uniform rounded card grid, round-box chrome, purple-blue gradient wash) even when explicitly told not to, given an existing repo's styling to copy, or given no styling instructions at all. Negative instructions demonstrably fail.

- "GPT-5, despite being specifically prompted to never use the Carousel in Bootstrap, cannot output any website without including a Carousel." (https://news.ycombinator.com/item?id=47620699)
- "Codex is terrible at frontend. I gave it an existing repo and asked it to take the ui styling and patterns from there, but it still created that classic vibe coded look." (https://news.ycombinator.com/item?id=47947409)
- "I put in no instructions about looks or styling at all. Lo and behold, the tool it wrote came with exactly that round-box style. It seems to be the 'default' style of some models." (https://news.ycombinator.com/item?id=47461030)

Rule implied: Prohibitions alone provably fail on this model line, so every ban must resolve to a positive value physically copied into the code (the DIRECTION LOCK restated as a stylesheet comment), and the QA gate needs a new boolean assertion run against the BUILT page, not the intention: no carousel, no uniform rounded-card grid, no gradient hero unless the seeded macrostructure specifies one. SKILL.md coverage: partial; the Banned list pairs each ban with an INSTEAD and EXPAND mandates verbatim row execution (the right mechanism), but the QA gate has no explicit 'GPT default skeleton absent in rendered output' check.

### Adjective output: decisions left unmade (7)

Codex executes exactly what was said and invents nothing: design choices come back as adjectives ('use gray', 'make it modern') instead of values, and the half of frontend work that is unstated intent never happens. Output is visually safe because no taste decision was ever made.

- "Codex, by comparison, is often too general. It may say things like 'use gray,' 'make it modern,' or 'improve the layout'." (https://github.com/openai/codex/issues/20878)
- "The thing that makes Codex trustworthy on the backend (it does what you said, nothing more) is the same thing that makes it useless on the frontend, where half the job is knowing what you didn't say." (https://www.xda-developers.com/codex-technically-better-than-claude-code-stopped-using-it-for-one-specific-reason/)
- "baseline output was functionally solid but visually safe... it won't invent taste on its own." (https://www.banani.co/blog/gpt-for-ui-frontend-design)

Rule implied: Gate assertion: the DIRECTION LOCK must be complete before any code, and it may contain zero unresolved adjectives; every visual property resolves to a hex, a px/rem number, or a named deck row. SKILL.md coverage: ALREADY ADDRESSED; this is the EXPAND lane's founding rationale and SKILL.md line 13 names 'use gray' and 'make it modern' verbatim as placeholders to reject. No change needed beyond keeping the lock-restatement rule.

### Technically valid, visually coarse numbers (5)

CSS that compiles and roughly works but whose numbers are off: wrong padding ratios, inconsistent spacing, weird alignment, hard-to-read typography, body text too big, and busy repeated labels. Structure right, optics wrong.

- "Codex got the structure right but often produced CSS that was technically valid but visually coarse , wrong padding ratios, inconsistent spacing, color choices that worked but didn't look considered." (https://www.mindstudio.ai/blog/claude-code-vs-openai-codex-honest-comparison)
- "The output is a mess. The typography was hard to read. The layout felt awkward... if the goal is the best-looking frontend from a simple prompt, Claude still wins." (https://www.kuroneko-cmd.dev/posts/2026/codex-frontend-design-workflows/)
- "Common markers are too noisy/busy (mainly repeated or rephrased information). Text being a bit too big (Codex-only?)." (https://news.ycombinator.com/item?id=48505855)

Rule implied: Enforce the numeric craft floor as lintable assertions on the emitted CSS: all spacing values on the declared token scale (4/8/12/16/24/32/48/64/96/128), one type-scale ratio, body 16-18px, measure 45-75ch; add one gate check the skill lacks: no label or copy string repeated or rephrased within a viewport. SKILL.md coverage: LARGELY ADDRESSED by Step 4d; the redundant-copy/noise check is the only missing assertion.

### Architecture instead of pixels: frontend over-engineering (5)

Asked for a page, Codex ships a layered architecture: factories, wrapper components, unnecessary indirection, and defensive boilerplate for imaginary future complexity, spending its effort on abstractions that render nothing.

- "codex inventing factories, components, etc when the task was simply to draft HTML page. Instead, it build the entire layered architecture for imaginary future complexity" (https://news.ycombinator.com/item?id=48475337)
- "Codex goes on wild goose chases creating unnecessary indirection and abstractions - they work correctly, but add cruft." (https://news.ycombinator.com/item?id=48521541)
- "it introduces a lot more useless/inappropriate heavy abstractions and wrapper functions, compared to the Claude-family models" (https://news.ycombinator.com/item?id=48465494)

Rule implied: New rule needed: extend the EXPAND lane's deliverable enumeration with an architecture cap; a static page or component ships as markup plus tokens plus one stylesheet, and the gate asserts zero factories, wrapper components, config layers, or defensive branches that do not render pixels unless the brief demands them. SKILL.md coverage: NOT ADDRESSED anywhere; this is the clearest gap in the current skill.

### Placeholder-grade default: unstyled or enterprise-bland floor (4)

The zero-prompt baseline looks like an unstyled wireframe or a generic enterprise tool: 1995 HTML with no hover states, no personality, 'the placeholder version of the thing', minimalism as the absence of decisions rather than deliberate ones.

- "Codex's designs just... lack personality. The frontend it produces is almost always bland, depressing to look at." (https://www.xda-developers.com/codex-technically-better-than-claude-code-stopped-using-it-for-one-specific-reason/)
- "it looks like HTML from 1995. No styling. No hover states. No accessibility." (https://docs.bswen.com/blog/2026-03-25-codex-frontend-development/)
- "Codex's designs always just look like the placeholder version of the thing." (https://www.xda-developers.com/codex-technically-better-than-claude-code-stopped-using-it-for-one-specific-reason/)

Rule implied: Add a styling floor assertion to the gate: the rendered page must load the direction's webfont, define hover and focus-visible states on every interactive element, and expose zero browser-default UA styles (no default blue links, default buttons, or Times fallback visible). SKILL.md coverage: partial; 4c's webfont and states rules cover it if executed, but no QA check verifies UA defaults are actually gone in the render.

### Outdated or hack-patched CSS (4)

Codex reaches for outdated patterns and hacks instead of modern CSS or proper refactoring: giant pseudo-element patches instead of markup changes, pre-modern layout code, and Tailwind interactions that ship broken.

- "Codex 5.3 tried to inject a massive HTML element with a CSS before hack, rather than properly refactoring markup." (https://news.ycombinator.com/item?id=47350010)
- "On complex CSS layouts, React/Vue component state, or UI details, Codex often spits out outdated code or completely misses modern frontend best practices." (https://www.xda-developers.com/codex-technically-better-than-claude-code-stopped-using-it-for-one-specific-reason/)
- "I tried to get Codex + O3 to make an existing sidebar toggable with Tailwind CSS and it made an abomination full of bugs." (https://news.ycombinator.com/item?id=43817920)

Rule implied: 4c's modern-CSS mandate covers the 'outdated' half; add the missing ban: no pseudo-element patches, absolute-position hacks, or !important to fix layout (refactor the markup instead), and Phase 3 must exercise every interactive behavior (toggles, menus) in the browser, not just screenshot static states. SKILL.md coverage: partial.

### Cannot match a given design or refine to acceptable (4)

Given a concrete design (mockup, Figma screen, detailed rework instructions), Codex fails to reproduce it and fails to converge through iteration; it claims to inspect the output artifact but does not refine it into acceptable form.

- "the Codex cli says it looks at the end output artifact but so often it fails to refine it into acceptable form." (https://news.ycombinator.com/item?id=48850437)
- "gave 5.5 a web design to implement and it sucked. Gave the same to Fable and it still sucked." (https://news.ycombinator.com/item?id=48850202)
- "Codex will occasionally screw up the implementation despite the fact that I'm using the MCP server (bringing Figma screens into React)." (https://news.ycombinator.com/item?id=45984135)

Rule implied: Make Phase 3 a diff loop, not a glance: screenshots at 375/768/1280 compared point-by-point against the DIRECTION LOCK (or the user-provided mockup when one exists), with any mismatch forcing a revision cycle before the run may close; on EXPAND hosts a missing renderer triggers a mandatory manual token-by-token comparison instead of a DEGRADED pass. SKILL.md coverage: partial; Phase 3 exists but has no mockup-diff requirement and the DEGRADED fallback voids it for exactly the models that need it.

### Uncategorized (2)

Comments that do not describe a web-UI design anti-pattern: one about the Codex desktop app itself being vibe-coded, one about the Terra Pelican SVG-art benchmark. Note on counting: the dataset's 90 codex_negative items collapse to 60 distinct source comments once repeated excerpts of the same comment are deduplicated; cluster counts above are distinct comments (the XDA article supports three clusters and is counted in each).

- "Codex app itself is vibe coded and has mis-mapped that setting in some weird way." (https://news.ycombinator.com/item?id=47273927)
- "I'm really worried about the ugly Terra Pelican." (https://news.ycombinator.com/item?id=48851287)

Rule implied: No design rule implied; excluded from rule-making.


## Praise vocabulary (from claude_positive 97 + codex_positive 59)

### Matches the given design or spec pixel-close (14)

The single largest praise vocabulary: people celebrate when the model faithfully translates a provided reference (uploaded mockup, designer image, existing site's HTML/CSS, detailed instructions) into a near 1:1 render needing only a handful of tweaks. Phrases: 'pixel-perfect', 'almost 1:1 reproduction', 'nail the result', 'closest to the design I created and uploaded', 'the exact code that you expect'.

- "GPT's code looked the closest to the design I created and uploaded. Just five to ten small tweaks vs. Claude it would have taken me almost triple the steps" (https://news.ycombinator.com/item?id=44803674)
- "the translation from design to implementation is greatly sped up by codex, which basically does it pixel-perfect" (https://news.ycombinator.com/item?id=48433903)
- "you can give it basic instructions of what the UI should look like... and an example image from a designer, and it will nail the result" (https://news.ycombinator.com/item?id=48466564)

Rule implied: New gate assertion (NOT covered by checklist.md: Phase 3 compares only against the DIRECTION LOCK, and extension mode against repo tokens; nothing ever compares against a user-supplied reference): 'If the brief included a reference (image, URL, screenshot, existing site, or explicit values), render the page beside the reference at the same viewport width: do type, palette, spacing rhythm, and layout match closely enough that ten or fewer small tweaks would make them indistinguishable? List every remaining delta.' Answer no = fix before done.

### One-shot completeness: first pass is shippable (13)

Praise phrased as zero-iteration success: the first render is complete, functional, and needs no manual fixes ('worked first time', 'no manual fixes required', 'one shot a dashboard', 'without touching a single line of HTML, CSS or JS'). Success is measured by absence of a cleanup pass, not by beauty.

- "I've made fully functioning and pretty decent looking frontends using just Claude Design and Claude Code without touching a single line of HTML, CSS or JS." (https://news.ycombinator.com/item?id=48146161)
- "a complete, working dashboard UI (HTML, CSS, sensible typography defaults, responsive layout) in three minutes and 53 seconds. No manual fixes required." (https://learnedcontext.com/learn/claude-code-vs-codex)
- "Codex created the presentation layer I described in a single go and it worked first time. That was really impressive I have to say." (https://news.ycombinator.com/item?id=48349116)

Rule implied: New gate assertion (partially covered: EXPAND lane says 'enumerate the full deliverable... do not silently trim scope' and the states gates exist, but no boolean gate tests it on the finished page): 'Re-read the brief as a checklist: is every requested page, section, breakpoint, and behavior present and actually working in the render, with zero console errors and no stub, TODO, or dead control, such that a user could ship it without touching the code?' A yes requires clicking every interactive element once.

### UI structure, spacing, and interaction flow that looks right (5)

The specific craft vocabulary reviewers use when praising the good stuff: overall structure, spacing that 'looks right', appropriate color contrast, component hierarchies that make visual sense, spatial understanding, and interaction flow (what happens after each action). The negative mirror is 'technically valid but visually coarse, wrong padding ratios'.

- "Claude Code (especially the frontend design skill) was much better at overall UI structure, spacing, and interaction flow." (https://news.ycombinator.com/item?id=46444031)
- "Claude Code generates spacing that looks right, picks appropriate color contrast, structures component hierarchies in ways that make visual sense." (https://www.mindstudio.ai/blog/claude-code-vs-openai-codex-honest-comparison)
- "I tend to prefer Claude's UI about 70-80% of the time... I find Claude's spatial and visual understanding when dealing with frontend to be better." (https://news.ycombinator.com/item?id=45264520)

Rule implied: Mostly covered: Phase 1 axis 3 (Execution) and the craft floor already gate spacing, contrast, and hierarchy numerically. The uncovered slice is interaction FLOW: add the assertion 'For each primary action, perform it: does the page respond with an obvious, designed next state (navigation, confirmation, or updated content) rather than nothing or a raw browser default?' The states gate checks that states exist; nothing checks the sequence feels designed.

### Intentionally crafted, does not read as AI vibe-coded (5)

Praise defined by the absence of AI tells: 'intentionally crafted', 'delightful without feeling like AI vibe coded', 'actually designs real front ends instead of the vibe coded purple gradient look', a Show HN 'not getting roasted for being vibe coded', and 'actually considers audience'.

- "My most noticeable immediate jump was in how its frontend design was much more intentionally crafted, and delightful without feeling like 'AI vibe coded'; with better end-user usability too." (https://news.ycombinator.com/item?id=48464975)
- "The new Claude Code front-end design Skill is a big improvement, ends the purple gradient and Arial font tyranny and actually considers audience." (https://x.com/emollick/status/1989093191182926249)
- "plugins like /frontend-design mean it actually designs real front ends instead of the vibe coded purple gradient look." (https://news.ycombinator.com/item?id=47073287)

Rule implied: Already covered: checklist.md's acceptance line ('If someone could glance at this and say AI made that without doubt, it failed') plus the Banned list and second-order check ARE this cluster. One sharpening from the vocabulary: make it audience-anchored, per emollick: 'Would the specific audience named in Step 2 recognize this page as made for them, or could it front any product?' (currently the Specificity axis asks product-fit but not audience-fit). Count includes dannyw's usability clause; he supports this and the next cluster.

### Tasteful AND practical: design serves the content and respects attention (5)

Praise couples aesthetics with utility: 'tasteful and practical', 'modern and welcoming and does not distract or take away from the actual content', 'no usability issues', interfaces that 'respect my time and attention', 'straightforward, just works'. Beauty that obstructs reading or the core action is counted as failure even when pretty.

- "Claude is surprisingly good at GUI work... not just getting stuff working but also creating reasonably tasteful and practical designs" (https://news.ycombinator.com/item?id=47398830)
- "His website looks modern and welcoming and does not distract or take away from the actual content. This exactly what most people should aim for." (https://news.ycombinator.com/item?id=47750700)
- "much of it made me think I should look into GPT Codex instead. It sounds like the interfaces there respect my time and attention more, rather than treating me like a Zoomer." (https://news.ycombinator.com/item?id=46985055)

Rule implied: Partially covered (Restraint axis and motion budgets gate attention cost; nothing gates content service). New assertion: 'Attempt to read the page's main content and complete its one action (Step 2) start to finish: does any visual or motion element interrupt, obscure, delay, or compete with either? Is there anything on the page that costs the user attention without paying it back in information or affordance?' Yes to either = remove the element.

### Exceeds the brief: fills in unstated intent, ambitious not literal (5)

Winners 'do more than you specify': creative rather than 'too literal and cold', 'ambitious', results 'better than I ever envisioned'. The codex_negative mirror states it precisely: on the frontend 'half the job is knowing what you didn't say'. Praise goes to models that supply the unrequested-but-necessary details.

- "CC feels more creative and has mostly given better UI. Codex follows instructions a bit too literally, and the result can feel a little cold." (https://news.ycombinator.com/item?id=45650309)
- "I love using Claude to prototype ideas that have been in my brain for years, and they wind up coming out better than I ever envisioned." (https://news.ycombinator.com/item?id=47425995)
- "When producing frontend code for web apps, GPT-5 is more aesthetically-minded, ambitious, and accurate... preferred by our testers 70% of the time." (https://news.ycombinator.com/item?id=44829362)

Rule implied: Partially covered (the signature element mandates one bold move; Step 2 says 'invent confidently'). New gate assertion: 'Name three concrete things on the page the brief never asked for that a careful human builder would have added anyway (an empty state, a keyboard affordance, a detail state, microcopy that anticipates a question). Are all three present and in service of the product rather than decoration?' Fewer than three = the build was literal, not designed.

### Reads as current-year design, not dated (4)

Four dataset comments (from 2 sources, XDA and learnedcontext, so weight accordingly) praise output for looking 'modern', 'current', showing 'awareness of recent web design trends'; the claude_negative mirror is 'felt like we were back in 2014... small type, dense layout, and flat colors made it feel dated'. Datedness is a distinct failure axis from slop: a page can avoid every banned tell and still read as 2014.

- "Claude Code is great at frontend... the results it produces look a lot more modern and aesthetically appealing." (https://www.xda-developers.com/codex-technically-better-than-claude-code-stopped-using-it-for-one-specific-reason/)
- "The results it produces look a lot more modern and aesthetically appealing, and while they always look minimalist, they still have something going on." (https://www.xda-developers.com/codex-technically-better-than-claude-code-stopped-using-it-for-one-specific-reason/)
- "Codex shows stronger awareness of recent web design trends and faster iteration on Tailwind and CSS-in-JS" (https://learnedcontext.com/learn/claude-code-vs-codex)

Rule implied: NOT covered: no checklist axis or gate tests datedness (craft-floor numbers prevent some of it implicitly). New assertion: 'Would a working frontend developer, shown only the screenshot, date this design to the current year rather than 2014-2018? Specifically: no small dense flat-color layout, no Bootstrap-default look, generous type scale and spacing, and at least one visibly contemporary technique (fluid clamp type, real grid composition, oklch color) doing visible work.'

### A real design language: every decision is a specific value (4)

Praise for specificity of decisions: 'exact colors, spacing, layout choices, typography... a real design language behind it', versus the mirrored complaint that Codex 'may say things like use gray, make it modern'. Two of the four also name the enabling condition: encode the design system or component library into files the agent consumes.

- "Claude has a clear advantage in frontend work. Claude can give very specific design instructions: exact colors, spacing, layout choices, typography... it often feels like Claude has a real design language behind it." (https://github.com/openai/codex/issues/20878)
- "Claude is very good at design IF you encode your design system/specs into skill files" (https://news.ycombinator.com/item?id=48468289)
- "I've had good success using Codex for my frontend development, especially since all of my projects consistently rely on a well documented component library." (https://news.ycombinator.com/item?id=45650649)

Rule implied: Already covered: SKILL.md's literalness paragraph bans exactly the 'use gray / make it modern' placeholder, the DIRECTION LOCK forces on-page enumeration, and the tokens gate enforces it in CSS. Verification-side sharpening only: 'Can every visual property on the rendered page be traced back to a named :root token or a stated DIRECTION LOCK value, with zero decisions that exist only in the CSS and not in the lock?' This closes the loop between lock and emitted code, which Phase 3 checks visually but not value-by-value.

### uncategorized (65)

Estimated distinct comments after dedup that carry no inspectable criterion: generic comparative praise ('Claude is far better at front end design', 'For front-end/UX related tasks Claude wins easily', 'Codex has been quietly winning'), model-version notes, tool/CLI UX opinions about Claude Code or the Codex app themselves, enthusiasm ('super fun'), plus two small seeds too thin to cluster: accessibility-on-request (simonw: good results from asking for accessibility, 2 comments; already covered by the a11y floor) and truth-to-materials (Sam Henri Gold, 1 comment).

- "Claude is much better at stuff involving frontend design somehow compared to other models (GPT is pretty bad)." (https://news.ycombinator.com/item?id=46131286)
- "For front-end/UX related tasks Claude wins easily." (https://news.ycombinator.com/item?id=47667220)
- "I've genuinely had solid results from telling Claude '... and make sure it has good accessibility'." (https://news.ycombinator.com/item?id=47865330)

Rule implied: No new rule; this mass confirms the market situation (frontend quality is the deciding factor in tool choice) but names no testable property. Do not derive gates from it.
