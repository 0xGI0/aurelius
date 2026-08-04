import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, resolveTheme, ThemeColors, ThemePref } from './tokens';
import { getThemePref, setThemePref } from '../lib/settings';

interface ThemeCtx {
  colors: ThemeColors;
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
}

const Ctx = createContext<ThemeCtx>({ colors: palettes.light, pref: 'system', setPref: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');

  useEffect(() => {
    getThemePref().then(setPrefState);
  }, []);

  const setPref = (p: ThemePref) => {
    setPrefState(p);
    void setThemePref(p);
  };

  const resolvedSystem = (system === 'unspecified' ? null : system) as 'light' | 'dark' | null;
  const colors = palettes[resolveTheme(pref, resolvedSystem)];
  return <Ctx.Provider value={{ colors, pref, setPref }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  return useContext(Ctx);
}
