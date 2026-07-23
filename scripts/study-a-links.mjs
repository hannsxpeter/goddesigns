#!/usr/bin/env node

import { createHmac, randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const args = { slots: "1-20" };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--") || !argv[index + 1]) fail(`invalid argument near "${key}"`);
    args[key.slice(2)] = argv[index + 1];
    index += 1;
  }
  if (!args.base || !args.out) {
    fail("usage: STUDY_ASSIGNMENT_SECRET=<secret> node scripts/study-a-links.mjs --base <url> --out <new-csv> [--slots 1-40]");
  }
  return args;
}

function slotsFrom(value) {
  const match = value.match(/^(\d+)(?:-(\d+))?$/);
  if (!match) fail("--slots must be one slot or an inclusive range");
  const start = Number(match[1]);
  const end = Number(match[2] ?? match[1]);
  if (start < 1 || end > 40 || start > end) fail("--slots must stay within 1-40");
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const secret = process.env.STUDY_ASSIGNMENT_SECRET;
  if (!secret || secret.length < 32) {
    fail("STUDY_ASSIGNMENT_SECRET must contain at least 32 characters");
  }
  const baseUrl = new URL(args.base);
  if (
    baseUrl.protocol !== "https:" &&
    !(baseUrl.protocol === "http:" && ["localhost", "127.0.0.1"].includes(baseUrl.hostname))
  ) {
    fail("--base must use HTTPS, except for localhost development");
  }
  if (baseUrl.search || baseUrl.hash) fail("--base must not contain a query or fragment");
  const base = baseUrl.toString().replace(/\/$/, "");
  const rows = ["slot,token,url"];
  for (const slot of slotsFrom(args.slots)) {
    const nonce = randomBytes(12).toString("hex");
    const unsigned = `v1.${slot}.${nonce}`;
    const signature = createHmac("sha256", secret).update(unsigned).digest("hex");
    const token = `${unsigned}.${signature}`;
    rows.push([slot, token, `${base}/#token=${token}`].map(csvCell).join(","));
  }
  const output = resolve(args.out);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${rows.join("\n")}\n`, { mode: 0o600, flag: "wx" });
  process.stdout.write(`${JSON.stringify({ output, links: rows.length - 1 }, null, 2)}\n`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`study-a-links: ${error.message}\n`);
    process.exitCode = 1;
  });
}
