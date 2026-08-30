import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing } from '@/theme';

const faqs = ['How does the ₹500 category rule work?', 'How can I cancel an order?', 'What if an item is damaged?', 'When will my refund arrive?'];

export default function SupportScreen() {
  return (
    <Screen>
      <AppHeader title="Help & support" subtitle="हम आपकी मदद के लिए हैं" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}><View style={styles.heroIcon}><Ionicons name="headset" size={33} color={colors.white} /></View><Text style={styles.heroTitle}>How can we help?</Text><Text style={styles.heroBody}>Our support team is available 8 AM - 10 PM, every day.</Text></View>
        <Text style={styles.sectionTitle}>Quick support</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => Linking.openURL('tel:+911800000000')} style={styles.action}><View style={styles.actionIcon}><Ionicons name="call-outline" size={23} color={colors.forest} /></View><Text style={styles.actionTitle}>Call us</Text><Text style={styles.actionSub}>Instant help</Text></Pressable>
          <Pressable onPress={() => Linking.openURL('mailto:support@desiaahhar.in')} style={styles.action}><View style={styles.actionIcon}><Ionicons name="mail-outline" size={23} color={colors.forest} /></View><Text style={styles.actionTitle}>Email</Text><Text style={styles.actionSub}>Within 4 hours</Text></Pressable>
        </View>
        <Pressable style={styles.chat}><View style={styles.chatIcon}><Ionicons name="chatbubble-ellipses" size={23} color={colors.white} /></View><View style={styles.chatCopy}><Text style={styles.chatTitle}>Chat with support</Text><Text style={styles.chatSub}>Average response time: 2 minutes</Text></View><View style={styles.online}><View style={styles.onlineDot} /><Text style={styles.onlineText}>ONLINE</Text></View></Pressable>
        <Text style={styles.sectionTitle}>Frequently asked</Text>
        <View style={styles.faqs}>{faqs.map((faq) => <Pressable key={faq} style={styles.faq}><Text style={styles.faqText}>{faq}</Text><Ionicons name="chevron-forward" size={17} color={colors.muted} /></Pressable>)}</View>
        <View style={styles.rule}><Ionicons name="information-circle-outline" size={22} color={colors.brown} /><View style={styles.ruleCopy}><Text style={styles.ruleTitle}>₹500 rule, simply explained</Text><Text style={styles.ruleBody}>Only admin-enabled grocery categories count toward the minimum. Exempt fresh items can be ordered alone. Mixed carts need only the eligible grocery subtotal to cross ₹500.</Text></View></View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl }, hero: { alignItems: 'center', backgroundColor: colors.forestDark, borderRadius: radius.lg, padding: spacing.xxl }, heroIcon: { width: 66, height: 66, borderRadius: 33, backgroundColor: colors.leaf, alignItems: 'center', justifyContent: 'center' }, heroTitle: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: spacing.lg }, heroBody: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: spacing.sm, textAlign: 'center' }, sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: spacing.xxl, marginBottom: spacing.md }, actions: { flexDirection: 'row', gap: spacing.md }, action: { flex: 1, alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.line }, actionIcon: { width: 47, height: 47, borderRadius: radius.pill, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }, actionTitle: { color: colors.ink, fontSize: 13, fontWeight: '900', marginTop: spacing.md }, actionSub: { color: colors.muted, fontSize: 9, marginTop: 3 }, chat: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.successLight, borderRadius: radius.lg, marginTop: spacing.md }, chatIcon: { width: 46, height: 46, borderRadius: radius.pill, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' }, chatCopy: { flex: 1, marginLeft: spacing.md }, chatTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' }, chatSub: { color: colors.muted, fontSize: 9, marginTop: 3 }, online: { flexDirection: 'row', alignItems: 'center', gap: 4 }, onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }, onlineText: { color: colors.success, fontSize: 7, fontWeight: '900' }, faqs: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.line }, faq: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line }, faqText: { flex: 1, color: colors.ink, fontSize: 11, fontWeight: '700' }, rule: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.saffronLight, marginTop: spacing.xl }, ruleCopy: { flex: 1 }, ruleTitle: { color: colors.brown, fontSize: 12, fontWeight: '900' }, ruleBody: { color: '#8D6536', fontSize: 9, lineHeight: 15, marginTop: 4 },
});
