import { PropsWithChildren } from 'react';
import { SafeAreaView, StatusBar, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { colors } from '@/theme';

type Props = PropsWithChildren<{ style?: StyleProp<ViewStyle>; edges?: 'light' | 'dark' }>;

export function Screen({ children, style, edges = 'dark' }: Props) {
  return (
    <SafeAreaView style={[styles.safe, style]}>
      <StatusBar barStyle={edges === 'dark' ? 'dark-content' : 'light-content'} backgroundColor="transparent" translucent />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.warmWhite } });
