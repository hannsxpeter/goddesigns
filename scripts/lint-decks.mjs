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
check("single-host completion is the default",
  skill.includes("One capable host is the default and is a complete setup"));
check("cross-host work requires prompt opt-in",
  skill.includes("Use multiple hosts only when the user's brief explicitly asks"));
check("missing a second host does not change QA",
  checklist.includes("A missing second host never changes the design score"));

// 7. Repo style: no em dashes or en dashes in prose files.
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
