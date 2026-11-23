#!/usr/bin/env node

// Install the goddesign skill into AI coding hosts.
// Copies the skill directory. Only the entry named goddesign is replaced.

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const VERSION = require('../package.json').version;
const SRC = path.join(__dirname, '..', 'skills', 'goddesign');

const HOSTS = {
  claude: { name: 'Claude Code', skills: '.claude/skills' },
  codex: { name: 'Codex', skills: '.agents/skills', legacy: '.codex/skills' },
  cursor: { name: 'Cursor', skills: '.cursor/skills' }
};

const HELP = `goddesign ${VERSION}: draw one direction, lock it, and clear the gate.

Install (no flags installs Claude Code and Codex, into your home directory):
  npx @hxp-tools/goddesign --claude --global
  npx @hxp-tools/goddesign --codex
  npx @hxp-tools/goddesign --cursor
  npx @hxp-tools/goddesign --all
  npx @hxp-tools/goddesign --local          this directory instead of home
  npx @hxp-tools/goddesign --check          verify the package and any install, change nothing
  npx @hxp-tools/goddesign --claude --uninstall

Then ask for the page: /goddesign in Claude Code, $goddesign in Codex.
Docs: https://github.com/hannsxpeter/goddesigns#readme`;

function fail(message) {
  process.stderr.write(`goddesign: ${message}\n`);
  process.exitCode = 2;
}

function parse(argv) {
  const hosts = [];
  const opts = { local: false, check: false, uninstall: false, help: false, version: false };
  for (const token of argv) {
    if (token === '--help' || token === '-h') opts.help = true;
    else if (token === '--version' || token === '-v') opts.version = true;
    else if (token === '--local') opts.local = true;
    else if (token === '--global') opts.local = false;
    else if (token === '--check') opts.check = true;
    else if (token === '--uninstall') opts.uninstall = true;
    else if (token === '--all') hosts.push(...Object.keys(HOSTS));
    else if (token.startsWith('--') && HOSTS[token.slice(2)]) hosts.push(token.slice(2));
    else return { error: `unknown argument ${token}` };
  }
  return { opts, hosts: [...new Set(hosts)] };
}

function baseDir(local) {
  return local ? process.cwd() : os.homedir();
}

function skillDirs(key, base) {
  const host = HOSTS[key];
  const dirs = [path.join(base, host.skills)];
  if (host.legacy) {
    const legacy = path.join(base, host.legacy);
    if (fs.existsSync(legacy)) dirs.push(legacy);
  }
  return dirs;
}

function verify(dir) {
  const script = path.join(dir, 'scripts', 'verify-install.sh');
  const result = spawnSync('sh', [script], { encoding: 'utf8' });
  return { ok: result.status === 0, out: `${result.stdout || ''}${result.stderr || ''}` };
}

function installInto(dir) {
  const dest = path.join(dir, 'goddesign');
  fs.mkdirSync(dir, { recursive: true });
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(SRC, dest, { recursive: true });
  return dest;
}

function main() {
  const parsed = parse(process.argv.slice(2));
  if (parsed.error) {
    fail(parsed.error);
    return;
  }
  const { opts } = parsed;
  if (opts.help) {
    process.stdout.write(`${HELP}\n`);
    return;
  }
  if (opts.version) {
    process.stdout.write(`${VERSION}\n`);
    return;
  }
  if (!fs.existsSync(path.join(SRC, 'SKILL.md'))) {
    fail(`skill source missing at ${SRC}`);
    return;
  }

  const hosts = parsed.hosts.length ? parsed.hosts : ['claude', 'codex'];
  const base = baseDir(opts.local);
  let failed = false;

  if (opts.check) {
    const source = verify(SRC);
    process.stdout.write(source.ok ? `ok   package: ${SRC}\n` : `FAIL package: ${SRC}\n${source.out}`);
    if (!source.ok) failed = true;
  }

  for (const key of hosts) {
    for (const dir of skillDirs(key, base)) {
      const dest = path.join(dir, 'goddesign');
      const label = `${HOSTS[key].name}: ${dest}`;
      if (opts.uninstall) {
        if (fs.existsSync(dest)) {
          fs.rmSync(dest, { recursive: true, force: true });
          process.stdout.write(`removed ${label}\n`);
        } else {
          process.stdout.write(`none ${label}\n`);
        }
        continue;
      }
      if (opts.check) {
        if (!fs.existsSync(dest)) {
          process.stdout.write(`none ${label}\n`);
          continue;
        }
        const result = verify(dest);
        process.stdout.write(result.ok ? `ok   ${label}\n` : `FAIL ${label}\n${result.out}`);
        if (!result.ok) failed = true;
        continue;
      }
      const copied = installInto(dir);
      const result = verify(copied);
      if (result.ok) process.stdout.write(`ok   ${label}\n`);
      else {
        process.stdout.write(`FAIL ${label}\n${result.out}`);
        failed = true;
      }
    }
  }

  if (failed) process.exitCode = 1;
}

main();
