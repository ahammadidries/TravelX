import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import {
  ActionButton,
  Brand,
  CityPill,
  Heading,
  Page,
  RowCard,
  SectionTitle,
} from '@/components/TravelUI';
import { useTravel } from '@/state/travelContext';

export default function CityHomeScreen() {
  const { city, saved, toggleSaved } = useTravel();
  return (
    <Page>
      <View style={styles.top}>
        <Brand />
        <CityPill onPress={() => router.push('/')} />
      </View>
      <View style={styles.hero}>
        <View style={styles.heroPhoto}>
          <View style={styles.sun} />
          <View style={styles.hill} />
          <View style={styles.hill2} />
          <View style={styles.heroText}>
            <View style={styles.tag}>
              <View style={styles.dot} /> CITY STARTER
            </View>
          </View>
        </View>
        <Heading
          title={`Welcome to ${city.name}`}
          subtitle={`${city.region}, ${city.country} · your essentials, one step at a time.`}
        />
      </View>
      <ActionButton label="I just landed" onPress={() => router.push('/(onboarding)/step-1')} />
      <View style={styles.section}>
        <SectionTitle>Explore your city</SectionTitle>
        <RowCard
          icon="▦"
          title="Local apps"
          detail="Transport, taxis, food & connectivity"
          onPress={() => router.push('/(main)/apps')}
        />
        <RowCard
          icon="⌖"
          title="City guide"
          detail="Getting around and everyday customs"
          onPress={() => router.push('/(main)/guide')}
        />
        <RowCard
          icon="♡"
          title="Save city pack"
          detail="Keep the essentials close at hand"
          onPress={toggleSaved}
          trailing={saved ? '✓' : '＋'}
        />
      </View>
      <View style={styles.section}>
        <SectionTitle>Quick essentials</SectionTitle>
        <RowCard
          icon="↗"
          title="Airport to the city"
          detail="A simple step-by-step overview"
          onPress={() => router.push('/(main)/guide')}
        />
        <RowCard
          icon="¥"
          title="Payments & tickets"
          detail="What to expect before you go"
          onPress={() => router.push('/(main)/guide')}
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hero: { gap: 18 },
  heroPhoto: {
    height: 166,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#DFF2F3',
    justifyContent: 'flex-end',
  },
  sun: {
    position: 'absolute',
    top: 25,
    right: 36,
    width: 46,
    height: 46,
    borderRadius: 30,
    backgroundColor: '#FFD99D',
  },
  hill: {
    height: 100,
    backgroundColor: '#9FD5BB',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 110,
    transform: [{ scaleX: 1.35 }],
    marginBottom: -26,
  },
  hill2: {
    position: 'absolute',
    width: 230,
    height: 80,
    right: -50,
    bottom: -27,
    borderRadius: 100,
    backgroundColor: '#7CBFA8',
  },
  heroText: { position: 'absolute', left: 16, top: 16 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFFE8',
    color: '#18262A',
    fontSize: 10,
    fontWeight: '600',
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#5B987E' },
  section: { marginTop: 18 },
});
