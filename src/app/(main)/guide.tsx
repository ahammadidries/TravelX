import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActionButton, CityPill, Heading, Page, RowCard } from '@/components/TravelUI';
import { localPracticalInfo, usefulPhrases } from '@/data/localEssentials';
import { useCatalog } from '@/state/CatalogContext';
import { useTravel } from '@/state/travelContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

type Topic = 'around' | 'basics' | 'essentials';
const trainSteps = [
  {
    label: 'Before you board',
    title: 'Check your route',
    detail: 'Confirm the line, direction, platform and final connection before you leave.',
  },
  {
    label: 'At the station',
    title: 'Choose a ticket option',
    detail:
      'Use official ticket information or ask staff which ticket or travel card fits your route.',
  },
  {
    label: 'On the train',
    title: 'Know your stop',
    detail: 'Watch the station displays and keep your ticket or travel card ready at the exit.',
  },
] as const;
const topicInfo: Record<
  Topic,
  { title: string; detail: string; icon: keyof typeof Ionicons.glyphMap; sections: string[] }
> = {
  around: {
    title: 'Getting around',
    detail: 'Bus, rail & taxis',
    icon: 'train-outline',
    sections: ['airport', 'transport', 'taxi'],
  },
  basics: {
    title: 'Everyday basics',
    detail: 'Payments & etiquette',
    icon: 'card-outline',
    sections: ['payments', 'etiquette'],
  },
  essentials: {
    title: 'Local essentials',
    detail: 'Phrases, toilets & more',
    icon: 'map-outline',
    sections: [],
  },
};

export default function GuideRoute() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const fromRoute =
    section === 'airport' || section === 'transport' || section === 'taxi'
      ? 'around'
      : section === 'payments' || section === 'etiquette'
        ? 'basics'
        : section === 'essentials'
          ? 'essentials'
          : undefined;
  const [active, setActive] = useState<Topic | undefined>(fromRoute);
  const [trainStep, setTrainStep] = useState(0);
  const { city } = useTravel();
  const { guides } = useCatalog();
  const tips = useMemo(() => guides.filter((tip) => tip.city === city.key), [city.key, guides]);
  const activeTips =
    active && active !== 'essentials'
      ? tips.filter((tip) => topicInfo[active].sections.includes(tip.section))
      : [];

  if (active) {
    return (
      <Page>
        <View style={styles.header}>
          <Pressable onPress={() => setActive(undefined)} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <CityPill onPress={() => router.push('/')} />
        </View>
        <Heading
          title={
            active === 'around'
              ? 'taking the train'
              : active === 'basics'
                ? 'everyday basics'
                : 'local essentials'
          }
          subtitle={
            active === 'around'
              ? 'A practical guide, one step at a time.'
              : 'A little local knowledge goes a long way.'
          }
        />
        {active === 'around' ? <TrainProgress current={trainStep} /> : null}
        {active === 'essentials' ? (
          <EssentialRows />
        ) : active === 'around' ? (
          <TrainStepCard step={trainSteps[trainStep]!} />
        ) : (
          activeTips.map((tip, index) => (
            <GuideCard
              key={tip.id}
              number={index + 1}
              title={tip.title}
              body={tip.body}
              source={tip.source}
              url={tip.url}
            />
          ))
        )}
        <View style={styles.tipNote}>
          <Ionicons name="bulb-outline" size={25} color={colors.accent} />
          <Text style={styles.tipNoteText}>Open one topic at a time.</Text>
        </View>
        <View style={styles.bottomAction}>
          <ActionButton
            label={
              active === 'around'
                ? trainStep === trainSteps.length - 1
                  ? 'Finish transport guide'
                  : 'Next step  →'
                : 'Save city pack'
            }
            onPress={() => {
              if (active === 'around') {
                if (trainStep < trainSteps.length - 1) {
                  setTrainStep((current) => current + 1);
                } else {
                  setTrainStep(0);
                  setActive(undefined);
                }
              } else {
                router.push('/(main)/saved');
              }
            }}
          />
          <Text onPress={() => router.push('/(main)/saved')} style={styles.saveLink}>
            ⌄ Save city pack
          </Text>
        </View>
      </Page>
    );
  }
  return (
    <Page>
      <CityPill onPress={() => router.push('/')} />
      <Heading title="how things work here" subtitle="A little local knowledge goes a long way." />
      {(Object.keys(topicInfo) as Topic[]).map((key) => {
        const info = topicInfo[key];
        return (
          <Pressable
            key={key}
            onPress={() => {
              setTrainStep(0);
              setActive(key);
            }}
            style={styles.topicCard}
          >
            <View style={styles.topicIcon}>
              <Ionicons name={info.icon} size={29} color="#394471" />
            </View>
            <View style={styles.topicCopy}>
              <Text style={styles.topicTitle}>{info.title}</Text>
              <Text style={styles.topicDetail}>{info.detail}</Text>
            </View>
            <Ionicons name="chevron-forward" size={23} color={colors.textPrimary} />
          </Pressable>
        );
      })}
      <View style={styles.tipNote}>
        <Ionicons name="bulb-outline" size={25} color={colors.accent} />
        <Text style={styles.tipNoteText}>Open a topic to learn more.</Text>
      </View>
      <Text onPress={() => router.push('/(main)/saved')} style={styles.saveLink}>
        ⌄ Save city pack
      </Text>
    </Page>
  );
}

function GuideCard({
  number,
  title,
  body,
  source,
  url,
}: {
  number: number;
  title: string;
  body: string;
  source: string;
  url: string;
}) {
  return (
    <Pressable onPress={() => void Linking.openURL(url)} style={styles.guideCard}>
      <View style={styles.guideNumber}>
        <Text style={styles.guideNumberText}>{number}</Text>
      </View>
      <View style={styles.guideCopy}>
        <Text style={styles.guideTitle}>{title}</Text>
        <Text style={styles.guideBody} numberOfLines={4}>
          {body}
        </Text>
        <Text style={styles.guideSource}>{source} · Open source ↗</Text>
      </View>
    </Pressable>
  );
}

function TrainProgress({ current }: { current: number }) {
  return (
    <View style={styles.trainProgressWrap}>
      <View style={styles.steps}>
        {trainSteps.map((step, index) => (
          <View key={step.label} style={styles.progressPart}>
            {index > 0 ? <View style={styles.line} /> : null}
            <View style={[styles.stepCircle, index === current && styles.activeStepCircle]}>
              <Text style={[styles.stepCircleText, index === current && styles.activeStepText]}>
                {index + 1}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.stepLabel}>{trainSteps[current]!.label}</Text>
    </View>
  );
}

function TrainStepCard({ step }: { step: (typeof trainSteps)[number] }) {
  return (
    <View style={styles.trainStepCard}>
      <View style={styles.trainStepIcon}>
        <Ionicons name="map-outline" size={25} color={colors.accent} />
      </View>
      <View style={styles.trainStepCopy}>
        <Text style={styles.trainStepTitle}>{step.title}</Text>
        <Text style={styles.trainStepDetail}>{step.detail}</Text>
      </View>
    </View>
  );
}

function EssentialRows() {
  const { city } = useTravel();
  const phrases = usefulPhrases[city.key];
  const practical = localPracticalInfo[city.key];
  return (
    <View>
      <RowCard
        icon="◌"
        title="Useful phrases"
        detail={
          city.key === 'tokyo'
            ? 'Japanese words and simple local tips.'
            : 'Malayalam words and simple local tips.'
        }
      />
      <View style={styles.phraseGrid}>
        {phrases.map((phrase) => (
          <View key={phrase.local} style={styles.phraseCard}>
            <Text style={styles.phraseLocal}>{phrase.local}</Text>
            <Text style={styles.phrasePronunciation}>{phrase.pronunciation}</Text>
            <Text style={styles.phraseMeaning}>{phrase.meaning}</Text>
          </View>
        ))}
      </View>
      <RowCard icon="♧" title="Public toilets" detail={practical.toilets} />
      <RowCard icon="▣" title="Luggage storage" detail="Places to store your bags." />
      <RowCard icon="ϟ" title="Plugs & charging" detail={practical.plugs} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  topicCard: {
    minHeight: 111,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7E8F0',
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  topicIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F2FA',
  },
  topicCopy: { flex: 1, gap: 5 },
  topicTitle: { color: colors.textPrimary, fontFamily: fontFamily.semibold, fontSize: 17 },
  topicDetail: { color: colors.textSecondary, fontFamily: fontFamily.regular, fontSize: 14 },
  tipNote: {
    minHeight: 60,
    borderRadius: 16,
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 7,
  },
  tipNoteText: { color: '#4938E9', fontFamily: fontFamily.medium, fontSize: 14 },
  saveLink: {
    color: '#4F3EE8',
    fontFamily: fontFamily.semibold,
    textAlign: 'center',
    fontSize: 15,
    marginTop: 30,
  },
  steps: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 18 },
  activeStep: {
    width: 39,
    height: 39,
    borderRadius: 20,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 39,
    color: '#FFF',
    fontFamily: fontFamily.bold,
    backgroundColor: colors.accent,
  },
  inactiveStep: {
    width: 39,
    height: 39,
    borderRadius: 20,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 37,
    color: colors.textSecondary,
    fontFamily: fontFamily.bold,
    borderWidth: 1,
    borderColor: '#DDE0EB',
  },
  line: { height: 1, flex: 1, backgroundColor: '#DDE0EB' },
  trainProgressWrap: { marginBottom: 18 },
  progressPart: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE0EB',
    backgroundColor: '#FFF',
  },
  activeStepCircle: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepCircleText: { color: colors.textSecondary, fontFamily: fontFamily.bold, fontSize: 16 },
  activeStepText: { color: '#FFF' },
  stepLabel: {
    marginTop: 7,
    color: colors.accent,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    textAlign: 'center',
  },
  trainStepCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E4EC',
    padding: 18,
    flexDirection: 'row',
    gap: 14,
  },
  trainStepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainStepCopy: { flex: 1, gap: 5 },
  trainStepTitle: { color: colors.textPrimary, fontFamily: fontFamily.semibold, fontSize: 17 },
  trainStepDetail: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  guideCard: {
    borderWidth: 1,
    borderColor: '#E2E4EC',
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 13,
  },
  guideNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideNumberText: { color: colors.accent, fontFamily: fontFamily.bold, fontSize: 16 },
  guideCopy: { flex: 1, gap: 5 },
  guideTitle: { fontFamily: fontFamily.semibold, color: colors.textPrimary, fontSize: 16 },
  guideBody: {
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  guideSource: { fontFamily: fontFamily.medium, color: colors.accent, fontSize: 11, marginTop: 2 },
  phraseGrid: { gap: 8, marginTop: 8, marginBottom: 8 },
  phraseCard: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E4E6EE',
    backgroundColor: '#FBFBFD',
    padding: 13,
  },
  phraseLocal: { color: colors.textPrimary, fontFamily: fontFamily.semibold, fontSize: 16 },
  phrasePronunciation: {
    color: colors.accent,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    marginTop: 3,
  },
  phraseMeaning: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    marginTop: 4,
  },
  bottomAction: { marginTop: 'auto', paddingTop: 17 },
});
