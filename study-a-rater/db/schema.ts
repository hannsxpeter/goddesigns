export const submissionsSchema = `
  CREATE TABLE IF NOT EXISTS submissions (
    submission_id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 40),
    eligible INTEGER NOT NULL CHECK (eligible IN (0, 1)),
    consented_at TEXT NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT
  )
`;

export const responsesSchema = `
  CREATE TABLE IF NOT EXISTS responses (
    submission_id TEXT NOT NULL,
    sample_id TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 15),
    ai_verdict TEXT NOT NULL CHECK (ai_verdict IN ('yes', 'no', 'unsure')),
    familiar TEXT NOT NULL CHECK (familiar IN ('yes', 'no')),
    appeal INTEGER NOT NULL CHECK (appeal BETWEEN 1 AND 5),
    trust INTEGER NOT NULL CHECK (trust BETWEEN 1 AND 5),
    reason TEXT NOT NULL CHECK (length(reason) <= 280),
    dwell_ms INTEGER NOT NULL CHECK (dwell_ms BETWEEN 0 AND 7200000),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (submission_id, sample_id),
    FOREIGN KEY (submission_id) REFERENCES submissions(submission_id)
  )
`;

export const responsesIndexSchema = `
  CREATE INDEX IF NOT EXISTS responses_submission_idx
  ON responses (submission_id, position)
`;
