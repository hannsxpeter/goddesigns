# Setup guide

goddesign is a folder of instructions, not an app. Installing it means pointing
your AI assistant at that folder. There is no build step, no package to install,
no account to create.

Total time: about a minute.

## What you need

- An AI coding assistant that supports skills. Claude Code and OpenAI Codex CLI
  are the two we test on; most others work too (see [Other assistants](#other-assistants)).
- Git, to download the files.

That is the whole list. Everything else on this page is optional.

## Step 1: download it

```sh
git clone https://github.com/hannsxpeter/goddesigns.git
```

## Step 2: point your assistant at it

We recommend a symlink (a shortcut) rather than a copy. That way a single
`git pull` later updates every assistant at once.

**Claude Code:**

```sh
mkdir -p ~/.claude/skills
ln -s "$PWD/goddesigns/skills/goddesign" ~/.claude/skills/goddesign
```

Use it with `/goddesign <what you want>`.

**OpenAI Codex CLI:**

```sh
mkdir -p ~/.agents/skills
ln -s "$PWD/goddesigns/skills/goddesign" ~/.agents/skills/goddesign
```

Use it with `$goddesign <what you want>`. Two notes on Codex: older versions
read from `~/.codex/skills` instead, so link there as well if yours does, and
Codex skills only last for one turn, so re-invoke it for each new design task.

## Step 3: confirm it installed cleanly

This step matters more than it sounds. The skill is only as good as its
reference decks, and a partial install (a broken shortcut, an interrupted
download) lets the assistant improvise the missing pieces, which recreates the
generic look you installed this to avoid.

```sh
sh skills/goddesign/scripts/verify-install.sh
```

A good install prints:

```
goddesign: install OK
```

A broken one names the exact problem instead:

```
INCOMPLETE INSTALL: references/directions.md not found
```

The check goes one step further than "are the files there". A copied-instead-of-
linked install or a stale old version can have every file present while one deck
is missing rows, and then the skill reaches for a design that is not there. So
the script also counts the rows and compares them against what the skill expects:

```
INCOMPLETE INSTALL: references/directions.md has 14 rows, SKILL.md Step 3b rolls % 17 (stale or partial copy: reinstall, see docs/INSTALL.md)
```

If you see that, your copy is out of date. Redo Step 2 rather than editing the
file by hand.

Assistants that cannot run shell commands get the same protection a different
way: the skill stops with the same message the moment it tries to read a deck
that is not there.

## Step 4 (optional): make it automatic

You can stop typing the command. There are two layers, and most people only need
the first.

**Layer 1: it already recognizes design work.** Assistants that pick skills
automatically (Claude Code does) match your request against the skill's
description, which lists the situations it covers: landing pages, dashboards,
hero sections, pricing pages, turning a mockup into code, restyling, "make it
look better", any HTML/CSS/Tailwind/React styling. Asking for "a signup page"
is usually enough to invoke it on its own.

**Layer 2: make it a standing rule.** For a guarantee across every session, add
one paragraph to the instructions file your assistant always loads.

Claude Code, in `~/.claude/CLAUDE.md` (applies everywhere) or a project's own
`CLAUDE.md`:

```
# Frontend work: always use the goddesign skill
For any frontend, UI, or visual web task, invoke the goddesign skill first and
follow it fully, even when the request does not say "design" and does not name
the skill. Do not hand-design frontend work without it unless told to skip it.
```

Codex CLI: the same paragraph in `~/.codex/AGENTS.md` or a project `AGENTS.md`,
using `$goddesign` as the invocation, plus a note to re-invoke per task.

There is a third, fully deterministic option for Claude Code (a
`UserPromptSubmit` hook in `settings.json` that watches for frontend keywords and
injects a reminder). Most setups do not need it.

## Optional extras

goddesign works without every one of these. When something is missing, the skill
says so plainly in its output rather than quietly skipping a check.

| If you install | You get | If you skip it |
|---|---|---|
| Node 18+ and Playwright (`npm i -g playwright`, then `npx playwright install chromium`) | The visual audit: opens the built page in a real browser and catches overlapping text, hidden content, overflow, tiny tap targets, and fonts that failed to load, with screenshots | Falls back to a screenshot chain, then to an honest `DEGRADED: no visual check` note with a command you can run yourself |
| Playwright CLI or headless Chrome | The screenshot fallback | Same honest degraded note |
| Node 18+ (no browser needed) | The source scan, the design-map validator, and design-system token extraction | The assistant checks those by hand, which is the arrangement these scripts exist to replace |
| OpenAI Codex CLI (signed in to ChatGPT) | Image generation. Assistants without a native image tool, Claude Code included, hand the art-directed prompt to Codex, which generates it with ChatGPT's built-in image tool. Also enables the sandboxed-Codex helper | Artwork falls back to the hand-coded CSS/SVG art each direction already carries |
| Codex or Claude Code | The optional blind read: a separate process looks only at the screenshots and describes what the page appears to be, catching pages that render fine but communicate nothing | Prints `DEGRADED: no blind read` and falls back to the builder's own inspection |
| Python 3.10+ and the independent [`remove-ai-marks`](https://github.com/guillaumemeyer/watermarks-remover) skill | Prompt-specified inspection and cleaning of invisible Unicode, supported file metadata, C2PA, text marks, and image marks after the design gate | Ordinary design is unchanged; the requested extra reports `OPTIONAL HYGIENE UNAVAILABLE` with no score deduction |
| `curl` and network access | A check that the webfonts actually load | The gate states that it skipped the check |

## Checking a page without a browser

The visual audit needs a browser. The source scan needs nothing but Node, so it
runs anywhere, including offline and inside a locked-down sandbox:

```sh
node skills/goddesign/scripts/sweep.mjs index.html
```

Point it at a file or a whole folder. It prints every problem with the file,
line number, and the offending value. It exits `0` when clean, `1` when it found
named failures, and `2` when there was nothing to scan.

Useful flags: `--rules` prints the full rule table, `--json` gives
machine-readable output, and `--tokens <baseline.json>` reports drift against an
existing design system.

Some rules are legitimately breakable when a chosen design direction calls for
them. You can waive one rule for one file with an inline comment, and the reason
is mandatory, so the escape hatch cannot be used silently:

```
/* goddesign-allow: metallic-premium the Art Deco row is the one row that states metallics */
```

The scan is half the check, not the whole check. It reads code, so it cannot see
two elements overlapping or a section rendering blank. Run the visual audit too
whenever a browser is available.

## Generating images

Most pages ship zero photographs or illustrations by design, so this is rarely
needed. When a page genuinely calls for artwork, goddesign generates it through
**Codex and ChatGPT**, whichever assistant you started the design in.

Claude Code and most other CLIs have no built-in image generation, so the skill
writes an art-directed prompt (derived from the locked colors, medium, and
composition) and hands it to the Codex CLI, which produces the image with
ChatGPT's built-in image tool:

```sh
sh skills/goddesign/scripts/genimage.sh "<art-directed prompt>" hero.png
```

It exits `0` and prints where the file landed, or exits `2` with
`IMAGE GENERATION UNAVAILABLE` when no capable tool is installed. On that
failure the page falls back to the hand-coded CSS and SVG art the chosen design
direction already specifies, so a run never stalls waiting on pixels.

Requirements: the `codex` command on your PATH, signed in to ChatGPT. There is
nothing else to configure.

## Optional provenance hygiene

This is not part of a normal design run. It activates only when your brief asks
to inspect or remove invisible Unicode, AI metadata, C2PA or Content
Credentials, statistical text marks, or image watermarks from content you own
or are authorized to process.

Install the independent companion once, then link it into the same skill
directory your assistant already reads:

```sh
git clone https://github.com/guillaumemeyer/watermarks-remover.git
ln -s "$PWD/watermarks-remover/skills/remove-ai-marks" ~/.agents/skills/remove-ai-marks
# Claude Code users can link the same folder under ~/.claude/skills instead.
```

goddesign's adapter discovers project-local installs, common Codex and Claude
skill directories, or `REMOVE_AI_MARKS_SKILL_DIR`:

```sh
sh skills/goddesign/scripts/provenance-hygiene.sh locate
sh skills/goddesign/scripts/provenance-hygiene.sh inspect-file public/hero.png --json
sh skills/goddesign/scripts/provenance-hygiene.sh clean-file public/hero.png -o public/hero.cleaned.png --json
```

The workflow is inspect, clean a new output, verify, and report residual limits.
Statistical rewrites and pixel regeneration are never automatic because they
can change copy or visuals. If either runs, goddesign repeats the full design
gate afterward. Validation evidence, signed receipts, and frozen study artifacts
are excluded because their provenance is part of the record.

## Running Codex in a sandbox

Codex sandboxes usually block launching a browser, so the visual audit cannot run
inside one. Use the helper, which builds inside the sandbox, audits outside it,
and feeds any failures back into the same session:

```sh
sh skills/goddesign/scripts/codex-audit-loop.sh <project-dir> "<what you want>"
```

A sandboxed run that cannot audit also drops an `audit-handoff.sh` file into the
project folder, so the exact command is there waiting for you or your automation.

## Other assistants

Any assistant that reads markdown skills with `name` and `description` metadata
can run goddesign. That minimal requirement is deliberate: there is no
host-specific syntax anywhere in the skill. Point your assistant's skill folder
at `skills/goddesign` and you are done.

The skill does not depend on any particular editor, assistant, model vendor,
deployment platform, account, domain, or network service. Where an assistant
lacks an optional capability, there is a documented fallback or an honest
`DEGRADED` note.

One assistant is the complete setup. goddesign never launches a second one on its
own, and a full, fully scored design run needs only the one you are using.
Cross-assistant work happens only when you explicitly ask for a comparison,
a replication, or a compatibility test.

If you are curious what else is on your machine, the skill can take inventory:

```sh
sh skills/goddesign/scripts/detect-clis.sh
```

It reports which known assistant commands exist (Codex, Claude, Cursor Agent,
Gemini CLI, OpenCode, Aider, Goose, GitHub Copilot, Amp, Amazon Q, Kiro, Factory
Droid, and others), and distinguishes real agent commands from desktop app
launchers. Finding a command only means it is installed; whether it is signed in
and capable is verified later, only if something actually needs it.

## Updating

```sh
cd goddesigns && git pull
```

If you symlinked in Step 2, every assistant picks up the update immediately.
Nothing is cached per assistant.

## Troubleshooting

**"It ignored the skill entirely."** Confirm the install with Step 3, then check
that your assistant actually loaded it (in Claude Code, `/goddesign` should
autocomplete). If it loads but does not fire on its own, add the standing rule
from Step 4.

**"The design looks generic."** Run Step 3. A stale or partial copy is the most
common cause, because a missing deck row gets improvised.

**"It said DEGRADED."** That is the skill being honest that an optional check
could not run. See the [Optional extras](#optional-extras) table for what to
install to enable it.

**"Codex forgot the skill on my second request."** Expected. Codex skills are
scoped to a single turn. Re-invoke `$goddesign` each time.
