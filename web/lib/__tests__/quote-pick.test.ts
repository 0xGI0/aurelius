import { pickQuote, TOPICS, isTopic } from '../quote-pick';
import { authorOf } from '../corpus';
import topicsData from '../../data/topics.json';

describe('pickQuote', () => {
  it('liefert ohne Optionen ein Zitat aus dem Gesamtkorpus', () => {
    const q = pickQuote({ rng: () => 0 });
    expect(q).not.toBeNull();
    expect(q!.texts.de.length).toBeGreaterThan(0);
  });

  it('respektiert den Autor-Filter', () => {
    for (const author of ['aurel', 'epiktet', 'seneca'] as const) {
      const q = pickQuote({ author, rng: () => 0.5 });
      expect(authorOf(q!.id)).toBe(author);
    }
  });

  it('Seneca liefert Paragraphen-IDs und ist unter maxLen 300 nicht leer', () => {
    const q = pickQuote({ author: 'seneca', rng: () => 0.5 });
    expect(q!.id).toMatch(/^s-\d{1,2}-\d{1,2}$/);
    expect(pickQuote({ author: 'seneca', maxLen: 300, rng: () => 0.5 })).not.toBeNull();
  });

  it('filtert auf maxLen in beiden Sprachen', () => {
    const q = pickQuote({ maxLen: 200, rng: () => 0.99 });
    expect(q!.texts.de.length).toBeLessThanOrEqual(200);
    expect(q!.texts.en.length).toBeLessThanOrEqual(200);
  });

  it('gibt null zurück, wenn der Filter alles aussiebt', () => {
    expect(pickQuote({ maxLen: 1 })).toBeNull();
  });

  it('respektiert den Themen-Filter', () => {
    const tod = new Set(
      (topicsData as { id: string; quoteIds: string[] }[]).find((t) => t.id === 'tod')!.quoteIds,
    );
    for (const r of [0, 0.3, 0.7, 0.999]) {
      const q = pickQuote({ topic: 'tod', rng: () => r });
      expect(tod.has(q!.id)).toBe(true);
    }
    expect(isTopic('tod')).toBe(true);
    expect(isTopic('quatsch')).toBe(false);
  });

  it('kombiniert Autor- und Themen-Filter', () => {
    const q = pickQuote({ author: 'seneca', topic: 'tod', rng: () => 0.5 });
    expect(authorOf(q!.id)).toBe('seneca');
  });

  it('liefert null bei unbekanntem Thema', () => {
    expect(pickQuote({ topic: 'quatsch' })).toBeNull();
  });

  it('exportiert den Themen-Katalog zweisprachig', () => {
    expect(TOPICS).toHaveLength(9);
    const tod = TOPICS.find((t) => t.id === 'tod');
    expect(tod?.label.de).toBe('Tod & Vergänglichkeit');
    expect(tod?.label.en).toBe('Death & Impermanence');
  });

  it('nutzt die injizierte Zufallsquelle deterministisch', () => {
    const a = pickQuote({ rng: () => 0 });
    const b = pickQuote({ rng: () => 0 });
    expect(a!.id).toBe(b!.id);
  });
});
