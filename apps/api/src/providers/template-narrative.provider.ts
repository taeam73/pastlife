import { Injectable } from '@nestjs/common';
import {
  basicTemplates, eras, historicalLocations, lastMemories, lifeEvents,
  occupations, personalities, relationships,
} from '@pastlife/content';
import type { ResultCore } from '@pastlife/scoring';
import type { NarrativeProvider } from './narrative.provider.js';

@Injectable()
export class TemplateNarrativeProvider implements NarrativeProvider {
  async createBasic(core: ResultCore) {
    const era = eras.find(({ id }) => id === core.eraId)!;
    const location = historicalLocations.find(({ id }) => id === core.locationId)!;
    const occupation = occupations.find(({ id }) => id === core.occupationId)!;
    const personality = personalities.find(({ id }) => id === core.personalityId)!;
    const relationship = relationships.find(({ id }) => id === core.relationshipId)!;
    const event = lifeEvents.find(({ id }) => id === core.eventId)!;
    const memory = lastMemories.find(({ id }) => id === core.lastMemoryId)!;
    const bodies = [
      `${era.label}, ${location.label}에서 ${occupation.label}(으)로 남은 기록입니다.`,
      `당신의 기록에는 ${personality.label}(으)로 기억되는 모습이 선명합니다.`,
      `${occupation.label}의 일상 속에서 지식과 관계를 차분히 쌓아 갔습니다.`,
      `${relationship.label}과의 약속은 삶의 방향을 오래 붙들었습니다.`,
      `${event.label}이 기록의 큰 갈림길로 남아 있습니다.`,
      `마지막 장면에는 ${memory.label}이 조용히 이어집니다.`,
      `그때의 선택은 지금도 익숙한 감각과 관계를 소중히 여기는 마음으로 남아 있을 수 있습니다.`,
    ];
    return basicTemplates.map((template, index) => ({ id: template.id, title: template.title, body: bodies[index]! }));
  }
}
