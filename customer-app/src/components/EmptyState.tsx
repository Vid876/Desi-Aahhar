import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { PrimaryButton } from './PrimaryButton';

export function EmptyState({ icon, title, body, action, onAction }: {
  icon: keyof typeof Ionicons.glyphMap; title: string; body: string; action?: string; onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}><Ionicons name={icon} size={36} color={colors.forest} /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {action && onAction ? <PrimaryButton label={action} onPress={onAction} style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 420, alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl },
  icon: { width: 74, height: 74, borderRadius: radius.pill, backgroundColor: colors.leafLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { color: colors.ink, fontSize: 21, fontWeight: '900', textAlign: 'center' },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: spacing.sm, maxWidth: 290 },
  button: { marginTop: spacing.xl, minWidth: 190 },
});
