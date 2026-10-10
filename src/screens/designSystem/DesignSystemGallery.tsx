import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { BottomSheet, type BottomSheetHandle } from '@/components/BottomSheet';
import { Button, type ButtonVariant } from '@/components/Button';
import { EmojiPicker } from '@/components/EmojiPicker';
import { PillChip } from '@/components/PillChip';
import { ProgressBar } from '@/components/ProgressBar';
import { TextInputField } from '@/components/TextInputField';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, typography } from '@/theme/typography';

const buttonVariants: ButtonVariant[] = ['primary', 'success', 'warning', 'danger', 'disabled'];

function SectionTitle({ children }: React.PropsWithChildren) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function DesignSystemGallery() {
  const [selectedChip, setSelectedChip] = useState('Selected');
  const [emoji, setEmoji] = useState('☕');
  const bottomSheetRef = useRef<BottomSheetHandle>(null);

  return (
    <>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>PHASE 0 · COMPONENT PREVIEW</Text>
        <Text style={typography.heading}>Design system</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>Light theme · Sora · Periwinkle</Text>

        <SectionTitle>Button variants</SectionTitle>
        <View style={styles.buttonList}>
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant} onPress={() => undefined}>
              {variant === 'disabled'
                ? 'Disabled'
                : `${variant[0]?.toUpperCase()}${variant.slice(1)}`}
            </Button>
          ))}
        </View>

        <SectionTitle>Pill chips</SectionTitle>
        <View style={styles.chipRow}>
          {['Selected', 'Unselected'].map((label) => (
            <PillChip
              key={label}
              selected={selectedChip === label}
              onPress={() => setSelectedChip(label)}
            >
              {label}
            </PillChip>
          ))}
        </View>

        <SectionTitle>Text input</SectionTitle>
        <TextInputField label="YOUR NAME" defaultValue="Jasil Mohammed" />

        <SectionTitle>Progress</SectionTitle>
        <View style={styles.progressList}>
          {[0.25, 0.5, 0.75, 1].map((progress) => (
            <ProgressBar key={progress} progress={progress} />
          ))}
        </View>

        <SectionTitle>Avatars</SectionTitle>
        <View style={styles.avatarRow}>
          <Avatar initials="JM" />
          <Avatar initials="S" ringColor={colors.accent} />
          <Avatar initials="A" badge="★" />
          <Avatar initials="M" size={56} ringColor={colors.accent} badge="★" />
        </View>

        <SectionTitle>Emoji picker</SectionTitle>
        <View style={styles.emojiPreview}>
          <EmojiPicker value={emoji} onChange={setEmoji} />
        </View>

        <SectionTitle>Bottom sheet</SectionTitle>
        <Button onPress={() => bottomSheetRef.current?.present()}>Open bottom sheet</Button>
      </ScrollView>

      <BottomSheet ref={bottomSheetRef}>
        <Text style={styles.sheetTitle}>Bottom sheet preview</Text>
        <Text style={typography.subtitle}>Rounded surface · drag handle · light palette</Text>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  eyebrow: {
    ...typography.label,
  },
  subtitle: {
    marginTop: -spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    fontFamily: fontFamily.semibold,
    marginTop: spacing.lg,
  },
  buttonList: {
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  progressList: {
    gap: spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emojiPreview: {
    alignItems: 'flex-start',
  },
  sheetTitle: {
    ...typography.heading,
    marginBottom: spacing.sm,
  },
});
