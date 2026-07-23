# Study A rater design QA

Date: 2026-07-23

## Direction lock

Seed: 41144861

Structure: Workbench

Direction: Swiss International

Rotation: the seeded Trade Counter row conflicted with the active rotation, so
selection advanced to Swiss International. Workbench differed from the recent
Catalogue, Stat-Led, and Square Native Variants structures. Concurrent Study A
corpus runs later added another Swiss entry to the cross-project ledger after
this lock was frozen.

Tokens:

- Background source: `#FAFAF8`
- Surface source: `#F0F0EC`
- Text: `#111114`
- Muted: `#55565C`
- Accent source: `#E63312`
- Radius: 0

Jitter: accent h+11, paper L+0.00, radius +0.

Type: Archivo 800 for the introduction headings. Schibsted Grotesk 400 and 500
for body copy, labels, controls, and workbench text.

Layout:

```text
+--------------------------------------+
| Website perception study      status |
+--------------------------------------+
| signal progress rule                  |
+--------------------------+-----------+
| full-page capture        | questions |
| inside scroll viewport   | and save  |
+--------------------------+-----------+
```

Signature: a signal-red progress rule leading into a large framed website
capture beside a structured perception questionnaire.

Grammar: progress and workbench escape the introduction container; the rating
rail opens directly on a question; the introduction uses visibly unequal
columns; consent, workbench, and completion use distinct vertical rhythms.

Motion: control-state transitions only. No entrance, scroll, or ambient motion.

Subject: a blind website-perception study.

Audience: eligible outside raters judging fifteen full-page captures.

Primary action: complete and save all fifteen ratings.

Tone: technical and utilitarian.

## Phase 1 advisory critique

1. Philosophy, 5/5. The split workbench is visible in
   `output/playwright/rater-rating-1280-final.png`, with the research capture
   occupying the main working area and the questionnaire fixed as the task rail.
2. Hierarchy, 5/5. The introduction headline is the first dominant element in
   `output/playwright/rater-intro-375-final.png`; during rating, the capture is
   the dominant element and the first question begins the response sequence.
3. Execution, 5/5. `app/globals.css` uses one token set, square geometry, a
   fixed spacing scale, complete control states, and no inline styles. The
   measured audit returned zero failures at all three viewports.
4. Specificity, 5/5. `app/study-app.tsx` renders the actual research artifact:
   a full-page capture viewer, zoom controls, five response dimensions, progress,
   resume behavior, loading, error, completion, and consent states.
5. Restraint, 5/5. The progress rule is the only accent treatment. Borders,
   type, and surfaces remain neutral around it.
6. Variety, 4/5. Workbench differs from the preceding three structures. A
   concurrent corpus run appended Swiss International to the global ledger
   after this direction had already been locked.
7. Credibility, 4/5. The interface states who operates the study, supplies a
   reply-channel contact route, explains consent and withdrawal, names the data
   collected, states that no payment is involved, and avoids invented people or
   proof. It does not claim institutional review.

## Phase 2 boolean gate

Pass count: 42/42.

- Tokens: 4/4
- Typography: 5/5
- Color: 4/4
- Layout: 8/8
- States: 3/3
- Grammar: 7/7
- Motion: 4/4
- Responsive: 2/2
- Brief: 2/2
- Honesty and trust surface: 3/3

The banned-value scan found no prohibited color, font, transition, text-clipping,
inline-style, chapter, emoji, or forbidden dash pattern in the application
source. The two `!important` declarations are limited to the reduced-motion kill
switch. Generated imagery and destructive actions are not present.

Rendered contrast measurements:

- Text on background: 18.04:1
- Text on surface: 16.50:1
- Muted on background: 7.00:1
- Muted on surface: 6.40:1
- Accent focus color on background: 4.07:1
- Accent focus color on surface: 3.73:1

## Phase 3 visual verification

The shipped audit was run against the actual dynamic application with a real
local D1 binding and a sealed synthetic corpus:

```sh
node skills/goddesign/scripts/audit.mjs http://localhost:3100/#token=dev.1
```

Result: PASS with zero failures.

- 375x812: no overflow, hidden text, collisions, small targets, or font issues.
- 768x1024: no overflow, hidden text, collisions, small targets, or font issues.
- 1280x900: no overflow, hidden text, collisions, small targets, or font issues.
- Schibsted Grotesk loaded in the rating workbench.
- Archivo and Schibsted Grotesk loaded in the introduction.
- The introduction headline rendered in three lines at every audited width.

Manual screenshot inspection passed at all three viewports. The signal-red
progress rule, framed capture, responsive workbench, consent surface, and
disabled save state are visible without clipping or blank regions.

Blind-read status: PASS.

```json
{
  "structure": "split evaluation workbench, stacked survey on mobile",
  "paper_band": "light",
  "display_class": "grotesque",
  "accent_band": "warm orange",
  "signature": "large website preview beside a structured perception questionnaire",
  "subject": "user research survey tool for evaluating website appeal, trust, familiarity, and perceived AI authorship",
  "ai_tell": "none",
  "identity": "strong"
}
```

The blind reader recovered the structure, paper band, type class, accent band,
signature, and subject from pixels alone.

## Functional integration receipt

A sealed synthetic corpus exercised the production data path:

- 20 invitation slots started and completed.
- 300 answers persisted to local D1.
- The export endpoint returned exactly 300 response rows behind its bearer secret.
- The analyzer selected 20 raters and 300 ratings.
- The exact equivalence and superiority tests ran.
- The paired bootstrap ran.
- The public CSV removed submission IDs and precise timestamps.
- Integrity flags: 0.

The synthetic verdict is a test oracle only. It is not outside-rater evidence and
must never be merged into the real Study A response export.

## Fix cycles

1. Replaced inline progress and image-width styles with native progress and
   locked CSS classes.
2. Raised mobile consent targets to 44px and completed hover, focus, active,
   and disabled states.
3. Corrected the WebKit progress selector split after visual inspection exposed
   the browser's native green value bar.
4. Made the current sample visible as progress from sample one.
5. Raised interactive boundary contrast while leaving structural rules quiet.
6. Removed the internal method name from participant-visible study payloads and
   verified the rebuilt client bundle contains no method marker.

## Persistence

- The goddesign stamp is the first line of `app/globals.css`.
- The project entry is in `.design-log.json`.
- The same entry is in the user-level design ledger.
