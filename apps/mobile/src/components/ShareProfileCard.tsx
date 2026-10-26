import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { resolveLibraryImage } from '../results/libraryImages';

type Layer = { uri: string; role: 'BACKGROUND' | 'CHARACTER' | 'EFFECT'; alt: string };
type Cover = { era: string; place: string; role: string; birthYear: string; deathYear: string; lifeLine: string };

function imageSource(uri: string) {
  return resolveLibraryImage(uri) ?? (/^https?:\/\//.test(uri) ? { uri } : undefined);
}

export function ShareProfileCard({ name, recordNo, cover, layers, relationship, onImagesReady }: {
  name: string;
  recordNo: number;
  cover: Cover;
  layers: Layer[];
  relationship: string;
  onImagesReady?: () => void;
}) {
  const background = layers.find((layer) => layer.role === 'BACKGROUND');
  const character = layers.find((layer) => layer.role === 'CHARACTER');
  const backgroundSource = background && imageSource(background.uri);
  const characterSource = character && imageSource(character.uri);
  const [loaded, setLoaded] = useState(0);
  const notifiedReady = useRef(false);
  const expected = 1 + (backgroundSource ? 1 : 0) + (characterSource ? 1 : 0);
  const markLoaded = () => setLoaded((count) => Math.min(count + 1, expected));
  useEffect(() => {
    if (loaded < expected || notifiedReady.current) return;
    notifiedReady.current = true;
    onImagesReady?.();
  }, [loaded, expected, onImagesReady]);
  return <View testID="share-profile-card" style={styles.card} collapsable={false}>
    {backgroundSource ? <Image source={backgroundSource} accessibilityLabel={background?.alt} resizeMode="cover" style={styles.background} onLoad={markLoaded} /> : null}
    {characterSource ? <Image source={characterSource} accessibilityLabel={character?.alt} resizeMode="contain" style={[styles.character, character?.uri === 'asset://stories/v3/lagos-bisi-hairdresser.webp' && styles.lowerWalkingCharacter]} onLoad={markLoaded} /> : null}
    <View pointerEvents="none" style={styles.topShade} />
    <Image source={require('../../assets/branding/title-logo-plain.png')} accessibilityLabel="전생록" resizeMode="contain" style={styles.logo} onLoad={markLoaded} />
    <View style={styles.profile}>
      <Text style={styles.eyebrow}>당신의 {recordNo}번째 전생은</Text>
      <Text style={styles.name}>{name} <Text style={styles.years}>({cover.birthYear}~{cover.deathYear})</Text></Text>
      <Text style={styles.meta}>{cover.era} · {cover.place}</Text>
      <Text style={styles.meta}>{cover.role}</Text>
      {relationship ? <Text style={styles.relationship}>{relationship}</Text> : null}
      <Text style={styles.lifeLine}>{cover.lifeLine}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 480, aspectRatio: 3 / 5, alignSelf: 'center', overflow: 'hidden', backgroundColor: '#101722' },
  background: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  character: { position: 'absolute', width: '78%', height: '75%', right: 0, bottom: '18%' },
  lowerWalkingCharacter: { bottom: '13%' },
  topShade: { position: 'absolute', left: 0, right: 0, top: 0, height: 92, backgroundColor: 'rgba(9, 16, 26, 0.35)' },
  logo: { position: 'absolute', top: 16, left: 16, width: 108, height: 40 },
  profile: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: '38%', paddingHorizontal: 22, paddingTop: 20, paddingBottom: 24, gap: 5, backgroundColor: 'rgba(9, 16, 26, 0.9)' },
  eyebrow: { color: '#e9ca81', fontSize: 13, lineHeight: 20, fontWeight: '700' },
  name: { color: '#fff7e8', fontSize: 24, lineHeight: 32, fontWeight: '700' },
  years: { color: '#f3dfb7', fontSize: 12, lineHeight: 18, fontWeight: '400' },
  meta: { color: '#fff2d8', fontSize: 13, lineHeight: 19 },
  relationship: { color: '#f0dbb0', fontSize: 13, lineHeight: 19, marginTop: 7 },
  lifeLine: { color: '#fff7e8', fontSize: 13, lineHeight: 19, marginTop: 4 },
});
