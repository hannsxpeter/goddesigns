#!/usr/bin/env node
// goddesign design-map validator.
// A map is the only artifact that survives between sessions of a multi-surface
// effort. A map the next session cannot parse is worse than no map: it looks
// authoritative and is not. This checks the contract in references/map.md.
// Run: node verify-map.mjs [path]   (default: ./.design-map.md)
// Exit 0 green, 1 named failures, 2 no map at that path. Zero dependencies.

import { existsSync, readFileSync } from "node:fs";

const path = process.argv[2] || ".design-map.md";

if (!existsSync(path)) {
  console.log(`no map: ${path} not found`);
  process.exit(2);
}

const text = readFileSync(path, "utf8");
if (!text.trim()) {
  console.log(`no map: ${path} is empty`);
  process.exit(2);
}

const fail = [];
const note = [];
let okCount = 0;
const check = (name, cond, detail = "") => {
  if (cond) okCount += 1;
  else fail.push(detail ? `${name}: ${detail}` : name);
};

// The eight required H2 sections, in required order. references/map.md counts
// these plus the H1 title as the nine required headings.
const ORDER = [
  "Destination",
  "System lock",
  "Notes",
  "Surfaces locked",
  "Surfaces to design",
  "Not yet specified",
  "Out of scope",
  "Open questions",
];

const lines = text.split("\n");

check("has an H1 title of the form '# Design map: <product>'",
  /^# Design map: \S/m.test(text));

// Split into sections keyed by heading, preserving the order they appear in.
const seen = [];
const body = {};
let current = null;
for (const line of lines) {
  const m = /^## (.+?)\s*$/.exec(line);
  if (m) {
    current = m[1];
    seen.push(current);
    body[current] = [];
  } else if (current) {
    body[current].push(line);
  }
}

for (const h of ORDER) check(`section "${h}" is present`, seen.includes(h));

const presentInOrder = seen.filter((h) => ORDER.includes(h));
check("sections appear in the required order",
  JSON.stringify(presentInOrder) === JSON.stringify(ORDER.filter((h) => seen.includes(h))),
  `found ${presentInOrder.join(" / ")}`);

// A section is empty when its body is exactly "none"; bullet rules then skip.
const sectionText = (h) => (body[h] || []).join("\n").trim();
const isNone = (h) => sectionText(h).toLowerCase() === "none";
const bullets = (h) =>
  (body[h] || []).map((l) => l.trim()).filter((l) => l.startsWith("- "));

for (const h of ORDER) {
  if (!seen.includes(h)) continue;
  check(`section "${h}" is not blank (write "none" when empty)`,
    sectionText(h).length > 0);
}

// System lock: every field a surface session inherits verbatim must be a value,
// never an adjective. A missing field here is a decision the surface session
// would have to invent, which is the exact failure the map exists to prevent.
if (seen.includes("System lock")) {
  const lock = sectionText("System lock");
  for (const field of ["Seed:", "Tokens:", "Jitter:", "Type:", "Import:", "Motion:", "Atmosphere:"])
    check(`System lock has a "${field}" line`, lock.includes(field));

  const tokenLine = lock.split("\n").find((l) => l.trim().startsWith("Tokens:")) || "";
  for (const t of ["--bg", "--surface", "--text", "--muted", "--accent"])
    check(`System lock Tokens names ${t}`, tokenLine.includes(t));
  const hexes = tokenLine.match(/#[0-9a-fA-F]{6}\b/g) || [];
  check("System lock Tokens carries 5 six-digit hex values",
    hexes.length >= 5, `found ${hexes.length}`);

  const jitter = lock.split("\n").find((l) => l.trim().startsWith("Jitter:")) || "";
  check("System lock Jitter states h, L, and r",
    /h\s*[+-]?\d/.test(jitter) && /L\s*[+-]?[\d.]/.test(jitter) && /r\s*[+-]?\d/.test(jitter),
    jitter.trim() || "line not found");
}

// Surface names, collected per section, so one surface cannot sit in two states.
const named = [];
const register = (name, section) => named.push({ key: name.trim().toLowerCase(), name: name.trim(), section });

// Locked surfaces are links: the map gists and points, it never restates.
if (seen.includes("Surfaces locked") && !isNone("Surfaces locked")) {
  bullets("Surfaces locked").forEach((b, i) => {
    const m = /^- \[([^\]]+)\]\(([^)]+)\)\s+-\s+(\S.*)$/.exec(b);
    check(`locked surface ${i + 1} is "- [name](path) - gist"`, !!m, b.slice(0, 70));
    if (m) register(m[1], "Surfaces locked");
  });
}

// Queued surfaces carry the sharpness test's two answers plus a claim slot.
if (seen.includes("Surfaces to design") && !isNone("Surfaces to design")) {
  bullets("Surfaces to design").forEach((b, i) => {
    const m = /^- (.+?)\s+-\s+one action:\s*(\S.*?)\s*\|\s*audience:\s*(\S.*?)\s*\|\s*claimed:\s*(\S.*)$/.exec(b);
    check(`queued surface ${i + 1} states name, one action, audience, and claimed`,
      !!m, b.slice(0, 70));
    if (!m) return;
    register(m[1], "Surfaces to design");
    check(`queued surface "${m[1].trim()}" has a valid claim`,
      /^no$/i.test(m[4].trim()) || /^\d{4}-\d{2}-\d{2}\s+\S/.test(m[4].trim()),
      `claimed: ${m[4].trim()} (expected "no" or "YYYY-MM-DD <host>")`);
  });
}

// Out of scope carries a reason. A bare name is a deletion, not a scoping act.
if (seen.includes("Out of scope") && !isNone("Out of scope")) {
  bullets("Out of scope").forEach((b, i) => {
    const m = /^- (.+?)\s+-\s+(\S.*)$/.exec(b);
    check(`out-of-scope entry ${i + 1} is "- name - reason"`, !!m, b.slice(0, 70));
    if (m) register(m[1].replace(/^\[([^\]]+)\].*$/, "$1"), "Out of scope");
  });
}

// Open questions are the human-only facts. Each records when it was parked so a
// question cannot sit unanswered and undated behind a shipped placeholder.
if (seen.includes("Open questions") && !isNone("Open questions")) {
  bullets("Open questions").forEach((b, i) => {
    check(`open question ${i + 1} records "parked <YYYY-MM-DD>"`,
      /parked\s+\d{4}-\d{2}-\d{2}/.test(b), b.slice(0, 70));
  });
}

// One surface, one state.
const byKey = {};
for (const s of named) (byKey[s.key] = byKey[s.key] || []).push(s.section);
for (const [key, sections] of Object.entries(byKey)) {
  const unique = [...new Set(sections)];
  check(`surface "${key}" appears in exactly one section`,
    unique.length === 1 && sections.length === 1,
    sections.join(" and "));
}

// Completion note: not a failure, a reminder that the ledger entry is owed.
if (seen.includes("Surfaces to design") && seen.includes("Not yet specified")) {
  const done = isNone("Surfaces to design") && isNone("Not yet specified")
    && seen.includes("Surfaces locked") && !isNone("Surfaces locked");
  if (done)
    note.push("map complete: every surface is locked and no fog remains. Write the single .design-log.json entry for this map now (references/map.md, 'What changes under a map').");
}

console.log(`verify-map: ${okCount} checks green on ${path}`);
for (const n of note) console.log(`note: ${n}`);
if (fail.length) {
  console.log("FAILURES:");
  for (const f of fail) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("verify-map: map is valid");
process.exit(0);
