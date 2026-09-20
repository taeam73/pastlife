import { Inject, Injectable } from '@nestjs/common';
import type { ResultCore } from '@pastlife/scoring';
import type { NarrativeProvider, NarrativeResult } from './narrative.provider.js';
import type { NarrativeBlock } from '../repositories/assessment.repository.js';
import { TemplateNarrativeProvider } from './template-narrative.provider.js';
import { basicTemplates } from '@pastlife/content';
import { STORY_EVENT_TAXONOMY, selectRelationshipEvent } from './story-event-catalog.js';

const MIN_TOTAL_STORY_LENGTH = 1_600;
const MIN_CHAPTER_LENGTH = 140;
const MAX_CHAPTER_LENGTH = 1_000;
const DISALLOWED_FACTUAL_CLAIM = /실제로 살았|틀림없는 전생|확실한 전생/;
const DISALLOWED_META_COPY = /사용자의 실제 정체성|창작 서사|창작 설정|서사용 이름|AI가 만든|선택을 바탕으로|이 결과는/;

function readStoryBlocks(value: unknown): NarrativeBlock[] | null {
  if (!value || typeof value !== 'object') return null;
  const blocks = (value as { blocks?: unknown }).blocks;
  if (!Array.isArray(blocks) || blocks.length !== basicTemplates.length) return null;
  const normalized = blocks.map((block, index) => {
    if (!block || typeof block !== 'object') return null;
    const candidate = block as { id?: unknown; body?: unknown };
    const template = basicTemplates[index]!;
    if (candidate.id !== template.id || typeof candidate.body !== 'string') return null;
    const body = candidate.body.trim();
    if (
      body.length < MIN_CHAPTER_LENGTH
      || body.length > MAX_CHAPTER_LENGTH
      || body.split(/\n{2,}/).length < 4
      || DISALLOWED_FACTUAL_CLAIM.test(body)
      || DISALLOWED_META_COPY.test(body)
    ) return null;
    return { id: template.id, title: template.title, body };
  });
  if (normalized.some((block) => block === null)) return null;
  const story = normalized as NarrativeBlock[];
  return story.reduce((length, block) => length + block.body.length, 0) >= MIN_TOTAL_STORY_LENGTH ? story : null;
}

@Injectable()
export class AiNarrativeProvider implements NarrativeProvider {
  constructor(@Inject(TemplateNarrativeProvider) private readonly fallback: TemplateNarrativeProvider) {}
  async createBasic(core: ResultCore): Promise<NarrativeResult> {
    const characterStory = await this.fallback.createBasic(core);
    const endpoint = process.env.AI_TEXT_API_URL;
    if (!endpoint) return characterStory;
    try {
      const selectedRelationshipEvent = selectRelationshipEvent(core);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(process.env.AI_TEXT_API_KEY ? { Authorization: `Bearer ${process.env.AI_TEXT_API_KEY}` } : {}) },
        signal: AbortSignal.timeout(30_000),
        body: JSON.stringify({
          core,
          characterDossier: characterStory.storyProfile,
          locale: 'ko',
          version: process.env.CONTENT_VERSION ?? '2.5.0',
          narrator: {
            role: 'a calm master sage reading an old record directly to the user',
            stance: 'immersive but never claim the story is factual or supernatural truth',
          },
          format: {
            chapterIds: basicTemplates.map(({ id }) => id),
            minTotalCharacters: MIN_TOTAL_STORY_LENGTH,
            minChapterCharacters: MIN_CHAPTER_LENGTH,
            maxChapterCharacters: MAX_CHAPTER_LENGTH,
          },
          requiredSceneElements: [
            'time cue',
            'specific place within the historical location',
            'physical object handled by the protagonist',
            'observable action by the scored relationship',
            'choice with an immediate cost',
            'later consequence with a count or measurable change',
          ],
          eventTaxonomy: STORY_EVENT_TAXONOMY,
          selectedRelationshipEvent,
          constraints: [
            'one continuous short story',
            'second-person Korean prose',
            'show one connected incident across daily, relationship, event, and last-memory chapters',
            'use concrete actions and sensory details instead of abstract personality summaries',
            'write each chapter as 4 to 6 short paragraphs separated by one blank line',
            'address the user with the warm authority of a wise storyteller',
            'use only the fictional name, gender, family, wounds, habits, dreams, and ending supplied in characterDossier',
            'make each later choice causally follow from the dossier and earlier chapters',
            'never imply the fictional identity is the user’s real identity',
            'no explicit violence',
            'creative entertainment only',
          ],
        }),
      });
      if (!response.ok) return characterStory;
      const blocks = readStoryBlocks(await response.json());
      return blocks ? { ...characterStory, blocks } : characterStory;
    } catch { return characterStory; }
  }
}
