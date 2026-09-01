import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api, uploadProof } from '@/services/api';
import type { Order, StaffUser } from '@/types';

const STORAGE = 'desi-aahhar-delivery-session-v1';
type ContextValue = {
  hydrated: boolean; token: string; user?: StaffUser; orders: Order[]; loading: boolean;
  signIn: (email: string, password: string) => Promise<void>; signOut: () => Promise<void>; refresh: () => Promise<void>;
  updateStatus: (orderId: string, status: string) => Promise<Order>; captureProof: (orderId: string, uri: string) => Promise<Order>;
  sendLocation: (orderId: string, location?: Location.LocationObject) => Promise<void>;
};
const Context = createContext<ContextValue | null>(null);

export function DeliveryProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false); const [token, setToken] = useState('');
  const [user, setUser] = useState<StaffUser>(); const [orders, setOrders] = useState<Order[]>([]); const [loading, setLoading] = useState(false);

  useEffect(() => { AsyncStorage.getItem(STORAGE).then((raw) => {
    if (raw) { const session = JSON.parse(raw) as { token: string; user: StaffUser }; setToken(session.token); setUser(session.user); }
  }).finally(() => setHydrated(true)); }, []);

  const refresh = useCallback(async () => {
    if (!token) return; setLoading(true);
    try { setOrders(await api<Order[]>('/delivery/orders', {}, token)); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const initial = setTimeout(() => {
      refresh().catch(() => undefined);
      registerPush(token).catch(() => undefined);
    }, 0);
    const timer = setInterval(() => refresh().catch(() => undefined), 30_000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, [refresh, token]);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await api<{ token: string; user: StaffUser }>('/auth/staff/login', {
      method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    setToken(response.token); setUser(response.user); await AsyncStorage.setItem(STORAGE, JSON.stringify(response));
  }, []);

  const signOut = useCallback(async () => { setToken(''); setUser(undefined); setOrders([]); await AsyncStorage.removeItem(STORAGE); }, []);
  const updateStatus = useCallback(async (orderId: string, status: string) => {
    const updated = await api<Order>(`/delivery/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
    setOrders((current) => current.map((order) => order.id === orderId ? updated : order)); return updated;
  }, [token]);
  const captureProof = useCallback(async (orderId: string, uri: string) => {
    const file = await uploadProof(uri, token);
    const updated = await api<Order>(`/delivery/orders/${orderId}/proof`, { method: 'POST', body: JSON.stringify({ proofUrl: file.url }) }, token);
    setOrders((current) => current.map((order) => order.id === orderId ? updated : order)); return updated;
  }, [token]);
  const sendLocation = useCallback(async (orderId: string, supplied?: Location.LocationObject) => {
    let current = supplied;
    if (!current) {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error('Location permission is required for delivery tracking');
      current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    }
    await api(`/delivery/orders/${orderId}/location`, { method: 'POST', body: JSON.stringify({
      latitude: current.coords.latitude, longitude: current.coords.longitude, accuracy: current.coords.accuracy,
    }) }, token);
  }, [token]);

  const value = useMemo(() => ({ hydrated, token, user, orders, loading, signIn, signOut, refresh, updateStatus, captureProof, sendLocation }),
    [captureProof, hydrated, loading, orders, refresh, sendLocation, signIn, signOut, token, updateStatus, user]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

async function registerPush(token: string) {
  if (!Device.isDevice) return;
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('deliveries', {
    name: 'Delivery assignments', importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 250, 120, 250],
  });
  let permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') permission = await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return;
  const nativeToken = await Notifications.getDevicePushTokenAsync();
  const value = typeof nativeToken.data === 'string' ? nativeToken.data : JSON.stringify(nativeToken.data);
  await api('/notifications/devices', { method: 'POST', body: JSON.stringify({ token: value, platform: Platform.OS, app: 'DELIVERY' }) }, token);
}

export function useDelivery() { const value = useContext(Context); if (!value) throw new Error('DeliveryProvider is missing'); return value; }
