# Setup guide

goddesign is a folder of instructions and small scripts, not an app. Installing
it means pointing your AI assistant at that folder. There is no build step, no
package to install, no account to create.

Total time: about a minute.

## What you need

- An AI coding assistant that supports skills. Claude Code and OpenAI Codex CLI
  are the two we test on; most others work too (see [Other assistants](#other-assistants)).
- Git, to download the files.
- Node 18 or newer. The picker and the source scan are Node scripts with no
  dependencies. Without Node the skill still runs, on a documented fallback,
  and says which checks it could not run.

## Step 1: download it

```sh
git clone https://github.com/hannsxpeter/goddesigns.git
```

## Step 2: link it into your assistants

```sh
sh goddesigns/scripts/install.sh
```

The installer links the skill folder into each assistant's skill directory
(`~/.claude/skills` for Claude Code, `~/.agents/skills` for Codex, and the older
`~/.codex/skills` if you have it), then runs the install check through every
link. It prints one line per assistant:

```
ok   Claude Code: ~/.claude/skills/goddesign -> /path/to/goddesigns/skills/goddesign
ok   Codex: ~/.agents/skills/goddesign -> /path/to/goddesigns/skills/goddesign
```

Links rather than copies mean a single `git pull` later updates every assistant
at once. A link stores an absolute path, though, so **if you move the folder or
rename your user account, run the installer again**: it repairs stale links. If
a real directory (a copy) already sits where a link should go, the installer
reports it and leaves it alone.

Prefer to link by hand? Use `ln -sfn`, which replaces an existing or dangling
link, where a plain `ln -s` fails with "File exists":

```sh
mkdir -p ~/.claude/skills
ln -sfn "$PWD/goddesigns/skills/goddesign" ~/.claude/skills/goddesign
```

Use it with `/goddesign <what you want>` in Claude Code, or
`$goddesign <what you want>` in Codex. Codex skills last for one turn, so
re-invoke it for each new design task.

## Step 3: confirm it installed cleanly

```sh
sh goddesigns/scripts/install.sh --check
```

This matters more than it sounds. The check runs *through each link*, which is
the only place a broken install shows up: run from the clone, a check inspects
the clone and passes even while your assistant's link points at a folder that
no longer exists, and an assistant that cannot resolve a skill simply stops
listing it, with no error anywhere. That is not hypothetical; it is how the
skill went missing from the maintainer's own Claude Code for weeks.

A good install prints `ok` for every assistant you use. A broken one names the
problem:

```
FAIL Claude Code: ~/.claude/skills/goddesign -> /Users/old-name/goddesigns/skills/goddesign does not exist (run: sh scripts/install.sh)
```

The check also goes past "are the files there". A copied-instead-of-linked
install or a stale old version can have every file present while one deck is
missing rows, and then the skill reaches for a design that is not there, so it
counts the rows too:

```
INCOMPLETE INSTALL: references/directions.md has 14 rows, SKILL.md's no-node fallback rolls % 17 (stale or partial copy: reinstall, see docs/INSTALL.md)
```

The picker runs the same check on every run and stops with an
`INCOMPLETE INSTALL` line rather than letting the assistant improvise a missing
design, so a stale install cannot pass silently even if you skip this step.

## Step 4 (optional): make it automatic

**It already recognizes design work.** Assistants that pick skills automatically
(Claude Code does) match your request against the skill's description, which
lists the situations it covers: landing pages, dashboards, hero sections,
pricing pages, mockup-to-code, restyling, "make it look better", any
HTML/CSS/Tailwind/React styling.

**Make it a standing rule.** For a guarantee across every session, add one
paragraph to the instructions file your assistant always loads. The skill sizes
itself to the task, so the rule should not force the full run on small edits.

Claude Code, in `~/.claude/CLAUDE.md` (applies everywhere) or a project's own
`CLAUDE.md`:

```
# Frontend work: use the goddesign skill
For frontend, UI, or visual web work (a page, site, landing page, dashboard,
app screen, component, hero, pricing page, mockup-to-code, or HTML/CSS/Tailwind/
React styling), invoke the goddesign skill first, even when the request does not
say "design" or name the skill. Let it size the work: new pages and surfaces, or
any "make it look different" request, get its full path (pick, lock, build,
gate); edits to an existing page get its edit path (the Banned list plus the
source scan on changed files). Do not hand-design frontend work without it
unless told to skip it.
```

Codex CLI: the same paragraph in `~/.codex/AGENTS.md` or a project `AGENTS.md`,
using `$goddesign` as the invocation, plus a note to re-invoke it per task.

## Optional extras

goddesign works without every one of these. When something is missing, the skill
says so plainly in its output rather than quietly skipping a check.

| If you install | You get | If you skip it |
|---|---|---|
| Playwright (`npm i -g playwright`, then `npx playwright install chromium`) | The visual audit: opens the built page in a real browser and catches overlapping text, hidden content, overflow, tiny tap targets, and fonts that failed to load, with screenshots | Falls back to a screenshot chain, then to an honest `DEGRADED: no visual check` note with a command you can run yourself |
| Playwright CLI or headless Chrome | The screenshot fallback | Same honest degraded note |
| OpenAI Codex CLI (signed in to ChatGPT) | Image generation, through ChatGPT's built-in image tool, for assistants with no native image tool (Claude Code included). Also the sandboxed-Codex helper, and the optional blind read | Artwork falls back to the hand-coded CSS/SVG art each direction already carries |
| Python 3.10+ and the independent [`remove-ai-marks`](https://github.com/guillaumemeyer/watermarks-remover) skill | Inspection and cleaning of invisible Unicode, file metadata, C2PA, text marks, and image marks, only when your brief asks for it, after the design gate | Ordinary design is unchanged; the requested extra reports `OPTIONAL HYGIENE UNAVAILABLE` with no score deduction |
| `curl` and network access | A check that the webfonts actually load | The gate states that it skipped the check |

## Checking a page without a browser

The visual audit needs a browser. The source scan needs nothing but Node, so it
runs anywhere, including offline and inside a locked-down sandbox:

```sh
node goddesigns/skills/goddesign/scripts/sweep.mjs index.html
```

Point it at a file or a whole folder. It prints every problem with the file,
line number, and offending value, and exits `0` when clean, `1` when it found
named failures, and `2` when there was nothing to scan. `--rules` prints the
full rule table, `--json` gives machine-readable output, and
`--tokens <baseline.json>` reports drift against an existing design system.

Three copy rules (vague attribution, filler phrases, formulaic contrasts or
conclusions) are advisories: they never fail the gate. Read them in context,
then fix the copy or state why the phrase is precise, sourced, or quoted.

Some rules are legitimately breakable when a chosen design direction calls for
them. Waive one rule for one file with an inline comment; the reason is
mandatory, so the escape hatch cannot be used silently:

```
/* goddesign-allow: metallic-premium row 13 Art Deco Geometric states period gold as its accent */
```

The scan is half the check, not the whole check. It reads code, so it cannot see
two elements overlapping or a section rendering blank. Run the visual audit too
whenever a browser is available.

## Generating images

Most pages ship no photographs or illustrations by design, so this is rarely
needed. When a page genuinely calls for artwork, the skill writes an
art-directed prompt (derived from the locked colors, medium, and composition)
and hands it to the Codex CLI, which produces the image with ChatGPT's built-in
image tool:

```sh
sh goddesigns/skills/goddesign/scripts/genimage.sh "<art-directed prompt>" hero.png
```

It exits `0` and prints where the file landed, or exits `2` with
`IMAGE GENERATION UNAVAILABLE` when Codex is not installed. On that failure the
page falls back to the hand-coded CSS and SVG art the chosen direction already
specifies, so a run never stalls waiting on pixels.

## Optional provenance hygiene

This is not part of a normal design run. It activates only when your brief asks
to inspect or remove invisible Unicode, AI metadata, C2PA or Content
Credentials, statistical text marks, or image watermarks from content you own
or are authorized to process.

Install the independent companion once, then link it into the same skill
directory your assistant already reads:

```sh
git clone https://github.com/guillaumemeyer/watermarks-remover.git
ln -sfn "$PWD/watermarks-remover/skills/remove-ai-marks" ~/.agents/skills/remove-ai-marks
# Claude Code users can link the same folder under ~/.claude/skills instead.
```

goddesign's adapter discovers project-local installs, common Codex and Claude
skill directories, or `REMOVE_AI_MARKS_SKILL_DIR`:

```sh
sh goddesigns/skills/goddesign/scripts/provenance-hygiene.sh locate
sh goddesigns/skills/goddesign/scripts/provenance-hygiene.sh inspect-file public/hero.png --json
```

The workflow is inspect, clean to a new output, verify, and report residual
limits. Statistical rewrites and pixel regeneration are never automatic because
they can change copy or visuals; if either runs, goddesign repeats the full
design gate afterward. Validation evidence and frozen study artifacts are
excluded because their provenance is part of the record.

## Running Codex in a sandbox

Codex sandboxes usually block launching a browser, so the visual audit cannot run
inside one. Use the helper, which builds inside the sandbox, audits outside it,
and feeds any failures back into the same session:

```sh
sh goddesigns/skills/goddesign/scripts/codex-audit-loop.sh <project-dir> "<what you want>"
```

A sandboxed run that cannot audit also drops an `audit-handoff.sh` file into the
project folder, so the exact command is there waiting for you or your automation.

## Other assistants

Any assistant that reads markdown skills with `name` and `description` metadata
can run goddesign. That minimal requirement is deliberate: there is no
host-specific syntax anywhere in the skill. Point your assistant's skill folder
at `skills/goddesign` and you are done.

One assistant is the complete setup. goddesign never launches a second one on its
own, and a full, fully scored design run needs only the one you are using.
Cross-assistant work happens only when you explicitly ask for a comparison.

## Updating

```sh
cd goddesigns && git pull
```

If you linked in Step 2, every assistant picks up the update immediately.
Nothing is cached per assistant.

## For maintainers: the four-way comparison

`scripts/arm-test.mjs` runs the pre-registered comparison in
`validation/studies/lean-core-2026-09/` headless, one isolated Claude Code
process per cell:

```sh
node goddesigns/scripts/arm-test.mjs run --jobs 3   # resumable; --retry-failed re-runs API failures
node goddesigns/scripts/arm-test.mjs pack           # then rank work/pack/RANK.md blind
node goddesigns/scripts/arm-test.mjs reveal
```

It needs the `claude` CLI itself logged in (`claude auth status` must report
`loggedIn: true`; run `claude auth login` once). A login in the Claude desktop
app does not carry over to `claude -p`, and the harness stops with that message
rather than recording twenty failed runs. Launched from inside a Claude Code
session, it strips that session's environment first, so a cell behaves as if it
were started from a terminal.

## Troubleshooting

**"It ignored the skill entirely."** Run `sh goddesigns/scripts/install.sh
--check`. A dangling link is the most common cause and produces no error in the
assistant itself; in Claude Code, `/goddesign` stops autocompleting. Re-run the
installer to repair it. If the skill loads but does not fire on its own, add the
standing rule from Step 4.

**"The design looks generic."** Run the check in Step 3. A stale or partial copy
is the second most common cause, because a missing deck row gets improvised.

**"It said DEGRADED."** That is the skill being honest that an optional check
could not run. See the [Optional extras](#optional-extras) table for what to
install to enable it.

**"Codex forgot the skill on my second request."** Expected. Codex skills are
scoped to a single turn. Re-invoke `$goddesign` each time.
