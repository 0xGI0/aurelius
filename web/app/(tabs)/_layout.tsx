import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palettes } from '../../theme/tokens';
import { useT, type StringKey } from '../../lib/i18n';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Die Tab-Bar ist bewusst in BEIDEN Themes tintenfarben (Marken-Element):
// Beim statischen Web-Export erreichen Theme-Context-Updates die Layout-Route
// nicht zuverlässig — feste Werte machen die Bar davon unabhängig. Die Labels
// kommen aus dem i18n-Store (useSyncExternalStore) und aktualisieren dadurch
// unabhängig von der Context-Propagation.
const BAR = {
  bg: palettes.dark.card,
  border: palettes.dark.border,
  active: palettes.dark.accent,
  inactive: palettes.dark.textSoft,
};

function TabLabel({ labelKey, focused }: { labelKey: StringKey; focused: boolean }) {
  const t = useT();
  return (
    <Text style={{ fontSize: 11, color: focused ? BAR.active : BAR.inactive }}>{t(labelKey)}</Text>
  );
}

function tab(name: IconName, labelKey: StringKey) {
  return {
    tabBarIcon: ({ focused }: { focused: boolean }) => (
      <Ionicons name={name} size={20} color={focused ? BAR.active : BAR.inactive} />
    ),
    tabBarLabel: ({ focused }: { focused: boolean }) => (
      <TabLabel labelKey={labelKey} focused={focused} />
    ),
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BAR.active,
        tabBarInactiveTintColor: BAR.inactive,
        tabBarStyle: { backgroundColor: BAR.bg, borderTopColor: BAR.border },
      }}
    >
      <Tabs.Screen name="index" options={tab('book-outline', 'tabQuote')} />
      <Tabs.Screen name="books" options={tab('library-outline', 'tabBooks')} />
      <Tabs.Screen name="favorites" options={tab('star-outline', 'tabFavorites')} />
      <Tabs.Screen name="aurel" options={tab('medal-outline', 'tabAurel')} />
      <Tabs.Screen name="stoa" options={tab('business-outline', 'tabStoa')} />
      {/* Lese-/Buch-Ansicht: kein eigener Tab, aber innerhalb des Navigators,
          damit die Tab-Bar sichtbar bleibt (Owner-Wunsch 2026-08-06) */}
      <Tabs.Screen name="book/[book]" options={{ href: null }} />
      <Tabs.Screen name="read/[id]" options={{ href: null }} />
    </Tabs>
  );
}
