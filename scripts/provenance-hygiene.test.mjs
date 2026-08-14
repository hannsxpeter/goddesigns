// Tests for the optional remove-ai-marks adapter.
// Run: node --test scripts/provenance-hygiene.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const WRAPPER = join(process.cwd(), 'skills/goddesign/scripts/provenance-hygiene.sh');
const TOOLS = [
  'inspect_file.py',
  'clean_file.py',
  'inspect_image.py',
  'clean_image.py',
  'rewrite_text.py',
  'audit_dir.py',
  'audit_website.py',
];

const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), 'goddesign-provenance-'));
  const companion = join(root, 'remove-ai-marks');
  const scripts = join(companion, 'scripts');
  const bin = join(root, 'bin');
  const home = join(root, 'home');
  mkdirSync(scripts, { recursive: true });
  mkdirSync(bin, { recursive: true });
  mkdirSync(home, { recursive: true });
  writeFileSync(join(companion, 'SKILL.md'), '---\nname: remove-ai-marks\ndescription: test fixture\n---\n');
  for (const tool of TOOLS)
    writeFileSync(join(scripts, tool), '# fixture\n');
  const python = join(bin, 'python3');
  writeFileSync(python, '#!/bin/sh\nprintf "tool=%s\\n" "$1"\nshift\nprintf "arg=%s\\n" "$@"\n');
  chmodSync(python, 0o755);
  return { root, companion, bin, home };
};

const run = (args, options = {}) => {
  const env = {
    ...process.env,
    HOME: options.home,
    PATH: options.path,
  };
  if (options.companion)
    env.REMOVE_AI_MARKS_SKILL_DIR = options.companion;
  else
    delete env.REMOVE_AI_MARKS_SKILL_DIR;
  return spawnSync('/bin/sh', [WRAPPER, ...args], {
    cwd: options.cwd,
    env,
    encoding: 'utf8',
  });
};

test('locate honors the explicit companion directory', () => {
  const f = fixture();
  const result = run(['locate'], {
    companion: f.companion,
    cwd: f.root,
    home: f.home,
    path: f.bin,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), f.companion);
  rmSync(f.root, { recursive: true, force: true });
});

test('dispatch preserves the selected tool and arguments', () => {
  const f = fixture();
  const input = join(f.root, 'hero image.png');
  const output = join(f.root, 'hero cleaned.png');
  const result = run(['clean-file', input, '-o', output, '--json'], {
    companion: f.companion,
    cwd: f.root,
    home: f.home,
    path: f.bin,
  });
  assert.equal(result.status, 0, result.stderr);
  const lines = result.stdout.trim().split('\n');
  assert.equal(lines[0], `tool=${join(f.companion, 'scripts/clean_file.py')}`);
  assert.deepEqual(lines.slice(1), [
    `arg=${input}`,
    'arg=-o',
    `arg=${output}`,
    'arg=--json',
  ]);
  rmSync(f.root, { recursive: true, force: true });
});

test('project-local discovery walks up from a nested working directory', () => {
  const f = fixture();
  const local = join(f.root, '.agents/skills/remove-ai-marks');
  const nested = join(f.root, 'project/src');
  mkdirSync(join(local, 'scripts'), { recursive: true });
  mkdirSync(nested, { recursive: true });
  writeFileSync(join(local, 'SKILL.md'), '---\nname: remove-ai-marks\ndescription: local fixture\n---\n');
  writeFileSync(join(local, 'scripts/inspect_file.py'), '# fixture\n');
  const result = run(['locate'], {
    cwd: nested,
    home: f.home,
    path: f.bin,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), realpathSync(local));
  rmSync(f.root, { recursive: true, force: true });
});

test('an absent companion exits 2 without degrading design QA', () => {
  const f = fixture();
  const empty = join(f.root, 'empty');
  mkdirSync(empty);
  const result = run(['inspect-file', 'index.html'], {
    cwd: empty,
    home: f.home,
    path: f.bin,
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /OPTIONAL HYGIENE UNAVAILABLE/);
  assert.match(result.stderr, /design QA score is unchanged/);
  rmSync(f.root, { recursive: true, force: true });
});

test('unknown operations fail before invoking a companion tool', () => {
  const f = fixture();
  const result = run(['erase-everything'], {
    companion: f.companion,
    cwd: f.root,
    home: f.home,
    path: f.bin,
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /^usage:/);
  assert.equal(result.stdout, '');
  rmSync(f.root, { recursive: true, force: true });
});
