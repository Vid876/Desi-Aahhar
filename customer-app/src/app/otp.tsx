import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { apiRequest, endpoints, USE_MOCK_API } from '@/services/api';
import { colors, radius, spacing } from '@/theme';

export default function OtpScreen() {
  const { channel = 'phone', destination = '', devOtp = '' } = useLocalSearchParams<{ channel: 'phone' | 'email'; destination: string; devOtp?: string }>();
  const { signIn } = useApp();
  const [otp, setOtp] = useState('');
  const [activeDevOtp, setActiveDevOtp] = useState(String(devOtp));
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const isEmail = channel === 'email';
  const displayIdentity = isEmail ? destination : destination.replace('+91', '+91 ');
  const verify = async () => {
    try {
      setBusy(true);
      if (USE_MOCK_API) {
        await signIn(String(destination), isEmail ? 'email' : 'phone');
      } else {
        const response = await apiRequest<{ token: string }>(isEmail ? endpoints.verifyEmailOtp : endpoints.verifyOtp, {
          method: 'POST',
          body: JSON.stringify(isEmail ? { email: destination, otp } : { phone: destination, otp }),
        });
        await signIn(String(destination), isEmail ? 'email' : 'phone', response.token);
      }
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('OTP verify नहीं हुआ', error instanceof Error ? error.message : 'कृपया सही OTP डालें।');
    } finally {
      setBusy(false);
    }
  };
  const resend = async () => {
    try {
      setBusy(true);
      if (USE_MOCK_API) return;
      const response = await apiRequest<{ devOtp?: string }>(isEmail ? endpoints.sendEmailOtp : endpoints.sendOtp, {
        method: 'POST', body: JSON.stringify(isEmail ? { email: destination } : { phone: destination }),
      });
      setActiveDevOtp(response.devOtp ?? '');
      Alert.alert('OTP भेज दिया गया', `नया code ${displayIdentity} पर भेजा गया है।`);
    } catch (error) {
      Alert.alert('OTP नहीं भेजा गया', error instanceof Error ? error.message : 'कृपया थोड़ी देर बाद कोशिश करें।');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={23} color={colors.ink} /></Pressable>
        <View style={styles.content}>
          <Text style={styles.title}>OTP verify करें</Text>
          <Text style={styles.body}>{displayIdentity} पर भेजा गया code डालें।</Text>
          <Pressable onPress={() => inputRef.current?.focus()} style={styles.boxes}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={[styles.box, otp.length === index && styles.activeBox]}><Text style={styles.digit}>{otp[index] ?? ''}</Text></View>
            ))}
          </Pressable>
          <TextInput ref={inputRef} autoFocus keyboardType="number-pad" maxLength={6} value={otp}
            onChangeText={(value) => setOtp(value.replace(/\D/g, ''))} style={styles.hiddenInput} />
          {USE_MOCK_API || activeDevOtp ? <Text style={styles.demo}>{USE_MOCK_API ? 'Demo mode: कोई भी 6-digit OTP डालें' : `Local testing OTP: ${activeDevOtp}`}</Text> : null}
          <Pressable disabled={busy} onPress={resend}><Text style={styles.resend}>OTP नहीं मिला? <Text style={styles.resendStrong}>फिर से भेजें</Text></Text></Pressable>
          <Pressable onPress={() => router.replace(isEmail ? '/login' : '/email-login')} style={styles.switchMethod}>
            <Ionicons name={isEmail ? 'phone-portrait-outline' : 'mail-outline'} size={17} color={colors.forest} />
            <Text style={styles.switchMethodText}>{isEmail ? 'Mobile OTP इस्तेमाल करें' : 'Email पर OTP लें'}</Text>
          </Pressable>
        </View>
        <PrimaryButton label={busy ? 'Verify हो रहा है…' : 'Verify & Continue'} icon="checkmark" disabled={otp.length !== 6 || busy} onPress={verify} style={styles.button} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, padding: spacing.xxl },
  back: { width: 42, height: 42, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  content: { marginTop: 90 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '900' },
  body: { color: colors.muted, fontSize: 14, marginTop: spacing.sm },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xxxl },
  box: { width: 47, height: 56, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  activeBox: { borderColor: colors.forest, backgroundColor: colors.mint },
  digit: { color: colors.ink, fontSize: 22, fontWeight: '900' },
  hiddenInput: { width: 1, height: 1, opacity: 0 },
  demo: { color: colors.success, backgroundColor: colors.successLight, padding: spacing.md, borderRadius: radius.sm, fontSize: 12, marginTop: spacing.xl, textAlign: 'center' },
  resend: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: spacing.xl },
  resendStrong: { color: colors.forest, fontWeight: '800' },
  switchMethod: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.mint },
  switchMethodText: { color: colors.forest, fontSize: 12, fontWeight: '800' },
  button: { marginTop: 'auto' },
});
