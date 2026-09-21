import { describe, expect, it } from 'vitest';
import { scenarioEndingVariants, scenarioEventVariants, scenarioRelationshipVariants, selectScenarioVariants, storyScenarioCounts, storyScenarios, selectStoryScenario } from '../src/providers/story-scenario-catalog.js';

describe('story scenario catalog', () => {
  it('contains five concrete variants for each of twenty story domains', () => {
    expect(storyScenarios).toHaveLength(900);
    expect(Object.values(storyScenarioCounts())).toEqual(Array(20).fill(45));
  });

  it('supports a soldier life shaped by war and return', () => {
    const scenario = selectStoryScenario({ answerHash: 'war', recordNo: 1, eventId: 'EVENT_01', occupationId: 'OCC_SOLDIER' });
    expect(scenario).toBeDefined();
    expect(scenario.compatibleOccupations).toContain('OCC_SOLDIER');
    expect(scenario.choice.length).toBeGreaterThan(0);
  });

  it('selects deterministically', () => {
    const core = { answerHash: 'same', recordNo: 4, eventId: 'EVENT_04', occupationId: 'OCC_MERCHANT' } as const;
    expect(selectStoryScenario(core)).toEqual(selectStoryScenario(core));
  });

  it('provides five event, four relationship, and four ending variants for every scenario', () => {
    expect(scenarioEventVariants).toHaveLength(900 * 5);
    expect(scenarioRelationshipVariants).toHaveLength(900 * 4);
    expect(scenarioEndingVariants).toHaveLength(900 * 4);
    const selected = selectScenarioVariants({ answerHash: 'coverage', recordNo: 9, eventId: 'EVENT_09', occupationId: 'OCC_SOLDIER' });
    expect(selected.event.scenarioId).toBe(selected.scenario.id);
    expect(selected.relationship.scenarioId).toBe(selected.scenario.id);
    expect(selected.ending.scenarioId).toBe(selected.scenario.id);
  });
});
