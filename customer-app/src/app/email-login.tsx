import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing } from '@/theme';

export default function EmailLoginScreen() {
  const [email, setEmail] = useState('');
  const normalizedEmail = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={23} color={colors.ink} />
        </Pressable>
        <View style={styles.content}>
          <View style={styles.icon}><Ionicons name="mail-outline" size={32} color={colors.forest} /></View>
          <Text style={styles.title}>Email से verify करें</Text>
          <Text style={styles.body}>Mobile OTP न आए तो हम आपके email पर 6-digit verification code भेजेंगे।</Text>
          <View style={[styles.inputWrap, valid && styles.inputValid]}>
            <Ionicons name="mail-outline" size={20} color={colors.muted} />
            <TextInput
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="#A5ADA7"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
            {valid ? <Ionicons name="checkmark-circle" size={20} color={colors.success} /> : null}
          </View>
          <View style={styles.secureRow}>
            <Ionicons name="shield-checkmark-outline" size={17} color={colors.success} />
            <Text style={styles.secure}>आपका email सुरक्षित रहेगा और केवल account verification के लिए use होगा।</Text>
          </View>
        </View>
        <PrimaryButton
          label="Email OTP भेजें"
          icon="arrow-forward"
          disabled={!valid}
          onPress={() => router.push({ pathname: '/otp', params: { channel: 'email', destination: normalizedEmail } })}
          style={styles.button}
        />
        <Pressable onPress={() => router.replace('/login')} style={styles.phoneFallback}>
          <Ionicons name="phone-portrait-outline" size={18} color={colors.forest} />
          <Text style={styles.phoneFallbackText}>Mobile OTP इस्तेमाल करें</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: spacing.xxl },
  back: { width: 42, height: 42, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  content: { marginTop: 70 },
  icon: { width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.leafLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  title: { color: colors.ink, fontSize: 29, lineHeight: 37, fontWeight: '900' },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
  inputWrap: { height: 62, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xxxl, paddingHorizontal: spacing.lg, backgroundColor: colors.white },
  inputValid: { borderColor: colors.forest },
  input: { flex: 1, height: '100%', fontSize: 16, color: colors.ink, fontWeight: '700' },
  secureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.lg },
  secure: { flex: 1, color: colors.muted, fontSize: 11, lineHeight: 16 },
  button: { marginTop: 'auto' },
  phoneFallback: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
  phoneFallbackText: { color: colors.forest, fontSize: 12, fontWeight: '800' },
});
