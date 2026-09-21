import type { ContentIssue, HistoricalOccupation, HistoricalSetting } from './types.js';

export function validateHistoricalContent(settings: readonly HistoricalSetting[], occupations: readonly HistoricalOccupation[]): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const occupationIds = new Set(occupations.map(({ id }) => id));
  const duplicates = (ids: readonly string[]) => ids.filter((id, index) => ids.indexOf(id) !== index);
  for (const id of duplicates(settings.map(({ id }) => id))) issues.push({ code: 'DUPLICATE_SETTING', itemId: id, message: 'Setting ID must be unique' });
  for (const id of duplicates(occupations.map(({ id }) => id))) issues.push({ code: 'DUPLICATE_OCCUPATION', itemId: id, message: 'Occupation ID must be unique' });
  for (const setting of settings) {
    if (setting.yearStart >= setting.yearEnd) issues.push({ code: 'INVALID_YEAR_RANGE', itemId: setting.id, message: 'yearStart must precede yearEnd' });
    if (setting.occupationIds.length < 2) issues.push({ code: 'SHALLOW_OCCUPATION_POOL', itemId: setting.id, message: 'At least two occupations are required' });
    if (setting.dailyLifeNotes.length < 3) issues.push({ code: 'SHALLOW_DAILY_LIFE', itemId: setting.id, message: 'At least three daily-life notes are required' });
    if (setting.provenance.length < 2) issues.push({ code: 'INSUFFICIENT_PROVENANCE', itemId: setting.id, message: 'At least two sources are required' });
    if (!setting.visual.fallbackAssetKey.startsWith('library/v3/')) issues.push({ code: 'INVALID_ASSET_KEY', itemId: setting.id, message: 'Fallback asset must live under library/v3' });
    for (const occupationId of setting.occupationIds) if (!occupationIds.has(occupationId)) issues.push({ code: 'UNKNOWN_OCCUPATION', itemId: setting.id, message: occupationId });
  }
  const connectedOccupationIds = new Set(settings.flatMap(({ occupationIds }) => occupationIds));
  for (const occupation of occupations) {
    if (!connectedOccupationIds.has(occupation.id)) issues.push({ code: 'ORPHAN_OCCUPATION', itemId: occupation.id, message: 'Occupation must be connected to at least one historical setting' });
  }
  return issues;
}
