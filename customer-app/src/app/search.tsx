import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';

const recent = ['Chakki atta', 'Fresh vegetables', 'Toor dal'];

export default function SearchScreen() {
  const { categories, products } = useApp();
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return products.filter((item) => `${item.name} ${item.hindiName} ${categories.find((category) => category.id === item.categoryId)?.name}`.toLowerCase().includes(value));
  }, [categories, products, query]);
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
        <View style={styles.search}><Ionicons name="search" size={20} color={colors.muted} /><TextInput autoFocus placeholder="Search groceries..." placeholderTextColor="#9BA39D" value={query} onChangeText={setQuery} style={styles.input} />{query ? <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={colors.muted} /></Pressable> : <Ionicons name="mic-outline" size={19} color={colors.forest} />}</View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!query ? <>
          <Text style={styles.sectionTitle}>Recent searches</Text>
          <View style={styles.chips}>{recent.map((item) => <Pressable key={item} onPress={() => setQuery(item)} style={styles.chip}><Ionicons name="time-outline" size={14} color={colors.muted} /><Text style={styles.chipText}>{item}</Text></Pressable>)}</View>
          <Text style={styles.sectionTitle}>Popular searches</Text>
          <View style={styles.popular}>{products.slice(0, 6).map((item, index) => <Pressable key={item.id} onPress={() => setQuery(item.name)} style={styles.popularItem}><Text style={styles.rank}>{String(index + 1).padStart(2, '0')}</Text><Text style={styles.popularEmoji}>{item.emoji}</Text><View style={styles.popularCopy}><Text style={styles.popularName}>{item.name}</Text><Text style={styles.popularSub}>{item.hindiName}</Text></View><Ionicons name="arrow-up-outline" size={17} color={colors.success} style={{ transform: [{ rotate: '45deg' }] }} /></Pressable>)}</View>
        </> : results.length ? <><Text style={styles.resultText}>{results.length} results for “{query}”</Text><View style={styles.grid}>{results.map((product) => <View key={product.id} style={styles.product}><ProductCard product={product} /></View>)}</View></> : <EmptyState icon="search-outline" title="कुछ नहीं मिला" body="Spelling बदलकर या category name से search करके देखें।" />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.warmWhite }, header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: 50, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  back: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  search: { flex: 1, height: 48, borderRadius: radius.md, backgroundColor: colors.mint, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md }, input: { flex: 1, height: '100%', color: colors.ink, fontSize: 14 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl }, sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: spacing.md, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl }, chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.md, height: 35, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }, chipText: { color: colors.muted, fontSize: 11 },
  popular: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.line }, popularItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.line }, rank: { color: colors.muted, fontSize: 10, fontWeight: '800', width: 25 }, popularEmoji: { fontSize: 28 }, popularCopy: { flex: 1, marginLeft: spacing.md }, popularName: { color: colors.ink, fontSize: 13, fontWeight: '800' }, popularSub: { color: colors.muted, fontSize: 9, marginTop: 2 },
  resultText: { color: colors.muted, fontSize: 11, marginBottom: spacing.lg }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md }, product: { width: '48.5%' },
});
