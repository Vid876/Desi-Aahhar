import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { coupons, products } from '@/data/catalog';
import { validateMinimumRule } from '@/domain/ruleEngine';
import { Address, CartDisplayItem, CartLine, Coupon, Order } from '@/types';

const STORAGE_KEY = 'desi-aahhar-app-state-v1';

const defaultAddresses: Address[] = [
  {
    id: 'home', label: 'Home', recipient: 'Vivek Kumar', phone: '+91 98765 43210',
    line1: 'House 24, Shanti Vihar', city: 'New Delhi', pincode: '110092',
  },
  {
    id: 'shop', label: 'Shop', recipient: 'Vivek Kumar', phone: '+91 98765 43210',
    line1: 'Desi General Store, Main Market', city: 'New Delhi', pincode: '110091',
  },
];

const seededOrders: Order[] = [
  {
    id: 'DAH240812', createdAt: '2026-08-12T10:20:00.000Z', status: 'DELIVERED', total: 1114,
    itemCount: 4,
    items: [
      { productId: 'chakki-atta', variantId: 'atta-5kg', quantity: 1 },
      { productId: 'toor-dal', variantId: 'toor-1kg', quantity: 2 },
      { productId: 'milk', variantId: 'milk-1l', quantity: 1 },
    ],
    address: defaultAddresses[0], paymentMethod: 'COD', deliverySlot: '10:00 AM - 12:00 PM',
  },
  {
    id: 'DAH240826', createdAt: '2026-08-26T13:10:00.000Z', status: 'OUT_FOR_DELIVERY', total: 1378,
    itemCount: 3,
    items: [
      { productId: 'basmati-rice', variantId: 'rice-5kg', quantity: 1 },
      { productId: 'mustard-oil', variantId: 'oil-1l', quantity: 2 },
    ],
    address: defaultAddresses[1], paymentMethod: 'ONLINE', deliverySlot: '4:00 PM - 6:00 PM',
  },
];

type PersistedState = {
  cart: CartLine[];
  favorites: string[];
  addresses: Address[];
  selectedAddressId: string;
  orders: Order[];
  isAuthenticated: boolean;
  mobileNumber: string;
  email: string;
  authMethod: 'phone' | 'email';
};

type AppContextValue = {
  hydrated: boolean;
  isAuthenticated: boolean;
  mobileNumber: string;
  email: string;
  authMethod: 'phone' | 'email';
  signIn: (identity: string, method?: 'phone' | 'email') => void;
  signOut: () => void;
  cart: CartLine[];
  cartItems: CartDisplayItem[];
  cartCount: number;
  cartSubtotal: number;
  ruleValidation: ReturnType<typeof validateMinimumRule>;
  appliedCoupon?: Coupon;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
  addToCart: (productId: string, variantId?: string, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  addresses: Address[];
  selectedAddress?: Address;
  selectAddress: (id: string) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  orders: Order[];
  placeOrder: (payment: 'COD' | 'ONLINE', slot: string) => Order;
  repeatOrder: (orderId: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['toor-dal', 'milk']);
  const [addresses, setAddresses] = useState<Address[]>(defaultAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState('home');
  const [orders, setOrders] = useState<Order[]>(seededOrders);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon>();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const data = JSON.parse(raw) as Partial<PersistedState>;
        if (data.cart) setCart(data.cart);
        if (data.favorites) setFavorites(data.favorites);
        if (data.addresses?.length) setAddresses(data.addresses);
        if (data.selectedAddressId) setSelectedAddressId(data.selectedAddressId);
        if (data.orders) setOrders(data.orders);
        if (typeof data.isAuthenticated === 'boolean') setAuthenticated(data.isAuthenticated);
        if (data.mobileNumber) setMobileNumber(data.mobileNumber);
        if (data.email) setEmail(data.email);
        if (data.authMethod) setAuthMethod(data.authMethod);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedState = {
      cart, favorites, addresses, selectedAddressId, orders, isAuthenticated, mobileNumber, email, authMethod,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [addresses, authMethod, cart, email, favorites, hydrated, isAuthenticated, mobileNumber, orders, selectedAddressId]);

  const cartItems = useMemo<CartDisplayItem[]>(() => cart.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    return product && variant ? [{ ...line, product, variant }] : [];
  }), [cart]);

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.variant.price * line.quantity, 0),
    [cartItems],
  );
  const ruleValidation = useMemo(() => validateMinimumRule(cartItems), [cartItems]);
  const discount = appliedCoupon && cartSubtotal >= appliedCoupon.minimum ? appliedCoupon.discount : 0;
  const deliveryFee = cartSubtotal === 0 || cartSubtotal >= 999 ? 0 : 49;
  const grandTotal = Math.max(0, cartSubtotal - discount + deliveryFee);
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? addresses[0];

  const addToCart = useCallback((productId: string, variantId?: string, quantity = 1) => {
    const product = products.find((item) => item.id === productId);
    const resolvedVariantId = variantId ?? product?.variants[0]?.id;
    if (!product || !resolvedVariantId) return;
    setCart((current) => {
      const existing = current.find((line) => line.productId === productId && line.variantId === resolvedVariantId);
      if (existing) {
        return current.map((line) => line === existing ? { ...line, quantity: line.quantity + quantity } : line);
      }
      return [...current, { productId, variantId: resolvedVariantId, quantity }];
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, []);

  const updateQuantity = useCallback((productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((line) => !(line.productId === productId && line.variantId === variantId)));
      return;
    }
    setCart((current) => current.map((line) =>
      line.productId === productId && line.variantId === variantId ? { ...line, quantity } : line,
    ));
  }, []);

  const applyCoupon = useCallback((rawCode: string) => {
    const coupon = coupons.find((item) => item.code === rawCode.trim().toUpperCase());
    if (!coupon) return { success: false, message: 'यह coupon code valid नहीं है।' };
    if (cartSubtotal < coupon.minimum) {
      return { success: false, message: `इस offer के लिए cart ₹${coupon.minimum} होना चाहिए।` };
    }
    setAppliedCoupon(coupon);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    return { success: true, message: `${coupon.title} successfully applied!` };
  }, [cartSubtotal]);

  const placeOrder = useCallback((paymentMethod: 'COD' | 'ONLINE', deliverySlot: string) => {
    if (!selectedAddress) throw new Error('Delivery address is required');
    const order: Order = {
      id: `DAH${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED',
      total: grandTotal,
      itemCount: cartCount,
      items: cart,
      address: selectedAddress,
      paymentMethod,
      deliverySlot,
    };
    setOrders((current) => [order, ...current]);
    setCart([]);
    setAppliedCoupon(undefined);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    return order;
  }, [cart, cartCount, grandTotal, selectedAddress]);

  const value = useMemo<AppContextValue>(() => ({
    hydrated,
    isAuthenticated,
    mobileNumber,
    email,
    authMethod,
    signIn: (identity, method = 'phone') => {
      setAuthMethod(method);
      if (method === 'email') setEmail(identity);
      else setMobileNumber(identity);
      setAuthenticated(true);
    },
    signOut: () => setAuthenticated(false),
    cart,
    cartItems,
    cartCount,
    cartSubtotal,
    ruleValidation,
    appliedCoupon,
    discount,
    deliveryFee,
    grandTotal,
    addToCart,
    updateQuantity,
    removeFromCart: (productId, variantId) => setCart((current) => current.filter(
      (line) => !(line.productId === productId && line.variantId === variantId),
    )),
    clearCart: () => { setCart([]); setAppliedCoupon(undefined); },
    applyCoupon,
    favorites,
    toggleFavorite: (productId) => setFavorites((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    ),
    addresses,
    selectedAddress,
    selectAddress: setSelectedAddressId,
    addAddress: (address) => {
      const next = { ...address, id: `address-${Date.now()}` };
      setAddresses((current) => [...current, next]);
      setSelectedAddressId(next.id);
    },
    orders,
    placeOrder,
    repeatOrder: (orderId) => {
      const order = orders.find((item) => item.id === orderId);
      if (order) setCart(order.items);
    },
  }), [
    addToCart, addresses, appliedCoupon, applyCoupon, cart, cartCount, cartItems, cartSubtotal,
    authMethod, deliveryFee, discount, email, favorites, grandTotal, hydrated, isAuthenticated, mobileNumber,
    orders, placeOrder, ruleValidation, selectedAddress, updateQuantity,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
