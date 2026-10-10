import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActionButton, Heading, Note, Page, RowCard, SectionTitle } from '@/components/TravelUI';
import { cities, type CityKey } from '@/data/cities';
import { useTravel } from '@/state/travelContext';
import { useAuth } from '@/state/AuthContext';
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
    syncError,
    retrySync,
  } = useTravel();
  const { session } = useAuth();
  const { apps } = useCatalog();
  const savedApps = apps.filter((app) => savedAppIds.includes(app.id));
  const openCity = (key: CityKey) => {
    setCity(key);
    router.push('/(main)/city');
  };
  // Changes remain visible locally; failed account sync has a persistent retry below.
  const saveCity = (key: CityKey) => {
    void toggleSavedCity(key).catch(() => {});
  };
  return (
    <Page>
      <Heading
        title="Your little travel kit"
        subtitle="The places and useful apps you want to keep close."
      />
      <SectionTitle>City packs</SectionTitle>
      {savedCities.map((key) => (
        <View key={key} style={styles.row}>
          <Pressable accessibilityRole="button" style={styles.open} onPress={() => openCity(key)}>
            <Image source={cities[key].photo} style={styles.photo} contentFit="cover" />
            <View style={styles.copy}>
              <Text style={styles.title}>{cities[key].name}</Text>
              <Text style={styles.detail}>
                {cities[key].region}, {cities[key].country}
              </Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${cities[key].name} city pack`}
            style={styles.remove}
            onPress={() => saveCity(key)}
          >
            <Ionicons name="bookmark" size={21} color={colors.accent} />
          </Pressable>
        </View>
      ))}
      {!savedCities.length && (
        <Note>Save a city pack to keep its guide and essentials together.</Note>
      )}
      {!savedCities.includes(city.key) && (
        <ActionButton
          secondary
          label={`Save ${city.name} city pack`}
          onPress={() => saveCity(city.key)}
        />
      )}
      <SectionTitle>Saved apps</SectionTitle>
      {savedApps.length ? (
        savedApps.map((app) => (
          <View key={app.id} style={styles.row}>
            <Pressable
              accessibilityRole="button"
              style={styles.open}
              onPress={() => {
                setCity(app.city);
                router.push({
                  pathname: '/(main)/apps',
                  params: { category: app.category, app: app.id },
                });
              }}
            >
              <View style={[styles.icon, { backgroundColor: app.color }]}>
                <Text style={styles.initials}>{app.initials}</Text>
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{app.name}</Text>
                <Text style={styles.detail}>
                  {cities[app.city].name} · {app.category}
                </Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${app.name}`}
              style={styles.remove}
              onPress={() => {
                void toggleSavedApp(app.id).catch(() => {});
              }}
            >
              <Ionicons name="bookmark" size={21} color={colors.accent} />
            </Pressable>
          </View>
        ))
      ) : (
        <RowCard
          icon="＋"
          title="Find your everyday essentials"
          detail="Browse local apps and save the ones you need."
          onPress={() => router.push('/(main)/apps')}
        />
      )}
      <View style={styles.sync}>
        <Ionicons
          name={
            syncError
              ? 'cloud-offline-outline'
              : session
                ? 'cloud-outline'
                : 'phone-portrait-outline'
          }
          size={20}
          color={colors.textSecondary}
        />
        <Text style={styles.syncText}>
          {syncError
            ? 'Your latest changes could not be synced. Keep this device online and try again.'
            : session
              ? 'Saved items sync to your account. City guides are also bundled for offline reading.'
              : 'Saved on this device. Sign in to sync future changes to your account.'}
        </Text>
      </View>
      {syncError ? (
        <ActionButton
          secondary
          label="Retry sync"
          onPress={() => {
            void retrySync().catch(() => {});
          }}
        />
      ) : !session ? (
        <ActionButton
          secondary
          label="Sign in to sync"
          onPress={() => router.push('/(auth)/login')}
        />
      ) : null}
    </Page>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    minHeight: 90,
  },
  open: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  photo: { width: 60, height: 60, borderRadius: 16 },
  copy: { flex: 1, gap: 5 },
  title: { fontFamily: fontFamily.semibold, fontSize: 15, color: colors.textPrimary },
  detail: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  remove: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontFamily: fontFamily.bold, fontSize: 16 },
  sync: {
    marginTop: 32,
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
