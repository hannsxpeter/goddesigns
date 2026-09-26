#!/bin/sh
# goddesign install-integrity check.
# A partial install that silently omits a deck lets the model reconstruct rows from
# memory, which recreates the exact model-authored distribution the skill exists to
# escape. This script fails loud instead. Host-neutral POSIX sh, zero dependencies.
# Usage: sh verify-install.sh
# Run it through the path your host reads (for Claude Code,
# sh ~/.claude/skills/goddesign/scripts/verify-install.sh), not from the clone:
# run from the clone it checks the clone, and a dangling link passes unseen.
# Exit 0: SKILL.md, the required references, and pick.mjs present, decks complete.
# Exit 1: something missing.

# Resolve the skill root as the parent of this script's directory.
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
root=$(CDPATH= cd -- "$script_dir/.." && pwd)

# The skill body, the reference files a design run can be routed to, and the
# picker that reads the decks. These are load-bearing: a missing one must stop
# the run, not be improvised.
required="SKILL.md references/full-lane.md references/directions.md references/layouts.md references/palettes.md references/fonts.md references/motion.md references/copy.md references/imagery.md references/map.md references/checklist.md scripts/pick.mjs"

# Optional gate helpers: the run degrades honestly without them.
optional="scripts/audit.mjs scripts/sweep.mjs scripts/extract-tokens.mjs scripts/codex-audit-loop.sh scripts/genimage.sh scripts/blind-read.sh scripts/verify-map.mjs references/blind-read.md references/genome-sources.md"

# Prompt-only extras do not affect an ordinary design run or its QA score.
prompt_optional="scripts/provenance-hygiene.sh references/provenance-hygiene.md"

missing=0
for f in $required; do
  if [ ! -r "$root/$f" ] || [ ! -s "$root/$f" ]; then
    echo "INCOMPLETE INSTALL: $f not found"
    missing=$((missing + 1))
  fi
done

if [ "$missing" -ne 0 ]; then
  echo "goddesign: $missing required file(s) missing under $root. Do not run: reinstall the full skill directory (see docs/INSTALL.md)."
  exit 1
fi

# Deck integrity: present and non-empty is not the same as complete. A copied
# rather than symlinked install, a half-synced tree, or a stale vendored copy
# passes the loop above while a deck holds fewer rows than SKILL.md's no-node
# fallback rolls, and then that seed lands on a row that does not exist and the
# model improvises it. pick.mjs reads deck sizes directly and runs the same
# check with --check; this is the dependency-free version for hosts with a
# shell. The moduli are grepped out of SKILL.md, never hardcoded, so a deck that
# grows does not have to be remembered here as well.
seedline=$(grep -F 'direction = N %' "$root/SKILL.md" | head -1)
set -- $(printf '%s' "$seedline" | grep -oE '% [0-9]+' | head -4 | grep -oE '[0-9]+')

if [ "$#" -ne 4 ]; then
  echo "INCOMPLETE INSTALL: SKILL.md no-node fallback line not found or unreadable (stale or partial copy: reinstall, see docs/INSTALL.md)"
  exit 1
fi

drift=0
# grep -c prints its count and exits 1 when that count is zero, so the exit
# status is not the answer here and must not be branched on: a gutted deck has
# to read as 0 rows, not as "check skipped".
count_rows() {
  n=$(grep -cE "$2" "$root/references/$1" 2>/dev/null)
  case "$n" in ''|*[!0-9]*) n=0 ;; esac
  printf '%s' "$n"
}
check_deck() {
  found=$(count_rows "$1" "$2")
  if [ "$found" -ne "$3" ]; then
    echo "INCOMPLETE INSTALL: references/$1 has $found rows, SKILL.md's no-node fallback rolls % $3 (stale or partial copy: reinstall, see docs/INSTALL.md)"
    drift=$((drift + 1))
  fi
}
check_deck directions.md '^## [0-9]+\. ' "$1"
check_deck layouts.md '^[0-9]+\. \*\*' "$2"
check_deck palettes.md '^[0-9]+\. \*\*' "$3"
check_deck fonts.md '^\| [0-9]+ \|' "$4"

if [ "$drift" -ne 0 ]; then
  echo "goddesign: $drift deck(s) do not match the seed moduli. Do not run: the seed can select a row that is not there."
  exit 1
fi

# Report optional gaps as notes, not failures.
for f in $optional; do
  [ -r "$root/$f" ] && [ -s "$root/$f" ] || echo "note: optional $f absent (that capability will DEGRADE)"
done

for f in $prompt_optional; do
  [ -r "$root/$f" ] && [ -s "$root/$f" ] || echo "note: optional $f absent (prompt-only capability unavailable; design QA unchanged)"
done

echo "goddesign: install OK ($(printf '%s\n' $required | wc -l | tr -d ' ') required files present under $root)"
exit 0
