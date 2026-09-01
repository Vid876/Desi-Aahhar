const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:8080/api/v1';

export async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function uploadProof(uri: string, token: string) {
  const form = new FormData();
  form.append('file', { uri, name: `delivery-${Date.now()}.jpg`, type: 'image/jpeg' } as unknown as Blob);
  const response = await fetch(`${API_URL}/files/delivery-proof`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Photo upload failed' }));
    throw new Error(error.message ?? 'Photo upload failed');
  }
  return response.json() as Promise<{ url: string }>;
}
