export type AuthResponse = { token: string; user: { id: string; name: string; email: string; role: string } };
export type Dashboard = {
  customers: number; orders: number; activeOrders: number; lowStockVariants: number; revenue: number;
  orderStatus: { status: string; total: number }[];
};
export type Integration = { postgresql: boolean; smsOtp: boolean; emailOtp: boolean; razorpay: boolean; firebasePush: boolean };
export type Staff = { id: string; name: string; email: string; phone?: string; active: boolean; activeOrders: number };
export type Category = {
  id: string; slug: string; name: string; hindiName: string; emoji: string; color: string;
  appliesMinimum: boolean; minimumOrderValue: number;
};
export type Variant = { id: string; sku: string; label: string; price: number; mrp: number; stock: number };
export type Product = {
  id: string; categoryId: string; slug: string; name: string; hindiName: string; emoji: string;
  description: string; rating: number; reviews: number; badge?: string; featured: boolean; variants: Variant[];
};
export type Order = {
  id: string; orderNumber: string; userId: string; customerName: string; status: string; paymentMethod: string;
  paymentStatus: string; subtotal: number; discount: number; deliveryFee: number; total: number; deliverySlot: string;
  address: { recipient: string; phone: string; line1: string; city: string; pincode: string };
  assignedTo?: string; staffName?: string; createdAt: string;
  items: { productName: string; variantLabel: string; quantity: number; lineTotal: number }[];
  history: { status: string; note: string; createdAt: string }[];
};
export type Coupon = {
  id: string; code: string; title: string; description: string; minimumAmount: number;
  discountAmount: number; active: boolean;
};
