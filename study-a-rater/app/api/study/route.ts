import { NextRequest, NextResponse } from "next/server";
import {
  assignmentForSlot,
  ensureSchema,
  getDatabase,
  STUDY_ID,
  verifyInvitation,
} from "../../lib/study";

type SubmissionRow = {
  submission_id: string;
  completed_at: string | null;
};

type ResponseRow = {
  sample_id: string;
  ai_verdict: "yes" | "no" | "unsure";
  familiar: "yes" | "no";
  appeal: number;
  trust: number;
  reason: string;
};

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function sessionPayload(token: string) {
  const invitation = await verifyInvitation(token);
  if (!invitation) return null;
  const assigned = assignmentForSlot(invitation.slot);
  if (!assigned) return null;
  const database = await getDatabase();
  await ensureSchema(database);
  const submission = await database
    .prepare(
      "SELECT submission_id, completed_at FROM submissions WHERE token_hash = ?",
    )
    .bind(invitation.tokenHash)
    .first<SubmissionRow>();
  const responseRows = submission
    ? (
        await database
          .prepare(
            "SELECT sample_id, ai_verdict, familiar, appeal, trust, reason FROM responses WHERE submission_id = ? ORDER BY position",
          )
          .bind(submission.submission_id)
          .all<ResponseRow>()
      ).results
    : [];
  const answers = Object.fromEntries(
    responseRows.map((row) => [
      row.sample_id,
      {
        aiVerdict: row.ai_verdict,
        familiar: row.familiar,
        appeal: row.appeal,
        trust: row.trust,
        reason: row.reason,
      },
    ]),
  );
  return {
    database,
    invitation,
    assigned,
    submission,
    payload: {
      study: STUDY_ID,
      slot: invitation.slot,
      submissionId: submission?.submission_id ?? null,
      completed: Boolean(submission?.completed_at),
      samples: assigned,
      answers,
    },
  };
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error("The request body is invalid.");
  }
  const token = typeof body.token === "string" ? body.token : "";
  let session;
  try {
    session = await sessionPayload(token);
  } catch {
    return error("The study service is temporarily unavailable.", 503);
  }
  if (!session) return error("This invitation is invalid or the study is not open.", 404);
  const { database, invitation, assigned, submission } = session;
  const action = body.action;

  if (action === "session") {
    return NextResponse.json(session.payload, {
      headers: { "cache-control": "no-store" },
    });
  }

  if (action === "start") {
    const eligibility = body.eligibility as Record<string, unknown> | undefined;
    const eligible = Boolean(
      eligibility?.age &&
      eligibility?.notAuthor &&
      eligibility?.notExposed &&
      eligibility?.consent,
    );
    if (!eligible) return error("All eligibility and consent confirmations are required.");
    if (submission) {
      return NextResponse.json({ submissionId: submission.submission_id });
    }
    const now = new Date().toISOString();
    const submissionId = crypto.randomUUID();
    await database
      .prepare(
        "INSERT INTO submissions (submission_id, token_hash, slot, eligible, consented_at, started_at) VALUES (?, ?, ?, 1, ?, ?)",
      )
      .bind(
        submissionId,
        invitation.tokenHash,
        invitation.slot,
        now,
        now,
      )
      .run();
    return NextResponse.json({ submissionId });
  }

  if (!submission) return error("Begin the study before saving answers.", 409);
  if (submission.completed_at) return error("This study response is already complete.", 409);

  if (action === "answer") {
    const sampleId = typeof body.sampleId === "string" ? body.sampleId : "";
    const position = Number(body.position);
    const expected = assigned.find(
      (sample) => sample.id === sampleId && sample.position === position,
    );
    if (!expected) return error("That sample is not part of this invitation.");
    if (!["yes", "no", "unsure"].includes(String(body.aiVerdict))) {
      return error("Choose yes, no, or unsure.");
    }
    if (!["yes", "no"].includes(String(body.familiar))) {
      return error("Record whether you have seen the exact site before.");
    }
    const appeal = Number(body.appeal);
    const trust = Number(body.trust);
    const dwellMs = Math.round(Number(body.dwellMs));
    const reason = typeof body.reason === "string"
      ? body.reason.replaceAll("\u0000", "").trim().slice(0, 280)
      : "";
    const containsContactInformation =
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(reason) ||
      /(?:\+?\d[\d ().-]{7,}\d)/.test(reason);
    if (containsContactInformation) {
      return error("Remove email addresses or phone numbers from the optional observation.");
    }
    if (
      !Number.isInteger(appeal) ||
      appeal < 1 ||
      appeal > 5 ||
      !Number.isInteger(trust) ||
      trust < 1 ||
      trust > 5 ||
      !Number.isFinite(dwellMs) ||
      dwellMs < 0 ||
      dwellMs > 7200000
    ) {
      return error("One or more rating values are invalid.");
    }
    const now = new Date().toISOString();
    await database
      .prepare(`
        INSERT INTO responses (
          submission_id, sample_id, position, ai_verdict, familiar, appeal, trust,
          reason, dwell_ms, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (submission_id, sample_id) DO UPDATE SET
          position = excluded.position,
          ai_verdict = excluded.ai_verdict,
          familiar = excluded.familiar,
          appeal = excluded.appeal,
          trust = excluded.trust,
          reason = excluded.reason,
          dwell_ms = excluded.dwell_ms,
          updated_at = excluded.updated_at
      `)
      .bind(
        submission.submission_id,
        sampleId,
        position,
        String(body.aiVerdict),
        String(body.familiar),
        appeal,
        trust,
        reason,
        dwellMs,
        now,
        now,
      )
      .run();
    return NextResponse.json({ saved: true });
  }

  if (action === "complete") {
    const count = await database
      .prepare(
        "SELECT COUNT(*) AS count FROM responses WHERE submission_id = ?",
      )
      .bind(submission.submission_id)
      .first<{ count: number }>();
    if (Number(count?.count) !== 15) {
      return error("All fifteen samples must be answered before submission.", 409);
    }
    const completedAt = new Date().toISOString();
    await database
      .prepare(
        "UPDATE submissions SET completed_at = ? WHERE submission_id = ? AND completed_at IS NULL",
      )
      .bind(completedAt, submission.submission_id)
      .run();
    return NextResponse.json({ completed: true, completedAt });
  }

  return error("Unknown study action.");
}
