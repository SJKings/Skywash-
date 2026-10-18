import * as Clipboard from 'expo-clipboard';
import { Redirect, router } from 'expo-router';
import { Check, Copy } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Button, useStatusBar } from '@/components/ui';
import { useBookingFlow } from '@/lib/booking-flow';
import { getPackage, MODE_LABELS } from '@/lib/catalog';
import { formatWhen } from '@/lib/time';
import { colors } from '@/theme';

export default function ConfirmedScreen() {
  useStatusBar('light');
  const insets = useSafeAreaInsets();
  const { confirmed: booking } = useBookingFlow();
  const [copied, setCopied] = useState(false);

  if (!booking) return <Redirect href="/" />;

  return (
    <ScrollView
      style={{ backgroundColor: colors.brand }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top + 40,
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 24,
        gap: 22,
      }}
    >
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
        <Check size={30} color={colors.brand} strokeWidth={3} />
      </View>
      <View style={{ gap: 8 }}>
        <Text size={30} weight={800} color={colors.white} style={{ lineHeight: 33 }}>
          Booking received
        </Text>
        <Text size={15} color={colors.sky100} lineHeight={1.5}>
          Save this code. It&apos;s the only way to find your booking.
        </Text>
      </View>

      <View style={{ backgroundColor: colors.white, borderRadius: 22, padding: 20, gap: 14 }}>
        <Text size={13} color={colors.slate500}>
          Your booking code
        </Text>
        <Text size={40} weight={800} style={{ letterSpacing: 4 }} selectable>
          {booking.code}
        </Text>
        <Button
          variant="soft"
          icon={Copy}
          label={copied ? 'Copied' : 'Copy code'}
          height={46}
          onPress={async () => {
            await Clipboard.setStringAsync(booking.code);
            setCopied(true);
          }}
        />
        <View style={{ height: 1, backgroundColor: colors.slate200 }} />
        <View style={{ gap: 6 }}>
          <Text size={14} weight={600}>
            {getPackage(booking.washType).name} · {MODE_LABELS[booking.serviceMode]}
          </Text>
          <Text size={14} color={colors.slate500}>
            {formatWhen(booking.bookingDate)}
          </Text>
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 'auto' }}>
        <Button
          variant="dark"
          label="Track this booking"
          onPress={() => router.dismissTo({ pathname: '/my-booking', params: { code: booking.code } })}
        />
        <Button variant="outlineLight" label="Back to home" onPress={() => router.dismissTo('/')} />
      </View>
    </ScrollView>
  );
}
