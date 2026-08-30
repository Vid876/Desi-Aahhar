import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { QuantityStepper } from '@/components/QuantityStepper';
import { categories, products } from '@/data/catalog';
import { useApp } from '@/context/AppContext';
import { colors, formatCurrency, radius, spacing } from '@/theme';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = products.find((item) => item.id === id);
  const { addToCart, favorites, toggleFavorite, cartCount } = useApp();
  const [variantId, setVariantId] = useState(product?.variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const variant = useMemo(() => product?.variants.find((item) => item.id === variantId) ?? product?.variants[0], [product, variantId]);
  const category = categories.find((item) => item.id === product?.categoryId);

  if (!product || !variant) return <View style={styles.missing}><Text>Product not found.</Text><PrimaryButton label="Go home" onPress={() => router.replace('/(tabs)/home')} /></View>;
  const favorite = favorites.includes(product.id);
  const saving = (variant.mrp - variant.price) * quantity;
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.visual}>
          <View style={styles.visualGlow} />
          <Text style={styles.emoji}>{product.emoji}</Text>
          <Pressable onPress={() => router.back()} style={[styles.iconButton, styles.back]}><Ionicons name="chevron-back" size={23} color={colors.ink} /></Pressable>
          <Pressable onPress={() => toggleFavorite(product.id)} style={[styles.iconButton, styles.heart]}><Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? colors.danger : colors.ink} /></Pressable>
          <Pressable onPress={() => router.push('/(tabs)/cart')} style={[styles.iconButton, styles.cart]}><Ionicons name="basket-outline" size={21} color={colors.ink} />{cartCount ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View> : null}</Pressable>
          {product.badge ? <View style={styles.badge}><Text style={styles.badgeText}>{product.badge}</Text></View> : null}
        </View>
        <View style={styles.body}>
          <Text style={styles.category}>{category?.name.toUpperCase()}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.hindi}>{product.hindiName}</Text>
          <View style={styles.ratingRow}><View style={styles.rating}><Ionicons name="star" size={14} color={colors.saffron} /><Text style={styles.ratingText}>{product.rating}</Text></View><Text style={styles.review}>{product.reviews} verified reviews</Text></View>
          <Text style={styles.sectionTitle}>Choose pack size</Text>
          <View style={styles.variants}>
            {product.variants.map((item) => {
              const selected = item.id === variant.id;
              return <Pressable key={item.id} onPress={() => setVariantId(item.id)} style={[styles.variant, selected && styles.variantSelected]}><Text style={[styles.variantLabel, selected && styles.variantLabelSelected]}>{item.label}</Text><Text style={[styles.variantPrice, selected && styles.variantPriceSelected]}>{formatCurrency(item.price)}</Text>{selected ? <View style={styles.check}><Ionicons name="checkmark" size={12} color={colors.white} /></View> : null}</Pressable>;
            })}
          </View>
          <View style={styles.priceRow}><View><Text style={styles.price}>{formatCurrency(variant.price * quantity)}</Text><Text style={styles.mrp}>MRP {formatCurrency(variant.mrp * quantity)} • incl. taxes</Text></View><QuantityStepper value={quantity} onChange={(value) => setQuantity(Math.max(1, value))} /></View>
          {saving > 0 ? <View style={styles.saving}><Ionicons name="sparkles" size={16} color={colors.success} /><Text style={styles.savingText}>You save {formatCurrency(saving)} on this item</Text></View> : null}
          <View style={styles.ruleInfo}><Ionicons name={category?.appliesMinimum ? 'basket-outline' : 'checkmark-circle-outline'} size={20} color={colors.forest} /><View><Text style={styles.ruleTitle}>{category?.appliesMinimum ? '₹500 category rule applies' : 'No minimum order for this item'}</Text><Text style={styles.ruleBody}>{category?.appliesMinimum ? 'Cart will show your eligible grocery progress.' : 'Fresh category—checkout even with a smaller cart.'}</Text></View></View>
          <Text style={styles.sectionTitle}>Why you’ll love it</Text>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.benefits}>{[['leaf-outline', 'Quality checked'], ['shield-checkmark-outline', 'Easy returns'], ['flash-outline', 'Fast delivery']].map(([icon, text]) => <View key={text} style={styles.benefit}><View style={styles.benefitIcon}><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.forest} /></View><Text style={styles.benefitText}>{text}</Text></View>)}</View>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}><View><Text style={styles.bottomLabel}>TOTAL</Text><Text style={styles.bottomPrice}>{formatCurrency(variant.price * quantity)}</Text></View><PrimaryButton label="Add to cart" icon="basket" onPress={() => { addToCart(product.id, variant.id, quantity); router.push('/(tabs)/cart'); }} style={styles.addButton} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.warmWhite }, content: { paddingBottom: 110 },
  visual: { height: 355, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  visualGlow: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: colors.leafLight },
  emoji: { fontSize: 142 },
  iconButton: { position: 'absolute', top: 53, width: 42, height: 42, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  back: { left: spacing.lg }, heart: { right: 66 }, cart: { right: spacing.lg },
  cartBadge: { position: 'absolute', right: -4, top: -4, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.saffron, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: colors.ink, fontSize: 8, fontWeight: '900' },
  badge: { position: 'absolute', left: spacing.lg, bottom: spacing.lg, backgroundColor: colors.saffronLight, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 7 },
  badgeText: { color: colors.brown, fontSize: 10, fontWeight: '900' },
  body: { padding: spacing.xl }, category: { color: colors.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  name: { color: colors.ink, fontSize: 28, lineHeight: 34, fontWeight: '900', marginTop: spacing.sm },
  hindi: { color: colors.muted, fontSize: 14, marginTop: 3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.saffronLight, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5 },
  ratingText: { color: colors.brown, fontSize: 11, fontWeight: '900' }, review: { color: colors.muted, fontSize: 10 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: spacing.xxl, marginBottom: spacing.md },
  variants: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  variant: { minWidth: 104, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md, backgroundColor: colors.white, position: 'relative' },
  variantSelected: { borderColor: colors.forest, backgroundColor: colors.mint }, variantLabel: { color: colors.ink, fontSize: 12, fontWeight: '800' }, variantLabelSelected: { color: colors.forest },
  variantPrice: { color: colors.muted, fontSize: 11, marginTop: 3 }, variantPriceSelected: { color: colors.forest, fontWeight: '800' },
  check: { position: 'absolute', right: -5, top: -5, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xxl },
  price: { color: colors.forest, fontSize: 25, fontWeight: '900' }, mrp: { color: colors.muted, fontSize: 10, marginTop: 3, textDecorationLine: 'line-through' },
  saving: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.successLight, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md }, savingText: { color: colors.success, fontSize: 11, fontWeight: '800' },
  ruleInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.saffronLight, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl },
  ruleTitle: { color: colors.ink, fontSize: 12, fontWeight: '900' }, ruleBody: { color: colors.muted, fontSize: 9, marginTop: 2 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 21 },
  benefits: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl }, benefit: { width: '31%', alignItems: 'center' },
  benefitIcon: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.leafLight, alignItems: 'center', justifyContent: 'center' }, benefitText: { color: colors.muted, fontSize: 9, textAlign: 'center', marginTop: spacing.sm },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  bottomLabel: { color: colors.muted, fontSize: 9, fontWeight: '800' }, bottomPrice: { color: colors.ink, fontSize: 20, fontWeight: '900' }, addButton: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl },
});
