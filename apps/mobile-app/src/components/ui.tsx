import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { CircleAlert, type LucideIcon } from 'lucide-react-native';
import { useCallback, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BookingStatus } from '@/lib/api';
import { colors, fonts, GUTTER } from '@/theme';
import { Text } from './Text';

/** Sets the status bar text color while this screen is focused. */
export function useStatusBar(style: 'light' | 'dark') {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style);
    }, [style]),
  );
}

type ButtonVariant = 'primary' | 'dark' | 'soft' | 'outlineLight';

const BUTTON_STYLES: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.brand, fg: colors.white },
  dark: { bg: colors.ink, fg: colors.white },
  soft: { bg: colors.sky50, fg: colors.brandText, border: colors.sky200 },
  outlineLight: { bg: 'transparent', fg: colors.white, border: colors.white },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon: Icon,
  height = 54,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = BUTTON_STYLES[variant];
  const soft = variant === 'soft';
  return (
    <Pressable
      accessibilityRole="button"
      aria-disabled={disabled || loading}
      aria-busy={loading}
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        {
          height,
          borderRadius: soft ? 14 : 16,
          backgroundColor: v.bg,
          borderWidth: v.border ? (variant === 'outlineLight' ? 2 : 1.5) : 0,
          borderColor: v.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: soft ? 'flex-start' : 'center',
          paddingHorizontal: 14,
          gap: 8,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {Icon && <Icon size={18} color={v.fg} />}
          <Text size={soft ? 14 : 16} weight={soft ? 600 : 700} color={v.fg}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text size={13} weight={600} color={colors.slate700}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.slate400}
      style={[styles.input, style]}
      {...props}
    />
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View accessibilityRole="alert" style={styles.errorBanner}>
      <CircleAlert size={18} color={colors.errorText} />
      <Text size={14} color={colors.errorText} style={{ flex: 1 }} lineHeight={1.4}>
        {message}
      </Text>
    </View>
  );
}

/** A tappable surface that dims while pressed. */
export function Tappable({ style, ...props }: PressableProps & { style?: StyleProp<ViewStyle> }) {
  return <Pressable style={({ pressed }) => [style, pressed && { opacity: 0.7 }]} {...props} />;
}

export function IconTile({
  icon: Icon,
  size = 48,
  radius = 14,
  iconSize = 22,
  bg = colors.sky100,
}: {
  icon: LucideIcon;
  size?: number;
  radius?: number;
  iconSize?: number;
  bg?: string;
}) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={iconSize} color={colors.brandIcon} />
    </View>
  );
}

/** White bar pinned to the bottom of the screen, above the home indicator. */
export function BottomBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) + 6 }]}>{children}</View>;
}

export const STATUS_STYLES: Record<BookingStatus, { label: string; bg: string; color: string }> = {
  PENDING: { label: 'Received', bg: '#E0F2FE', color: '#0369A1' },
  APPROVED: { label: 'Confirmed', bg: '#E2E8F0', color: '#334155' },
  IN_PROGRESS: { label: 'In progress', bg: '#FEF3C7', color: '#92400E' },
  COMPLETED: { label: 'Completed', bg: '#DCFCE7', color: '#166534' },
  CANCELLED: { label: 'Cancelled', bg: '#FEE2E2', color: '#991B1B' },
};

export function StatusPill({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <View style={{ backgroundColor: s.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
      <Text size={12} weight={600} color={s.color}>
        {s.label}
      </Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.slate200,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: fonts[400],
    backgroundColor: colors.white,
    color: colors.ink,
  },
  errorBanner: {
    backgroundColor: colors.errorBg,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    paddingTop: 14,
    paddingHorizontal: GUTTER,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 12,
  },
});
