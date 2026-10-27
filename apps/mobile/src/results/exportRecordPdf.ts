import { resolveLibraryImage } from './libraryImages';
import { localeText, translate, type Locale } from '../i18n/locale';

type Chapter = { id: 'MEETING' | 'TRIAL' | 'CHOICE' | 'NOW'; title: string; body: string; profilePages?: { title: string; body: string }[] | undefined };
export type PdfRecord = {
  locale?: Locale;
  resultId: string;
  recordNo: number;
  name: string;
  cover: { era: string; place: string; role: string; birthYear: string; deathYear: string; lifeLine: string };
  backgroundUri: string;
  characterUri: string | null;
  chapters: Chapter[];
  finalMoment: { year: string; place: string; scene: string; afterword: string; illustrationUri: string };
};

const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;
const PAPER = '#f5ecd8';
const INK = '#32271c';
const MARGIN = 105;

function canvasPage() {
  const canvas = document.createElement('canvas');
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('PDF drawing surface is unavailable');
  context.fillStyle = PAPER;
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  return { canvas, context };
}

function imageSource(uri: string) {
  const mapped = resolveLibraryImage(uri) ?? (/^https?:\/\//u.test(uri) ? { uri } : undefined);
  const selected = Array.isArray(mapped) ? mapped[0] : mapped;
  return selected && typeof selected === 'object' && 'uri' in selected ? selected.uri : undefined;
}

async function loadImage(uri: string) {
  const src = imageSource(uri);
  if (!src) throw new Error(`PDF image is not mapped: ${uri}`);
  const response = await fetch(src);
  if (!response.ok) throw new Error(`PDF image could not load: ${uri}`);
  return createImageBitmap(await response.blob());
}

async function loadBrandLogo() {
  const source = require('../../assets/branding/title-logo-plain.png') as { uri?: string } | string;
  const src = typeof source === 'string' ? source : source.uri;
  if (!src) throw new Error('PDF brand logo is not mapped');
  const response = await fetch(src);
  if (!response.ok) throw new Error('PDF brand logo could not load');
  return createImageBitmap(await response.blob());
}

function drawCoverImage(context: CanvasRenderingContext2D, image: ImageBitmap, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.width, height / image.height);
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.drawImage(image, x + (width - image.width * scale) / 2, y + (height - image.height * scale) / 2, image.width * scale, image.height * scale);
  context.restore();
}

function wrappedLines(context: CanvasRenderingContext2D, value: string, width: number) {
  const lines: string[] = [];
  for (const raw of value.split('\n')) {
    if (!raw.trim()) { lines.push(''); continue; }
    let line = '';
    for (const word of raw.split(/\s+/u)) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width <= width) { line = candidate; continue; }
      if (line) { lines.push(line); line = ''; }
      if (context.measureText(word).width <= width) { line = word; continue; }
      for (const character of Array.from(word.matchAll(/\P{M}\p{M}*|\p{M}+/gu), (match) => match[0])) {
        if (context.measureText(line + character).width > width && line) { lines.push(line); line = ''; }
        line += character;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawTextPageHeader(context: CanvasRenderingContext2D, title: string, locale: Locale) {
  context.fillStyle = '#796034';
  context.font = '600 29px MaruBuri, serif';
  context.fillText(localeText(locale, { ko: '전 생 록   ·   나의 전생 이야기', en: 'PAST LIFE ARCHIVE · MY STORY', th: 'บันทึกชาติก่อน · เรื่องราวของฉัน', ja: '前世録・私の物語' }), MARGIN, 105);
  context.fillRect(MARGIN, 135, PAGE_WIDTH - MARGIN * 2, 2);
  context.fillStyle = INK;
  context.font = 'bold 62px MaruBuri, serif';
  context.fillText(title, MARGIN, 238);
}

function newTextPage(title: string, pages: HTMLCanvasElement[], locale: Locale = 'ko') {
  const page = canvasPage();
  drawTextPageHeader(page.context, title, locale);
  pages.push(page.canvas);
  return { ...page, y: 325 };
}

function compactTextLayout(context: CanvasRenderingContext2D, title: string, body: string) {
  const startY = title.startsWith('03 ') ? 290 : 325;
  const candidates = title.startsWith('02 ')
    ? [{ fontSize: 30, lineHeight: 40 }, { fontSize: 29, lineHeight: 39 }, { fontSize: 28, lineHeight: 37 }]
    : [{ fontSize: 31, lineHeight: 44 }, { fontSize: 30, lineHeight: 42 }, { fontSize: 29, lineHeight: 40 }, { fontSize: 28, lineHeight: 38 }, { fontSize: 27, lineHeight: 36 }];
  const bottom = PAGE_HEIGHT - 120;
  const pageCount = ({ fontSize, lineHeight }: typeof candidates[number]) => {
    context.font = `${fontSize}px MaruBuri, serif`;
    let count = 1;
    let y = startY;
    for (const line of wrappedLines(context, body, PAGE_WIDTH - MARGIN * 2)) {
      if (y + lineHeight > bottom) { count += 1; y = startY; }
      y += line ? lineHeight : 34;
    }
    return count;
  };
  const initialCount = pageCount(candidates[0]!);
  return candidates.find((candidate) => pageCount(candidate) < initialCount) ?? candidates[0]!;
}

function drawSection(pages: HTMLCanvasElement[], title: string, body: string, initial?: { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D; y: number }, keepParagraphs = false, compact = false, locale: Locale = 'ko') {
  let page = initial ?? newTextPage(title, pages, locale);
  const startY = compact && title.startsWith('03 ') ? 290 : 325;
  if (!initial) page.y = startY;
  const layout = compact ? compactTextLayout(page.context, title, body) : undefined;
  const lineHeight = layout?.lineHeight ?? 52;
  const bottom = PAGE_HEIGHT - 120;
  const font = `${layout?.fontSize ?? 34}px MaruBuri, serif`;
  page.context.font = font;
  const paragraphs = keepParagraphs ? body.split(/\n\s*\n/u) : [body];
  for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
    const lines = wrappedLines(page.context, paragraph, PAGE_WIDTH - MARGIN * 2);
    const paragraphHeight = lines.reduce((height, line) => height + (line ? lineHeight : 34), 0);
    if (keepParagraphs && paragraphIndex > 0) page.y += 34;
    if (keepParagraphs && page.y + paragraphHeight > bottom && paragraphHeight <= bottom - 325) {
      page = newTextPage(`${title} · ${localeText(locale, { ko: '계속', en: 'continued', th: 'ต่อ', ja: '続き' })}`, pages, locale);
      page.y = startY;
      page.context.font = font;
    }
    for (const line of lines) {
      if (page.y + lineHeight > bottom) {
        page = newTextPage(`${title} · ${localeText(locale, { ko: '계속', en: 'continued', th: 'ต่อ', ja: '続き' })}`, pages, locale);
        page.y = startY;
        page.context.font = font;
      }
      if (line) {
        page.context.fillStyle = INK;
        page.context.fillText(line, MARGIN, page.y);
      }
      page.y += line ? lineHeight : 34;
    }
  }
}

function jpegBytes(canvas: HTMLCanvasElement) {
  const encoded = canvas.toDataURL('image/jpeg', 0.84).split(',')[1];
  if (!encoded) throw new Error('PDF page image could not be encoded');
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

// A PDF 1.4 image-page writer. The Korean text is rendered with the app font on
// the canvas; this web fallback preserves appearance but is not searchable text.
function createImagePdf(pages: HTMLCanvasElement[]) {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let length = 0;
  const add = (value: string | Uint8Array) => {
    const bytes = typeof value === 'string' ? encoder.encode(value) : value;
    chunks.push(bytes); length += bytes.length;
  };
  const begin = (number: number) => { offsets[number] = length; add(`${number} 0 obj\n`); };
  const end = () => add('\nendobj\n');
  add('%PDF-1.4\n%\x80\x81\x82\x83\n');
  begin(1); add('<< /Type /Catalog /Pages 2 0 R >>'); end();
  const pageRefs = pages.map((_, index) => `${5 + index * 3} 0 R`).join(' ');
  begin(2); add(`<< /Type /Pages /Count ${pages.length} /Kids [ ${pageRefs} ] >>`); end();
  pages.forEach((canvas, index) => {
    const image = jpegBytes(canvas);
    const imageObject = 3 + index * 3;
    const contentObject = imageObject + 1;
    const pageObject = imageObject + 2;
    begin(imageObject);
    add(`<< /Type /XObject /Subtype /Image /Width ${PAGE_WIDTH} /Height ${PAGE_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`);
    add(image); add('\nendstream'); end();
    const commands = 'q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n';
    begin(contentObject); add(`<< /Length ${encoder.encode(commands).length} >>\nstream\n${commands}endstream`); end();
    begin(pageObject); add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>`); end();
  });
  const xrefAt = length;
  const objectCount = pages.length * 3 + 3;
  add(`xref\n0 ${objectCount}\n0000000000 65535 f \n`);
  for (let number = 1; number < objectCount; number += 1) add(`${String(offsets[number]).padStart(10, '0')} 00000 n \n`);
  add(`trailer\n<< /Size ${objectCount} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`);
  return new Blob(chunks.map((chunk) => chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength) as ArrayBuffer), { type: 'application/pdf' });
}

export async function renderRecordPdf(record: PdfRecord) {
  const locale = record.locale ?? 'ko';
  if (record.chapters.length !== 4) throw new Error('Complete story chapters are required');
  await document.fonts.ready;
  const [background, character, finalArt, logo] = await Promise.all([
    loadImage(record.backgroundUri), record.characterUri ? loadImage(record.characterUri) : Promise.resolve(null), loadImage(record.finalMoment.illustrationUri), loadBrandLogo(),
  ]);
  const pages: HTMLCanvasElement[] = [];
  const coverPage = canvasPage();
  pages.push(coverPage.canvas);
  const { context } = coverPage;
  drawCoverImage(context, background, 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  const topShade = context.createLinearGradient(0, 0, 0, 320);
  topShade.addColorStop(0, 'rgba(10,16,25,0.8)');
  topShade.addColorStop(1, 'rgba(10,16,25,0)');
  context.fillStyle = topShade; context.fillRect(0, 0, PAGE_WIDTH, 320);
  if (locale !== 'ko') { context.fillStyle = '#f3d896'; context.font = 'bold 42px sans-serif'; context.fillText(locale === 'en' ? 'PAST LIFE ARCHIVE' : translate(locale, '전생록'), MARGIN, 112); }
  else context.drawImage(logo, MARGIN, 45, 360, 181);
  if (character) {
    const portraitScale = Math.min(860 / character.width, 1260 / character.height);
    context.drawImage(character, PAGE_WIDTH - character.width * portraitScale - 20, 110, character.width * portraitScale, character.height * portraitScale);
  }
  const shade = context.createLinearGradient(0, 820, 0, PAGE_HEIGHT);
  shade.addColorStop(0, 'rgba(10,16,25,0)');
  shade.addColorStop(0.45, 'rgba(10,16,25,0.88)');
  shade.addColorStop(1, 'rgba(10,16,25,0.98)');
  context.fillStyle = shade; context.fillRect(0, 820, PAGE_WIDTH, PAGE_HEIGHT - 820);
  context.fillStyle = '#f3d896'; context.font = 'bold 40px MaruBuri, serif';
  context.fillText(localeText(locale, { ko: `나의 ${record.recordNo}번째 전생 기록`, en: `My past life record No. ${record.recordNo}`, th: `บันทึกชาติก่อนของฉัน ลำดับ ${record.recordNo}`, ja: `私の第${record.recordNo}の前世記録` }), MARGIN, 1200);
  context.fillStyle = '#fff8ea'; context.font = 'bold 80px MaruBuri, serif';
  context.fillText(record.name, MARGIN, 1330);
  context.font = '34px MaruBuri, serif';
  const coverLines = wrappedLines(context, `${record.cover.birthYear}~${record.cover.deathYear}  ·  ${record.cover.era}  ·  ${record.cover.place}`, PAGE_WIDTH - MARGIN * 2);
  coverLines.forEach((line, index) => context.fillText(line, MARGIN, 1400 + index * 53));
  context.fillStyle = '#f2dcae'; context.font = '32px MaruBuri, serif';
  const lifeLines = wrappedLines(context, `${record.cover.role} · ${record.cover.lifeLine}`, PAGE_WIDTH - MARGIN * 2);
  lifeLines.slice(0, 4).forEach((line, index) => context.fillText(line, MARGIN, 1530 + index * 48));

  const sectionNumbers = ['01', '02', '03', '04'];
  record.chapters.forEach((chapter, index) => {
    if (index === 0 && chapter.profilePages?.length) {
      drawSection(pages, `${sectionNumbers[index]} ${chapter.title}`, chapter.profilePages.map((profile) => `${profile.title}\n${profile.body}`).join('\n\n'), undefined, false, false, locale);
    } else drawSection(pages, `${sectionNumbers[index]} ${chapter.title}`, chapter.body, undefined, false, index >= 1, locale);
  });

  const finalTitle = localeText(locale, { ko: '마지막 순간', en: 'The final moment', th: 'ช่วงสุดท้าย', ja: '最期の瞬間' });
  const afterTitle = localeText(locale, { ko: '전생록의 기록', en: 'From the archive', th: 'จากคลังบันทึก', ja: '前世録より' });
  const finalPage = newTextPage(finalTitle, pages, locale);
  drawCoverImage(finalPage.context, finalArt, MARGIN, 295, PAGE_WIDTH - MARGIN * 2, 650);
  drawSection(pages, finalTitle, `${record.finalMoment.year} · ${record.finalMoment.place}\n\n${record.finalMoment.scene}`, { ...finalPage, y: 1015 }, true, false, locale);
  const closingPage = newTextPage(afterTitle, pages, locale);
  drawSection(pages, afterTitle, record.finalMoment.afterword, { ...closingPage, y: 480 }, false, false, locale);
  pages.forEach((page, index) => {
    const pageContext = page.getContext('2d');
    if (!pageContext) return;
    pageContext.fillStyle = index === 0 ? '#f4db9e' : '#8b7045';
    pageContext.font = '27px MaruBuri, serif';
    pageContext.fillText(`${index + 1} / ${pages.length}`, PAGE_WIDTH - 205, PAGE_HEIGHT - 65);
  });
  return createImagePdf(pages);
}

export function downloadRecordPdf(blob: Blob, name: string, resultId: string, locale: Locale = 'ko') {
  const safeName = name.replace(/[^\p{L}\p{N}-]+/gu, '-').slice(0, 40) || '전생';
  const safeId = resultId.replace(/[^a-zA-Z0-9-]+/gu, '').slice(0, 60);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${locale === 'ko' ? '전생기록' : 'past-life-record'}-${safeName}-${safeId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 3000);
}
