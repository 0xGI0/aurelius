import {
  AUREL_QUOTES, EPIKTET_QUOTES, SENECA_QUOTES, byId, idsFor, isEpiktetId, authorOf, referenceLabel,
} from '../corpus';

describe('corpus', () => {
  it('enthält alle drei Werke vollständig', () => {
    expect(AUREL_QUOTES).toHaveLength(486);
    expect(EPIKTET_QUOTES).toHaveLength(53);
    expect(SENECA_QUOTES).toHaveLength(104);
  });

  it('Seneca-Paragraphen haben de/en und Latein im Original-Slot', () => {
    for (const q of SENECA_QUOTES) {
      expect(q.id).toMatch(/^s-\d{1,2}-\d{1,2}$/);
      expect(q.book).toBeGreaterThanOrEqual(1); // Kapitel
      expect(q.section).toBeGreaterThanOrEqual(1); // Paragraph
      expect(q.texts.de.length).toBeGreaterThan(0);
      expect(q.texts.en.length).toBeGreaterThan(0);
      expect(q.texts.grc.length).toBeGreaterThan(0); // Slot = Originalsprache (Latein)
    }
    expect(byId('s-1-1')?.texts.grc).toContain('Maior pars mortalium');
    expect(byId('s-4-2')?.texts.de).toContain('Der selige Augustus');
    expect(authorOf('s-5-2')).toBe('seneca');
    expect(referenceLabel(byId('s-4-2')!, 'Buch', 'Handbuch')).toBe('De brevitate 4,2');
    expect(idsFor('seneca')).toHaveLength(104);
  });

  it('Epiktet-Kapitel haben alle drei Sprachen', () => {
    for (const q of EPIKTET_QUOTES) {
      expect(q.id).toMatch(/^e-\d{1,2}$/);
      expect(q.texts.de.length).toBeGreaterThan(0);
      expect(q.texts.en.length).toBeGreaterThan(0);
      expect(q.texts.grc.length).toBeGreaterThan(0);
    }
  });

  it('byId löst beide Werke auf, ohne ID-Kollisionen', () => {
    expect(byId('4-7')?.book).toBe(4);
    expect(byId('e-1')?.section).toBe(1);
    expect(byId('e-53')?.texts.de).toContain('Zeus');
    const all = [...AUREL_QUOTES, ...EPIKTET_QUOTES].map((q) => q.id);
    expect(new Set(all).size).toBe(all.length);
  });

  it('idsFor trennt die Autoren', () => {
    expect(idsFor('aurel')).toHaveLength(486);
    expect(idsFor('epiktet')).toHaveLength(53);
    expect(idsFor('epiktet').every(isEpiktetId)).toBe(true);
  });

  it('authorOf und referenceLabel', () => {
    expect(authorOf('e-5')).toBe('epiktet');
    expect(authorOf('5-23')).toBe('aurel');
    expect(referenceLabel(byId('e-5')!, 'Buch', 'Handbuch')).toBe('Handbuch, 5');
    expect(referenceLabel(byId('4-7')!, 'Buch', 'Handbuch')).toBe('Buch IV, 7');
  });
});
