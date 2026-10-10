import { useState, type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, typography } from '@/theme/typography';

type TextInputFieldProps = TextInputProps & {
  label: string;
  trailing?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextInputField({
  label,
  trailing,
  containerStyle,
  style,
  ...inputProps
}: TextInputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, isFocused && styles.focused]}>
        <TextInput
          {...inputProps}
          onFocus={(event) => {
            setIsFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            inputProps.onBlur?.(event);
          }}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, style]}
        />
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  inputShell: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
  },
  focused: {
    borderColor: colors.accentBorder,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: 15,
  },
  trailing: {
    marginLeft: spacing.sm,
  },
});
