import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { categories as seedCategories, coupons as seedCoupons, products as seedProducts } from '@/data/catalog';
import { validateMinimumRule } from '@/domain/ruleEngine';
import { apiRequest, endpoints, USE_MOCK_API } from '@/services/api';
import { Address, CartDisplayItem, CartLine, Category, Coupon, Order, OrderStatus, Product } from '@/types';
import type { RazorpaySuccess } from 'react-native-razorpay';

const STORAGE_KEY = 'desi-aahhar-app-state-v2';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

type BackendCategory = Category & { slug: string; minimumOrderValue: number };
type BackendProduct = Product & { slug: string };
type BackendOffer = {
  code: string;
  title: string;
  description: string;
  minimumAmount: number;
  discountAmount: number;
};
type BackendCart = {
  items: { productId: string; variantId: string; quantity: number }[];
};
type BackendOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: 'COD' | 'ONLINE';
  total: number;
  deliverySlot: string;
  address: Omit<Address, 'id' | 'label'>;
  createdAt: string;
  items: { productId: string; variantId: string; quantity: number }[];
};
type PaymentOrder = {
  razorpayOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
  receipt: string;
  realGateway: boolean;
};

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
  authToken: string;
};

type AppContextValue = {
  hydrated: boolean;
  liveMode: boolean;
  connectionError?: string;
  isAuthenticated: boolean;
  mobileNumber: string;
  email: string;
  authMethod: 'phone' | 'email';
  authToken: string;
  signIn: (identity: string, method?: 'phone' | 'email', token?: string) => Promise<void>;
  signOut: () => void;
  categories: Category[];
  products: Product[];
  coupons: Coupon[];
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
  placeOrder: (payment: 'COD' | 'ONLINE', slot: string) => Promise<Order>;
  repeatOrder: (orderId: string) => void;
  refreshRemoteState: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function mapOrder(order: BackendOrder): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status as OrderStatus,
    total: Number(order.total),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    items: order.items.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
    address: { ...order.address, id: `order-${order.id}`, label: 'Delivery address' },
    paymentMethod: order.paymentMethod,
    deliverySlot: order.deliverySlot,
  };
}

async function registerNativePushToken(token: string) {
  if (Platform.OS === 'web' || !Device.isDevice) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return;
  const deviceToken = await Notifications.getDevicePushTokenAsync();
  await apiRequest(endpoints.devices, {
    method: 'POST',
    token,
    body: JSON.stringify({ token: String(deviceToken.data), platform: Platform.OS.toUpperCase(), app: 'CUSTOMER' }),
  });
}

export function AppProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [authToken, setAuthToken] = useState('');
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [coupons, setCoupons] = useState<Coupon[]>(seedCoupons);
  const [connectionError, setConnectionError] = useState<string>();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>(USE_MOCK_API ? ['toor-dal', 'milk'] : []);
  const [addresses, setAddresses] = useState<Address[]>(defaultAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState('home');
  const [orders, setOrders] = useState<Order[]>(USE_MOCK_API ? seededOrders : []);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon>();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const data = JSON.parse(raw) as Partial<PersistedState>;
        if (USE_MOCK_API && data.cart) setCart(data.cart);
        if (USE_MOCK_API && data.favorites) setFavorites(data.favorites);
        if (data.addresses?.length) setAddresses(data.addresses);
        if (data.selectedAddressId) setSelectedAddressId(data.selectedAddressId);
        if (USE_MOCK_API && data.orders) setOrders(data.orders);
        if (typeof data.isAuthenticated === 'boolean') {
          setAuthenticated(USE_MOCK_API ? data.isAuthenticated : Boolean(data.isAuthenticated && data.authToken));
        }
        if (data.mobileNumber) setMobileNumber(data.mobileNumber);
        if (data.email) setEmail(data.email);
        if (data.authMethod) setAuthMethod(data.authMethod);
        if (data.authToken) setAuthToken(data.authToken);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedState = {
      cart, favorites, addresses, selectedAddressId, orders, isAuthenticated, mobileNumber, email, authMethod, authToken,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [addresses, authMethod, authToken, cart, email, favorites, hydrated, isAuthenticated, mobileNumber, orders, selectedAddressId]);

  useEffect(() => {
    if (!hydrated || USE_MOCK_API) return;
    Promise.all([
      apiRequest<BackendCategory[]>(endpoints.categories),
      apiRequest<BackendProduct[]>(endpoints.products),
      apiRequest<BackendOffer[]>(endpoints.offers),
    ]).then(([remoteCategories, remoteProducts, remoteOffers]) => {
      setCategories(remoteCategories.map((category) => ({
        id: String(category.id), name: category.name, hindiName: category.hindiName, emoji: category.emoji,
        color: category.color, appliesMinimum: category.appliesMinimum,
        minimumOrderValue: Number(category.minimumOrderValue),
      })));
      setProducts(remoteProducts.map((product) => ({
        id: String(product.id), categoryId: String(product.categoryId), name: product.name,
        hindiName: product.hindiName, emoji: product.emoji, description: product.description,
        rating: Number(product.rating), reviews: product.reviews, badge: product.badge,
        featured: product.featured, variants: product.variants.map((variant) => ({
          id: String(variant.id), label: variant.label, price: Number(variant.price),
          mrp: Number(variant.mrp), stock: variant.stock,
        })),
      })));
      setCoupons(remoteOffers.map((offer) => ({
        code: offer.code, title: offer.title, description: offer.description,
        minimum: Number(offer.minimumAmount), discount: Number(offer.discountAmount),
      })));
      setConnectionError(undefined);
    }).catch((error: Error) => setConnectionError(error.message));
  }, [hydrated]);

  const refreshRemoteState = useCallback(async () => {
    if (USE_MOCK_API || !authToken) return;
    try {
      const [remoteCart, remoteOrders] = await Promise.all([
        apiRequest<BackendCart>(endpoints.cart, { token: authToken }),
        apiRequest<BackendOrder[]>(endpoints.orders, { token: authToken }),
      ]);
      setCart(remoteCart.items.map(({ productId, variantId, quantity }) => ({
        productId: String(productId), variantId: String(variantId), quantity,
      })));
      setOrders(remoteOrders.map(mapOrder));
      setConnectionError(undefined);
      registerNativePushToken(authToken).catch(() => undefined);
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Backend connection failed');
    }
  }, [authToken]);

  useEffect(() => {
    if (!hydrated || !authToken || USE_MOCK_API) return;
    const timer = setTimeout(() => { refreshRemoteState().catch(() => undefined); }, 0);
    return () => clearTimeout(timer);
  }, [authToken, hydrated, refreshRemoteState]);

  const cartItems = useMemo<CartDisplayItem[]>(() => cart.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    return product && variant ? [{ ...line, product, variant }] : [];
  }), [cart, products]);

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.variant.price * line.quantity, 0),
    [cartItems],
  );
  const ruleValidation = useMemo(() => validateMinimumRule(cartItems, categories), [cartItems, categories]);
  const discount = appliedCoupon && cartSubtotal >= appliedCoupon.minimum ? appliedCoupon.discount : 0;
  const deliveryFee = cartSubtotal === 0 || cartSubtotal >= 999 ? 0 : 49;
  const grandTotal = Math.max(0, cartSubtotal - discount + deliveryFee);
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? addresses[0];

  const reportRemoteError = useCallback((error: unknown) => {
    setConnectionError(error instanceof Error ? error.message : 'Backend connection failed');
  }, []);

  const addToCart = useCallback((productId: string, variantId?: string, quantity = 1) => {
    const product = products.find((item) => item.id === productId);
    const resolvedVariantId = variantId ?? product?.variants[0]?.id;
    if (!product || !resolvedVariantId) return;
    setCart((current) => {
      const existing = current.find((line) => line.productId === productId && line.variantId === resolvedVariantId);
      if (existing) return current.map((line) => line === existing ? { ...line, quantity: line.quantity + quantity } : line);
      return [...current, { productId, variantId: resolvedVariantId, quantity }];
    });
    if (!USE_MOCK_API && authToken) {
      apiRequest<BackendCart>('/cart/items', {
        method: 'POST', token: authToken, body: JSON.stringify({ variantId: resolvedVariantId, quantity }),
      }).catch(reportRemoteError);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, [authToken, products, reportRemoteError]);

  const updateQuantity = useCallback((productId: string, variantId: string, quantity: number) => {
    setCart((current) => quantity <= 0
      ? current.filter((line) => !(line.productId === productId && line.variantId === variantId))
      : current.map((line) => line.productId === productId && line.variantId === variantId ? { ...line, quantity } : line));
    if (!USE_MOCK_API && authToken) {
      const request = quantity <= 0
        ? apiRequest<BackendCart>(`/cart/items/${variantId}`, { method: 'DELETE', token: authToken })
        : apiRequest<BackendCart>(`/cart/items/${variantId}`, {
          method: 'PATCH', token: authToken, body: JSON.stringify({ quantity }),
        });
      request.catch(reportRemoteError);
    }
  }, [authToken, reportRemoteError]);

  const removeFromCart = useCallback((productId: string, variantId: string) => {
    setCart((current) => current.filter((line) => !(line.productId === productId && line.variantId === variantId)));
    if (!USE_MOCK_API && authToken) {
      apiRequest<BackendCart>(`/cart/items/${variantId}`, { method: 'DELETE', token: authToken }).catch(reportRemoteError);
    }
  }, [authToken, reportRemoteError]);

  const clearCart = useCallback(() => {
    const variants = cart.map((line) => line.variantId);
    setCart([]);
    setAppliedCoupon(undefined);
    if (!USE_MOCK_API && authToken) {
      Promise.all(variants.map((variantId) => apiRequest<BackendCart>(`/cart/items/${variantId}`, {
        method: 'DELETE', token: authToken,
      }))).catch(reportRemoteError);
    }
  }, [authToken, cart, reportRemoteError]);

  const applyCoupon = useCallback((rawCode: string) => {
    const coupon = coupons.find((item) => item.code === rawCode.trim().toUpperCase());
    if (!coupon) return { success: false, message: 'यह coupon code valid नहीं है।' };
    if (cartSubtotal < coupon.minimum) {
      return { success: false, message: `इस offer के लिए cart ₹${coupon.minimum} होना चाहिए।` };
    }
    setAppliedCoupon(coupon);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    return { success: true, message: `${coupon.title} successfully applied!` };
  }, [cartSubtotal, coupons]);

  const placeOrder = useCallback(async (paymentMethod: 'COD' | 'ONLINE', deliverySlot: string) => {
    if (!selectedAddress) throw new Error('Delivery address is required');
    if (USE_MOCK_API) {
      const order: Order = {
        id: `DAH${Date.now().toString().slice(-8)}`, createdAt: new Date().toISOString(), status: 'CONFIRMED',
        total: grandTotal, itemCount: cartCount, items: cart, address: selectedAddress,
        paymentMethod, deliverySlot,
      };
      setOrders((current) => [order, ...current]);
      setCart([]);
      setAppliedCoupon(undefined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      return order;
    }
    if (!authToken) throw new Error('Please verify your account again');

    const created = await apiRequest<BackendOrder>(endpoints.orders, {
      method: 'POST', token: authToken,
      body: JSON.stringify({
        paymentMethod, deliverySlot,
        address: {
          recipient: selectedAddress.recipient, phone: selectedAddress.phone, line1: selectedAddress.line1,
          city: selectedAddress.city, pincode: selectedAddress.pincode,
        },
        couponCode: appliedCoupon?.code,
      }),
    });

    let completed = created;
    if (paymentMethod === 'ONLINE') {
      try {
        const payment = await apiRequest<PaymentOrder>(endpoints.createPayment, {
          method: 'POST', token: authToken, body: JSON.stringify({ orderId: created.id }),
        });
        let result: RazorpaySuccess;
        if (payment.realGateway) {
          // Expo Go does not contain this native module; load it only for a real configured payment build.
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const RazorpayCheckout = require('react-native-razorpay').default as {
            open: (options: Record<string, unknown>) => Promise<RazorpaySuccess>;
          };
          result = await RazorpayCheckout.open({
            key: payment.keyId,
            order_id: payment.razorpayOrderId,
            amount: payment.amount,
            currency: payment.currency,
            name: 'Desi Aahhar',
            description: `Payment for ${payment.receipt}`,
            prefill: { contact: mobileNumber, email },
            theme: { color: '#246B3C' },
          });
        } else {
          result = {
            razorpay_order_id: payment.razorpayOrderId,
            razorpay_payment_id: `pay_dev_${Date.now()}`,
            razorpay_signature: 'DEV_SUCCESS',
          };
        }
        await apiRequest(endpoints.verifyPayment, {
          method: 'POST', token: authToken,
          body: JSON.stringify({
            internalOrderId: created.id,
            razorpayOrderId: result.razorpay_order_id,
            razorpayPaymentId: result.razorpay_payment_id,
            razorpaySignature: result.razorpay_signature,
          }),
        });
        completed = await apiRequest<BackendOrder>(`${endpoints.orders}/${created.id}`, { token: authToken });
      } catch (error) {
        await apiRequest(`${endpoints.orders}/${created.id}/cancel`, { method: 'POST', token: authToken }).catch(() => undefined);
        throw error;
      }
    }

    const order = mapOrder(completed);
    setOrders((current) => [order, ...current.filter((item) => item.id !== order.id)]);
    setCart([]);
    setAppliedCoupon(undefined);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    return order;
  }, [appliedCoupon?.code, authToken, cart, cartCount, email, grandTotal, mobileNumber, selectedAddress]);

  const repeatOrder = useCallback((orderId: string) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    setCart(order.items);
    if (!USE_MOCK_API && authToken) {
      Promise.all(order.items.map((item) => apiRequest<BackendCart>('/cart/items', {
        method: 'POST', token: authToken,
        body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity }),
      }))).then(refreshRemoteState).catch(reportRemoteError);
    }
  }, [authToken, orders, refreshRemoteState, reportRemoteError]);

  const value = useMemo<AppContextValue>(() => ({
    hydrated,
    liveMode: !USE_MOCK_API,
    connectionError,
    isAuthenticated,
    mobileNumber,
    email,
    authMethod,
    authToken,
    signIn: async (identity, method = 'phone', token = '') => {
      setAuthMethod(method);
      if (method === 'email') setEmail(identity);
      else setMobileNumber(identity);
      if (token) setAuthToken(token);
      setAuthenticated(true);
    },
    signOut: () => {
      setAuthenticated(false);
      setAuthToken('');
      if (!USE_MOCK_API) { setCart([]); setOrders([]); }
    },
    categories,
    products,
    coupons,
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
    removeFromCart,
    clearCart,
    applyCoupon,
    favorites,
    toggleFavorite: (productId) => setFavorites((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]),
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
    repeatOrder,
    refreshRemoteState,
  }), [
    addToCart, addresses, appliedCoupon, applyCoupon, authMethod, authToken, cart, cartCount, cartItems,
    cartSubtotal, categories, clearCart, connectionError, coupons, deliveryFee, discount, email, favorites,
    grandTotal, hydrated, isAuthenticated, mobileNumber, orders, placeOrder, products, refreshRemoteState,
    removeFromCart, repeatOrder, ruleValidation, selectedAddress, updateQuantity,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
