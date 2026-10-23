import { describe, expect, it } from 'vitest';
import { questions, questionsForVersion, selectQuestion, storyCards, storyQuestions } from '../src/index.js';

describe('story-first questions', () => {
  it('keeps published questions for older sessions', () => {
    expect(questionsForVersion('2.5.0')).toBe(questions);
    expect(questionsForVersion('3.0.0')).toBe(storyQuestions);
  });

  it('has four six-choice scenes for every stage', () => {
    expect(storyQuestions).toHaveLength(24);
    for (const stage of [1, 2, 3, 4, 5, 6]) {
      expect(storyQuestions.filter((question) => question.stage === stage)).toHaveLength(4);
    }
    expect(storyQuestions.every((question) => question.choices.length === 6)).toBe(true);
    expect(storyQuestions.reduce((total, question) => total + question.choices.length, 0)).toBe(144);
    expect(new Set(storyQuestions.map((question) => question.id)).size).toBe(24);
    for (const question of storyQuestions) {
      expect(question.choices.map((choice) => choice.id)).toEqual(Array.from({ length: 6 }, (_, index) => `${question.id}_C${index + 1}`));
      expect(new Set(question.choices.map((choice) => choice.text)).size).toBe(6);
      expect(new Set(question.choices.map((choice) => choice.storySignals?.[0])).size).toBe(6);
      expect(question.choices.every((choice) => choice.tagScores.length === 1 && choice.tagScores[0]!.score === 2)).toBe(true);
    }
  });

  it('keeps the published choice routes while question copy changes', () => {
    const routes = [
      'notice connect rest explore', 'notice connect rest explore',
      'notice connect speak explore', 'notice connect rest explore',
      'notice connect rest repair', 'notice connect explore protect',
      'notice connect repair explore', 'notice explore rest protect',
      'notice connect rest speak', 'notice connect speak protect',
      'notice connect explore protect', 'notice connect speak release',
      'notice explore repair speak', 'notice connect repair protect',
      'notice connect speak explore', 'repair rest speak protect',
      'notice connect repair release', 'notice connect speak protect',
      'repair speak connect release', 'notice connect protect release',
      'notice connect rest explore', 'notice connect speak release',
      'notice connect repair release', 'notice connect speak release',
    ];
    expect(storyQuestions.map((question) => question.choices.slice(0, 4).map((choice) => choice.storySignals?.[0]).join(' '))).toEqual(routes);
    const newRoutes = [
      'speak protect', 'speak protect', 'rest protect', 'speak protect',
      'speak protect', 'rest release', 'speak protect', 'connect speak',
      'protect explore', 'explore repair', 'speak rest', 'rest explore',
      'connect rest', 'speak explore', 'repair protect', 'notice connect',
      'rest speak', 'rest release', 'notice protect', 'rest speak',
      'repair protect', 'rest explore', 'protect rest', 'rest protect',
    ];
    expect(storyQuestions.map((question) => question.choices.slice(4).map((choice) => choice.storySignals?.[0]).join(' '))).toEqual(newRoutes);
  });

  it('selects a new question deterministically and avoids a recently seen one', () => {
    const first = selectQuestion({ stage: 3, sessionSeed: 'reader', contentVersion: '3.0.0', excludedQuestionIds: [] });
    const second = selectQuestion({ stage: 3, sessionSeed: 'reader', contentVersion: '3.0.0', excludedQuestionIds: [] });
    expect(first.id).toBe(second.id);
    const fresh = selectQuestion({ stage: 3, sessionSeed: 'reader', contentVersion: '3.0.0', excludedQuestionIds: [first.id] });
    expect(fresh.id).not.toBe(first.id);
  });

  it('keeps a complete human-led card library with authored response moments', () => {
    expect(storyCards.length).toBeGreaterThanOrEqual(12);
    expect(storyCards.filter((card) => card.rare)).toHaveLength(1);
    expect(new Set(storyCards.map((card) => card.id)).size).toBe(storyCards.length);
    for (const card of storyCards) {
      expect([card.opening, card.life, card.turn, card.decision, card.cost, card.after].every((part) => part.length > 20)).toBe(true);
      expect([card.name, card.home, card.identityLine, card.title, card.role, card.world, card.flavor, card.presentEcho, card.secondLook, card.unresolved, card.readerQuestion]
        .every((part) => part.trim().length > 0)).toBe(true);
      expect(card.identityLine).toContain(card.name);
      expect(card.identityLine).toContain(card.home);
      expect(card.signals).toHaveLength(3);
      expect(new Set(card.signals).size).toBe(3);
      expect(Object.keys(card.signalMoments).sort()).toEqual([...card.signals].sort());
      expect(card.signals.every((signal) => (card.signalMoments[signal]?.trim().length ?? 0) > 20)).toBe(true);
    }
    expect(new Set(storyCards.map((card) => `${card.name}:${card.home}`)).size).toBe(storyCards.length);
  });
});
