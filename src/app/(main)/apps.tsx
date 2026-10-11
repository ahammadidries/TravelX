import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Alert } from '@/lib/notify';
import { Brand, CityPill, Heading, Note, Page, ProfileBadge } from '@/components/TravelUI';
import { categories, type AppCategory, type LocalApp } from '@/data/apps';
import { appRankings } from '@/data/appRankings';
import { appLogos } from '@/data/appLogos';
import { useCatalog } from '@/state/CatalogContext';
import { checkedOn } from '@/data/cities';
import { openLink } from '@/lib/links';
import { useTravel } from '@/state/travelContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export default function AppsRoute() {
  const { cityKey } = useTravel();
  const { category, app } = useLocalSearchParams<{ category?: string; app?: string }>();
  return (
    <AppsScreen key={`${cityKey}:${category}:${app}`} initialCategory={category} initialApp={app} />
  );
}
function AppsScreen({
  initialCategory,
  initialApp,
}: {
  initialCategory?: string;
  initialApp?: string;
}) {
  const { apps: localApps, source } = useCatalog();
  const { city, cityKey, savedAppIds, toggleSavedApp } = useTravel();
  const [manualCategory, setManualCategory] = useState<AppCategory | null>(null);
  const category =
    manualCategory ||
    (categories.includes(initialCategory as AppCategory)
      ? (initialCategory as AppCategory)
      : 'Transport');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<LocalApp | null>(
    () => localApps.find((x) => x.id === initialApp && x.city === cityKey) || null,
  );
  const data = useMemo(
    () =>
      localApps
        .filter(
          (x) =>
            x.city === cityKey &&
            x.category === category &&
            (!query.trim() ||
              `${x.name} ${x.purpose} ${x.tip}`.toLowerCase().includes(query.toLowerCase())),
        )
        .sort(
          (first, second) =>
            (appRankings[first.id]?.order ?? 999) - (appRankings[second.id]?.order ?? 999),
        ),
    [cityKey, category, query, localApps],
  );
  const save = async (app: LocalApp) => {
    try {
      await toggleSavedApp(app.id);
    } catch {
      Alert.alert('Could not save your changes', 'Open Saved to retry saving on this device.');
    }
  };
  return (
    <Page>
      <View style={styles.top}>
        <Brand />
        <ProfileBadge />
      </View>
      <CityPill onPress={() => router.push('/')} />
      <Heading title="local apps" subtitle={`${city.name}, ${city.country}`} />
      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search local apps"
          placeholderTextColor="#888895"
          style={styles.searchInput}
        />
        {query ? (
          <Text onPress={() => setQuery('')} style={styles.clear}>
            ×
          </Text>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        accessibilityRole="tablist"
      >
        {categories.map((item) => (
          <Pressable
            key={item}
            onPress={() => setManualCategory(item)}
            accessibilityRole="tab"
            accessibilityState={{ selected: category === item }}
            style={styles.tab}
          >
            <Text style={[styles.tabIcon, category === item && styles.tabActive]}>
              {item === 'Transport'
                ? '▦'
                : item === 'Taxi'
                  ? '▱'
                  : item === 'Food'
                    ? '♨'
                    : item === 'Connectivity'
                      ? '⌁'
                      : item === 'Hotels'
                        ? '⌂'
                        : '•'}
            </Text>
            <Text style={[styles.tabText, category === item && styles.tabActive]}>
              {item === 'Connectivity' ? 'SIM & data' : item}
            </Text>
            {category === item ? <View style={styles.underline} /> : null}
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.resultCount}>
        {data.length} {data.length === 1 ? 'option' : 'options'} ·{' '}
        {source === 'supabase' ? 'Updated city catalog' : 'Offline city catalog'}
      </Text>
      <Text style={styles.rankingNote}>
        Picks use city availability, visitor fit and service features—not live speed scores or app
        ratings.
      </Text>
      {data.map((app) => (
        <View key={app.id} style={styles.card}>
          <View style={styles.cardTop}>
            {appLogos[app.id] ? (
              <View style={styles.logoCanvas}>
                <View style={[styles.logoFallback, { backgroundColor: app.color }]}>
                  <Text style={styles.initials}>{app.initials}</Text>
                </View>
                <Image
                  source={appLogos[app.id]}
                  style={styles.appLogo}
                  contentFit="contain"
                  cachePolicy="disk"
                  accessibilityLabel={`${app.name} app logo`}
                />
              </View>
            ) : (
              <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                <Text style={styles.initials}>{app.initials}</Text>
              </View>
            )}
            <View style={styles.appText}>
              <Text style={styles.appName}>{app.name}</Text>
              <Text style={styles.description}>{app.purpose}</Text>
              {appRankings[app.id] ? (
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>
                    #{appRankings[app.id]?.rank} · {appRankings[app.id]?.group}
                  </Text>
                </View>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={savedAppIds.includes(app.id) ? 'Remove saved app' : 'Save app'}
              onPress={() => void save(app)}
              style={styles.bookmark}
            >
              <Text
                style={[styles.bookmarkText, savedAppIds.includes(app.id) && styles.bookmarkActive]}
              >
                {savedAppIds.includes(app.id) ? '♥' : '♡'}
              </Text>
            </Pressable>
          </View>
          <View style={styles.meta}>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{app.language}</Text>
          </View>
          <View style={styles.buttonRow}>
            <Pressable onPress={() => setSelected(app)} style={styles.noteButton}>
              <Text style={styles.noteButtonText}>Visitor notes</Text>
            </Pressable>
            <Pressable onPress={() => void openLink(app.url)} style={styles.openButton}>
              <Text style={styles.openButtonText}>Open official site ↗</Text>
            </Pressable>
          </View>
        </View>
      ))}
      {!data.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No services match that search. Try another word.</Text>
        </View>
      ) : null}
      <Note>
        Requirements and availability can vary by provider and visitor status. Last checked{' '}
        {checkedOn}; confirm with the official provider.
      </Note>
      <Modal
        transparent
        animationType="slide"
        visible={selected !== null}
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalShade}>
          <Pressable style={styles.dismiss} onPress={() => setSelected(null)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Visitor notes</Text>
              <Pressable onPress={() => setSelected(null)}>
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>
            {selected ? (
              <ScrollView>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <Text style={styles.selectedDescription}>{selected.purpose}</Text>
                <InfoLine label="Language" value={selected.language} />
                <InfoLine label="Phone" value={selected.phone} />
                <InfoLine label="Payment" value={selected.payment} />
                {appRankings[selected.id] ? (
                  <InfoLine
                    label={`TravelX pick #${appRankings[selected.id]?.rank} · ${appRankings[selected.id]?.group}`}
                    value={appRankings[selected.id]?.reason ?? ''}
                  />
                ) : null}
                <View style={styles.tip}>
                  <Text style={styles.tipLabel}>A small local tip</Text>
                  <Text style={styles.tipText}>{selected.tip}</Text>
                </View>
                <Text style={styles.source}>
                  Provider information · Reviewed {selected.checked_on || checkedOn}
                </Text>
                <Pressable onPress={() => void openLink(selected.url)} style={styles.openButton}>
                  <Text style={styles.openButtonText}>Open provider site ↗</Text>
                </Pressable>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </Page>
  );
}
function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  search: {
    height: 52,
    backgroundColor: colors.surface,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchIcon: { fontSize: 25, color: colors.textSecondary },
  searchInput: { flex: 1, color: colors.textPrimary, fontFamily: fontFamily.regular, fontSize: 14 },
  clear: { fontSize: 22, color: colors.textSecondary },
  tabs: { flexDirection: 'row', gap: 8, marginTop: 14, paddingBottom: 2 },
  tab: {
    minWidth: 88,
    paddingHorizontal: 10,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E6EF',
    borderRadius: 16,
  },
  tabText: { color: colors.textSecondary, fontFamily: fontFamily.medium, fontSize: 11 },
  tabIcon: { color: colors.textSecondary, fontSize: 16 },
  tabActive: { color: colors.accent },
  underline: {
    display: 'none',
  },
  resultCount: {
    marginVertical: 12,
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: fontFamily.medium,
  },
  rankingNote: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCanvas: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appLogo: { width: 42, height: 42 },
  initials: { color: '#FFF', fontFamily: fontFamily.bold, fontSize: 15 },
  appText: { flex: 1, gap: 4 },
  appName: { fontSize: 15, color: colors.textPrimary, fontFamily: fontFamily.semibold },
  description: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
  },
  rankBadge: {
    alignSelf: 'flex-start',
    marginTop: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: colors.accentMuted,
  },
  rankText: { color: colors.accent, fontFamily: fontFamily.semibold, fontSize: 9 },
  bookmark: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  bookmarkText: { fontSize: 21, color: colors.textSecondary },
  bookmarkActive: { color: colors.accent },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 11, marginLeft: 56 },
  metaDot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#5A9D7E' },
  metaText: { color: colors.textSecondary, fontSize: 10, fontFamily: fontFamily.regular },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 56,
    marginTop: 11,
  },
  noteButton: {
    paddingVertical: 8,
    paddingHorizontal: 11,
    backgroundColor: colors.surface,
    borderRadius: 15,
  },
  noteButtonText: { color: colors.textSecondary, fontFamily: fontFamily.medium, fontSize: 11 },
  openButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.accentMuted,
    borderRadius: 16,
  },
  openButtonText: { color: colors.accent, fontFamily: fontFamily.semibold, fontSize: 11 },
  empty: { padding: 28, backgroundColor: colors.surface, borderRadius: 18 },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  modalShade: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0005' },
  dismiss: { flex: 1 },
  sheet: {
    maxHeight: '90%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 23,
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#D0D0D5',
    alignSelf: 'center',
    marginBottom: 15,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { fontFamily: fontFamily.semibold, color: colors.textPrimary, fontSize: 17 },
  close: { fontSize: 27, color: colors.textSecondary },
  selectedName: {
    fontFamily: fontFamily.bold,
    fontSize: 21,
    color: colors.textPrimary,
    marginTop: 10,
  },
  selectedDescription: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginTop: 5,
    marginBottom: 14,
  },
  infoLine: { paddingVertical: 11, borderBottomColor: colors.divider, borderBottomWidth: 1 },
  infoLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textPrimary,
    marginTop: 4,
  },
  tip: { backgroundColor: colors.accentMuted, borderRadius: 14, padding: 13, marginTop: 14 },
  tipLabel: { color: colors.accent, fontFamily: fontFamily.semibold, fontSize: 11 },
  tipText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  source: { fontSize: 10, color: colors.textSecondary, marginVertical: 13 },
});
