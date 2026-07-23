#!/usr/bin/env node

import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  unlink,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--") || !argv[index + 1]) fail(`invalid argument near "${key}"`);
    args[key.slice(2)] = argv[index + 1];
    index += 1;
  }
  if (!args.pack || !args.site) {
    fail("usage: node scripts/study-a-sync-rater.mjs --pack <pack-dir> --site <site-dir>");
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const pack = resolve(args.pack);
  const site = resolve(args.site);
  const sampleIndex = JSON.parse(
    await readFile(join(pack, "sample-index.json"), "utf8"),
  );
  const assignmentPlan = JSON.parse(
    await readFile(join(pack, "assignment-plan.json"), "utf8"),
  );
  if (sampleIndex.samples?.length !== 30) fail("pack does not contain 30 samples");
  if (Object.keys(assignmentPlan.slots ?? {}).length !== 40) {
    fail("pack does not contain 40 assignment slots");
  }

  const targetSamples = join(site, "public", "samples");
  await mkdir(targetSamples, { recursive: true });
  const existing = await readdir(targetSamples);
  const unexpected = existing.filter(
    (name) => name !== ".gitkeep" && !/^sample-[a-f0-9]{16}\.png$/.test(name),
  );
  if (unexpected.length) {
    fail(`refusing to clean sample directory with unexpected files: ${unexpected.join(", ")}`);
  }
  for (const name of existing) {
    if (/^sample-[a-f0-9]{16}\.png$/.test(name)) {
      await unlink(join(targetSamples, name));
    }
  }
  for (const sample of sampleIndex.samples) {
    const source = join(pack, sample.image);
    const target = join(site, "public", sample.image);
    await copyFile(source, target);
  }
  await Promise.all([
    copyFile(join(pack, "sample-index.json"), join(site, "data", "sample-index.json")),
    copyFile(join(pack, "assignment-plan.json"), join(site, "data", "assignment-plan.json")),
  ]);
  process.stdout.write(`${JSON.stringify({ samples: 30, assignments: 40 }, null, 2)}\n`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`study-a-sync-rater: ${error.message}\n`);
    process.exitCode = 1;
  });
}
