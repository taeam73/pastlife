import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { loadPreferences } from '../session/store';

let writingPlayer: AudioPlayer | null = null;
let choicePlayer: AudioPlayer | null = null;

async function playEffect(player: AudioPlayer | null, create: () => AudioPlayer, volume: number) {
  const preferences = await loadPreferences();
  if (!preferences.effectsEnabled) return player;
  try {
    const nextPlayer = player ?? create();
    nextPlayer.pause();
    await nextPlayer.seekTo(0);
    nextPlayer.volume = volume;
    nextPlayer.play();
    return nextPlayer;
  } catch {
    return player;
  }
}

export async function playWritingEffect() {
  writingPlayer = await playEffect(writingPlayer, () => createAudioPlayer(require('../../assets/audio/pencil-write.ogg')), 0.18) ?? writingPlayer;
}

export async function playChoiceEffect() {
  choicePlayer = await playEffect(choicePlayer, () => createAudioPlayer(require('../../assets/audio/choice-heavy.ogg')), 0.16) ?? choicePlayer;
}
