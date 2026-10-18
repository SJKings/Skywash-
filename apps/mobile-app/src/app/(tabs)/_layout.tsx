import { router, Tabs } from 'expo-router';
import { CalendarPlus, House, Ticket, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/Text';
import { useBookingFlow } from '@/lib/booking-flow';
import { colors } from '@/theme';

const TAB_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: 'Home', icon: House },
  'my-booking': { label: 'My booking', icon: Ticket },
};

function TabItem({ label, icon: Icon, active, onPress }: { label: string; icon: LucideIcon; active: boolean; onPress: () => void }) {
  const color = active ? colors.brand : colors.slate400;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{ alignItems: 'center', gap: 4, minWidth: 64 }}
    >
      <Icon size={22} color={color} />
      <Text size={12} weight={600} color={color}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  const { draft, start } = useBookingFlow();

  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
      tabBar={({ state, navigateToTab, insets }) => {
        const tab = (name: string) => {
          const index = state.routes.findIndex((r) => r.name === name);
          const { label, icon } = TAB_ICONS[name];
          return (
            <TabItem
              label={label}
              icon={icon}
              active={state.index === index}
              onPress={() => navigateToTab(state.routes[index].key)}
            />
          );
        };
        return (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              backgroundColor: colors.white,
              borderTopWidth: 1,
              borderTopColor: colors.slate200,
              paddingTop: 10,
              paddingHorizontal: 20,
              paddingBottom: Math.max(insets.bottom, 12),
            }}
          >
            {tab('index')}
            {/* "Book" isn't a tab: it starts the booking flow for the selected package. */}
            <TabItem
              label="Book"
              icon={CalendarPlus}
              active={false}
              onPress={() => {
                start(draft.washType);
                router.push('/book/type');
              }}
            />
            {tab('my-booking')}
          </View>
        );
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="my-booking" />
    </Tabs>
  );
}
