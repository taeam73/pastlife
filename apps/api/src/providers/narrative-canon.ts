import type { NarrativeBlock } from '../repositories/assessment.repository.js';
import { eras, historicalLocations, occupations } from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';

export type CanonIssue = { code: 'BLOCK_COUNT' | 'DUPLICATE_ID' | 'EMPTY_TITLE' | 'EMPTY_BODY' | 'OVERLONG_BODY' | 'INVALID_LOCATION_ERA' | 'INVALID_OCCUPATION_CONTEXT' | 'WRONG_BLOCK_ORDER'; index?: number };

const expectedBlockIds = ['LIFE_BIRTH', 'LIFE_CHILDHOOD', 'LIFE_YOUTH', 'LIFE_MIDLIFE', 'LIFE_LATER_YEARS', 'LIFE_DEATH'];

export function inspectNarrativeCanon(blocks: NarrativeBlock[]): CanonIssue[] {
  const issues: CanonIssue[] = [];
  if (blocks.length !== 6) issues.push({ code: 'BLOCK_COUNT' });
  const ids = new Set<string>();
  blocks.forEach((block, index) => {
    if (!block.title.trim()) issues.push({ code: 'EMPTY_TITLE', index });
    if (!block.body.trim()) issues.push({ code: 'EMPTY_BODY', index });
    if (block.body.length > 2200) issues.push({ code: 'OVERLONG_BODY', index });
    if (ids.has(block.id)) issues.push({ code: 'DUPLICATE_ID', index });
    ids.add(block.id);
  });
  return issues;
}

export function inspectResultCanon(core: ResultCore, blocks: NarrativeBlock[]): CanonIssue[] {
  const issues = inspectNarrativeCanon(blocks);
  blocks.forEach((block, index) => { if (block.id !== expectedBlockIds[index]) issues.push({ code: 'WRONG_BLOCK_ORDER', index }); });
  const location = historicalLocations.find(({ id }) => id === core.locationId);
  const era = eras.find(({ id }) => id === core.eraId);
  const occupation = occupations.find(({ id }) => id === core.occupationId || id === ({ OCC_01: 'OCC_SCRIBE', OCC_02: 'OCC_TEACHER', OCC_03: 'OCC_CEREMONIAL', OCC_04: 'OCC_NAVIGATOR', OCC_05: 'OCC_NAVIGATOR', OCC_06: 'OCC_ARTISAN', OCC_07: 'OCC_HEALER', OCC_08: 'OCC_MESSENGER' } as Record<string, string>)[core.occupationId]);
  if (!location || !era || location.eraId !== era.id) issues.push({ code: 'INVALID_LOCATION_ERA' });
  if (!occupation || !occupation.allowedEraIds.includes(core.eraId) || !occupation.allowedLocationIds.includes(core.locationId)) issues.push({ code: 'INVALID_OCCUPATION_CONTEXT' });
  return issues;
}
