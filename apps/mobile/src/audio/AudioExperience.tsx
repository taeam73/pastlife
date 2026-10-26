import { type PropsWithChildren, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { usePathname } from 'expo-router';
import { Platform } from 'react-native';
import { loadPreferences } from '../session/store';

const experienceRoute = /^\/(?:$|guide$|question\/\d+$|analysis$|result$|final-moment$|deep$)/u;

export function AudioExperience({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const music = useAudioPlayer(require('../../assets/audio/empty-city.ogg'));

  useEffect(() => {
    let active = true;
    let removeInteractionListeners: (() => void) | undefined;
    void loadPreferences().then((preferences) => {
      if (!active) return;
      const shouldPlay = preferences.bgmEnabled && experienceRoute.test(pathname);
      if (!shouldPlay) {
        music.pause();
        return;
      }
      music.loop = true;
      music.volume = 0.065;
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
  }, [music, pathname]);

  return children;
}
