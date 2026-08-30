import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { products } from '@/data/catalog';
import { useApp } from '@/context/AppContext';
import { colors, formatCurrency, radius, spacing } from '@/theme';
import { OrderStatus } from '@/types';

const timeline: { status: OrderStatus; title: string; body: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { status: 'CONFIRMED', title: 'Order confirmed', body: 'We received your order.', icon: 'checkmark-circle-outline' },
  { status: 'PICKING', title: 'Picking items', body: 'Your groceries are being picked.', icon: 'basket-outline' },
  { status: 'PACKED', title: 'Packed & quality checked', body: 'Items are packed for dispatch.', icon: 'cube-outline' },
  { status: 'OUT_FOR_DELIVERY', title: 'Out for delivery', body: 'Delivery partner is on the way.', icon: 'bicycle-outline' },
  { status: 'DELIVERED', title: 'Delivered', body: 'Order delivered successfully.', icon: 'home-outline' },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, repeatOrder } = useApp();
  const order = orders.find((item) => item.id === id);
  if (!order) return <Screen><AppHeader title="Order" /><View style={styles.notFound}><Text>Order not found.</Text></View></Screen>;
  const currentIndex = timeline.findIndex((item) => item.status === order.status);
  const delivered = order.status === 'DELIVERED';
  return (
    <Screen>
      <AppHeader title={`Order #${order.id}`} subtitle={new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!delivered ? <View style={styles.liveCard}><View style={styles.liveIcon}><Ionicons name="bicycle" size={27} color={colors.white} /></View><View style={styles.liveCopy}><Text style={styles.liveKicker}>LIVE ORDER</Text><Text style={styles.liveTitle}>{order.status === 'OUT_FOR_DELIVERY' ? 'आपका order रास्ते पर है' : 'We’re preparing your order'}</Text><Text style={styles.liveBody}>Expected in selected slot: {order.deliverySlot}</Text></View></View> : null}
        <Text style={styles.sectionTitle}>Order journey</Text>
        <View style={styles.timelineCard}>
          {timeline.map((item, index) => {
            const complete = delivered || index <= Math.max(0, currentIndex);
            const active = !delivered && index === currentIndex;
            return <View key={item.status} style={styles.timelineRow}><View style={styles.timelineVisual}><View style={[styles.timelineIcon, complete && styles.timelineIconComplete, active && styles.timelineIconActive]}><Ionicons name={complete ? 'checkmark' : item.icon} size={16} color={complete ? colors.white : colors.muted} /></View>{index < timeline.length - 1 ? <View style={[styles.timelineLine, index < currentIndex && styles.timelineLineComplete]} /> : null}</View><View style={styles.timelineCopy}><Text style={[styles.timelineTitle, !complete && styles.timelineMuted]}>{item.title}</Text><Text style={styles.timelineBody}>{item.body}</Text>{active ? <Text style={styles.now}>CURRENT STATUS</Text> : null}</View></View>;
          })}
        </View>
        {!delivered ? <View style={styles.partner}><View style={styles.partnerAvatar}><Text style={styles.partnerText}>RS</Text></View><View style={styles.partnerCopy}><Text style={styles.partnerLabel}>Delivery partner</Text><Text style={styles.partnerName}>Rohit Sharma • ID verified</Text></View><Pressable style={styles.call}><Ionicons name="call" size={18} color={colors.forest} /></Pressable></View> : null}
        <Text style={styles.sectionTitle}>Items ({order.itemCount})</Text>
        <View style={styles.items}>{order.items.map((line) => { const product = products.find((item) => item.id === line.productId); const variant = product?.variants.find((item) => item.id === line.variantId); return product && variant ? <View key={`${line.productId}-${line.variantId}`} style={styles.item}><View style={styles.itemVisual}><Text style={styles.itemEmoji}>{product.emoji}</Text></View><View style={styles.itemCopy}><Text style={styles.itemName}>{product.name}</Text><Text style={styles.itemSub}>{variant.label} • Qty {line.quantity}</Text></View><Text style={styles.itemPrice}>{formatCurrency(variant.price * line.quantity)}</Text></View> : null; })}<View style={styles.totalRow}><Text style={styles.totalLabel}>Order total</Text><Text style={styles.total}>{formatCurrency(order.total)}</Text></View></View>
        <Text style={styles.sectionTitle}>Delivery details</Text>
        <View style={styles.address}><Ionicons name="location-outline" size={21} color={colors.forest} /><View style={styles.addressCopy}><Text style={styles.addressTitle}>{order.address.label} • {order.address.recipient}</Text><Text style={styles.addressBody}>{order.address.line1}, {order.address.city} - {order.address.pincode}</Text><Text style={styles.addressBody}>{order.address.phone} • {order.paymentMethod}</Text></View></View>
        {delivered ? <PrimaryButton label="Repeat this order" icon="refresh" onPress={() => { repeatOrder(order.id); router.push('/(tabs)/cart'); }} /> : <PrimaryButton label="Need help?" icon="headset-outline" variant="secondary" onPress={() => router.push('/support')} />}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl }, notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  liveCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.forestDark, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.sm }, liveIcon: { width: 54, height: 54, borderRadius: radius.pill, backgroundColor: colors.leaf, alignItems: 'center', justifyContent: 'center' }, liveCopy: { flex: 1, marginLeft: spacing.md }, liveKicker: { color: colors.saffronLight, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 }, liveTitle: { color: colors.white, fontSize: 15, fontWeight: '900', marginTop: 4 }, liveBody: { color: 'rgba(255,255,255,0.62)', fontSize: 9, marginTop: 4 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: spacing.xxl, marginBottom: spacing.md }, timelineCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.line }, timelineRow: { flexDirection: 'row', minHeight: 74 }, timelineVisual: { width: 40, alignItems: 'center' }, timelineIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.line, alignItems: 'center', justifyContent: 'center', zIndex: 1 }, timelineIconComplete: { backgroundColor: colors.success }, timelineIconActive: { backgroundColor: colors.forest, borderWidth: 4, borderColor: colors.leafLight }, timelineLine: { position: 'absolute', top: 31, bottom: -1, width: 2, backgroundColor: colors.line }, timelineLineComplete: { backgroundColor: colors.success }, timelineCopy: { flex: 1, paddingLeft: spacing.md, paddingBottom: spacing.lg }, timelineTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' }, timelineMuted: { color: colors.muted }, timelineBody: { color: colors.muted, fontSize: 9, marginTop: 3 }, now: { color: colors.forest, fontSize: 7, fontWeight: '900', marginTop: 5, letterSpacing: 0.8 },
  partner: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.infoLight, marginTop: spacing.lg }, partnerAvatar: { width: 45, height: 45, borderRadius: radius.pill, backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center' }, partnerText: { color: colors.white, fontSize: 12, fontWeight: '900' }, partnerCopy: { flex: 1, marginLeft: spacing.md }, partnerLabel: { color: colors.muted, fontSize: 9 }, partnerName: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 3 }, call: { width: 38, height: 38, borderRadius: radius.pill, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  items: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: spacing.lg }, item: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.line }, itemVisual: { width: 47, height: 47, borderRadius: radius.md, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }, itemEmoji: { fontSize: 27 }, itemCopy: { flex: 1, marginLeft: spacing.md }, itemName: { color: colors.ink, fontSize: 12, fontWeight: '800' }, itemSub: { color: colors.muted, fontSize: 9, marginTop: 3 }, itemPrice: { color: colors.ink, fontSize: 12, fontWeight: '900' }, totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.lg }, totalLabel: { color: colors.ink, fontSize: 13, fontWeight: '900' }, total: { color: colors.forest, fontSize: 16, fontWeight: '900' },
  address: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, marginBottom: spacing.xl }, addressCopy: { flex: 1 }, addressTitle: { color: colors.ink, fontSize: 12, fontWeight: '900' }, addressBody: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 3 },
});
