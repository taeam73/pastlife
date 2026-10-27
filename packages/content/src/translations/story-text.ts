import type { StorySignal } from '../types.js';

export type StoryTextTranslation = {
  card: {
    name: string; home: string; identityLine: string; title: string; role: string; world: string; flavor: string;
    opening: string; life: string; turn: string; decision: string; cost: string; after: string;
    presentEcho: string; secondLook: string; unresolved: string; readerQuestion: string;
    signalMoments: Partial<Record<StorySignal, string>>;
    setting?: { worldName: string; year: string; polity: string; region: string; gender: string };
  };
  manuscript: {
    identity: { era: string; region: string; gender: string; birthYear: string; deathYear: string; summary: string; profilePages?: readonly { title: string; body: string }[] };
    episode: { beforeSignal: string; signalMoments: Partial<Record<StorySignal, string>>; afterSignal: string };
    timeline: readonly { when: string; event: string }[];
    memories: readonly { label: string; detail: string }[];
  };
  finalMoment: { year: string; place: string; protagonist: string; scene: string; afterword: string; artAlt: string };
};
