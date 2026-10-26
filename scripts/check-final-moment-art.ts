import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { findStoryManuscript, storyCards, storyFinalMoments } from '@pastlife/content';

const mobileRegistry = readFileSync(resolve('apps/mobile/src/results/libraryImages.ts'), 'utf8');
const known = new Set(storyCards.map((card) => card.id));
const seenIds = new Set<string>();
const seenUris = new Set<string>();
const seenHashes = new Set<string>();
const conciseReplacementIds = new Set([
  'MOON_SIGNAL_WINDOW', 'OPEN_GOAL_LEFT', 'TWO_BLACK_COATS', 'SWAYING_SPEAKER', 'RING_IN_BROOM',
  'HOUSE_WITH_WHEELS', 'WIRE_OUTSIDE_THE_DOOR', 'TWO_GAMES_ONE_TICKET', 'THE_FACE_ON_THE_SALON_SIGN',
]);

function jpegSize(data: Buffer, filename: string) {
  if (data.readUInt16BE(0) !== 0xffd8) throw new Error(`${filename} is not a JPEG`);
  let offset = 2;
  while (offset + 9 < data.length) {
    if (data[offset] !== 0xff) throw new Error(`${filename} has an invalid JPEG marker`);
    const marker = data[offset + 1];
    offset += 2;
    const length = data.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: data.readUInt16BE(offset + 5), height: data.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  throw new Error(`${filename} has no dimensions`);
}

for (const moment of storyFinalMoments) {
  if (!known.has(moment.storyId) || seenIds.has(moment.storyId)) throw new Error(`Unknown or duplicate story: ${moment.storyId}`);
  seenIds.add(moment.storyId);
  const manuscript = findStoryManuscript(moment.storyId);
  if (!manuscript) throw new Error(`${moment.storyId} has no manuscript`);
  const conciseReplacement = conciseReplacementIds.has(moment.storyId);
  const deathYearMatches = manuscript.identity.deathYear === moment.year
    || (conciseReplacement && moment.year.startsWith(manuscript.identity.deathYear));
  if (!deathYearMatches) throw new Error(`${moment.storyId} death year conflicts with 03`);
  const deathEvent = manuscript.timeline.at(-1);
  const originalFantasyStory = storyCards.findIndex((card) => card.id === moment.storyId) < 44;
  const age = manuscript.identity.ageAtDeath;
  const conciseTimelineMatches = conciseReplacement && deathEvent
    ? deathEvent.when.includes(manuscript.identity.deathYear)
      && (age === null || !/\d+세/.test(deathEvent.when) || deathEvent.when.includes(`${age}세`))
    : false;
  const legacyTimelineMatches = deathEvent
    ? (originalFantasyStory || deathEvent.when.includes(moment.year))
      && (age === null || deathEvent.when.includes(`${age}세`))
    : false;
  if (!deathEvent || (conciseReplacement ? !conciseTimelineMatches : !legacyTimelineMatches)) {
    throw new Error(`${moment.storyId} final moment year or age conflicts with the last 03 entry`);
  }
  const sceneComplete = conciseReplacement
    ? moment.scene.trim().length >= 280 && moment.afterword.trim().length >= 120
    : moment.scene.trim().length >= 400 && moment.afterword.includes('전생록') && moment.afterword.includes('끝');
  if (!sceneComplete) throw new Error(`${moment.storyId} final scene is incomplete`);
  if (!moment.artUri.startsWith('asset://stories/v3/') || !moment.artUri.endsWith('.jpg') || seenUris.has(moment.artUri)) throw new Error(`${moment.storyId} art URI is invalid or reused`);
  seenUris.add(moment.artUri);
  if (!mobileRegistry.includes(`'${moment.artUri}': require(`)) throw new Error(`${moment.storyId} art is missing from mobile registry`);
  const filename = moment.artUri.replace('asset://stories/v3/', '');
  const path = resolve('apps/mobile/assets/stories/v3', filename);
  const data = readFileSync(path);
  const hash = createHash('sha256').update(data).digest('hex');
  if (seenHashes.has(hash)) throw new Error(`${moment.storyId} art reuses another final image`);
  seenHashes.add(hash);
  const { width, height } = jpegSize(data, filename);
  if (width < 1024 || height < 680) throw new Error(`${filename} is too small: ${width}x${height}`);
  if (statSync(path).size > 700_000) throw new Error(`${filename} is larger than 700KB`);
}

console.info(`Verified ${storyFinalMoments.length}/${storyCards.length} final-moment manuscripts with distinct mapped art`);
