import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Alert } from '@/lib/notify';
import { ActionButton, Brand, CityPill, Page, ProfileBadge, RowCard } from '@/components/TravelUI';
import { useTravel } from '@/state/travelContext';
import { fontFamily } from '@/theme/typography';

export default function CityHomeScreen() {
  const { city, savedCities, toggleSavedCity } = useTravel();
  const saved = savedCities.includes(city.key);
  const togglePack = async () => {
    try {
      await toggleSavedCity();
    } catch {
      Alert.alert('Could not save your changes', 'Open Saved to retry saving on this device.');
    }
  };

  return (
    <Page>
      <View style={styles.top}>
        <Brand compact />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit your travel setup"
          onPress={() => router.push('/(onboarding)/step-1')}
        >
          <ProfileBadge small />
        </Pressable>
      </View>
      <CityPill onPress={() => router.push('/')} />

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>hello, {city.name}.</Text>
          <Text style={styles.heroSubtitle}>Feel at home, anywhere.</Text>
        </View>
        <View style={styles.heroPhoto}>
          <Image source={city.photo} style={styles.photo} contentFit="cover" transition={220} />
        </View>
      </View>

      <ActionButton compact label="I just landed  →" onPress={() => router.push('/arrival')} />

      <View style={styles.links}>
        <RowCard
          icon="▦"
          iconName="phone-portrait-outline"
          title="Local apps"
          detail="Find the right tools"
          onPress={() => router.push('/(main)/apps')}
          compact
        />
        <RowCard
          icon="⌖"
          iconName="map-outline"
          title="How things work"
          detail="Transport, payments & local life"
          onPress={() => router.push('/(main)/guide')}
          compact
        />
        <RowCard
          icon="♡"
          iconName="heart-outline"
          title={saved ? 'City pack saved' : 'Save city pack'}
          detail={
            saved ? 'Your essentials are ready in Saved' : 'Keep the essentials on your device'
          }
          onPress={() => {
            void togglePack();
            router.push('/(main)/saved');
          }}
          trailing={saved ? '✓' : '＋'}
          compact
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hero: { gap: 8 },
  heroCopy: { gap: 3 },
  heroTitle: {
    color: '#121214',
    fontFamily: fontFamily.bold,
    fontSize: 29,
    lineHeight: 35,
    letterSpacing: -0.9,
  },
  heroSubtitle: { color: '#6B6B76', fontFamily: fontFamily.regular, fontSize: 12 },
  heroPhoto: {
    height: 142,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#DFF2F3',
  },
  photo: { ...StyleSheet.absoluteFill },
  links: { marginTop: 12 },
});
