# Study A rater

De-identified collection application for `goddesign-study-a-2026-07`.

The app serves fifteen arm-blinded full-page captures per signed invitation,
collects eligibility and consent, saves each response to D1, resumes incomplete
sessions, and exports an operator CSV through a separate server secret. It does not
collect names, email addresses, or user-agent strings.

## Data flow

1. Build and pack the thirty-sample corpus from the repository root.
2. Run `scripts/study-a-sync-rater.mjs` to copy the public sample index,
   assignment plan, and blinded PNG files into this project.
3. Set `STUDY_ASSIGNMENT_SECRET` and `STUDY_EXPORT_SECRET` in the production
   runtime.
4. Build and deploy.
5. Generate signed participant links with `scripts/study-a-links.mjs`.
6. Export the sealed operator CSV from `/api/export` with the export secret.
7. Run `scripts/study-a-analyze.mjs` from the repository root. It writes the
   de-identified rows, reproducible statistical result, public and sealed
   integrity reports, exact re-analysis command, recalibration inputs, and
   SHA-256 publication manifest.

## Local commands

```sh
npm install
npm run dev
npm run lint
npm test
```

Local development accepts `#token=dev.1` only when a complete assignment plan
has been synced. Production never accepts development tokens.
