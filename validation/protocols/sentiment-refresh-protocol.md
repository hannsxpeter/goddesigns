# Sentiment refresh protocol

How to re-run the public-sentiment study that produced sentiment-evidence-2026-07.md, so the tells catalog stays living. Run it quarterly, or whenever a new tell is suspected ("every goddesign site has X" appearing in discourse is the trigger that matters most). Bans redirect attractors; only fresh evidence shows where the probability mass went.

## 1. Collect

Fan out web research agents across niches, one agent per niche, each returning structured JSON (quote, theme, platform, url, author) in four buckets: claude_positive, claude_negative, codex_positive, codex_negative (positive/negative about FRONTEND/UI design specifically, not coding speed).

Niches that produced signal in 2026-07: Hacker News via the Algolia API (the richest vein by far; roughly 85 percent of usable quotes), subreddits (ClaudeAI, ClaudeCode, ChatGPTCoding, OpenAI, webdev, cursor, vibecoding), X, comparison blogs and newsletters, Dev.to, YouTube, the "AI slop" discourse, designer communities.

Key retrieval endpoints:
- `https://hn.algolia.com/api/v1/search?query=<terms>&tags=comment` returns JSON with real comment_text; source URL is `https://news.ycombinator.com/item?id=<objectID>`.
- Reddit: append `.json` to thread URLs; `https://www.reddit.com/search.json?q=<terms>`.

Anti-fabrication rules are non-negotiable: only quotes that actually appear in fetched content, every quote carries a real URL, drop anything uncertain. Then dedupe (normalized text plus containment) and follow with gap-fill rounds targeting whichever bucket is under target.

## 2. Verify

Never trust collector output. For HN quotes, fetch `https://hacker-news.firebaseio.com/v0/item/<id>.json` and require the quote's squashed text (lowercase alphanumeric, ellipsis-split fragments) to appear in the item's text, and the author to match. For failures, token-overlap (stopword-stripped containment at 0.85 or higher) distinguishes paraphrase-at-correct-link from wrong-link; search Algolia for the true source of the latter. Fetch non-HN pages and require 0.8 word containment. Drop what cannot be confirmed; report the verbatim/paraphrase/corrected/dropped tally honestly. The 2026-07 run: 220 verbatim, 67 paraphrase, 12 link-corrected, 47 non-HN verified, 1 dropped, of 347.

## 3. Cluster

Three independent passes over the verified dataset, each also reading the current SKILL.md so it marks clusters as already-covered, partial, or new: (a) claude_negative into named anti-patterns, (b) codex_negative into named anti-patterns, (c) both positive buckets into praise vocabulary usable as gate criteria. Each cluster: exact supporting count, up to 4 verbatim quotes with URLs, and one ACTIONABLE testable rule (a bannable value, a numeric floor, or a yes/no gate assertion). Adversarially adjudicate any proposed rule before encoding it.

## 4. Encode

The convention (from the claude-design-tells memory): every confirmed new tell lands in three places, plus a deck check.

1. The DIVERGE lane's reroll attractor list in SKILL.md.
2. The Banned list, each entry with an INSTEAD that points back into the seeded deck, never at a specific alternative look (an INSTEAD naming look Y mints the Y-cliche).
3. The QA gate: a greppable string or a yes/no assertion in checklist.md.
4. Deck check: grep the reference decks for rows embodying the new tell; a row where the pattern is the stated concept is a legal "direction states it" exception, anything else gets fixed.

Only encode patterns with real counted evidence. Skip clusters that are out of scope (tool-UI complaints), too thin (under 3 independent sources), or subjective without a testable property. Record everything, including what was skipped and why, in a dated evidence file in validation/ with source URLs, and update the claude-design-tells memory.

## 5. Validate

After encoding, run the standard proof: baselines without the skill (expect the new tells to appear), skill runs on both hosts (expect clean gates), two same-brief runs on the DIVERGE lane (expect zero shared ledger axes), screenshots via the Phase 3 renderer chain, defects reported honestly. Evidence goes in validation/ next to the previous rounds.
