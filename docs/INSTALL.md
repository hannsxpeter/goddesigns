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

## Install from GitHub Packages (alternative)

goddesign is also published as an npm package to GitHub Packages: [`@hannsxpeter/goddesign`](https://github.com/hannsxpeter/goddesigns/pkgs/npm/goddesign). This is a convenience mirror, not the recommended path: GitHub Packages requires npm to authenticate with a GitHub token (scope `read:packages`) even for a public package, so the `git clone` method above is simpler for most people.

Point the `@hannsxpeter` scope at GitHub Packages and authenticate, in your `~/.npmrc`:

```
@hannsxpeter:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then install and link the skill into your host directories:

```sh
npm install -g @hannsxpeter/goddesign
goddesign-install
```

`goddesign-install` symlinks the packaged skill into `~/.claude/skills`, `~/.agents/skills`, and `~/.codex/skills` (skipping any that already exist), so a `git pull`-free update path is `npm update -g @hannsxpeter/goddesign`.

## Verify the install

The skill is only as good as its reference decks; a partial install (a broken symlink, a half-cloned tree) lets the model improvise missing rows, which recreates the generic look the skill exists to avoid. Confirm a complete install with:

```sh
sh skills/goddesign/scripts/verify-install.sh
```

It prints `goddesign: install OK` and exits 0 when `SKILL.md` and the seven `references/*.md` decks are present, or `INCOMPLETE INSTALL: <file> not found` and exits 1 otherwise (optional scripts and files are reported as notes, not failures). Hosts without a shell get the same protection lazily: the skill stops with the same message at Step 3 if a deck it needs cannot be read.

## Other agent CLIs

Any host that loads markdown skills with `name` and `description` frontmatter can run goddesign; only that minimal frontmatter is used, deliberately. Point your host's skill directory at `skills/goddesign`.

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
