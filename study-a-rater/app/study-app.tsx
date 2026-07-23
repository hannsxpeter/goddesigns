"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Verdict = "yes" | "no" | "unsure";
type Familiarity = "yes" | "no";

type Answer = {
  aiVerdict: Verdict | "";
  familiar: Familiarity | "";
  appeal: number;
  trust: number;
  reason: string;
};

type Sample = {
  id: string;
  image: string;
  position: number;
};

type Session = {
  study: string;
  slot: number;
  submissionId: string | null;
  completed: boolean;
  samples: Sample[];
  answers: Record<string, Answer>;
};

const EMPTY_ANSWER: Answer = {
  aiVerdict: "",
  familiar: "",
  appeal: 0,
  trust: 0,
  reason: "",
};

function getToken() {
  const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get(
    "token",
  );
  if (fragmentToken) {
    window.sessionStorage.setItem("study-invitation-token", fragmentToken);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    return fragmentToken;
  }
  return window.sessionStorage.getItem("study-invitation-token") ?? "";
}

async function api(
  token: string,
  options?: { action: string; [key: string]: unknown },
) {
  const response = await fetch("/api/study", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token, ...(options ?? { action: "session" }) }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? "The study service could not complete that request.");
  }
  return body;
}

function Scale({
  name,
  value,
  onChange,
  low,
  high,
}: {
  name: string;
  value: number;
  onChange: (value: number) => void;
  low: string;
  high: string;
}) {
  return (
    <>
      <div className="choice-grid five">
        {[1, 2, 3, 4, 5].map((number) => (
          <div className="choice" key={number}>
            <input
              checked={value === number}
              id={`${name}-${number}`}
              name={name}
              onChange={() => onChange(number)}
              type="radio"
              value={number}
            />
            <label htmlFor={`${name}-${number}`}>{number}</label>
          </div>
        ))}
      </div>
      <div className="scale-notes" aria-hidden="true">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </>
  );
}

export function StudyApp() {
  const [token, setToken] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer>(EMPTY_ANSWER);
  const [checks, setChecks] = useState({
    age: false,
    notAuthor: false,
    notExposed: false,
    consent: false,
  });
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageState, setImageState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [zoom, setZoom] = useState(100);
  const sampleStartedAt = useRef(0);

  useEffect(() => {
    const nextToken = getToken();
    let active = true;
    async function loadSession() {
      await Promise.resolve();
      if (!active) return;
      setToken(nextToken);
      if (!nextToken) {
        setError("This invitation link is incomplete. Ask the study organizer for a new link.");
        setLoading(false);
        return;
      }
      try {
        const data = await api(nextToken) as Session;
        if (!active) return;
        setSession(data);
        const firstUnanswered = data.samples.findIndex(
          (item) => !data.answers[item.id]?.aiVerdict,
        );
        setIndex(
          firstUnanswered < 0
            ? Math.max(0, data.samples.length - 1)
            : firstUnanswered,
        );
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "The invitation could not load.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSession();
    return () => {
      active = false;
    };
  }, []);

  const sample = session?.samples[index];
  const progress = session?.completed
    ? 100
    : session
      ? ((index + 1) / session.samples.length) * 100
      : 0;

  useEffect(() => {
    if (!sample || !session) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setAnswer(session.answers[sample.id] ?? EMPTY_ANSWER);
      setImageState("loading");
      setZoom(100);
      sampleStartedAt.current = Date.now();
      document.querySelector(".sample-viewport")?.scrollTo(0, 0);
    });
    return () => {
      active = false;
    };
  }, [sample, session]);

  const validAnswer = useMemo(
    () =>
      Boolean(answer.aiVerdict) &&
      Boolean(answer.familiar) &&
      answer.appeal >= 1 &&
      answer.appeal <= 5 &&
      answer.trust >= 1 &&
      answer.trust <= 5,
    [answer],
  );

  const allChecks = Object.values(checks).every(Boolean);

  async function startStudy() {
    if (!allChecks) return;
    setStarting(true);
    setError("");
    try {
      const data = await api(token, {
        action: "start",
        eligibility: checks,
      });
      setSession((current) =>
        current
          ? { ...current, submissionId: data.submissionId }
          : current,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The study could not start.");
    } finally {
      setStarting(false);
    }
  }

  async function saveAndMove() {
    if (!session || !sample || !validAnswer) return;
    setSaving(true);
    setError("");
    try {
      await api(token, {
        action: "answer",
        sampleId: sample.id,
        position: sample.position,
        aiVerdict: answer.aiVerdict,
        familiar: answer.familiar,
        appeal: answer.appeal,
        trust: answer.trust,
        reason: answer.reason,
        dwellMs: Math.max(0, Date.now() - sampleStartedAt.current),
      });
      const nextAnswers = {
        ...session.answers,
        [sample.id]: answer,
      };
      if (index === session.samples.length - 1) {
        const missing = session.samples.filter(
          (item) => !(nextAnswers[item.id]?.aiVerdict),
        );
        if (missing.length) {
          const missingIndex = session.samples.findIndex(
            (item) => item.id === missing[0].id,
          );
          setSession({ ...session, answers: nextAnswers });
          setIndex(missingIndex);
          setError("Finish the unanswered sample before submitting.");
          return;
        }
        await api(token, { action: "complete" });
        setSession({ ...session, answers: nextAnswers, completed: true });
      } else {
        setSession({ ...session, answers: nextAnswers });
        setIndex(index + 1);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your answer could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="study-shell">
        <header className="topbar">
          <p className="wordmark">Website perception study</p>
          <span className="topbar-meta">Loading invitation</span>
        </header>
        <div className="completion">
          <p>Preparing your study session.</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="study-shell">
        <header className="topbar">
          <p className="wordmark">Website perception study</p>
          <span className="topbar-meta">Invitation required</span>
        </header>
        <div className="completion">
          <section className="completion-panel">
            <p className="kicker">Link unavailable</p>
            <h1>This invitation cannot open.</h1>
            <p>{error}</p>
          </section>
        </div>
      </main>
    );
  }

  if (session.completed) {
    return (
      <main className="study-shell">
        <header className="topbar">
          <p className="wordmark">Website perception study</p>
          <span className="topbar-meta">Complete</span>
        </header>
        <div className="progress-track">
          <progress aria-label="Study complete" max={100} value={100} />
        </div>
        <div className="completion">
          <section className="completion-panel">
            <p className="kicker">Response received</p>
            <h1>Thank you for finishing.</h1>
            <p>
              Your de-identified ratings are saved. Please do not discuss individual
              samples with other invited raters until the study closes.
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (!session.submissionId) {
    return (
      <main className="study-shell">
        <header className="topbar">
          <p className="wordmark">Website perception study</p>
          <span className="topbar-meta">About 12 minutes</span>
        </header>
        <div className="progress-track">
          <progress aria-label="Study not started" max={100} value={0} />
        </div>
        <section className="intro">
          <div className="intro-grid">
            <div>
              <p className="kicker">De-identified perception research</p>
              <h1>Judge fifteen website captures.</h1>
              <p className="lede">
                For each page, record whether it feels AI-made, how appealing it
                is, whether you would trust it with your email address, and
                whether you have seen the exact site before.
              </p>
            </div>
            <dl className="study-facts">
              <div>
                <dt>Samples</dt>
                <dd>15</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>10-15 min</dd>
              </div>
              <div>
                <dt>Direct identifiers</dt>
                <dd>None collected</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>None</dd>
              </div>
            </dl>
          </div>
          <section className="consent-panel" aria-labelledby="consent-title">
            <h2 id="consent-title">Before you begin</h2>
            <p>
              Participation is voluntary. You can stop at any time. The study
              stores an invitation code and your ratings, not your name, email,
              or user-agent string. Published responses are de-identified.
            </p>
            <p>
              This study is run by an open-source project maintainer. For
              questions or withdrawal requests, reply in the channel that
              delivered your invitation before the study closes.
            </p>
            {[
              ["age", "I am at least 18 years old."],
              ["notAuthor", "I am not the author or maintainer of the evaluated design method."],
              ["notExposed", "I have never read its direction deck or banned-pattern list."],
              ["consent", "I consent to these de-identified ratings being analyzed and published."],
            ].map(([key, label]) => (
              <label className="check-row" key={key}>
                <input
                  checked={checks[key as keyof typeof checks]}
                  onChange={(event) =>
                    setChecks({ ...checks, [key]: event.target.checked })
                  }
                  type="checkbox"
                />
                <span>{label}</span>
              </label>
            ))}
            <button
              className="primary-button"
              disabled={!allChecks || starting}
              onClick={startStudy}
              type="button"
            >
              {starting ? "Starting" : "Begin study"}
            </button>
            {error && <p className="status-message">{error}</p>}
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="study-shell">
      <header className="topbar">
        <p className="wordmark">Website perception study</p>
        <span className="topbar-meta">
          Sample {index + 1} of {session.samples.length}
        </span>
      </header>
      <div className="progress-track">
        <progress
          aria-label={`${Math.round(progress)} percent complete`}
          max={100}
          value={progress}
        />
      </div>
      <div className="workbench">
        <section className="sample-stage" aria-labelledby="sample-title">
          <div className="sample-toolbar">
            <p className="sample-count" id="sample-title">
              Inspect the full page
            </p>
            <div className="zoom-controls" aria-label="Screenshot width">
              {[50, 75, 100].map((value) => (
                <button
                  aria-pressed={zoom === value}
                  key={value}
                  onClick={() => setZoom(value)}
                  type="button"
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>
          <div className="sample-viewport">
            {imageState === "loading" && (
              <div className="image-state">Loading the page capture.</div>
            )}
            {imageState === "error" && (
              <div className="image-state">
                This capture did not load. Check your connection, then reload the page.
              </div>
            )}
            {/* Full-page research captures must retain their source dimensions. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`Website sample ${index + 1} of ${session.samples.length}`}
              className={`sample-image zoom-${zoom} ${
                imageState === "ready" ? "is-ready" : ""
              }`}
              onError={() => setImageState("error")}
              onLoad={() => {
                setImageState("ready");
                sampleStartedAt.current = Date.now();
              }}
              src={sample?.image}
            />
          </div>
        </section>
        <aside className="rating-rail" aria-label="Rate this sample">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveAndMove();
            }}
          >
            <fieldset>
              <legend>Does this page feel AI-made?</legend>
              <div className="choice-grid">
                {(["yes", "no", "unsure"] as Verdict[]).map((value) => (
                  <div className="choice" key={value}>
                    <input
                      checked={answer.aiVerdict === value}
                      id={`verdict-${value}`}
                      name="verdict"
                      onChange={() => setAnswer({ ...answer, aiVerdict: value })}
                      type="radio"
                      value={value}
                    />
                    <label htmlFor={`verdict-${value}`}>
                      {value[0].toUpperCase() + value.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>How appealing is this page?</legend>
              <Scale
                high="Very appealing"
                low="Not appealing"
                name="appeal"
                onChange={(appeal) => setAnswer({ ...answer, appeal })}
                value={answer.appeal}
              />
            </fieldset>
            <fieldset>
              <legend>Would you trust this page with your email?</legend>
              <Scale
                high="Definitely"
                low="Definitely not"
                name="trust"
                onChange={(trust) => setAnswer({ ...answer, trust })}
                value={answer.trust}
              />
            </fieldset>
            <fieldset>
              <legend>Have you seen this exact site before?</legend>
              <div className="choice-grid two">
                {(["yes", "no"] as Familiarity[]).map((value) => (
                  <div className="choice" key={value}>
                    <input
                      checked={answer.familiar === value}
                      id={`familiar-${value}`}
                      name="familiar"
                      onChange={() => setAnswer({ ...answer, familiar: value })}
                      type="radio"
                      value={value}
                    />
                    <label htmlFor={`familiar-${value}`}>
                      {value[0].toUpperCase() + value.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
            <label>
              <span className="field-label">
                What most influenced your AI-made answer? Optional
              </span>
              <textarea
                maxLength={280}
                onChange={(event) =>
                  setAnswer({ ...answer, reason: event.target.value })
                }
                placeholder="One short observation, without personal information"
                value={answer.reason}
              />
            </label>
            <p className="save-state" aria-live="polite">
              {saving ? "Saving your answer" : error}
            </p>
            <div className="rail-actions">
              <button
                className="secondary-button"
                disabled={index === 0 || saving}
                onClick={() => setIndex(index - 1)}
                type="button"
              >
                Back
              </button>
              <button
                className="primary-button"
                disabled={!validAnswer || saving || imageState !== "ready"}
                type="submit"
              >
                {index === session.samples.length - 1
                  ? "Submit study"
                  : "Save and continue"}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </main>
  );
}
