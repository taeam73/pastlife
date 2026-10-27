import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceDir = resolve('output/english-source');
const localeOption = process.argv.indexOf('--locale');
const locale = localeOption < 0 ? 'en' : process.argv[localeOption + 1];
if (!['en', 'th', 'ja'].includes(locale)) throw new Error(`Unsupported locale: ${locale}`);
const translatedDir = resolve(`output/${{ en: 'english', th: 'thai', ja: 'japanese' }[locale]}-translations`);
const manifest = JSON.parse(await readFile(resolve(sourceDir, 'manifest.json'), 'utf8'));
const issues = [];
const missing = [];
let inputTokens = 0;
let outputTokens = 0;
let estimatedCostUsd = 0;
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const thaiMonthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const ordinals = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const japaneseNumerals = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function spelledNumber(value) {
  const number = Number(value);
  if (number < 20) return ones[number];
  if (number < 100) return number % 10 ? `${tens[Math.floor(number / 10)]}-${ones[number % 10]}` : tens[number / 10];
  return undefined;
}

function numberRetained(source, translated, digit) {
  if (translated.includes(digit)) return true;
  const month = monthNames[Number(digit) - 1];
  if (month && source.includes(`${digit}월`) && translated.toLowerCase().includes(month.toLowerCase())) return true;
  const thaiMonth = thaiMonthNames[Number(digit) - 1];
  if (thaiMonth && source.includes(`${digit}월`) && translated.includes(thaiMonth)) return true;
  const japaneseNumeral = japaneseNumerals[Number(digit)];
  if (japaneseNumeral && source.includes(`${digit}등`) && translated.includes(`${japaneseNumeral}等`)) return true;
  const spoken = spelledNumber(digit);
  const ordinal = ordinals[Number(digit)];
  if (ordinal && new RegExp(`\\b${ordinal}\\b`, 'iu').test(translated)) return true;
  const numeral = roman[Number(digit)];
  if (numeral && source.includes(`${digit}세`) && new RegExp(`\\b${numeral}\\b`, 'u').test(translated)) return true;
  return Boolean(spoken && new RegExp(`\\b${spoken}\\b`, 'iu').test(translated));
}

function compare(source, translated, path, storyId) {
  if (typeof source === 'string') {
    if (typeof translated !== 'string' || !translated.trim()) issues.push(`${storyId} ${path}: empty text`);
    else {
      if (/[\uac00-\ud7a3]/u.test(translated)) issues.push(`${storyId} ${path}: Hangul remains`);
      const digits = source.match(/\d+/gu) ?? [];
      for (const digit of digits) if (!numberRetained(source, translated, digit)) issues.push(`${storyId} ${path}: missing number ${digit}`);
      if (source.includes('\n\n') && source.split(/\n\s*\n/u).length !== translated.split(/\n\s*\n/u).length) issues.push(`${storyId} ${path}: paragraph count differs`);
      if (path.includes('profilePages[') && path.endsWith('.body') && source.split('\n').length !== translated.split('\n').length) issues.push(`${storyId} ${path}: profile line count differs`);
    }
  } else if (Array.isArray(source)) {
    if (!Array.isArray(translated) || source.length !== translated.length) issues.push(`${storyId} ${path}: array length differs`);
    else source.forEach((item, index) => compare(item, translated[index], `${path}[${index}]`, storyId));
  } else if (source && typeof source === 'object') {
    if (!translated || typeof translated !== 'object' || Array.isArray(translated)) issues.push(`${storyId} ${path}: object missing`);
    else for (const key of Object.keys(source)) {
      if (key in translated) compare(source[key], translated[key], `${path}.${key}`, storyId);
    }
  } else if (source !== translated) issues.push(`${storyId} ${path}: non-text value changed`);
}

for (const entry of manifest.stories) {
  let saved;
  try { saved = JSON.parse(await readFile(resolve(translatedDir, `${entry.id}.json`), 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') { missing.push(entry.id); continue; }
    throw error;
  }
  const sourceSnapshot = JSON.parse(await readFile(resolve(sourceDir, `${entry.id}.json`), 'utf8'));
  const source = sourceSnapshot.source;
  const actualHash = createHash('sha256').update(JSON.stringify(source)).digest('hex');
  if (actualHash !== entry.sourceSha256 || saved.sourceSha256 !== actualHash) issues.push(`${entry.id}: source hash mismatch`);
  if (saved.storyId !== entry.id) issues.push(`${entry.id}: story ID mismatch`);
  const expectedSignals = Object.keys(source.manuscript.episode.signalMoments).sort();
  const actualSignals = Object.keys(saved.translation?.manuscript?.episode?.signalMoments ?? {}).sort();
  if (JSON.stringify(expectedSignals) !== JSON.stringify(actualSignals)) issues.push(`${entry.id}: signal paths mismatch`);
  for (const section of ['card', 'manuscript', 'finalMoment']) {
    if (saved.translation?.[section]) {
      for (const [key, value] of Object.entries(source[section])) {
        if (key === 'id' || key === 'storyId' || key === 'signals' || key === 'rare' || key === 'artUri') continue;
        if (key === 'identity') {
          for (const [field, fieldValue] of Object.entries(value)) {
            if (field === 'ageAtDeath') continue;
            compare(fieldValue, saved.translation.manuscript.identity?.[field], `manuscript.identity.${field}`, entry.id);
          }
        } else compare(value, saved.translation[section][key], `${section}.${key}`, entry.id);
      }
    } else issues.push(`${entry.id}: ${section} missing`);
  }
  inputTokens += saved.usage?.inputTokens ?? 0;
  outputTokens += saved.usage?.outputTokens ?? 0;
  estimatedCostUsd += saved.usage?.estimatedCostUsd ?? 0;
}

process.stdout.write(`${JSON.stringify({ locale, totalSourceStories: manifest.totalStories, translatedDrafts: manifest.totalStories - missing.length, missingStories: missing.length, inputTokens, outputTokens, estimatedCostUsd: Math.round(estimatedCostUsd * 10000) / 10000, issues: issues.slice(0, 100), issueCount: issues.length }, null, 2)}\n`);
if (issues.length || (missing.length && !process.argv.includes('--allow-partial'))) process.exitCode = 1;
