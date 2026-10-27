import { createAudioPlayer, preload, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import { DEFAULT_PREFERENCES, loadPreferences, subscribePreferences } from '../session/store';
import { AUDIO_LEVELS } from './config';

const writingSource = require('../../assets/audio/pencil-write.ogg');
const choiceSource = require('../../assets/audio/choice-heavy.ogg');

let writingPlayer: AudioPlayer | null = null;
let choicePlayer: AudioPlayer | null = null;
let prepared: Promise<void> | null = null;
let effectsEnabled = DEFAULT_PREFERENCES.effectsEnabled;

subscribePreferences((preferences) => { effectsEnabled = preferences.effectsEnabled; });

export function prepareEffects() {
  if (Platform.OS === 'web' && typeof window === 'undefined') return Promise.resolve();
  prepared ??= Promise.all([
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers' }),
    preload(writingSource),
    preload(choiceSource),
  ]).then(() => {
    writingPlayer ??= createAudioPlayer(writingSource);
    choicePlayer ??= createAudioPlayer(choiceSource);
  }).catch((error: unknown) => {
    prepared = null;
    if (__DEV__) console.warn('Audio preload failed', error);
  });
  return prepared;
}

export async function hydrateEffectPreferences() {
  const preferences = await loadPreferences();
  effectsEnabled = preferences.effectsEnabled;
}

async function playEffect(player: AudioPlayer | null, create: () => AudioPlayer, volume: number) {
  if (!effectsEnabled) return player;
  try {
    await prepareEffects();
    const nextPlayer = player ?? create();
    nextPlayer.pause();
    await nextPlayer.seekTo(0);
    nextPlayer.volume = volume;
    nextPlayer.play();
    return nextPlayer;
  } catch (error) {
    if (__DEV__) console.warn('Effect playback failed', error);
    return player;
  }
}

export async function playWritingEffect() {
  writingPlayer = await playEffect(writingPlayer, () => createAudioPlayer(writingSource), AUDIO_LEVELS.writing) ?? writingPlayer;
}

export async function playChoiceEffect() {
  choicePlayer = await playEffect(choicePlayer, () => createAudioPlayer(choiceSource), AUDIO_LEVELS.choice) ?? choicePlayer;
}
