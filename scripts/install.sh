#!/bin/sh
# Link the goddesign skill into each host's skill directory, then prove every
# link resolves to a complete install by running verify-install.sh through it.
#
# Why this exists: installing by hand with `ln -s "$PWD/..."` writes an absolute
# path into the link, so moving the clone or renaming the account leaves a
# dangling link. Nothing reported it: verify-install.sh run from the clone
# checks the clone, and a host that cannot resolve a skill simply does not list
# it. On the maintainer's machine that silently disabled the skill in Claude
# Code for weeks while the always-use-goddesign rule kept pointing at it.
#
# Usage:
#   sh scripts/install.sh           link, repairing stale links, then verify
#   sh scripts/install.sh --check   verify only; change nothing
#
# Hosts: Claude Code (~/.claude/skills), Codex (~/.agents/skills), and the legacy
# Codex path (~/.codex/skills) when that directory already exists. A real
# directory already sitting at a link path is reported, never overwritten.
# Exit 0 every present link resolves, 1 a link is broken or an install is incomplete.

set -u
repo=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
src="$repo/skills/goddesign"
mode=link
case "${1:-}" in
  --check) mode=check ;;
  '') ;;
  *) echo "usage: sh scripts/install.sh [--check]" >&2; exit 2 ;;
esac

status=0
host() {
  dir=$1
  label=$2
  dest="$dir/goddesign"
  if [ "$mode" = link ]; then
    if [ -L "$dest" ] || [ ! -e "$dest" ]; then
      mkdir -p "$dir" && ln -sfn "$src" "$dest"
    else
      echo "skip $label: $dest is a real directory, not a link; move it aside to link this clone"
    fi
  fi
  if [ -L "$dest" ] && [ ! -e "$dest" ]; then
    echo "FAIL $label: $dest -> $(readlink "$dest") does not exist (run: sh scripts/install.sh)"
    status=1
  elif [ -e "$dest" ]; then
    if out=$(sh "$dest/scripts/verify-install.sh" 2>&1); then
      echo "ok   $label: $dest -> $(readlink "$dest" 2>/dev/null || echo 'a copy, not a link')"
    else
      echo "FAIL $label: $dest is incomplete:"
      printf '%s\n' "$out" | sed 's/^/     /'
      status=1
    fi
  else
    echo "none $label: not installed at $dest"
  fi
}

host "$HOME/.claude/skills" "Claude Code"
host "$HOME/.agents/skills" "Codex"
if [ -d "$HOME/.codex/skills" ]; then
  host "$HOME/.codex/skills" "Codex (legacy path)"
fi
exit $status
