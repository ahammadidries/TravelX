import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const emojis = ['☕', '🍕', '🎉', '🥾', '🏖️', '🎨', '🍜', '🚲', '🌿'];

type EmojiPickerProps = {
  value?: string;
  onChange?: (emoji: string) => void;
};

export function EmojiPicker({ value = '☕', onChange }: EmojiPickerProps) {
  const [isVisible, setIsVisible] = useState(false);

  const selectEmoji = (emoji: string) => {
    onChange?.(emoji);
    setIsVisible(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Choose activity emoji. Current: ${value}`}
        onPress={() => setIsVisible(true)}
        style={styles.trigger}
      >
        <Text style={styles.emoji}>{value}</Text>
        <Text style={styles.caption}>Tap to change emoji</Text>
      </Pressable>
      <Modal
        animationType="fade"
        transparent
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable style={styles.scrim} onPress={() => setIsVisible(false)}>
          <Pressable style={styles.modal} onPress={(event) => event.stopPropagation()}>
            <Text style={[typography.heading, styles.title]}>Choose an emoji</Text>
            <View style={styles.grid}>
              {emojis.map((emoji) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={emoji}
                  key={emoji}
                  onPress={() => selectEmoji(emoji)}
                  style={styles.option}
                >
                  <Text style={styles.optionEmoji}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 38,
  },
  caption: {
    ...typography.subtitle,
  },
  scrim: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(18, 18, 20, 0.42)',
  },
  modal: {
    borderRadius: 24,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.xl,
  },
  title: {
    fontSize: 20,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  option: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  optionEmoji: {
    fontSize: 28,
  },
});
