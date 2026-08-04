import type { Quote, QuoteLang } from '../quotes';
import { getAnthropicKey } from '../settings';
import { explainWithClaude } from './anthropic';
import { explainWithGemini } from './gemini';

export { ExplainError } from './errors';

export async function getExplainStream(quote: Quote, lang: QuoteLang): Promise<AsyncIterable<string>> {
  const key = await getAnthropicKey();
  if (key) return explainWithClaude(key, quote, lang);
  return explainWithGemini(quote, lang);
}
