const mockStore = new Map<string, string>();
jest.mock('../storage', () => ({
  getItem: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  setItem: jest.fn(async (k: string, v: string) => void mockStore.set(k, v)),
  deleteItem: jest.fn(async (k: string) => void mockStore.delete(k)),
}));

jest.mock('../api', () => {
  const actual = jest.requireActual('../api');
  return {
    ...actual,
    getToken: jest.fn(),
    putFavorite: jest.fn(),
    deleteFavorite: jest.fn(),
    getServerFavorites: jest.fn(),
  };
});

import { ApiError, deleteFavorite, getServerFavorites, getToken, putFavorite } from '../api';
import { flushQueue, getFavorites, onLogin, toggleFavorite } from '../favorites';

const mGetToken = jest.mocked(getToken);
const mPut = jest.mocked(putFavorite);
const mDelete = jest.mocked(deleteFavorite);
const mServerFavs = jest.mocked(getServerFavorites);

const queue = () => JSON.parse(mockStore.get('aurelius.pendingOps') ?? '[]');

beforeEach(() => {
  mockStore.clear();
  jest.clearAllMocks();
  mGetToken.mockResolvedValue(null);
  mPut.mockResolvedValue(undefined);
  mDelete.mockResolvedValue(undefined);
});

describe('favorites sync', () => {
  it('ohne Session rein lokal (Parität zu heute)', async () => {
    expect(await toggleFavorite('4-7')).toEqual(['4-7']);
    expect(mPut).not.toHaveBeenCalled();
    expect(queue()).toEqual([]);
  });

  it('mit Session wird sofort gesynct', async () => {
    mGetToken.mockResolvedValue('tok');
    await toggleFavorite('4-7');
    expect(mPut).toHaveBeenCalledWith('4-7');
    await toggleFavorite('4-7');
    expect(mDelete).toHaveBeenCalledWith('4-7');
    expect(queue()).toEqual([]);
  });

  it('offline landet der Toggle in der Queue, lokal bleibt er', async () => {
    mGetToken.mockResolvedValue('tok');
    mPut.mockRejectedValue(new ApiError('offline'));
    await toggleFavorite('4-7');
    expect(await getFavorites()).toEqual(['4-7']);
    expect(queue()).toEqual([{ quoteId: '4-7', op: 'add' }]);
  });

  it('flushQueue arbeitet ab und leert', async () => {
    mGetToken.mockResolvedValue('tok');
    mockStore.set('aurelius.pendingOps', JSON.stringify([
      { quoteId: '4-7', op: 'add' },
      { quoteId: '2-1', op: 'remove' },
    ]));
    await flushQueue();
    expect(mPut).toHaveBeenCalledWith('4-7');
    expect(mDelete).toHaveBeenCalledWith('2-1');
    expect(queue()).toEqual([]);
  });

  it('flushQueue behält den Rest bei Fehlern', async () => {
    mGetToken.mockResolvedValue('tok');
    mPut.mockRejectedValue(new ApiError('offline'));
    mockStore.set('aurelius.pendingOps', JSON.stringify([
      { quoteId: '4-7', op: 'add' },
      { quoteId: '2-1', op: 'remove' },
    ]));
    await flushQueue();
    expect(queue()).toHaveLength(2);
  });

  it('onLogin vereinigt lokal und Server', async () => {
    mGetToken.mockResolvedValue('tok');
    mockStore.set('aurelius.favorites', JSON.stringify(['4-7', '2-1']));
    mServerFavs.mockResolvedValue(['4-7', '2-1', '9-1']);
    await onLogin();
    expect(mPut).toHaveBeenCalledWith('4-7');
    expect(mPut).toHaveBeenCalledWith('2-1');
    expect(await getFavorites()).toEqual(['4-7', '2-1', '9-1']);
  });

  it('401 beim Toggle: keine Queue, lokal bleibt', async () => {
    mGetToken.mockResolvedValue('tok');
    mPut.mockRejectedValue(new ApiError('unauthorized'));
    await toggleFavorite('4-7');
    expect(await getFavorites()).toEqual(['4-7']);
    expect(queue()).toEqual([]);
  });
});
