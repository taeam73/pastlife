function paginatePlain(value: string, limit: number): string[] {
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
  // Avoid a final page containing only one short line when a preceding page
  // has several complete sentences that can be moved without splitting them.
  if (pages.length > 1) {
    const lastIndex = pages.length - 1;
    while (Array.from(pages[lastIndex]!).length < limit * 0.4) {
      const previous = pages[lastIndex - 1]!;
      const sentences = previous.split(/(?<=[.!?。…])\s+/u);
      if (sentences.length < 2) break;
      const moved = sentences.pop()!;
      const nextLast = `${moved} ${pages[lastIndex]}`;
      if (Array.from(nextLast).length > limit) break;
      pages[lastIndex - 1] = sentences.join(' ');
      pages[lastIndex] = nextLast;
    }
  }
  return pages;
}

export function paginateText(value: string, limit: number): string[] {
  if (!value.includes('\n')) return paginatePlain(value, limit);
  const pages: string[] = [];
  let current = '';
  const flush = () => {
    if (current.trim()) pages.push(current.trim());
    current = '';
  };
  let separator = '';
  for (const part of value.trim().split(/(\n{1,2})/u)) {
    if (!part) continue;
    if (part.startsWith('\n')) {
      separator = part;
      continue;
    }
    for (const sentence of part.trim().split(/(?<=[.!?。…])\s+/u)) {
      if (!sentence) continue;
      const chunks = paginatePlain(sentence, limit);
      for (const chunk of chunks) {
        let candidate = current ? `${current}${separator || ' '}${chunk}` : chunk;
        if (Array.from(candidate).length > limit && current) {
          flush();
          candidate = chunk;
        }
        current = candidate;
        separator = ' ';
      }
    }
  }
  flush();
  return pages;
}

export function paginateMemoryItems(value: string, itemsPerPage: number): string[] {
  const items = value.trim().split(/\n\n/u).filter(Boolean);
  const pages: string[] = [];
  for (let index = 0; index < items.length; index += itemsPerPage) {
    pages.push(items.slice(index, index + itemsPerPage).join('\n\n'));
  }
  return pages;
}
