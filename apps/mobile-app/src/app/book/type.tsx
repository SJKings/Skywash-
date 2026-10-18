import { router } from 'expo-router';
import { Building2, CarFront, House, Truck, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { FlowScreen } from '@/components/FlowScreen';
import { Text } from '@/components/Text';
import { IconTile, Tappable } from '@/components/ui';
import { stepValid, useBookingFlow, type CenterTransport, type Place } from '@/lib/booking-flow';
import { colors } from '@/theme';

function PlaceCard({
  icon,
  title,
  fee,
  description,
  selected,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  fee?: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Tappable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        gap: 14,
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 18,
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: selected ? colors.brand : colors.slate200,
      }}
    >
      <IconTile icon={icon} />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text size={16} weight={700}>
            {title}
          </Text>
          {fee && (
            <Text size={13} weight={600} color={colors.brandText}>
              {fee}
            </Text>
          )}
        </View>
        <Text size={13} color={colors.slate500} lineHeight={1.45}>
          {description}
        </Text>
      </View>
    </Tappable>
  );
}

function TransportTile({
  icon: Icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Tappable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        flex: 1,
        padding: 14,
        borderRadius: 16,
        gap: 8,
        backgroundColor: selected ? colors.sky50 : colors.white,
        borderWidth: 2,
        borderColor: selected ? colors.brand : colors.slate200,
      }}
    >
      <Icon size={22} color={colors.brandIcon} />
      <Text weight={700}>{title}</Text>
      <Text size={12} color={colors.slate500} lineHeight={1.4}>
        {description}
      </Text>
    </Tappable>
  );
}

export default function ServiceTypeStep() {
  const { draft, update } = useBookingFlow();
  const pickPlace = (place: Place) => update({ place });
  const pickTransport = (transport: CenterTransport) => update({ transport });

  return (
    <FlowScreen
      step={1}
      title="Service type"
      canContinue={stepValid.type(draft)}
      onContinue={() => router.push('/book/location')}
    >
      <Text size={23} weight={800}>
        Where should we wash your car?
      </Text>
      <PlaceCard
        icon={House}
        title="Home service"
        fee="+$10"
        description="Our team comes to your home or office with water and power."
        selected={draft.place === 'HOME'}
        onPress={() => pickPlace('HOME')}
      />
      <PlaceCard
        icon={Building2}
        title="Car center"
        description="Washed at one of our centers. We can collect it, or you drive in."
        selected={draft.place === 'CENTER'}
        onPress={() => pickPlace('CENTER')}
      />
      {draft.place === 'CENTER' && (
        <View style={{ gap: 10, paddingTop: 8 }}>
          <Text size={16} weight={700}>
            How does your car get there?
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TransportTile
              icon={Truck}
              title="Pickup & return"
              description="We collect and bring it back. +$15"
              selected={draft.transport === 'PICKUP'}
              onPress={() => pickTransport('PICKUP')}
            />
            <TransportTile
              icon={CarFront}
              title="I'll drive in"
              description="Bring it to a center at your time."
              selected={draft.transport === 'DRIVE_IN'}
              onPress={() => pickTransport('DRIVE_IN')}
            />
          </View>
        </View>
      )}
    </FlowScreen>
  );
}
