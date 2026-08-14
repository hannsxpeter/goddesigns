#!/usr/bin/env node
// goddesign deck lint: mechanical checks that keep the skill internally true.
// Run: node scripts/lint-decks.mjs   Exit 0 green, 1 named failures.
// Zero dependencies; reads files relative to the repo root.

import { existsSync, readFileSync } from "node:fs";

const fail = [];
const ok = [];
const check = (name, cond, detail = "") => {
  if (cond) ok.push(name);
  else fail.push(detail ? `${name}: ${detail}` : name);
};
const read = (p) => readFileSync(p, "utf8");

const skill = read("skills/goddesign/SKILL.md");
const directions = read("skills/goddesign/references/directions.md");
const layouts = read("skills/goddesign/references/layouts.md");
const palettes = read("skills/goddesign/references/palettes.md");
const fonts = read("skills/goddesign/references/fonts.md");

// 1. Deck sizes.
const dirRows = [...directions.matchAll(/^## (\d+)\. /gm)].map((m) => +m[1]);
const layoutRows = [...layouts.matchAll(/^\d+\. \*\*/gm)].length;
const paletteRows = [...palettes.matchAll(/^\d+\. \*\*/gm)].length;
const fontRows = [...fonts.matchAll(/^\| \d+ \|/gm)].length;
check("directions deck has 17 rows", dirRows.length === 17, `found ${dirRows.length}`);
check("directions rows are indexed 0-16 in order",
  dirRows.every((v, i) => v === i), `found ${dirRows.join(",")}`);
check("layouts deck has 12 rows", layoutRows === 12, `found ${layoutRows}`);
check("palettes deck has 10 rows", paletteRows === 10, `found ${paletteRows}`);
check("fonts deck has 12 rows", fontRows === 12, `found ${fontRows}`);

// 2. Seed moduli in SKILL.md match measured deck sizes.
const sizes = [dirRows.length, layoutRows, paletteRows, fontRows];
const seedLine = skill.split("\n").find((l) => l.includes("direction=$(("));
const fbLine = skill.split("\n").find((l) => l.includes("direction = N %"));
const moduliOf = (line) => [...line.matchAll(/% (\d+)/g)].map((m) => +m[1]).slice(0, 4);
for (const [label, line] of [["shell seed", seedLine], ["no-shell fallback", fbLine]]) {
  check(`${label} moduli match deck sizes [${sizes}]`,
    line && JSON.stringify(moduliOf(line)) === JSON.stringify(sizes),
    line ? `found [${moduliOf(line)}]` : "line not found");
}

// 3. Every Banned bullet has an INSTEAD and a [fingerprint]/[craft] tag.
const banned = skill.slice(skill.indexOf("## Banned"), skill.indexOf("## Step 5"));
const bullets = banned.split("\n").filter((l) => l.startsWith("- "));
check("banned list is non-empty", bullets.length >= 10, `found ${bullets.length}`);
bullets.forEach((b, i) => {
  check(`banned bullet ${i + 1} has INSTEAD`, b.includes("INSTEAD"));
  check(`banned bullet ${i + 1} is tagged`, /^- \[(fingerprint|craft)(, (fingerprint|craft))?\]/.test(b),
    b.slice(0, 60));
});

// 4. Every direction row is a complete package.
const chunks = directions.split(/^## \d+\. /gm).slice(1);
const fields = ["- Colors:", "- Type:", "- Import:", "Radius:", "- Background:", "- Signature:", "- Motion:"];
chunks.forEach((c, i) => {
  for (const f of fields)
    check(`direction row ${i} has "${f}"`, c.includes(f));
});

// 5. Genome vantage caps: at most two rows per vantage; two newest must differ.
const vantages = [...directions.matchAll(/Genome: vantage=(\d+)/g)].map((m) => +m[1]);
const counts = {};
vantages.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
check("no vantage has more than two genome rows",
  Object.values(counts).every((n) => n <= 2), JSON.stringify(counts));
check("two newest genome rows do not share a vantage",
  vantages.length < 2 || vantages[vantages.length - 1] !== vantages[vantages.length - 2],
  `vantages in order: ${vantages.join(",")}`);

// 6. Host portability: cross-host work is prompt-specified and never a default penalty.
const checklist = read("skills/goddesign/references/checklist.md");
const verifyInstall = read("skills/goddesign/scripts/verify-install.sh");
check("single-host completion is the default",
  skill.includes("One capable host is the default and is a complete setup"));
check("cross-host work requires prompt opt-in",
  skill.includes("Use multiple hosts only when the user's brief explicitly asks"));
check("missing a second host does not change QA",
  checklist.includes("A missing second host never changes the design score"));

// 6b. Provenance hygiene is a prompt-only delivery companion. It cannot become
// a silent design requirement, mutate evidence, or inherit a stale visual gate.
const provenance = read("skills/goddesign/references/provenance-hygiene.md");
const provenanceAdapter = read("skills/goddesign/scripts/provenance-hygiene.sh");
check("provenance hygiene requires explicit prompt scope",
  skill.includes("Provenance hygiene is prompt-specified too") &&
  provenance.includes("only\nwhen the user's prompt explicitly asks"));
check("ordinary design does not depend on provenance hygiene",
  provenance.includes("A normal goddesign run never invokes it, never depends on it"));
check("missing provenance companion does not change design QA",
  skill.includes("without a `DEGRADED` label or score deduction") &&
  provenanceAdapter.includes("The design QA score is unchanged"));
check("provenance hygiene runs after the design gate",
  skill.includes("never runs before the normal gate passes") &&
  provenance.includes("Run this only after the page has passed the normal goddesign gate"));
check("provenance hygiene never mutates validation evidence",
  provenance.includes("Never clean `validation/`, frozen study inputs, receipts, manifests"));
check("lossy provenance work forces a fresh full gate",
  skill.includes("A statistical rewrite or pixel-regeneration pass changes the artifact and invalidates the old render"));
check("provenance adapter exposes every documented operation",
  ["inspect-file", "clean-file", "inspect-image", "clean-image", "rewrite-text", "audit-dir", "audit-site"]
    .every((operation) => provenanceAdapter.includes(operation)));
check("verify-install.sh lists provenance integration as optional",
  /prompt_optional="[^"]*scripts\/provenance-hygiene\.sh[^"]*references\/provenance-hygiene\.md/.test(verifyInstall));
check("verify-install.sh keeps prompt-only absence out of DEGRADED",
  verifyInstall.includes("prompt-only capability unavailable; design QA unchanged"));
check("provenance evaluation record is retained",
  existsSync("validation/research/watermarks-remover-evaluation-2026-08.md"));

// 7. Design map: the deck, the validator, and the skill wiring stay in sync.
const map = read("skills/goddesign/references/map.md");
const verifyMap = read("skills/goddesign/scripts/verify-map.mjs");

check("verify-install.sh requires references/map.md",
  /required="[^"]*references\/map\.md/.test(verifyInstall));
check("verify-install.sh lists verify-map.mjs as optional",
  /optional="[^"]*scripts\/verify-map\.mjs/.test(verifyInstall));
check("SKILL.md Step 0 routes multi-session efforts to the map",
  skill.includes("references/map.md") && skill.includes(".design-map.md"));
check("SKILL.md reference index lists map.md",
  /^- `references\/map\.md`:/m.test(skill));
check("checklist.md carries the Map gate group",
  checklist.includes("Map (run this group only when `.design-map.md` exists"));

// The validator's required sections are the contract; map.md must document all
// of them, or the deck teaches a shape the script rejects.
const orderBlock = verifyMap.slice(verifyMap.indexOf("const ORDER = ["), verifyMap.indexOf("];", verifyMap.indexOf("const ORDER = [")));
const mapSections = [...orderBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
check("verify-map.mjs declares its required sections", mapSections.length === 8,
  `found ${mapSections.length}`);
for (const s of mapSections)
  check(`map.md documents the "${s}" section`, map.includes(`## ${s}`));

// The three inversions are the whole point of the map; each is stated where the
// single-run rule it overrides lives, not only in the deck.
check("SKILL.md states the ledger inversion under a map",
  skill.includes("Under a design map (Step 0 item 3) these rules run **once, at charting**"));
check("SKILL.md forbids re-rolling the seed inside a map",
  skill.includes("Never re-roll the seed, re-jitter the tokens"));
check("checklist.md persists one ledger entry per map, not per surface",
  checklist.includes("A map is one effort, so it is **one** ledger entry, not one per surface"));

// 8. The mechanical sweep: the script's rule table and the deck's rule table are
// one contract in two files, so neither may grow a rule the other does not know.
const sweep = read("skills/goddesign/scripts/sweep.mjs");
const sweepBlock = sweep.slice(sweep.indexOf("const RULES = ["), sweep.indexOf("];", sweep.indexOf("const RULES = [")));
const sweepRules = [...sweepBlock.matchAll(/^\s*\['([a-z-]+)',\s*'(fail|advisory)'/gm)].map((m) => ({ id: m[1], sev: m[2] }));
check("sweep.mjs declares a rule table", sweepRules.length >= 20, `found ${sweepRules.length}`);
for (const r of sweepRules) {
  check(`checklist.md documents sweep rule "${r.id}"`, checklist.includes(`\`${r.id}\``));
  check(`checklist.md records "${r.id}" as ${r.sev}`,
    new RegExp(`\\\`${r.id}\\\`\\s*\\|\\s*${r.sev}\\s*\\|`).test(checklist));
}
const documented = [...checklist.matchAll(/^\| `([a-z-]+)` \| (fail|advisory) \|/gm)].map((m) => m[1]);
for (const id of documented)
  check(`sweep.mjs implements documented rule "${id}"`, sweepRules.some((r) => r.id === id));
check("verify-install.sh lists sweep.mjs as optional",
  /optional="[^"]*scripts\/sweep\.mjs/.test(verifyInstall));
check("verify-install.sh lists extract-tokens.mjs as optional",
  /optional="[^"]*scripts\/extract-tokens\.mjs/.test(verifyInstall));
check("SKILL.md Step 5 routes the gate through the sweep",
  skill.includes("scripts/sweep.mjs"));
check("SKILL.md extension mode measures the existing system",
  skill.includes("scripts/extract-tokens.mjs"));
check("checklist.md keeps the sweep and the audit as complements",
  checklist.includes("The sweep and the audit are complements, not substitutes"));
check("checklist.md requires a reason on every waiver",
  checklist.includes("the reason is mandatory"));

// The sweep is the half of the gate that survives a sandbox, but two hosts cannot
// run it at all, and a run that cannot run it has to say so rather than report a
// pass count it never measured. The label is the contract; keep all three sites.
check("checklist.md names the no-sweep degraded state",
  checklist.includes("DEGRADED: no sweep"));
check("checklist.md hands off the unrunnable sweep like the unrunnable audit",
  checklist.includes("sweep-handoff.sh"));
check("SKILL.md Step 5 names the no-sweep degraded state",
  skill.includes("DEGRADED: no sweep"));

// Install integrity: the deck-row-to-modulus contract is checked by this script
// for the maintainer, and lint-decks never ships inside skills/goddesign/, so
// verify-install.sh has to carry the same check for everyone who installs it.
check("verify-install.sh checks deck row counts against the seed moduli",
  verifyInstall.includes("direction=$((") && /INCOMPLETE INSTALL: references\/\$1 has \$found rows/.test(verifyInstall));
check("verify-install.sh greps the moduli rather than hardcoding them",
  /grep -oE '% \[0-9\]\+'/.test(verifyInstall));

// 9. Repo style: no em dashes or en dashes in prose files.
import { execSync } from "node:child_process";
const prose = execSync(
  "git ls-files --cached --others --exclude-standard -- '*.md'",
  { encoding: "utf8" }
).trim().split("\n").filter((f) => f && existsSync(f) && !f.startsWith("validation/runs/"));
for (const f of prose) {
  const t = read(f);
  check(`${f} has no em/en dashes`, !/[\u2013\u2014]/.test(t));
}

// Report.
console.log(`lint-decks: ${ok.length} checks green`);
if (fail.length) {
  console.log("FAILURES:");
  for (const f of fail) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("lint-decks: all checks pass");
process.exit(0);
