import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing } from '@/theme';

export default function WelcomeScreen() {
  return (
    <Screen style={styles.screen} edges="light">
      <LinearGradient colors={[colors.forestDark, colors.forest, '#356E39']} style={styles.gradient}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />
        <Image source={require('../../assets/brand/desi-aahhar-logo.png')} contentFit="contain" style={styles.logo} />
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>घर की रसोई, देसी भरोसा</Text>
          <Text style={styles.title}>Wholesome groceries, delivered fresh.</Text>
          <Text style={styles.body}>Kirana essentials से लेकर fresh vegetables तक—सही दाम, साफ़ rules और भरोसेमंद delivery.</Text>
        </View>
        <View style={styles.features}>
          {[
            ['leaf-outline', 'Fresh & quality checked'],
            ['pricetag-outline', 'Wholesale-friendly prices'],
            ['location-outline', 'Live order tracking'],
          ].map(([icon, label]) => (
            <View key={label} style={styles.feature}>
              <View style={styles.featureIcon}><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={17} color={colors.saffronLight} /></View>
              <Text style={styles.featureText}>{label}</Text>
            </View>
          ))}
        </View>
        <PrimaryButton label="शुरू करें" icon="arrow-forward" onPress={() => router.push('/login')} style={styles.button} />
        <Text style={styles.terms}>By continuing, you agree to our Terms & Privacy Policy.</Text>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.forestDark },
  gradient: { flex: 1, paddingHorizontal: spacing.xxl, paddingTop: 54, paddingBottom: spacing.xl, overflow: 'hidden' },
  glowOne: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,213,92,0.11)', right: -90, top: 30 },
  glowTwo: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,255,255,0.06)', left: -90, bottom: 120 },
  logo: { width: 228, height: 228, alignSelf: 'center', backgroundColor: 'rgba(255,249,236,0.92)', borderRadius: 114 },
  copy: { marginTop: spacing.sm },
  eyebrow: { color: colors.saffronLight, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  title: { color: colors.white, fontSize: 35, lineHeight: 42, fontWeight: '900', marginTop: spacing.md },
  body: { color: 'rgba(255,255,255,0.76)', fontSize: 15, lineHeight: 23, marginTop: spacing.md },
  features: { gap: spacing.md, marginTop: spacing.xxl, marginBottom: 'auto' },
  feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIcon: { width: 34, height: 34, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  featureText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  button: { backgroundColor: colors.saffron },
  terms: { color: 'rgba(255,255,255,0.52)', fontSize: 10, textAlign: 'center', marginTop: spacing.md },
});
