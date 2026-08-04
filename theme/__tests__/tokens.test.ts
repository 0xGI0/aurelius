import { resolveTheme, palettes } from '../tokens';

describe('resolveTheme', () => {
  it('folgt der expliziten Präferenz', () => {
    expect(resolveTheme('light', 'dark')).toBe('light');
    expect(resolveTheme('dark', 'light')).toBe('dark');
  });
  it('folgt bei system dem OS, Fallback light', () => {
    expect(resolveTheme('system', 'dark')).toBe('dark');
    expect(resolveTheme('system', null)).toBe('light');
  });
});

describe('palettes', () => {
  it('definiert beide Paletten vollständig', () => {
    for (const p of [palettes.light, palettes.dark]) {
      for (const v of Object.values(p)) expect(v).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
