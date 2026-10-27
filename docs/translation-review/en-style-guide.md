# English story translation guide

The Korean 3.0 catalog is the source of truth. English is an adaptation for readers, not a rewrite of plot, chronology, or scoring. Use the hashed source snapshots produced by `corepack pnpm translation:source` and check the source hash before reviewing a story.

## Voice

- Write clear, natural English a young reader can follow on the first read. Prefer concrete actions and objects to abstract lessons.
- Keep the archive narrator's short opening and closing around the episode. Do not add a claim that the reader literally lived this past life.
- Preserve suspense, humor, tenderness, and the cost of a choice. Do not turn a morally mixed character into a simple hero or villain.
- Keep dialogue distinct from narration. Preserve who speaks and who witnesses each moment.

## Story facts

- Make one glossary entry for each person's name, place, fictional calendar, role, and recurring object. Use the same English form in the profile, three episode paths, timeline, memories, final moment, PDF, and image description.
- Preserve the year, age, order of events, relationships, injuries, and manner of death. For fictional eras, retain the calendar name so the year is not mistaken for a Gregorian year.
- Translate every signal path independently. Keep the shared beginning and ending intact, and preserve what the selected response changes.
- In historically grounded stories, translate established place and political names accurately; do not add historical claims that the Korean source does not make.
- Do not invent a first-person quotation for a non-human protagonist that cannot speak in the Korean source.

## Structure and QA

- Keep story IDs, question and choice IDs, signal keys, image URIs, and numeric ages unchanged.
- Keep profile-page order, timeline-entry order, memory-entry order, and paragraph breaks. Do not hide omissions with a summary.
- Check numbers and named entities against the source. Search for Hangul in English fields and for empty strings, then read the full English story from the beginning.
- Verify the longest of the three episode paths at 320px and tablet width. Check the profile, chronology, memories, final moment, PDF, and share image separately because they use different layouts.
- Record each story's source hash, translator pass, source-comparison pass, visual check, and unresolved issues before marking it ready.
