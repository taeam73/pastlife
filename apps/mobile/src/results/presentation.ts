type Highlight = { id: string; title: string; summary: string; detail: string };

export type PresentedChapter = {
  id: string;
  shortTitle: string;
  lead: string;
  body: string;
  closingLine: string;
};

const chapterTitles: Record<string, string> = {
  KEY_RELATIONSHIP: '만남',
  DECISIVE_EVENT: '시련',
  LIFE_LEGACY: '선택',
  PRESENT_ECHO: '지금',
};

function compact(value: string, max: number) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1).replace(/[,、。.!?]?[一-龥ぁ-んァ-ン가-힣A-Za-z0-9 ]*$/, '').trim();
  return `${cut || clean.slice(0, max - 1).trim()}…`;
}

export function presentHeadline(value: string) { return compact(value, 42); }
export function presentIdentity(value: string) { return compact(value, 72); }

export function presentChapters(highlights: Highlight[]): PresentedChapter[] {
  const order = ['KEY_RELATIONSHIP', 'DECISIVE_EVENT', 'LIFE_LEGACY', 'PRESENT_ECHO'];
  return order.map((id) => highlights.find((item) => item.id === id)).filter((item): item is Highlight => Boolean(item)).map((item) => ({
    id: item.id,
    shortTitle: chapterTitles[item.id] ?? compact(item.title, 12),
    lead: compact(item.summary, 58),
    body: compact(item.detail, 140),
    closingLine: `이 장면은 지금의 당신에게 ${compact(item.summary, 32)}라는 흔적을 남겼습니다.`,
  }));
}
