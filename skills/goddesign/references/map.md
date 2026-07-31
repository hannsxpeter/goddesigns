# Design Map

Read this file only when a design effort spans more than one session. A single
page, component, or restyle never needs a map; charting one for a one-surface
brief is ceremony and costs a session for nothing.

The rest of this skill designs one surface per run. This file is the mechanism
for efforts larger than a run: a product whose marketing site, auth screens,
app shell, dashboard, settings, and empty states all have to look like one
system built by one person, designed across many sessions, possibly by
different hosts, possibly weeks apart.

Provenance: the map's structure (an index that never restates what its entries
hold, a destination that fixes scope, a fog section for what cannot yet be
specified, an out-of-scope section that never graduates, claim-before-work) is
adapted from the wayfinder skill in `mattpocock/skills` (MIT, Copyright (c)
2026 Matt Pocock). The rules below are goddesign-native, not transcriptions.
The full borrow-and-decline record is in
`validation/research/wayfinder-evaluation-2026-07.md`.

## When a map applies

Chart a map when any of these is true, and not otherwise:

- The brief names **3 or more distinct surfaces**. A surface is a page, a
  screen, or a coherent component set with its own one action (Step 2).
- The user states the work continues across sessions, or hands off to another
  person or host.
- A `.design-map.md` already exists at the project root. Then you are working
  an existing map, not deciding whether to chart one.

Two surfaces or fewer, single session, no existing map: no map. Design them
directly.

## Why a map, stated once

Three defects appear when a multi-surface effort runs without one, and each is
a mechanism failure, not a taste failure:

1. **Rotation inverts against you.** Step 3a's ledger rules exist to make the
   next run differ from the last. Across projects that is the whole point.
   Across surfaces of one product it is a defect: it pushes the pricing page
   away from the home page it must match. Under a map, rotation runs once, at
   charting, and the surfaces match.
2. **The ledger floods.** Nine surfaces written as nine entries fill both
   ledgers with near-identical rows, trip the popularity cap in Step 3a, and
   poison rotation for every future project on that machine. A map writes
   exactly one entry.
3. **Scope collapses at the context wall.** A model given nine surfaces in one
   session builds three well and ships the rest as wireframes, which the
   EXPAND lane's "do not silently trim scope" rule forbids but cannot prevent.
   One surface per session makes the rule keepable.

## The map file

`.design-map.md` at the project root, beside `.design-log.json`. It is an
**index, not a store**: it gists each locked surface in one line and points at
the file that holds the detail. A surface's real record is its stylesheet
stamp and its own markup. The map never restates them, so there is exactly one
place a value can be wrong.

The whole file is the low-resolution view, loaded once per session. Keep it
short enough to read in full at the start of every session: if the map itself
stops fitting comfortably in a session's opening read, the destination was
drawn too wide.

Write it exactly in this shape. All nine headings are required, in this order,
even when a section is empty (write `none` under an empty one).

```markdown
# Design map: <product name>

## Destination

<one or two lines: what the finished design system covers, and what "done"
looks like. This fixes the scope; everything past it is out of scope, not fog.>

## System lock

Seed: <n> | Direction: <index> <name> | Structure pool: <macrostructures this system may draw from>
Tokens: --bg #RRGGBB | --surface #RRGGBB | --text #RRGGBB | --muted #RRGGBB | --accent #RRGGBB
Jitter: h<+/-n> L<+/-n> r<+/-n>
Type: <display family weight> / <body family weight> / <label treatment>
Import: <the direction row's import line, verbatim>
Motion: <the system's motion budget>
Atmosphere: <the row's background treatment, which every surface executes>

## Notes

<brand pins, standing constraints, the host in use, anything every session
must honor. Values only; an adjective here is a decision not yet made.>

## Surfaces locked

- [<surface name>](<path to its file>) - <one-line gist: its macrostructure and its one action>

## Surfaces to design

- <surface name> - one action: <what it must drive> | audience: <who squints at it> | claimed: <no | YYYY-MM-DD host>

## Not yet specified

- <a surface or question you can see coming but cannot yet phrase sharply>

## Out of scope

- <surface or work> - <why it sits past the destination>

## Open questions

- <a fact only the person can supply> - parked <YYYY-MM-DD>, placeholder shipped on <surface>
```

Validate it mechanically before and after every session that touches it:

```sh
node <skill-root>/scripts/verify-map.mjs .design-map.md
```

Exit 0 green, 1 named failures, 2 no map at that path. Fix what it names; a
map that does not parse is a map the next session cannot trust.

## Chart the map

Charting produces a map and **no pixels**. It is one session's work, and it
builds nothing. The pull to start building the home page while charting is the
signal that charting is done.

1. **Name the destination.** One or two lines: what the finished system covers.
   Settle this first, because it fixes the scope and every later
   surface-or-out-of-scope call resolves against it.
2. **Run the context gate once, at product scale** (Step 2): subject, audience,
   the one action of the *product*, tone. Individual surfaces get their own one
   action later; this one is the system's.
3. **Run the variance engine once** (Step 3, all four sub-steps including the
   Step 3d jitter) and write the result into **System lock**. This is the only
   seed roll the whole effort makes. Every surface inherits these values
   verbatim.
4. **List the surfaces you can specify now** under **Surfaces to design**, each
   with its one action and audience, `claimed: no`. Order them so the surfaces
   that set the system's vocabulary come first (usually the densest real
   screen, not the marketing home page: a system proven on a dashboard extends
   to a hero, and a system proven on a hero collapses on a dashboard).
5. **Sketch the fog** into **Not yet specified**, and rule the known exclusions
   into **Out of scope** with reasons.
6. **Park the human-only facts** into **Open questions**.
7. Run the validator. Stop. Report the map and the first surface to take.

If step 4 lists fewer than 3 surfaces and step 5 surfaces no fog, the effort
did not need a map. Say so, delete the map, and design the surfaces directly.

## Work a surface

One surface per session. This is the rule that keeps the context budget honest,
and the only exception is a trivially small sibling (an error page that is the
locked 404 with different copy) which may ride along in the same session.

1. **Load the map** in full. Run the validator.
2. **Choose the surface.** If the user named one, take it. Otherwise take the
   first unclaimed line in **Surfaces to design**.
3. **Claim it first**, before any work: set `claimed: <YYYY-MM-DD> <host>` on
   its line and save the file. An unclaimed line is takeable by a concurrent
   session; a claimed one is not. Expect other sessions to be editing this file.
4. **Inherit the System lock verbatim.** Do not roll a seed. Do not re-jitter.
   Do not read `directions.md` for a new row. Write the surface's DIRECTION
   LOCK (Step 4a) with the System lock's Seed, Tokens, Jitter, Type, Import,
   Motion, and Atmosphere copied exactly, and only these lines chosen fresh
   for this surface:
   - **Structure**: a macrostructure from the map's structure pool, and not the
     one the previously locked surface used.
   - **Layout**, **Signature**, **Grammar**, and the optional conception map.
5. **Build and gate.** Steps 4c, 4d, and the full Step 5 QA gate, with the map
   amendments in `checklist.md`.
6. **Record it.** Move the surface's line from **Surfaces to design** to
   **Surfaces locked** as a markdown link to the file it produced, plus a
   one-line gist. Do not paste the lock into the map; the stylesheet stamp
   holds it.
7. **Clear the fog it lifted.** If resolving this surface made a fog entry
   specifiable, move it into **Surfaces to design** with its one action and
   audience, and delete it from **Not yet specified**. A patch of fog may
   graduate into several surfaces, or none.
8. **Rule, do not resolve, anything past the destination.** If the work reveals
   that a listed surface sits beyond the destination, move it to **Out of
   scope** with a reason. It never lands in **Surfaces locked**: that section
   records the system actually built, and a scope boundary is not part of it.
9. Run the validator. Report which surface is next.

## Surface or fog

The test is whether you can state the surface sharply **now**, not whether you
can design it now.

- **A surface** when you can write its one action and its audience in one line
  each. List it under **Surfaces to design** even when it depends on a surface
  that does not exist yet.
- **Fog** when you cannot. It goes under **Not yet specified**, as loosely as
  the view allows. Do not pre-slice fog into surface-shaped pieces: it is
  coarser than a surface, and guessing its shape now is the same failure as
  writing "use gray" instead of a hex.

**Not yet specified** excludes what is already locked, what is already listed,
and what is out of scope.

## Out of scope

Fog gathers only toward the destination. Work past the destination is not fog
and does not belong in **Not yet specified**: it is out of scope, and it gets
its own section with a one-line reason each.

Out-of-scope work never graduates. It returns only if the destination is
redrawn, and then as a new map, not a resumption of this one.

## Open questions

Step 2 says to invent confidently where the brief is silent, and Step 4c
forbids inventing metrics, testimonials, logos, and company names. Those two
rules collide whenever a surface needs a real number the person has not given
you. The map resolves the collision with a third option, and it is the only
correct one:

**A surface never blocks on a human-only fact.** Ship it with a placeholder
labeled as a placeholder, per Step 4c, and record the question under **Open
questions** with the date and the surface carrying the placeholder. Never
invent the value, and never stall the session waiting for it. These are the
only items on the map the agent may not answer itself; answering one on the
person's behalf is the same defect as a fabricated testimonial.

When the person supplies an answer, replace the placeholder on the named
surface and delete the question.

## What changes under a map

These amendments override the corresponding single-run rules for every session
working a map. They exist because the single-run rules assume each run is an
unrelated project, which is exactly false inside one map.

| Rule | Single run | Under a map |
|---|---|---|
| Seed roll (Step 3b) | Once per run | Once per map, at charting. Surface sessions never roll. |
| Jitter (Step 3d) | Once per run | Once per map, at charting. Re-jittering a surface would ship siblings with different accents. |
| Ledger rotation (Step 3a) | Every run must differ from the last | Applies at charting only. Inside the map, surfaces must **match** the System lock. |
| Ledger write (Persist) | One entry per run | One entry per **map**, written when the last surface locks. Nine surfaces write one entry, not nine. |
| Direction row | Read per run | Read once, at charting. Surface sessions inherit and never re-read `directions.md`. |
| Macrostructure | One per run | One per **surface**, drawn from the map's structure pool, and not the previous surface's. |
| Variety (Phase 1 axis 6) | Differs from previous runs | Belongs to the same system while not being the previous surface's skeleton with new copy. See `checklist.md`. |
| Anti-cliche critique (Step 4b) | Every run | At charting for the system, then per surface for its own signature and structure. |
| Scoped-edit mode (Step 0 item 2) | Reuses the page's stamped lock | Unchanged, and it wins: a restyle of an already-locked surface stays a scoped edit. |

Everything else is unchanged. The craft floor (Step 4d), the Banned list, the
grammar breaks, and the full QA gate apply to every surface exactly as they
apply to a single run. A map buys consistency across sessions; it buys no
relief from any gate.
