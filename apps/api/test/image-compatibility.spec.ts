import { describe, expect, it } from 'vitest';
import { eras, findHistoricalSettingExpansion, historicalLocations, historicalSettings, occupations, regions } from '@pastlife/content';
import { LibraryImageProvider } from '../src/providers/library-image.provider.js';
import { inspectImageCompatibility } from '../src/providers/image-compatibility.js';
import type { ResultCore } from '@pastlife/scoring';

describe('result image compatibility', () => {
  it('keeps every historical setting background and character layer aligned', async () => {
    const provider = new LibraryImageProvider();
    for (const setting of historicalSettings) {
      const location = historicalLocations.find(({ id }) => id === setting.id)!;
      const era = eras.find(({ id }) => id === location.eraId)!;
      const region = regions.find(({ id }) => id === location.regionId)!;
      const occupation = occupations.find(({ id }) => id === setting.occupationIds[0])!;
      const expansion = findHistoricalSettingExpansion(setting.id)!;
      const core = {
        contentVersion: 'test', answerHash: setting.id, recordNo: 1, scores: { tags: {}, axes: {}, topTags: [] },
        eraId: era.id, regionId: region.id, locationId: location.id, classId: occupation.classId, occupationId: occupation.id,
        personalityId: 'PERSON_ANALYTIC', relationshipId: 'REL_COMPANION', eventId: 'EVENT_01', lastMemoryId: 'MEM_RAIN', basicBlockIds: [],
        libraryImage: { key: expansion.imageAssetKeys[0], promptTags: [] },
      } as unknown as ResultCore;
      const image = await provider.getImage(core);
      expect(inspectImageCompatibility(core, image), setting.id).toEqual([]);
    }
  });
});
