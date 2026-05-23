import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/store';

export default function TabsLayout() {
  const { newMatchCount } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0a0a0a', borderTopColor: '#1a1a1a' },
        tabBarActiveTintColor: '#E91E8C',
        tabBarInactiveTintColor: '#555',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Eşleşmeler',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
          tabBarBadge: newMatchCount > 0 ? newMatchCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
