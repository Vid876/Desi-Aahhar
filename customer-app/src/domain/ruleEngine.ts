import { CartDisplayItem, RuleValidation } from '@/types';
import { categories } from '@/data/catalog';

export const MINIMUM_RULE_THRESHOLD = 500;

export function validateMinimumRule(items: CartDisplayItem[]): RuleValidation {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const eligibleSubtotal = items.reduce((total, item) => {
    const category = categoryMap.get(item.product.categoryId);
    return category?.appliesMinimum ? total + item.variant.price * item.quantity : total;
  }, 0);
  const hasEligibleItems = eligibleSubtotal > 0;
  const remaining = hasEligibleItems ? Math.max(0, MINIMUM_RULE_THRESHOLD - eligibleSubtotal) : 0;

  return {
    valid: !hasEligibleItems || remaining === 0,
    eligibleSubtotal,
    threshold: MINIMUM_RULE_THRESHOLD,
    remaining,
    progress: hasEligibleItems ? Math.min(1, eligibleSubtotal / MINIMUM_RULE_THRESHOLD) : 1,
    hasEligibleItems,
  };
}
