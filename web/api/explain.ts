import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { buildExplainPrompt, EXPLAIN_SYSTEM } from '../lib/ai/prompt';

// Websuche (2026-08-04, Task 10 Step 1): `gemini-2.5-flash` ist weiterhin der
// korrekte Modellname und im Gemini-API-Free-Tier verfügbar (bestätigt über
// ai.google.dev/gemini-api/docs/pricing: Flash-Modelle inkl. 2.5 Flash sind
// kostenlos nutzbar, Limits gelten). ACHTUNG: 2.5 Flash ist laut Suchergebnissen
// für 2026-10-16 zur Deprecation vorgesehen — vor diesem Datum ggf. auf ein
// dann aktuelles Flash-Modell (z. B. 2.5/3.x Flash-Nachfolger) umstellen.
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
  const { text, reference } = (req.body ?? {}) as { text?: unknown; reference?: unknown };
  if (typeof text !== 'string' || text.length === 0 || text.length > 8000 || typeof reference !== 'string') {
    res.status(400).json({ error: 'ungültiger Body' });
    return;
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY fehlt' });
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: buildExplainPrompt(text, reference),
      config: { systemInstruction: EXPLAIN_SYSTEM, maxOutputTokens: 1024 },
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
