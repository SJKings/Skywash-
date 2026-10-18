import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Clock, MapPin, Share2 } from 'lucide-react-native';
import { ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PACKAGE_ICONS, packageFromSlug } from '@/components/PackageIcon';
import { Text } from '@/components/Text';
import { BottomBar, Button, Tappable, useStatusBar } from '@/components/ui';
import { useBookingFlow } from '@/lib/booking-flow';
import { formatNaira, getPackage } from '@/lib/catalog';
import { colors, GUTTER } from '@/theme';

function RoundButton({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Tappable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}
    >
      {children}
    </Tappable>
  );
}

export default function ServiceDetailScreen() {
  useStatusBar('dark');
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { start } = useBookingFlow();
  const washType = packageFromSlug(id ?? '');
  if (!washType) return <Redirect href="/" />;
  const pkg = getPackage(washType);
  const Icon = PACKAGE_ICONS[washType];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        <View style={{ height: 330, backgroundColor: colors.sky100, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
          <View style={{ width: 184, height: 184, borderRadius: 92, backgroundColor: colors.sky200, alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={96} color={colors.brandIcon} strokeWidth={1.6} />
          </View>
          <View style={{ position: 'absolute', top: insets.top + 8, left: GUTTER, right: GUTTER, flexDirection: 'row', justifyContent: 'space-between' }}>
            <RoundButton label="Back" onPress={() => router.back()}>
              <ArrowLeft size={20} color={colors.ink} />
            </RoundButton>
            <RoundButton
              label="Share"
              onPress={() => Share.share({ message: `${pkg.name} at Skywash — ${formatNaira(pkg.price)}, ${pkg.duration}. ${pkg.description}` })}
            >
              <Share2 size={18} color={colors.ink} />
            </RoundButton>
          </View>
        </View>

        <View style={{ padding: GUTTER, gap: 18 }}>
          <View style={{ alignSelf: 'flex-start', backgroundColor: colors.sky100, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text size={13} weight={600} color={colors.brandText}>
              Car washing
            </Text>
          </View>

          <View style={{ gap: 6 }}>
            <Text size={26} weight={800}>
              {pkg.name}
            </Text>
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Clock size={14} color={colors.slate500} />
                <Text size={14} color={colors.slate500}>
                  {pkg.duration}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <MapPin size={14} color={colors.slate500} />
                <Text size={14} color={colors.slate500}>
                  At home or at a center
                </Text>
              </View>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text size={16} weight={700}>
              About
            </Text>
            <Text size={14} color={colors.slate600} lineHeight={1.55}>
              {pkg.description}
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            <Text size={16} weight={700}>
              What&apos;s included
            </Text>
            {pkg.included.map((item) => (
              <View key={item} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.sky100, alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color={colors.brandIcon} strokeWidth={3} />
                </View>
                <Text size={14} color={colors.slate700} style={{ flex: 1 }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomBar>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View>
            <Text size={12} color={colors.slate500}>
              From
            </Text>
            <Text size={22} weight={800}>
              {formatNaira(pkg.price)}
            </Text>
          </View>
          <Button
            label="Book service now"
            style={{ flex: 1 }}
            onPress={() => {
              start(washType);
              router.push('/book/type');
            }}
          />
        </View>
      </BottomBar>
    </View>
  );
}
