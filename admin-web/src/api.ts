const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export type ApiError = Error & { status?: number };

export async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Request failed' }));
    const error = new Error(data.message ?? `Request failed (${response.status})`) as ApiError;
    error.status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
}

export const money = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(value);

export const shortDate = (value: string) => new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value));
