import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export function Brand({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Text style={[styles.brand, compact && styles.compactBrand, light && styles.lightText]}>
      Travel<Text style={styles.brandAccent}>X</Text>
    </Text>
  );
}

/** A visual identity marker only. TravelX does not require an account. */
export function ProfileBadge({ small = false }: { small?: boolean }) {
  return (
    <View
      accessibilityLabel="TravelX profile badge"
      style={[styles.profileBadge, small && styles.smallProfileBadge]}
    >
      <Text style={[styles.profileBadgeText, small && styles.smallProfileBadgeText]}>JD</Text>
    </View>
  );
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
  disabled = false,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  light?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        compact && styles.compactAction,
        secondary && styles.secondaryAction,
        light && secondary && styles.lightSecondary,
        pressed && styles.pressed,
        disabled && styles.pressed,
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

export function CityPill({ onPress, dark = false }: { onPress: () => void; dark?: boolean }) {
  const { city } = useTravel();
  return (
    <Pressable onPress={onPress} style={[styles.cityPill, dark && styles.darkCityPill]}>
      <Ionicons name="location" size={16} color={colors.accent} />
      <Text style={[styles.cityPillText, dark && styles.darkCityPillText]} numberOfLines={1}>
        {city.name}, {city.region === city.name ? city.country : `${city.region}, ${city.country}`}
      </Text>
      <Ionicons name="chevron-down" size={15} color={dark ? '#F7F7FA' : colors.textPrimary} />
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
  iconName,
  title,
  detail,
  onPress,
  trailing = '›',
  compact = false,
}: {
  icon: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  detail?: string;
  onPress?: () => void;
  trailing?: string;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowCard,
        compact && styles.compactRowCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.rowIcon}>
        {iconName ? (
          <Ionicons name={iconName} size={20} color={colors.textPrimary} />
        ) : (
          <Text style={styles.rowIconText}>{icon}</Text>
        )}
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
  detail,
  icon,
  selected,
  onPress,
  dark = false,
}: {
  label: string;
  detail?: string;
  icon?: string;
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
      <View style={styles.choiceCopy}>
        {icon ? <Text style={styles.choiceIcon}>{icon}</Text> : null}
        <View style={styles.choiceWords}>
          <Text style={[styles.choiceLabel, dark && styles.lightText]}>{label}</Text>
          {detail ? (
            <Text style={[styles.choiceDetail, dark && styles.lightSub]}>{detail}</Text>
          ) : null}
        </View>
      </View>
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
  page: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 30,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  brand: { color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: 28, marginBottom: 30 },
  compactBrand: { marginBottom: 0, fontSize: 24 },
  brandAccent: { color: colors.accent },
  profileBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEDFF',
  },
  profileBadgeText: { color: colors.accent, fontFamily: fontFamily.bold, fontSize: 15 },
  smallProfileBadge: { width: 30, height: 30, borderRadius: 15 },
  smallProfileBadgeText: { fontSize: 9 },
  headingBlock: { gap: 8, marginBottom: 24 },
  heading: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: 35,
    lineHeight: 40,
    letterSpacing: -1.2,
  },
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
    backgroundColor: '#6954F7',
    marginTop: 12,
  },
  actionText: { color: '#FFF', fontFamily: fontFamily.semibold, fontSize: 16 },
  compactAction: { height: 50, marginTop: 8 },
  secondaryAction: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  secondaryText: { color: colors.textPrimary },
  lightSecondary: { backgroundColor: '#222226', borderColor: '#34343A' },
  lightSecondaryText: { color: '#F7F7FA' },
  pressed: { opacity: 0.76 },
  cityPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 24,
  },
  cityPillText: { color: colors.textPrimary, fontFamily: fontFamily.medium, fontSize: 14 },
  darkCityPill: { borderColor: '#3E3E47', backgroundColor: '#202024' },
  darkCityPillText: { color: '#F7F7FA' },
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
  compactRowCard: { minHeight: 68 },
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
    minHeight: 82,
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
  choiceCopy: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, paddingRight: 12 },
  choiceIcon: { fontSize: 27 },
  choiceWords: { flex: 1, gap: 3 },
  choiceLabel: { color: colors.textPrimary, fontFamily: fontFamily.semibold, fontSize: 16 },
  choiceDetail: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
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
