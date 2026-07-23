#!/bin/sh
# Compatibility entry point for the executable Study A packer.
# Usage: sh validation/tools/blind-eval-pack.sh <outdir> <corpus.json>

if [ "$#" -ne 2 ]; then
  echo "usage: sh validation/tools/blind-eval-pack.sh <outdir> <corpus.json>" >&2
  exit 1
fi

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_root=$(CDPATH= cd -- "$script_dir/../.." && pwd)

exec node "$repo_root/scripts/study-a-pack.mjs" --spec "$2" --out "$1"
