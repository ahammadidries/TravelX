import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

type ProgressBarProps = {
  progress: number;
};

export function ProgressBar({ progress }: ProgressBarProps) {
  const normalizedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(normalizedProgress * 100) }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${normalizedProgress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: colors.divider,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});
