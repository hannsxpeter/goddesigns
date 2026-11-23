# Goddesign 3.0.0

3.0.0 is the product release. The skill is the same quest: draw one direction,
lock it, clear the gate. What changed is how you get it, and what the
repository is for.

## Install

```bash
npx @hxp-tools/goddesign --claude --global
```

The package is published by the hxp-tools org. The command is `goddesign`.

## What changed

- npm package `@hxp-tools/goddesign`, with the same installer a git clone runs.
- The README is the quest: press start, the map, one brief drawn seven ways.
- Graphics use the Godpowers board: ink field, mint stages, coral boss gate.
- The research archive (studies, protocols, run writeups) left the tree. The
  calibration pages the source scan is tested against moved to `test/corpus/`.
  Older notes remain in git history before this tag.

## Upgrade

Re-run the installer. A previous symlink is replaced by a copy of this version.
