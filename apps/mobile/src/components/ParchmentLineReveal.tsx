import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { playWritingEffect } from '../audio/effects';
import { loadPreferences } from '../session/store';

export function ParchmentLineReveal({ items, style }: { items: ReactNode[]; style?: StyleProp<ViewStyle> }) {
  const opacities = useRef(items.map(() => new Animated.Value(0))).current;
  const offsets = useRef(items.map(() => new Animated.Value(5))).current;

  useEffect(() => {
    let active = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    opacities.forEach((value) => value.setValue(0));
    offsets.forEach((value) => value.setValue(5));
    void loadPreferences().then((preferences) => {
      if (!active) return;
      if (preferences.reduceMotion) {
        opacities.forEach((value) => value.setValue(1));
        offsets.forEach((value) => value.setValue(0));
        return;
      }
      Animated.stagger(170, items.map((_, index) => Animated.parallel([
        Animated.timing(opacities[index]!, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(offsets[index]!, { toValue: 0, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ]))).start();
      if (preferences.effectsEnabled) items.forEach((_, index) => {
        const timer = setTimeout(() => { if (active) void playWritingEffect(); }, index * 170);
        timers.push(timer);
      });
    });
    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, [offsets, opacities]);

  return <Animated.View style={style}>{items.map((item, index) => <Animated.View key={index} style={{ opacity: opacities[index]!, transform: [{ translateY: offsets[index]! }] }}>{item}</Animated.View>)}</Animated.View>;
}
