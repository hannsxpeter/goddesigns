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

## Other agent CLIs

Any host that loads markdown skills with `name` and `description` frontmatter can run goddesign; only that minimal frontmatter is used, deliberately. Point your host's skill directory at `skills/goddesign`.

## Optional dependencies

The skill degrades gracefully without any of these, and says so honestly in its output:

| Dependency | Enables | Without it |
|---|---|---|
| Node 18+ plus the Playwright library (`npm i -g playwright`, then `npx playwright install chromium`) | The measured audit (`scripts/audit.mjs`): collision, reveal-bug, font-fallback, overflow, and touch-target detection with screenshots | Falls back to a screenshot chain, then to `DEGRADED: no visual check` with an operator handoff command |
| Playwright CLI or headless Chrome | The screenshot fallback chain | Same DEGRADED path |
| OpenAI Codex CLI | Cross-host image generation (`scripts/genimage.sh`) and the sandboxed-Codex wrapper (`scripts/codex-audit-loop.sh`) | Imagery falls back to each direction row's CSS/SVG art; the wrapper is Codex-specific by definition |
| `curl` and network access | The webfont import liveness check | The gate states the skip |

## Running Codex sandboxed

Codex sandboxes typically block browser spawn, so the audit cannot run inside. Use the operator wrapper, which builds inside the sandbox, audits outside it, and feeds failures back into the same session:

```sh
sh skills/goddesign/scripts/codex-audit-loop.sh <project-dir> "<design brief>"
```

A sandboxed run that cannot audit also writes `./audit-handoff.sh` into the project directory so automation can pick up the exact command mechanically.

## Updating

```sh
cd goddesigns && git pull
```

Symlinked hosts pick the update up immediately. Nothing is cached per-host.
