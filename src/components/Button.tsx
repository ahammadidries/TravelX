import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, typography } from '@/theme/typography';

export type ButtonVariant = 'primary' | 'success' | 'warning' | 'danger' | 'disabled';

type ButtonProps = PropsWithChildren<{
  variant?: ButtonVariant;
  onPress?: PressableProps['onPress'];
  accessibilityLabel?: string;
}>;

const variantColors: Record<ButtonVariant, string> = {
  primary: colors.accent,
  success: colors.commentsAction,
  warning: colors.joinAction,
  danger: colors.danger,
  disabled: colors.border,
};

export function Button({
  children,
  variant = 'primary',
  onPress,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = variant === 'disabled';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: variantColors[variant] },
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <Text style={[typography.button, styles.text, isDisabled && styles.disabledText]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  text: {
    color: colors.textOnAccent,
    fontFamily: fontFamily.semibold,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.86,
  },
});
