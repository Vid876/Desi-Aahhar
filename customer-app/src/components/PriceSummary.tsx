import { StyleSheet, Text, View } from 'react-native';

import { colors, formatCurrency, spacing } from '@/theme';

type Props = { subtotal: number; discount: number; deliveryFee: number; total: number };

function SummaryRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, positive && styles.positive]}>{value}</Text>
    </View>
  );
}

export function PriceSummary({ subtotal, discount, deliveryFee, total }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Bill details</Text>
      <SummaryRow label="Item subtotal" value={formatCurrency(subtotal)} />
      {discount ? <SummaryRow label="Coupon discount" value={`- ${formatCurrency(discount)}`} positive /> : null}
      <SummaryRow label="Delivery fee" value={deliveryFee ? formatCurrency(deliveryFee) : 'FREE'} positive={!deliveryFee} />
      <View style={styles.divider} />
      <SummaryRow label="To pay" value={formatCurrency(total)} />
      <Text style={styles.note}>Inclusive of all taxes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  heading: { color: colors.ink, fontSize: 16, fontWeight: '900', marginBottom: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: colors.muted, fontSize: 14 },
  value: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  positive: { color: colors.success },
  divider: { height: 1, backgroundColor: colors.line },
  note: { color: colors.muted, fontSize: 10, textAlign: 'right', marginTop: -8 },
});
