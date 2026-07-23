# Study A completion audit

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
