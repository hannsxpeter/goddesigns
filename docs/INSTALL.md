# Install

Goddesign is a skill folder plus a few Node scripts. There is no build step
and no account.

You need Node 18 or newer, and an assistant that can read a skill. Claude Code,
Codex, and Cursor are the hosts the installer knows.

## From npm

```bash
npx @hxp-tools/goddesign --claude --global
```

| Flag | Where the skill goes |
| --- | --- |
| `--claude` | `~/.claude/skills/goddesign` |
| `--codex` | `~/.agents/skills/goddesign` (and `~/.codex/skills` when that directory already exists) |
| `--cursor` | `~/.cursor/skills/goddesign` |
| `--all` | All three |
| `--local` | The same paths under the current directory, instead of your home directory |
| `--check` | Verify the package and any copy already installed. Change nothing. |
| `--uninstall` | Remove the `goddesign` skill directory for the hosts you name. Nothing else. |

No flags installs Claude Code and Codex. Run it again after you move the
folder; a copy does not follow a later edit until you reinstall.

Confirm:

```bash
npx @hxp-tools/goddesign --check
sh ~/.claude/skills/goddesign/scripts/verify-install.sh
```

## From a clone

```bash
git clone https://github.com/hannsxpeter/goddesigns.git
sh goddesigns/scripts/install.sh
```

That runs the same installer as the npm package.

## Use it

In Claude Code: `/goddesign a landing page for a small-batch coffee roaster`.

In Codex: `$goddesign`, and re-invoke it for each new design task.

A short note in your assistant's instructions makes design requests pick the
skill up without the command. The skill already routes "build me a signup
page" and "make this dashboard look better" when it is installed.
