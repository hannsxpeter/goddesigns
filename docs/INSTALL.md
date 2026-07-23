# Installation

goddesign is a file-based skill: installing it means making the `skills/goddesign` directory visible to your host. Symlinks are recommended so a `git pull` updates every host at once.

## Claude Code

```sh
git clone https://github.com/hannsxpeter/goddesigns.git
mkdir -p ~/.claude/skills
ln -s "$PWD/goddesigns/skills/goddesign" ~/.claude/skills/goddesign
```

Invoke with `/goddesign <design brief>`.

## OpenAI Codex CLI

```sh
mkdir -p ~/.agents/skills
ln -s "$PWD/goddesigns/skills/goddesign" ~/.agents/skills/goddesign
```

Older Codex versions read `~/.codex/skills`; link there too if yours does. Invoke with `$goddesign <design brief>`. Codex skills are turn-scoped: re-invoke for each new design task.

## Verify the install

The skill is only as good as its reference decks; a partial install (a broken symlink, a half-cloned tree) lets the model improvise missing rows, which recreates the generic look the skill exists to avoid. Confirm a complete install with:

```sh
sh skills/goddesign/scripts/verify-install.sh
```

It prints `goddesign: install OK` and exits 0 when `SKILL.md` and the seven `references/*.md` decks are present, or `INCOMPLETE INSTALL: <file> not found` and exits 1 otherwise (optional scripts and files are reported as notes, not failures). Hosts without a shell get the same protection lazily: the skill stops with the same message at Step 3 if a deck it needs cannot be read.

The skill also inventories known agent commands before a run:

```sh
sh skills/goddesign/scripts/detect-clis.sh
```

The tab-separated result distinguishes agent commands such as `codex`, `claude`, and `cursor-agent` from desktop launchers such as `cursor`. It also checks Gemini CLI, OpenCode, Aider, Goose, GitHub Copilot, Amp, Amazon Q, Kiro, and Factory Droid. Detection means only that the command exists on `PATH`; authentication and capability are verified when a documented helper actually invokes it.

## Other agent CLIs

Any host that loads markdown skills with `name` and `description` frontmatter can run goddesign; only that minimal frontmatter is used, deliberately. Point your host's skill directory at `skills/goddesign`.

The detected tools are optional capabilities, not requirements. The skill does
not depend on one editor, agent, model vendor, deployment platform, account,
domain, DNS configuration, or network service. When a host lacks an optional
capability, the documented fallback or an honest `DEGRADED` note applies.

One capable host is the complete default setup. The inventory never launches a
second host by itself. Cross-host work runs only when the design brief
explicitly asks for comparison, replication, or compatibility testing across
hosts. Merely naming the current host does not opt in. Named maintainer
validation protocols are the only non-prompt exception. If requested
cross-host scope is unavailable, report that limitation separately without
lowering the design's QA score.

## Optional dependencies

The skill degrades gracefully without any of these, and says so honestly in its output:

| Dependency | Enables | Without it |
|---|---|---|
| Node 18+ plus the Playwright library (`npm i -g playwright`, then `npx playwright install chromium`) | The measured audit (`scripts/audit.mjs`): collision, reveal-bug, font-fallback, overflow, and touch-target detection with screenshots | Falls back to a screenshot chain, then to `DEGRADED: no visual check` with an operator handoff command |
| Playwright CLI or headless Chrome | The screenshot fallback chain | Same DEGRADED path |
| OpenAI Codex CLI | Cross-host image generation (`scripts/genimage.sh`) and the sandboxed-Codex wrapper (`scripts/codex-audit-loop.sh`) | Imagery falls back to each direction row's CSS/SVG art; the wrapper is Codex-specific by definition |
| An image-capable CLI (Codex or Claude Code) | The optional blind post-render critic (`scripts/blind-read.sh`): a separate process reads only the screenshots and reconstructs the page's identity, catching pages that render fine but do not communicate their subject | Prints `DEGRADED: no blind read`; the gate falls back to the builder's own Phase 3 inspection |
| `curl` and network access | The webfont import liveness check | The gate states the skip |

## Running Codex sandboxed

Codex sandboxes typically block browser spawn, so the audit cannot run inside. Use the operator wrapper, which builds inside the sandbox, audits outside it, and feeds failures back into the same session:

```sh
sh skills/goddesign/scripts/codex-audit-loop.sh <project-dir> "<design brief>"
```

A sandboxed run that cannot audit also writes `./audit-handoff.sh` into the project directory so automation can pick up the exact command mechanically.

## Automatic triggering (no command needed)

The skill fires without anyone typing `/goddesign` through two layers:

1. **The description is the trigger.** Hosts that auto-select skills (Claude Code does) match requests against the skill's `description`, which enumerates concrete trigger phrases: landing page, dashboard, hero section, pricing page, mockup-to-code, restyle, "make it look better", any HTML/CSS/Tailwind/React styling. A request like "build me a signup page" invokes the skill by itself.
2. **Standing instructions.** For a guarantee across sessions, add one paragraph to the file your host always loads:

For Claude Code, in `~/.claude/CLAUDE.md` (global) or a project `CLAUDE.md`:

```
# Frontend work: always use the goddesign skill
For any frontend, UI, or visual web task, invoke the goddesign skill first and
follow it fully, even when the request does not say "design" and does not name
the skill. Do not hand-design frontend work without it unless told to skip it.
```

For Codex CLI, the same paragraph in `~/.codex/AGENTS.md` (global) or a project `AGENTS.md`, with `$goddesign` as the invocation and a note to re-invoke per task (Codex skills are turn-scoped).

A third, fully deterministic layer is available in Claude Code: a `UserPromptSubmit` hook in `settings.json` that matches frontend keywords in the prompt and injects a reminder to invoke the skill. Most setups do not need it; the two layers above cover normal use.

## Updating

```sh
cd goddesigns && git pull
```

Symlinked hosts pick the update up immediately. Nothing is cached per-host.
