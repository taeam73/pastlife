export function paginateText(value: string, limit: number): string[] {
  const text = value.replace(/\s+/gu, ' ').trim();
  if (!text) return [];
  const sentences = text.split(/(?<=[.!?。…])\s+/u);
  const pages: string[] = [];
  let page = '';
  for (const sentence of sentences) {
    const combined = page ? `${page} ${sentence}` : sentence;
    if (Array.from(combined).length <= limit) {
      page = combined;
      continue;
    }
    if (page) {
      pages.push(page);
      page = '';
    }
    if (Array.from(sentence).length <= limit) {
      page = sentence;
      continue;
    }
    const words = sentence.split(' ');
    for (const word of words) {
      const next = page ? `${page} ${word}` : word;
      if (Array.from(next).length > limit && page) {
        pages.push(page);
        page = word;
      } else {
        page = next;
      }
    }
  }
  if (page) pages.push(page);
  return pages;
}
