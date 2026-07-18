#!/bin/sh
# goddesign operator wrapper: Codex builds inside its sandbox, the audit runs outside it,
# and failures feed back into the same Codex session for the bounded fix loop.
# Usage: codex-audit-loop.sh <project-dir> "<design brief>"
# Exit: 0 audit green, 1 residual failures after 3 cycles (or codex error), 2 audit unavailable on this host.
set -u
DIR=${1:?usage: codex-audit-loop.sh <project-dir> "<design brief>"}
BRIEF=${2:?usage: codex-audit-loop.sh <project-dir> "<design brief>"}
SKILL_ROOT=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$DIR"
cd "$DIR"
# codex trusts git repos; resume has no --skip-git-repo-check flag, so make the dir a repo
[ -d .git ] || git init -q

codex exec --skip-git-repo-check -s workspace-write -m gpt-5.6-sol -c model_reasoning_effort="xhigh" \
  -o last-message.txt "\$goddesign $BRIEF" || exit 1

i=1
while [ "$i" -le 3 ]; do
  if node "$SKILL_ROOT/scripts/audit.mjs" index.html > audit-result.json 2> audit-error.log; then
    echo "AUDIT GREEN (cycle $i)"
    exit 0
  else
    CODE=$?
  fi
  if [ "$CODE" -eq 2 ]; then
    echo "AUDIT UNAVAILABLE on this host:"
    cat audit-error.log
    exit 2
  fi
  echo "cycle $i: audit named failures; feeding back into the codex session"
  codex exec resume --last -c sandbox_mode="workspace-write" \
    "External audit of index.html found failures. Fix ONLY the failures named in this JSON; the DIRECTION LOCK is frozen (no changes to direction, palette, type families, or structure). Overwrite ./index.html with the corrected build. JSON: $(cat audit-result.json)" || exit 1
  i=$((i + 1))
done

echo "RESIDUAL FAILURES after 3 fix cycles:"
cat audit-result.json
exit 1
