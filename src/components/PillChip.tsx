import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, typography } from '@/theme/typography';

type PillChipProps = PropsWithChildren<{
  selected?: boolean;
  onPress?: () => void;
}>;

export function PillChip({ children, selected = false, onPress }: PillChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? styles.selected : styles.unselected]}
    >
      <Text
        style={[
          typography.body,
          styles.text,
          { color: selected ? colors.accent : colors.textPrimary },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentBorder,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  text: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
});
