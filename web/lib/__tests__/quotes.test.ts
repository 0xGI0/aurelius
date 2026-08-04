import { ShuffleBag, formatReference } from '../quotes';

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('ShuffleBag', () => {
  it('liefert jede ID genau einmal pro Runde', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const bag = new ShuffleBag(ids, seededRng(1));
    const round = [bag.next(), bag.next(), bag.next(), bag.next()];
    expect([...round].sort()).toEqual([...ids].sort());
  });

  it('wiederholt die letzte ID nicht direkt beim Rundenwechsel', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const bag = new ShuffleBag(['a', 'b', 'c'], seededRng(seed));
      const round1 = [bag.next(), bag.next(), bag.next()];
      expect(bag.next()).not.toBe(round1[2]);
    }
  });

  it('funktioniert mit einer einzigen ID', () => {
    const bag = new ShuffleBag(['solo']);
    expect(bag.next()).toBe('solo');
    expect(bag.next()).toBe('solo');
  });
});

describe('formatReference', () => {
  it('formatiert mit römischer Buchzahl', () => {
    expect(formatReference({ book: 4, section: 7 })).toBe('Buch IV, 7');
    expect(formatReference({ book: 12, section: 36 })).toBe('Buch XII, 36');
  });
});
