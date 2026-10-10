import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CityPill, Heading, Note, Page, RowCard, SectionTitle } from '@/components/TravelUI';
import { checkedOn } from '@/data/cities';
import { useTravel } from '@/state/travelContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

type Tip = { title: string; text: string; source: string; url: string };
export default function GuideScreen() {
  const { city } = useTravel();
  const [open, setOpen] = useState<string | null>(null);
  const tokyo = city.key === 'tokyo';
  const tips: Tip[] = tokyo
    ? [
        {
          title: 'Tickets & trains',
          text: 'Check routes, station exits, service notices and the last train before setting out. Follow the fare and ticket instructions at the station; ticket products and accepted passes differ by operator.',
          source: 'Tokyo Metro · Visitor information',
          url: 'https://www.tokyometro.jp/en/tips/',
        },
        {
          title: 'Taking a taxi',
          text: 'Use a taxi stand or a taxi app, then confirm the pickup point and destination. Taxi doors are usually operated by the driver. Fare and payment options depend on the vehicle and app.',
          source: 'GO · Official service information',
          url: 'https://go.goinc.jp/en/',
        },
        {
          title: 'Paying day to day',
          text: 'Carry a small amount of yen for places that do not take cards. Contactless and IC-card acceptance varies by shop and service. Tipping is not customary; a polite thank-you is enough.',
          source: 'Japan National Tourism Organization',
          url: 'https://www.japan.travel/en/plan/',
        },
        {
          title: 'Local etiquette',
          text: 'Keep phone calls quiet on trains, queue where marked, and take rubbish with you when bins are not available.',
          source: 'Tokyo Metro · Consideration on the subway',
          url: 'https://www.tokyometro.jp/en/tips/considerations/index.html',
        },
        {
          title: 'Useful essentials',
          text: 'Useful phrases: sumimasen (excuse me), arigatō (thank you). Look for public toilets at stations and larger public facilities. Check your charger label and plug needs before travel.',
          source: 'JNTO · Travel planning',
          url: 'https://www.japan.travel/en/plan/',
        },
      ]
    : [
        {
          title: 'Trains & buses',
          text: 'Kozhikode is served by rail and road. Confirm your station or bus boarding point with the operator; local city buses and reserved intercity services use different systems.',
          source: 'Kozhikode District · How to reach',
          url: 'https://kozhikode.nic.in/en/tourism/how-to-reach/',
        },
        {
          title: 'Taking a taxi or auto',
          text: 'Compare an app ride with an official stand or a locally recommended operator. Confirm the destination and fare basis before setting off; availability and payment choices can vary by area.',
          source: 'Kerala Savaari · Official service',
          url: 'https://www.keralasavaari.kerala.gov.in/',
        },
        {
          title: 'Paying day to day',
          text: 'Keep some Indian rupees available. Card and digital payment acceptance varies by shop and neighborhood, so check before ordering or riding.',
          source: 'Kerala Tourism · Travel tips',
          url: 'https://www.keralatourism.org/travel-tips/',
        },
        {
          title: 'Local etiquette',
          text: 'Dress respectfully at religious sites, ask before photographing people, and follow local guidance around places of worship and public spaces.',
          source: 'Kerala Tourism · Guidelines',
          url: 'https://www.keralatourism.org/guidelines/',
        },
        {
          title: 'Useful essentials',
          text: 'Useful phrases: namaskāram (hello), nanni (thank you). Public toilets and luggage facilities are easiest to find at major stations and visitor sites. India commonly uses Type C/D plugs; confirm your device voltage.',
          source: 'Bureau of Indian Standards · Plugs and sockets',
          url: 'https://www.bis.gov.in/wp-content/uploads/2023/08/Plugs-and-Sockets-20.pdf',
        },
      ];
  const sections = [
    'Tickets & trains',
    'Taking a taxi',
    'Paying day to day',
    'Local etiquette',
    'Useful essentials',
  ];
  const detailFor = (title: string) => tips.find((t) => t.title === title)!;
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
      <SectionTitle>Getting around & local life</SectionTitle>
      {sections.map((title, i) => {
        const tip = detailFor(title);
        const expanded = open === title;
        return (
          <View key={title} style={styles.tipWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpen(expanded ? null : title)}
              style={styles.tipHead}
            >
              <View style={styles.num}>
                <Text style={styles.numText}>{String(i + 1).padStart(2, '0')}</Text>
              </View>
              <Text style={styles.tipTitle}>{title}</Text>
              <Text style={styles.chev}>{expanded ? '−' : '+'}</Text>
            </Pressable>
            {expanded ? (
              <View style={styles.tipBody}>
                <Text style={styles.tipText}>{tip.text}</Text>
                <Text style={styles.source}>Source: {tip.source}</Text>
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
