#!/bin/sh
# Optional adapter for the remove-ai-marks companion skill.
# This script never installs, updates, or silently enables the companion. It only
# locates an existing install and forwards an explicitly requested operation.
# Exit 0: operation completed. Exit 1: companion operation failed.
# Exit 2: usage, Python, or companion capability unavailable.

usage() {
  echo "usage: sh provenance-hygiene.sh <locate|inspect-file|clean-file|inspect-image|clean-image|rewrite-text|audit-dir|audit-site> [arguments...]" >&2
  exit 2
}

has_companion() {
  [ -n "$1" ] &&
    [ -r "$1/SKILL.md" ] &&
    [ -d "$1/scripts" ] &&
    [ -r "$1/scripts/inspect_file.py" ]
}

find_companion() {
  if has_companion "${REMOVE_AI_MARKS_SKILL_DIR:-}"; then
    printf '%s\n' "$REMOVE_AI_MARKS_SKILL_DIR"
    return 0
  fi

  search_dir=$PWD
  while [ "$search_dir" != "/" ]; do
    for candidate in \
      "$search_dir/skills/remove-ai-marks" \
      "$search_dir/.agents/skills/remove-ai-marks" \
      "$search_dir/.codex/skills/remove-ai-marks" \
      "$search_dir/.claude/skills/remove-ai-marks"
    do
      if has_companion "$candidate"; then
        printf '%s\n' "$candidate"
        return 0
      fi
    done
    parent=${search_dir%/*}
    [ -n "$parent" ] || parent=/
    search_dir=$parent
  done

  for candidate in \
    "${HOME:-}/.agents/skills/remove-ai-marks" \
    "${HOME:-}/.codex/skills/remove-ai-marks" \
    "${HOME:-}/.claude/skills/remove-ai-marks"
  do
    if has_companion "$candidate"; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

command_name=${1:-}
[ -n "$command_name" ] || usage
shift

companion=$(find_companion) || {
  echo "OPTIONAL HYGIENE UNAVAILABLE: remove-ai-marks is not installed in a recognized skill directory. The design QA score is unchanged." >&2
  exit 2
}

if [ "$command_name" = "locate" ]; then
  [ "$#" -eq 0 ] || usage
  printf '%s\n' "$companion"
  exit 0
fi

command -v python3 >/dev/null 2>&1 || {
  echo "OPTIONAL HYGIENE UNAVAILABLE: python3 was not found. The design QA score is unchanged." >&2
  exit 2
}

case "$command_name" in
  inspect-file) tool=inspect_file.py ;;
  clean-file) tool=clean_file.py ;;
  inspect-image) tool=inspect_image.py ;;
  clean-image) tool=clean_image.py ;;
  rewrite-text) tool=rewrite_text.py ;;
  audit-dir) tool=audit_dir.py ;;
  audit-site) tool=audit_website.py ;;
  *) usage ;;
esac

if [ ! -r "$companion/scripts/$tool" ]; then
  echo "OPTIONAL HYGIENE UNAVAILABLE: the installed remove-ai-marks skill does not provide scripts/$tool. The design QA score is unchanged." >&2
  exit 2
fi

exec python3 "$companion/scripts/$tool" "$@"
