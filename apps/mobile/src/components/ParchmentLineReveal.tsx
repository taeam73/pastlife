import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View, useWindowDimensions, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { playWritingEffect } from '../audio/effects';
import { loadPreferences } from '../session/store';

const LINE_HEIGHT = 25;
const MS_PER_LINE = 350;

export function ParchmentLineReveal({ items, style }: { items: ReactNode[]; style?: StyleProp<ViewStyle> }) {
  const { width } = useWindowDimensions();
  const [heights, setHeights] = useState<number[]>([]);
  const progress = useRef(new Animated.Value(0)).current;
  const units = heights.map((height) => Math.max(1, Math.ceil(height / LINE_HEIGHT)));
  const totalUnits = units.reduce((sum, count) => sum + count, 0);
  const ready = items.length > 0 && items.every((_, index) => (heights[index] ?? 0) > 0);

  useEffect(() => {
    progress.stopAnimation();
    progress.setValue(0);
    setHeights([]);
  }, [width, items.length, progress]);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    void loadPreferences().then((preferences) => {
      if (!active) return;
      if (preferences.reduceMotion) {
        progress.setValue(totalUnits);
        return;
      }
      animation = Animated.timing(progress, { toValue: totalUnits, duration: totalUnits * MS_PER_LINE, useNativeDriver: false });
      animation.start();
      if (preferences.effectsEnabled) void playWritingEffect();
    });
    return () => {
      active = false;
      animation?.stop();
    };
  }, [progress, ready, totalUnits]);

  const revealAll = () => {
    if (!ready) return;
    progress.stopAnimation();
    progress.setValue(totalUnits);
  };
  const onItemLayout = (index: number, event: LayoutChangeEvent) => {
    const height = Math.ceil(event.nativeEvent.layout.height);
    if (height <= 0) return;
    setHeights((prior) => prior[index] === height ? prior : Object.assign([...prior], { [index]: height }));
  };

  let startUnit = 0;
  return <Pressable testID="parchment-line-reveal" accessible={false} onPress={revealAll} style={style}>
    {items.map((item, index) => {
      const height = heights[index];
      const itemUnits = units[index] ?? 1;
      const clipHeight = progress.interpolate({ inputRange: [startUnit, startUnit + itemUnits], outputRange: [0, height ?? 0], extrapolate: 'clamp' });
      startUnit += itemUnits;
      return <View key={index} onLayout={(event) => onItemLayout(index, event)} style={{ width: '100%', height: height ?? undefined }}>
        <Animated.View style={height ? { height: clipHeight, overflow: 'hidden' } : { opacity: 0 }}>{item}</Animated.View>
      </View>;
    })}
  </Pressable>;
}
