export type Category = {
  id: string;
  name: string;
  hindiName: string;
  emoji: string;
  color: string;
  appliesMinimum: boolean;
};

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  mrp: number;
  stock: number;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  hindiName: string;
  emoji: string;
  description: string;
  rating: number;
  reviews: number;
  badge?: string;
  featured?: boolean;
  variants: ProductVariant[];
};

export type CartLine = { productId: string; variantId: string; quantity: number };
export type CartDisplayItem = CartLine & { product: Product; variant: ProductVariant };

export type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  city: string;
  pincode: string;
};

export type OrderStatus =
  | 'CONFIRMED'
  | 'PICKING'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  items: CartLine[];
  address: Address;
  paymentMethod: 'COD' | 'ONLINE';
  deliverySlot: string;
};

export type Coupon = {
  code: string;
  title: string;
  description: string;
  minimum: number;
  discount: number;
};

export type RuleValidation = {
  valid: boolean;
  eligibleSubtotal: number;
  threshold: number;
  remaining: number;
  progress: number;
  hasEligibleItems: boolean;
};
