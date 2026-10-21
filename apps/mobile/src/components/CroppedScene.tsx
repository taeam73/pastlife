import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { resolveLibraryImage } from '../results/libraryImages';
import { cropLayout, type Crop } from '../results/crop';

export function CroppedScene({ uri, crop, accessibilityLabel }: { uri: string; crop: Crop; accessibilityLabel: string }) {
  const source = resolveLibraryImage(uri) ?? (/^https?:\/\//.test(uri) ? { uri } : undefined);
  const resolved = source && typeof source === 'object' && !Array.isArray(source)
    ? source as { uri?: string; width?: number; height?: number }
    : undefined;
  const [sourceSize, setSourceSize] = useState({ width: resolved?.width ?? 0, height: resolved?.height ?? 0 });
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!uri || (resolved?.width && resolved?.height)) return;
    Image.getSize(resolved?.uri ?? uri, (width, height) => setSourceSize({ width, height }), () => undefined);
  }, [uri, resolved?.width, resolved?.height]);
  if (!source) return null;
  const sourceWidth = resolved?.width ?? sourceSize.width;
  const sourceHeight = resolved?.height ?? sourceSize.height;
  const layout = cropLayout(sourceWidth, sourceHeight, frame.width, frame.height, crop);
  return <View style={styles.frame} onLayout={(event) => setFrame({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}>
    {layout
      ? <Image accessibilityLabel={accessibilityLabel} source={source} resizeMode="stretch" style={[styles.image, layout]} />
      : <Image accessibilityLabel={accessibilityLabel} source={source} resizeMode="cover" style={StyleSheet.absoluteFill} />}
  </View>;
}

const styles = StyleSheet.create({ frame: { width: '100%', height: '100%', overflow: 'hidden' }, image: { position: 'absolute' } });
