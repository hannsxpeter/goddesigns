import { NextRequest, NextResponse } from "next/server";
import {
  ensureSchema,
  exportSecretMatches,
  getDatabase,
  STUDY_ID,
} from "../../lib/study";

type ExportRow = {
  slot: number;
  submission_id: string;
  eligible: number;
  consented_at: string;
  completed_at: string | null;
  sample_id: string;
  position: number;
  ai_verdict: string;
  familiar: string;
  appeal: number;
  trust: number;
  reason: string;
  dwell_ms: number;
  created_at: string;
  updated_at: string;
};

function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\t\r\n ]*[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  const candidate = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  if (!exportSecretMatches(candidate)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  try {
    const database = await getDatabase();
    await ensureSchema(database);
    const rows = (
      await database
        .prepare(`
          SELECT
            s.slot,
            s.submission_id,
            s.eligible,
            s.consented_at,
            s.completed_at,
            r.sample_id,
            r.position,
            r.ai_verdict,
            r.familiar,
            r.appeal,
            r.trust,
            r.reason,
            r.dwell_ms,
            r.created_at,
            r.updated_at
          FROM submissions s
          JOIN responses r ON r.submission_id = s.submission_id
          ORDER BY s.slot, s.completed_at, r.position
        `)
        .all<ExportRow>()
    ).results;
    const headers = [
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
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        [
          STUDY_ID,
          row.slot,
          row.submission_id,
          row.eligible ? "true" : "false",
          row.consented_at,
          row.completed_at ?? "",
          row.sample_id,
          row.position,
          row.ai_verdict,
          row.familiar,
          row.appeal,
          row.trust,
          row.reason,
          row.dwell_ms,
          row.created_at,
          row.updated_at,
        ]
          .map(csvCell)
          .join(","),
      ),
    ].join("\n") + "\n";
    return new NextResponse(csv, {
      headers: {
        "cache-control": "no-store",
        "content-disposition": 'attachment; filename="study-a-responses.csv"',
        "content-type": "text/csv; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "The export service is unavailable." },
      { status: 503 },
    );
  }
}
