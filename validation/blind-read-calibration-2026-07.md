# Blind post-render critic: calibration, 2026-07-22

Seam 4 of the ADHD evaluation (`validation/adhd-evaluation-2026-07.md`): a separate process sees only a page's screenshots (never its code or its DIRECTION LOCK) and reconstructs the page's identity, closing the gap where the QA gate's Phase 1 self-critique is authored by the same context that holds the answer key. Shipped as `skills/goddesign/scripts/blind-read.sh` with its fixed prompt in `skills/goddesign/references/blind-read.md`. This is the calibration that decided how it ships.

## Method

The script was dogfooded end to end (it delegates to the installed Codex CLI, gpt-5.6-sol xhigh, via stdin so the variadic `-i` image flag does not swallow the prompt) against four archived Bandquarter renders whose owner ranking is on record (`validation/bandquarter-2026-07.md`): gd-a (owner first), gd-c (owner second), fd-a (a gig-poster the owner placed behind), and the no-skill baseline (appealing but tell-laden, audit-failed on mobile). All four are the same domain (independent music-venue management software), so the test isolates whether the blind reader recovers a page's identity from pixels alone. Raw outputs in `validation/blind-read-calibration/`.

## Result

| Render | Recovered subject | Recovered signature | identity |
| --- | --- | --- | --- |
| gd-a (owner 1st) | music venue ops: bookings, settlements, payouts, bar | settlement ledger with cyan payout total | strong |
| gd-c (owner 2nd) | music venue ops: booking calendars, settlements, bar | oversized $5,400 settlement total | strong |
| fd-a (owner behind) | live music venue management for independent clubs | oversized "RUN THE ROOM" slogan beside a booking calendar | strong |
| baseline (generic) | music venue ops: booking, settlement, bar | hot-pink "paperwork." headline beside a booking calendar | strong |

Subject and signature recovery: accurate on all four, including the fd loser and the generic baseline. The reader reliably answers "can a stranger see what this product is from the pixels." Its `ai_tell` field also surfaced real per-page defects: it flagged the fd loser's "enormous nearly empty middle section reads like unfinished placeholder" and the baseline's "generic three-card pricing section and gradient CTA panel."

Discrimination: the `identity` field returned "strong" for all four, so it does NOT separate the owner's winners from the loser on this set. That is expected once inspected: Bandquarter's losers did not fail on identity (they were subject-embodied); they lost on convergence and grammar. A domain this specific reads as "music-venue software" even in a generic execution.

## Disposition

The strict seam-4 kill criterion ("ship only if it separates winners from failures on subject and signature") is NOT met as a ranker, and the mechanism is not shipped as one. But its validated capability, accurate identity recovery, is a genuine Specificity aid distinct from ranking, so it ships as an OPTIONAL, degrade-friendly check with an honest job: the builder compares the blind reconstruction against the DIRECTION LOCK, and a reconstruction that names a different subject or misses the signature, or an `identity` of "weak", is a Phase 1 Specificity failure to fix. A "strong" result is necessary, not sufficient. No image-capable CLI means `DEGRADED: no blind read` and the builder's own Phase 3 inspection carries the gate, with no penalty. It never becomes a hard gate.

## Limitations

Four renders, one domain, one juror model (same family as the builders, the weakness this project charged against ADHD's own benchmark). The corpus contained no true identity-failure render (a page that fails to communicate its subject), because goddesign pages, and even the baseline in this specific domain, all communicate identity; so the failure-detection path is wired on sound reasoning but was not itself triggered in calibration. A future round should blind-read a deliberately generic, low-embodiment page from an ambiguous domain to exercise the "weak" path directly.
