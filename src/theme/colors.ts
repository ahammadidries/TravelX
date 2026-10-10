export const colors = {
  background: '#FFFFFF',
  surface: '#F6F6F8',
  surfaceElevated: '#FFFFFF',

  textPrimary: '#121214',
  textSecondary: '#6B6B76',
  textOnAccent: '#FFFFFF',

  accent: '#8088F5',
  accentMuted: '#EEF0FD',
  accentBorder: '#8088F5',

  joinAction: '#FF8A3D',
  commentsAction: '#2BB673',
  leaveAction: '#E5484D',
  danger: '#E5484D',

  border: '#E5E5EA',
  divider: '#EFEFF2',

  success: '#2BB673',
  warning: '#F5A623',
} as const;

export type ColorToken = keyof typeof colors;
