# Study A completion audit

**Closed on 2026-09-26 without outside data.** Nine weeks after this audit, the
two unmet requirements below were still unmet: no neutral participant URL was
issued and no rater responded. The owner decided the question the study would
answer (would strangers identify goddesign pages as AI-made) is not the one that
decides the project's direction, which is whether the skill earns its token cost
on current models for the person who actually uses it. That decision is served
by the owner-ranked, pre-registered comparison in
`validation/studies/lean-core-2026-09/`, which needs no recruitment. Keeping the
rater application alive also meant keeping a deployed Next.js and D1 stack
patched for a study with no participants (v1.7.0 spent a release on its
dependency advisories).

What closure means, precisely:

- The core external claim stays **unvalidated**. Closure is not a result, and
  nothing here may be read as one.
- The frozen receipts in this directory are retained unchanged.
- The rater app (`study-a-rater/`), the nine `scripts/study-a-*.mjs` tools, their
  tests, and `validation/tools/blind-eval-pack.sh` were removed in v2.0.0. All of
  them are recoverable with `git checkout v1.8.0 -- <path>`.
- **The deployed collection app and its D1 database were deleted by the owner on
  2026-09-26.** They were one ChatGPT-hosted project, deployed from Codex, not a
  Cloudflare account: project `appgprj_6a619ef8f77c81918beecc63551aa33b` at
  `goddesign-study-a.hxpxxpxh.chatgpt.site`, with the D1 database bound as `DB`
  (the only project ID in every deploy folder). The last recorded participant
  count was zero (`operator-readiness-receipt.json`, 2026-07-23).
- How the deletion was verified, because the outside view misleads. Signed in as
  the owner, the site now returns the host's not-found page. Anonymously, the
  hostname kept answering 401 with the host's login page, which still names
  "Website Perception Study": 39 readings of the root and `/api/study` from 13:51
  to 14:11 UTC and one at 14:11:30, all 401, while a never-used hostname on the
  same domain answered 404. That login page is a leftover of the host, not the
  app, so an anonymous 401 cannot confirm or refute a deletion there; only a
  signed-in check can.

The audit as it stood on 2026-07-23 follows, unchanged.

Audited against the frozen protocol and live operator state on
2026-07-23. Completion is not inferred from implementation alone.

| Requirement | Authoritative evidence | Verdict |
|---|---|---|
| Protocol frozen before responses | `protocol.md`; live operator export recorded zero response rows in `operator-readiness-receipt.json` | Complete |
| Ten live human controls | `human-control-receipt.json`; all ten HTML and PNG hashes reverified against retained artifacts | Complete |
| Ten matched skill and baseline pairs across both hosts | `codex-replication-receipt.json` and `claude-replication-receipt.json`; five pairs, five green audits, five distinct directions, and forty hashes per host | Complete |
| Neutral baseline execution | Every baseline receipt records a neutral temporary execution workspace; corpus and receipt generators reject legacy method-path baselines | Complete |
| Thirty-sample blinded corpus | `corpus.json`; ten samples per arm and ten distinct skill directions | Complete |
| Balanced anonymized pack | Thirty public sample IDs, forty slots, fifteen unique samples per slot, two balanced waves; sealed manifest SHA-256 `ca15b3113f9a4ab538f4ec047f8257f10bfe34425ac939dda4f768530d90b99b` | Complete |
| Production collection application | Private deployment version 2; root, signed session, export, D1 binding, and worker-error checks in `operator-readiness-receipt.json` | Complete for operator use |
| Neutral participant URL | Runtime study ID, sample names, client payload, and content are neutral. The current host-generated URL contains the method name and is owner-only. A custom domain or DNS change is not required; any neutral participant URL is valid | Not achieved |
| Twenty eligible outside-rater completions | Live operator export contains zero response rows | Not achieved |
| Frozen statistical analysis | Eleven executable tests cover pass, both core failure modes, assignments, privacy, integrity flags, and exact reproduction from de-identified rows | Implementation verified, measured analysis pending |
| Publish-either-way evidence bundle | Analyzer emits public rows, unsealed manifest, support files, public and sealed integrity reports, exact reproduction command, recalibration inputs, and a SHA-256 package manifest | Implementation verified, real bundle pending |
| Skill recalibration from observed failures | The analyzer produces direction-linked sample failures and deterministic recurring AI-yes terms | Pending measured results |

## Current conclusion

Study A is generation-complete and operator-ready. It is not external
validation. The remaining empirical work is a neutral participant URL,
twenty eligible outside-rater completions, frozen analysis, publication either
way, and rule-level recalibration followed by a new replication.
