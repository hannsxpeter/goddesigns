#!/usr/bin/env node

import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ARMS = ["goddesign", "baseline", "human"];
const MARGIN = 0.15;
const INTERNAL_STUDY_ID = "goddesign-study-a-2026-07";
const PUBLIC_STUDY_ID = "website-perception-study-2026-07";
const REASON_STOP_WORDS = new Set([
  "a",
  "about",
  "after",
  "ai",
  "all",
  "also",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "but",
  "by",
  "can",
  "could",
  "does",
  "feel",
  "feels",
  "for",
  "from",
  "had",
  "has",
  "have",
  "i",
  "if",
  "in",
  "is",
  "it",
  "its",
  "like",
  "looks",
  "made",
  "me",
  "more",
  "not",
  "of",
  "on",
  "or",
  "page",
  "site",
  "so",
  "that",
  "the",
  "their",
  "there",
  "this",
  "to",
  "too",
  "very",
  "was",
  "website",
  "were",
  "with",
  "would",
]);

function fail(message, code = 1) {
  const error = new Error(message);
  error.exitCode = code;
  throw error;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--") || !argv[i + 1]) fail(`invalid argument near "${key}"`);
    args[key.slice(2)] = argv[i + 1];
    i += 1;
  }
  for (const required of ["manifest", "assignments", "responses", "out"]) {
    if (!args[required]) fail(`missing --${required}`);
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (quoted) fail("unterminated quoted CSV cell");
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows.shift();
  return rows
    .filter((values) => values.some(Boolean))
    .map((values, index) => {
      if (values.length !== headers.length) {
        fail(`CSV row ${index + 2} has ${values.length} cells, expected ${headers.length}`);
      }
      return Object.fromEntries(headers.map((header, cellIndex) => [header, values[cellIndex]]));
    });
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\t\r\n ]*[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n") + "\n";
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value, places = 4) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function seededRng(seedText) {
  let state = Number.parseInt(
    createHash("sha256").update(seedText).digest("hex").slice(0, 8),
    16,
  ) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function percentile(sorted, p) {
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function pairedBootstrapInterval(values, confidence = 0.9, iterations = 100000) {
  const random = seededRng(`study-a-bootstrap:${values.join(",")}`);
  const estimates = [];
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let total = 0;
    for (let draw = 0; draw < values.length; draw += 1) {
      total += values[Math.floor(random() * values.length)];
    }
    estimates.push(total / values.length);
  }
  estimates.sort((a, b) => a - b);
  const tail = (1 - confidence) / 2;
  return [percentile(estimates, tail), percentile(estimates, 1 - tail)];
}

function oneSidedSignFlipP(values) {
  if (!values.length) fail("sign-flip test requires values");
  if (values.length > 24) fail("exact sign-flip test supports at most 24 pairs");
  const observed = mean(values);
  const combinations = 2 ** values.length;
  let atLeast = 0;
  for (let mask = 0; mask < combinations; mask += 1) {
    let sum = 0;
    for (let index = 0; index < values.length; index += 1) {
      sum += (mask & (2 ** index)) === 0 ? values[index] : -values[index];
    }
    if (sum / values.length >= observed - 1e-12) atLeast += 1;
  }
  return atLeast / combinations;
}

function validateAssignmentPlan(assignments, manifestById) {
  if (assignments.study !== PUBLIC_STUDY_ID) {
    fail(`unexpected assignment study id "${assignments.study}"`);
  }
  const slotKeys = Object.keys(assignments.slots ?? {});
  if (
    slotKeys.length !== 40 ||
    slotKeys.some((slot) => !/^(?:[1-9]|[1-3]\d|40)$/.test(slot))
  ) {
    fail("assignment plan must contain exactly slots 1 through 40");
  }

  for (let slot = 1; slot <= 40; slot += 1) {
    const ids = assignments.slots[String(slot)];
    if (!Array.isArray(ids) || ids.length !== 15 || new Set(ids).size !== 15) {
      fail(`assignment slot ${slot} must contain 15 unique samples`);
    }
    const records = ids.map((id) => manifestById.get(id));
    if (records.some((record) => !record)) {
      fail(`assignment slot ${slot} references an unknown sample`);
    }
    for (const arm of ARMS) {
      const count = records.filter((record) => record.arm === arm).length;
      if (count !== 5) {
        fail(`assignment slot ${slot} contains ${count} ${arm} samples`);
      }
    }
    const generated = records.filter((record) => record.arm !== "human");
    const generatedBriefs = new Set(generated.map((record) => record.brief_id));
    if (generated.length !== 10 || generatedBriefs.size !== 10) {
      fail(`assignment slot ${slot} does not contain one generated sample per brief`);
    }
  }

  for (const waveStart of [1, 21]) {
    const counts = new Map([...manifestById.keys()].map((id) => [id, 0]));
    for (let slot = waveStart; slot < waveStart + 20; slot += 1) {
      for (const id of assignments.slots[String(slot)]) {
        counts.set(id, counts.get(id) + 1);
      }
    }
    const imbalanced = [...counts].filter(([, count]) => count !== 10);
    if (imbalanced.length) {
      fail(`assignment wave starting at slot ${waveStart} is not sample-balanced`);
    }
  }
}

function validateAndSelect(manifest, assignments, responses) {
  const manifestById = new Map(manifest.map((row) => [row.id, row]));
  if (manifestById.size !== 30) fail(`manifest must contain 30 unique samples`);
  for (const arm of ARMS) {
    const count = manifest.filter((row) => row.arm === arm).length;
    if (count !== 10) fail(`manifest arm ${arm} has ${count} samples`);
  }
  validateAssignmentPlan(assignments, manifestById);

  const required = [
    "study",
    "slot",
    "submission_id",
    "eligible",
    "consented_at",
    "completed_at",
    "sample_id",
    "position",
    "ai_verdict",
    "familiar",
    "appeal",
    "trust",
    "reason",
    "dwell_ms",
    "created_at",
    "updated_at",
  ];
  for (const [index, row] of responses.entries()) {
    for (const field of required) {
      if (!(field in row)) fail(`response row ${index + 2} lacks ${field}`);
    }
  }

  const groups = new Map();
  for (const row of responses) {
    if (row.study !== assignments.study) continue;
    const key = `${row.slot}:${row.submission_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const candidatesBySlot = new Map();
  const flags = [];
  for (const rows of groups.values()) {
    const first = rows[0];
    const slot = Number(first.slot);
    if (!Number.isInteger(slot) || slot < 1 || slot > 40) {
      flags.push({
        submission_id: first.submission_id,
        slot: null,
        flag: "invalid slot",
      });
      continue;
    }
    if (rows.some((row) => (
      row.study !== first.study ||
      row.slot !== first.slot ||
      row.submission_id !== first.submission_id ||
      row.eligible !== first.eligible ||
      row.consented_at !== first.consented_at ||
      row.completed_at !== first.completed_at
    ))) {
      flags.push({
        submission_id: first.submission_id,
        slot,
        flag: "mixed submission metadata",
      });
      continue;
    }
    if (first.eligible !== "true" || !first.consented_at || !first.completed_at) continue;
    if (rows.length !== 15) {
      flags.push({
        submission_id: first.submission_id,
        slot,
        flag: `expected 15 rows, found ${rows.length}`,
      });
      continue;
    }
    const expected = assignments.slots[String(slot)];
    const ids = rows.map((row) => row.sample_id);
    if (!expected || new Set(ids).size !== 15 || ids.some((id) => !expected.includes(id))) {
      flags.push({
        submission_id: first.submission_id,
        slot,
        flag: "sample assignment mismatch",
      });
      continue;
    }
    let valid = true;
    for (const row of rows) {
      if (!manifestById.has(row.sample_id)) valid = false;
      if (!["yes", "no", "unsure"].includes(row.ai_verdict)) valid = false;
      if (!["yes", "no"].includes(row.familiar)) valid = false;
      if (![1, 2, 3, 4, 5].includes(Number(row.appeal))) valid = false;
      if (![1, 2, 3, 4, 5].includes(Number(row.trust))) valid = false;
      if (!Number.isFinite(Number(row.dwell_ms)) || Number(row.dwell_ms) < 0) valid = false;
      if (!Number.isInteger(Number(row.position)) || Number(row.position) < 1 || Number(row.position) > 15) valid = false;
      if (expected[Number(row.position) - 1] !== row.sample_id) valid = false;
    }
    if (new Set(rows.map((row) => Number(row.position))).size !== 15) valid = false;
    if (!valid) {
      flags.push({
        submission_id: first.submission_id,
        slot,
        flag: "malformed answer",
      });
      continue;
    }
    const consentedAt = Date.parse(first.consented_at);
    const completedAt = Date.parse(first.completed_at);
    const responseTimesValid = rows.every((row) => {
      const createdAt = Date.parse(row.created_at);
      const updatedAt = Date.parse(row.updated_at);
      return (
        Number.isFinite(createdAt) &&
        Number.isFinite(updatedAt) &&
        createdAt >= consentedAt &&
        updatedAt >= createdAt &&
        updatedAt <= completedAt
      );
    });
    const elapsedMs = completedAt - consentedAt;
    const totalDwellMs = rows.reduce((sum, row) => sum + Number(row.dwell_ms), 0);
    if (
      !Number.isFinite(consentedAt) ||
      !Number.isFinite(completedAt) ||
      completedAt < consentedAt ||
      !responseTimesValid ||
      totalDwellMs > elapsedMs + 60000
    ) {
      flags.push({
        submission_id: first.submission_id,
        slot,
        flag: "impossible timestamp or dwell-time sequence",
      });
    }
    const responsePattern = rows.map((row) => [
      row.ai_verdict,
      row.familiar,
      row.appeal,
      row.trust,
      row.reason.trim().toLowerCase(),
    ].join("|"));
    if (
      elapsedMs < 90000 ||
      totalDwellMs < 30000 ||
      (
        new Set(rows.map((row) => Number(row.dwell_ms))).size === 1 &&
        new Set(responsePattern).size === 1
      )
    ) {
      flags.push({
        submission_id: first.submission_id,
        slot,
        flag: "possible automation or implausibly uniform completion",
      });
    }
    if (!candidatesBySlot.has(slot)) candidatesBySlot.set(slot, []);
    candidatesBySlot.get(slot).push(rows);
  }

  const selected = [];
  const missingSlots = [];
  for (let slot = 1; slot <= 20; slot += 1) {
    const candidates = candidatesBySlot.get(slot) ?? [];
    candidates.sort((a, b) => (
      a[0].completed_at.localeCompare(b[0].completed_at)
      || a[0].submission_id.localeCompare(b[0].submission_id)
    ));
    if (!candidates.length) {
      missingSlots.push(slot);
    } else {
      selected.push(...candidates[0]);
      for (const duplicate of candidates.slice(1)) {
        flags.push({
          submission_id: duplicate[0].submission_id,
          slot,
          flag: `complete duplicate for slot ${slot}, excluded from primary`,
        });
      }
    }
  }
  if (missingSlots.length) {
    fail(`study incomplete: missing complete eligible slots ${missingSlots.join(", ")}`, 2);
  }

  return {
    rows: selected.map((row) => ({ ...row, ...manifestById.get(row.sample_id) })),
    flags,
  };
}

function validatePublicResponses(manifest, assignments, responses) {
  const manifestById = new Map(manifest.map((row) => [row.id, row]));
  if (manifest.length !== 30 || manifestById.size !== 30) {
    fail("manifest must contain 30 unique samples");
  }
  validateAssignmentPlan(assignments, manifestById);
  const required = [
    "study",
    "rater_id",
    "sample_id",
    "position",
    "ai_verdict",
    "familiar",
    "appeal",
    "trust",
    "reason",
    "dwell_ms",
  ];
  for (const [index, row] of responses.entries()) {
    for (const field of required) {
      if (!(field in row)) fail(`public response row ${index + 2} lacks ${field}`);
    }
  }
  const byRater = new Map();
  for (const row of responses) {
    if (row.study !== PUBLIC_STUDY_ID) {
      fail(`public response has unexpected study id "${row.study}"`);
    }
    if (!/^R(?:0[1-9]|1\d|20)$/.test(row.rater_id)) {
      fail(`invalid public rater id "${row.rater_id}"`);
    }
    if (!byRater.has(row.rater_id)) byRater.set(row.rater_id, []);
    byRater.get(row.rater_id).push(row);
  }
  if (
    byRater.size !== 20 ||
    Array.from({ length: 20 }, (_, index) => `R${String(index + 1).padStart(2, "0")}`)
      .some((raterId) => !byRater.has(raterId))
  ) {
    fail("public responses must contain exactly raters R01 through R20");
  }

  const selected = [];
  for (let slot = 1; slot <= 20; slot += 1) {
    const raterId = `R${String(slot).padStart(2, "0")}`;
    const rows = byRater.get(raterId);
    const expected = assignments.slots[String(slot)];
    if (rows.length !== 15 || new Set(rows.map((row) => row.sample_id)).size !== 15) {
      fail(`${raterId} must contain 15 unique samples`);
    }
    for (const row of rows) {
      const position = Number(row.position);
      if (
        !Number.isInteger(position) ||
        position < 1 ||
        position > 15 ||
        expected[position - 1] !== row.sample_id ||
        !manifestById.has(row.sample_id) ||
        !["yes", "no", "unsure"].includes(row.ai_verdict) ||
        !["yes", "no"].includes(row.familiar) ||
        ![1, 2, 3, 4, 5].includes(Number(row.appeal)) ||
        ![1, 2, 3, 4, 5].includes(Number(row.trust)) ||
        !Number.isFinite(Number(row.dwell_ms)) ||
        Number(row.dwell_ms) < 0
      ) {
        fail(`${raterId} contains a malformed or mismatched response`);
      }
      selected.push({
        ...row,
        slot: String(slot),
        submission_id: raterId,
        ...manifestById.get(row.sample_id),
      });
    }
  }
  return { rows: selected, flags: [] };
}

function publicIntegrityFlags(flags) {
  return flags.map((entry, index) => ({
    record_id: `F${String(index + 1).padStart(3, "0")}`,
    rater_id: Number.isInteger(entry.slot)
      ? `R${String(entry.slot).padStart(2, "0")}`
      : null,
    flag: entry.flag,
  }));
}

function armRate(rows, arm, sensitivity = false) {
  const armRows = rows.filter((row) => row.arm === arm);
  return mean(armRows.map((row) => (
    row.ai_verdict === "yes" || (sensitivity && row.ai_verdict === "unsure") ? 1 : 0
  )));
}

function recurringReasonTerms(rows) {
  const counts = new Map();
  const citedRows = rows.filter((row) => (
    row.arm === "goddesign" &&
    row.ai_verdict === "yes" &&
    row.reason.trim()
  ));
  for (const row of citedRows) {
    const words = (row.reason.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
      .filter((word) => word.length >= 3 && !REASON_STOP_WORDS.has(word));
    const terms = new Set(words);
    for (let index = 0; index < words.length - 1; index += 1) {
      const left = words[index];
      const right = words[index + 1];
      if (!REASON_STOP_WORDS.has(left) && !REASON_STOP_WORDS.has(right)) {
        terms.add(`${left} ${right}`);
      }
    }
    for (const term of terms) {
      if (!counts.has(term)) {
        counts.set(term, { term, responses: 0, samples: new Set() });
      }
      const record = counts.get(term);
      record.responses += 1;
      record.samples.add(row.sample_id);
    }
  }
  return [...counts.values()]
    .filter((record) => record.responses >= 2)
    .map((record) => ({
      term: record.term,
      responses: record.responses,
      samples: record.samples.size,
    }))
    .sort((left, right) => (
      right.responses - left.responses ||
      right.samples - left.samples ||
      left.term.localeCompare(right.term)
    ))
    .slice(0, 20);
}

function analyzeRows(rows) {
  const submissions = [...new Set(rows.map((row) => row.submission_id))].sort();
  const raterStats = submissions.map((submissionId) => {
    const raterRows = rows.filter((row) => row.submission_id === submissionId);
    const rates = Object.fromEntries(ARMS.map((arm) => [arm, armRate(raterRows, arm)]));
    const sensitivity = Object.fromEntries(
      ARMS.map((arm) => [arm, armRate(raterRows, arm, true)]),
    );
    return {
      submission_id: submissionId,
      rates,
      sensitivity,
    };
  });

  const gdHuman = raterStats.map((rater) => rater.rates.goddesign - rater.rates.human);
  const baseGd = raterStats.map((rater) => rater.rates.baseline - rater.rates.goddesign);
  const gdHumanSensitivity = raterStats.map(
    (rater) => rater.sensitivity.goddesign - rater.sensitivity.human,
  );
  const baseGdSensitivity = raterStats.map(
    (rater) => rater.sensitivity.baseline - rater.sensitivity.goddesign,
  );

  const lowerP = oneSidedSignFlipP(gdHuman.map((difference) => difference + MARGIN));
  const upperP = oneSidedSignFlipP(gdHuman.map((difference) => MARGIN - difference));
  const baselineP = oneSidedSignFlipP(baseGd);
  const equivalent = lowerP < 0.05 && upperP < 0.05;
  const belowBaseline = baselineP < 0.05 && mean(baseGd) > 0;

  const armSummary = {};
  for (const arm of ARMS) {
    const armRows = rows.filter((row) => row.arm === arm);
    armSummary[arm] = {
      ratings: armRows.length,
      ai_yes: armRows.filter((row) => row.ai_verdict === "yes").length,
      ai_unsure: armRows.filter((row) => row.ai_verdict === "unsure").length,
      ai_identification_rate: round(armRate(rows, arm)),
      sensitivity_yes_or_unsure_rate: round(armRate(rows, arm, true)),
      familiarity_rate: round(
        mean(armRows.map((row) => row.familiar === "yes" ? 1 : 0)),
      ),
      appeal_mean: round(mean(armRows.map((row) => Number(row.appeal)))),
      trust_mean: round(mean(armRows.map((row) => Number(row.trust)))),
    };
  }

  const sampleSummary = [...new Set(rows.map((row) => row.sample_id))]
    .map((sampleId) => {
      const sampleRows = rows.filter((row) => row.sample_id === sampleId);
      const reasons = sampleRows
        .map((row) => row.reason.trim())
        .filter(Boolean);
      return {
        sample_id: sampleId,
        brief_id: sampleRows[0].brief_id,
        arm: sampleRows[0].arm,
        host: sampleRows[0].host ?? "",
        model: sampleRows[0].model ?? "",
        direction: sampleRows[0].direction ?? "",
        ratings: sampleRows.length,
        ai_identification_rate: round(
          mean(sampleRows.map((row) => row.ai_verdict === "yes" ? 1 : 0)),
        ),
        sensitivity_yes_or_unsure_rate: round(
          mean(sampleRows.map((row) => (
            row.ai_verdict === "yes" || row.ai_verdict === "unsure" ? 1 : 0
          ))),
        ),
        familiarity_rate: round(
          mean(sampleRows.map((row) => row.familiar === "yes" ? 1 : 0)),
        ),
        appeal_mean: round(mean(sampleRows.map((row) => Number(row.appeal)))),
        trust_mean: round(mean(sampleRows.map((row) => Number(row.trust)))),
        ai_yes_reasons: sampleRows
          .filter((row) => row.ai_verdict === "yes" && row.reason.trim())
          .map((row) => row.reason.trim()),
        reasons,
      };
    })
    .sort((a, b) => (
      b.ai_identification_rate - a.ai_identification_rate
      || a.sample_id.localeCompare(b.sample_id)
    ));

  const sensitivityLowerP = oneSidedSignFlipP(
    gdHumanSensitivity.map((difference) => difference + MARGIN),
  );
  const sensitivityUpperP = oneSidedSignFlipP(
    gdHumanSensitivity.map((difference) => MARGIN - difference),
  );
  const sensitivityBaselineP = oneSidedSignFlipP(baseGdSensitivity);

  return {
    study: INTERNAL_STUDY_ID,
    status: equivalent && belowBaseline ? "CORE_CLAIM_HOLDS" : "CORE_CLAIM_FAILS",
    completed_raters: raterStats.length,
    completed_ratings: rows.length,
    margin: MARGIN,
    arm_summary: armSummary,
    primary: {
      goddesign_minus_human: round(mean(gdHuman)),
      bootstrap_90_ci: pairedBootstrapInterval(gdHuman).map((value) => round(value)),
      equivalence_lower_p: round(lowerP, 6),
      equivalence_upper_p: round(upperP, 6),
      equivalent,
      baseline_minus_goddesign: round(mean(baseGd)),
      baseline_superiority_p: round(baselineP, 6),
      below_baseline: belowBaseline,
    },
    sensitivity_yes_or_unsure: {
      goddesign_minus_human: round(mean(gdHumanSensitivity)),
      equivalence_lower_p: round(sensitivityLowerP, 6),
      equivalence_upper_p: round(sensitivityUpperP, 6),
      equivalent: sensitivityLowerP < 0.05 && sensitivityUpperP < 0.05,
      baseline_minus_goddesign: round(mean(baseGdSensitivity)),
      baseline_superiority_p: round(sensitivityBaselineP, 6),
      below_baseline: sensitivityBaselineP < 0.05 && mean(baseGdSensitivity) > 0,
    },
    credibility_reopened: armSummary.goddesign.trust_mean < armSummary.human.trust_mean,
    sample_summary: sampleSummary,
    recalibration: {
      goddesign_samples: sampleSummary.filter((sample) => sample.arm === "goddesign"),
      recurring_ai_yes_terms: recurringReasonTerms(rows),
      rule: "Terms appear in at least two goddesign AI-yes reasons. Counts are per response, with duplicate terms inside one reason counted once.",
    },
  };
}

function publicResponseRows(rows) {
  return [...rows]
    .sort((left, right) => (
      Number(left.slot) - Number(right.slot)
      || Number(left.position) - Number(right.position)
    ))
    .map((row) => ({
      study: row.study,
      rater_id: `R${String(row.slot).padStart(2, "0")}`,
      sample_id: row.sample_id,
      position: Number(row.position),
      ai_verdict: row.ai_verdict,
      familiar: row.familiar,
      appeal: Number(row.appeal),
      trust: Number(row.trust),
      reason: row.reason,
      dwell_ms: Number(row.dwell_ms),
    }));
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function reportMarkdown(result, integrityFlags = []) {
  const armRows = ARMS.map((arm) => {
    const row = result.arm_summary[arm];
    return `| ${arm} | ${row.ratings} | ${formatPercent(row.ai_identification_rate)} | ${formatPercent(row.familiarity_rate)} | ${row.appeal_mean.toFixed(2)} | ${row.trust_mean.toFixed(2)} |`;
  });
  const topSamples = result.sample_summary.slice(0, 10).map((sample) => (
    `| ${sample.sample_id} | ${sample.brief_id} | ${sample.arm} | ${formatPercent(sample.ai_identification_rate)} | ${formatPercent(sample.familiarity_rate)} | ${sample.appeal_mean.toFixed(2)} | ${sample.trust_mean.toFixed(2)} |`
  ));
  const goddesignSamples = result.recalibration.goddesign_samples.map((sample) => (
    `| ${sample.sample_id} | ${sample.brief_id} | ${sample.direction} | ${formatPercent(sample.ai_identification_rate)} | ${formatPercent(sample.sensitivity_yes_or_unsure_rate)} | ${sample.trust_mean.toFixed(2)} |`
  ));
  const recurringTerms = result.recalibration.recurring_ai_yes_terms.map((term) => (
    `| ${term.term} | ${term.responses} | ${term.samples} |`
  ));
  return [
    "# Study A result",
    "",
    `Verdict: **${result.status}**`,
    "",
    `${result.completed_raters} eligible raters completed ${result.completed_ratings} ratings.`,
    "",
    "## Arm summary",
    "",
    "| Arm | Ratings | AI identification | Familiar | Appeal | Trust |",
    "|---|---:|---:|---:|---:|---:|",
    ...armRows,
    "",
    "## Pre-registered tests",
    "",
    `- Goddesign minus human: ${formatPercent(result.primary.goddesign_minus_human)}.`,
    `- Rater-cluster bootstrap 90% interval: ${formatPercent(result.primary.bootstrap_90_ci[0])} to ${formatPercent(result.primary.bootstrap_90_ci[1])}.`,
    `- Equivalence margin: plus or minus ${formatPercent(result.margin)}.`,
    `- Lower equivalence p: ${result.primary.equivalence_lower_p}.`,
    `- Upper equivalence p: ${result.primary.equivalence_upper_p}.`,
    `- Equivalent: ${result.primary.equivalent ? "yes" : "no"}.`,
    `- Baseline minus goddesign: ${formatPercent(result.primary.baseline_minus_goddesign)}.`,
    `- Baseline superiority p: ${result.primary.baseline_superiority_p}.`,
    `- Goddesign below baseline: ${result.primary.below_baseline ? "yes" : "no"}.`,
    `- Credibility axis reopened: ${result.credibility_reopened ? "yes" : "no"}.`,
    "",
    "## Highest AI-identification samples",
    "",
    "| Sample | Brief | Arm | AI identification | Familiar | Appeal | Trust |",
    "|---|---|---|---:|---:|---:|---:|",
    ...topSamples,
    "",
    "## Recalibration inputs",
    "",
    "Goddesign samples are ordered by positive AI identification. Verbatim cited reasons remain in analysis.json and responses-public.csv.",
    "",
    "| Sample | Brief | Direction | AI identification | Yes or unsure | Trust |",
    "|---|---|---|---:|---:|---:|",
    ...goddesignSamples,
    "",
    "### Recurring terms in goddesign AI-yes reasons",
    "",
    recurringTerms.length
      ? "| Term | Responses | Samples |"
      : "No term recurred in two or more goddesign AI-yes reasons.",
    ...(recurringTerms.length
      ? ["|---|---:|---:|", ...recurringTerms]
      : []),
    "",
    "This lexical recurrence is descriptive and does not affect the frozen tests.",
    "",
    "## Integrity",
    "",
    integrityFlags.length
      ? `${integrityFlags.length} flags are listed in integrity-public.json.`
      : "No integrity flags.",
    "",
    "The de-identified row-level data, unsealed manifest, and this result publish whether the claim holds or fails. The operator export remains sealed because it contains precise timestamps.",
    "",
  ].join("\n");
}

function shellCell(value) {
  const text = String(value);
  return /^[A-Za-z0-9_./-]+$/.test(text)
    ? text
    : `'${text.replaceAll("'", "'\\''")}'`;
}

function publicationPath(path) {
  const absolute = resolve(path);
  const fromRoot = relative(ROOT, absolute);
  return fromRoot && !fromRoot.startsWith("..") ? fromRoot : absolute;
}

async function publicationManifest(out) {
  const names = (await readdir(out))
    .filter((name) => name !== "publication-manifest.json" && name !== "sealed")
    .sort();
  const files = [];
  for (const name of names) {
    const bytes = await readFile(resolve(out, name));
    files.push({
      file: name,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  return {
    study: INTERNAL_STUDY_ID,
    generated_at: new Date().toISOString(),
    files,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [manifestText, assignmentsText, responsesText] = await Promise.all([
    readFile(resolve(args.manifest), "utf8"),
    readFile(resolve(args.assignments), "utf8"),
    readFile(resolve(args.responses), "utf8"),
  ]);
  const manifest = parseCsv(manifestText);
  const assignments = JSON.parse(assignmentsText);
  const responses = parseCsv(responsesText);
  if (!responses.length) fail("responses file is empty");
  const sourceMode = "rater_id" in responses[0] ? "public" : "operator";
  const selected = sourceMode === "public"
    ? validatePublicResponses(manifest, assignments, responses)
    : validateAndSelect(manifest, assignments, responses);
  const integrityFlags = publicIntegrityFlags(selected.flags);
  const result = analyzeRows(selected.rows);
  const out = resolve(args.out);
  await mkdir(dirname(out), { recursive: true });
  try {
    await mkdir(out);
  } catch (error) {
    if (error.code === "EEXIST") fail(`output already exists: ${out}`);
    throw error;
  }
  const sealedOut = resolve(out, "sealed");
  await mkdir(sealedOut, { recursive: true });
  const publicRows = publicResponseRows(selected.rows);
  const commandBase = publicationPath(out);
  const reproductionCommand = [
    "node scripts/study-a-analyze.mjs",
    `  --manifest ${shellCell(`${commandBase}/manifest-unsealed.csv`)}`,
    `  --assignments ${shellCell(`${commandBase}/assignment-plan.json`)}`,
    `  --responses ${shellCell(`${commandBase}/responses-public.csv`)}`,
    `  --out ${shellCell(`${commandBase}/reproduced`)}`,
  ].join(" \\\n");
  const supporting = [
    {
      source: args.protocol ?? resolve(ROOT, "validation/studies/study-a-2026-07/protocol.md"),
      target: "protocol.md",
    },
    {
      source: args.briefs ?? resolve(ROOT, "validation/studies/study-a-2026-07/briefs.json"),
      target: "briefs.json",
    },
    {
      source: args.corpus ?? resolve(ROOT, "validation/studies/study-a-2026-07/corpus.json"),
      target: "corpus.json",
    },
    {
      source: args.instructions ?? resolve(dirname(resolve(args.assignments)), "rater-instructions.md"),
      target: "rater-instructions.md",
    },
  ];
  await Promise.all([
    writeFile(resolve(out, "analysis.json"), JSON.stringify(result, null, 2) + "\n"),
    writeFile(resolve(out, "result.md"), reportMarkdown(result, integrityFlags)),
    writeFile(
      resolve(out, "responses-public.csv"),
      toCsv(publicRows),
      { mode: 0o600 },
    ),
    writeFile(resolve(out, "manifest-unsealed.csv"), manifestText),
    writeFile(
      resolve(out, "assignment-plan.json"),
      JSON.stringify(assignments, null, 2) + "\n",
    ),
    writeFile(
      resolve(out, "integrity-public.json"),
      JSON.stringify({
        study: INTERNAL_STUDY_ID,
        flags: integrityFlags,
      }, null, 2) + "\n",
    ),
    writeFile(resolve(out, "analysis-command.txt"), `${reproductionCommand}\n`),
    writeFile(
      resolve(sealedOut, "integrity-operator.json"),
      JSON.stringify({
        study: INTERNAL_STUDY_ID,
        source_mode: sourceMode,
        flags: sourceMode === "operator" ? selected.flags : [],
      }, null, 2) + "\n",
      { mode: 0o600 },
    ),
    ...supporting.map(({ source, target }) => copyFile(resolve(source), resolve(out, target))),
  ]);
  await writeFile(
    resolve(out, "publication-manifest.json"),
    JSON.stringify(await publicationManifest(out), null, 2) + "\n",
  );
  process.stdout.write(`${JSON.stringify({
    status: result.status,
    completed_raters: result.completed_raters,
    source_mode: sourceMode,
    integrity_flags: integrityFlags.length,
    output: out,
  }, null, 2)}\n`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`study-a-analyze: ${error.message}\n`);
    process.exitCode = error.exitCode ?? 1;
  });
}

export {
  analyzeRows,
  oneSidedSignFlipP,
  pairedBootstrapInterval,
  parseCsv,
  publicIntegrityFlags,
  publicResponseRows,
  recurringReasonTerms,
  validateAssignmentPlan,
  validateAndSelect,
  validatePublicResponses,
};
