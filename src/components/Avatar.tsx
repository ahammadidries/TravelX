import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

type AvatarProps = {
  initials: string;
  size?: number;
  ringColor?: string;
  badge?: string;
};

export function Avatar({ initials, size = 48, ringColor, badge }: AvatarProps) {
  const ringWidth = ringColor ? 3 : 0;

  return (
    <View
      accessibilityLabel={badge ? `${initials}, ${badge}` : initials}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: ringColor ?? 'transparent',
          borderWidth: ringWidth,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{initials}</Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMuted,
  },
  initials: {
    color: colors.accent,
    fontFamily: fontFamily.semibold,
  },
  badge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: colors.success,
  },
  badgeText: {
    color: colors.textOnAccent,
    fontFamily: fontFamily.bold,
    fontSize: 10,
  },
});
