const mockStore = new Map<string, string>();
jest.mock('../storage', () => ({
  getItem: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  setItem: jest.fn(async (k: string, v: string) => void mockStore.set(k, v)),
  deleteItem: jest.fn(async (k: string) => void mockStore.delete(k)),
}));

import {
  getQuoteLang, setQuoteLang, getThemePref, setThemePref,
  getAnthropicKey, setAnthropicKey, deleteAnthropicKey,
} from '../settings';

beforeEach(() => mockStore.clear());

describe('settings', () => {
  it('liefert Defaults', async () => {
    expect(await getQuoteLang()).toBe('de');
    expect(await getThemePref()).toBe('system');
    expect(await getAnthropicKey()).toBeNull();
  });

  it('persistiert Werte', async () => {
    await setQuoteLang('grc');
    await setThemePref('dark');
    await setAnthropicKey('sk-ant-test');
    expect(await getQuoteLang()).toBe('grc');
    expect(await getThemePref()).toBe('dark');
    expect(await getAnthropicKey()).toBe('sk-ant-test');
  });

  it('ignoriert ungültige gespeicherte Werte (Default)', async () => {
    mockStore.set('aurelius.quoteLang', 'xx');
    expect(await getQuoteLang()).toBe('de');
  });

  it('löscht den Key', async () => {
    await setAnthropicKey('sk-ant-test');
    await deleteAnthropicKey();
    expect(await getAnthropicKey()).toBeNull();
  });
});
