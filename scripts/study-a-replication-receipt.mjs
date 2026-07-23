#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const args = {
    generated: "validation/studies/study-a-2026-07/work/generated",
  };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--") || !argv[index + 1]) fail(`invalid argument near "${key}"`);
    args[key.slice(2)] = argv[index + 1];
    index += 1;
  }
  if (!args.host) fail("--host is required");
  if (!args.ids) fail("--ids is required");
  if (!args.out) fail("--out is required");
  return args;
}

async function sha256(path) {
  const bytes = await readFile(path);
  return createHash("sha256").update(bytes).digest("hex");
}

async function readRun(generatedRoot, briefId, arm, expectedHost) {
  const runRoot = resolve(generatedRoot, `${briefId}-${arm}`);
  const runPath = resolve(runRoot, "run.json");
  const run = JSON.parse(await readFile(runPath, "utf8"));
  if (run.brief_id !== briefId || run.arm !== arm || run.host !== expectedHost) {
    fail(`${briefId}/${arm} metadata does not match host ${expectedHost}`);
  }
  if (run.host_exit !== 0) fail(`${briefId}/${arm} host exit is not zero`);
  if (run.capture?.http_status !== 200) fail(`${briefId}/${arm} capture is not HTTP 200`);
  if (
    arm === "baseline"
    && run.execution_workspace !== "neutral-temporary-directory"
  ) {
    fail(`${briefId}/baseline was not generated in a neutral workspace`);
  }
  if (arm === "goddesign" && run.audit?.status !== "green") {
    fail(`${briefId}/goddesign measured audit is not green`);
  }
  return { run, runRoot, runPath };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const generatedRoot = resolve(ROOT, args.generated);
  const outputPath = resolve(ROOT, args.out);
  const ids = args.ids.split(",").map((id) => id.trim()).filter(Boolean);
  if (ids.length !== 5 || new Set(ids).size !== ids.length) {
    fail("--ids must contain five distinct brief ids");
  }

  const runs = [];
  for (const briefId of ids) {
    const skill = await readRun(generatedRoot, briefId, "goddesign", args.host);
    const baseline = await readRun(generatedRoot, briefId, "baseline", args.host);
    if (!skill.run.direction) fail(`${briefId}/goddesign has no canonical direction`);
    if (
      skill.run.model !== baseline.run.model
      || skill.run.effort !== baseline.run.effort
    ) {
      fail(`${briefId} pair does not share model and effort`);
    }

    runs.push({
      brief_id: briefId,
      direction: skill.run.direction,
      goddesign_run_sha256: await sha256(skill.runPath),
      goddesign_source_html_sha256: await sha256(resolve(skill.runRoot, "index.html")),
      goddesign_rendered_html_sha256: await sha256(
        resolve(skill.runRoot, "capture", "page.html"),
      ),
      goddesign_png_sha256: await sha256(resolve(skill.runRoot, "capture", "page.png")),
      baseline_run_sha256: await sha256(baseline.runPath),
      baseline_source_html_sha256: await sha256(resolve(baseline.runRoot, "index.html")),
      baseline_rendered_html_sha256: await sha256(
        resolve(baseline.runRoot, "capture", "page.html"),
      ),
      baseline_png_sha256: await sha256(
        resolve(baseline.runRoot, "capture", "page.png"),
      ),
    });
  }

  const directions = new Set(runs.map((run) => run.direction));
  if (directions.size !== runs.length) fail("replication directions are not distinct");

  const firstRun = await readRun(generatedRoot, ids[0], "goddesign", args.host);
  const receipt = {
    study: "goddesign-study-a-2026-07",
    scope: `frozen ${args.host} half of the Study A matched corpus`,
    status: "complete",
    completed_at: new Date().toISOString(),
    host: args.host,
    model: firstRun.run.model,
    effort: firstRun.run.effort,
    pairs: runs.length,
    skill_audits_green: runs.length,
    distinct_directions: directions.size,
    runs,
  };
  await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({
    output: outputPath,
    pairs: receipt.pairs,
    skill_audits_green: receipt.skill_audits_green,
    distinct_directions: receipt.distinct_directions,
  }, null, 2)}\n`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`study-a-replication-receipt: ${error.message}\n`);
    process.exitCode = 1;
  });
}
