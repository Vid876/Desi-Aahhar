import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { PriceSummary } from '@/components/PriceSummary';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { colors, formatCurrency, radius, shadow, spacing } from '@/theme';

const slots = ['10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'];

export default function CheckoutScreen() {
  const { cartItems, cartSubtotal, discount, deliveryFee, grandTotal, selectedAddress, placeOrder, ruleValidation } = useApp();
  const [slot, setSlot] = useState(slots[0]);
  const [payment, setPayment] = useState<'COD' | 'ONLINE'>('COD');
  const [placing, setPlacing] = useState(false);

  if (!cartItems.length) return <Screen><AppHeader title="Checkout" /><View style={styles.empty}><Text style={styles.emptyText}>Cart is empty.</Text><PrimaryButton label="Browse products" onPress={() => router.replace('/(tabs)/home')} /></View></Screen>;

  const confirm = async () => {
    if (!ruleValidation.valid) { Alert.alert('Minimum order not met', `Eligible grocery में ${formatCurrency(ruleValidation.remaining)} और जोड़ें।`); return; }
    try {
      setPlacing(true);
      const order = await placeOrder(payment, slot);
      router.replace({ pathname: '/order-success', params: { id: order.id } });
    } catch (error) {
      Alert.alert(payment === 'ONLINE' ? 'Payment पूरा नहीं हुआ' : 'Order place नहीं हुआ', error instanceof Error ? error.message : 'कृपया दोबारा कोशिश करें।');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Screen>
      <AppHeader title="Checkout" subtitle="Secure order confirmation" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.progress}><View style={styles.progressStep}><View style={styles.done}><Ionicons name="checkmark" size={13} color={colors.white} /></View><Text style={styles.progressLabel}>Cart</Text></View><View style={styles.progressLine} /><View style={styles.progressStep}><View style={styles.active}><Text style={styles.activeText}>2</Text></View><Text style={styles.progressLabel}>Checkout</Text></View><View style={styles.progressLineInactive} /><View style={styles.progressStep}><View style={styles.inactive}><Text style={styles.inactiveText}>3</Text></View><Text style={styles.progressLabelInactive}>Confirmed</Text></View></View>
        <Text style={styles.sectionTitle}>Delivery address</Text>
        <Pressable onPress={() => router.push('/addresses')} style={styles.card}>
          <View style={styles.cardIcon}><Ionicons name="home-outline" size={21} color={colors.forest} /></View>
          <View style={styles.cardCopy}><View style={styles.addressTop}><Text style={styles.cardTitle}>{selectedAddress?.label}</Text><Text style={styles.change}>CHANGE</Text></View><Text style={styles.addressName}>{selectedAddress?.recipient} • {selectedAddress?.phone}</Text><Text style={styles.cardBody}>{selectedAddress?.line1}, {selectedAddress?.city} - {selectedAddress?.pincode}</Text></View>
        </Pressable>
        <Text style={styles.sectionTitle}>Choose delivery slot</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slots}>
          {slots.map((item, index) => <Pressable key={item} onPress={() => setSlot(item)} style={[styles.slot, slot === item && styles.slotSelected]}><Text style={[styles.slotDay, slot === item && styles.slotTextSelected]}>{index < 2 ? 'Today' : 'Tomorrow'}</Text><Text style={[styles.slotTime, slot === item && styles.slotTextSelected]}>{item}</Text>{index === 0 ? <Text style={styles.fast}>FASTEST</Text> : null}</Pressable>)}
        </ScrollView>
        <Text style={styles.sectionTitle}>Payment method</Text>
        <View style={styles.paymentList}>
          <Pressable onPress={() => setPayment('ONLINE')} style={[styles.payment, payment === 'ONLINE' && styles.paymentSelected]}><View style={styles.paymentIcon}><Ionicons name="card-outline" size={21} color={colors.forest} /></View><View style={styles.paymentCopy}><Text style={styles.paymentTitle}>Pay online</Text><Text style={styles.paymentSub}>UPI, cards, netbanking via Razorpay</Text></View><Ionicons name={payment === 'ONLINE' ? 'radio-button-on' : 'radio-button-off'} size={22} color={payment === 'ONLINE' ? colors.forest : colors.muted} /></Pressable>
          <Pressable onPress={() => setPayment('COD')} style={[styles.payment, payment === 'COD' && styles.paymentSelected]}><View style={styles.paymentIcon}><Ionicons name="cash-outline" size={21} color={colors.forest} /></View><View style={styles.paymentCopy}><Text style={styles.paymentTitle}>Cash on delivery</Text><Text style={styles.paymentSub}>Pay when your order arrives</Text></View><Ionicons name={payment === 'COD' ? 'radio-button-on' : 'radio-button-off'} size={22} color={payment === 'COD' ? colors.forest : colors.muted} /></Pressable>
        </View>
        <Text style={styles.sectionTitle}>Order summary</Text>
        <View style={styles.summaryCard}><PriceSummary subtotal={cartSubtotal} discount={discount} deliveryFee={deliveryFee} total={grandTotal} /></View>
        <View style={styles.safe}><Ionicons name="lock-closed" size={16} color={colors.success} /><Text style={styles.safeText}>Payments are encrypted and secure. Order totals are revalidated by the backend before confirmation.</Text></View>
      </ScrollView>
      <View style={styles.bottom}><View><Text style={styles.totalLabel}>TO PAY</Text><Text style={styles.total}>{formatCurrency(grandTotal)}</Text></View><PrimaryButton label={placing ? 'Please wait…' : payment === 'COD' ? 'Place order' : 'Pay securely'} icon={payment === 'COD' ? 'checkmark-circle' : 'lock-closed'} disabled={placing} onPress={confirm} style={styles.button} /></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: 120 }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl }, emptyText: { color: colors.muted },
  progress: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: spacing.lg, paddingHorizontal: spacing.lg }, progressStep: { alignItems: 'center', width: 58 },
  done: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' }, active: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }, inactive: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.line, alignItems: 'center', justifyContent: 'center' }, activeText: { color: colors.white, fontSize: 11, fontWeight: '900' }, inactiveText: { color: colors.muted, fontSize: 11, fontWeight: '900' },
  progressLabel: { color: colors.ink, fontSize: 9, fontWeight: '800', marginTop: 5 }, progressLabelInactive: { color: colors.muted, fontSize: 9, marginTop: 5 }, progressLine: { flex: 1, height: 2, backgroundColor: colors.success, marginTop: 12 }, progressLineInactive: { flex: 1, height: 2, backgroundColor: colors.line, marginTop: 12 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: spacing.xl, marginBottom: spacing.md },
  card: { flexDirection: 'row', padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line }, cardIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }, cardCopy: { flex: 1, marginLeft: spacing.md }, addressTop: { flexDirection: 'row', justifyContent: 'space-between' }, cardTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' }, change: { color: colors.forest, fontSize: 9, fontWeight: '900' }, addressName: { color: colors.ink, fontSize: 10, marginTop: 5 }, cardBody: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  slots: { gap: spacing.md }, slot: { minWidth: 138, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white }, slotSelected: { borderColor: colors.forest, backgroundColor: colors.mint }, slotDay: { color: colors.muted, fontSize: 9, fontWeight: '800' }, slotTime: { color: colors.ink, fontSize: 11, fontWeight: '900', marginTop: 4 }, slotTextSelected: { color: colors.forest }, fast: { color: colors.success, fontSize: 7, fontWeight: '900', marginTop: 6 },
  paymentList: { gap: spacing.md }, payment: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line }, paymentSelected: { borderColor: colors.forest, backgroundColor: colors.mint }, paymentIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, paymentCopy: { flex: 1, marginLeft: spacing.md }, paymentTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' }, paymentSub: { color: colors.muted, fontSize: 9, marginTop: 3 },
  summaryCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.line }, safe: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.successLight, borderRadius: radius.md, marginTop: spacing.lg }, safeText: { flex: 1, color: colors.success, fontSize: 9, lineHeight: 14 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.xl, ...shadow }, totalLabel: { color: colors.muted, fontSize: 9, fontWeight: '800' }, total: { color: colors.ink, fontSize: 20, fontWeight: '900' }, button: { flex: 1 },
});
