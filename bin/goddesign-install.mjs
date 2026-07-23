#!/usr/bin/env node
// Symlink the packaged goddesign skill into the known host skill directories.
// Safe to re-run: existing correct links are left alone, wrong targets are reported,
// nothing is deleted. Host dirs that do not apply to your setup are simply skipped.
import { existsSync, lstatSync, mkdirSync, readlinkSync, symlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(pkgRoot, 'skills', 'goddesign');

if (!existsSync(join(source, 'SKILL.md'))) {
  console.error(`goddesign: cannot find the skill at ${source}. Reinstall the package.`);
  process.exit(1);
}

// name -> skill directory, per docs/INSTALL.md.
const targets = [
  ['Claude Code', join(homedir(), '.claude', 'skills', 'goddesign')],
  ['Codex CLI', join(homedir(), '.agents', 'skills', 'goddesign')],
  ['Codex CLI (legacy)', join(homedir(), '.codex', 'skills', 'goddesign')],
];

let linked = 0;
for (const [host, dest] of targets) {
  try {
    if (existsSync(dest) || isSymlink(dest)) {
      if (isSymlink(dest) && readlinkSync(dest) === source) {
        console.log(`goddesign: ${host} already linked.`);
        continue;
      }
      console.log(`goddesign: ${host} skipped (${dest} already exists; remove it to relink).`);
      continue;
    }
    mkdirSync(dirname(dest), { recursive: true });
    symlinkSync(source, dest, 'dir');
    console.log(`goddesign: linked ${host} -> ${dest}`);
    linked += 1;
  } catch (err) {
    console.log(`goddesign: ${host} skipped (${err.code || err.message}).`);
  }
}

console.log(linked > 0
  ? `goddesign: done. Invoke with /goddesign in Claude Code or $goddesign in Codex.`
  : `goddesign: nothing new linked. See docs/INSTALL.md if a host is missing.`);

function isSymlink(p) {
  try { return lstatSync(p).isSymbolicLink(); } catch { return false; }
}
