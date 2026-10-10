import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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
    <MapView
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: city.latitude,
        longitude: city.longitude,
        latitudeDelta: city.key === 'tokyo' ? 0.13 : 0.18,
        longitudeDelta: city.key === 'tokyo' ? 0.13 : 0.18,
      }}
    >
      <Marker
        coordinate={{ latitude: city.latitude, longitude: city.longitude }}
        title={city.name}
      />
      {events.map((event) => (
        <Marker
          key={event.id}
          coordinate={{ latitude: event.latitude, longitude: event.longitude }}
          title={`${event.emoji} ${event.title}`}
          description={event.location}
          onCalloutPress={() => onSelect(event.id)}
        >
          <View style={styles.pin}>
            <Text style={styles.emoji}>{event.emoji}</Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
}
const styles = StyleSheet.create({
  pin: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#7165F5',
    elevation: 3,
  },
  emoji: { fontSize: 19 },
});
