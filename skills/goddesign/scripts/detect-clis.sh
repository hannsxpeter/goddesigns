#!/bin/sh
# Inventory known agent CLIs available on PATH without starting them.
# Presence does not prove authentication, model access, or a specific capability.
# Usage: sh detect-clis.sh
# Exit 0 in all inventory states. Output is tab-separated and stable for wrappers.

set -u

found=0

probe() {
  cli_id=$1
  command_name=$2
  role=$3

  cli_path=$(command -v "$command_name" 2>/dev/null) || return 0
  [ -n "$cli_path" ] || return 0

  printf '%s\t%s\t%s\t%s\n' "$cli_id" "$command_name" "$role" "$cli_path"
  found=$((found + 1))
}

printf 'id\tcommand\trole\tpath\n'
probe "codex" "codex" "agent,image-helper,blind-read"
probe "claude-code" "claude" "agent,blind-read"
probe "cursor-agent" "cursor-agent" "agent"
probe "cursor-editor" "cursor" "editor-launcher"
probe "gemini-cli" "gemini" "agent"
probe "opencode" "opencode" "agent"
probe "aider" "aider" "agent"
probe "goose" "goose" "agent"
probe "github-copilot" "copilot" "agent"
probe "amp" "amp" "agent"
probe "amazon-q" "q" "agent"
probe "kiro-cli" "kiro-cli" "agent"
probe "factory-droid" "droid" "agent"

if [ "$found" -eq 0 ]; then
  printf 'none\t-\tnone\t-\n'
fi

exit 0
