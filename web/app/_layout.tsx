import { Stack } from 'expo-router';
import { useFonts, CormorantGaramond_500Medium, CormorantGaramond_500Medium_Italic } from '@expo-google-fonts/cormorant-garamond';
import { GFSDidot_400Regular } from '@expo-google-fonts/gfs-didot';
import { ThemeProvider } from '../theme/ThemeContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    GFSDidot_400Regular,
  });
  if (!loaded) return null;
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
