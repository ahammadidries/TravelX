import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { useTravel } from '@/state/travelContext';

export function Page({ children, dark = false }: PropsWithChildren<{ dark?: boolean }>) {
  return (
    <SafeAreaView style={[styles.safe, dark && styles.dark]}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Brand({ light = false }: { light?: boolean }) {
  return <Text style={[styles.brand, light && styles.lightText]}>TravelX</Text>;
}

export function Heading({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <View style={styles.headingBlock}>
      <Text style={[styles.heading, light && styles.lightText]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, light && styles.lightSub]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  secondary = false,
  light = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  light?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        secondary && styles.secondaryAction,
        light && secondary && styles.lightSecondary,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.actionText,
          secondary && styles.secondaryText,
          light && secondary && styles.lightSecondaryText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function CityPill({ onPress }: { onPress: () => void }) {
  const { city } = useTravel();
  return (
    <Pressable onPress={onPress} style={styles.cityPill}>
      <Text style={styles.cityPillText}>{city.name} ⌄</Text>
    </Pressable>
  );
}

export function SectionTitle({ children, trailing }: PropsWithChildren<{ trailing?: ReactNode }>) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionText}>{children}</Text>
      {trailing}
    </View>
  );
}

export function RowCard({
  icon,
  title,
  detail,
  onPress,
  trailing = '›',
}: {
  icon: string;
  title: string;
  detail?: string;
  onPress?: () => void;
  trailing?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.rowCard, pressed && styles.pressed]}
    >
      <View style={styles.rowIcon}>
        <Text style={styles.rowIconText}>{icon}</Text>
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      </View>
      <Text style={styles.chevron}>{trailing}</Text>
    </Pressable>
  );
}

export function ChoiceRow({
  label,
  selected,
  onPress,
  dark = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  dark?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.choice,
        dark && styles.darkChoice,
        selected && (dark ? styles.darkChoiceSelected : styles.choiceSelected),
      ]}
    >
      <Text style={[styles.choiceLabel, dark && styles.lightText]}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

export function Note({ children }: PropsWithChildren) {
  return <Text style={styles.note}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  dark: { backgroundColor: '#101012' },
  page: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 30 },
  brand: { color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: 20, marginBottom: 30 },
  headingBlock: { gap: 8, marginBottom: 24 },
  heading: { color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: 27, lineHeight: 36 },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 23,
  },
  lightText: { color: '#F7F7FA' },
  lightSub: { color: '#A4A4AE' },
  action: {
    height: 58,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    marginTop: 12,
  },
  actionText: { color: '#FFF', fontFamily: fontFamily.semibold, fontSize: 16 },
  secondaryAction: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  secondaryText: { color: colors.textPrimary },
  lightSecondary: { backgroundColor: '#222226', borderColor: '#34343A' },
  lightSecondaryText: { color: '#F7F7FA' },
  pressed: { opacity: 0.76 },
  cityPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 24,
  },
  cityPillText: { color: colors.textPrimary, fontFamily: fontFamily.medium, fontSize: 14 },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  sectionText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  rowCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 14,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMuted,
  },
  rowIconText: { fontSize: 18 },
  rowCopy: { flex: 1, gap: 3 },
  rowTitle: { color: colors.textPrimary, fontFamily: fontFamily.medium, fontSize: 15 },
  rowDetail: { color: colors.textSecondary, fontFamily: fontFamily.regular, fontSize: 12 },
  chevron: { color: colors.textSecondary, fontSize: 24 },
  choice: {
    minHeight: 70,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  darkChoice: { backgroundColor: '#202024' },
  choiceSelected: { backgroundColor: '#F0F0FF', borderColor: colors.accent },
  darkChoiceSelected: { backgroundColor: '#262637', borderColor: colors.accent },
  choiceLabel: { color: colors.textPrimary, fontFamily: fontFamily.regular, fontSize: 16 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A6A6B0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  check: { color: '#FFF', fontFamily: fontFamily.bold, fontSize: 13 },
  note: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    marginTop: 12,
  },
});
