import { router } from 'expo-router';
import { ActionButton, Heading, Page, RowCard } from '@/components/TravelUI';
import { useTravel } from '@/state/travelContext';

export default function SavedScreen() {
  const { city, saved, toggleSaved } = useTravel();
  return (
    <Page>
      <Heading title="Saved" subtitle="Keep your city essentials together." />
      {saved ? (
        <RowCard
          icon="♡"
          title={`${city.name} city pack`}
          detail={`${city.region}, ${city.country}`}
          onPress={() => router.push('/(main)/city')}
          trailing="✓"
        />
      ) : (
        <>
          <RowCard
            icon="＋"
            title="No city pack saved yet"
            detail="Save a destination to see it here."
            trailing=""
          />
          <ActionButton label="Save this city pack" onPress={toggleSaved} />
        </>
      )}
    </Page>
  );
}
