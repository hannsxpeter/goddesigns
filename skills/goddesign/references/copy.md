# Copy review

Load this file after the visible copy exists and before the QA gate. The goal is
copy that tells the reader what the product does, what an action will do, and
what evidence supports a claim. This is a quality pass, not an authorship
detector. Never claim that passing it proves a person wrote the text.

## Choose the mode by block

A page can use both modes. Choose from the job of each block, not from the page
as a whole.

**Transactional copy** covers controls, forms, errors, empty states, status, and
navigation. Predictability wins. Name the action ("Save changes"), explain what
failed, and give the next useful step. Personality must never obscure behavior.

**Marketing copy** covers headlines, positioning, feature explanations, proof,
and calls to action. Specificity and a point of view matter. Name the mechanism,
observable result, or real example behind each claim. Vary sentence length when
the brief permits it, but do not manufacture facts, certainty, or conflict to
make the prose sound lively.

User-supplied terminology, legal text, brand voice, and factual constraints
remain authoritative in both modes.

## The four-pass review

1. **Scan.** Run the source sweep and read its copy advisories. Then look for
   vague attribution, filler, formulaic contrasts or conclusions, puffery,
   forced groups of three, synonym cycling, false ranges, and dense sentences.
2. **Rewrite.** Preserve meaning and the intended tone. Replace a vague claim
   with its source or mechanism. Delete it when neither exists. Use the same
   noun twice when repetition is clearer than cycling through synonyms.
3. **Restore voice.** Transactional copy stays plain and consistent. Marketing
   copy may carry an opinion, acknowledge a real tradeoff, and vary its rhythm.
   Voice comes from a precise stance and subject knowledge, not decorative
   slang, deliberate errors, or random informality.
4. **Self-audit.** Ask what still sounds generated. For every sentence, name
   the instruction, fact, mechanism, result, or example it gives the reader. If
   the sentence could move unchanged to an unrelated product, rewrite or cut
   it. If a reader could reasonably ask "according to whom?", name the source
   or remove the attribution.

## Judgment boundaries

- The sweep's `vague-attribution`, `filler-copy`, and `formulaic-copy` findings
  are advisories. Read each in context, then fix it or state why it is precise.
- Do not maintain a universal blacklist of vocabulary. Terms such as
  "surface", "primitive", or "modality" can be exact in technical copy.
- Prefer active voice and shorter sentences when they clarify the actor or the
  action. Passive voice, parentheses, adverbs, and repeated nouns remain legal
  when they are the clearest choice.
- Do not introduce mistakes, ambiguity, inaccessible labels, or uneven product
  terminology to make copy appear human.
- A substantial copy change after screenshots were taken can change wrapping,
  height, and responsive behavior. Re-run the full gate after such a change.
