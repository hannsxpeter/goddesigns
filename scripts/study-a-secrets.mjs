#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const defaultPath =
  "validation/studies/study-a-2026-07/sealed/runtime-secrets.json";

function valid(secrets) {
  return (
    typeof secrets?.STUDY_ASSIGNMENT_SECRET === "string" &&
    secrets.STUDY_ASSIGNMENT_SECRET.length >= 64 &&
    typeof secrets?.STUDY_EXPORT_SECRET === "string" &&
    secrets.STUDY_EXPORT_SECRET.length >= 64
  );
}

async function main() {
  const output = resolve(process.argv[2] ?? defaultPath);
  try {
    const existing = JSON.parse(await readFile(output, "utf8"));
    if (!valid(existing)) {
      throw new Error(`existing secret file is malformed: ${output}`);
    }
    process.stdout.write(`${JSON.stringify({ output, status: "reused" }, null, 2)}\n`);
    return;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const secrets = {
    STUDY_ASSIGNMENT_SECRET: randomBytes(32).toString("hex"),
    STUDY_EXPORT_SECRET: randomBytes(32).toString("hex"),
  };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(secrets, null, 2)}\n`, {
    flag: "wx",
    mode: 0o600,
  });
  process.stdout.write(`${JSON.stringify({ output, status: "created" }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`study-a-secrets: ${error.message}\n`);
  process.exitCode = 1;
});
