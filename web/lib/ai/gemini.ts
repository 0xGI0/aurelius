import { fetch as expoFetch } from 'expo/fetch';
import { Platform } from 'react-native';
import type { Quote, QuoteLang } from '../quotes';
import { formatReference } from '../quotes';
import { ExplainError } from './errors';

export const EXPLAIN_URL = process.env.EXPO_PUBLIC_EXPLAIN_URL ?? '/api/explain';

export async function* explainWithGemini(quote: Quote, lang: QuoteLang): AsyncIterable<string> {
  const f = (Platform.OS === 'web' ? globalThis.fetch : (expoFetch as unknown)) as typeof globalThis.fetch;
  let resp: Response;
  try {
    resp = await f(EXPLAIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: quote.texts[lang], reference: formatReference(quote) }),
    });
  } catch {
    throw new ExplainError('offline');
  }
  if (resp.status === 429) throw new ExplainError('rate_limited');
  if (!resp.ok) throw new ExplainError('server', String(resp.status));
  if (!resp.body) throw new ExplainError('server', 'kein Stream');
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}
