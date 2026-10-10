import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Alert } from '@/lib/notify';
import { useCatalog } from '@/state/CatalogContext';
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
import { useAuth } from '@/state/AuthContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export default function CityHomeScreen() {
  const { city, savedCities, toggleSavedCity } = useTravel();
  const { session } = useAuth();
  const { apps } = useCatalog();
  const saved = savedCities.includes(city.key);
  const togglePack = async () => {
    try {
      await toggleSavedCity();
    } catch {
      Alert.alert(
        'Could not sync your changes',
        'Open Saved to retry when your connection is ready.',
      );
    }
  };
  return (
    <Page>
      <View style={styles.top}>
        <Brand />
        <View style={styles.headerActions}>
          <CityPill onPress={() => router.push('/')} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Account"
            onPress={() => router.push(session ? '/(main)/profile' : '/(auth)/login')}
            style={styles.account}
          >
            <Text style={styles.accountText}>{session?.user.email?.[0]?.toUpperCase() ?? '○'}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.hero}>
        <View style={styles.heroPhoto}>
          <Image source={city.photo} style={styles.photo} contentFit="cover" transition={220} />
          <View style={styles.overlay} />
          <View style={styles.heroText}>
            <Text style={styles.localName}>{city.localName}</Text>
            <Text style={styles.tag}>{city.name.toUpperCase()} CITY PACK</Text>
          </View>
        </View>
        <Heading title={`${city.greeting}, ${city.name}`} subtitle={city.tagline} />
      </View>
      <ActionButton
        label="I just landed"
        onPress={() => router.push('/(main)/guide?section=airport')}
      />
      <View style={styles.section}>
        <SectionTitle
          trailing={
            <Text style={styles.smallLink} onPress={() => router.push('/(main)/guide')}>
              See all
            </Text>
          }
        >
          Start here
        </SectionTitle>
        <RowCard
          icon="↗"
          title="Get connected"
          detail="SIM, eSIM and visitor requirements"
          onPress={() => router.push('/(main)/apps?category=Connectivity')}
        />
        <RowCard
          icon="🚆"
          title="From the airport"
          detail="Plan your first trip into the city"
          onPress={() => router.push('/(main)/guide?section=airport')}
        />
        <RowCard
          icon="¥"
          title="Payments & tickets"
          detail="What to prepare before you go"
          onPress={() => router.push('/(main)/guide?section=payments')}
        />
        <RowCard
          icon="⌖"
          title="Transport basics"
          detail="Tickets, taxis and local etiquette"
          onPress={() => router.push('/(main)/guide?section=transport')}
        />
      </View>
      <View style={styles.section}>
        <SectionTitle>Explore your city</SectionTitle>
        <RowCard
          icon="▦"
          title="Local apps"
          detail={`${apps.filter((app) => app.city === city.key).length} useful services for ${city.name}`}
          onPress={() => router.push('/(main)/apps')}
        />
        <RowCard
          icon="⌖"
          title="City guide"
          detail="Local transport, payments and customs"
          onPress={() => router.push('/(main)/guide')}
        />
        <RowCard
          icon="♡"
          title="Save city pack"
          detail="Keep the essentials close at hand"
          onPress={() => void togglePack()}
          trailing={saved ? '✓' : '＋'}
        />
      </View>
      <View style={styles.section}>
        <SectionTitle>Quick essentials</SectionTitle>
        <RowCard
          icon="⚙"
          title="Your travel setup"
          detail="Language, phone, payments and access preferences"
          onPress={() => router.push('/(onboarding)/step-1')}
        />
        <RowCard
          icon="🏛️"
          title="About & information sources"
          detail="Check where each local tip comes from"
          onPress={() => router.push('/(main)/guide?section=sources')}
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerActions: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  account: {
    marginTop: -5,
    width: 40,
    height: 40,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMuted,
  },
  accountText: { color: colors.accent, fontFamily: fontFamily.semibold, fontSize: 14 },
  hero: { gap: 18 },
  heroPhoto: {
    height: 166,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#DFF2F3',
  },
  photo: { ...StyleSheet.absoluteFill },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.18)' },
  heroText: { position: 'absolute', left: 17, bottom: 18, gap: 6 },
  localName: {
    color: '#FFF',
    fontFamily: fontFamily.bold,
    fontSize: 24,
    textShadowColor: '#0009',
    textShadowRadius: 8,
  },
  tag: {
    color: '#FFF',
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.1,
    textShadowColor: '#0009',
    textShadowRadius: 8,
  },
  smallLink: { color: colors.accent, fontFamily: fontFamily.semibold, fontSize: 12 },
  section: { marginTop: 18 },
});
