import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { FlowScreen } from '@/components/FlowScreen';
import { Text } from '@/components/Text';
import { Input, Tappable } from '@/components/ui';
import { serviceModeOf, stepValid, useBookingFlow } from '@/lib/booking-flow';
import { BOOKING_DAYS, TIME_SLOTS, VEHICLES } from '@/lib/catalog';
import { addDays, dayOfMonth, formatSlot, isPast, todayKey, weekdayShort } from '@/lib/time';
import { colors } from '@/theme';

const TIME_TITLES = { HOME: 'Arrival window', PICKUP: 'Pickup time', DRIVE_IN: 'Drop-off time' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text size={16} weight={700}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function ScheduleStep() {
  const { draft, update } = useBookingFlow();
  const mode = serviceModeOf(draft) ?? 'HOME';
  const today = todayKey();
  const days = Array.from({ length: BOOKING_DAYS }, (_, i) => addDays(today, i));
  const day = days[draft.dayOffset];

  return (
    <FlowScreen
      step={3}
      title="Time & details"
      canContinue={stepValid.schedule(draft)}
      onContinue={() => router.push('/book/review')}
    >
      <View style={{ gap: 20 }}>
        <Section title="Date">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {days.map((key, i) => {
              const selected = draft.dayOffset === i;
              const fg = selected ? colors.white : colors.ink;
              return (
                <Tappable
                  key={key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() =>
                    // A time picked for another day may already be past today.
                    update({ dayOffset: i, time: draft.time && isPast(key, draft.time) ? null : draft.time })
                  }
                  style={{ width: 56, paddingVertical: 10, borderRadius: 14, alignItems: 'center', gap: 4, backgroundColor: selected ? colors.brand : colors.white }}
                >
                  <Text size={12} color={fg}>
                    {i === 0 ? 'Today' : weekdayShort(key)}
                  </Text>
                  <Text size={19} weight={700} color={fg}>
                    {dayOfMonth(key)}
                  </Text>
                </Tappable>
              );
            })}
          </ScrollView>
        </Section>

        <Section title={TIME_TITLES[mode]}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TIME_SLOTS.map((t) => {
              const selected = draft.time === t;
              const past = isPast(day, t);
              return (
                <Tappable
                  key={t}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled: past }}
                  disabled={past}
                  onPress={() => update({ time: t })}
                  style={{
                    width: '31.5%',
                    height: 42,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selected ? colors.brand : colors.white,
                    borderColor: selected ? colors.brand : colors.slate200,
                    opacity: past ? 0.4 : 1,
                  }}
                >
                  <Text size={14} weight={600} color={selected ? colors.white : colors.ink}>
                    {formatSlot(t)}
                  </Text>
                </Tappable>
              );
            })}
          </View>
        </Section>

        <Section title="Vehicle">
          <View style={{ flexDirection: 'row', gap: 6, padding: 4, backgroundColor: colors.slate200, borderRadius: 14 }}>
            {VEHICLES.map((v) => {
              const selected = draft.vehicleType === v.id;
              return (
                <Tappable
                  key={v.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => update({ vehicleType: v.id })}
                  style={{ flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.white : 'transparent' }}
                >
                  <Text size={13} weight={600} color={selected ? colors.ink : colors.slate500}>
                    {v.label}
                  </Text>
                </Tappable>
              );
            })}
          </View>
          <Input
            value={draft.licensePlate}
            onChangeText={(licensePlate) => update({ licensePlate: licensePlate.toUpperCase() })}
            placeholder="Plate number"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={12}
          />
        </Section>

        <Section title="Contact">
          <Input
            value={draft.customerName}
            onChangeText={(customerName) => update({ customerName })}
            placeholder="Your name"
            autoComplete="name"
            textContentType="name"
            maxLength={80}
          />
          <Input
            value={draft.phone}
            onChangeText={(phone) => update({ phone })}
            placeholder="Phone number"
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={20}
          />
          <Text size={12} color={colors.slate500}>
            Used only to reach you about this booking. No account is created.
          </Text>
        </Section>
      </View>
    </FlowScreen>
  );
}
