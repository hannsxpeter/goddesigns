import assignmentPlan from "../../data/assignment-plan.json";
import sampleIndex from "../../data/sample-index.json";
import {
  responsesIndexSchema,
  responsesSchema,
  submissionsSchema,
} from "../../db/schema";

type D1DatabaseLike = {
  batch(statements: unknown[]): Promise<unknown>;
  prepare(query: string): {
    bind(...values: unknown[]): ReturnType<D1DatabaseLike["prepare"]>;
    first<T = Record<string, unknown>>(): Promise<T | null>;
    all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    run(): Promise<unknown>;
  };
};

type SampleRecord = { id: string; image: string };
type AssignmentPlan = {
  study: string;
  slots: Record<string, string[]>;
};

const plan = assignmentPlan as AssignmentPlan;
const samples = new Map(
  (sampleIndex.samples as SampleRecord[]).map((sample) => [sample.id, sample]),
);

export const STUDY_ID = "website-perception-study-2026-07";

export async function getDatabase() {
  const { env } = await import("cloudflare:workers");
  const database = (env as unknown as { DB?: D1DatabaseLike }).DB;
  if (!database) {
    throw new Error("Study database is unavailable.");
  }
  return database;
}

export async function ensureSchema(database: D1DatabaseLike) {
  await database.batch([
    database.prepare(submissionsSchema),
    database.prepare(responsesSchema),
    database.prepare(responsesIndexSchema),
  ]);
}

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashText(value: string) {
  return bytesToHex(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToHex(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
  );
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function verifyInvitation(token: string) {
  if (process.env.NODE_ENV !== "production" && /^dev\.\d+$/.test(token)) {
    const slot = Number(token.split(".")[1]);
    return assignmentForSlot(slot) ? { slot, tokenHash: await hashText(token) } : null;
  }
  const match = token.match(/^v1\.(\d{1,2})\.([a-f0-9]{24})\.([a-f0-9]{64})$/);
  if (!match) return null;
  const slot = Number(match[1]);
  if (!assignmentForSlot(slot)) return null;
  const secret = process.env.STUDY_ASSIGNMENT_SECRET;
  if (!secret || secret.length < 32) return null;
  const expected = await sign(`v1.${slot}.${match[2]}`, secret);
  if (!safeEqual(expected, match[3])) return null;
  return { slot, tokenHash: await hashText(token) };
}

export function assignmentForSlot(slot: number) {
  const ids = plan.slots[String(slot)];
  if (!ids || ids.length !== 15) return null;
  const records = ids.map((id, index) => {
    const sample = samples.get(id);
    if (!sample) return null;
    return { ...sample, position: index + 1 };
  });
  return records.some((sample) => !sample) ? null : records as Array<SampleRecord & { position: number }>;
}

export function exportSecretMatches(candidate: string) {
  const secret = process.env.STUDY_EXPORT_SECRET ?? "";
  return secret.length >= 32 && safeEqual(candidate, secret);
}

export type { D1DatabaseLike };
