import { parseEnchDe, parseEnchEn, parseEnchGrc, romanToInt } from '../ench';

describe('romanToInt', () => {
  it('wandelt römische Zahlen bis LIII', () => {
    expect(romanToInt('I')).toBe(1);
    expect(romanToInt('IV')).toBe(4);
    expect(romanToInt('XXIX')).toBe(29);
    expect(romanToInt('LIII')).toBe(53);
  });
});

describe('parseEnchDe (Conz)', () => {
  const raw = [
    'Epiktet: Handbüchlein der stoischen Moral',
    '',
    'Unser Eigenthum.',
    'I, 1. Einige Dinge sind in unserer Gewalt,',
    'andere nicht.',
    '',
    'Vorzüge.',
    'I, 2. Und die Dinge sind von Natur frei.',
    '',
    'Zweites Kapitel.',
    'II. Bedenke die Begierde.',
    '',
    '7',
  ].join('\n');

  it('verschmilzt Verse zu Kapiteln und verwirft Überschriften/Seitenreste', () => {
    const result = parseEnchDe(raw);
    expect(result).toHaveLength(2);
    expect(result[0].chapter).toBe(1);
    expect(result[0].text).toBe(
      'Einige Dinge sind in unserer Gewalt, andere nicht. Und die Dinge sind von Natur frei.'
    );
    expect(result[1]).toEqual({ chapter: 2, text: 'Bedenke die Begierde.' });
  });

  it('fügt Silbentrennung zusammen', () => {
    const result = parseEnchDe('X, 1. Die Begier-\nde ist stark.');
    expect(result[0].text).toBe('Die Begierde ist stark.');
  });
});

describe('parseEnchEn (Long)', () => {
  it('parst Kapitel nach der Titelzeile und entfernt Greek-Glossen', () => {
    const raw = [
      'Ignore this preamble.',
      'THE ENCHEIRIDION, OR MANUAL.',
      '',
      'I.',
      '',
      'Of things some are in our power ([Greek: hupolaepsis]), and others not.',
      '',
      'II.',
      '',
      'Remember that desire contains hope.',
      '',
      '*** END OF THE PROJECT GUTENBERG EBOOK ***',
    ].join('\n');
    const result = parseEnchEn(raw);
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Of things some are in our power, and others not.');
    expect(result[1].chapter).toBe(2);
  });

  it('trennt Longs verschmolzenes Kapitel 50/51 und verschiebt 51/52 auf 52/53', () => {
    const chapters: string[] = [];
    for (let i = 1; i <= 52; i++) {
      const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i] ?? toRoman(i);
      const text =
        i === 50
          ? 'Abide by the rules as laws. How long will you then still defer thinking yourself worthy? Now is the contest.'
          : `Chapter ${i} text.`;
      chapters.push(`${roman}.\n\n${text}\n`);
    }
    const raw = `THE ENCHEIRIDION, OR MANUAL.\n\n${chapters.join('\n')}`;
    const result = parseEnchEn(raw);
    expect(result).toHaveLength(53);
    expect(result.find((c) => c.chapter === 50)?.text).toBe('Abide by the rules as laws.');
    expect(result.find((c) => c.chapter === 51)?.text).toContain('How long will you then still defer');
    expect(result.find((c) => c.chapter === 52)?.text).toBe('Chapter 51 text.');
    expect(result.find((c) => c.chapter === 53)?.text).toBe('Chapter 52 text.');
  });
});

describe('parseEnchGrc (Perseus TEI)', () => {
  it('extrahiert chapter-divs und entfernt Markup', () => {
    const xml = `
      <div type="chapter" n="1"><p>τῶν ὄντων <term>τὰ μέν</term> ἐστιν</p></div>
      <div type="chapter" n="2"><p>μέμνησο <note resp="ed">Fußnote weg</note> ὅτι</p></div>
    `;
    const result = parseEnchGrc(xml);
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('τῶν ὄντων τὰ μέν ἐστιν');
    expect(result[1].text).toBe('μέμνησο ὅτι');
  });
});

function toRoman(n: number): string {
  const table: Array<[number, string]> = [
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [v, s] of table) {
    while (n >= v) { out += s; n -= v; }
  }
  return out;
}

describe('parseEnchGrc — vollständige Kapitel (Regression 2026-08-06)', () => {
  const { readFileSync } = require('node:fs');
  const grc = parseEnchGrc(readFileSync('data-sources/tlg0557.tlg002.xml', 'utf8'));
  const en = parseEnchEn(readFileSync('data-sources/pg-long-enchiridion.txt', 'utf8'));

  it('Kapitel 1 enthält auch die Abschnitte nach §1', () => {
    const c1 = grc.find((c) => c.chapter === 1)!;
    expect(c1.text).toContain('φύσει ἐλεύθερα'); // §2
    expect(c1.text.length).toBeGreaterThan(1200);
  });

  it('kein Kapitel ist gegenüber dem Englischen verdächtig kurz', () => {
    const enMap = new Map(en.map((c) => [c.chapter, c.text.length]));
    for (const c of grc) {
      const ratio = (enMap.get(c.chapter) ?? 0) / c.text.length;
      expect(ratio).toBeLessThan(2.0);
    }
  });
});
