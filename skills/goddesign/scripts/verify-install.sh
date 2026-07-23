#!/bin/sh
# goddesign install-integrity check.
# A partial install that silently omits a deck lets the model reconstruct rows from
# memory, which recreates the exact model-authored distribution the skill exists to
# escape. This script fails loud instead. Host-neutral POSIX sh, zero dependencies.
# Usage: sh verify-install.sh
# Exit 0: all seven required decks + SKILL.md present. Exit 1: something missing.

# Resolve the skill root as the parent of this script's directory.
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
root=$(CDPATH= cd -- "$script_dir/.." && pwd)

# The seven reference decks a design run reads, plus the skill body. These are the
# load-bearing files: a missing one must stop the run, not be improvised.
required="SKILL.md references/directions.md references/layouts.md references/palettes.md references/fonts.md references/motion.md references/imagery.md references/checklist.md"

# Optional files: the run degrades honestly without them (audit, imagery, blind read).
optional="scripts/audit.mjs scripts/codex-audit-loop.sh scripts/genimage.sh scripts/blind-read.sh references/blind-read.md references/genome-sources.md"

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

# Report optional gaps as notes, not failures.
for f in $optional; do
  [ -r "$root/$f" ] && [ -s "$root/$f" ] || echo "note: optional $f absent (that capability will DEGRADE)"
done

echo "goddesign: install OK ($(printf '%s\n' $required | wc -l | tr -d ' ') required files present under $root)"
exit 0
