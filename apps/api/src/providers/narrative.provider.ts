import type { ResultCore } from '@pastlife/scoring';
import type { NarrativeBlock } from '../repositories/assessment.repository.js';
import type { StoryProfile } from '../story-profile.js';

export const NARRATIVE_PROVIDER = Symbol('NARRATIVE_PROVIDER');
export type NarrativeResult = { blocks: NarrativeBlock[]; storyProfile: StoryProfile };
export interface NarrativeProvider { createBasic(core: ResultCore): Promise<NarrativeResult> }
