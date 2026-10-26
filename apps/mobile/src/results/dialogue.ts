export type ProseSegment = { kind: 'narration' | 'dialogue'; text: string };

export function splitDialogueSegments(value: string): ProseSegment[] {
  return value
    .split(/([“"][^”"\n]+[”"])/gu)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({
      kind: /^[“"]/u.test(text) && /[”"]$/u.test(text) ? 'dialogue' : 'narration',
      text,
    }));
}

export function separateDialogueParagraphs(value: string) {
  return value
    .replace(/([“"][^”"\n]+[”"])/gu, '\n\n$1\n\n')
    .replace(/[ \t]*\n[ \t]*/gu, '\n')
    .replace(/\n{3,}/gu, '\n\n')
    .trim();
}
