import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export function MainTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: 10, marginBottom: 5 },
        tabBarStyle: {
          height: 64,
          paddingTop: 8,
          borderTopColor: colors.divider,
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="city"
        options={{
          title: 'City',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>◫</Text>,
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: 'Apps',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>▦</Text>,
        }}
      />
      <Tabs.Screen
        name="together"
        options={{
          title: 'Together',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>♧</Text>,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>♡</Text>,
        }}
      />
      <Tabs.Screen name="guide" options={{ href: null }} />
      <Tabs.Screen name="map" options={{ href: null }} />
      <Tabs.Screen name="trips" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
