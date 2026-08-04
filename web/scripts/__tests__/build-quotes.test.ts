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
