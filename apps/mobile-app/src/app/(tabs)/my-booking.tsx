import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { ErrorBanner, StatusPill, Tappable, useStatusBar } from '@/components/ui';
import { findBooking, type BookingStatus, type PublicBooking, type ServiceMode } from '@/lib/api';
import { formatNaira, getCenter, getPackage, MODE_LABELS } from '@/lib/catalog';
import { getRecentCodes, normalizeCode } from '@/lib/recent-codes';
import { formatWhen } from '@/lib/time';
import { colors, fonts, GUTTER } from '@/theme';

// Stand-in for realtime updates: re-check an open booking while this screen is visible.
const REFRESH_MS = 15_000;

const STEP_INDEX: Partial<Record<BookingStatus, number>> = { PENDING: 0, APPROVED: 1, IN_PROGRESS: 2, COMPLETED: 3 };

function timelineLabels(mode: ServiceMode) {
  return [
    'Booking received',
    'Confirmed by our team',
    mode === 'PICKUP' ? 'Picked up · washing' : mode === 'HOME' ? 'Team on site · washing' : 'Washing',
    mode === 'PICKUP' ? 'Returned' : 'Done',
  ];
}

function Timeline({ booking }: { booking: PublicBooking }) {
  const current = STEP_INDEX[booking.status] ?? -1; // -1: cancelled
  const labels = timelineLabels(booking.serviceMode);
  return (
    <View>
      {labels.map((label, i) => {
        const done = i <= current;
        return (
          <View key={label} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 20, alignItems: 'center' }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: done ? colors.brand : colors.slate300, alignItems: 'center', justifyContent: 'center' }}>
                <Check size={12} color={colors.white} strokeWidth={3} />
              </View>
              {i < labels.length - 1 && (
                <View style={{ flex: 1, width: 2, minHeight: 14, backgroundColor: i < current ? colors.brand : colors.slate200 }} />
              )}
            </View>
            <Text
              size={14}
              weight={i === current ? 700 : 500}
              color={done ? colors.ink : colors.slate400}
              style={{ paddingBottom: 14 }}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function DetailRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text size={14} color={colors.slate500}>
        {label}
      </Text>
      <Text size={14} weight={accent ? 700 : 600} color={accent ? colors.brandText : colors.ink} style={{ flexShrink: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}

function BookingCard({ booking: b }: { booking: PublicBooking }) {
  const where =
    b.serviceMode === 'DRIVE_IN' ? (getCenter(b.centerId)?.name ?? 'Skywash center') : (b.address ?? '');
  return (
    <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 18, gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text size={20} weight={800} style={{ letterSpacing: 1.2 }}>
          {b.code}
        </Text>
        <StatusPill status={b.status} />
      </View>
      {b.status === 'CANCELLED' ? (
        <Text size={14} color={colors.slate600} lineHeight={1.45}>
          This booking was cancelled. Book again any time, or call us if you think this is a mistake.
        </Text>
      ) : (
        <Timeline booking={b} />
      )}
      <View style={{ height: 1, backgroundColor: colors.slate200 }} />
      <View style={{ gap: 10 }}>
        <DetailRow label="Service" value={getPackage(b.washType).name} />
        <DetailRow label="Type" value={MODE_LABELS[b.serviceMode]} />
        <DetailRow label="When" value={formatWhen(b.bookingDate)} />
        <DetailRow label={b.serviceMode === 'DRIVE_IN' ? 'Center' : b.serviceMode === 'PICKUP' ? 'Pickup from' : 'Address'} value={where} />
        <DetailRow label="Total" value={formatNaira(b.totalPrice)} accent />
      </View>
    </View>
  );
}

type Lookup =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'found'; booking: PublicBooking }
  | { state: 'notFound' }
  | { state: 'error' };

export default function MyBookingScreen() {
  useStatusBar('dark');
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ code?: string }>();
  const [input, setInput] = useState('');
  const [lookup, setLookup] = useState<Lookup>({ state: 'idle' });
  const [refreshing, setRefreshing] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const latestRequest = useRef(0);

  /** Fetches a booking and shows the result. Quiet fetches keep the last result on failure. */
  const fetchBooking = useCallback(async (code: string, opts?: { quiet?: boolean }) => {
    const request = ++latestRequest.current;
    try {
      const booking = await findBooking(code);
      if (request !== latestRequest.current) return;
      setLookup(booking ? { state: 'found', booking } : { state: 'notFound' });
    } catch {
      if (request !== latestRequest.current) return;
      if (!opts?.quiet) setLookup({ state: 'error' });
    }
  }, []);

  const search = useCallback(
    (raw: string, opts?: { quiet?: boolean }) => {
      const code = normalizeCode(raw);
      if (!code) return;
      if (!opts?.quiet) {
        setInput(code);
        setLookup({ state: 'loading' });
      }
      void fetchBooking(code, opts);
    },
    [fetchBooking],
  );

  // Arriving with ?code= (from Home or the confirmation screen) runs the lookup:
  // show it as loading right away, then fetch.
  const [handledParam, setHandledParam] = useState<string | undefined>(undefined);
  if (params.code !== handledParam) {
    setHandledParam(params.code);
    if (params.code && normalizeCode(params.code)) {
      setInput(normalizeCode(params.code));
      setLookup({ state: 'loading' });
    }
  }
  useEffect(() => {
    const code = params.code ? normalizeCode(params.code) : '';
    if (!code) return;
    const request = ++latestRequest.current;
    findBooking(code).then(
      (booking) => {
        if (request === latestRequest.current) setLookup(booking ? { state: 'found', booking } : { state: 'notFound' });
      },
      () => {
        if (request === latestRequest.current) setLookup({ state: 'error' });
      },
    );
  }, [params.code]);

  const foundCode = lookup.state === 'found' ? lookup.booking.code : null;
  const finished = lookup.state === 'found' && ['COMPLETED', 'CANCELLED'].includes(lookup.booking.status);

  useFocusEffect(
    useCallback(() => {
      getRecentCodes().then(setRecent);
      if (!foundCode || finished) return;
      void fetchBooking(foundCode, { quiet: true });
      const timer = setInterval(() => void fetchBooking(foundCode, { quiet: true }), REFRESH_MS);
      return () => clearInterval(timer);
    }, [foundCode, finished, fetchBooking]),
  );

  async function refresh() {
    if (!foundCode) return;
    setRefreshing(true);
    await fetchBooking(foundCode, { quiet: true });
    setRefreshing(false);
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: GUTTER, paddingBottom: 30, gap: 18 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={foundCode ? <RefreshControl refreshing={refreshing} onRefresh={refresh} /> : undefined}
    >
      <View style={{ gap: 6 }}>
        <Text size={26} weight={800}>
          Find my booking
        </Text>
        <Text size={14} color={colors.slate500} lineHeight={1.45}>
          Enter the code you received when you booked.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => search(input)}
          placeholder="SW-XXXX"
          placeholderTextColor={colors.slate400}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          style={{
            flex: 1,
            height: 52,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: colors.slate300,
            paddingHorizontal: 16,
            fontSize: 17,
            fontFamily: fonts[600],
            letterSpacing: 1.4,
            backgroundColor: colors.white,
            color: colors.ink,
          }}
        />
        <Tappable
          accessibilityRole="button"
          onPress={() => search(input)}
          style={{ height: 52, paddingHorizontal: 20, borderRadius: 14, backgroundColor: colors.brand, justifyContent: 'center' }}
        >
          <Text weight={600} color={colors.white}>
            Find
          </Text>
        </Tappable>
      </View>

      {lookup.state === 'loading' && <ActivityIndicator color={colors.brand} style={{ marginTop: 8 }} />}
      {lookup.state === 'notFound' && <ErrorBanner message="No booking found for that code. Check it and try again." />}
      {lookup.state === 'error' && <ErrorBanner message="Couldn't reach Skywash. Check your connection and try again." />}
      {lookup.state === 'found' && <BookingCard booking={lookup.booking} />}

      {recent.length > 0 && lookup.state !== 'found' && (
        <View style={{ gap: 10 }}>
          <Text size={14} weight={600} color={colors.slate700}>
            Booked on this phone
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {recent.map((code) => (
              <Tappable
                key={code}
                accessibilityRole="button"
                onPress={() => search(code)}
                style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.slate200 }}
              >
                <Text size={14} weight={700} style={{ letterSpacing: 0.8 }}>
                  {code}
                </Text>
              </Tappable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
