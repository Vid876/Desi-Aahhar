import * as Notifications from 'expo-notifications';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { DeliveryProvider } from '@/context/DeliveryContext';
import { colors } from '@/theme';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }) });

function Navigator() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const orderId = response.notification.request.content.data?.orderId;
    if (typeof orderId === 'string') router.push({ pathname: '/order/[id]', params: { id: orderId } });
    });
    return () => subscription.remove();
  }, []);
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}><Stack.Screen name="index"/><Stack.Screen name="login"/><Stack.Screen name="(tabs)"/><Stack.Screen name="order/[id]" options={{ animation:'slide_from_right' }}/></Stack>;
}
export default function RootLayout() { return <DeliveryProvider><Navigator/></DeliveryProvider>; }
