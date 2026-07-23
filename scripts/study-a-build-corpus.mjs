#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const args = {
    briefs: "validation/studies/study-a-2026-07/briefs.json",
    generated: "validation/studies/study-a-2026-07/work/generated",
    human: "validation/studies/study-a-2026-07/work/human",
    out: "validation/studies/study-a-2026-07/corpus.json",
  };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--") || !argv[index + 1]) fail(`invalid argument near "${key}"`);
    args[key.slice(2)] = argv[index + 1];
    index += 1;
  }
  return args;
}

function fromOutput(outputPath, artifactPath) {
  return relative(dirname(outputPath), artifactPath);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const briefsPath = resolve(ROOT, args.briefs);
  const generatedRoot = resolve(ROOT, args.generated);
  const humanRoot = resolve(ROOT, args.human);
  const outputPath = resolve(ROOT, args.out);
  const briefSpec = JSON.parse(await readFile(briefsPath, "utf8"));
  const samples = [];

  for (const brief of briefSpec.briefs) {
    for (const arm of ["goddesign", "baseline"]) {
      const runRoot = resolve(generatedRoot, `${brief.id}-${arm}`);
      let run;
      try {
        run = JSON.parse(await readFile(resolve(runRoot, "run.json"), "utf8"));
      } catch {
        fail(`missing completed run for ${brief.id}/${arm}`);
      }
      if (run.host !== brief.host || run.arm !== arm) {
        fail(`${brief.id}/${arm} run metadata does not match the frozen brief`);
      }
      if (arm === "goddesign" && run.audit?.status !== "green") {
        fail(`${brief.id}/goddesign measured audit is not green`);
      }
      if (
        arm === "baseline"
        && run.execution_workspace !== "neutral-temporary-directory"
      ) {
        fail(`${brief.id}/baseline was not generated in a neutral workspace`);
      }
      samples.push({
        brief_id: brief.id,
        arm,
        host: run.host,
        model: run.model,
        direction: run.direction ?? "",
        audit: run.audit,
        captured_at: run.capture.captured_at,
        html: fromOutput(outputPath, resolve(runRoot, "index.html")),
        png: fromOutput(outputPath, resolve(runRoot, "capture/page.png")),
      });
    }

    const humanRunRoot = resolve(humanRoot, brief.id);
    let capture;
    try {
      capture = JSON.parse(
        await readFile(resolve(humanRunRoot, "capture.json"), "utf8"),
      );
    } catch {
      fail(`missing human capture for ${brief.id}`);
    }
    if (capture.http_status !== 200) {
      fail(`${brief.id} human control returned HTTP ${capture.http_status}`);
    }
    if (/wix\s*adi|durable|framer\s*ai|10web\s*ai/i.test(capture.generator)) {
      fail(`${brief.id} human control reports an AI builder: ${capture.generator}`);
    }
    samples.push({
      brief_id: brief.id,
      arm: "human",
      host: "human",
      model: "",
      direction: "",
      audit: "not-applicable",
      source_url: capture.final_url,
      captured_at: capture.captured_at,
      html: fromOutput(outputPath, resolve(humanRunRoot, "page.html")),
      png: fromOutput(outputPath, resolve(humanRunRoot, "page.png")),
      capture,
    });
  }

  const corpus = {
    study: briefSpec.study,
    frozen_at: briefSpec.frozen_at,
    built_at: new Date().toISOString(),
    capture_viewport: briefSpec.capture_viewport,
    samples,
  };
  await writeFile(outputPath, JSON.stringify(corpus, null, 2) + "\n");
  process.stdout.write(`${JSON.stringify({ output: outputPath, samples: samples.length }, null, 2)}\n`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`study-a-build-corpus: ${error.message}\n`);
    process.exitCode = 1;
  });
}
