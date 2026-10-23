import { Injectable } from '@nestjs/common';
import type { ResultCore } from '@pastlife/scoring';
import type { NarrativeProvider } from './narrative.provider.js';
import { buildStoryNarrative, buildStoryProfile } from './story-narrative.js';
import { buildContentStoryBlocks } from '../results/story-result.js';

@Injectable()
export class TemplateNarrativeProvider implements NarrativeProvider {
  async createBasic(core: ResultCore) {
    if (core.storyId) return { blocks: buildContentStoryBlocks(core), storyProfile: buildStoryProfile(core) };
    return { blocks: buildStoryNarrative(core), storyProfile: buildStoryProfile(core) };
  }
}
