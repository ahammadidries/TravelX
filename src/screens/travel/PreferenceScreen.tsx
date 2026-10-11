import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton, ChoiceRow, CityPill, Heading, Page } from '@/components/TravelUI';
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

const choiceDetails: Record<string, { icon: string; detail: string }> = {
  English: { icon: '🌐', detail: 'Read in English' },
  Japanese: { icon: '🇯🇵', detail: 'Japanese' },
  Malayalam: { icon: '🇮🇳', detail: 'Malayalam' },
  Yes: { icon: '📱', detail: 'I already have a local SIM or eSIM.' },
  'Not yet': { icon: '📲', detail: 'I’ll get a local SIM or eSIM in the city.' },
  Cash: { icon: '💵', detail: 'Local currency and cash tips.' },
  Card: { icon: '💳', detail: 'International cards and contactless options.' },
  Both: { icon: '💶', detail: 'Use cash and card for more flexibility.' },
  No: { icon: '⚙️', detail: 'Show all available routes.' },
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
        <Text style={styles.stepCount}>{step} / 4</Text>
      </View>
      <View style={styles.content}>
        <Heading title={config.title.toLowerCase()} subtitle={config.subtitle} light />
        <CityPill dark onPress={() => router.replace('/')} />
        {config.choices.map((choice) => (
          <ChoiceRow
            key={choice}
            dark
            label={choice}
            icon={choiceDetails[choice]?.icon}
            detail={choiceDetails[choice]?.detail}
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
        <Text onPress={onContinue} style={styles.skipFooter}>
          Skip
        </Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  progressLine: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 36 },
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
  stepCount: { color: '#C2C1D4', fontFamily: fontFamily.medium, fontSize: 14 },
  content: { flex: 1 },
  footer: { marginTop: 'auto', paddingBottom: 10 },
  skipFooter: {
    color: '#9E95FF',
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
