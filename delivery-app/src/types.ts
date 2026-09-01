export type StaffUser = { id: string; name: string; email: string; role: string };
export type Order = {
  id: string; orderNumber: string; customerName: string; status: string; paymentMethod: string; paymentStatus: string;
  total: number; deliverySlot: string; deliveryProofUrl?: string; createdAt: string;
  address: { recipient: string; phone: string; line1: string; city: string; pincode: string };
  items: { productName: string; variantLabel: string; quantity: number; lineTotal: number }[];
  history: { status: string; note: string; createdAt: string }[];
};
