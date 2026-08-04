const mockStore = new Map<string, string>();
jest.mock('../storage', () => ({
  getItem: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  setItem: jest.fn(async (k: string, v: string) => void mockStore.set(k, v)),
  deleteItem: jest.fn(async (k: string) => void mockStore.delete(k)),
}));

import { getFavorites, toggleFavorite } from '../settings';

beforeEach(() => mockStore.clear());

describe('favorites', () => {
  it('ist anfangs leer', async () => {
    expect(await getFavorites()).toEqual([]);
  });

  it('fügt per Toggle hinzu und persistiert', async () => {
    await toggleFavorite('4-7');
    await toggleFavorite('2-1');
    expect(await getFavorites()).toEqual(['4-7', '2-1']);
  });

  it('entfernt per zweitem Toggle', async () => {
    await toggleFavorite('4-7');
    const after = await toggleFavorite('4-7');
    expect(after).toEqual([]);
    expect(await getFavorites()).toEqual([]);
  });

  it('übersteht korrupte gespeicherte Daten', async () => {
    mockStore.set('aurelius.favorites', 'kein-json{');
    expect(await getFavorites()).toEqual([]);
    mockStore.set('aurelius.favorites', JSON.stringify([1, 'ok', null]));
    expect(await getFavorites()).toEqual(['ok']);
  });
});
