import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function ResultBlock({ title, body }: { title: string; body: string }) {
  return <View style={styles.card}><Text style={styles.title}>{title}</Text><Text style={styles.body}>{body}</Text></View>;
}

const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, gap: spacing.sm }, title: { color: colors.accent, fontSize: 16, fontWeight: '700' }, body: { color: colors.text, fontSize: 16, lineHeight: 25 } });
