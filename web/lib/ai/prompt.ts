import type { Author } from '../quotes';

export type ExplainLang = 'de' | 'en';

const SYSTEM: Record<Author, Record<ExplainLang, string>> = {
  aurel: {
    de:
      'Du bist ein kundiger, nüchterner Begleiter durch Marc Aurels Selbstbetrachtungen. ' +
      'Du erklärst klar, konkret und ohne Kitsch — für interessierte Laien.',
    en:
      'You are a knowledgeable, level-headed companion through Marcus Aurelius’ Meditations. ' +
      'You explain clearly, concretely and without kitsch — for interested lay readers.',
  },
  epiktet: {
    de:
      'Du bist ein kundiger, nüchterner Begleiter durch Epiktets Handbüchlein der Moral. ' +
      'Du erklärst klar, konkret und ohne Kitsch — für interessierte Laien.',
    en:
      'You are a knowledgeable, level-headed companion through Epictetus’ Enchiridion. ' +
      'You explain clearly, concretely and without kitsch — for interested lay readers.',
  },
  seneca: {
    de:
      'Du bist ein kundiger, nüchterner Begleiter durch Senecas Schrift Von der Kürze des Lebens. ' +
      'Du erklärst klar, konkret und ohne Kitsch — für interessierte Laien.',
    en:
      'You are a knowledgeable, level-headed companion through Seneca’s On the Shortness of Life. ' +
      'You explain clearly, concretely and without kitsch — for interested lay readers.',
  },
};

export function explainSystem(lang: ExplainLang = 'de', author: Author = 'aurel'): string {
  return SYSTEM[author][lang];
}

// Beibehaltener Export für bestehende Aufrufer (deutsch, Marc Aurel).
export const EXPLAIN_SYSTEM = SYSTEM.aurel.de;

export function buildExplainPrompt(
  text: string,
  reference: string,
  lang: ExplainLang = 'de',
  author: Author = 'aurel',
): string {
  const SOURCES: Record<Author, Record<ExplainLang, string>> = {
    aurel: {
      de: `Passage aus Marc Aurels »Selbstbetrachtungen« (${reference}):`,
      en: `Passage from Marcus Aurelius’ “Meditations” (${reference}):`,
    },
    epiktet: {
      de: `Passage aus Epiktets »Handbüchlein der Moral« (${reference}):`,
      en: `Passage from Epictetus’ “Enchiridion” (${reference}):`,
    },
    seneca: {
      de: `Passage aus Senecas »Von der Kürze des Lebens« (${reference}):`,
      en: `Passage from Seneca’s “On the Shortness of Life” (${reference}):`,
    },
  };
  const source = SOURCES[author][lang];

  if (lang === 'en') {
    return (
      `${source}\n\n` +
      `“${text}”\n\n` +
      'Explain this passage in English in 120–180 words: first the core idea in one sentence, ' +
      'then briefly the Stoic background, finally one concrete application to everyday life today. ' +
      'Answer directly, without preamble and without headings.'
    );
  }
  return (
    `${source}\n\n` +
    `»${text}«\n\n` +
    'Erkläre diese Passage auf Deutsch in 120–180 Wörtern: zuerst in einem Satz den Kerngedanken, ' +
    'dann kurz den stoischen Hintergrund, zuletzt eine konkrete Anwendung im heutigen Alltag. ' +
    'Antworte direkt ohne Vorspann und ohne Überschriften.'
  );
}
