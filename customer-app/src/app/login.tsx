import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { apiRequest, endpoints, USE_MOCK_API } from '@/services/api';
import { colors, radius, spacing } from '@/theme';

export default function LoginScreen() {
  const [mobile, setMobile] = useState('');
  const [sending, setSending] = useState(false);
  const valid = mobile.replace(/\D/g, '').length === 10;
  const sendOtp = async () => {
    const destination = `+91${mobile}`;
    if (USE_MOCK_API) {
      router.push({ pathname: '/otp', params: { channel: 'phone', destination } });
      return;
    }
    try {
      setSending(true);
      const result = await apiRequest<{ devOtp?: string }>(endpoints.sendOtp, {
        method: 'POST', body: JSON.stringify({ phone: destination }),
      });
      router.push({ pathname: '/otp', params: { channel: 'phone', destination, devOtp: result.devOtp ?? '' } });
    } catch (error) {
      Alert.alert('OTP नहीं भेजा गया', error instanceof Error ? error.message : 'कृपया दोबारा कोशिश करें।');
    } finally {
      setSending(false);
    }
  };
  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={23} color={colors.ink} />
        </Pressable>
        <View style={styles.content}>
          <View style={styles.icon}><Ionicons name="phone-portrait-outline" size={32} color={colors.forest} /></View>
          <Text style={styles.title}>अपना mobile number डालें</Text>
          <Text style={styles.body}>हम verification के लिए 6-digit OTP भेजेंगे।</Text>
          <View style={styles.inputWrap}>
            <View style={styles.country}><Text style={styles.flag}>🇮🇳</Text><Text style={styles.code}>+91</Text></View>
            <View style={styles.inputDivider} />
            <TextInput
              autoFocus keyboardType="number-pad" maxLength={10} placeholder="98765 43210"
              placeholderTextColor="#A5ADA7" value={mobile}
              onChangeText={(value) => setMobile(value.replace(/\D/g, ''))} style={styles.input}
            />
          </View>
          <View style={styles.secureRow}>
            <Ionicons name="shield-checkmark-outline" size={17} color={colors.success} />
            <Text style={styles.secure}>Your details are secure with us.</Text>
          </View>
        </View>
        <PrimaryButton label={sending ? 'भेज रहे हैं…' : 'OTP भेजें'} icon="arrow-forward" disabled={!valid || sending}
          onPress={sendOtp} style={styles.button} />
        <Pressable onPress={() => router.push('/email-login')} style={styles.emailFallback}>
          <Ionicons name="mail-outline" size={18} color={colors.forest} />
          <Text style={styles.emailFallbackText}>Mobile OTP नहीं आया? Email से जारी रखें</Text>
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
  body: { color: colors.muted, fontSize: 14, marginTop: spacing.sm },
  inputWrap: { height: 62, borderWidth: 1.5, borderColor: colors.forest, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', marginTop: spacing.xxxl, backgroundColor: colors.white },
  country: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
  flag: { fontSize: 20 },
  code: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  inputDivider: { width: 1, height: 28, backgroundColor: colors.line },
  input: { flex: 1, height: '100%', paddingHorizontal: spacing.lg, fontSize: 18, color: colors.ink, fontWeight: '700', letterSpacing: 1 },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  secure: { color: colors.muted, fontSize: 12 },
  button: { marginTop: 'auto' },
  emailFallback: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
  emailFallbackText: { color: colors.forest, fontSize: 12, fontWeight: '800' },
});
