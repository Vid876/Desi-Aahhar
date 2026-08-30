import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/theme';

type Props = { value: number; onChange: (value: number) => void; compact?: boolean };

export function QuantityStepper({ value, onChange, compact }: Props) {
  const size = compact ? 30 : 38;
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <Pressable onPress={() => onChange(value - 1)} style={[styles.control, { width: size, height: size }]}>
        <Ionicons name={value === 1 ? 'trash-outline' : 'remove'} size={compact ? 16 : 18} color={colors.forest} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable onPress={() => onChange(value + 1)} style={[styles.control, { width: size, height: size }]}>
        <Ionicons name="add" size={compact ? 17 : 19} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill, backgroundColor: colors.mint, overflow: 'hidden', borderWidth: 1, borderColor: colors.leafLight },
  compact: { alignSelf: 'flex-start' },
  control: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.forest, borderRadius: radius.pill },
  value: { minWidth: 34, textAlign: 'center', color: colors.ink, fontWeight: '800', fontSize: 14 },
});
