const mockStore = new Map<string, string>();
jest.mock('../storage', () => ({
  getItem: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  setItem: jest.fn(async (k: string, v: string) => void mockStore.set(k, v)),
  deleteItem: jest.fn(async (k: string) => void mockStore.delete(k)),
}));

import {
  ApiError, login, logout, getServerFavorites, getToken, getSessionEmail,
} from '../api';

const fetchMock = jest.fn();
(globalThis as { fetch: unknown }).fetch = fetchMock;

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  mockStore.clear();
  fetchMock.mockReset();
});

describe('api', () => {
  it('login speichert Token und E-Mail', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { key: 'tok123' }));
    await login('marc@example.com', 'pw');
    expect(await getToken()).toBe('tok123');
    expect(await getSessionEmail()).toBe('marc@example.com');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/auth/login/');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('setzt Authorization-Header wenn Token vorhanden', async () => {
    mockStore.set('aurelius.token', 'tok123');
    fetchMock.mockResolvedValueOnce(jsonResponse(200, []));
    await getServerFavorites();
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Token tok123');
  });

  it('server-favoriten kommen chronologisch (Server liefert neueste zuerst)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, [
      { quote_id: '2-1', created_at: 'b' },
      { quote_id: '4-7', created_at: 'a' },
    ]));
    expect(await getServerFavorites()).toEqual(['4-7', '2-1']);
  });

  it('400 wird zu validation mit Feldtext', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(400, { email: ['Enter a valid email address.'] }));
    await expect(login('kaputt', 'pw')).rejects.toMatchObject({
      kind: 'validation',
      detail: expect.stringContaining('valid email'),
    });
  });

  it('401 wird zu unauthorized und beendet die Session', async () => {
    mockStore.set('aurelius.token', 'alt');
    mockStore.set('aurelius.email', 'marc@example.com');
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { detail: 'nope' }));
    await expect(getServerFavorites()).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(await getToken()).toBeNull();
  });

  it('netzfehler wird zu offline', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(login('marc@example.com', 'pw')).rejects.toMatchObject({ kind: 'offline' });
  });

  it('logout beendet die Session auch wenn der Server nicht erreichbar ist', async () => {
    mockStore.set('aurelius.token', 'tok');
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await logout();
    expect(await getToken()).toBeNull();
  });
});
