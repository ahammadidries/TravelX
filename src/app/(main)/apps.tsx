import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, CityPill, Heading, Page, RowCard } from '@/components/TravelUI';
import { useTravel } from '@/state/travelContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { router } from 'expo-router';

const categories = ['Transport', 'Taxi', 'Food', 'SIM'] as const;
type Category = (typeof categories)[number];
type AppInfo = { icon: string; title: string; description: string };
const appInfo: Record<string, AppInfo[][]> = {
  Tokyo: [
    [
      { icon: '🚆', title: 'Transit guide', description: 'Explore rail and metro options' },
      { icon: '🗺️', title: 'Route planner', description: 'Plan a route across the city' },
    ],
    [{ icon: '🚕', title: 'Taxi guide', description: 'Local taxi booking options' }],
    [{ icon: '🍱', title: 'Food delivery', description: 'Browse local delivery services' }],
    [{ icon: '📶', title: 'Connectivity', description: 'Compare SIM and eSIM options' }],
  ],
  Kozhikode: [
    [
      { icon: '🚌', title: 'Transit guide', description: 'Local bus and rail information' },
      { icon: '🚆', title: 'Rail guide', description: 'Find local rail resources' },
    ],
    [{ icon: '🛺', title: 'Taxi guide', description: 'Taxi and auto options' }],
    [{ icon: '🍛', title: 'Food delivery', description: 'Browse local delivery services' }],
    [{ icon: '📶', title: 'Connectivity', description: 'Compare SIM and eSIM options' }],
  ],
};

export default function AppsScreen() {
  const { city } = useTravel();
  const [category, setCategory] = useState<Category>('Transport');
  const data = useMemo(
    () => appInfo[city.name]?.[categories.indexOf(category)] ?? [],
    [category, city.name],
  );
  return (
    <Page>
      <CityPill onPress={() => router.push('/')} />
      <Heading title="Local apps" subtitle={`${city.name}, ${city.country}`} />
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <Text style={styles.searchText}>Find an app or service</Text>
      </View>
      <View style={styles.tabs}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={styles.tab}>
            <Text style={[styles.tabText, category === item && styles.tabActive]}>{item}</Text>
            {category === item && <View style={styles.underline} />}
          </Pressable>
        ))}
      </View>
      {data.map((item) => (
        <View key={item.title} style={styles.app}>
          <RowCard icon={item.icon} title={item.title} detail={item.description} trailing="↗" />
          <Text style={styles.requirements}>Illustrative listing · Provider requirements vary</Text>
          <Pressable style={styles.link}>
            <Text style={styles.linkText}>Provider link coming soon</Text>
          </Pressable>
        </View>
      ))}
      <ActionButton
        label="Getting around basics"
        secondary
        onPress={() => router.push('/(main)/guide')}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 52,
    backgroundColor: colors.surface,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 10,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 24, color: colors.textSecondary },
  searchText: { color: colors.textSecondary, fontFamily: fontFamily.regular, fontSize: 14 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.divider,
    marginBottom: 10,
  },
  tab: { flex: 1, minHeight: 46, justifyContent: 'center', alignItems: 'center' },
  tabText: { color: colors.textSecondary, fontFamily: fontFamily.medium, fontSize: 12 },
  tabActive: { color: colors.accent },
  underline: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '74%',
    backgroundColor: colors.accent,
  },
  app: { marginBottom: 12 },
  requirements: {
    marginTop: 8,
    marginLeft: 2,
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: fontFamily.regular,
  },
  link: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.accentMuted,
    borderRadius: 16,
  },
  linkText: { color: colors.accent, fontFamily: fontFamily.semibold, fontSize: 12 },
});
