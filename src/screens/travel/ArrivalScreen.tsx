import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, CityPill, Heading, Page, RowCard } from '@/components/TravelUI';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

const steps = [
  {
    key: 'connect',
    title: 'first, get connected.',
    subtitle: 'Stay online so you can get around and access local apps.',
    icon: 'phone-portrait-outline' as const,
    overview: 'Get connected',
  },
  {
    key: 'airport',
    title: 'leave the airport.',
    subtitle: 'Find a convenient way to reach your destination.',
    icon: 'car-outline' as const,
    overview: 'Leave the airport',
  },
  {
    key: 'payments',
    title: 'pay with confidence.',
    subtitle: 'Use a payment method that works for you in the city.',
    icon: 'card-outline' as const,
    overview: 'Local payments',
  },
  {
    key: 'transport',
    title: 'find your way around.',
    subtitle: 'Explore local transport options in the city.',
    icon: 'train-outline' as const,
    overview: 'Transport basics',
  },
] as const;

export default function ArrivalScreen({ step }: { step?: string }) {
  const index = steps.findIndex((item) => item.key === step);
  const current = index >= 0 ? steps[index] : null;
  if (!current) {
    return (
      <Page>
        <View style={styles.topLine}>
          <Pressable onPress={() => router.back()} style={styles.round}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <CityPill onPress={() => router.push('/')} />
        </View>
        <Heading
          title="let’s get you settled."
          subtitle="A few key steps to help you arrive and explore with ease."
        />
        <View style={styles.overviewList}>
          {steps.map((item, itemIndex) => (
            <Pressable
              key={item.key}
              onPress={() => router.replace({ pathname: '/arrival', params: { step: item.key } })}
              style={styles.overviewRow}
            >
              <View style={[styles.stepBubble, itemIndex === 0 && styles.firstBubble]}>
                <Text style={[styles.stepNumber, itemIndex === 0 && styles.firstNumber]}>
                  {itemIndex + 1}
                </Text>
              </View>
              <View style={styles.overviewCopy}>
                <Text style={styles.overviewTitle}>{item.overview}</Text>
                <Text style={styles.overviewDetail}>
                  {itemIndex === 0 ? 'Get a local SIM or eSIM for mobile data.' : item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
        <View style={styles.overviewFooter}>
          <ActionButton
            label="Start with connectivity  →"
            onPress={() => router.replace({ pathname: '/arrival', params: { step: 'connect' } })}
          />
          <Text onPress={() => router.push('/(main)/guide')} style={styles.textLink}>
            Skip to city guide
          </Text>
        </View>
      </Page>
    );
  }
  const isLast = index === steps.length - 1;
  const isFirst = index === 0;
  return (
    <Page>
      <View style={styles.topLine}>
        <Pressable
          onPress={() =>
            index === 0
              ? router.back()
              : router.replace({ pathname: '/arrival', params: { step: steps[index - 1]!.key } })
          }
          style={styles.round}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.progress}>
          <View
            style={[styles.progressFill, { width: `${((index + 1) / steps.length) * 100}%` }]}
          />
        </View>
        <Text style={styles.count}>{index + 1} / 4</Text>
      </View>
      <Heading title={current.title} subtitle={current.subtitle} />
      <CityPill onPress={() => router.push('/')} />
      <View style={styles.choiceHero}>
        <View style={styles.largeIcon}>
          <Ionicons name={current.icon} size={36} color={colors.accent} />
        </View>
        <View style={styles.choiceText}>
          <Text style={styles.choiceTitle}>
            {isFirst
              ? 'SIM or eSIM'
              : isLast
                ? 'Bus, rail or taxis'
                : index === 1
                  ? 'Taxi'
                  : 'Cash or card'}
          </Text>
          <Text style={styles.choiceDetail}>
            {isFirst ? 'Get a local SIM or eSIM for mobile data.' : current.subtitle}
          </Text>
        </View>
        <View style={styles.selectedMark}>
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
      </View>
      <View style={styles.detailList}>
        <RowCard
          icon={isFirst ? '⌁' : '⌖'}
          title={
            isFirst
              ? 'Find Wi-Fi'
              : index === 1
                ? 'Where to board'
                : index === 2
                  ? 'Card acceptance'
                  : 'Find your service'
          }
          detail={
            isFirst
              ? 'Find reliable Wi-Fi spots in the city.'
              : 'Open a guide with practical local notes.'
          }
          onPress={() => router.push('/(main)/guide')}
        />
        <RowCard
          icon="i"
          title={isLast ? 'Get a ticket' : 'What to check'}
          detail="Open one topic at a time."
          onPress={() => router.push('/(main)/guide')}
        />
      </View>
      <View style={styles.footer}>
        <ActionButton
          label={
            isLast ? 'Finish arrival guide' : `Next: ${steps[index + 1]!.overview.toLowerCase()}`
          }
          onPress={() =>
            isLast
              ? router.push('/(main)/guide')
              : router.replace({ pathname: '/arrival', params: { step: steps[index + 1]!.key } })
          }
        />
        <Text onPress={() => router.push('/(main)/apps')} style={styles.textLink}>
          {isLast ? 'Browse transport apps' : 'Browse useful local apps'}
        </Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  topLine: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
  round: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: { height: 5, flex: 1, backgroundColor: '#E8E7EE', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 6 },
  count: { color: '#5D5B78', fontFamily: fontFamily.medium, fontSize: 13 },
  overviewList: { borderTopWidth: 1, borderTopColor: colors.divider, marginTop: 8 },
  overviewRow: {
    minHeight: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  stepBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F1F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstBubble: { backgroundColor: colors.accent },
  stepNumber: { color: '#343449', fontFamily: fontFamily.bold, fontSize: 20 },
  firstNumber: { color: '#FFF' },
  overviewCopy: { flex: 1, gap: 4 },
  overviewTitle: { fontFamily: fontFamily.semibold, color: colors.textPrimary, fontSize: 16 },
  overviewDetail: {
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  overviewFooter: { marginTop: 'auto', paddingTop: 25 },
  footer: { marginTop: 'auto', paddingTop: 28 },
  textLink: {
    color: '#4F3EE8',
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  choiceHero: {
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#7C70FF',
    backgroundColor: '#FBFAFF',
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  largeIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#EAE8FF',
  },
  choiceText: { flex: 1, gap: 5 },
  choiceTitle: { fontFamily: fontFamily.semibold, color: colors.textPrimary, fontSize: 16 },
  choiceDetail: {
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  selectedMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  detailList: { marginTop: 18 },
});
