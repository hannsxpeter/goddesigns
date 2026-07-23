#!/usr/bin/env node

import { spawn } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { constants } from "node:fs";
import { basename, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const AUDIT = join(ROOT, "skills/goddesign/scripts/audit.mjs");
const CAPTURE = join(ROOT, "scripts/study-a-capture.mjs");
const DIRECTION_ROWS = [
  "Swiss International",
  "Industrial",
  "Brutalist Raw",
  "Terminal Core",
  "Retro-Futuristic",
  "Organic Modern",
  "Lo-Fi Riso",
  "Editorial Magazine",
  "Data-Dense Pro",
  "Cinematic Dark",
  "Playful Pop",
  "Luxury Serif",
  "Neo-Grotesque Poster",
  "Art Deco Geometric",
  "Neobrutalist Web",
  "Soft Craft",
  "Trade Counter",
];

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const args = {
    briefs: "validation/studies/study-a-2026-07/briefs.json",
    out: "validation/studies/study-a-2026-07/work/generated",
    arms: "goddesign,baseline",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--") || !argv[i + 1]) fail(`invalid argument near "${key}"`);
    args[key.slice(2)] = argv[i + 1];
    i += 1;
  }
  return args;
}

async function runCommand(command, commandArgs, options = {}) {
  return new Promise((done, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: options.cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (options.live) process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      if (options.live) process.stderr.write(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => done({ code, stdout, stderr }));
  });
}

function generatedPrompt(brief, arm) {
  const scope = [
    "Work only in the current directory.",
    "Create a complete single-file index.html, not a scaffold.",
    "Do not create frameworks, package files, or unrelated documentation.",
    "Do not use subagents.",
    "Do not use em dash or en dash characters, and do not use emojis.",
  ].join(" ");
  if (arm === "baseline") {
    return [
      "For this request, explicitly skip every installed frontend design skill and use only your native design judgment.",
      "Do not load or refer to any design-skill file, tell catalog, evaluation protocol, or prior output.",
      scope,
      brief.brief,
    ].join("\n\n");
  }
  const invocation = brief.host === "claude" ? "/goddesign" : "$goddesign";
  return [
    `${invocation} ${brief.brief}`,
    scope,
    "Follow the installed goddesign skill completely, including its DIRECTION LOCK, boolean gate, measured audit, blind read attempt, CSS stamp, and ledger persistence.",
    "Also write run-report.md containing the full DIRECTION LOCK, cited Phase 1 scores, Phase 2 pass count, Phase 3 audit status, blind-read status, and any fix cycles.",
    "This corpus requires a direction row not used by another Study A run. Read study-directions-used.txt in the current directory when it exists, and advance the seeded direction until it is not listed. Do not reuse a listed direction.",
  ].join("\n\n");
}

function localAgentRule(arm) {
  if (arm === "baseline") {
    return [
      "# Controlled baseline",
      "",
      "For this directory only, the user explicitly requires native frontend design without any installed design skill.",
      "Do not load or invoke goddesign or another frontend design skill.",
      "Write only the requested index.html inside this directory.",
      "",
    ].join("\n");
  }
  return [
    "# Controlled skill run",
    "",
    "Use the installed goddesign skill completely for the requested frontend.",
    "Write only run artifacts inside this directory.",
    "",
  ].join("\n");
}

function hostCommand(brief, arm, prompt, runDir) {
  if (brief.host === "codex") {
    return {
      command: "codex",
      args: [
        "exec",
        "--ephemeral",
        "--skip-git-repo-check",
        "-s",
        "danger-full-access",
        "-m",
        briefModel(brief),
        "-c",
        'model_reasoning_effort="xhigh"',
        "-o",
        join(runDir, "last-message.txt"),
        prompt,
      ],
    };
  }
  const args = [
    "-p",
    "--model",
    briefModel(brief),
    "--effort",
    "xhigh",
    "--permission-mode",
    "bypassPermissions",
    "--no-session-persistence",
  ];
  if (arm === "baseline") args.push("--safe-mode", "--disable-slash-commands");
  args.push(prompt);
  return { command: "claude", args };
}

function briefModel(brief) {
  return brief.host === "codex" ? "gpt-5.6-sol" : "claude-fable-5";
}

async function audit(runDir) {
  for (let cycle = 1; cycle <= 3; cycle += 1) {
    const result = await runCommand("node", [AUDIT, "index.html"], { cwd: runDir });
    await Promise.all([
      writeFile(join(runDir, `audit-cycle-${cycle}.json`), result.stdout),
      writeFile(join(runDir, `audit-cycle-${cycle}.err`), result.stderr),
    ]);
    if (result.code === 0) return { status: "green", cycles: cycle };
    if (result.code === 2) return { status: "unavailable", cycles: cycle };
    const briefId = basename(runDir).slice(0, 3);
    const briefSpec = JSON.parse(
      await readFile(join(ROOT, "validation/studies/study-a-2026-07/briefs.json"), "utf8"),
    );
    const brief = briefSpec.briefs.find((item) => item.id === briefId);
    const fixPrompt = [
      "The external measured audit found failures in index.html.",
      "Fix only the failures in the audit JSON below.",
      "Keep the DIRECTION LOCK frozen: do not change direction, palette, type families, structure, signature, or copy scope.",
      "Overwrite index.html with the corrected complete page.",
      "Do not use subagents.",
      result.stdout,
    ].join("\n\n");
    const command = hostCommand(brief, "goddesign", fixPrompt, runDir);
    const fix = await runCommand(command.command, command.args, { cwd: runDir });
    await Promise.all([
      writeFile(join(runDir, `fix-cycle-${cycle}.out`), fix.stdout),
      writeFile(join(runDir, `fix-cycle-${cycle}.err`), fix.stderr),
    ]);
    if (fix.code !== 0) return { status: "fix-failed", cycles: cycle };
  }
  return { status: "residual-failures", cycles: 3 };
}

function extractDirection(html) {
  const stamp = html.match(/goddesign\s*\|[^*]*?direction:\s*([^|*\n]+)/i);
  if (stamp) return canonicalDirection(stamp[1]);
  const lock = html.match(/Direction:\s*(?:\d+\s+)?([^|*\n]+)/i);
  return lock ? canonicalDirection(lock[1]) : "";
}

function canonicalDirection(value) {
  const candidate = value.trim().replace(/^\d+\s+/, "");
  const lower = candidate.toLowerCase();
  return DIRECTION_ROWS.find((row) => (
    lower === row.toLowerCase()
    || lower.startsWith(`${row.toLowerCase()},`)
    || lower.startsWith(`${row.toLowerCase()} (`)
  )) ?? "";
}

async function capture(runDir) {
  const result = await runCommand(
    "node",
    [CAPTURE, "--html", join(runDir, "index.html"), "--out", join(runDir, "capture")],
    { cwd: ROOT },
  );
  await Promise.all([
    writeFile(join(runDir, "capture.out"), result.stdout),
    writeFile(join(runDir, "capture.err"), result.stderr),
  ]);
  if (result.code !== 0) fail(`capture failed in ${runDir}: ${result.stderr.trim()}`);
}

async function runOne(brief, arm, outputRoot) {
  const runDir = join(outputRoot, `${brief.id}-${arm}`);
  await mkdir(runDir, { recursive: true });
  try {
    const existing = JSON.parse(await readFile(join(runDir, "run.json"), "utf8"));
    if (
      existing.brief_id === brief.id &&
      existing.arm === arm &&
      existing.host === brief.host &&
      (arm !== "baseline"
        || existing.execution_workspace === "neutral-temporary-directory") &&
      (arm !== "goddesign" || existing.audit?.status === "green")
    ) {
      return { ...existing, reused: true };
    }
  } catch {}
  const neutralBaseline = arm === "baseline";
  const executionDir = neutralBaseline
    ? await mkdtemp(join(tmpdir(), "website-study-"))
    : runDir;
  let completed = false;
  await writeFile(join(executionDir, "AGENTS.md"), localAgentRule(arm));
  if (neutralBaseline) {
    await writeFile(join(runDir, "AGENTS.md"), localAgentRule(arm));
  }
  if (arm === "goddesign") {
    try {
      const used = await readFile(join(outputRoot, "study-directions-used.txt"), "utf8");
      await writeFile(join(runDir, "study-directions-used.txt"), used);
    } catch {}
  }
  await runCommand("git", ["init", "-q"], { cwd: executionDir });
  const prompt = generatedPrompt(brief, arm);
  await writeFile(join(runDir, "prompt.txt"), `${prompt}\n`);
  const command = hostCommand(brief, arm, prompt, executionDir);
  const startedAt = new Date().toISOString();
  try {
    const result = await runCommand(command.command, command.args, {
      cwd: executionDir,
      live: false,
    });
    await Promise.all([
      writeFile(join(runDir, "host.out"), result.stdout),
      writeFile(join(runDir, "host.err"), result.stderr),
    ]);
    if (result.code !== 0) {
      const diagnostic = [result.stderr.trim(), result.stdout.trim()]
        .filter(Boolean)
        .join("\n")
        .slice(-1000);
      fail(`${brief.id}/${arm} ${brief.host} exited ${result.code}: ${diagnostic}`);
    }
    await access(join(executionDir, "index.html"), constants.R_OK);
    const html = await readFile(join(executionDir, "index.html"), "utf8");
    const hasMethodMarker = /goddesign|design-log|direction\s+lock/i.test(html);
    if (arm === "baseline" && hasMethodMarker) {
      fail(`${brief.id} baseline is contaminated by design-skill markers`);
    }
    if (neutralBaseline) {
      await writeFile(join(runDir, "index.html"), html);
    }
    let auditResult = { status: "not-applicable", cycles: 0 };
    let direction = "";
    if (arm === "goddesign") {
      if (!hasMethodMarker) fail(`${brief.id} goddesign run lacks its required stamp`);
      auditResult = await audit(runDir);
      if (auditResult.status !== "green") {
        fail(`${brief.id} goddesign audit did not reach green: ${auditResult.status}`);
      }
      direction = extractDirection(await readFile(join(runDir, "index.html"), "utf8"));
      if (!direction) fail(`${brief.id} goddesign direction could not be extracted`);
    }
    await capture(runDir);
    const captureRecord = JSON.parse(
      await readFile(join(runDir, "capture", "capture-index.json"), "utf8"),
    )[0];
    const metadata = {
      brief_id: brief.id,
      arm,
      host: brief.host,
      model: briefModel(brief),
      effort: "xhigh",
      execution_workspace: neutralBaseline
        ? "neutral-temporary-directory"
        : "isolated-method-directory",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      host_exit: result.code,
      direction,
      audit: auditResult,
      html: "index.html",
      png: "capture/page.png",
      capture: captureRecord,
    };
    await writeFile(join(runDir, "run.json"), JSON.stringify(metadata, null, 2) + "\n");
    completed = true;
    return metadata;
  } finally {
    if (neutralBaseline && completed) {
      await rm(executionDir, { recursive: true, force: true });
    } else if (neutralBaseline) {
      process.stderr.write(
        `study-a-run-hosts: retained failed neutral workspace ${executionDir}\n`,
      );
    }
  }
}

async function appendDirection(outputRoot, metadata) {
  if (!metadata.direction) return;
  const path = join(outputRoot, "study-directions-used.txt");
  let current = "";
  try {
    current = await readFile(path, "utf8");
  } catch {}
  const directions = current.split("\n").filter(Boolean);
  if (directions.includes(metadata.direction)) {
    if (metadata.reused) return;
    fail(`duplicate Study A direction "${metadata.direction}"`);
  }
  directions.push(metadata.direction);
  await writeFile(path, `${directions.join("\n")}\n`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const spec = JSON.parse(await readFile(resolve(ROOT, args.briefs), "utf8"));
  const selectedIds = new Set((args.ids ?? "").split(",").filter(Boolean));
  const selected = selectedIds.size
    ? spec.briefs.filter((brief) => selectedIds.has(brief.id))
    : spec.briefs;
  if (selectedIds.size && selected.length !== selectedIds.size) {
    fail("one or more requested brief ids do not exist");
  }
  const arms = args.arms.split(",");
  if (arms.some((arm) => !["goddesign", "baseline"].includes(arm))) {
    fail("--arms must contain goddesign, baseline, or both");
  }
  const outputRoot = resolve(ROOT, args.out);
  await mkdir(outputRoot, { recursive: true });
  const results = [];
  for (const brief of selected) {
    const tasks = arms.map((arm) => runOne(brief, arm, outputRoot));
    const pair = await Promise.all(tasks);
    for (const result of pair) {
      if (result.arm === "goddesign") await appendDirection(outputRoot, result);
      results.push(result);
      process.stdout.write(
        `complete ${result.brief_id}/${result.arm}: ${result.direction || "native baseline"}\n`,
      );
    }
  }
  process.stdout.write(`${JSON.stringify({ completed: results.length }, null, 2)}\n`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`study-a-run-hosts: ${error.message}\n`);
    process.exitCode = 1;
  });
}

export {
  canonicalDirection,
  extractDirection,
  generatedPrompt,
  localAgentRule,
};
