import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCatalog } from '@/state/CatalogContext';
import { CityPill, Heading, Note, Page, RowCard, SectionTitle } from '@/components/TravelUI';
import { checkedOn } from '@/data/cities';
import { useTravel } from '@/state/travelContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export default function GuideRoute() {
  const { city } = useTravel();
  const { section } = useLocalSearchParams<{ section?: string }>();
  return <GuideScreen key={city.key + section} section={section} />;
}
function GuideScreen({ section }: { section?: string }) {
  const { city, preferences } = useTravel();
  const { guides } = useCatalog();
  const tips = guides.filter((t) => t.city === city.key);
  const [open, setOpen] = useState<string | null>(
    tips.find((t) => t.section === section)?.id || null,
  );
  const tokyo = city.key === 'tokyo';
  return (
    <Page>
      <CityPill onPress={() => router.push('/')} />
      <Heading
        title={`A few local basics`}
        subtitle={`Small, practical things to know in ${city.name}.`}
      />
      <View style={styles.hero}>
        <Text style={styles.heroFlag}>{city.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>
            {city.name}, {city.country}
          </Text>
          <Text style={styles.heroMeta}>Curated visitor notes · Checked {checkedOn}</Text>
        </View>
      </View>
      {preferences.stepFree ? (
        <Note>Step-free preference saved. Open the access notes before planning a route.</Note>
      ) : null}
      <SectionTitle>Getting around & local life</SectionTitle>
      {tips.map((tip, i) => {
        const expanded = open === tip.id;
        return (
          <View key={tip.id} style={styles.tipWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpen(expanded ? null : tip.id)}
              style={styles.tipHead}
            >
              <View style={styles.num}>
                <Text style={styles.numText}>{String(i + 1).padStart(2, '0')}</Text>
              </View>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.chev}>{expanded ? '−' : '+'}</Text>
            </Pressable>
            {expanded ? (
              <View style={styles.tipBody}>
                <Text style={styles.tipText}>{tip.body}</Text>
                <Text style={styles.source}>
                  {tip.source} · Reviewed {tip.checked_on}
                </Text>
                <Text onPress={() => void Linking.openURL(tip.url)} style={styles.link}>
                  Open source ↗
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
      <SectionTitle>Quick essentials</SectionTitle>
      <RowCard
        icon="Aa"
        title="Phrases"
        detail={tokyo ? 'Japanese: sumimasen · arigatō' : 'Malayalam: namaskāram · nanni'}
      />
      <RowCard
        icon="⌖"
        title="Toilets & luggage"
        detail="Start with major stations and official visitor facilities."
      />
      <RowCard
        icon="ϟ"
        title="Charging & plugs"
        detail={
          tokyo
            ? 'Check plug shape and device voltage before packing.'
            : 'India commonly uses Type C/D plugs; check voltage on your charger.'
        }
      />
      <Text style={styles.credit}>City photo: {city.photoCredit}</Text>
      <Text onPress={() => void Linking.openURL(city.photoSource)} style={styles.link}>
        Open photo source ↗
      </Text>
      <Text onPress={() => void Linking.openURL(city.photoLicense)} style={styles.link}>
        Photo license ↗
      </Text>
      <Note>
        Details can change. Follow current signs and operator instructions; fares and schedules are
        not shown here.
      </Note>
    </Page>
  );
}
const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 8,
  },
  heroFlag: { fontSize: 30 },
  heroTitle: { fontFamily: fontFamily.semibold, fontSize: 16, color: colors.textPrimary },
  heroMeta: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tipWrap: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  tipHead: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12 },
  num: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { color: colors.accent, fontFamily: fontFamily.semibold, fontSize: 11 },
  tipTitle: { flex: 1, color: colors.textPrimary, fontFamily: fontFamily.medium, fontSize: 15 },
  chev: { fontSize: 22, color: colors.textSecondary, paddingHorizontal: 6 },
  tipBody: { paddingLeft: 42, paddingBottom: 16 },
  tipText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  source: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    marginTop: 10,
  },
  link: { color: colors.accent, fontFamily: fontFamily.semibold, fontSize: 12, marginTop: 8 },
  credit: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
    marginTop: 16,
  },
});
