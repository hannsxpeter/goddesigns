# Study A execution protocol

Status: frozen before corpus generation and before any rater response.

Study ID: `goddesign-study-a-2026-07`

Non-analytic amendment, 2026-07-23 before any participant response: replaced
"anonymous" with the more accurate "de-identified," removed collection of the
unneeded user-agent hash, and clarified the exported-data boundary. The corpus,
assignment, outcomes, coding, statistical tests, margins, exclusions, and
publication rules did not change.

Control-quality amendment, 2026-07-23 before any participant response: the
frozen B05 root URL redirected to an online workshop catalog rather than a
conference page. It was replaced with the live SmashingConf Freiburg 2026 page
from the same organization and category. B03 and B07 were recaptured after
deterministic cookie-overlay dismissal. The B08 corporate hotel-group home page
was replaced with The Lakeside Motel, a live single-property site in the brief's
exact Prince Edward County location and lakeside category. No generated page,
outcome, assignment, statistical test, margin, exclusion, or publication rule
changed.

Capture clarification, 2026-07-23 before any participant response: cookie and
marketing overlays are dismissed before human-control screenshots, with the
matched selector recorded in capture provenance. This removes an arm-specific
network-timing cue and does not alter underlying page design.

Blinding amendment, 2026-07-23 before any participant response: the internal
protocol ID remains `goddesign-study-a-2026-07`, while every participant-visible
runtime payload uses the neutral ID `website-perception-study-2026-07`. The
internal method name appears only in sealed operator materials until scoring
closes. Outcomes, assignments, margins, exclusions, and tests did not change.

Generation-isolation amendment, 2026-07-23 before any participant response: an
initial B04 baseline invented a repository URL containing the method name after
running beneath the method repository's filesystem path. That artifact and all
other baselines made under a method-revealing path were superseded. Every
baseline is regenerated in a neutral temporary working directory, checked for
method markers, and copied into the evidence tree only after that check passes.
Skill runs still use isolated method directories because method access defines
that arm. Briefs, hosts, models, effort, outcomes, assignments, margins,
exclusions, and tests did not change.

Publication-integrity amendment, 2026-07-23 before any participant response:
the analyzer now accepts its own de-identified public rows as a reproduction
input, emits the exact reproduction command and a SHA-256 publication manifest,
and keeps private submission IDs only in a sealed integrity file. The public
integrity report uses de-identified flag IDs. Possible automation is flagged,
but never excluded, when completion takes less than 90 seconds, total recorded
dwell is less than 30 seconds, or all fifteen answers and dwell values are
identical. Recurring recalibration terms are descriptive lowercase words and
two-word phrases that appear in at least two goddesign AI-yes reasons, counted
at most once per response. These additions close reproducibility, privacy, and
reporting gaps. They do not change the corpus, assignments, outcomes, coding,
statistical tests, margins, exclusions, or publication rule.

Distribution clarification, 2026-07-23 before any participant response: a
neutral participant URL is required for blinding, but no specific hosting
provider, custom domain, or DNS change is required. Any URL and access path are
valid when every participant-visible part is neutral and all eligible raters
can reach it. This changes no outcome, assignment, test, margin, exclusion, or
publication rule.

## Question

Do eligible outside raters identify goddesign output as AI-made at a rate equivalent to matched human-built pages, and lower than unskilled same-model baselines?

## Matched corpus

The corpus has ten matched brief triplets. Each triplet contains:

1. One goddesign page.
2. One unskilled baseline page made by the same host and model from the same brief.
3. One live human-built page in the same product category.

Five generated pairs run on Codex with `gpt-5.6-sol` at `xhigh`. Five run on Claude Code with `claude-fable-5` at `xhigh`. The fixed briefs, host assignments, human control URLs, capture viewport, and freeze time are in `briefs.json`.

The generated brief asks for a single-file `index.html`. Baseline runs receive the product brief and an explicit instruction to skip installed design skills, with no tell catalog, study hypothesis, or goddesign material. Skill runs invoke goddesign normally. Each run is isolated in its own working directory. Skill pages must pass the boolean gate and measured audit before packing. Any operator audit fix is recorded.

Human controls must be live production sites, not gallery mockups or AI-site showcases. The capture record stores the source URL, final URL after redirects, capture time, page title, HTTP status when available, generator metadata when present, and a SHA-256 digest. A control with generator metadata naming an AI site builder is replaced before packing.

All thirty pages are captured at 1280 by 900 with a full-page screenshot. HTML and screenshot artifacts are retained. Raters see screenshots only, inside one neutral viewer, so live-site network behavior, cookie banners, hover behavior, and file structure cannot reveal an arm.

## Anonymization and integrity

`scripts/study-a-pack.mjs` validates all ten triplets, requires exactly ten samples per arm, requires host matching inside every generated pair, requires ten distinct goddesign direction rows, removes method-revealing comments from generated HTML without deleting surrounding CSS, assigns random sample IDs, copies paired screenshots, and records SHA-256 digests in a sealed manifest.

The public pack contains random sample IDs, screenshots, rater instructions, and a balanced assignment plan. It contains no arm, host, model, source path, brief identifier, or direction label. The sealed manifest stays out of the public repository until scoring closes.

The participant runtime uses the neutral public study ID
`website-perception-study-2026-07`. Its distributed URL must also be neutral:
no method name, skill name, arm label, or study hypothesis may appear in the
hostname, path, query, fragment, or access interstitial. This is platform
agnostic and does not require a custom domain or DNS change. Any neutral
participant URL is valid. A host-generated URL that contains the method name is
an operator preview only and must not be sent to raters.

## Raters and assignment

Eligibility:

- Not the author or maintainer.
- Has never read the goddesign direction deck or Banned list.
- Is at least 18 years old.
- Gives informed consent to a de-identified design-perception study.

The target is twenty completed eligible raters. Forty assignment slots are generated as two balanced waves of twenty, allowing a second full wave if the first study needs replication. Each rater scores fifteen samples: five goddesign, five baseline, and five human. A rater never sees both generated versions of the same brief. Each balanced wave gives every sample exactly ten ratings.

The rater interface records no name, email, or user-agent string. It records an opaque assignment token, sample ID, answer order, AI verdict, appeal, trust, prior familiarity, optional reason, dwell time, eligibility confirmations, consent time, and completion time. In this protocol, de-identified means that direct identifiers are not collected and the exported responses exclude the token hash; it does not claim that ratings are not research data. A replacement participant uses the same assignment slot with a new token. The analysis accepts the first complete eligible response for each of slots 1-20 and rejects duplicates.

Per sample:

1. AI-made? `yes`, `no`, or `unsure`.
2. Appeal from 1 to 5.
3. Trust from 1 to 5, defined as willingness to give the page an email address.
4. Prior familiarity with this exact site: `yes` or `no`.
5. Optional short reason for the AI verdict.

Prior familiarity is descriptive metadata. It never excludes a response or
changes the frozen core tests. Arm-level and sample-level familiarity rates
publish so recognition of a live human control is visible as a confound.

Measurement amendment, 2026-07-23 before any participant response: added the
descriptive prior-familiarity item because recognizable live controls could
otherwise create an unmeasured recognition advantage. Core outcomes, coding,
assignments, margins, exclusions, and tests did not change.

## Frozen analysis

Primary identification coding is `yes = 1`, `no = 0`, and `unsure = 0`. This answers whether the rater positively identified the sample as AI-made. A sensitivity analysis codes `yes or unsure = 1`.

Because every rater scores all three arms, analysis is paired at the rater level. For each rater, calculate the mean identification rate within each arm.

The core claim holds only when both tests pass:

1. Equivalence: the goddesign minus human paired rate difference is inside the pre-registered absolute margin of 0.15. Two one-sided paired randomization tests must both have `p < 0.05`. The 90% rater-cluster bootstrap interval is reported as an effect-size check.
2. Superiority over baseline: the baseline minus goddesign paired rate difference is greater than zero with a one-sided paired randomization test at `p < 0.05`.

The core claim fails when goddesign is not equivalent to human or is not below baseline. A non-significant difference is not interpreted as equivalence.

Appeal, trust, and prior familiarity are descriptive. A goddesign trust mean below the human mean reopens Credibility work. The report includes arm counts, rates, paired differences, confidence intervals, familiarity rates, sample-level rates, and recurring optional reasons. De-identified selected rows and the analysis command publish either way after scoring closes.

## Stop and exclusion rules

- Enrollment stops when assignment slots 1-20 each have one complete eligible response.
- A participant who does not complete all fifteen samples is excluded and replaced in the same slot.
- A participant who fails an eligibility confirmation is excluded before viewing samples.
- Duplicate submissions for a slot are retained in the sealed operator export but only the first complete eligible submission is primary.
- There is no outlier removal based on ratings or dwell time.
- Automation, impossible timestamps, or malformed responses are flagged in the integrity report. They are not silently deleted.

## Publication rule

Results publish whether the claim holds or fails. Publication includes this frozen protocol, fixed briefs, corpus provenance, rater instructions, sealed manifest after close, de-identified row-level CSV, machine-readable analysis JSON, analysis report, and exact commands. The operator export with precise timestamps and private submission IDs remains sealed. The public row file contains every selected rating, optional reason, and dwell time, with rater slots renamed and direct timing fields removed.

Privacy amendment, 2026-07-23 before any participant response: this publication
boundary replaces the earlier promise to publish the operator export. It keeps
every primary analysis row reproducible while preventing precise timestamps
from becoming an indirect identifier. The statistical selection and tests are
unchanged.
