import { router } from 'expo-router';
import { SectionTitle, CityPill, Heading, Note, Page, RowCard } from '@/components/TravelUI';
import { useTravel } from '@/state/travelContext';

export default function GuideScreen() {
  const { city } = useTravel();
  return (
    <Page>
      <CityPill onPress={() => router.push('/')} />
      <Heading title="How it works here" subtitle={`Everyday tips for ${city.name}`} />
      <SectionTitle>Getting around</SectionTitle>
      <RowCard
        icon="🎫"
        title="Tickets & transport"
        detail="Where to check routes, tickets and local rules"
      />
      <RowCard icon="🚕" title="Finding a taxi" detail="Booking options and what to expect" />
      <SectionTitle>Everyday life</SectionTitle>
      <RowCard icon="💳" title="Paying for things" detail="Cash, cards and local payment options" />
      <RowCard icon="👋" title="Local etiquette" detail="Small customs that make a difference" />
      <Note>
        Practical information is illustrative. Confirm details with official local sources before
        traveling.
      </Note>
      <SectionTitle>Useful essentials</SectionTitle>
      <RowCard
        icon="Aa"
        title="Useful phrases"
        detail={
          city.key === 'tokyo' ? 'English and Japanese basics' : 'English and Malayalam basics'
        }
      />
      <RowCard
        icon="⌖"
        title="Public toilets & luggage"
        detail="Things to look for when you are out"
      />
      <RowCard
        icon="🔌"
        title="Power & charging"
        detail="Check plug and voltage guidance for your trip"
      />
    </Page>
  );
}
