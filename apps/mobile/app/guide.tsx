import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { colors } from '../src/theme/tokens';

export default function GuideScreen() {
  const router = useRouter();
  return <Screen scroll={false}><Text style={styles.eyebrow}>기억의 조각</Text><Text style={styles.title}>기억은 생각보다 먼저 반응합니다.</Text><Text style={styles.body}>너무 오래 고민하지 말고, 가장 먼저 마음이 가는 것을 선택해 주세요.</Text><PrimaryButton onPress={() => router.replace('/question/1')}>질문 시작하기</PrimaryButton></Screen>;
}

const styles = StyleSheet.create({ eyebrow: { color: colors.accent, fontSize: 15, marginTop: 48 }, title: { color: colors.text, fontSize: 28, lineHeight: 38, fontWeight: '700' }, body: { color: colors.muted, fontSize: 18, lineHeight: 29, flex: 1 } });
