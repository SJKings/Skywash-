import { router } from 'expo-router';
import { Bell, ChevronDown, Clock, MapPin, Search, SlidersHorizontal, Sparkles, Star, Ticket } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PACKAGE_ICONS, packageSlug } from '@/components/PackageIcon';
import { Text } from '@/components/Text';
import { Tappable, useStatusBar } from '@/components/ui';
import type { WashType } from '@/lib/api';
import { useBookingFlow } from '@/lib/booking-flow';
import { PACKAGES } from '@/lib/catalog';
import { colors, fonts, GUTTER } from '@/theme';

export default function HomeScreen() {
  useStatusBar('light');
  const insets = useSafeAreaInsets();
  const { update } = useBookingFlow();
  const [lookup, setLookup] = useState('');
  const [query, setQuery] = useState('');

  const openPackage = (id: WashType) => {
    update({ washType: id });
    router.push(`/service/${packageSlug(id)}`);
  };

  const findBooking = () => {
    if (lookup.trim()) router.navigate({ pathname: '/my-booking', params: { code: lookup.trim() } });
  };

  const q = query.trim().toLowerCase();
  const packages = q ? PACKAGES.filter((p) => p.name.toLowerCase().includes(q)) : PACKAGES;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.brand,
          paddingTop: insets.top + 16,
          paddingHorizontal: GUTTER,
          paddingBottom: 26,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          gap: 18,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 4 }}>
            <Text size={13} color={colors.sky100}>
              Location
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MapPin size={17} color={colors.white} />
              <Text size={17} weight={600} color={colors.white}>
                San Diego, CA
              </Text>
              <ChevronDown size={14} color={colors.white} />
            </View>
          </View>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} color={colors.white} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, height: 48, borderRadius: 14, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 }}>
            <Search size={18} color={colors.slate400} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search services"
              placeholderTextColor={colors.slate400}
              returnKeyType="search"
              style={{ flex: 1, fontFamily: fonts[400], fontSize: 15, color: colors.ink, height: '100%' }}
            />
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
            <SlidersHorizontal size={18} color={colors.brandIcon} />
          </View>
        </View>
      </View>

      <View style={{ padding: GUTTER, gap: 26 }}>
        {/* Already booked? */}
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: 20,
            padding: 16,
            gap: 12,
            shadowColor: colors.brand,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ticket size={17} color={colors.brand} />
            <Text weight={700}>Already booked?</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={lookup}
              onChangeText={setLookup}
              onSubmitEditing={findBooking}
              placeholder="Enter booking code"
              placeholderTextColor={colors.slate400}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: colors.slate200,
                paddingHorizontal: 14,
                fontSize: 15,
                letterSpacing: 0.6,
                fontFamily: fonts[400],
                backgroundColor: colors.inputBg,
                color: colors.ink,
              }}
            />
            <Tappable
              accessibilityRole="button"
              onPress={findBooking}
              style={{ height: 46, paddingHorizontal: 18, borderRadius: 12, backgroundColor: colors.ink, justifyContent: 'center' }}
            >
              <Text weight={600} color={colors.white}>
                Find
              </Text>
            </Tappable>
          </View>
        </View>

        {/* Special for you */}
        <View style={{ gap: 12 }}>
          <Text size={19} weight={700}>
            Special for you
          </Text>
          <View style={{ height: 160, borderRadius: 20, backgroundColor: colors.ink, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '48%', backgroundColor: colors.slate800, alignItems: 'center', justifyContent: 'center', paddingBottom: 30 }}>
              <Sparkles size={76} color={colors.brand} strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
              <View style={{ alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text size={11} weight={600}>
                  Limited time
                </Text>
              </View>
              <View style={{ gap: 2 }}>
                <Text size={18} weight={700} color={colors.white}>
                  First wash
                </Text>
                <Text size={40} weight={800} color={colors.white} style={{ lineHeight: 42 }}>
                  20% off
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text size={11} color={colors.slate400}>
                  All services · Home or center
                </Text>
                <Tappable
                  accessibilityRole="button"
                  onPress={() => openPackage('FULL_DETAIL')}
                  style={{ backgroundColor: colors.brand, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}
                >
                  <Text size={13} weight={600} color={colors.white}>
                    Claim
                  </Text>
                </Tappable>
              </View>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={{ gap: 14 }}>
          <Text size={19} weight={700}>
            Services
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {PACKAGES.map((p) => {
              const Icon = PACKAGE_ICONS[p.id];
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={p.name}
                  onPress={() => openPackage(p.id)}
                  style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 8, opacity: pressed ? 0.7 : 1 })}
                >
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.sky100, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={26} color={colors.brandIcon} />
                  </View>
                  <Text size={12} color={colors.slate700}>
                    {p.short}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Popular packages */}
        <View style={{ gap: 12 }}>
          <Text size={19} weight={700}>
            Popular packages
          </Text>
          {packages.length === 0 && (
            <Text size={14} color={colors.slate500}>
              No services match “{query.trim()}”.
            </Text>
          )}
          {packages.map((p) => {
            const Icon = PACKAGE_ICONS[p.id];
            return (
              <Tappable
                key={p.id}
                accessibilityRole="button"
                onPress={() => openPackage(p.id)}
                style={{ flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: colors.white, borderRadius: 18, padding: 10 }}
              >
                <View style={{ width: 76, height: 76, borderRadius: 14, backgroundColor: colors.sky100, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={38} color={colors.brandIcon} strokeWidth={1.75} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text weight={700}>{p.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Star size={13} color={colors.star} fill={colors.star} />
                      <Text size={13} color={colors.slate500}>
                        {p.rating}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} color={colors.slate500} />
                      <Text size={13} color={colors.slate500}>
                        {p.duration}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text size={16} weight={700} color={colors.brandText} style={{ paddingRight: 6 }}>
                  ${p.price}
                </Text>
              </Tappable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
