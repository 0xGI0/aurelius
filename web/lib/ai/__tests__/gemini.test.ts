const mockFetch = jest.fn();
jest.mock('expo/fetch', () => ({ fetch: (...a: unknown[]) => mockFetch(...a) }));

import { explainWithGemini } from '../gemini';
import { ExplainError } from '../errors';

const quote = { id: '1-1', book: 1, section: 1, texts: { de: 'x', en: 'y', grc: 'z' } };

async function caught(): Promise<unknown> {
  try {
    for await (const _ of explainWithGemini(quote, 'de')) { /* verbrauchen */ }
    return null;
  } catch (e) {
    return e;
  }
}

describe('explainWithGemini Fehlerpfade', () => {
  it('Netzfehler → offline', async () => {
    mockFetch.mockRejectedValueOnce(new Error('net down'));
    const e = await caught();
    expect(e).toBeInstanceOf(ExplainError);
    expect((e as ExplainError).kind).toBe('offline');
  });
  it('429 → rate_limited', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    expect(((await caught()) as ExplainError).kind).toBe('rate_limited');
  });
  it('500 → server', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    expect(((await caught()) as ExplainError).kind).toBe('server');
  });
  it('Verbindungsabbruch während des Streamens → offline', async () => {
    const read = jest
      .fn()
      .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('teil') })
      .mockRejectedValueOnce(new Error('connection reset'));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: { getReader: () => ({ read }) },
    });
    const e = await caught();
    expect(e).toBeInstanceOf(ExplainError);
    expect((e as ExplainError).kind).toBe('offline');
  });
});
