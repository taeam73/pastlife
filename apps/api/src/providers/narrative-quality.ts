export type NarrativeQualityReport = {
  repeatedSentences: string[];
  repeatedPhrases: string[];
  overlongParagraphs: number;
  score: number;
};

function normalize(value: string) {
  return value.replace(/\s+/gu, ' ').trim().replace(/[.!?]+$/u, '');
}

function sentences(body: string) {
  return body.split(/(?<=[.!?])\s+/u).map(normalize).filter((value) => value.length > 12);
}

export function inspectNarrative(body: string): NarrativeQualityReport {
  const all = sentences(body);
  const counts = new Map<string, number>();
  for (const sentence of all) counts.set(sentence, (counts.get(sentence) ?? 0) + 1);
  const repeatedSentences = [...counts.entries()].filter(([, count]) => count > 1).map(([sentence]) => sentence);
  const repeatedPhrases = ['사람들은 기억', '당신은 선택', '오래 남', '곁의 사람'].filter((phrase) => (body.match(new RegExp(phrase, 'gu')) ?? []).length > 2);
  const overlongParagraphs = body.split(/\n\n+/u).filter((paragraph) => paragraph.length > 520).length;
  const penalty = repeatedSentences.length * 12 + repeatedPhrases.length * 8 + overlongParagraphs * 15;
  return { repeatedSentences, repeatedPhrases, overlongParagraphs, score: Math.max(0, 100 - penalty) };
}

export function editNarrative(body: string, maxParagraphs = 4) {
  const paragraphs = body.split(/\n\n+/u).filter(Boolean);
  const selected = paragraphs.length > maxParagraphs ? [...paragraphs.slice(0, maxParagraphs - 1), paragraphs.at(-1)!] : paragraphs;
  const seen = new Set<string>();
  return selected.map((paragraph) => paragraph
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => {
      const key = normalize(sentence);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6)
    .join(' ')).join('\n\n');
}
