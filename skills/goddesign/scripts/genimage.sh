#!/bin/sh
# goddesign image generation: delegates to whichever installed CLI can make pixels,
# so hosts without native image generation (Claude Code, most CLIs) can still ship imagery.
# Usage: genimage.sh "<art-directed prompt>" <output.png>
# Exit: 0 image written, 2 no capable tool or generation failed (fall back to the row's CSS/SVG art direction).
set -u
PROMPT=${1:?usage: genimage.sh "<prompt>" <output.png>}
OUT=${2:?usage: genimage.sh "<prompt>" <output.png>}
OUTDIR=$(cd "$(dirname "$OUT")" && pwd)
OUTNAME=$(basename "$OUT")

# Rung 1: OpenAI Codex CLI (built-in image generation tool)
if command -v codex >/dev/null 2>&1; then
  ( cd "$OUTDIR" && codex exec --skip-git-repo-check -s workspace-write -c model_reasoning_effort="low" \
      "Generate an image using your built-in image generation tool: $PROMPT Save it as $OUTNAME in the current directory." ) >/dev/null 2>&1
  if [ -s "$OUTDIR/$OUTNAME" ]; then
    echo "generated via codex: $OUTDIR/$OUTNAME"
    exit 0
  fi
fi

# Extension point: add rungs for other image-capable CLIs here (gemini, grok, kimi, cursor-agent)
# following the same contract: write $OUTDIR/$OUTNAME, non-empty file = success.

echo "IMAGE GENERATION UNAVAILABLE: no capable CLI produced $OUTNAME. Fall back to the direction row's CSS/SVG art direction." >&2
exit 2
