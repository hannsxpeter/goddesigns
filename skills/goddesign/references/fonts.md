# Font Pairings

12 pairings, indexed 0-11. Use when the reroll rule or the brief forces a type swap; otherwise the direction row's type stands. All pairs are on Google Fonts; the import lines are safe to copy.

Weight rule: contrast comes from extremes. Pair 100-300 against 700-900, not 400 against 600.

| # | Display (weight) | Body (weight) | Register |
|---|---|---|---|
| 0 | Fraunces 700-900 (opsz high) | Lora 400 | warm editorial |
| 1 | Newsreader 600 | Literata 400 | journal, longform |
| 2 | Libre Baskerville 700 | Source Sans 3 400 | classic, trustworthy |
| 3 | Bodoni Moda 500-700 | Manrope 300-500 | luxury, fashion |
| 4 | Gloock 400 | DM Sans 400 | soft modern serif |
| 5 | Bricolage Grotesque 700-800 | IBM Plex Sans 400 | characterful tech |
| 6 | Space Mono 700 (display) | Space Grotesk 400 (body) | studio, roles swapped |
| 7 | Instrument Serif 400 (large only) | Instrument Sans 400 | elegant contrast |
| 8 | Archivo Black 400 | Archivo 400 | poster, loud |
| 9 | Darker Grotesque 800 | Jost 400 | tall modernist |
| 10 | Unbounded 600-800 | Plus Jakarta Sans 400 | techno display |
| 11 | Syne 700-800 | DM Sans 400 | art-adjacent |

Import URL pattern (adjust family and weights):
`https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=Lora:wght@400;500&display=swap`

Mono as a third utility face is a recognized AI tell when used as a reflex offset (tiny mono kickers, dates, or tags under big display type). Reserve monos (JetBrains Mono, IBM Plex Mono, Space Mono, Fira Code) for directions where mono is the concept (Industrial, Terminal Core, Lo-Fi Riso, Data-Dense) and for genuinely technical content: code samples and tabular numerals. Everywhere else, build labels from the body family: 600-700 weight, uppercase, +8-12% tracking, smaller size.

## Availability warnings for literal execution

- Satoshi, Clash Display, Cabinet Grotesk, and General Sans are NOT on Google Fonts (they are Fontshare). Do not emit a fonts.googleapis.com import for them; the request fails with HTTP 400 and the page silently falls back to a system font. Use them only if you verify a working Fontshare URL; otherwise pick from the table.
- "Self-contained page" or "single HTML file" does NOT mean skip webfonts. A Google Fonts link tag is fine in a single file. Only a hard offline requirement removes webfonts, and then you must state the fallback stack you chose.
- Note on pair 6: Space Grotesk is allowed ONLY in this role-swapped pairing (mono display over grotesk body). As a default display face it is banned.
