import { forwardRef, useImperativeHandle, useRef, type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetModal as GorhomBottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export type BottomSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

type BottomSheetProps = PropsWithChildren<{
  snapPoints?: (string | number)[];
}>;

export const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
  ({ children, snapPoints = ['55%'] }, ref) => {
    const sheetRef = useRef<GorhomBottomSheetModal>(null);

    useImperativeHandle(
      ref,
      () => ({
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
      }),
      [],
    );

    return (
      <GorhomBottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.content}>
          <View>{children}</View>
        </BottomSheetView>
      </GorhomBottomSheetModal>
    );
  },
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: colors.border,
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
});
