import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, formatCurrency, radius, spacing } from '@/theme';
import { RuleValidation } from '@/types';

export function RuleProgress({ validation, compact = false }: { validation: RuleValidation; compact?: boolean }) {
  const tone = validation.valid ? colors.success : colors.saffron;
  const background = validation.valid ? colors.successLight : colors.saffronLight;
  const title = !validation.hasEligibleItems
    ? 'Fresh items par minimum order नहीं'
    : validation.valid
      ? '₹500 grocery minimum पूरा हो गया'
      : `${formatCurrency(validation.remaining)} और जोड़ें`;
  const body = !validation.hasEligibleItems
    ? 'Vegetables, fruits और dairy सीधे checkout कर सकते हैं।'
    : validation.valid
      ? `Eligible grocery subtotal ${formatCurrency(validation.eligibleSubtotal)}`
      : `Selected grocery पर ${formatCurrency(validation.threshold)} minimum लागू है।`;

  return (
    <View style={[styles.card, { backgroundColor: background }, compact && styles.compact]}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: tone }]}>
          <Ionicons name={validation.valid ? 'checkmark' : 'basket-outline'} size={16} color={colors.white} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
      </View>
      {validation.hasEligibleItems ? (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(validation.progress * 100)}%`, backgroundColor: tone }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radius.lg, gap: spacing.md },
  compact: { padding: spacing.md, borderRadius: radius.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  title: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  body: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  track: { height: 7, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.7)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
