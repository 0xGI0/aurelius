export type QuoteLang = 'de' | 'en' | 'grc';

export interface Quote {
  id: string;
  book: number;
  section: number;
  texts: Record<QuoteLang, string>;
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export function formatReference(q: Pick<Quote, 'book' | 'section'>): string {
  return `Buch ${ROMAN[q.book]}, ${q.section}`;
}

export class ShuffleBag {
  private bag: string[] = [];
  private last: string | null = null;

  constructor(private ids: string[], private rng: () => number = Math.random) {}

  next(): string {
    if (this.bag.length === 0) this.refill();
    const id = this.bag.pop()!;
    this.last = id;
    return id;
  }

  private refill(): void {
    this.bag = [...this.ids];
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
    // Keine unmittelbare Wiederholung über die Rundengrenze:
    const top = this.bag.length - 1;
    if (this.bag.length > 1 && this.bag[top] === this.last) {
      [this.bag[top], this.bag[0]] = [this.bag[0], this.bag[top]];
    }
  }
}
