import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing } from '@/theme';

export default function OrderSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen style={styles.screen}>
      <View style={styles.confettiOne} /><View style={styles.confettiTwo} /><View style={styles.confettiThree} />
      <View style={styles.content}>
        <View style={styles.outer}><View style={styles.inner}><Ionicons name="checkmark" size={48} color={colors.white} /></View></View>
        <Text style={styles.eyebrow}>ORDER CONFIRMED</Text>
        <Text style={styles.title}>शुक्रिया! आपकी टोकरी रास्ते पर है।</Text>
        <Text style={styles.body}>हमने आपका order #{id} confirm कर लिया है। Status updates notification में मिलते रहेंगे।</Text>
        <View style={styles.info}><View style={styles.infoIcon}><Ionicons name="time-outline" size={21} color={colors.forest} /></View><View><Text style={styles.infoLabel}>Estimated delivery</Text><Text style={styles.infoValue}>Today, within your selected slot</Text></View></View>
      </View>
      <View style={styles.actions}><PrimaryButton label="Track order" icon="navigate" onPress={() => router.replace({ pathname: '/order/[id]', params: { id: String(id) } })} /><PrimaryButton label="Continue shopping" variant="secondary" onPress={() => router.replace('/(tabs)/home')} /></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.cream, padding: spacing.xxl }, content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  outer: { width: 116, height: 116, borderRadius: 58, backgroundColor: colors.leafLight, alignItems: 'center', justifyContent: 'center' }, inner: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: colors.success, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginTop: spacing.xxl }, title: { color: colors.ink, fontSize: 28, lineHeight: 36, fontWeight: '900', textAlign: 'center', marginTop: spacing.md }, body: { color: colors.muted, fontSize: 13, lineHeight: 21, textAlign: 'center', marginTop: spacing.md, maxWidth: 320 },
  info: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xxxl, borderWidth: 1, borderColor: colors.line }, infoIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }, infoLabel: { color: colors.muted, fontSize: 10 }, infoValue: { color: colors.ink, fontSize: 13, fontWeight: '900', marginTop: 3 },
  actions: { gap: spacing.md, paddingBottom: spacing.md }, confettiOne: { position: 'absolute', top: 120, left: 38, width: 10, height: 22, backgroundColor: colors.saffron, transform: [{ rotate: '30deg' }] }, confettiTwo: { position: 'absolute', top: 170, right: 44, width: 13, height: 13, borderRadius: 7, backgroundColor: colors.leaf }, confettiThree: { position: 'absolute', top: 90, right: 100, width: 8, height: 19, backgroundColor: colors.danger, transform: [{ rotate: '-25deg' }] },
});
