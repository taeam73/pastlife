type Highlight = { id: string; title: string; summary: string; detail: string };

export type PresentedChapter = {
  id: string;
  shortTitle: string;
  lead: string;
  body: string;
  imageUri: string;
  crop: { focusX: number; focusY: number; zoom: number };
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

export function presentChapters(highlights: Highlight[], backgroundImage = ''): PresentedChapter[] {
  const order = ['KEY_RELATIONSHIP', 'DECISIVE_EVENT', 'LIFE_LEGACY', 'PRESENT_ECHO'];
  const crops = [
    { focusX: 0.22, focusY: 0.5, zoom: 1.55 },
    { focusX: 0.46, focusY: 0.32, zoom: 1.55 },
    { focusX: 0.68, focusY: 0.62, zoom: 1.55 },
    { focusX: 0.84, focusY: 0.45, zoom: 1.55 },
  ];
  return order.map((id) => highlights.find((item) => item.id === id)).filter((item): item is Highlight => Boolean(item)).map((item, index) => ({
    id: item.id,
    shortTitle: chapterTitles[item.id] ?? compact(item.title, 12),
    lead: item.summary.trim(),
    body: item.detail.trim(),
    imageUri: backgroundImage,
    crop: crops[index]!,
  }));
}
