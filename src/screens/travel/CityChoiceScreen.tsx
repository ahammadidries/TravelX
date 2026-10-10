import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActionButton, Brand, ChoiceRow, Heading, Page } from '@/components/TravelUI';
import { cities, useTravel, type CityKey } from '@/state/travelContext';

export default function CityChoiceScreen() {
  const { city, setCity } = useTravel();
  const [selected, setSelected] = useState<CityKey>(city.key);
  return (
    <Page>
      <Brand />
      <Heading
        title="Where are you going?"
        subtitle="Choose your city to get the local essentials."
      />
      <View style={styles.choices}>
        {Object.values(cities).map((option) => (
          <ChoiceRow
            key={option.key}
            label={`${option.flag}   ${option.name}\n       ${option.region}, ${option.country}`}
            selected={selected === option.key}
            onPress={() => setSelected(option.key)}
          />
        ))}
      </View>
      <View style={styles.bottom}>
        <ActionButton
          label="Continue"
          onPress={() => {
            setCity(selected);
            router.replace('/(main)/city');
          }}
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  choices: { marginTop: 14 },
  bottom: { marginTop: 'auto', paddingTop: 30 },
});
