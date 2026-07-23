#!/usr/bin/env node

import {
  copyFile,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ARMS = ["goddesign", "baseline", "human"];
const MARKERS = /goddesign|design-log|direction\s+lock/i;
const INTERNAL_STUDY_ID = "goddesign-study-a-2026-07";
const PUBLIC_STUDY_ID = "website-perception-study-2026-07";
const DIRECTION_ROWS = new Set([
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
]);

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--") || !argv[i + 1]) {
      fail(`invalid argument near "${key}"`);
    }
    args[key.slice(2)] = argv[i + 1];
    i += 1;
  }
  if (!args.spec || !args.out) {
    fail("usage: node scripts/study-a-pack.mjs --spec <corpus.json> --out <directory>");
  }
  return args;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  return [
    keys.map(csvCell).join(","),
    ...rows.map((row) => keys.map((key) => csvCell(row[key])).join(",")),
  ].join("\n") + "\n";
}

function sanitizeHtml(source) {
  let strippedComments = 0;
  let strippedGeneratorMeta = 0;
  let html = source.replace(/<!--[\s\S]*?-->/g, (comment) => {
    if (!MARKERS.test(comment)) return comment;
    strippedComments += 1;
    return "";
  });
  html = html.replace(/\/\*[\s\S]*?\*\//g, (comment) => {
    if (!MARKERS.test(comment)) return comment;
    strippedComments += 1;
    return "";
  });
  html = html.replace(
    /<meta\b(?=[^>]*\bname\s*=\s*["']generator["'])[^>]*>/gi,
    () => {
      strippedGeneratorMeta += 1;
      return "";
    },
  );
  if (MARKERS.test(html)) {
    fail("method-revealing text remains outside removable comments");
  }
  return { html, strippedComments, strippedGeneratorMeta };
}

function pngIsValid(bytes) {
  const magic = [137, 80, 78, 71, 13, 10, 26, 10];
  return bytes.length > 32 && magic.every((value, index) => bytes[index] === value);
}

function seededRng(seedText) {
  let state = Number.parseInt(sha256(seedText).slice(0, 8), 16) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(values, seedText) {
  const result = [...values];
  const random = seededRng(seedText);
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function validateCorpus(spec) {
  if (spec.study !== INTERNAL_STUDY_ID) {
    fail(`unexpected study id "${spec.study}"`);
  }
  if (!Array.isArray(spec.samples) || spec.samples.length !== 30) {
    fail(`corpus must contain exactly 30 samples, found ${spec.samples?.length ?? 0}`);
  }

  const byArm = new Map(ARMS.map((arm) => [arm, []]));
  const byBrief = new Map();
  for (const sample of spec.samples) {
    if (!byArm.has(sample.arm)) fail(`invalid arm "${sample.arm}"`);
    if (!/^B\d{2}$/.test(sample.brief_id)) fail(`invalid brief id "${sample.brief_id}"`);
    if (!sample.html || !sample.png) fail(`${sample.brief_id}/${sample.arm} lacks artifacts`);
    byArm.get(sample.arm).push(sample);
    if (!byBrief.has(sample.brief_id)) byBrief.set(sample.brief_id, []);
    byBrief.get(sample.brief_id).push(sample);
  }

  for (const arm of ARMS) {
    if (byArm.get(arm).length !== 10) {
      fail(`${arm} arm must contain 10 samples, found ${byArm.get(arm).length}`);
    }
  }
  if (byBrief.size !== 10) fail(`corpus must contain 10 briefs, found ${byBrief.size}`);

  for (const [briefId, samples] of byBrief) {
    const arms = [...samples.map((sample) => sample.arm)].sort();
    if (JSON.stringify(arms) !== JSON.stringify([...ARMS].sort())) {
      fail(`${briefId} does not contain one sample from every arm`);
    }
    const skill = samples.find((sample) => sample.arm === "goddesign");
    const baseline = samples.find((sample) => sample.arm === "baseline");
    if (!["codex", "claude"].includes(skill.host) || skill.host !== baseline.host) {
      fail(`${briefId} generated pair does not share a valid host`);
    }
    if (!skill.model || skill.model !== baseline.model) {
      fail(`${briefId} generated pair does not share the same model`);
    }
    if (!DIRECTION_ROWS.has(skill.direction)) {
      fail(`${briefId} goddesign sample lacks a canonical direction row`);
    }
    if (sampleAuditState(skill) !== "green") {
      fail(`${briefId} goddesign sample lacks a green measured audit`);
    }
  }

  const directions = byArm.get("goddesign").map((sample) => sample.direction);
  if (new Set(directions).size !== 10) {
    fail(`goddesign directions must be distinct, found ${new Set(directions).size}`);
  }
  return {
    byArm,
    byBrief,
    briefs: [...byBrief.keys()].sort(),
  };
}

function sampleAuditState(sample) {
  if (sample.audit === "green") return "green";
  if (sample.audit && sample.audit.status === "green") return "green";
  return "missing";
}

function makeAssignments(records, briefs, studyId) {
  const lookup = new Map(records.map((record) => [`${record.brief_id}:${record.arm}`, record]));
  const slots = {};
  for (let wave = 0; wave < 2; wave += 1) {
    for (let localSlot = 0; localSlot < 20; localSlot += 1) {
      const skillBriefs = new Set(
        Array.from({ length: 5 }, (_, index) => briefs[(localSlot + index) % 10]),
      );
      const humanBriefs = new Set(
        briefs.filter((_, index) => index % 2 === localSlot % 2),
      );
      const selected = [];
      for (const briefId of briefs) {
        const generatedArm = skillBriefs.has(briefId) ? "goddesign" : "baseline";
        selected.push(lookup.get(`${briefId}:${generatedArm}`));
        if (humanBriefs.has(briefId)) selected.push(lookup.get(`${briefId}:human`));
      }
      if (selected.some((record) => !record) || selected.length !== 15) {
        fail(`assignment construction failed for wave ${wave + 1}, slot ${localSlot + 1}`);
      }
      const armCounts = Object.fromEntries(ARMS.map((arm) => [
        arm,
        selected.filter((record) => record.arm === arm).length,
      ]));
      if (ARMS.some((arm) => armCounts[arm] !== 5)) {
        fail(`assignment is not arm-balanced: ${JSON.stringify(armCounts)}`);
      }
      const slot = wave * 20 + localSlot + 1;
      slots[String(slot)] = shuffle(
        selected.map((record) => record.id),
        `${studyId}:wave-${wave + 1}:slot-${localSlot + 1}`,
      );
    }
  }

  for (let wave = 0; wave < 2; wave += 1) {
    const counts = new Map(records.map((record) => [record.id, 0]));
    for (let localSlot = 1; localSlot <= 20; localSlot += 1) {
      const slot = String(wave * 20 + localSlot);
      for (const id of slots[slot]) counts.set(id, counts.get(id) + 1);
    }
    const wrong = [...counts].filter(([, count]) => count !== 10);
    if (wrong.length) fail(`wave ${wave + 1} is not sample-balanced`);
  }

  return {
    study: studyId,
    generated_at: new Date().toISOString(),
    slots,
  };
}

async function pack(specPath, outPath) {
  const absoluteSpec = resolve(specPath);
  const absoluteOut = resolve(outPath);
  const spec = JSON.parse(await readFile(absoluteSpec, "utf8"));
  const { briefs } = validateCorpus(spec);

  try {
    await mkdir(absoluteOut, { recursive: false });
  } catch (error) {
    if (error.code === "EEXIST") fail(`output already exists: ${absoluteOut}`);
    throw error;
  }
  await mkdir(join(absoluteOut, "samples"));
  await mkdir(join(absoluteOut, "sealed"));

  const manifest = [];
  const publicRecords = [];
  for (const sample of spec.samples) {
    const htmlPath = resolve(dirname(absoluteSpec), sample.html);
    const pngPath = resolve(dirname(absoluteSpec), sample.png);
    const [htmlSource, pngBytes] = await Promise.all([
      readFile(htmlPath, "utf8"),
      readFile(pngPath),
    ]);
    if (!pngIsValid(pngBytes)) fail(`${sample.brief_id}/${sample.arm} has an invalid PNG`);

    const sanitized = sanitizeHtml(htmlSource);
    const id = `sample-${randomBytes(8).toString("hex")}`;
    const htmlBytes = Buffer.from(sanitized.html);
    const htmlName = `${id}.html`;
    const pngName = `${id}.png`;
    await Promise.all([
      writeFile(join(absoluteOut, "samples", htmlName), htmlBytes),
      copyFile(pngPath, join(absoluteOut, "samples", pngName)),
    ]);
    const record = {
      id,
      brief_id: sample.brief_id,
      arm: sample.arm,
      host: sample.host,
      model: sample.model ?? "",
      direction: sample.direction ?? "",
      source_html: sample.html,
      source_png: sample.png,
      source_url: sample.source_url ?? "",
      captured_at: sample.captured_at ?? "",
      html_sha256: sha256(htmlBytes),
      png_sha256: sha256(pngBytes),
      stripped_method_comments: sanitized.strippedComments,
      stripped_generator_meta: sanitized.strippedGeneratorMeta,
    };
    manifest.push(record);
    publicRecords.push({ id, image: `samples/${pngName}` });
  }

  const assignments = makeAssignments(manifest, briefs, PUBLIC_STUDY_ID);
  await Promise.all([
    writeFile(
      join(absoluteOut, "sample-index.json"),
      JSON.stringify({ study: PUBLIC_STUDY_ID, samples: publicRecords }, null, 2) + "\n",
    ),
    writeFile(
      join(absoluteOut, "assignment-plan.json"),
      JSON.stringify(assignments, null, 2) + "\n",
    ),
    writeFile(join(absoluteOut, "sealed", "manifest-sealed.csv"), toCsv(manifest)),
    writeFile(
      join(absoluteOut, "sealed", "corpus-source.json"),
      JSON.stringify(spec, null, 2) + "\n",
    ),
    writeFile(
      join(absoluteOut, "rater-instructions.md"),
      [
        "# Rater instructions",
        "",
        "You will see fifteen full-page website captures in a random order.",
        "Judge each page from the capture only. There are no right answers.",
        "",
        "For each page, record:",
        "",
        "1. AI-made? yes, no, or unsure.",
        "2. Appeal from 1 to 5.",
        "3. Trust from 1 to 5, meaning you would give this page your email address.",
        "4. Whether you have seen this exact site before.",
        "5. Optionally, the one feature that most influenced your AI-made answer.",
        "",
        "Do not research the page, reverse image search it, or discuss samples with",
        "other raters before finishing. Complete the study in one sitting if possible.",
        "",
      ].join("\n"),
    ),
  ]);

  return {
    output: absoluteOut,
    samples: manifest.length,
    assignments: Object.keys(assignments.slots).length,
    manifest_sha256: sha256(await readFile(join(absoluteOut, "sealed", "manifest-sealed.csv"))),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await pack(args.spec, args.out);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`study-a-pack: ${error.message}\n`);
    process.exitCode = 1;
  });
}

export {
  INTERNAL_STUDY_ID,
  makeAssignments,
  pack,
  PUBLIC_STUDY_ID,
  sanitizeHtml,
  sha256,
  validateCorpus,
};
