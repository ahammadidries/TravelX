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
      <View style={styles.water} />
      <View style={styles.roadOne} />
      <View style={styles.roadTwo} />
      <Text style={styles.city}>{city.name}</Text>
      {events.slice(0, 5).map((event, index) => (
        <Text
          key={event.id}
          accessibilityRole="button"
          onPress={() => onSelect(event.id)}
          style={[
            styles.pin,
            { left: `${23 + ((index * 17) % 65)}%`, top: `${25 + ((index * 13) % 52)}%` },
          ]}
        >
          {event.emoji}
        </Text>
      ))}
      <Text style={styles.attribution}>Illustrative map · meet at a listed public place</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFill, backgroundColor: '#DDEBE0', overflow: 'hidden' },
  water: {
    position: 'absolute',
    left: -70,
    top: -70,
    width: '44%',
    height: '130%',
    backgroundColor: '#9FD7EC',
    borderTopRightRadius: 180,
    borderBottomRightRadius: 180,
  },
  roadOne: {
    position: 'absolute',
    left: '20%',
    top: '40%',
    width: '100%',
    height: 12,
    backgroundColor: '#FFFDF5',
    transform: [{ rotate: '-24deg' }],
  },
  roadTwo: {
    position: 'absolute',
    left: '30%',
    top: '70%',
    width: '90%',
    height: 9,
    backgroundColor: '#FFFDF5',
    transform: [{ rotate: '20deg' }],
  },
  city: {
    position: 'absolute',
    left: '42%',
    top: '48%',
    fontWeight: '700',
    fontSize: 22,
    color: '#323A3D',
  },
  pin: {
    position: 'absolute',
    width: 40,
    height: 40,
    lineHeight: 38,
    textAlign: 'center',
    backgroundColor: '#FFF',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#7165F5',
    fontSize: 20,
    overflow: 'hidden',
  },
  attribution: { position: 'absolute', bottom: 10, left: 14, fontSize: 10, color: '#4D6B73' },
});
