import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { ProductCard } from '@/components/ProductCard';
import { Screen } from '@/components/Screen';
import { categories, products } from '@/data/catalog';
import { colors, radius, spacing } from '@/theme';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = categories.find((item) => item.id === id);
  const items = products.filter((product) => product.categoryId === id);
  if (!category) return <Screen><AppHeader title="Category" /><Text style={styles.notFound}>Category not found.</Text></Screen>;
  return (
    <Screen>
      <AppHeader title={category.name} subtitle={category.hindiName} right={<Pressable onPress={() => router.push('/search')} style={styles.headerIcon}><Ionicons name="search" size={21} color={colors.ink} /></Pressable>} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.banner, { backgroundColor: category.color }]}>
          <View><Text style={styles.bannerKicker}>{category.appliesMinimum ? 'KIRANA ESSENTIALS' : 'FRESH & FLEXIBLE'}</Text><Text style={styles.bannerTitle}>{category.hindiName}</Text><Text style={styles.bannerBody}>{category.appliesMinimum ? 'इस category के eligible cart पर ₹500 minimum लागू है।' : 'इस category पर minimum order लागू नहीं है।'}</Text></View>
          <Text style={styles.bannerEmoji}>{category.emoji}</Text>
        </View>
        <View style={styles.filterRow}><Text style={styles.result}>{items.length} products</Text><Pressable style={styles.filter}><Ionicons name="options-outline" size={16} color={colors.forest} /><Text style={styles.filterText}>Filter</Text></Pressable></View>
        <View style={styles.grid}>{items.map((product) => <View key={product.id} style={styles.product}><ProductCard product={product} /></View>)}</View>
        {!items.length ? <View style={styles.empty}><Text style={styles.emptyEmoji}>{category.emoji}</Text><Text style={styles.emptyTitle}>More products coming soon</Text><Text style={styles.emptyBody}>API जुड़ने पर पूरा live catalog यहाँ दिखाई देगा।</Text></View> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  headerIcon: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  banner: { minHeight: 148, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  bannerKicker: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 }, bannerTitle: { color: colors.ink, fontSize: 22, fontWeight: '900', marginTop: spacing.sm },
  bannerBody: { color: colors.muted, fontSize: 10, lineHeight: 15, maxWidth: 220, marginTop: spacing.sm }, bannerEmoji: { fontSize: 70, marginLeft: 'auto' },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: spacing.lg }, result: { color: colors.muted, fontSize: 11 },
  filter: { height: 36, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.mint, flexDirection: 'row', alignItems: 'center', gap: 5 }, filterText: { color: colors.forest, fontSize: 10, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md }, product: { width: '48.5%' },
  empty: { alignItems: 'center', paddingVertical: 80 }, emptyEmoji: { fontSize: 58 }, emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: spacing.lg }, emptyBody: { color: colors.muted, fontSize: 12, marginTop: spacing.sm },
  notFound: { textAlign: 'center', marginTop: 100, color: colors.muted },
});
