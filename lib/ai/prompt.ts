export const EXPLAIN_SYSTEM =
  'Du bist ein kundiger, nüchterner Begleiter durch Marc Aurels Selbstbetrachtungen. ' +
  'Du erklärst klar, konkret und ohne Kitsch — für interessierte Laien.';

export function buildExplainPrompt(text: string, reference: string): string {
  return (
    `Passage aus Marc Aurels »Selbstbetrachtungen« (${reference}):\n\n` +
    `»${text}«\n\n` +
    'Erkläre diese Passage auf Deutsch in 120–180 Wörtern: zuerst in einem Satz den Kerngedanken, ' +
    'dann kurz den stoischen Hintergrund, zuletzt eine konkrete Anwendung im heutigen Alltag. ' +
    'Antworte direkt ohne Vorspann und ohne Überschriften.'
  );
}
