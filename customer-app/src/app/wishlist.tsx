import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { Screen } from '@/components/Screen';
import { useApp } from '@/context/AppContext';
import { spacing } from '@/theme';

export default function WishlistScreen() {
  const { favorites, products } = useApp();
  const items = products.filter((product) => favorites.includes(product.id));
  return (
    <Screen>
      <AppHeader title="My wishlist" subtitle={`${items.length} saved products`} />
      {!items.length ? <EmptyState icon="heart-outline" title="Wishlist खाली है" body="Product पर heart tap करके उसे यहाँ save करें।" action="Discover products" onAction={() => router.push('/(tabs)/home')} /> : <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.grid}>{items.map((product) => <View key={product.id} style={styles.product}><ProductCard product={product} /></View>)}</View></ScrollView>}
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md }, product: { width: '48.5%' } });
