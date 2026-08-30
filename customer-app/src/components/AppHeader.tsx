import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = { title: string; subtitle?: string; right?: ReactNode; canGoBack?: boolean };

export function AppHeader({ title, subtitle, right, canGoBack = true }: Props) {
  return (
    <View style={styles.header}>
      {canGoBack ? (
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={23} color={colors.ink} />
        </Pressable>
      ) : <View style={styles.iconSpacer} />}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 66, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconButton: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  iconSpacer: { width: 4 },
  copy: { flex: 1 },
  title: { color: colors.ink, fontSize: 20, lineHeight: 25, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  right: { minWidth: 42, alignItems: 'flex-end' },
});
