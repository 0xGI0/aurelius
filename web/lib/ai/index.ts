import type { Quote, QuoteLang } from '../quotes';
import type { ExplainLang } from './prompt';
import { getAnthropicKey } from '../settings';
import { explainWithClaude } from './anthropic';
import { explainWithGemini } from './gemini';

export { ExplainError } from './errors';

export async function getExplainStream(
  quote: Quote,
  lang: QuoteLang,
  uiLang: ExplainLang = 'de',
): Promise<AsyncIterable<string>> {
  const key = await getAnthropicKey();
  if (key) return explainWithClaude(key, quote, lang, uiLang);
  return explainWithGemini(quote, lang, uiLang);
}
