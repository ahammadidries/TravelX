import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ActionButton,
  Brand,
  Heading,
  Note,
  Page,
  ProfileBadge,
  RowCard,
} from '@/components/TravelUI';
import { cities, type CityKey } from '@/data/cities';
import { appLogos } from '@/data/appLogos';
import { useTravel } from '@/state/travelContext';
import { useCatalog } from '@/state/CatalogContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export default function SavedScreen() {
  const {
    city,
    setCity,
    savedCities,
    toggleSavedCity,
    savedAppIds,
    toggleSavedApp,
    storageError,
    retrySave,
  } = useTravel();
  const { apps } = useCatalog();
  const [tab, setTab] = useState<'packs' | 'apps' | 'guides'>('packs');
  const savedApps = apps.filter((app) => savedAppIds.includes(app.id));
  const saveCity = (key: CityKey) => void toggleSavedCity(key).catch(() => {});
  const openCity = (key: CityKey) => {
    setCity(key);
    router.push('/(main)/city');
  };
  return (
    <Page>
      <View style={styles.top}>
        <Brand />
        <ProfileBadge />
      </View>
      <Heading title="saved for your trip" subtitle="Your offline packs, apps and guides." />
      <View style={styles.tabs}>
        {(['packs', 'apps', 'guides'] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setTab(item)}
            style={[styles.tab, tab === item && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
      {tab === 'packs' && (
        <Packs
          savedCities={savedCities}
          cityKey={city.key}
          openCity={openCity}
          saveCity={saveCity}
        />
      )}
      {tab === 'apps' && (
        <SavedApps apps={savedApps} onRemove={(id) => void toggleSavedApp(id).catch(() => {})} />
      )}
      {tab === 'guides' && <Guides />}
      <View style={styles.sync}>
        <Ionicons name="phone-portrait-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.syncText}>
          {storageError ||
            'Saved on this device. City guides remain available when you are offline.'}
        </Text>
      </View>
      {storageError ? (
        <ActionButton
          secondary
          label="Retry save"
          onPress={() => void retrySave().catch(() => {})}
        />
      ) : null}
    </Page>
  );
}

function Packs({
  savedCities,
  cityKey,
  openCity,
  saveCity,
}: {
  savedCities: CityKey[];
  cityKey: CityKey;
  openCity: (key: CityKey) => void;
  saveCity: (key: CityKey) => void;
}) {
  return (
    <View>
      {savedCities.map((key) => (
        <View key={key} style={styles.pack}>
          <Pressable onPress={() => openCity(key)} style={styles.packOpen}>
            <Image source={cities[key].photo} style={styles.photo} contentFit="cover" />
            <View style={styles.copy}>
              <Text style={styles.title}>
                {cities[key].name}, {cities[key].country}
              </Text>
              <Text style={styles.detail}>Available offline</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => saveCity(key)} style={styles.more}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      ))}
      {!savedCities.length ? (
        <Note>Save a city pack to keep its guide and essentials together.</Note>
      ) : null}
      {!savedCities.includes(cityKey) ? (
        <ActionButton
          label={`Save ${cities[cityKey].name} city pack`}
          onPress={() => saveCity(cityKey)}
        />
      ) : null}
    </View>
  );
}

function SavedApps({
  apps,
  onRemove,
}: {
  apps: ReturnType<typeof useCatalog>['apps'];
  onRemove: (id: string) => void;
}) {
  if (!apps.length)
    return (
      <RowCard
        icon="＋"
        title="Find your everyday essentials"
        detail="Browse local apps and save the ones you need."
        onPress={() => router.push('/(main)/apps')}
      />
    );
  return (
    <View>
      {apps.map((app) => (
        <View key={app.id} style={styles.pack}>
          <Pressable onPress={() => router.push('/(main)/apps')} style={styles.packOpen}>
            <View style={[styles.logo, { backgroundColor: app.color }]}>
              {appLogos[app.id] ? (
                <Image source={appLogos[app.id]} style={styles.appLogo} contentFit="contain" />
              ) : (
                <Text style={styles.initial}>{app.initials}</Text>
              )}
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{app.name}</Text>
              <Text style={styles.detail}>{app.category}</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => onRemove(app.id)} style={styles.more}>
            <Ionicons name="bookmark" size={19} color={colors.accent} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function Guides() {
  return (
    <View>
      <RowCard
        icon="▤"
        title="Arrival guide"
        detail="Getting around and key info."
        onPress={() => router.push('/arrival')}
      />
      <RowCard
        icon="⌖"
        title="Local basics"
        detail="Payments, etiquette and more."
        onPress={() => router.push('/(main)/guide?section=payments')}
      />
      <RowCard
        icon="◌"
        title="Useful phrases"
        detail="Everyday words and sentences."
        onPress={() => router.push('/(main)/guide?section=essentials')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tabs: {
    flexDirection: 'row',
    height: 51,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E5E5ED',
    overflow: 'hidden',
    marginBottom: 14,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: '#EAE7FF', borderRadius: 15 },
  tabText: { color: colors.textSecondary, fontFamily: fontFamily.medium, fontSize: 14 },
  tabTextActive: { color: '#4735E8', fontFamily: fontFamily.semibold },
  pack: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E5EC',
    borderRadius: 18,
    paddingHorizontal: 12,
    marginBottom: 13,
  },
  packOpen: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 12 },
  photo: { width: 64, height: 64, borderRadius: 15 },
  copy: { flex: 1, gap: 4 },
  title: { fontFamily: fontFamily.semibold, color: colors.textPrimary, fontSize: 14 },
  detail: { fontFamily: fontFamily.regular, color: colors.textSecondary, fontSize: 12 },
  more: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFC',
  },
  logo: {
    height: 51,
    width: 51,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  appLogo: { width: 51, height: 51 },
  initial: { color: '#FFF', fontFamily: fontFamily.bold, fontSize: 16 },
  sync: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  syncText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
  },
});
