import { describe, expect, it, vi } from 'vitest';
import type { ResultCore } from '@pastlife/scoring';
import type { AssessmentRepository, StoredResult, StoredSession } from '../src/repositories/assessment.repository.js';
import type { ImageProvider } from '../src/providers/image.provider.js';
import type { ImageStorage } from '../src/providers/storage.provider.js';
import { LibraryImageProvider } from '../src/providers/library-image.provider.js';
import { ResultsService } from '../src/results/results.service.js';
import { buildContentStoryResult } from '../src/results/story-result.js';

const core = {
  contentVersion: '2.5.0', answerHash: 'image-delivery',
  recordNo: 1,
  eraId: 'ERA_ANCIENT_CIV',
  regionId: 'REG_EAST_ASIA',
  locationId: 'LOC_MESOPOTAMIA',
  classId: 'CLASS_SCHOLAR',
  occupationId: 'OCC_01',
  personalityId: 'PERSON_ANALYTIC', relationshipId: 'REL_COMPANION', eventId: 'EVENT_01', lastMemoryId: 'MEM_RAIN',
  scores: { tags: {}, axes: {}, topTags: [] }, basicBlockIds: [],
  libraryImage: { key: 'ancient-east-asia', promptTags: [] },
} as unknown as ResultCore;

const result = {
  id: 'result-1',
  sessionId: 'session-1',
  status: 'READY',
  core,
  blocks: Array.from({ length: 6 }, (_, index) => ({ id: `block-${index}`, title: 'title', body: 'body' })),
  image: { sourceType: 'AI', uri: 's3://pastlife-private/results/hash.webp', alt: 'generated result', status: 'READY', attemptCount: 1 },
} satisfies StoredResult;

const session = { id: 'session-1', unlocks: ['BASIC'] } as StoredSession;

function createService(getDownloadUrl: ImageStorage['getDownloadUrl']) {
  const repository = {
    getResult: vi.fn(async () => structuredClone(result)),
    getSession: vi.fn(async () => structuredClone(session)),
  } as unknown as AssessmentRepository;
  const imageProvider = { getImage: vi.fn() } as unknown as ImageProvider;
  const storage = { putObject: vi.fn(), getDownloadUrl } as unknown as ImageStorage;
  return { service: new ResultsService(repository, imageProvider, storage, new LibraryImageProvider()), storage };
}

describe('private result image delivery', () => {
  it('uses separate story-locked background and character layers for the clown', async () => {
    const provider = new LibraryImageProvider();
    const clown = await provider.getImage({ ...core, contentVersion: '3.0.0', storyId: 'CLOWN' } as ResultCore);
    const other = await provider.getImage({ ...core, contentVersion: '3.0.0', storyId: 'NOT_A_STORY' } as ResultCore);
    expect(clown.uri).toBe('asset://stories/v3/clown-market-bg-v2.jpg');
    expect(clown.layers).toEqual([
      { uri: 'asset://stories/v3/clown-market-bg-v2.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/clown-rubo.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    expect(clown.compositeUri).toBeUndefined();
    expect(other.uri).toBe('asset://branding/main-bg-01.png');
  });

  it('pairs the sleeping dragon library with dream recorder Orr', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'DRAGON_DREAM' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/dragon-dream-library-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/dragon-dream-orr.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the Yeoulho communications room with archivist Hangyeol', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'LAST_SIGNAL' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/last-signal-yeoulho-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/last-signal-hangyeol.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the light-pierced sleeping tent with courier Iro', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'SHADE_TENT' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/shade-tent-daystar-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/shade-tent-iro.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the rising droplet sea with guide Nuri', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'REVERSE_MAP' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/reverse-map-droplet-sea-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/reverse-map-nuri.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the coast with a separate nonhuman rock layer', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'SHORE_ROCK' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/shore-rock-baramteok-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/shore-rock-padoteum.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('gives the firework artisan a distinct background and transparent character layer', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'FIREWORKS' } as ResultCore);
    expect(image.uri).toBe('asset://stories/v3/fireworks-seoritgol-bg.jpg');
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/fireworks-seoritgol-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/fireworks-gaon.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    expect(image.compositeUri).toBeUndefined();
  });

  it('keeps the room-seven mystery behind its door while showing its innkeeper separately', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'ROOM7' } as ResultCore);
    expect(image.uri).toBe('asset://stories/v3/room7-bidolgae-bg.jpg');
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/room7-bidolgae-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/room7-iru.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    expect(image.compositeUri).toBeUndefined();
  });

  it('pairs the blank decree with its own castle and clerk', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'BLANK_ORDER' } as ResultCore);
    expect(image.uri).toBe('asset://stories/v3/blank-order-fog-castle-bg.jpg');
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/blank-order-fog-castle-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/blank-order-sea.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the silent bell mystery with detective Daon', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'SILENT_BELL' } as ResultCore);
    expect(image.uri).toBe('asset://stories/v3/silent-bell-reed-river-bg-v2.jpg');
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/silent-bell-reed-river-bg-v2.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/silent-bell-daon.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the rainy fork with night-path guide Maru', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'NIGHT_GUIDE' } as ResultCore);
    expect(image.uri).toBe('asset://stories/v3/night-guide-soldeung-fork-bg-v3.jpg');
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/night-guide-soldeung-fork-bg-v3.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/night-guide-maru.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the royal soup clue with food taster Yeo-rin', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'TASTER' } as ResultCore);
    expect(image.uri).toBe('asset://stories/v3/taster-pomegranate-castle-bg.jpg');
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/taster-pomegranate-castle-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/taster-yeorin.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the diverted rain and smiling cloud with painter Hae-ru', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'CLOUD_PAINTER' } as ResultCore);
    expect(image.uri).toBe('asset://stories/v3/cloud-painter-skybridge-bg.jpg');
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/cloud-painter-skybridge-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/cloud-painter-haeru.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the borrowed crown and broken bridge with festival king Dogyeom', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'FESTIVAL_KING' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/festival-king-dolbit-castle-bg-v2.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/festival-king-dogyeom.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the pre-race footprints and bridge with judge Miru', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'SNOW_REFEREE' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/snow-referee-snowhill-bg-v3.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/snow-referee-miru.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the torn shadow workbench with tailor Narin', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'SHADOW_TAILOR' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/shadow-tailor-moonthread-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/shadow-tailor-narin.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the empty underwater scale with keeper Aram', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'UNDERWATER_SCALE' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/underwater-scale-bluespring-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/underwater-scale-aram.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the doorless glass house with guide Seohoo', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'DOORLESS_KEEPER' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/doorless-keeper-glass-forest-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/doorless-keeper-seohoo.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the missing autumn calendar with keeper On', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'LOST_AUTUMN' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/lost-autumn-four-seasons-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/lost-autumn-on.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the empty travelling stage with actor Bian in the audience', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'THEATRE_VILLAIN' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/theatre-villain-black-curtain-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/theatre-villain-bian.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the Kallen Plateau windmill with keeper Roa', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'WINDMILL' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/windmill-kallen-plateau-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/windmill-roa.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the JAGALNARU wagon stage with porter Haemin', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'HEAVY_BOX' } as ResultCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/heavy-box-jagalnaru-stage-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/heavy-box-haemin.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('carries the newly fixed protagonist genders into story results', async () => {
    const provider = new LibraryImageProvider();
    for (const [storyId, expectedGender] of [['WINDMILL', '여성'], ['HEAVY_BOX', '남성']] as const) {
      const storyCore = { ...core, storyId, storySignals: ['protect'] } as ResultCore;
      const image = await provider.getImage(storyCore);
      expect(buildContentStoryResult(`setting-${storyId}`, storyCore, image).character.gender).toBe(expectedGender);
    }
  });

  it('pairs the Ramo orbital germination room with conservator Mira', async () => {
    const storyCore = { ...core, storyId: 'GRAVITY_SEEDS', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/gravity-seeds-ramo-station-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/gravity-seeds-mira.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    expect(buildContentStoryResult('mira-setting', storyCore, image).character.gender).toBe('여성');
  });

  it('pairs the Ledos game board with player Adele', async () => {
    const storyCore = { ...core, storyId: 'PAID_LOSS', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/paid-loss-ledos-arena-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/paid-loss-adel.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    expect(buildContentStoryResult('adel-setting', storyCore, image).character.gender).toBe('여성');
  });

  it('pairs the Solmaru bakery path with delivery runner Dan-u', async () => {
    const storyCore = { ...core, storyId: 'WARM_STONES', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/warm-stones-solmaru-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/warm-stones-danu.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    expect(buildContentStoryResult('danu-setting', storyCore, image).character.gender).toBe('남성');
  });

  it('pairs the Lamer canal with apprentice apology courier Theo', async () => {
    const storyCore = { ...core, storyId: 'APOLOGY_COURIER', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/apology-courier-lamer-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/apology-courier-theo.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    expect(buildContentStoryResult('theo-setting', storyCore, image).character.gender).toBe('남성');
  });

  it('pairs the Kill Devil Hills flight scene with photographer John Daniels', async () => {
    const storyCore = { ...core, storyId: 'FIRST_FLIGHT_CAMERA', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/first-flight-kill-devil-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/first-flight-john-daniels.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    expect(buildContentStoryResult('daniels-setting', storyCore, image).character.gender).toBe('남성');
  });

  it('pairs the fictional Jongno pawnshop with proprietor Kim Haewon', async () => {
    const storyCore = { ...core, storyId: 'GYEONGSEONG_SHEARS', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/gyeongseong-shears-jongno-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/gyeongseong-shears-haewon.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    expect(buildContentStoryResult('haewon-setting', storyCore, image).character.gender).toBe('여성');
  });

  it('pairs the Parkes hall with the fictional television repairer May', async () => {
    const storyCore = { ...core, storyId: 'MOON_SIGNAL_WINDOW', storySignals: ['repair'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/moon-signal-parkes-hall-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/moon-signal-may.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('may-setting', storyCore, image);
    expect(result.character.gender).toBe('여성');
    expect(result.presentation?.chapters).toHaveLength(4);
    expect(result.presentation?.chapters[1]?.body).toContain('전시용 수상기');
  });

  it('pairs the estuary flood marks with Rao and preserves his registered gender', async () => {
    const storyCore = { ...core, storyId: 'TIDE_MARK', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/tide-mark-estuary-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/tide-mark-rao.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('rao-setting', storyCore, image);
    expect(result.character.gender).toBe('남성');
    expect(result.presentation?.chapters[1]?.body).toContain('긁개');
  });

  it('pairs the Orsi map-room door with night guard Rina', async () => {
    const storyCore = { ...core, storyId: 'THIRD_KNOCK', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/third-knock-orsi-observatory-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/third-knock-rina.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('rina-setting', storyCore, image);
    expect(result.character.gender).toBe('여성');
    expect(result.presentation?.chapters[1]?.body).toContain('지도실');
  });

  it('pairs Toram market baskets with lottery organizer Mojin', async () => {
    const storyCore = { ...core, storyId: 'MARKET_CAT_LOT', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/market-cat-lot-toram-bg-v2.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/market-cat-lot-mojin.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('mojin-setting', storyCore, image);
    expect(result.character.gender).toBe('남성');
    expect(result.presentation?.chapters).toHaveLength(4);
    expect(result.presentation?.chapters[1]?.body).toContain('햇살');
  });

  it('pairs the Biel shoe workshop with craftswoman Darin and her four-part life', async () => {
    const storyCore = { ...core, storyId: 'TWELVE_LEFT_SHOES', storySignals: ['repair'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/twelve-left-shoes-biel-workshop-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/twelve-left-shoes-darin.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('darin-setting', storyCore, image);
    expect(result.character.gender).toBe('여성');
    expect(result.presentation?.chapters).toHaveLength(4);
    expect(result.presentation?.chapters[1]?.body).toContain('스물네 짝 모두 왼발');
    expect(result.presentation?.chapters[2]?.body).toContain('68세');
  });

  it('pairs Doyun with the three-panel portrait and his four-part life', async () => {
    const storyCore = { ...core, storyId: 'UNSEEN_PORTRAIT', storySignals: ['connect'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/unseen-portrait-lumi-studio-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/unseen-portrait-doyun.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('doyun-setting', storyCore, image);
    expect(result.character.gender).toBe('남성');
    expect(result.presentation?.chapters).toHaveLength(4);
    expect(result.presentation?.chapters[1]?.body).toContain('세 칸');
    expect(result.presentation?.chapters[2]?.body).toContain('79세');
  });

  it('pairs Ujin with the loose-whale float and his four-part life', async () => {
    const storyCore = { ...core, storyId: 'RUNAWAY_WHALE_FLOAT', storySignals: ['release'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/runaway-whale-float-teban-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/runaway-whale-float-ujin.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('ujin-setting', storyCore, image);
    expect(result.character.gender).toBe('남성');
    expect(result.presentation?.chapters).toHaveLength(4);
    expect(result.presentation?.chapters[1]?.body).toContain('꼬리의 나무틀');
    expect(result.presentation?.chapters[2]?.body).toContain('73세');
  });

  it('pairs Nari with the crooked kite and her complete life', async () => {
    const storyCore = { ...core, storyId: 'CROOKED_KITE', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/crooked-kite-bar-bg-v3.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/crooked-kite-nari.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('nari-setting', storyCore, image);
    expect(result.character.gender).toBe('여성');
    expect(result.presentation?.chapters).toHaveLength(4);
    expect(result.presentation?.chapters[1]?.body).toContain('주황색 천');
    expect(result.presentation?.chapters[2]?.body).toContain('75세');
  });

  it('pairs Minrok with the hidden stage door and his four-part life', async () => {
    const storyCore = { ...core, storyId: 'HOLLOW_STAGE_WALL', storySignals: ['speak'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/hollow-stage-wall-seon-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/hollow-stage-wall-minrok.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('minrok-setting', storyCore, image);
    expect(result.character.gender).toBe('남성');
    expect(result.presentation?.chapters).toHaveLength(4);
    expect(result.presentation?.chapters[1]?.body).toContain('저도 그동안 이걸 제 벽이라고만 불렀습니다');
    expect(result.presentation?.chapters[2]?.body).toContain('76세');
  });

  it('pairs Ajeong with the two ferries and her four-part life', async () => {
    const storyCore = { ...core, storyId: 'TWO_FINAL_FERRIES', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/two-final-ferries-durim-bg-v2.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/two-final-ferries-ajeong.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('ajeong-setting', storyCore, image);
    expect(result.character.gender).toBe('여성');
    expect(result.presentation?.chapters).toHaveLength(4);
    expect(result.presentation?.chapters[1]?.body).toContain('두림은 해 질 무렵 저녁 종을 두 번');
    expect(result.presentation?.chapters[2]?.body).toContain('78세');
  });

  it('pairs Ryeowon with the floating orchard and her four-part life', async () => {
    const storyCore = { ...core, storyId: 'FLOATING_ORCHARD', storySignals: ['protect'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/floating-orchard-belo-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/floating-orchard-ryeowon.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('ryeowon-setting', storyCore, image);
    expect(result.character.gender).toBe('여성');
    expect(result.presentation?.chapters).toHaveLength(4);
    expect(result.presentation?.chapters[1]?.body).toContain('묘목섬은 절벽에 닿지 않았습니다');
    expect(result.presentation?.chapters[2]?.body).toContain('71세');
  });

  it('pairs Dohu with the lake snail and his four-part life', async () => {
    const storyCore = { ...core, storyId: 'SILVER_REED_MONSTER', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/silver-reed-monster-belna-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/silver-reed-monster-dohu.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('dohu-setting', storyCore, image);
    expect(result.character.gender).toBe('남성');
    expect(result.presentation?.chapters).toHaveLength(4);
    expect(result.presentation?.chapters[1]?.body).toContain('현상금도 안 받을 거예요');
    expect(result.presentation?.chapters[2]?.body).toContain('71세');
  });

  it('pairs Yeodam with her gold-paper market and four-part life', async () => {
    const storyCore = { ...core, storyId: 'GOLDEN_LIE_SLIP', storySignals: ['notice'] } as ResultCore;
    const image = await new LibraryImageProvider().getImage(storyCore);
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/golden-lie-slip-nasel-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/golden-lie-slip-yeodam.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
    const result = buildContentStoryResult('yeodam-setting', storyCore, image);
    expect(result.character.gender).toBe('여성');
    expect(result.presentation?.chapters).toHaveLength(4);
    expect(result.presentation?.chapters[1]?.body).toContain('없어진 빵 둘과 버린 빵 셋');
    expect(result.presentation?.chapters[2]?.body).toContain('76세');
  });

  it('pairs the broken mirror with repair artisan Moa', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'MIRROR' } as ResultCore);
    expect(image.uri).toBe('asset://stories/v3/mirror-scale-alley-bg.jpg');
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/mirror-scale-alley-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/mirror-moa.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('pairs the rain-marked doorways with herbalist Ravi', async () => {
    const image = await new LibraryImageProvider().getImage({ ...core, contentVersion: '3.0.0', storyId: 'HERBALIST' } as ResultCore);
    expect(image.uri).toBe('asset://stories/v3/herbalist-mistwood-bg.jpg');
    expect(image.matchQuality).toBe('EXACT');
    expect(image.layers).toEqual([
      { uri: 'asset://stories/v3/herbalist-mistwood-bg.jpg', role: 'BACKGROUND', alt: expect.any(String) },
      { uri: 'asset://stories/v3/herbalist-ravi.webp', role: 'CHARACTER', alt: expect.any(String) },
    ]);
  });

  it('replaces a stable S3 reference with a signed URL at response time', async () => {
    const { service, storage } = createService(vi.fn(async () => 'https://signed.invalid/results/hash.webp?X-Amz-Expires=900'));
    const response = await service.basic(result.id);
    expect(response.image.uri).toContain('https://signed.invalid/results/hash.webp');
    expect(storage.getDownloadUrl).toHaveBeenCalledWith('s3://pastlife-private/results/hash.webp');
    expect(result.image.uri).toBe('s3://pastlife-private/results/hash.webp');
  });

  it('signs S3 references in composite and layered image fields', async () => {
    const layeredResult: StoredResult = structuredClone(result);
    layeredResult.image = {
      ...layeredResult.image!,
      compositeUri: 's3://pastlife-private/results/composite.webp',
      layers: [
        { uri: 's3://pastlife-private/results/background.webp', role: 'BACKGROUND', alt: 'background' },
        { uri: 'https://cdn.invalid/character.webp', role: 'CHARACTER', alt: 'character' },
      ],
    };
    const getDownloadUrl = vi.fn(async (uri: string) => `https://signed.invalid/${uri.slice('s3://pastlife-private/'.length)}?X-Amz-Expires=900`);
    const repository = {
      getResult: vi.fn(async () => structuredClone(layeredResult)),
      getSession: vi.fn(async () => structuredClone(session)),
    } as unknown as AssessmentRepository;
    const imageProvider = { getImage: vi.fn() } as unknown as ImageProvider;
    const storage = { putObject: vi.fn(), getDownloadUrl } as unknown as ImageStorage;
    const service = new ResultsService(repository, imageProvider, storage, new LibraryImageProvider());

    const response = await service.basic(result.id);

    expect(response.image.uri).toContain('https://signed.invalid/results/hash.webp');
    expect(response.image.compositeUri).toContain('https://signed.invalid/results/composite.webp');
    expect(response.image.layers?.[0]?.uri).toContain('https://signed.invalid/results/background.webp');
    expect(response.image.layers?.[1]?.uri).toBe('https://cdn.invalid/character.webp');
    expect(getDownloadUrl).toHaveBeenCalledTimes(3);
  });

  it('uses the library image when signing fails', async () => {
    const { service } = createService(vi.fn(async () => { throw new Error('signing unavailable'); }));
    const response = await service.basic(result.id);
    expect(response.image.sourceType).toBe('LIBRARY');
    expect(response.image.uri).toContain('asset://');
  });
});
