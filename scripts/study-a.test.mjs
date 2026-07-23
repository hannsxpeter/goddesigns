import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import {
  INTERNAL_STUDY_ID,
  makeAssignments,
  pack,
  PUBLIC_STUDY_ID,
  sanitizeHtml,
  validateCorpus,
} from "./study-a-pack.mjs";
import { canonicalDirection } from "./study-a-run-hosts.mjs";
import {
  analyzeRows,
  oneSidedSignFlipP,
  parseCsv,
  publicIntegrityFlags,
  publicResponseRows,
  recurringReasonTerms,
  validateAssignmentPlan,
  validateAndSelect,
  validatePublicResponses,
} from "./study-a-analyze.mjs";

const execFileAsync = promisify(execFile);

const briefs = Array.from({ length: 10 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`);
const testDirections = [
  "Swiss International",
  "Industrial",
  "Brutalist Raw",
  "Terminal Core",
  "Retro-Futuristic",
  "Organic Modern",
  "Lo-Fi Riso",
  "Editorial Magazine",
  "Data-Dense Pro",
  "Luxury Serif",
];

function corpus() {
  const samples = [];
  for (const [briefIndex, briefId] of briefs.entries()) {
    const host = briefIndex % 2 ? "claude" : "codex";
    const model = host === "codex" ? "gpt-5.6-sol" : "claude-fable-5";
    samples.push({
      brief_id: briefId,
      arm: "goddesign",
      host,
      model,
      direction: testDirections[briefIndex],
      audit: "green",
      html: `${briefId}-goddesign.html`,
      png: `${briefId}-goddesign.png`,
    });
    samples.push({
      brief_id: briefId,
      arm: "baseline",
      host,
      model,
      html: `${briefId}-baseline.html`,
      png: `${briefId}-baseline.png`,
    });
    samples.push({
      brief_id: briefId,
      arm: "human",
      host: "human",
      html: `${briefId}-human.html`,
      png: `${briefId}-human.png`,
    });
  }
  return { study: INTERNAL_STUDY_ID, samples };
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function rowsToCsv(rows) {
  const headers = Object.keys(rows[0]);
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n") + "\n";
}

function clearResultRows() {
  const rows = [];
  for (let rater = 1; rater <= 20; rater += 1) {
    for (const arm of ["goddesign", "baseline", "human"]) {
      for (let sample = 0; sample < 5; sample += 1) {
        rows.push({
          submission_id: `rater-${rater}`,
          sample_id: `${arm}-${sample}`,
          brief_id: `B${String(sample + 1).padStart(2, "0")}`,
          arm,
          host: arm === "human" ? "human" : "codex",
          model: arm === "human" ? "" : "test-model",
          direction: arm === "goddesign" ? testDirections[sample] : "",
          ai_verdict: arm === "baseline" ? "yes" : "no",
          familiar: "no",
          appeal: "4",
          trust: "4",
          reason: "",
        });
      }
    }
  }
  return rows;
}

test("sanitizer removes method comments without deleting neighboring CSS", () => {
  const source = [
    "<html><head>",
    '<meta name="generator" content="Astro">',
    "<style>:root{color:red}/* goddesign | direction: Test */body{margin:0}</style>",
    "</head><body><!-- design-log entry -->Visible</body></html>",
  ].join("");
  const result = sanitizeHtml(source);
  assert.match(result.html, /:root\{color:red\}body\{margin:0\}/);
  assert.match(result.html, />Visible</);
  assert.doesNotMatch(result.html, /goddesign|design-log|generator/i);
  assert.equal(result.strippedComments, 2);
  assert.equal(result.strippedGeneratorMeta, 1);
});

test("corpus validation enforces ten matched triplets and distinct directions", () => {
  const valid = corpus();
  const result = validateCorpus(valid);
  assert.equal(result.briefs.length, 10);
  valid.samples.find((sample) => sample.brief_id === "B10" && sample.arm === "goddesign").direction = "Swiss International";
  assert.throws(() => validateCorpus(valid), /directions must be distinct/);
});

test("packer produces a blinded public index and sealed arm manifest", async () => {
  const root = await mkdtemp(join(tmpdir(), "study-a-pack-test-"));
  try {
    const source = join(root, "source");
    const output = join(root, "pack");
    await mkdir(source);
    const spec = corpus();
    const png = Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      Buffer.alloc(40),
    ]);
    for (const sample of spec.samples) {
      sample.html = `${sample.brief_id}-${sample.arm}.html`;
      sample.png = `${sample.brief_id}-${sample.arm}.png`;
      await Promise.all([
        writeFile(
          join(source, sample.html),
          `<html><style>body{color:#123}/* goddesign direction lock */</style><body>${sample.brief_id}</body></html>`,
        ),
        writeFile(join(source, sample.png), png),
      ]);
    }
    const specPath = join(source, "corpus.json");
    await writeFile(specPath, JSON.stringify(spec));
    const result = await pack(specPath, output);
    assert.equal(result.samples, 30);
    assert.equal(result.assignments, 40);

    const publicIndex = JSON.parse(
      await readFile(join(output, "sample-index.json"), "utf8"),
    );
    const assignments = JSON.parse(
      await readFile(join(output, "assignment-plan.json"), "utf8"),
    );
    const sealedManifest = await readFile(
      join(output, "sealed", "manifest-sealed.csv"),
      "utf8",
    );
    assert.equal(publicIndex.samples.length, 30);
    assert.equal(Object.keys(assignments.slots).length, 40);
    assert.doesNotMatch(JSON.stringify(publicIndex), /brief_id|goddesign|baseline|human/);
    assert.match(sealedManifest, /brief_id,arm,host,model,direction/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("direction labels canonicalize to actual deck rows", () => {
  assert.equal(canonicalDirection("11 Luxury Serif, remixed"), "Luxury Serif");
  assert.equal(canonicalDirection("Swiss International"), "Swiss International");
  assert.equal(canonicalDirection("Invented Direction"), "");
});

test("each assignment wave is balanced at ten ratings per sample", () => {
  const records = corpus().samples.map((sample, index) => ({
    ...sample,
    id: `sample-${index}`,
  }));
  const plan = makeAssignments(records, briefs, PUBLIC_STUDY_ID);
  assert.equal(Object.keys(plan.slots).length, 40);
  for (const waveStart of [1, 21]) {
    const counts = new Map(records.map((record) => [record.id, 0]));
    for (let slot = waveStart; slot < waveStart + 20; slot += 1) {
      assert.equal(plan.slots[String(slot)].length, 15);
      const selected = plan.slots[String(slot)].map(
        (id) => records.find((record) => record.id === id),
      );
      assert.deepEqual(
        Object.fromEntries(
          ["goddesign", "baseline", "human"].map((arm) => [
            arm,
            selected.filter((record) => record.arm === arm).length,
          ]),
        ),
        { goddesign: 5, baseline: 5, human: 5 },
      );
      for (const briefId of briefs) {
        const generated = selected.filter(
          (record) =>
            record.brief_id === briefId &&
            ["goddesign", "baseline"].includes(record.arm),
        );
        assert.equal(generated.length, 1);
      }
      for (const id of plan.slots[String(slot)]) counts.set(id, counts.get(id) + 1);
    }
    assert.deepEqual([...new Set(counts.values())], [10]);
  }
  assert.doesNotThrow(() =>
    validateAssignmentPlan(
      plan,
      new Map(records.map((record) => [record.id, record])),
    ),
  );

  const malformed = structuredClone(plan);
  malformed.slots["1"][0] = malformed.slots["1"][1];
  assert.throws(
    () =>
      validateAssignmentPlan(
        malformed,
        new Map(records.map((record) => [record.id, record])),
      ),
    /15 unique samples/,
  );
});

test("CSV parser preserves commas and quotes", () => {
  const rows = parseCsv('a,b\n"one, two","say ""yes"""\n');
  assert.deepEqual(rows, [{ a: "one, two", b: 'say "yes"' }]);
});

test("response selection enforces exact assignment positions and valid timing", () => {
  const manifest = corpus().samples.map((sample, index) => ({
    ...sample,
    id: `sample-${index}`,
  }));
  const assignments = makeAssignments(
    manifest,
    briefs,
    PUBLIC_STUDY_ID,
  );
  const responses = [];
  for (let slot = 1; slot <= 20; slot += 1) {
    for (const [index, sampleId] of assignments.slots[String(slot)].entries()) {
      responses.push({
        study: PUBLIC_STUDY_ID,
        slot: String(slot),
        submission_id: `submission-${slot}`,
        eligible: "true",
        consented_at: "2026-07-23T00:00:00.000Z",
        completed_at: "2026-07-23T00:20:00.000Z",
        sample_id: sampleId,
        position: String(index + 1),
        ai_verdict: "no",
        familiar: "no",
        appeal: "4",
        trust: "4",
        reason: "",
        dwell_ms: String(10000 + index * 100),
        created_at: "2026-07-23T00:01:00.000Z",
        updated_at: "2026-07-23T00:01:00.000Z",
      });
    }
  }
  const selected = validateAndSelect(manifest, assignments, responses);
  assert.equal(selected.rows.length, 300);
  assert.deepEqual(selected.flags, []);

  const malformed = responses.map((row) => ({ ...row }));
  malformed[0].position = "2";
  assert.throws(
    () => validateAndSelect(manifest, assignments, malformed),
    /missing complete eligible slots 1/,
  );
});

test("exact paired tests hold for a clear synthetic result", () => {
  const rows = clearResultRows();
  const result = analyzeRows(rows, []);
  assert.equal(result.status, "CORE_CLAIM_HOLDS");
  assert.equal(result.primary.equivalent, true);
  assert.equal(result.primary.below_baseline, true);
  assert.ok(result.primary.baseline_superiority_p < 0.05);
  assert.ok(oneSidedSignFlipP(Array(20).fill(1)) < 0.05);
  assert.equal(oneSidedSignFlipP(Array(20).fill(0)), 1);
  const publication = publicResponseRows([
    {
      study: PUBLIC_STUDY_ID,
      slot: "1",
      submission_id: "private-id",
      consented_at: "2026-07-23T00:00:00Z",
      completed_at: "2026-07-23T00:10:00Z",
      sample_id: "sample-a",
      position: "1",
      ai_verdict: "no",
      familiar: "no",
      appeal: "4",
      trust: "5",
      reason: "clear hierarchy",
      dwell_ms: "12000",
    },
  ]);
  assert.deepEqual(publication, [{
    study: PUBLIC_STUDY_ID,
    rater_id: "R01",
    sample_id: "sample-a",
    position: 1,
    ai_verdict: "no",
    familiar: "no",
    appeal: 4,
    trust: 5,
    reason: "clear hierarchy",
    dwell_ms: 12000,
  }]);
  assert.doesNotMatch(JSON.stringify(publication), /private-id|consented_at|completed_at/);
});

test("frozen bars fail without baseline superiority or human equivalence", () => {
  const noSuperiority = clearResultRows().map((row) => ({
    ...row,
    ai_verdict: "no",
  }));
  const noSuperiorityResult = analyzeRows(noSuperiority);
  assert.equal(noSuperiorityResult.primary.equivalent, true);
  assert.equal(noSuperiorityResult.primary.below_baseline, false);
  assert.equal(noSuperiorityResult.status, "CORE_CLAIM_FAILS");

  const notEquivalent = clearResultRows().map((row) => ({
    ...row,
    ai_verdict: row.arm === "human" ? "no" : "yes",
  }));
  const notEquivalentResult = analyzeRows(notEquivalent);
  assert.equal(notEquivalentResult.primary.equivalent, false);
  assert.equal(notEquivalentResult.status, "CORE_CLAIM_FAILS");
});

test("recalibration terms are deterministic and public flags hide submission ids", () => {
  const rows = [
    {
      arm: "goddesign",
      sample_id: "sample-a",
      ai_verdict: "yes",
      reason: "Generic icons and uniform spacing",
    },
    {
      arm: "goddesign",
      sample_id: "sample-b",
      ai_verdict: "yes",
      reason: "Uniform spacing, generic icons, generic icons",
    },
    {
      arm: "baseline",
      sample_id: "sample-c",
      ai_verdict: "yes",
      reason: "Generic icons and uniform spacing",
    },
  ];
  const terms = recurringReasonTerms(rows);
  assert.deepEqual(
    terms.filter((term) => ["generic icons", "uniform spacing"].includes(term.term)),
    [
      { term: "generic icons", responses: 2, samples: 2 },
      { term: "uniform spacing", responses: 2, samples: 2 },
    ],
  );
  const publicFlags = publicIntegrityFlags([
    {
      submission_id: "private-submission-id",
      slot: 3,
      flag: "possible automation",
    },
  ]);
  assert.deepEqual(publicFlags, [{
    record_id: "F001",
    rater_id: "R03",
    flag: "possible automation",
  }]);
  assert.doesNotMatch(JSON.stringify(publicFlags), /private-submission-id/);
});

test("publication bundle reproduces analysis from de-identified rows", async () => {
  const root = await mkdtemp(join(tmpdir(), "study-a-analysis-test-"));
  try {
    const manifest = corpus().samples.map((sample, index) => ({
      id: `sample-${String(index).padStart(2, "0")}`,
      brief_id: sample.brief_id,
      arm: sample.arm,
      host: sample.host,
      model: sample.model,
      direction: sample.direction ?? "",
    }));
    const manifestById = new Map(manifest.map((sample) => [sample.id, sample]));
    const assignments = makeAssignments(manifest, briefs, PUBLIC_STUDY_ID);
    const responses = [];
    for (let slot = 1; slot <= 20; slot += 1) {
      const shortCompletion = slot === 1;
      for (const [index, sampleId] of assignments.slots[String(slot)].entries()) {
        const sample = manifestById.get(sampleId);
        responses.push({
          study: PUBLIC_STUDY_ID,
          slot: String(slot),
          submission_id: `private-submission-${slot}`,
          eligible: "true",
          consented_at: "2026-07-23T00:00:00.000Z",
          completed_at: shortCompletion
            ? "2026-07-23T00:01:00.000Z"
            : "2026-07-23T00:20:00.000Z",
          sample_id: sampleId,
          position: String(index + 1),
          ai_verdict: sample.arm === "baseline" ? "yes" : "no",
          familiar: "no",
          appeal: "4",
          trust: "4",
          reason: sample.arm === "baseline" ? "Generic spacing" : "",
          dwell_ms: String(shortCompletion ? 500 + index : 10000 + index * 100),
          created_at: "2026-07-23T00:00:10.000Z",
          updated_at: "2026-07-23T00:00:10.000Z",
        });
      }
    }

    const manifestPath = join(root, "manifest.csv");
    const assignmentsPath = join(root, "assignment-plan.json");
    const responsesPath = join(root, "responses-operator.csv");
    const protocolPath = join(root, "protocol.md");
    const briefsPath = join(root, "briefs.json");
    const corpusPath = join(root, "corpus.json");
    const instructionsPath = join(root, "rater-instructions.md");
    await Promise.all([
      writeFile(manifestPath, rowsToCsv(manifest)),
      writeFile(assignmentsPath, JSON.stringify(assignments)),
      writeFile(responsesPath, rowsToCsv(responses)),
      writeFile(protocolPath, "# Frozen protocol\n"),
      writeFile(briefsPath, JSON.stringify({ study: INTERNAL_STUDY_ID, briefs })),
      writeFile(corpusPath, JSON.stringify({ study: INTERNAL_STUDY_ID, samples: manifest })),
      writeFile(instructionsPath, "# Rater instructions\n"),
    ]);

    const analyzePath = fileURLToPath(new URL("./study-a-analyze.mjs", import.meta.url));
    const output = join(root, "result");
    await execFileAsync(process.execPath, [
      analyzePath,
      "--manifest", manifestPath,
      "--assignments", assignmentsPath,
      "--responses", responsesPath,
      "--out", output,
      "--protocol", protocolPath,
      "--briefs", briefsPath,
      "--corpus", corpusPath,
      "--instructions", instructionsPath,
    ]);

    const [
      analysis,
      publicRows,
      publicManifest,
      publicIntegrity,
      operatorIntegrity,
      command,
      packageManifest,
    ] = await Promise.all([
      readFile(join(output, "analysis.json"), "utf8").then(JSON.parse),
      readFile(join(output, "responses-public.csv"), "utf8").then(parseCsv),
      readFile(join(output, "manifest-unsealed.csv"), "utf8").then(parseCsv),
      readFile(join(output, "integrity-public.json"), "utf8").then(JSON.parse),
      readFile(join(output, "sealed", "integrity-operator.json"), "utf8").then(JSON.parse),
      readFile(join(output, "analysis-command.txt"), "utf8"),
      readFile(join(output, "publication-manifest.json"), "utf8").then(JSON.parse),
    ]);
    assert.equal(analysis.status, "CORE_CLAIM_HOLDS");
    assert.doesNotMatch(JSON.stringify(analysis), /private-submission/);
    assert.equal(publicIntegrity.flags.length, 1);
    assert.equal(publicIntegrity.flags[0].record_id, "F001");
    assert.equal(publicIntegrity.flags[0].rater_id, "R01");
    assert.doesNotMatch(JSON.stringify(publicIntegrity), /private-submission/);
    assert.match(JSON.stringify(operatorIntegrity), /private-submission-1/);
    assert.match(command, /responses-public\.csv/);
    assert.doesNotMatch(command, /responses-operator/);
    assert.ok(packageManifest.files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256)));

    const validatedPublic = validatePublicResponses(
      publicManifest,
      assignments,
      publicRows,
    );
    assert.equal(validatedPublic.rows.length, 300);

    const reproduced = join(root, "reproduced");
    await execFileAsync(process.execPath, [
      analyzePath,
      "--manifest", join(output, "manifest-unsealed.csv"),
      "--assignments", join(output, "assignment-plan.json"),
      "--responses", join(output, "responses-public.csv"),
      "--out", reproduced,
      "--protocol", join(output, "protocol.md"),
      "--briefs", join(output, "briefs.json"),
      "--corpus", join(output, "corpus.json"),
      "--instructions", join(output, "rater-instructions.md"),
    ]);
    const reproducedAnalysis = JSON.parse(
      await readFile(join(reproduced, "analysis.json"), "utf8"),
    );
    assert.deepEqual(reproducedAnalysis, analysis);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
