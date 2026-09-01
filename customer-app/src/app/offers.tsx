import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { colors, formatCurrency, radius, spacing } from '@/theme';

export default function OffersScreen() {
  const { coupons } = useApp();
  const [copied, setCopied] = useState('');
  const copy = async (code: string) => { await Clipboard.setStringAsync(code); setCopied(code); setTimeout(() => setCopied(''), 1600); };
  return (
    <Screen>
      <AppHeader title="Offers & coupons" subtitle="थोड़ी और बचत, हर टोकरी में" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}><View><Text style={styles.heroKicker}>WEEKEND SAVINGS</Text><Text style={styles.heroTitle}>देसी deals,{`\n`}सीधी बचत।</Text><Text style={styles.heroBody}>Checkout पर coupon apply करें</Text></View><Text style={styles.heroEmoji}>🎁</Text></View>
        <Text style={styles.sectionTitle}>Available for you</Text>
        {coupons.map((coupon) => <View key={coupon.code} style={styles.card}><View style={styles.cutTop} /><View style={styles.cutBottom} /><View style={styles.icon}><Ionicons name="pricetag" size={24} color={colors.brown} /></View><View style={styles.copy}><Text style={styles.title}>{coupon.title}</Text><Text style={styles.description}>{coupon.description}</Text><Text style={styles.minimum}>Minimum cart {formatCurrency(coupon.minimum)}</Text><View style={styles.codeRow}><Text style={styles.code}>{coupon.code}</Text><Pressable onPress={() => copy(coupon.code)}><Text style={styles.copyText}>{copied === coupon.code ? 'COPIED!' : 'COPY'}</Text></Pressable></View></View></View>)}
        <View style={styles.tip}><Ionicons name="bulb-outline" size={21} color={colors.saffron} /><Text style={styles.tipText}>Coupons can’t be combined. The best valid discount is shown before payment.</Text></View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl }, hero: { minHeight: 160, borderRadius: radius.lg, backgroundColor: colors.forestDark, padding: spacing.xl, flexDirection: 'row', alignItems: 'center' }, heroKicker: { color: colors.saffronLight, fontSize: 8, fontWeight: '900', letterSpacing: 1.3 }, heroTitle: { color: colors.white, fontSize: 25, lineHeight: 31, fontWeight: '900', marginTop: spacing.sm }, heroBody: { color: 'rgba(255,255,255,0.62)', fontSize: 10, marginTop: spacing.sm }, heroEmoji: { fontSize: 76, marginLeft: 'auto' }, sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: spacing.xxl, marginBottom: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: spacing.lg, marginBottom: spacing.md, overflow: 'hidden' }, cutTop: { position: 'absolute', right: 88, top: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.warmWhite, borderWidth: 1, borderColor: colors.line }, cutBottom: { position: 'absolute', right: 88, bottom: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.warmWhite, borderWidth: 1, borderColor: colors.line }, icon: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.saffronLight, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, marginLeft: spacing.md }, title: { color: colors.ink, fontSize: 17, fontWeight: '900' }, description: { color: colors.muted, fontSize: 10, marginTop: 3 }, minimum: { color: colors.muted, fontSize: 8, marginTop: 5 }, codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: spacing.md, marginTop: spacing.md }, code: { color: colors.forest, fontSize: 12, fontWeight: '900', letterSpacing: 1.3 }, copyText: { color: colors.forest, fontSize: 9, fontWeight: '900' }, tip: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.saffronLight, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md }, tipText: { flex: 1, color: colors.brown, fontSize: 10, lineHeight: 15 },
});
