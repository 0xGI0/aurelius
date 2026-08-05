import { readFileSync } from 'node:fs';
import { parseBrevLaNumbered } from '../brevitate';

describe('parseBrevLaNumbered', () => {
  const paras = parseBrevLaNumbered(
    readFileSync('data-sources/seneca-brevitate-la-numbered.html', 'utf8'),
  );

  it('liefert 20 Kapitel in Dokumentreihenfolge', () => {
    expect(new Set(paras.map((p) => p.chapter)).size).toBe(20);
    expect(paras[0]).toMatchObject({ chapter: 1, paragraph: 1 });
  });

  it('nummeriert Paragraphen pro Kapitel lückenlos ab 1', () => {
    for (let c = 1; c <= 20; c++) {
      const nums = paras.filter((p) => p.chapter === c).map((p) => p.paragraph);
      expect(nums).toEqual(Array.from({ length: nums.length }, (_, i) => i + 1));
      expect(nums.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('Kapitel 4 enthält den Augustus-Paragraphen', () => {
    const ch4 = paras.filter((p) => p.chapter === 4);
    expect(ch4.length).toBeGreaterThanOrEqual(3);
    expect(ch4.some((p) => /Augustus/.test(p.text))).toBe(true);
  });

  it('Texte sind bereinigt (kein Markup, keine Marker)', () => {
    for (const p of paras) {
      expect(p.text).not.toMatch(/<|\[\s*\d+\s*\]/);
      expect(p.text.length).toBeGreaterThan(40);
    }
  });
});
