import { CartDisplayItem, Category, RuleValidation } from '@/types';
import { categories } from '@/data/catalog';

export const MINIMUM_RULE_THRESHOLD = 500;

export function validateMinimumRule(items: CartDisplayItem[], availableCategories: Category[] = categories): RuleValidation {
  const categoryMap = new Map(availableCategories.map((category) => [category.id, category]));
  const eligibleSubtotal = items.reduce((total, item) => {
    const category = categoryMap.get(item.product.categoryId);
    return category?.appliesMinimum ? total + item.variant.price * item.quantity : total;
  }, 0);
  const categorySubtotals = new Map<string, number>();
  for (const item of items) {
    const category = categoryMap.get(item.product.categoryId);
    if (!category?.appliesMinimum) continue;
    categorySubtotals.set(category.id, (categorySubtotals.get(category.id) ?? 0) + item.variant.price * item.quantity);
  }
  const violations = [...categorySubtotals.entries()].map(([categoryId, subtotal]) => {
    const category = categoryMap.get(categoryId)!;
    const threshold = category.minimumOrderValue ?? MINIMUM_RULE_THRESHOLD;
    return {
      categoryId,
      categoryName: category.name,
      subtotal,
      threshold,
      remaining: Math.max(0, threshold - subtotal),
    };
  }).filter((violation) => violation.remaining > 0);
  const hasEligibleItems = categorySubtotals.size > 0;
  const remaining = violations.reduce((sum, violation) => sum + violation.remaining, 0);
  const threshold = [...categorySubtotals.keys()].reduce(
    (sum, categoryId) => sum + (categoryMap.get(categoryId)?.minimumOrderValue ?? MINIMUM_RULE_THRESHOLD),
    0,
  );

  return {
    valid: violations.length === 0,
    eligibleSubtotal,
    threshold: hasEligibleItems ? threshold : MINIMUM_RULE_THRESHOLD,
    remaining,
    progress: hasEligibleItems && threshold > 0 ? Math.min(1, (threshold - remaining) / threshold) : 1,
    hasEligibleItems,
    violations,
  };
}
