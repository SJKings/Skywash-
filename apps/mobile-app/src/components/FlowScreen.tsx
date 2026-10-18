import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPackage } from '@/lib/catalog';
import { useBookingFlow } from '@/lib/booking-flow';
import { colors, GUTTER } from '@/theme';
import { Text } from './Text';
import { BottomBar, Button, Tappable, useStatusBar } from './ui';

/**
 * Shared layout for the 4 booking steps: back button, title, "Step N of 4"
 * and progress bar on top; the Continue / Confirm button pinned at the bottom.
 * The button is dimmed and does nothing until the step is valid.
 */
export function FlowScreen({
  step,
  title,
  ctaLabel = 'Continue',
  canContinue,
  onContinue,
  submitting,
  children,
}: {
  step: 1 | 2 | 3 | 4;
  title: string;
  ctaLabel?: string;
  canContinue: boolean;
  onContinue: () => void;
  submitting?: boolean;
  children: ReactNode;
}) {
  useStatusBar('dark');
  const insets = useSafeAreaInsets();
  const { draft } = useBookingFlow();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: GUTTER, paddingBottom: 14, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Tappable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => router.back()}
            style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={19} color={colors.ink} />
          </Tappable>
          <View style={{ flex: 1 }}>
            <Text size={17} weight={700}>
              {title}
            </Text>
            <Text size={12} color={colors.slate500}>
              {getPackage(draft.washType).name} · Step {step} of 4
            </Text>
          </View>
        </View>
        <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.slate200, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${step * 25}%`, backgroundColor: colors.brand, borderRadius: 3 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 6, paddingBottom: 140, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      <BottomBar>
        <Button
          label={ctaLabel}
          onPress={onContinue}
          disabled={!canContinue}
          loading={submitting}
        />
      </BottomBar>
    </KeyboardAvoidingView>
  );
}
