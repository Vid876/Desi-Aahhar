import assert from 'node:assert/strict';
import test from 'node:test';

import { validateMinimumRule } from './ruleEngine';
import type { CartDisplayItem, Product } from '@/types';

function line(categoryId: string, price: number, quantity = 1): CartDisplayItem {
  const product: Product = {
    id: `product-${categoryId}-${price}`,
    categoryId,
    name: 'Test product',
    hindiName: 'टेस्ट',
    emoji: '🛒',
    description: 'Test item',
    rating: 5,
    reviews: 1,
    variants: [{ id: 'variant', label: '1 unit', price, mrp: price, stock: 10 }],
  };
  return { productId: product.id, variantId: 'variant', quantity, product, variant: product.variants[0] };
}

test('empty cart is valid', () => {
  const result = validateMinimumRule([]);
  assert.equal(result.valid, true);
  assert.equal(result.hasEligibleItems, false);
});

test('fresh vegetable-only cart is exempt', () => {
  const result = validateMinimumRule([line('vegetables', 200)]);
  assert.equal(result.valid, true);
  assert.equal(result.eligibleSubtotal, 0);
});

test('eligible grocery below ₹500 is blocked', () => {
  const result = validateMinimumRule([line('atta-rice', 400), line('vegetables', 100)]);
  assert.equal(result.valid, false);
  assert.equal(result.eligibleSubtotal, 400);
  assert.equal(result.remaining, 100);
});

test('eligible grocery at ₹500 is allowed', () => {
  const result = validateMinimumRule([line('pulses', 250, 2)]);
  assert.equal(result.valid, true);
  assert.equal(result.remaining, 0);
});
