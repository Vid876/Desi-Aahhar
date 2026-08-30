import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, icon, disabled, variant = 'primary', style }: Props) {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
      {icon ? <Ionicons name={icon} size={19} color={secondary ? colors.forest : colors.white} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 54, paddingHorizontal: spacing.xl, borderRadius: radius.md, backgroundColor: colors.forest, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  secondary: { backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.leafLight },
  label: { color: colors.white, fontSize: 16, fontWeight: '800' },
  secondaryLabel: { color: colors.forest },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
});
