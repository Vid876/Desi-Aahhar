import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { categories, products } from '@/data/catalog';
import { colors, radius, spacing } from '@/theme';

export default function CategoriesScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>EXPLORE</Text><Text style={styles.title}>All categories</Text></View>
        <Pressable onPress={() => router.push('/search')} style={styles.search}><Ionicons name="search" size={22} color={colors.ink} /></Pressable>
      </View>
      <View style={styles.notice}>
        <Ionicons name="information-circle" size={20} color={colors.forest} />
        <Text style={styles.noticeText}>₹500 rule केवल marked grocery categories पर लागू है। Fresh items exempt हैं।</Text>
      </View>
      <View style={styles.grid}>
        {categories.map((category) => (
          <Pressable key={category.id} onPress={() => router.push({ pathname: '/category/[id]', params: { id: category.id } })} style={styles.card}>
            <View style={[styles.visual, { backgroundColor: category.color }]}><Text style={styles.emoji}>{category.emoji}</Text></View>
            <View style={styles.cardCopy}>
              <Text style={styles.name}>{category.name}</Text>
              <Text style={styles.hindi}>{category.hindiName}</Text>
              <View style={[styles.ruleChip, !category.appliesMinimum && styles.exemptChip]}>
                <Text style={[styles.ruleText, !category.appliesMinimum && styles.exemptText]}>{category.appliesMinimum ? '₹500 minimum' : 'No minimum'}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Trending products</Text><Text style={styles.sectionSub}>Most loved this week</Text></View>
      <View style={styles.products}>{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} wide />)}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.warmWhite },
  content: { paddingTop: 54, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: colors.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 28, fontWeight: '900', marginTop: 3 },
  search: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  notice: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.mint, marginTop: spacing.lg },
  noticeText: { flex: 1, color: colors.forest, fontSize: 11, lineHeight: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: spacing.lg, gap: spacing.md },
  card: { width: '48%', backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.line },
  visual: { height: 104, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 52 },
  cardCopy: { padding: spacing.md },
  name: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  hindi: { color: colors.muted, fontSize: 10, marginTop: 2 },
  ruleChip: { alignSelf: 'flex-start', backgroundColor: colors.saffronLight, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4, marginTop: spacing.sm },
  exemptChip: { backgroundColor: colors.successLight },
  ruleText: { color: colors.brown, fontSize: 8, fontWeight: '800' },
  exemptText: { color: colors.success },
  sectionHeader: { marginTop: spacing.xxxl },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  sectionSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
  products: { gap: spacing.md, marginTop: spacing.lg },
});
