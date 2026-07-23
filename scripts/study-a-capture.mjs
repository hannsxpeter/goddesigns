#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--") || !argv[i + 1]) fail(`invalid argument near "${key}"`);
    args[key.slice(2)] = argv[i + 1];
    i += 1;
  }
  if (!args.out || (!args.briefs && !args.html)) {
    fail("usage: node scripts/study-a-capture.mjs --briefs <briefs.json> --out <directory>, or --html <index.html> --out <directory>");
  }
  return args;
}

async function loadPlaywright() {
  for (const name of ["playwright", "playwright-core"]) {
    try {
      return await import(name);
    } catch {}
  }
  const roots = [];
  try {
    roots.push(execSync("npm root -g", { encoding: "utf8" }).trim());
  } catch {}
  roots.push(
    "/opt/homebrew/lib/node_modules",
    "/usr/local/lib/node_modules",
    `${process.env.HOME}/.local/lib/node_modules`,
    `${process.env.HOME}/.npm-global/lib/node_modules`,
  );
  for (const root of roots) {
    for (const name of ["playwright", "playwright-core"]) {
      for (const entry of ["index.mjs", "index.js"]) {
        const path = `${root}/${name}/${entry}`;
        if (!existsSync(path)) continue;
        try {
          return await import(pathToFileURL(path).href);
        } catch {}
      }
    }
  }
  return null;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function dismissConsent(page) {
  const selectors = [
    "#onetrust-accept-btn-handler",
    "#cookiescript_accept",
    ".sqs-cookie-banner-v2-accept",
    "[data-testid='uc-accept-all-button']",
    "[data-testid='cookie-policy-dialog-accept-button']",
  ];
  for (const selector of selectors) {
    const control = page.locator(selector).first();
    try {
      if (await control.isVisible({ timeout: 750 })) {
        await control.click({ timeout: 1500 });
        await page.waitForTimeout(1000);
        return selector;
      }
    } catch {}
  }
  const names = [
    /^accept all(?: cookies)?$/i,
    /^accept(?: all)? cookies$/i,
    /^accept$/i,
    /^agree$/i,
    /^allow all(?: cookies)?$/i,
    /^i agree$/i,
  ];
  for (const name of names) {
    const button = page.getByRole("button", { name }).first();
    try {
      if (await button.isVisible({ timeout: 250 })) {
        await button.click({ timeout: 1000 });
        await page.waitForTimeout(1000);
        return String(name);
      }
    } catch {}
  }
  return "";
}

async function dismissOverlay(page) {
  const selectors = [
    "w-div .g-6izj0r",
    "[role='dialog'] button[aria-label='Close']",
    "[role='dialog'] [aria-label*='close' i]",
    ".modal button.close",
  ];
  for (const selector of selectors) {
    const control = page.locator(selector).first();
    try {
      if (await control.isVisible({ timeout: 500 })) {
        await control.click({ timeout: 1500 });
        await page.waitForTimeout(500);
        return selector;
      }
    } catch {}
  }
  return "";
}

async function hydrateLazyContent(page) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.evaluate(async () => {
        const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
        for (
          let y = 0;
          y < Math.min(document.documentElement.scrollHeight, 24000);
          y += 500
        ) {
          window.scrollTo(0, y);
          await sleep(150);
        }
        await Promise.race([
          Promise.all(
            [...document.images].map((image) =>
              image.complete
                ? Promise.resolve()
                : new Promise((done) => {
                    image.addEventListener("load", done, { once: true });
                    image.addEventListener("error", done, { once: true });
                  }),
            ),
          ),
          sleep(5000),
        ]);
        window.scrollTo(0, 0);
        await sleep(750);
      });
      return;
    } catch (error) {
      if (attempt > 0 || !/execution context was destroyed/i.test(String(error))) {
        throw error;
      }
      await page.waitForTimeout(1000);
    }
  }
}

async function capturePage(browser, source, outDir, kind) {
  await mkdir(outDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: "en-CA",
  });
  const page = await context.newPage();
  const started = new Date().toISOString();
  let response;
  try {
    response = await page.goto(source, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
  } catch (error) {
    await context.close();
    fail(`capture failed for ${source}: ${String(error).split("\n")[0]}`);
  }
  try {
    await page.evaluate(() => document.fonts.ready);
  } catch {}
  await page.waitForTimeout(1500);
  let dismissedConsent = kind === "human" ? await dismissConsent(page) : "";
  let dismissedOverlay = kind === "human" ? await dismissOverlay(page) : "";
  await hydrateLazyContent(page);
  if (kind === "human" && !dismissedConsent) {
    dismissedConsent = await dismissConsent(page);
  }
  if (kind === "human" && !dismissedOverlay) {
    dismissedOverlay = await dismissOverlay(page);
  }
  const html = await page.content();
  const metadata = await page.evaluate(() => ({
    title: document.title,
    generator: document.querySelector('meta[name="generator"]')?.getAttribute("content") ?? "",
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
  }));
  const screenshotPath = join(outDir, "page.png");
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    animations: "disabled",
  });
  let mhtml = "";
  try {
    const cdp = await context.newCDPSession(page);
    const snapshot = await cdp.send("Page.captureSnapshot", { format: "mhtml" });
    mhtml = snapshot.data;
  } catch {}
  const png = await readFile(screenshotPath);
  const record = {
    kind,
    source,
    final_url: page.url(),
    http_status: response?.status() ?? null,
    captured_at: new Date().toISOString(),
    started_at: started,
    title: metadata.title,
    generator: metadata.generator,
    page_width: metadata.width,
    page_height: metadata.height,
    dismissed_consent: dismissedConsent,
    dismissed_overlay: dismissedOverlay,
    html_sha256: sha256(html),
    png_sha256: sha256(png),
    mhtml_sha256: mhtml ? sha256(mhtml) : "",
    browser: "playwright-chromium",
    viewport: "1280x900 full-page",
    reduced_motion: true,
  };
  await Promise.all([
    writeFile(join(outDir, "page.html"), html),
    writeFile(join(outDir, "capture.json"), JSON.stringify(record, null, 2) + "\n"),
    mhtml ? writeFile(join(outDir, "page.mhtml"), mhtml) : Promise.resolve(),
  ]);
  await context.close();
  return record;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const playwright = await loadPlaywright();
  if (!playwright) fail("playwright is not importable");
  const browser = await playwright.chromium.launch();
  const records = [];
  try {
    if (args.briefs) {
      const spec = JSON.parse(await readFile(resolve(args.briefs), "utf8"));
      const selectedIds = new Set((args.ids ?? "").split(",").filter(Boolean));
      const briefs = selectedIds.size
        ? spec.briefs.filter((brief) => selectedIds.has(brief.id))
        : spec.briefs;
      if (selectedIds.size && briefs.length !== selectedIds.size) {
        fail(`one or more --ids values do not exist in ${args.briefs}`);
      }
      for (const brief of briefs) {
        const record = await capturePage(
          browser,
          brief.human_url,
          resolve(args.out, brief.id),
          "human",
        );
        records.push({ brief_id: brief.id, ...record });
        process.stdout.write(`captured ${brief.id}: ${record.final_url}\n`);
      }
    } else {
      const html = resolve(args.html);
      const record = await capturePage(
        browser,
        pathToFileURL(html).href,
        resolve(args.out),
        "generated",
      );
      records.push({ source_file: basename(html), ...record });
    }
  } finally {
    await browser.close();
  }
  await mkdir(resolve(args.out), { recursive: true });
  await writeFile(
    join(resolve(args.out), "capture-index.json"),
    JSON.stringify(records, null, 2) + "\n",
  );
  process.stdout.write(`${JSON.stringify({ captures: records.length }, null, 2)}\n`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`study-a-capture: ${error.message}\n`);
    process.exitCode = 1;
  });
}

export {
  capturePage,
  dismissConsent,
  dismissOverlay,
  hydrateLazyContent,
  loadPlaywright,
};
