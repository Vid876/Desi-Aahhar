import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing } from '@/theme';

const notifications = [
  { icon: 'bicycle-outline', color: colors.info, bg: colors.infoLight, title: 'Order is out for delivery', body: 'Rohit is bringing order #DAH240826. Keep your phone nearby.', time: '12 min ago', unread: true },
  { icon: 'pricetag-outline', color: colors.brown, bg: colors.saffronLight, title: '₹100 savings unlocked', body: 'Use DESI100 on your next order above ₹999.', time: '2 hr ago', unread: true },
  { icon: 'checkmark-circle-outline', color: colors.success, bg: colors.successLight, title: 'Payment successful', body: 'Your online payment was verified securely.', time: '3 days ago' },
  { icon: 'leaf-outline', color: colors.forest, bg: colors.mint, title: 'Fresh stock arrived', body: 'Today’s vegetables and dairy are ready to order.', time: '5 days ago' },
] as const;

export default function NotificationsScreen() {
  return <Screen><AppHeader title="Notifications" subtitle="Orders, offers and updates" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{notifications.map((item) => <View key={item.title} style={styles.item}><View style={[styles.icon, { backgroundColor: item.bg }]}><Ionicons name={item.icon} size={21} color={item.color} /></View><View style={styles.copy}><View style={styles.titleRow}><Text style={styles.title}>{item.title}</Text>{'unread' in item && item.unread ? <View style={styles.dot} /> : null}</View><Text style={styles.body}>{item.body}</Text><Text style={styles.time}>{item.time}</Text></View></View>)}</ScrollView></Screen>;
}

const styles = StyleSheet.create({ content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl }, item: { flexDirection: 'row', paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.line }, icon: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, marginLeft: spacing.md }, titleRow: { flexDirection: 'row', alignItems: 'center' }, title: { flex: 1, color: colors.ink, fontSize: 13, fontWeight: '900' }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger }, body: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4 }, time: { color: '#9BA39D', fontSize: 8, marginTop: 7 } });
