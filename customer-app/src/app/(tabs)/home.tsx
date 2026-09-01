import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { RuleProgress } from '@/components/RuleProgress';
import { useApp } from '@/context/AppContext';
import { colors, formatCurrency, radius, shadow, spacing } from '@/theme';

function SectionHeader({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Pressable onPress={onPress}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

export default function HomeScreen() {
  const { selectedAddress, ruleValidation, orders, repeatOrder, categories, products } = useApp();
  const freshCategory = categories.find((category) => !category.appliesMinimum) ?? categories[0];
  const recentOrder = orders.find((order) => order.status === 'DELIVERED');
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topbar}>
          <View style={styles.locationIcon}><Ionicons name="location" size={18} color={colors.forest} /></View>
          <Pressable onPress={() => router.push('/addresses')} style={styles.locationCopy}>
            <Text style={styles.deliver}>Delivering to</Text>
            <View style={styles.locationRow}>
              <Text numberOfLines={1} style={styles.location}>{selectedAddress?.label} • {selectedAddress?.pincode}</Text>
              <Ionicons name="chevron-down" size={15} color={colors.ink} />
            </View>
          </Pressable>
          <Pressable onPress={() => router.push('/notifications')} style={styles.roundButton}>
            <Ionicons name="notifications-outline" size={21} color={colors.ink} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.kicker}>नमस्ते Vivek 👋</Text>
            <Text style={styles.greeting}>आज क्या मंगवाना है?</Text>
          </View>
          <Image source={require('../../../assets/brand/desi-aahhar-logo.png')} contentFit="contain" style={styles.miniLogo} />
        </View>

        <Pressable onPress={() => router.push('/search')} style={styles.search}>
          <Ionicons name="search" size={21} color={colors.muted} />
          <Text style={styles.searchText}>Search atta, dal, vegetables...</Text>
          <View style={styles.mic}><Ionicons name="mic-outline" size={18} color={colors.forest} /></View>
        </Pressable>

        <View style={styles.hero}>
          <Image source={require('../../../assets/brand/grocery-hero.png')} contentFit="cover" style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(9,42,22,0.95)', 'rgba(9,42,22,0.68)', 'rgba(9,42,22,0.03)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroPill}>FRESH ARRIVALS</Text>
            <Text style={styles.heroTitle}>देसी freshness,{`\n`}हर दिन।</Text>
            <Text style={styles.heroBody}>Fresh vegetables पर कोई minimum नहीं</Text>
            <Pressable onPress={() => freshCategory && router.push({ pathname: '/category/[id]', params: { id: freshCategory.id } })} style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Shop fresh</Text><Ionicons name="arrow-forward" size={14} color={colors.forestDark} />
            </Pressable>
          </View>
        </View>

        <SectionHeader title="Shop by category" action="View all" onPress={() => router.push('/(tabs)/categories')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {categories.map((category) => (
            <Pressable key={category.id} onPress={() => router.push({ pathname: '/category/[id]', params: { id: category.id } })} style={styles.category}>
              <View style={[styles.categoryVisual, { backgroundColor: category.color }]}><Text style={styles.categoryEmoji}>{category.emoji}</Text></View>
              <Text numberOfLines={2} style={styles.categoryName}>{category.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <RuleProgress validation={ruleValidation} />

        <SectionHeader title="Popular essentials" action="See all" onPress={() => router.push('/search')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productList}>
          {products.filter((product) => product.featured).map((product) => <ProductCard key={product.id} product={product} />)}
        </ScrollView>

        <Pressable onPress={() => router.push('/offers')} style={styles.offerCard}>
          <View style={styles.offerIcon}><Ionicons name="pricetag" size={22} color={colors.brown} /></View>
          <View style={styles.offerCopy}>
            <Text style={styles.offerTitle}>आज की बचत</Text>
            <Text style={styles.offerBody}>DESI100 लगाएँ और ₹999+ पर ₹100 बचाएँ</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.brown} />
        </Pressable>

        {recentOrder ? (
          <View style={styles.repeatCard}>
            <View style={styles.repeatTop}>
              <View><Text style={styles.repeatTitle}>फिर से मंगाएँ</Text><Text style={styles.repeatSub}>Your last favourites • {recentOrder.itemCount} items</Text></View>
              <Text style={styles.repeatPrice}>{formatCurrency(recentOrder.total)}</Text>
            </View>
            <View style={styles.repeatEmojis}>
              {recentOrder.items.slice(0, 4).map((item) => <Text key={`${item.productId}-${item.variantId}`} style={styles.repeatEmoji}>{products.find((product) => product.id === item.productId)?.emoji}</Text>)}
              <Pressable onPress={() => { repeatOrder(recentOrder.id); router.push('/(tabs)/cart'); }} style={styles.repeatButton}>
                <Ionicons name="refresh" size={16} color={colors.white} /><Text style={styles.repeatButtonText}>Repeat order</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.warmWhite },
  content: { paddingTop: 48, paddingBottom: spacing.xxxl },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  locationIcon: { width: 38, height: 38, borderRadius: radius.pill, backgroundColor: colors.leafLight, alignItems: 'center', justifyContent: 'center' },
  locationCopy: { flex: 1, marginLeft: spacing.md },
  deliver: { color: colors.muted, fontSize: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  location: { color: colors.ink, fontSize: 13, fontWeight: '800', maxWidth: 205 },
  roundButton: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', right: 10, top: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1, borderColor: colors.white },
  greetingRow: { marginTop: spacing.xl, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { color: colors.forest, fontSize: 13, fontWeight: '800' },
  greeting: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 3 },
  miniLogo: { width: 64, height: 64 },
  search: { height: 54, marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: radius.md, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.lg, borderWidth: 1, borderColor: colors.line, ...shadow },
  searchText: { flex: 1, color: '#9BA39D', fontSize: 13, marginLeft: spacing.md },
  mic: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 5 },
  hero: { height: 210, marginHorizontal: spacing.lg, marginTop: spacing.lg, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.forestDark },
  heroCopy: { width: '64%', padding: spacing.xl },
  heroPill: { color: colors.saffronLight, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  heroTitle: { color: colors.white, fontSize: 25, lineHeight: 30, fontWeight: '900', marginTop: spacing.sm },
  heroBody: { color: 'rgba(255,255,255,0.82)', fontSize: 11, lineHeight: 15, marginTop: spacing.sm },
  heroButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.saffronLight, paddingHorizontal: 13, height: 34, borderRadius: radius.pill, alignSelf: 'flex-start', marginTop: spacing.md },
  heroButtonText: { color: colors.forestDark, fontSize: 11, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.xxl, marginBottom: spacing.md },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  sectionAction: { color: colors.forest, fontSize: 12, fontWeight: '800' },
  categoryList: { paddingHorizontal: spacing.lg, gap: spacing.md },
  category: { width: 72, alignItems: 'center' },
  categoryVisual: { width: 66, height: 66, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  categoryEmoji: { fontSize: 32 },
  categoryName: { color: colors.ink, fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: spacing.sm, lineHeight: 14 },
  productList: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  offerCard: { marginHorizontal: spacing.lg, marginTop: spacing.xl, backgroundColor: colors.saffronLight, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  offerIcon: { width: 45, height: 45, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  offerCopy: { flex: 1 },
  offerTitle: { color: colors.brown, fontSize: 15, fontWeight: '900' },
  offerBody: { color: '#8C602B', fontSize: 11, marginTop: 3 },
  repeatCard: { marginHorizontal: spacing.lg, marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.forestDark },
  repeatTop: { flexDirection: 'row', justifyContent: 'space-between' },
  repeatTitle: { color: colors.white, fontSize: 17, fontWeight: '900' },
  repeatSub: { color: 'rgba(255,255,255,0.62)', fontSize: 10, marginTop: 3 },
  repeatPrice: { color: colors.saffronLight, fontSize: 16, fontWeight: '900' },
  repeatEmojis: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  repeatEmoji: { fontSize: 28, marginRight: 5 },
  repeatButton: { marginLeft: 'auto', backgroundColor: colors.leaf, height: 37, paddingHorizontal: spacing.md, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 5 },
  repeatButtonText: { color: colors.white, fontSize: 11, fontWeight: '800' },
});
