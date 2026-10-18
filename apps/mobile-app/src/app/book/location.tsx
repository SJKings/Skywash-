import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Building2, Info, LocateFixed } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { FlowScreen } from '@/components/FlowScreen';
import { Text } from '@/components/Text';
import { Button, ErrorBanner, Field, Input, Tappable } from '@/components/ui';
import { serviceModeOf, stepValid, useBookingFlow } from '@/lib/booking-flow';
import { CENTERS } from '@/lib/catalog';
import { colors } from '@/theme';

function formatAddress(a: Location.LocationGeocodedAddress) {
  const street = [a.streetNumber, a.street].filter(Boolean).join(' ') || a.name;
  return [street, a.city, [a.region, a.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

function AddressForm() {
  const { draft, update } = useBookingFlow();
  const pickup = serviceModeOf(draft) === 'PICKUP';
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function useCurrentLocation() {
    setError(null);
    setLocating(true);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setError('Location permission was denied. Type your address instead.');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync(coords);
      update({
        latitude: coords.latitude,
        longitude: coords.longitude,
        ...(place ? { address: formatAddress(place) } : {}),
      });
      if (!place) setError("We found you but couldn't look up the street address. Please type it in.");
    } catch {
      setError("Couldn't get your location. Type your address instead.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <>
      <Text size={23} weight={800}>
        {pickup ? 'Where should we pick up your car?' : 'Where should we come?'}
      </Text>
      <Button
        variant="soft"
        icon={LocateFixed}
        label={locating ? 'Finding your location…' : 'Use my current location'}
        height={46}
        disabled={locating}
        onPress={useCurrentLocation}
      />
      {error && <ErrorBanner message={error} />}
      <Field label="Address">
        <Input
          value={draft.address}
          // Typing replaces any GPS position: it may no longer match.
          onChangeText={(address) => update({ address, latitude: undefined, longitude: undefined })}
          placeholder="Street, number, city"
          autoComplete="street-address"
          textContentType="fullStreetAddress"
        />
      </Field>
      <Field label="Directions for our team (optional)">
        <Input
          value={draft.notes}
          onChangeText={(notes) => update({ notes })}
          placeholder="Gate code, parking spot, where keys are"
        />
      </Field>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Info size={15} color={colors.slate500} style={{ marginTop: 2 }} />
        <Text size={13} color={colors.slate500} lineHeight={1.45} style={{ flex: 1 }}>
          {pickup
            ? 'We return the car to this same address when the wash is done.'
            : 'Make sure there is room for our van next to the car.'}
        </Text>
      </View>
    </>
  );
}

function CenterList() {
  const { draft, update } = useBookingFlow();
  return (
    <>
      <Text size={23} weight={800}>
        Choose a center
      </Text>
      {CENTERS.map((c) => {
        const selected = draft.centerId === c.id;
        return (
          <Tappable
            key={c.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => update({ centerId: c.id })}
            style={{
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              padding: 12,
              borderRadius: 18,
              backgroundColor: colors.white,
              borderWidth: 2,
              borderColor: selected ? colors.brand : colors.slate200,
            }}
          >
            <View style={{ width: 64, height: 64, borderRadius: 14, backgroundColor: colors.sky100, alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={32} color={colors.brandIcon} strokeWidth={1.75} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text weight={700}>{c.name}</Text>
              <Text size={13} color={colors.slate500}>
                {c.address}
              </Text>
              <Text size={12} weight={600} color={colors.brandText}>
                Open {c.hours}
              </Text>
            </View>
          </Tappable>
        );
      })}
    </>
  );
}

export default function LocationStep() {
  const { draft } = useBookingFlow();
  const driveIn = serviceModeOf(draft) === 'DRIVE_IN';
  return (
    <FlowScreen
      step={2}
      title={driveIn ? 'Center' : 'Location'}
      canContinue={stepValid.location(draft)}
      onContinue={() => router.push('/book/schedule')}
    >
      {driveIn ? <CenterList /> : <AddressForm />}
    </FlowScreen>
  );
}
