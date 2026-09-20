import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function ResultBlock({ title, body }: { title: string; body: string }) {
  const paragraphs = body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.bodyGroup}>{paragraphs.map((paragraph, index) => <Text key={`${index}-${paragraph.slice(0, 12)}`} style={styles.body}>{paragraph}</Text>)}</View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, gap: spacing.md },
  title: { color: colors.accent, fontSize: 17, lineHeight: 25, fontWeight: '700' },
  bodyGroup: { gap: 16 },
  body: { color: colors.text, fontSize: 16, lineHeight: 28 },
});
