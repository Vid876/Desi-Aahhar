import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useApp } from '@/context/AppContext';
import { colors } from '@/theme';

const icons: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  home: ['home-outline', 'home'], categories: ['grid-outline', 'grid'], cart: ['basket-outline', 'basket'],
  orders: ['receipt-outline', 'receipt'], profile: ['person-outline', 'person'],
};

export default function TabLayout() {
  const { cartCount } = useApp();
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false, tabBarActiveTintColor: colors.forest, tabBarInactiveTintColor: '#879088',
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', paddingBottom: 3 },
      tabBarStyle: { height: 69, paddingTop: 7, backgroundColor: colors.white, borderTopColor: colors.line },
      tabBarIcon: ({ focused, color, size }) => {
        const pair = icons[route.name] ?? icons.home;
        return <Ionicons name={focused ? pair[1] : pair[0]} color={color} size={size} />;
      },
    })}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="categories" options={{ title: 'Categories' }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarBadge: cartCount || undefined, tabBarBadgeStyle: { backgroundColor: colors.saffron, color: colors.ink } }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
