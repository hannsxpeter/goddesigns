#!/bin/sh
# goddesign blind post-render critic.
# The QA gate's Phase 1 self-critique is written by the same context that built the
# page, holding the answer key. This runs a SEPARATE process that sees only the
# rendered screenshots, staged under anonymized names in an isolated temp directory
# (no project rules, no repo access, no code, no DIRECTION LOCK, no method-revealing
# filenames), and reconstructs the page's identity from pixels alone.
#
# Host-neutral: delegates to whichever image-capable CLI is installed, trying Codex
# then Claude Code, and degrading honestly if neither yields a valid read.
#
# Usage: sh blind-read.sh <shot-desktop.png> [<shot-mobile.png> ...]
# Exit 0: a valid blind read (JSON with the required keys) was printed to stdout.
# Exit 2: no image-capable CLI produced a valid read (prints DEGRADED: no blind read).
# Exit 1: bad arguments (no images, or an unreadable path).

if [ "$#" -lt 1 ]; then
  echo "usage: sh blind-read.sh <screenshot.png> [more.png ...]" >&2
  exit 1
fi
for img in "$@"; do
  [ -r "$img" ] || { echo "blind-read: cannot read $img" >&2; exit 1; }
done

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
prompt_file="$script_dir/../references/blind-read.md"
if [ ! -r "$prompt_file" ]; then
  echo "DEGRADED: no blind read (missing references/blind-read.md)"
  exit 2
fi

# Stage anonymized screenshot copies in an isolated temp dir. Running the critic from
# here (never the caller's project) is what makes "pixels only" true: no project
# CLAUDE.md / AGENTS.md / repo rules load, and the filenames reveal nothing about how
# the page was made.
tmp=$(mktemp -d 2>/dev/null) || tmp=$(mktemp -d -t blindread) || {
  echo "DEGRADED: no blind read (mktemp unavailable)"; exit 2; }
trap 'rm -rf "$tmp"' EXIT INT TERM
cp "$prompt_file" "$tmp/prompt.txt"
n=0
for img in "$@"; do
  n=$((n + 1))
  cp "$img" "$tmp/shot$n.png"
done

# A read counts only if it is non-empty and carries the required identity keys, so a
# silent stub or an auth-error banner never masquerades as a successful read.
valid() {
  [ -n "$1" ] || return 1
  printf '%s' "$1" | grep -q '"subject"' || return 1
  printf '%s' "$1" | grep -q '"signature"' || return 1
}

# Provider 1: Codex. Its -i flag is variadic, so the prompt goes in on stdin. The
# shot*.png glob expands inside $tmp; the staged names contain no spaces.
if command -v codex >/dev/null 2>&1; then
  out=$( cd "$tmp" && printf '%s' "$(cat prompt.txt)" | codex exec --skip-git-repo-check -i shot*.png 2>/dev/null )
  if valid "$out"; then printf '%s\n' "$out"; exit 0; fi
fi

# Provider 2: Claude Code, tried after any Codex failure. Run from $tmp so no project
# context loads; it reads the staged shots by name through its file tools.
if command -v claude >/dev/null 2>&1; then
  shots=$( cd "$tmp" && ls shot*.png | tr '\n' ' ' )
  out=$( cd "$tmp" && printf '%s\n\nRead these screenshot files in the current directory and judge them: %s\n' "$(cat prompt.txt)" "$shots" | claude -p 2>/dev/null )
  if valid "$out"; then printf '%s\n' "$out"; exit 0; fi
fi

echo "DEGRADED: no blind read (no image-capable CLI produced a valid read; install Codex or Claude Code)"
exit 2
