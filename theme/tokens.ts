export interface ThemeColors {
  bg: string;
  card: string;
  text: string;
  textSoft: string;
  accent: string;
  border: string;
}

export const palettes: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    bg: '#F4EEE1',      // Elfenbein
    card: '#FBF7ED',
    text: '#1B2531',     // Tinte
    textSoft: '#5A6575',
    accent: '#A6763C',   // Bronze
    border: '#E2D9C6',
  },
  dark: {
    bg: '#0F151D',       // tiefes Tintenblau
    card: '#161F2A',
    text: '#EAE2D2',
    textSoft: '#9AA3B0',
    accent: '#C9A264',   // helle Bronze
    border: '#26303D',
  },
};

export type ThemePref = 'light' | 'dark' | 'system';

export function resolveTheme(pref: ThemePref, system: 'light' | 'dark' | null | undefined): 'light' | 'dark' {
  if (pref === 'system') return system ?? 'light';
  return pref;
}

export const fonts = {
  quote: 'CormorantGaramond_500Medium',
  quoteItalic: 'CormorantGaramond_500Medium_Italic',
  greek: 'GFSDidot_400Regular',
};
