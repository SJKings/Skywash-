import { router } from 'expo-router';
import { Calendar, Car, CarFront, House, MapPin, Sparkles, Truck, User, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { FlowScreen } from '@/components/FlowScreen';
import { Text } from '@/components/Text';
import { ErrorBanner } from '@/components/ui';
import { ApiError, createBooking } from '@/lib/api';
import { bookingDay, draftTotal, serviceModeOf, toNewBooking, useBookingFlow } from '@/lib/booking-flow';
import { FEE_LABELS, getCenter, getPackage, MODE_LABELS, SERVICE_FEES, VEHICLES } from '@/lib/catalog';
import { addRecentCode } from '@/lib/recent-codes';
import { formatDay, formatSlot } from '@/lib/time';
import { colors } from '@/theme';

const MODE_ICONS: Record<string, LucideIcon> = { HOME: House, PICKUP: Truck, DRIVE_IN: CarFront };

function SummaryRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.sky50, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={colors.brandIcon} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text size={12} color={colors.slate500}>
          {label}
        </Text>
        <Text size={14} weight={600} lineHeight={1.35}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function PriceRow({ label, amount }: { label: string; amount: number }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text size={14} color={colors.slate500}>
        {label}
      </Text>
      <Text size={14}>${amount}</Text>
    </View>
  );
}

/** A readable message for a failed booking request. */
function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const issue = (error.body as { issues?: { message?: string }[] } | undefined)?.issues?.[0]?.message;
    if (error.status === 400 && issue) return `Please check your details: ${issue}`;
    if (error.status === 429) return 'Too many bookings from this device. Please try again in a few minutes.';
    return "We couldn't place your booking. Please try again.";
  }
  return "Couldn't reach Skywash. Check your connection and try again.";
}

export default function ReviewStep() {
  const { draft, setConfirmed } = useBookingFlow();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = serviceModeOf(draft) ?? 'HOME';
  const pkg = getPackage(draft.washType);
  const center = getCenter(draft.centerId);
  const vehicle = VEHICLES.find((v) => v.id === draft.vehicleType)!.label;
  const when = `${formatDay(bookingDay(draft))}${draft.time ? ` · ${formatSlot(draft.time)}` : ''}`;

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking(toNewBooking(draft));
      await addRecentCode(booking.code);
      setConfirmed(booking);
      // Leave the flow: Back from the confirmation shouldn't reopen these steps.
      router.dismissAll();
      router.push('/confirmed');
    } catch (e) {
      setError(errorMessage(e));
      setSubmitting(false);
    }
  }

  return (
    <FlowScreen
      step={4}
      title="Review"
      ctaLabel="Confirm booking"
      canContinue
      submitting={submitting}
      onContinue={confirm}
    >
      <Text size={23} weight={800}>
        Review your booking
      </Text>
      {error && <ErrorBanner message={error} />}
      <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 16, gap: 14 }}>
        <SummaryRow icon={Sparkles} label="Service" value={`${pkg.name} · ${pkg.duration}`} />
        <SummaryRow icon={MODE_ICONS[mode]} label="Type" value={MODE_LABELS[mode]} />
        <SummaryRow
          icon={MapPin}
          label={mode === 'DRIVE_IN' ? 'Center' : mode === 'PICKUP' ? 'Pickup & return address' : 'Address'}
          value={mode === 'DRIVE_IN' ? (center ? `${center.name}, ${center.address}` : '') : draft.address.trim()}
        />
        <SummaryRow icon={Calendar} label="When" value={when} />
        <SummaryRow icon={Car} label="Vehicle" value={`${vehicle} · ${draft.licensePlate.trim().toUpperCase()}`} />
        <SummaryRow icon={User} label="Contact" value={`${draft.customerName.trim()} · ${draft.phone.trim()}`} />
      </View>
      <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 16, gap: 10 }}>
        <PriceRow label={pkg.name} amount={pkg.price} />
        <PriceRow label={FEE_LABELS[mode]} amount={SERVICE_FEES[mode]} />
        <View style={{ height: 1, backgroundColor: colors.slate200 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text size={17} weight={800}>
            Total
          </Text>
          <Text size={17} weight={800} color={colors.brandText}>
            ${draftTotal(draft)}
          </Text>
        </View>
        <Text size={12} color={colors.slate500}>
          Pay on completion. Cash or card.
        </Text>
      </View>
    </FlowScreen>
  );
}
