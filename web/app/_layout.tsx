import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Fraunces_500Medium, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { GFSDidot_400Regular } from '@expo-google-fonts/gfs-didot';
import { ThemeProvider } from '../theme/ThemeContext';
import { initUiLang } from '../lib/i18n';

export default function RootLayout() {
  const [loaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    GFSDidot_400Regular,
  });

  useEffect(() => {
    void initUiLang();
  }, []);
  if (!loaded) return null;
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="book/[book]" />
        <Stack.Screen name="read/[id]" />
      </Stack>
    </ThemeProvider>
  );
}
