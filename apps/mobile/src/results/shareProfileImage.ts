import { resolveLibraryImage } from './libraryImages';
import { localeText, translate, type Locale } from '../i18n/locale';

type Layer = { uri: string; role: 'BACKGROUND' | 'CHARACTER' | 'EFFECT'; alt: string };
type Cover = { era: string; place: string; role: string; birthYear: string; deathYear: string; lifeLine: string };

function sourceUri(uri: string) {
  const source = resolveLibraryImage(uri) ?? (/^https?:\/\//.test(uri) ? { uri } : undefined);
  const selected = Array.isArray(source) ? source[0] : source;
  return selected && typeof selected === 'object' && 'uri' in selected ? selected.uri : undefined;
}

async function loadImage(uri: string) {
  const src = sourceUri(uri);
  if (!src) throw new Error(`Image is not mapped: ${uri}`);
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Image could not load: ${uri}`);
  return createImageBitmap(await response.blob());
}

async function loadBrandLogo() {
  const source = require('../../assets/branding/title-logo-plain.png') as { uri?: string } | string;
  const src = typeof source === 'string' ? source : source.uri;
  if (!src) throw new Error('Brand logo is not mapped');
  const response = await fetch(src);
  if (!response.ok) throw new Error('Brand logo could not load');
  return createImageBitmap(await response.blob());
}

function drawWrapped(context: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number, maxLines: number) {
  const words = text.split(/\s+/u).flatMap((word) => {
    if (context.measureText(word).width <= width) return [word];
    const parts: string[] = [];
    let part = '';
    for (const unit of Array.from(word.matchAll(/\P{M}\p{M}*|\p{M}+/gu), (match) => match[0])) {
      if (part && context.measureText(part + unit).width > width) { parts.push(part); part = ''; }
      part += unit;
    }
    if (part) parts.push(part);
    return parts;
  });
  let line = '';
  let drawn = 0;
  const drawEllipsis = (value: string, lineY: number) => {
    let fitted = value.trim();
    while (fitted && context.measureText(`${fitted}…`).width > width) fitted = fitted.slice(0, -1).trimEnd();
    context.fillText(`${fitted}…`, x, lineY);
  };
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index]!;
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > width && line) {
      if (drawn === maxLines - 1) {
        drawEllipsis(line, y + drawn * lineHeight);
        return maxLines;
      }
      context.fillText(line, x, y + drawn * lineHeight);
      drawn += 1;
      line = word;
    } else line = next;
  }
  if (line) {
    if (drawn < maxLines) {
      context.fillText(line, x, y + drawn * lineHeight);
      drawn += 1;
    }
  }
  return drawn;
}

export async function renderShareProfileImage({ name, recordNo, cover, layers, relationship, locale = 'ko' }: {
  name: string;
  recordNo: number;
  cover: Cover;
  layers: Layer[];
  relationship: string;
  locale?: Locale;
}) {
  const backgroundUri = layers.find((layer) => layer.role === 'BACKGROUND')?.uri;
  const characterUri = layers.find((layer) => layer.role === 'CHARACTER')?.uri;
  if (!backgroundUri) throw new Error('Background is required for the share image');
  const [background, character, logo] = await Promise.all([loadImage(backgroundUri), characterUri ? loadImage(characterUri) : Promise.resolve(null), loadBrandLogo()]);
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1800;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available');
  const scale = Math.max(canvas.width / background.width, canvas.height / background.height);
  const bgWidth = background.width * scale;
  const bgHeight = background.height * scale;
  context.drawImage(background, (canvas.width - bgWidth) / 2, (canvas.height - bgHeight) / 2, bgWidth, bgHeight);
  if (character) {
    const portraitScale = Math.min(920 / character.width, 1230 / character.height);
    const portraitWidth = character.width * portraitScale;
    const portraitHeight = character.height * portraitScale;
    const portraitY = Math.max(290, 1260 - portraitHeight) + (characterUri === 'asset://stories/v3/lagos-bisi-hairdresser.webp' ? 90 : 0);
    context.drawImage(character, canvas.width - portraitWidth - 10, portraitY, portraitWidth, portraitHeight);
  }
  const topShade = context.createLinearGradient(0, 0, 0, 180);
  topShade.addColorStop(0, 'rgba(8,14,24,0.67)');
  topShade.addColorStop(1, 'rgba(8,14,24,0)');
  context.fillStyle = topShade;
  context.fillRect(0, 0, canvas.width, 180);
  const lowerShade = context.createLinearGradient(0, 960, 0, 1800);
  lowerShade.addColorStop(0, 'rgba(8,14,24,0)');
  lowerShade.addColorStop(0.3, 'rgba(8,14,24,0.9)');
  lowerShade.addColorStop(1, 'rgba(8,14,24,0.98)');
  context.fillStyle = lowerShade;
  context.fillRect(0, 960, canvas.width, 840);
  if (locale !== 'ko') {
    context.fillStyle = '#f8e3b8';
    context.font = 'bold 42px sans-serif';
    context.fillText(locale === 'en' ? 'PAST LIFE ARCHIVE' : translate(locale, '전생록'), 72, 98);
  } else context.drawImage(logo, 72, 24, 276, 130);
  const x = 74;
  const width = canvas.width - x * 2;
  context.fillStyle = '#e9c981';
  context.font = 'bold 38px sans-serif';
  context.fillText(localeText(locale, { ko: `당신의 ${recordNo}번째 전생은`, en: `Your past life No. ${recordNo}`, th: `ชาติที่แล้วของคุณลำดับ ${recordNo}`, ja: `あなたの第${recordNo}の前世は` }), x, 1105);
  context.fillStyle = '#fff8e9';
  context.font = 'bold 76px sans-serif';
  const nameLines = drawWrapped(context, name, x, 1205, width, 78, 2);
  let y = 1205 + nameLines * 78;
  context.font = '32px sans-serif';
  context.fillText(`(${cover.birthYear}~${cover.deathYear})`, x, y);
  y += 55;
  const meta = `${cover.era} · ${cover.place} · ${cover.role}`;
  context.font = '34px sans-serif';
  y += drawWrapped(context, meta, x, y, width, 50, 2) * 50 + 25;
  if (relationship) {
    context.fillStyle = '#efd8a7';
    context.font = '32px sans-serif';
    y += drawWrapped(context, relationship, x, y, width, 47, 2) * 47 + 18;
  }
  context.fillStyle = '#fff8e9';
  context.font = '34px sans-serif';
  drawWrapped(context, cover.lifeLine, x, y, width, 49, Math.max(1, Math.floor((1740 - y) / 49)));
  return canvas.toDataURL('image/png');
}
