import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';

const menu = [
  { icon: 'location-outline', title: 'Saved addresses', subtitle: 'Home, shop and delivery locations', route: '/addresses' },
  { icon: 'heart-outline', title: 'My wishlist', subtitle: 'Products you saved for later', route: '/wishlist' },
  { icon: 'pricetag-outline', title: 'Offers & coupons', subtitle: 'See all available savings', route: '/offers' },
  { icon: 'notifications-outline', title: 'Notifications', subtitle: 'Orders, offers and account alerts', route: '/notifications' },
  { icon: 'headset-outline', title: 'Help & support', subtitle: 'Chat, call or browse FAQs', route: '/support' },
] as const;

export default function ProfileScreen() {
  const { mobileNumber, email, authMethod, signOut, orders, favorites, liveMode, connectionError } = useApp();
  const logout = () => Alert.alert('Log out?', 'आपको फिर से OTP verify करना होगा।', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: () => { signOut(); router.replace('/welcome'); } }]);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Text style={styles.title}>My profile</Text><Image source={require('../../../assets/brand/desi-aahhar-logo.png')} contentFit="contain" style={styles.logo} /></View>
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>VK</Text></View>
        <View style={styles.profileCopy}><Text style={styles.name}>Vivek Kumar</Text><Text style={styles.phone}>{authMethod === 'email' ? (email || 'vivek@example.com') : (mobileNumber || '+91 98765 43210')}</Text></View>
        <Pressable style={styles.edit}><Ionicons name="pencil" size={16} color={colors.forest} /></Pressable>
      </View>
      <View style={[styles.connection, connectionError && styles.connectionError]}><View style={[styles.connectionDot, connectionError && styles.connectionDotError]} /><Text style={[styles.connectionText, connectionError && styles.connectionTextError]}>{liveMode ? (connectionError ? `Backend: ${connectionError}` : 'Live backend connected') : 'Demo catalog mode'}</Text></View>
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statValue}>{orders.length}</Text><Text style={styles.statLabel}>Orders</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statValue}>{favorites.length}</Text><Text style={styles.statLabel}>Saved</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statValue}>₹100</Text><Text style={styles.statLabel}>Saved</Text></View>
      </View>
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.menu}>
        {menu.map((item, index) => (
          <Pressable key={item.title} onPress={() => router.push(item.route)} style={[styles.menuItem, index < menu.length - 1 && styles.menuBorder]}>
            <View style={styles.menuIcon}><Ionicons name={item.icon} size={20} color={colors.forest} /></View>
            <View style={styles.menuCopy}><Text style={styles.menuTitle}>{item.title}</Text><Text style={styles.menuSubtitle}>{item.subtitle}</Text></View>
            <Ionicons name="chevron-forward" size={18} color="#A5ADA7" />
          </Pressable>
        ))}
      </View>
      <View style={styles.businessCard}><Ionicons name="business-outline" size={23} color={colors.brown} /><View style={styles.businessCopy}><Text style={styles.businessTitle}>Kirana business account</Text><Text style={styles.businessBody}>Unlock bulk pricing and faster reorders.</Text></View><Text style={styles.businessAction}>Know more</Text></View>
      <Pressable onPress={logout} style={styles.logout}><Ionicons name="log-out-outline" size={19} color={colors.danger} /><Text style={styles.logoutText}>Log out</Text></Pressable>
      <Text style={styles.version}>देसी Aahhar • Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.warmWhite },
  content: { paddingTop: 48, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.ink, fontSize: 28, fontWeight: '900' },
  logo: { width: 62, height: 62 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.forestDark, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md },
  connection: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', backgroundColor: colors.successLight, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 7, marginTop: spacing.md },
  connectionError: { backgroundColor: colors.dangerLight }, connectionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success }, connectionDotError: { backgroundColor: colors.danger }, connectionText: { color: colors.success, fontSize: 9, fontWeight: '800' }, connectionTextError: { color: colors.danger },
  avatar: { width: 58, height: 58, borderRadius: radius.pill, backgroundColor: colors.saffron, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.forestDark, fontSize: 18, fontWeight: '900' },
  profileCopy: { flex: 1, marginLeft: spacing.md },
  name: { color: colors.white, fontSize: 18, fontWeight: '900' },
  phone: { color: 'rgba(255,255,255,0.64)', fontSize: 11, marginTop: 3 },
  edit: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, paddingVertical: spacing.lg, marginTop: spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.forest, fontSize: 17, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 9, marginTop: 3 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.line },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: spacing.xxl, marginBottom: spacing.md },
  menu: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, paddingHorizontal: spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  menuIcon: { width: 39, height: 39, borderRadius: radius.md, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1, marginLeft: spacing.md },
  menuTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  menuSubtitle: { color: colors.muted, fontSize: 9, marginTop: 3 },
  businessCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.saffronLight, padding: spacing.lg, borderRadius: radius.lg, marginTop: spacing.lg },
  businessCopy: { flex: 1, marginLeft: spacing.md },
  businessTitle: { color: colors.brown, fontSize: 13, fontWeight: '900' },
  businessBody: { color: '#936B3A', fontSize: 9, marginTop: 2 },
  businessAction: { color: colors.brown, fontSize: 10, fontWeight: '900' },
  logout: { height: 50, borderRadius: radius.md, borderWidth: 1, borderColor: '#F2C9C5', backgroundColor: colors.dangerLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl },
  logoutText: { color: colors.danger, fontSize: 13, fontWeight: '900' },
  version: { color: colors.muted, fontSize: 9, textAlign: 'center', marginTop: spacing.lg },
});
