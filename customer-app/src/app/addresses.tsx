import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';

export default function AddressesScreen() {
  const { addresses, selectedAddress, selectAddress, addAddress } = useApp();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: 'Home', recipient: '', phone: '', line1: '', city: '', pincode: '' });
  const valid = Object.values(form).every((value) => value.trim().length > 0);
  const save = () => { if (!valid) return; addAddress(form); setAdding(false); setForm({ label: 'Home', recipient: '', phone: '', line1: '', city: '', pincode: '' }); };
  return (
    <Screen>
      <AppHeader title="Saved addresses" subtitle="Choose where we should deliver" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {addresses.map((address) => {
          const selected = address.id === selectedAddress?.id;
          return <Pressable key={address.id} onPress={() => selectAddress(address.id)} style={[styles.card, selected && styles.selected]}><View style={[styles.icon, selected && styles.iconSelected]}><Ionicons name={address.label === 'Shop' ? 'storefront-outline' : 'home-outline'} size={21} color={selected ? colors.white : colors.forest} /></View><View style={styles.copy}><View style={styles.top}><Text style={styles.label}>{address.label}</Text>{selected ? <Text style={styles.default}>SELECTED</Text> : null}</View><Text style={styles.name}>{address.recipient} • {address.phone}</Text><Text style={styles.address}>{address.line1}, {address.city} - {address.pincode}</Text></View><Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.forest : colors.muted} /></Pressable>;
        })}
        {!adding ? <PrimaryButton label="Add new address" icon="add" variant="secondary" onPress={() => setAdding(true)} /> : (
          <View style={styles.form}>
            <View style={styles.formHeader}><Text style={styles.formTitle}>New delivery address</Text><Pressable onPress={() => setAdding(false)}><Ionicons name="close" size={22} color={colors.muted} /></Pressable></View>
            {([
              ['label', 'Label (Home / Shop)'], ['recipient', 'Recipient name'], ['phone', 'Phone number'], ['line1', 'House / shop / street'], ['city', 'City'], ['pincode', 'Pincode'],
            ] as const).map(([key, placeholder]) => <TextInput key={key} placeholder={placeholder} placeholderTextColor="#9BA39D" keyboardType={key === 'phone' || key === 'pincode' ? 'number-pad' : 'default'} value={form[key]} onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))} style={styles.input} />)}
            <PrimaryButton label="Save address" icon="checkmark" disabled={!valid} onPress={save} />
          </View>
        )}
        <View style={styles.note}><Ionicons name="shield-checkmark-outline" size={20} color={colors.success} /><Text style={styles.noteText}>Your address is shared only with the assigned delivery partner for this order.</Text></View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md }, card: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line }, selected: { borderColor: colors.forest, backgroundColor: colors.mint }, icon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }, iconSelected: { backgroundColor: colors.forest }, copy: { flex: 1, marginHorizontal: spacing.md }, top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, label: { color: colors.ink, fontSize: 14, fontWeight: '900' }, default: { color: colors.success, fontSize: 7, fontWeight: '900', backgroundColor: colors.successLight, borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 3 }, name: { color: colors.ink, fontSize: 10, marginTop: 5 }, address: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  form: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.line }, formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, formTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, input: { height: 49, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, paddingHorizontal: spacing.md, color: colors.ink, backgroundColor: colors.warmWhite, fontSize: 12 }, note: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.successLight }, noteText: { flex: 1, color: colors.success, fontSize: 10, lineHeight: 15 },
});
