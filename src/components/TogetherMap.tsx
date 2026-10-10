import { StyleSheet, Text, View } from 'react-native';
import type { City } from '@/data/cities';

type EventPin = {
  id: string;
  title: string;
  emoji: string;
  location: string;
  latitude: number;
  longitude: number;
};
export default function TogetherMap({
  city,
  events,
  onSelect,
}: {
  city: City;
  events: EventPin[];
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.map}>
      <Text style={styles.city}>{city.name}</Text>
      {events.slice(0, 5).map((event) => (
        <Text key={event.id} onPress={() => onSelect(event.id)} style={styles.pin}>
          {event.emoji}
        </Text>
      ))}
      <Text style={styles.note}>Illustrative map · public meeting places</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#DDEBE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  city: { fontWeight: '700', fontSize: 22, color: '#323A3D' },
  pin: { fontSize: 22, padding: 8 },
  note: { position: 'absolute', bottom: 10, left: 14, fontSize: 10, color: '#4D6B73' },
});
