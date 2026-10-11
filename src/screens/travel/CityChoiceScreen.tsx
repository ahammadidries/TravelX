import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Brand, Heading, Page, ProfileBadge } from '@/components/TravelUI';
import { cities, type CityKey } from '@/data/cities';
import { useTravel } from '@/state/travelContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export default function CityChoiceScreen() {
  const { cityKey, setCity } = useTravel();
  const [selected, setSelected] = useState<CityKey>(cityKey);
  return (
    <Page>
      <View style={styles.top}>
        <Brand />
        <ProfileBadge />
      </View>
      <Heading title="where are you going?" subtitle="Your city essentials, one step at a time." />
      <View style={styles.cards}>
        {Object.values(cities).map((place) => (
          <Pressable
            key={place.key}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === place.key }}
            onPress={() => setSelected(place.key)}
            style={[styles.card, selected === place.key && styles.cardSelected]}
          >
            <Image source={place.photo} style={styles.photo} contentFit="cover" transition={180} />
            <View style={styles.scrim} />
            <View style={styles.copy}>
              <Text style={styles.name}>
                {place.name}, {place.country}
              </Text>
              <Text style={styles.location}>{place.tagline}</Text>
            </View>
            {selected === place.key ? (
              <View style={styles.tick}>
                <Text style={styles.tickText}>✓</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>
      <View style={styles.bottom}>
        <ActionButton
          label={`Explore ${cities[selected].name}  →`}
          onPress={() => {
            setCity(selected);
            router.replace('/(main)/city');
          }}
        />
        <Pressable onPress={() => router.push('/(onboarding)/step-1')} style={styles.setup}>
          <Text style={styles.setupText}>⚙ Set travel preferences</Text>
          <Text style={styles.setupArrow}>›</Text>
        </Pressable>
        <Text style={styles.privacy}>Two cities. One easy start.</Text>
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cards: { gap: 14, marginTop: 4 },
  card: {
    height: 166,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
  },
  cardSelected: { borderColor: colors.accent },
  photo: { ...StyleSheet.absoluteFill },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(14,12,36,0.19)' },
  copy: { position: 'absolute', top: 19, left: 20, right: 62 },
  name: {
    color: '#101012',
    fontFamily: fontFamily.bold,
    fontSize: 21,
    lineHeight: 26,
  },
  location: {
    color: '#383848',
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  tick: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickText: { color: '#FFF', fontFamily: fontFamily.bold },
  bottom: { marginTop: 'auto', paddingTop: 28 },
  setup: {
    marginTop: 15,
    height: 51,
    borderRadius: 24,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#DED9FF',
    backgroundColor: '#F7F5FF',
    alignItems: 'center',
    flexDirection: 'row',
  },
  setupText: { flex: 1, color: '#4F3EE8', fontFamily: fontFamily.semibold, fontSize: 14 },
  setupArrow: { color: '#4F3EE8', fontSize: 26 },
  privacy: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: fontFamily.regular,
  },
});
