import { type PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { loadPreferences } from '../session/store';

type Variant = 'question-first' | 'question-next' | 'result';

const MOTION: Record<Variant, { x: number; y: number; scale: number; duration: number }> = {
  'question-first': { x: 0, y: 16, scale: 1, duration: 360 },
  'question-next': { x: 26, y: 0, scale: 1, duration: 300 },
  result: { x: 0, y: 18, scale: 0.985, duration: 520 },
};

export function SceneTransition({ children, variant, trigger, style }: PropsWithChildren<{ variant: Variant; trigger: string | number; style?: StyleProp<ViewStyle> }>) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let active = true;
    const motion = MOTION[variant];
    opacity.setValue(0);
    translateX.setValue(motion.x);
    translateY.setValue(motion.y);
    scale.setValue(motion.scale);

    void loadPreferences().then((preferences) => {
      if (!active) return;
      if (preferences.reduceMotion) {
        opacity.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
        scale.setValue(1);
        return;
      }
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: motion.duration, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(translateX, { toValue: 0, duration: motion.duration, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(translateY, { toValue: 0, duration: motion.duration, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(scale, { toValue: 1, duration: motion.duration, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    });
    return () => { active = false; };
  }, [opacity, scale, translateX, translateY, trigger, variant]);

  return <Animated.View style={[style, { opacity, transform: [{ translateX }, { translateY }, { scale }] }]}>{children}</Animated.View>;
}
