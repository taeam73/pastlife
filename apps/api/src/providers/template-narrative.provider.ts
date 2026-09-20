import { Injectable } from '@nestjs/common';
import type { ResultCore } from '@pastlife/scoring';
import type { NarrativeProvider } from './narrative.provider.js';
import { buildStoryNarrative, buildStoryProfile } from './story-narrative.js';

@Injectable()
export class TemplateNarrativeProvider implements NarrativeProvider {
  async createBasic(core: ResultCore) {
    return { blocks: buildStoryNarrative(core), storyProfile: buildStoryProfile(core) };
  }
}
