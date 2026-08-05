import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { buildExplainPrompt, explainSystem, type ExplainLang } from '../lib/ai/prompt';

// 2026-08-05: `gemini-2.5-flash` ist für NEUE API-Keys bereits gesperrt
// (404 „no longer available to new users" — live verifiziert). Stattdessen
// der Alias `gemini-flash-latest`, der immer aufs aktuelle Flash-Modell
// zeigt und Deprecations überlebt.
// SDK-Abgleich (@google/genai@2.15.0, node_modules/@google/genai/dist/genai.d.ts):
// generateContentStream(params: GenerateContentParameters) mit
// { model, contents, config? } ist unverändert; `systemInstruction` und
// `maxOutputTokens` liegen beide in `GenerateContentConfig` (also in `config`,
// wie im Brief) — kein SDK-Formabweichung zum Brief-Code.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'nur POST' });
    return;
  }
  const { text, reference, uiLang, author } = (req.body ?? {}) as {
    text?: unknown;
    reference?: unknown;
    uiLang?: unknown;
    author?: unknown;
  };
  if (typeof text !== 'string' || text.length === 0 || text.length > 8000 || typeof reference !== 'string') {
    res.status(400).json({ error: 'ungültiger Body' });
    return;
  }
  const lang: ExplainLang = uiLang === 'en' ? 'en' : 'de';
  const work =
    author === 'epiktet' ? ('epiktet' as const) : author === 'seneca' ? ('seneca' as const) : ('aurel' as const);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY fehlt' });
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-flash-latest',
      contents: buildExplainPrompt(text, reference, lang, work),
      config: { systemInstruction: explainSystem(lang, work), maxOutputTokens: 1024 },
    });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    for await (const chunk of stream) {
      if (chunk.text) res.write(chunk.text);
    }
    res.end();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/429|quota|RESOURCE_EXHAUSTED/i.test(msg)) {
      res.status(429).json({ error: 'Kontingent erschöpft' });
      return;
    }
    res.status(500).json({ error: 'Gemini-Fehler' });
  }
}
