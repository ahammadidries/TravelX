import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Brand, Heading, Page } from '@/components/TravelUI';
import { cities, type CityKey } from '@/data/cities';
import { useTravel } from '@/state/travelContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export default function CityChoiceScreen() {
  const { cityKey, setCity } = useTravel();
  const [selected, setSelected] = useState<CityKey>(cityKey);
  return (
    <Page>
      <Brand />
      <Heading
        title="Where are you going?"
        subtitle="A little local knowledge makes a new city feel familiar."
      />
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
            <Text style={styles.flag}>{place.flag}</Text>
            <View style={styles.copy}>
              <Text style={styles.name}>{place.name}</Text>
              <Text style={styles.location}>
                {place.region}, {place.country}
              </Text>
            </View>
            {selected === place.key ? (
              <View style={styles.tick}>
                <Text style={styles.tickText}>✓</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>
      <Text style={styles.tagline}>{cities[selected].tagline}</Text>
      <View style={styles.bottom}>
        <ActionButton
          label="Explore this city"
          onPress={() => {
            setCity(selected);
            router.replace('/(main)/city');
          }}
        />
        <Text style={styles.privacy}>You can change cities at any time.</Text>
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  cards: { gap: 14, marginTop: 4 },
  card: {
    height: 190,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
  },
  cardSelected: { borderColor: colors.accent },
  photo: { ...StyleSheet.absoluteFill },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.13)' },
  flag: {
    position: 'absolute',
    top: 14,
    left: 14,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#FFFFFFE8',
    paddingHorizontal: 11,
    paddingVertical: 7,
    fontSize: 17,
  },
  copy: { position: 'absolute', bottom: 17, left: 18 },
  name: {
    color: '#FFF',
    fontFamily: fontFamily.bold,
    fontSize: 23,
    textShadowColor: '#0008',
    textShadowRadius: 6,
  },
  location: { color: '#FFFFFFE8', fontFamily: fontFamily.medium, fontSize: 13, marginTop: 3 },
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
  tagline: {
    marginTop: 17,
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
  },
  bottom: { marginTop: 'auto', paddingTop: 28 },
  privacy: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: fontFamily.regular,
  },
});
