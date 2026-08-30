import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { PriceSummary } from '@/components/PriceSummary';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuantityStepper } from '@/components/QuantityStepper';
import { RuleProgress } from '@/components/RuleProgress';
import { useApp } from '@/context/AppContext';
import { colors, formatCurrency, radius, shadow, spacing } from '@/theme';

export default function CartScreen() {
  const { cartItems, cartCount, cartSubtotal, discount, deliveryFee, grandTotal, ruleValidation, appliedCoupon, updateQuantity, clearCart, applyCoupon } = useApp();
  const [code, setCode] = useState('');
  const submitCoupon = () => { const result = applyCoupon(code); Alert.alert(result.success ? 'Offer applied' : 'Coupon issue', result.message); };

  if (!cartItems.length) {
    return <View style={styles.screen}><View style={styles.emptyHeader}><Text style={styles.title}>Your cart</Text></View><EmptyState icon="basket-outline" title="आपका cart खाली है" body="Fresh groceries और daily essentials जोड़ें—हम आपकी टोकरी यहीं संभालकर रखेंगे।" action="Start shopping" onAction={() => router.push('/(tabs)/home')} /></View>;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View><Text style={styles.title}>Your cart</Text><Text style={styles.subtitle}>{cartCount} items selected</Text></View>
        <Pressable onPress={() => Alert.alert('Clear cart?', 'सभी items हट जाएँगे।', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: clearCart }])}><Text style={styles.clear}>Clear</Text></Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <RuleProgress validation={ruleValidation} />
        <View style={styles.items}>
          {cartItems.map((item) => (
            <View key={`${item.productId}-${item.variantId}`} style={styles.item}>
              <View style={styles.itemVisual}><Text style={styles.itemEmoji}>{item.product.emoji}</Text></View>
              <View style={styles.itemCopy}>
                <Text numberOfLines={1} style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemVariant}>{item.variant.label}</Text>
                <View style={styles.itemBottom}>
                  <View><Text style={styles.itemPrice}>{formatCurrency(item.variant.price * item.quantity)}</Text>{item.variant.mrp > item.variant.price ? <Text style={styles.itemMrp}>{formatCurrency(item.variant.mrp * item.quantity)}</Text> : null}</View>
                  <QuantityStepper compact value={item.quantity} onChange={(quantity) => updateQuantity(item.productId, item.variantId, quantity)} />
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.couponCard}>
          <View style={styles.couponHeader}><Ionicons name="pricetag-outline" size={20} color={colors.forest} /><Text style={styles.couponTitle}>Apply coupon</Text><Pressable onPress={() => router.push('/offers')}><Text style={styles.viewOffers}>View offers</Text></Pressable></View>
          {appliedCoupon ? (
            <View style={styles.applied}><Ionicons name="checkmark-circle" size={21} color={colors.success} /><Text style={styles.appliedText}>{appliedCoupon.code} applied • You save {formatCurrency(appliedCoupon.discount)}</Text></View>
          ) : (
            <View style={styles.couponInput}>
              <TextInput autoCapitalize="characters" placeholder="Enter coupon code" placeholderTextColor="#9AA39C" value={code} onChangeText={setCode} style={styles.input} />
              <Pressable onPress={submitCoupon} style={styles.apply}><Text style={styles.applyText}>APPLY</Text></Pressable>
            </View>
          )}
        </View>
        <View style={styles.bill}><PriceSummary subtotal={cartSubtotal} discount={discount} deliveryFee={deliveryFee} total={grandTotal} /></View>
        <View style={styles.assurance}><Ionicons name="shield-checkmark" size={25} color={colors.success} /><View><Text style={styles.assuranceTitle}>100% quality assurance</Text><Text style={styles.assuranceBody}>Easy returns for damaged or incorrect items.</Text></View></View>
      </ScrollView>
      <View style={styles.checkoutBar}>
        <View><Text style={styles.totalLabel}>TOTAL</Text><Text style={styles.total}>{formatCurrency(grandTotal)}</Text></View>
        <PrimaryButton label={ruleValidation.valid ? 'Proceed to checkout' : `Add ${formatCurrency(ruleValidation.remaining)}`} icon="arrow-forward" disabled={!ruleValidation.valid} onPress={() => router.push('/checkout')} style={styles.checkoutButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.warmWhite, paddingTop: 50 },
  emptyHeader: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  title: { color: colors.ink, fontSize: 27, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
  clear: { color: colors.danger, fontSize: 12, fontWeight: '800' },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 120, gap: spacing.lg },
  items: { gap: spacing.md },
  item: { flexDirection: 'row', padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  itemVisual: { width: 76, height: 82, borderRadius: radius.md, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  itemEmoji: { fontSize: 43 },
  itemCopy: { flex: 1, marginLeft: spacing.md },
  itemName: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  itemVariant: { color: colors.muted, fontSize: 11, marginTop: 3 },
  itemBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.md },
  itemPrice: { color: colors.forest, fontSize: 15, fontWeight: '900' },
  itemMrp: { color: colors.muted, fontSize: 9, textDecorationLine: 'line-through' },
  couponCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.line },
  couponHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  couponTitle: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: '900' },
  viewOffers: { color: colors.forest, fontSize: 11, fontWeight: '800' },
  couponInput: { height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', marginTop: spacing.md, overflow: 'hidden' },
  input: { flex: 1, paddingHorizontal: spacing.md, color: colors.ink, fontSize: 12, fontWeight: '700' },
  apply: { paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mint },
  applyText: { color: colors.forest, fontSize: 11, fontWeight: '900' },
  applied: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.successLight, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.md },
  appliedText: { flex: 1, color: colors.success, fontSize: 11, fontWeight: '800' },
  bill: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.line },
  assurance: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.successLight, borderRadius: radius.lg },
  assuranceTitle: { color: colors.success, fontSize: 13, fontWeight: '900' },
  assuranceBody: { color: colors.muted, fontSize: 10, marginTop: 2 },
  checkoutBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, ...shadow },
  totalLabel: { color: colors.muted, fontSize: 9, fontWeight: '800' },
  total: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  checkoutButton: { flex: 1 },
});
