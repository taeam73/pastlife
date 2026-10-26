/** Read-only, single-ID source packet for the human internal-consistency pass. */
import { storyCards, storyFinalMoments, storyManuscripts } from '@pastlife/content';

const id = process.argv[2];
if (!id) throw new Error('Usage: node scripts/tsx-cli.mjs scripts/print-story-consistency-packet.ts STORY_ID');
const manuscript = storyManuscripts.find((entry) => entry.id === id);
const card = storyCards.find((entry) => entry.id === id);
const finalMoment = storyFinalMoments.find((entry) => entry.storyId === id);
if (!manuscript || !card || !finalMoment) throw new Error(`Missing manuscript, card, or final moment: ${id}`);

const lines: string[] = [`# ${id} — ${card.name}`, '## 카드·설정',
  JSON.stringify({ name: card.name, home: card.home, role: card.role, world: card.world,
    setting: card.setting, signals: card.signals, opening: card.opening, life: card.life,
    turn: card.turn, decision: card.decision, cost: card.cost, after: card.after,
    signalMoments: card.signalMoments }, null, 2),
  '## 01 프로필', JSON.stringify(manuscript.identity, null, 2),
  '## 02 전생록 화자·답변 신호', JSON.stringify(manuscript.episode, null, 2),
  '## 03 연대기', JSON.stringify(manuscript.timeline, null, 2),
  '## 04 기억과 평가', JSON.stringify(manuscript.memories, null, 2),
  '## 마지막 순간·삽화 연결', JSON.stringify(finalMoment, null, 2)];
console.log(lines.join('\n\n'));
