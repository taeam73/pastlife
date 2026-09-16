import type { ResultCore } from '@pastlife/scoring';
import type { NarrativeBlock } from '../repositories/assessment.repository.js';

export const NARRATIVE_PROVIDER = Symbol('NARRATIVE_PROVIDER');
export interface NarrativeProvider { createBasic(core: ResultCore): Promise<NarrativeBlock[]> }
