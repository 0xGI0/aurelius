const mockStore = new Map<string, string>();
jest.mock('../storage', () => ({
  getItem: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  setItem: jest.fn(async (k: string, v: string) => void mockStore.set(k, v)),
  deleteItem: jest.fn(async (k: string) => void mockStore.delete(k)),
}));

import { migrateLegacyStorage } from '../storage-migration';

beforeEach(() => mockStore.clear());

describe('migrateLegacyStorage', () => {
  it('kopiert alte aurelius.*-Keys nach stoa.* und löscht die alten', async () => {
    mockStore.set('aurelius.favorites', '["m-1-1"]');
    mockStore.set('aurelius.theme', 'dark');
    await migrateLegacyStorage();
    expect(mockStore.get('stoa.favorites')).toBe('["m-1-1"]');
    expect(mockStore.get('stoa.theme')).toBe('dark');
    expect(mockStore.has('aurelius.favorites')).toBe(false);
  });

  it('überschreibt vorhandene stoa.*-Werte nicht', async () => {
    mockStore.set('aurelius.theme', 'dark');
    mockStore.set('stoa.theme', 'light');
    await migrateLegacyStorage();
    expect(mockStore.get('stoa.theme')).toBe('light');
  });

  it('ist ohne Alt-Daten ein No-op', async () => {
    await expect(migrateLegacyStorage()).resolves.toBeUndefined();
    expect(mockStore.size).toBe(0);
  });

  it('hebt Seneca-Kapitel-Favoriten auf den ersten Paragraphen (s-N → s-N-1)', async () => {
    mockStore.set('stoa.favorites', JSON.stringify(['s-4', '1-1', 'e-5', 's-20-3']));
    await migrateLegacyStorage();
    expect(JSON.parse(mockStore.get('stoa.favorites')!)).toEqual(['s-4-1', '1-1', 'e-5', 's-20-3']);
  });

  it('migriert Seneca-IDs auch aus alten aurelius-Keys in einem Zug', async () => {
    mockStore.set('aurelius.favorites', JSON.stringify(['s-7', '2-2']));
    await migrateLegacyStorage();
    expect(JSON.parse(mockStore.get('stoa.favorites')!)).toEqual(['s-7-1', '2-2']);
  });
});
