import { Alert } from 'react-native';
import { router } from 'expo-router';
import { ActionButton, Heading, Note, Page, RowCard, SectionTitle } from '@/components/TravelUI';
import { cities, type CityKey } from '@/data/cities';
import { localApps } from '@/data/apps';
import { useTravel } from '@/state/travelContext';

export default function SavedScreen() {
  const { city, savedCities, toggleSavedCity, savedAppIds, toggleSavedApp } = useTravel();
  const saveCity = async (key: CityKey) => {
    try {
      await toggleSavedCity(key);
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    }
  };
  const saveApp = async (id: string) => {
    try {
      await toggleSavedApp(id);
    } catch (e) {
      Alert.alert(
        'Could not update saved apps',
        e instanceof Error ? e.message : 'Please try again.',
      );
    }
  };
  const cityKeys = [...new Set([...savedCities, ...(savedCities.includes(city.key) ? [] : [])])];
  return (
    <Page>
      <Heading title="Saved" subtitle="Your city packs and local apps, ready when you need them." />
      <SectionTitle>City packs</SectionTitle>
      {cityKeys.length ? (
        cityKeys.map((key) => (
          <RowCard
            key={key}
            icon={cities[key].flag}
            title={`${cities[key].name} city pack`}
            detail={`${cities[key].region}, ${cities[key].country}`}
            onPress={() => {
              router.push('/(main)/city');
            }}
            trailing="✓"
          />
        ))
      ) : (
        <>
          <RowCard
            icon="＋"
            title="No city pack saved yet"
            detail="Save this city to keep its practical guide close."
            trailing=""
          />
          <ActionButton
            label={`Save ${city.name} city pack`}
            onPress={() => void saveCity(city.key)}
          />
        </>
      )}
      {cityKeys.length > 0 ? (
        <ActionButton
          secondary
          label={`Save current city · ${city.name}`}
          onPress={() => void saveCity(city.key)}
        />
      ) : null}
      <SectionTitle>Saved apps</SectionTitle>
      {savedAppIds.length ? (
        savedAppIds.map((id) => {
          const app = localApps.find((item) => item.id === id);
          return app ? (
            <RowCard
              key={id}
              icon={app.initials}
              title={app.name}
              detail={`${app.category} · ${app.purpose}`}
              onPress={() => router.push('/(main)/apps')}
              trailing="×"
            />
          ) : null;
        })
      ) : (
        <RowCard
          icon="▦"
          title="No apps saved yet"
          detail="Browse useful local apps and bookmark what you might use."
          onPress={() => router.push('/(main)/apps')}
        />
      )}
      {savedAppIds.map((id) =>
        localApps.some((app) => app.id === id) ? (
          <ActionButton
            key={`remove-${id}`}
            secondary
            label={`Remove ${localApps.find((app) => app.id === id)?.name}`}
            onPress={() => void saveApp(id)}
          />
        ) : null,
      )}
      <Note>
        Your saved items stay on this device. Sign in to sync your city pack across devices.
      </Note>
    </Page>
  );
}
