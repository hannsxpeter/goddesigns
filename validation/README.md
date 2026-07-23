# Validation

This directory contains the empirical record for goddesign. Material is grouped by purpose so published evidence, repeatable methods, bounded experiments, comparative runs, and active studies do not get mixed together.

## Directory map

- [`research/`](research/) contains sourced evidence reviews and mechanism evaluations.
- [`protocols/`](protocols/) contains repeatable and pre-registered validation methods.
- [`experiments/`](experiments/) contains bounded mechanism tests. Each dated folder keeps its report as `README.md` beside its artifacts.
- [`runs/`](runs/) contains comparative render runs. Each dated folder is a self-contained record with its report and outputs.
- [`studies/`](studies/) contains full evidence programs, including inputs, public receipts, and completion audits.
- [`tools/`](tools/) contains validation-specific command-line entry points.

## Current evidence program

- [External validation protocol](protocols/external-validation-protocol.md)
- [Study A frozen protocol](studies/study-a-2026-07/protocol.md)
- [Study A completion audit](studies/study-a-2026-07/completion-audit.md)
- [Public sentiment evidence](research/sentiment-evidence-2026-07.md)
- [Kilnhouse comparative run](runs/kilnhouse-2026-07/README.md)

## Conventions

- Dated units use `name-YYYY-MM`.
- A dated experiment or run uses `README.md` as its entry point.
- Public protocols, metadata, receipts, and audits are tracked.
- Study `work/` and `sealed/` directories stay ignored because they contain generated working data or sensitive runtime material.
- Captured provenance is immutable. Historical transcripts inside ignored working directories can retain the absolute paths that existed when the run occurred.
