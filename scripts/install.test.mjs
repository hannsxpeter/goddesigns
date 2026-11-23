import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BIN = join(process.cwd(), 'bin', 'goddesign.js');
const run = (args, cwd) => spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: 'utf8' });

test('a local install copies a complete skill and leaves the package source in place', () => {
  const dir = mkdtempSync(join(tmpdir(), 'goddesign-install-'));
  const sentinel = join(dir, 'sentinel');
  mkdirSync(join(dir, '.claude', 'skills'), { recursive: true });
  mkdirSync(sentinel);
  writeFileSync(join(sentinel, 'keep.txt'), 'still here');
  symlinkSync(sentinel, join(dir, '.claude', 'skills', 'goddesign'));

  const installed = run(['--claude', '--local'], dir);
  assert.equal(installed.status, 0, installed.stdout + installed.stderr);
  assert.match(installed.stdout, /ok   Claude Code:/);
  assert.equal(existsSync(join(sentinel, 'keep.txt')), true);
  assert.equal(existsSync(join(dir, '.claude', 'skills', 'goddesign', 'SKILL.md')), true);

  const verified = spawnSync('sh', [join(dir, '.claude', 'skills', 'goddesign', 'scripts', 'verify-install.sh')], { encoding: 'utf8' });
  assert.equal(verified.status, 0, verified.stdout + verified.stderr);

  const removed = run(['--claude', '--local', '--uninstall'], dir);
  assert.equal(removed.status, 0, removed.stdout + removed.stderr);
  assert.equal(existsSync(join(dir, '.claude', 'skills', 'goddesign')), false);
  assert.equal(existsSync(join(process.cwd(), 'skills', 'goddesign', 'SKILL.md')), true);
  rmSync(dir, { recursive: true, force: true });
});

test('--check changes nothing and an unknown flag is rejected', () => {
  const dir = mkdtempSync(join(tmpdir(), 'goddesign-check-'));
  const checked = run(['--check', '--claude', '--local'], dir);
  assert.equal(checked.status, 0, checked.stdout + checked.stderr);
  assert.match(checked.stdout, /ok   package:/);
  assert.match(checked.stdout, /none Claude Code:/);
  assert.equal(existsSync(join(dir, '.claude')), false);

  const bad = run(['--nope'], dir);
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /unknown argument/);
  rmSync(dir, { recursive: true, force: true });
});
