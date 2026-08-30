import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '@/context/AppContext';
import { colors, formatCurrency, radius, shadow, spacing } from '@/theme';
import { Product } from '@/types';

type Props = { product: Product; wide?: boolean };

export function ProductCard({ product, wide }: Props) {
  const { addToCart, cart, favorites, toggleFavorite } = useApp();
  const variant = product.variants[0];
  const inCart = cart.some((line) => line.productId === product.id);
  const favorite = favorites.includes(product.id);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={({ pressed }) => [styles.card, wide && styles.wide, pressed && styles.pressed]}
    >
      <View style={styles.visual}>
        <Text style={styles.emoji}>{product.emoji}</Text>
        {product.badge ? <Text style={styles.badge}>{product.badge}</Text> : null}
        <Pressable
          accessibilityLabel={favorite ? 'Remove from wishlist' : 'Add to wishlist'}
          hitSlop={10}
          onPress={(event) => { event.stopPropagation(); toggleFavorite(product.id); }}
          style={styles.heart}
        >
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={19} color={favorite ? colors.danger : colors.forest} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>{product.name}</Text>
        <Text numberOfLines={1} style={styles.hindi}>{product.hindiName}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.saffron} />
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.unit}>{variant.label}</Text>
        </View>
        <View style={styles.bottom}>
          <View>
            <Text style={styles.price}>{formatCurrency(variant.price)}</Text>
            {variant.mrp > variant.price ? <Text style={styles.mrp}>{formatCurrency(variant.mrp)}</Text> : null}
          </View>
          <Pressable
            accessibilityLabel={`Add ${product.name} to cart`}
            onPress={(event) => { event.stopPropagation(); addToCart(product.id, variant.id); }}
            style={[styles.add, inCart && styles.added]}
          >
            <Ionicons name={inCart ? 'checkmark' : 'add'} size={21} color={inCart ? colors.forest : colors.white} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 174, backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, ...shadow },
  wide: { width: '100%', flexDirection: 'row' },
  pressed: { opacity: 0.92 },
  visual: { height: 126, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  emoji: { fontSize: 61 },
  badge: { position: 'absolute', left: spacing.sm, top: spacing.sm, color: colors.forest, backgroundColor: colors.saffronLight, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4, fontSize: 9, fontWeight: '800' },
  heart: { position: 'absolute', right: spacing.sm, top: spacing.sm, width: 32, height: 32, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md, flex: 1 },
  name: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  hindi: { color: colors.muted, fontSize: 11, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: spacing.sm },
  rating: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  dot: { color: colors.muted, fontSize: 10 },
  unit: { color: colors.muted, fontSize: 11 },
  bottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.md },
  price: { color: colors.forest, fontSize: 16, fontWeight: '900' },
  mrp: { color: colors.muted, fontSize: 10, textDecorationLine: 'line-through' },
  add: { width: 38, height: 38, borderRadius: radius.pill, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  added: { backgroundColor: colors.leafLight, borderWidth: 1, borderColor: colors.forest },
});
