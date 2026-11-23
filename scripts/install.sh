#!/bin/sh
# Install goddesign into Claude Code and Codex (and Cursor with --cursor).
# The work lives in bin/goddesign.js so npm and a git clone share one installer.
#
#   sh scripts/install.sh
#   sh scripts/install.sh --check
#   sh scripts/install.sh --cursor --local

repo=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
exec node "$repo/bin/goddesign.js" "$@"
