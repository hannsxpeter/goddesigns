import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const port = 43000 + (process.pid % 1000);
  const child = spawn("npm", ["run", "start", "--", "--port", String(port)], {
    cwd: new URL("../", import.meta.url),
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk;
  });
  child.stderr.on("data", (chunk) => {
    output += chunk;
  });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`production server exited before readiness: ${output}`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`, {
        headers: { accept: "text/html" },
      });
      return { response, child };
    } catch {
      await new Promise((done) => setTimeout(done, 100));
    }
  }
  child.kill("SIGTERM");
  throw new Error(`production server did not become ready: ${output}`);
}

test("server-renders the neutral study introduction", async () => {
  const { response, child } = await render();
  try {
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    const html = await response.text();
    assert.match(html, /<title>Website perception study<\/title>/i);
    assert.match(html, /Website perception study/);
    assert.match(html, /Preparing your study session/);
    assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
  } finally {
    child.kill("SIGTERM");
  }
});

test("source declares persistent storage, privacy controls, and no starter metadata", async () => {
  const [hosting, page, layout, packageJson, schema, studyApp, studyRoute, exportRoute, worker] = await Promise.all([
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/study-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/study/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/export/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
  ]);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(page, /<StudyApp \/>/);
  assert.match(layout, /index: false/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton|starter/i);
  assert.match(schema, /submissions/);
  assert.match(schema, /responses/);
  assert.match(schema, /CHECK \(ai_verdict IN/);
  assert.match(schema, /CHECK \(familiar IN/);
  assert.match(schema, /CHECK \(appeal BETWEEN 1 AND 5\)/);
  assert.match(studyApp, /Judge fifteen website captures/);
  assert.match(studyApp, /De-identified perception research/);
  assert.match(studyApp, /Direct identifiers/);
  assert.match(studyApp, /Have you seen this exact site before/);
  assert.match(studyApp, /Math\.max\(0, data\.samples\.length - 1\)/);
  assert.match(studyApp, /location\.hash/);
  assert.match(studyApp, /sessionStorage/);
  assert.doesNotMatch(studyApp, /api\/study\?token/);
  assert.doesNotMatch(studyRoute, /export async function GET/);
  assert.equal(
    studyApp.match(/I consent to these de-identified ratings being analyzed and published\./g)?.length,
    1,
  );
  assert.doesNotMatch(schema, /user_agent/i);
  assert.doesNotMatch(studyRoute, /user-agent|user_agent/i);
  assert.doesNotMatch(
    await readFile(new URL("../app/lib/study.ts", import.meta.url), "utf8"),
    /goddesign-study-a/,
  );
  assert.match(studyRoute, /containsContactInformation/);
  assert.ok(exportRoute.includes("/^[\\t\\r\\n ]*[=+\\-@]/"));
  assert.match(worker, /Referrer-Policy/);
  assert.match(worker, /X-Frame-Options/);
});
