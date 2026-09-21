import type { CoreTag } from '../types.js';

export type ReviewStatus = 'DRAFT' | 'EDITORIAL_REVIEWED' | 'HISTORICALLY_REVIEWED';
export type ContentProvenance = { sourceTitle: string; sourceUrl: string; accessedOn: string; note: string };
export type HistoricalOccupation = {
  id: string; label: string; classId: string; affinityTags: CoreTag[];
  dailyActions: readonly string[]; signatureObjects: readonly string[];
};
export type HistoricalSetting = {
  id: string; eraId: string; regionId: string; label: string; presentDayContext: string;
  yearStart: number; yearEnd: number; affinityTags: CoreTag[]; occupationIds: readonly string[];
  dailyLifeNotes: readonly string[];
  visual: { fallbackAssetKey: string; environment: string; clothing: string; avoid: readonly string[] };
  reviewStatus: ReviewStatus; provenance: readonly ContentProvenance[]; fallback?: boolean;
};
export type ContentIssue = { code: string; itemId: string; message: string };
