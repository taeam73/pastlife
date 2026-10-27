import { type PropsWithChildren, useEffect, useState } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { usePathname } from 'expo-router';
import { Platform } from 'react-native';
import { DEFAULT_PREFERENCES, loadPreferences, subscribePreferences } from '../session/store';
import { AUDIO_LEVELS, experienceRoute } from './config';
import { hydrateEffectPreferences, prepareEffects } from './effects';

export function AudioExperience({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const music = useAudioPlayer(require('../../assets/audio/empty-city.ogg'));
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false, interruptionMode: 'mixWithOthers' });
    void prepareEffects();
    void hydrateEffectPreferences();
    void loadPreferences().then(setPreferences);
    return subscribePreferences(setPreferences);
  }, []);

  useEffect(() => {
    let active = true;
    let removeInteractionListeners: (() => void) | undefined;
    void Promise.resolve().then(() => {
      if (!active) return;
      const shouldPlay = preferences.bgmEnabled && experienceRoute.test(pathname);
      if (!shouldPlay) {
        music.pause();
        return;
      }
      music.loop = true;
      music.volume = AUDIO_LEVELS.music;
      const play = () => { try { music.play(); } catch { /* Audio is optional. */ } };
      if (Platform.OS === 'web' && typeof document !== 'undefined' && !navigator.userActivation?.hasBeenActive) {
        const beginAfterInteraction = () => {
          play();
          removeInteractionListeners?.();
        };
        document.addEventListener('pointerdown', beginAfterInteraction, { once: true });
        document.addEventListener('keydown', beginAfterInteraction, { once: true });
        removeInteractionListeners = () => {
          document.removeEventListener('pointerdown', beginAfterInteraction);
          document.removeEventListener('keydown', beginAfterInteraction);
        };
      } else play();
    });
    return () => {
      active = false;
      removeInteractionListeners?.();
    };
  }, [music, pathname, preferences]);

  return children;
}
