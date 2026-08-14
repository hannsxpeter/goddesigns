#!/bin/sh
# goddesign install-integrity check.
# A partial install that silently omits a deck lets the model reconstruct rows from
# memory, which recreates the exact model-authored distribution the skill exists to
# escape. This script fails loud instead. Host-neutral POSIX sh, zero dependencies.
# Usage: sh verify-install.sh
# Exit 0: all eight required decks + SKILL.md present. Exit 1: something missing.

# Resolve the skill root as the parent of this script's directory.
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
root=$(CDPATH= cd -- "$script_dir/.." && pwd)

# The eight reference decks a design run reads, plus the skill body. These are the
# load-bearing files: a missing one must stop the run, not be improvised.
required="SKILL.md references/directions.md references/layouts.md references/palettes.md references/fonts.md references/motion.md references/imagery.md references/map.md references/checklist.md"

# Optional gate helpers: the run degrades honestly without them.
optional="scripts/audit.mjs scripts/sweep.mjs scripts/extract-tokens.mjs scripts/codex-audit-loop.sh scripts/detect-clis.sh scripts/genimage.sh scripts/blind-read.sh scripts/verify-map.mjs references/blind-read.md references/genome-sources.md"

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
# passes the loop above while a deck holds fewer rows than Step 3b's modulus
# rolls, and then the seed lands on a row that does not exist and the model
# improvises it. That is the failure this script's header exists to stop.
# The moduli are grepped out of SKILL.md, never hardcoded, so a deck that grows
# does not have to be remembered here as well.
seedline=$(grep -F 'direction=$((' "$root/SKILL.md" | head -1)
set -- $(printf '%s' "$seedline" | grep -oE '% [0-9]+' | head -4 | grep -oE '[0-9]+')

if [ "$#" -ne 4 ]; then
  echo "INCOMPLETE INSTALL: SKILL.md Step 3b seed line not found or unreadable (stale or partial copy: reinstall, see docs/INSTALL.md)"
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
    echo "INCOMPLETE INSTALL: references/$1 has $found rows, SKILL.md Step 3b rolls % $3 (stale or partial copy: reinstall, see docs/INSTALL.md)"
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
