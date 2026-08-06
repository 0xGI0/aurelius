import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Fraunces_500Medium, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { GFSDidot_400Regular } from '@expo-google-fonts/gfs-didot';
import { ThemeProvider } from '../theme/ThemeContext';
import { flushQueue } from '../lib/favorites';
import { initUiLang } from '../lib/i18n';
import { migrateLegacyStorage } from '../lib/storage-migration';

export default function RootLayout() {
  const [loaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    GFSDidot_400Regular,
  });
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    // Aurelius→Stoa-Keys migrieren, bevor irgendetwas den Storage liest
    migrateLegacyStorage()
      .catch(() => undefined)
      .finally(() => {
        setStorageReady(true);
        void initUiLang();
        // Offline-Queue der Favoriten nachholen (Spec §6)
        void flushQueue().catch(() => undefined);
      });
  }, []);
  if (!loaded || !storageReady) return null;
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
