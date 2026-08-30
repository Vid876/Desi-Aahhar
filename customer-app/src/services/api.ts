const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:8080/api/v1';
export const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false';

type RequestOptions = RequestInit & { token?: string };

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Something went wrong' }));
    throw new Error(error.message ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const endpoints = {
  sendOtp: '/auth/send-otp',
  verifyOtp: '/auth/verify-otp',
  sendEmailOtp: '/auth/email/send-otp',
  verifyEmailOtp: '/auth/email/verify-otp',
  categories: '/categories',
  products: '/products',
  search: '/search',
  cart: '/cart',
  validateCart: '/cart/validate',
  checkoutPreview: '/checkout/preview',
  orders: '/orders',
  createPayment: '/payments/create',
};
