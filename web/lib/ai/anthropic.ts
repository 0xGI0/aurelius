import Anthropic from '@anthropic-ai/sdk';
import { fetch as expoFetch } from 'expo/fetch';
import { Platform } from 'react-native';
import type { Quote, QuoteLang } from '../quotes';
import { formatReference } from '../quotes';
import { buildExplainPrompt, explainSystem, type ExplainLang } from './prompt';
import { ExplainError } from './errors';

export async function* explainWithClaude(
  apiKey: string,
  quote: Quote,
  lang: QuoteLang,
  uiLang: ExplainLang = 'de',
): AsyncIterable<string> {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
    // RN-fetch kann keine Streams; expo/fetch ist WinterCG-konform.
    fetch: (Platform.OS === 'web' ? globalThis.fetch : (expoFetch as unknown)) as typeof globalThis.fetch,
  });
  try {
    const stream = client.messages.stream({
      model: 'claude-opus-5',
      max_tokens: 1024,
      system: explainSystem(uiLang),
      messages: [
        {
          role: 'user',
          content: buildExplainPrompt(
            quote.texts[lang],
            formatReference(quote, uiLang === 'en' ? 'Book' : 'Buch'),
            uiLang,
          ),
        },
      ],
    });
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  } catch (err) {
    if (err instanceof Anthropic.APIConnectionError) throw new ExplainError('offline');
    if (err instanceof Anthropic.AuthenticationError) throw new ExplainError('auth');
    if (err instanceof Anthropic.RateLimitError) throw new ExplainError('rate_limited');
    if (err instanceof Anthropic.APIError) throw new ExplainError('server', String(err.status));
    throw err;
  }
}
