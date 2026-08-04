export type ExplainLang = 'de' | 'en';

const SYSTEM: Record<ExplainLang, string> = {
  de:
    'Du bist ein kundiger, nüchterner Begleiter durch Marc Aurels Selbstbetrachtungen. ' +
    'Du erklärst klar, konkret und ohne Kitsch — für interessierte Laien.',
  en:
    'You are a knowledgeable, level-headed companion through Marcus Aurelius’ Meditations. ' +
    'You explain clearly, concretely and without kitsch — for interested lay readers.',
};

export function explainSystem(lang: ExplainLang = 'de'): string {
  return SYSTEM[lang];
}

// Beibehaltener Export für bestehende Aufrufer (deutsch).
export const EXPLAIN_SYSTEM = SYSTEM.de;

export function buildExplainPrompt(text: string, reference: string, lang: ExplainLang = 'de'): string {
  if (lang === 'en') {
    return (
      `Passage from Marcus Aurelius’ “Meditations” (${reference}):\n\n` +
      `“${text}”\n\n` +
      'Explain this passage in English in 120–180 words: first the core idea in one sentence, ' +
      'then briefly the Stoic background, finally one concrete application to everyday life today. ' +
      'Answer directly, without preamble and without headings.'
    );
  }
  return (
    `Passage aus Marc Aurels »Selbstbetrachtungen« (${reference}):\n\n` +
    `»${text}«\n\n` +
    'Erkläre diese Passage auf Deutsch in 120–180 Wörtern: zuerst in einem Satz den Kerngedanken, ' +
    'dann kurz den stoischen Hintergrund, zuletzt eine konkrete Anwendung im heutigen Alltag. ' +
    'Antworte direkt ohne Vorspann und ohne Überschriften.'
  );
}
