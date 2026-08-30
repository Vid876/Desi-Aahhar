import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { products } from '@/data/catalog';
import { useApp } from '@/context/AppContext';
import { colors, formatCurrency, radius, spacing } from '@/theme';
import { OrderStatus } from '@/types';

const statusStyle: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  CONFIRMED: { label: 'Confirmed', color: colors.info, bg: colors.infoLight }, PICKING: { label: 'Picking', color: colors.brown, bg: colors.saffronLight },
  PACKED: { label: 'Packed', color: colors.brown, bg: colors.saffronLight }, OUT_FOR_DELIVERY: { label: 'On the way', color: colors.info, bg: colors.infoLight },
  DELIVERED: { label: 'Delivered', color: colors.success, bg: colors.successLight }, CANCELLED: { label: 'Cancelled', color: colors.danger, bg: colors.dangerLight },
};

export default function OrdersScreen() {
  const { orders, repeatOrder } = useApp();
  if (!orders.length) return <View style={styles.screen}><View style={styles.header}><Text style={styles.title}>My orders</Text></View><EmptyState icon="receipt-outline" title="No orders yet" body="Your confirmed orders and live delivery tracking will appear here." action="Browse products" onAction={() => router.push('/(tabs)/home')} /></View>;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><View><Text style={styles.eyebrow}>YOUR PURCHASES</Text><Text style={styles.title}>My orders</Text></View><View style={styles.count}><Text style={styles.countText}>{orders.length}</Text></View></View>
      {orders.map((order) => {
        const status = statusStyle[order.status];
        return (
          <Pressable key={order.id} onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })} style={styles.card}>
            <View style={styles.cardTop}>
              <View><Text style={styles.orderId}>#{order.id}</Text><Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text></View>
              <View style={[styles.status, { backgroundColor: status.bg }]}><View style={[styles.statusDot, { backgroundColor: status.color }]} /><Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text></View>
            </View>
            <View style={styles.emojis}>{order.items.slice(0, 5).map((item) => <View key={`${item.productId}-${item.variantId}`} style={styles.emojiCircle}><Text style={styles.emoji}>{products.find((product) => product.id === item.productId)?.emoji ?? '🛍️'}</Text></View>)}</View>
            <View style={styles.divider} />
            <View style={styles.cardBottom}>
              <View><Text style={styles.items}>{order.itemCount} items • {order.paymentMethod}</Text><Text style={styles.total}>{formatCurrency(order.total)}</Text></View>
              {order.status === 'DELIVERED' ? (
                <Pressable onPress={(event) => { event.stopPropagation(); repeatOrder(order.id); router.push('/(tabs)/cart'); }} style={styles.repeat}><Ionicons name="refresh" size={15} color={colors.forest} /><Text style={styles.repeatText}>Repeat</Text></Pressable>
              ) : <View style={styles.track}><Text style={styles.trackText}>Track order</Text><Ionicons name="chevron-forward" size={16} color={colors.white} /></View>}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.warmWhite },
  content: { paddingTop: 54, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  eyebrow: { color: colors.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 28, fontWeight: '900', marginTop: 3 },
  count: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.leafLight, alignItems: 'center', justifyContent: 'center' },
  countText: { color: colors.forest, fontWeight: '900' },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.line },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  date: { color: colors.muted, fontSize: 10, marginTop: 3 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontWeight: '900' },
  emojis: { flexDirection: 'row', marginTop: spacing.lg },
  emojiCircle: { width: 43, height: 43, borderRadius: radius.pill, backgroundColor: colors.mint, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', marginRight: -5 },
  emoji: { fontSize: 23 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.lg },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  items: { color: colors.muted, fontSize: 10 },
  total: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: 2 },
  repeat: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 38, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.leafLight },
  repeatText: { color: colors.forest, fontSize: 11, fontWeight: '900' },
  track: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 38, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.forest },
  trackText: { color: colors.white, fontSize: 11, fontWeight: '900' },
});
