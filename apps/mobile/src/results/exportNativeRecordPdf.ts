import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { resolveLibraryImage } from './libraryImages';
import { discardStoryArtworkFile, ensureStoryArtworkFile } from './storyArtworkCache';
import type { PdfRecord } from './exportRecordPdf';
import { localeText, translate } from '../i18n/locale';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/gu, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);
}

function paragraphs(value: string) {
  return value.split(/\n\s*\n/u).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/gu, '<br>')}</p>`).join('');
}

function validatedImageDataUri(base64: string) {
  const mimeType = base64.startsWith('/9j/') ? 'image/jpeg'
    : base64.startsWith('iVBORw0KGgo') ? 'image/png'
    : base64.startsWith('UklGR') ? 'image/webp'
    : null;
  if (!mimeType) throw new Error('Downloaded PDF artwork is not a supported image');
  return `data:${mimeType};base64,${base64}`;
}

function encodeBase64(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let encoded = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index]!;
    const b = bytes[index + 1];
    const c = bytes[index + 2];
    encoded += alphabet[a >> 2];
    encoded += alphabet[((a & 3) << 4) | ((b ?? 0) >> 4)];
    encoded += b === undefined ? '=' : alphabet[((b & 15) << 2) | ((c ?? 0) >> 6)];
    encoded += c === undefined ? '=' : alphabet[c & 63];
  }
  return encoded;
}

async function fileImageDataUri(file: File): Promise<string> {
  try {
    return validatedImageDataUri(await file.base64());
  } catch (nativeError) {
    try {
      return validatedImageDataUri(encodeBase64(await file.bytes()));
    } catch (fallbackError) {
      throw new Error(`Could not read saved artwork: native=${String(nativeError)}; bytes=${String(fallbackError)}`);
    }
  }
}

export async function assetDataUri(module: number | string): Promise<string | null> {
  const asset = await Asset.fromModule(module).downloadAsync();
  const localUri = asset.localUri ?? asset.uri;
  // Android can expose a bundled drawable by its resource name (for example,
  // "titlelogoplain") instead of a readable file URI. The cover has a text
  // wordmark for that case; a decorative logo must not block the whole PDF.
  if (!localUri || !/^file:\/\//u.test(localUri)) return null;
  try {
    return await fileImageDataUri(new File(localUri));
  } catch {
    return null;
  }
}

async function storyImage(uri: string) {
  const mapped = resolveLibraryImage(uri) ?? (/^https:\/\//u.test(uri) ? { uri } : undefined);
  const selected = Array.isArray(mapped) ? mapped[0] : mapped;
  if (typeof selected === 'number') {
    const image = await assetDataUri(selected);
    if (image) return image;
    throw new Error(`PDF illustration is not readable: ${uri}`);
  }
  if (selected && typeof selected === 'object' && 'uri' in selected && selected.uri) {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const file = await ensureStoryArtworkFile(uri);
        return await fileImageDataUri(file);
      } catch (error) {
        lastError = error;
        if (attempt < 2) {
          await discardStoryArtworkFile(uri);
          await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
        }
      }
    }
    throw lastError;
  }
  throw new Error(`PDF illustration is not mapped: ${uri}`);
}

export type NativeRecordPdfArtwork = { logo: string | null; background: string; character: string | null; finalArt: string };

async function namedArtwork(name: string, task: Promise<string>): Promise<string> {
  try {
    return await task;
  } catch (error) {
    throw new Error(`Could not prepare PDF ${name}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}

export async function prepareNativeRecordPdfArtwork(record: PdfRecord): Promise<NativeRecordPdfArtwork> {
  if (record.chapters.length !== 4) throw new Error('Complete story chapters are required');
  const logo = (record.locale ?? 'ko') === 'ko' ? await assetDataUri(require('../../assets/branding/title-logo-plain.png') as number) : null;
  const background = await namedArtwork('background', storyImage(record.backgroundUri));
  const character = record.characterUri ? await namedArtwork('character', storyImage(record.characterUri)) : null;
  const finalArt = await namedArtwork('final scene', storyImage(record.finalMoment.illustrationUri));
  return { logo, background, character, finalArt };
}

export async function shareNativeRecordPdf(record: PdfRecord, artwork: NativeRecordPdfArtwork): Promise<void> {
  const locale = record.locale ?? 'ko';
  if (!await Sharing.isAvailableAsync()) throw new Error('File sharing is unavailable on this device');
  const { logo, background, character, finalArt } = artwork;
  const cover = record.cover;
  const chapterHtml = record.chapters.map((chapter, index) => {
    const number = String(index + 1).padStart(2, '0');
    const content = index === 0 && chapter.profilePages?.length
      ? chapter.profilePages.map((page) => `<h3>${escapeHtml(page.title)}</h3>${paragraphs(page.body)}`).join('')
      : paragraphs(chapter.body);
    return `<section class="chapter"><h2>${number} ${escapeHtml(chapter.title)}</h2>${content}</section>`;
  }).join('');
  const html = `<!DOCTYPE html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    @page { size: A4; margin: 16mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #30261c; font-family: "Noto Sans Thai", "Apple SD Gothic Neo", "Noto Sans CJK KR", sans-serif; font-size: 11pt; line-height: 1.75; overflow-wrap: anywhere; }
    h1,h2,h3,p { margin-top: 0; }
    h2 { color: #6d4f27; font-size: 21pt; border-bottom: 1px solid #c8ab78; padding-bottom: 5mm; }
    h3 { font-size: 12pt; margin: 7mm 0 2mm; }
    p { white-space: normal; margin-bottom: 5mm; orphans: 2; widows: 2; }
    .cover { page-break-after: always; height: 255mm; position: relative; color: #fff9e9; background: #0c1520; overflow: hidden; }
    .cover img.bg { position: absolute; width: 100%; height: 100%; object-fit: cover; }
    .cover img.character { position: absolute; height: 72%; max-width: 92%; object-fit: contain; right: 0; top: 11%; }
    .shade { position: absolute; inset: 0; background: linear-gradient(transparent 38%, rgba(5,11,19,.98) 95%); }
    .logo { position: absolute; top: 10mm; left: 9mm; width: 43mm; }
    .covertext { position: absolute; bottom: 14mm; left: 9mm; right: 9mm; }
    .covertext h1 { font-size: 30pt; margin: 3mm 0; }
    .covertext p { font-size: 10pt; margin-bottom: 3mm; }
    .chapter { page-break-before: always; }
    .finalart { width: 100%; max-height: 100mm; object-fit: cover; margin: 3mm 0 7mm; }
    .afterword { page-break-before: always; }
  </style></head><body>
    <div class="cover"><img class="bg" src="${background}">${character ? `<img class="character" src="${character}">` : ''}<div class="shade"></div>${locale !== 'ko' || !logo ? `<div class="logo" style="color:#f3d896;font-weight:bold">${locale === 'en' ? 'PAST LIFE ARCHIVE' : translate(locale, '전생록')}</div>` : `<img class="logo" src="${logo}">`}<div class="covertext"><div>${localeText(locale, { ko: `나의 ${record.recordNo}번째 전생 기록`, en: `My past life record No. ${record.recordNo}`, th: `บันทึกชาติก่อนของฉัน ลำดับ ${record.recordNo}`, ja: `私の第${record.recordNo}の前世記録` })}</div><h1>${escapeHtml(record.name)}</h1><p>${escapeHtml(`${cover.birthYear}~${cover.deathYear} · ${cover.era} · ${cover.place}`)}</p><p>${escapeHtml(`${cover.role} · ${cover.lifeLine}`)}</p></div></div>
    ${chapterHtml}
    <section class="chapter"><h2>${localeText(locale, { ko: '마지막 순간', en: 'The final moment', th: 'ช่วงสุดท้าย', ja: '最期の瞬間' })}</h2><img class="finalart" src="${finalArt}"><p>${escapeHtml(`${record.finalMoment.year} · ${record.finalMoment.place}`)}</p>${paragraphs(record.finalMoment.scene)}</section>
    <section class="afterword"><h2>${localeText(locale, { ko: '전생록의 기록', en: 'From the archive', th: 'จากคลังบันทึก', ja: '前世録より' })}</h2>${paragraphs(record.finalMoment.afterword)}</section>
  </body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  if (!uri || !new File(uri).exists || new File(uri).size === 0) throw new Error('PDF file was not created');
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf', dialogTitle: `${localeText(locale, { ko: '전생기록', en: 'Past life record', th: 'บันทึกชาติก่อน', ja: '前世の記録' })} · ${record.name}` });
}
