declare module 'react-native-razorpay' {
  export type RazorpaySuccess = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };

  export type RazorpayError = {
    code?: number | string;
    description?: string;
  };

  export default class RazorpayCheckout {
    static open(options: Record<string, unknown>): Promise<RazorpaySuccess>;
  }
}
