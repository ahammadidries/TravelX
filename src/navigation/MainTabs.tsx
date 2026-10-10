import { Tabs } from 'expo-router';

export function MainTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
