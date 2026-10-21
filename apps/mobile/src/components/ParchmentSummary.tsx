import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '../theme/tokens';

export function ParchmentSummary({ title, body, keyword }: { title: string; body: string; keyword?: string | undefined }) {
  return <View style={styles.panel}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.body}>{body}</Text>
    {keyword ? <Text style={styles.keyword}>{keyword}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  panel: { width: '100%', maxWidth: 760, minHeight: 122, padding: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: '#b89456', backgroundColor: '#dcc79a', gap: 5 },
  title: { color: '#4a321e', fontSize: 17, lineHeight: 23, fontWeight: '800', textAlign: 'center' },
  body: { color: '#4a321e', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  keyword: { color: '#76532b', fontSize: 12, lineHeight: 17, textAlign: 'center', fontWeight: '700' },
});
