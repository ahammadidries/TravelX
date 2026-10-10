import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton, ChoiceRow, Heading, Page } from '@/components/TravelUI';
import { useTravel } from '@/state/travelContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

const items: Record<
  number,
  {
    title: string;
    subtitle: string;
    field: 'language' | 'localNumber' | 'payment' | 'stepFree';
    choices: string[];
  }
> = {
  1: {
    title: 'Your preferred language?',
    subtitle: 'Choose one to get started.',
    field: 'language',
    choices: ['English', 'Japanese', 'Malayalam'],
  },
  2: {
    title: 'Have a local number?',
    subtitle: 'For your destination.',
    field: 'localNumber',
    choices: ['Yes', 'Not yet'],
  },
  3: {
    title: 'How will you pay?',
    subtitle: 'You can change this later.',
    field: 'payment',
    choices: ['Cash', 'Card', 'Both'],
  },
  4: {
    title: 'Need step-free access?',
    subtitle: 'We’ll surface practical access notes where available.',
    field: 'stepFree',
    choices: ['Yes', 'No'],
  },
};

export default function PreferenceScreen({
  step,
  onContinue,
}: {
  step: 1 | 2 | 3 | 4;
  onContinue: () => void;
}) {
  const { preferences, setPreference } = useTravel();
  const config = items[step]!;
  return (
    <Page dark>
      <View style={styles.progressLine}>
        <Text onPress={() => router.back()} style={styles.back}>
          ‹
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${step * 25}%` }]} />
        </View>
        <Text style={styles.skip} onPress={onContinue}>
          Skip
        </Text>
      </View>
      <View style={styles.content}>
        <Heading title={config.title} subtitle={config.subtitle} light />
        {config.choices.map((choice) => (
          <ChoiceRow
            key={choice}
            dark
            label={choice}
            selected={
              config.field === 'stepFree'
                ? preferences.stepFree === (choice === 'Yes')
                : preferences[config.field] === choice
            }
            onPress={() =>
              config.field === 'stepFree'
                ? setPreference('stepFree', choice === 'Yes')
                : setPreference(config.field, choice)
            }
          />
        ))}
      </View>
      <View style={styles.footer}>
        <ActionButton label="Continue" onPress={onContinue} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  progressLine: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 46 },
  back: {
    height: 42,
    width: 42,
    lineHeight: 39,
    borderRadius: 24,
    color: '#FFF',
    textAlign: 'center',
    fontSize: 30,
    borderWidth: 1,
    borderColor: '#34343A',
    backgroundColor: '#202024',
  },
  track: { height: 4, borderRadius: 3, backgroundColor: '#303035', flex: 1, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: colors.accent },
  skip: { color: '#A5A5AE', fontFamily: fontFamily.medium, fontSize: 14 },
  content: { flex: 1 },
  footer: { marginTop: 'auto', paddingBottom: 10 },
});
