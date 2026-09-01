import { PropsWithChildren } from 'react';
import { SafeAreaView, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme';

export function Screen({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <SafeAreaView style={[styles.screen, style]}>{children}</SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.cream } });
