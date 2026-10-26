import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { resolveLibraryImage } from './libraryImages';
import type { PdfRecord } from './exportRecordPdf';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/gu, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);
}

function paragraphs(value: string) {
  return value.split(/\n\s*\n/u).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/gu, '<br>')}</p>`).join('');
}

async function assetDataUri(module: number | string, mimeType: string) {
  const asset = await Asset.fromModule(module).downloadAsync();
  const localUri = asset.localUri ?? asset.uri;
  if (!localUri) throw new Error('PDF illustration is unavailable on this device');
  return `data:${mimeType};base64,${await new File(localUri).base64()}`;
}

async function storyImage(uri: string) {
  const mapped = resolveLibraryImage(uri);
  const selected = Array.isArray(mapped) ? mapped[0] : mapped;
  if (typeof selected === 'number') return assetDataUri(selected, /\.webp(?:$|\?)/u.test(uri) ? 'image/webp' : 'image/jpeg');
  if (selected && typeof selected === 'object' && 'uri' in selected && selected.uri) {
    const asset = await Asset.fromURI(selected.uri).downloadAsync();
    const localUri = asset.localUri ?? asset.uri;
    return `data:${/\.webp(?:$|\?)/u.test(uri) ? 'image/webp' : 'image/jpeg'};base64,${await new File(localUri).base64()}`;
  }
  throw new Error(`PDF illustration is not mapped: ${uri}`);
}

export async function shareNativeRecordPdf(record: PdfRecord) {
  if (record.chapters.length !== 4) throw new Error('Complete story chapters are required');
  if (!await Sharing.isAvailableAsync()) throw new Error('File sharing is unavailable on this device');
  const [logo, background, character, finalArt] = await Promise.all([
    assetDataUri(require('../../assets/branding/title-logo-plain.png') as number, 'image/png'),
    storyImage(record.backgroundUri), record.characterUri ? storyImage(record.characterUri) : Promise.resolve(null), storyImage(record.finalMoment.illustrationUri),
  ]);
  const cover = record.cover;
  const chapterHtml = record.chapters.map((chapter, index) => {
    const number = String(index + 1).padStart(2, '0');
    const content = index === 0 && chapter.profilePages?.length
      ? chapter.profilePages.map((page) => `<h3>${escapeHtml(page.title)}</h3>${paragraphs(page.body)}`).join('')
      : paragraphs(chapter.body);
    return `<section class="chapter"><h2>${number} ${escapeHtml(chapter.title)}</h2>${content}</section>`;
  }).join('');
  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    @page { size: A4; margin: 16mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #30261c; font-family: "Apple SD Gothic Neo", "Noto Sans CJK KR", sans-serif; font-size: 11pt; line-height: 1.75; overflow-wrap: anywhere; }
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
    <div class="cover"><img class="bg" src="${background}">${character ? `<img class="character" src="${character}">` : ''}<div class="shade"></div><img class="logo" src="${logo}"><div class="covertext"><div>나의 ${record.recordNo}번째 전생 기록</div><h1>${escapeHtml(record.name)}</h1><p>${escapeHtml(`${cover.birthYear}~${cover.deathYear} · ${cover.era} · ${cover.place}`)}</p><p>${escapeHtml(`${cover.role} · ${cover.lifeLine}`)}</p></div></div>
    ${chapterHtml}
    <section class="chapter"><h2>마지막 순간</h2><img class="finalart" src="${finalArt}"><p>${escapeHtml(`${record.finalMoment.year} · ${record.finalMoment.place}`)}</p>${paragraphs(record.finalMoment.scene)}</section>
    <section class="afterword"><h2>전생록의 기록</h2>${paragraphs(record.finalMoment.afterword)}</section>
  </body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf', dialogTitle: `전생기록 · ${record.name}` });
}
