import { mergeSections } from '../build-quotes';

const de = [{ book: 1, section: 1, text: 'de-1-1' }, { book: 1, section: 2, text: 'de-1-2' }];
const en = [{ book: 1, section: 1, text: 'en-1-1' }, { book: 1, section: 3, text: 'en-1-3' }];
const grc = [{ book: 1, section: 1, text: 'grc-1-1' }, { book: 1, section: 2, text: 'grc-1-2' }];

describe('mergeSections', () => {
  it('nimmt nur vollständige Tripel auf und meldet Lücken', () => {
    const { quotes, missing } = mergeSections({ de, en, grc }, { de: {}, en: {}, grc: {} });
    expect(quotes).toEqual([
      { id: '1-1', book: 1, section: 1, texts: { de: 'de-1-1', en: 'en-1-1', grc: 'grc-1-1' } },
    ]);
    expect(missing).toContainEqual({ id: '1-2', lacking: ['en'] });
    expect(missing).toContainEqual({ id: '1-3', lacking: ['de', 'grc'] });
  });

  it('wendet Remaps an', () => {
    const { quotes } = mergeSections(
      { de, en: [{ book: 1, section: 3, text: 'en-eigentlich-1-2' }], grc },
      { de: {}, en: { '1-3': '1-2' }, grc: {} },
    );
    expect(quotes.find((q) => q.id === '1-2')?.texts.en).toBe('en-eigentlich-1-2');
  });
});

describe('applyFixups', () => {
  const { applyFixups } = require('../build-quotes');
  const quotes = [
    { id: '6-5', book: 6, section: 5, texts: { de: 'wirkt. Kaputt', en: 'ok', grc: 'ok' } },
    { id: '6-6', book: 6, section: 6, texts: { de: 'Unberührt.', en: 'ok', grc: 'ok' } },
  ];

  it('ersetzt nur die gelisteten Texte', () => {
    const out = applyFixups(quotes, { de: { '6-5': 'Kaputt wirkt.' } });
    expect(out[0].texts.de).toBe('Kaputt wirkt.');
    expect(out[1].texts.de).toBe('Unberührt.');
    expect(out[0].texts.en).toBe('ok');
  });

  it('wirft bei Fixup für unbekannte ID (Schutz gegen veraltete Einträge)', () => {
    expect(() => applyFixups(quotes, { de: { '9-99': 'x' } })).toThrow();
  });
});
