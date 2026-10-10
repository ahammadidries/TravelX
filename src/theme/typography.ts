import { colors } from './colors';

export const fontFamily = {
  regular: 'Sora_400Regular',
  medium: 'Sora_500Medium',
  semibold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
} as const;

export const typography = {
  heading: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
  },
} as const;
