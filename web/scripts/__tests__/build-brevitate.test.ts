import { buildBrevitate, GateError } from '../build-brevitate';

const para = (id: string, la: number, de: number, en: number) => ({
  id, la: 'x'.repeat(la), de: 'y'.repeat(de), en: 'z'.repeat(en),
});

describe('buildBrevitate Gates', () => {
  it('akzeptiert plausible Paragraphen', () => {
    const out = buildBrevitate([[para('s-1-1', 100, 150, 130)]]);
    expect(out[0]).toMatchObject({ id: 's-1-1', chapter: 1, paragraph: 1 });
    expect(out[0].texts.grc).toHaveLength(100);
    expect(out[0].texts.de).toHaveLength(150);
  });

  it('wirft bei leerem Slot', () => {
    expect(() => buildBrevitate([[para('s-1-1', 100, 0, 130)]])).toThrow(GateError);
  });

  it('wirft bei de/la außerhalb [1.1, 2.0]', () => {
    expect(() => buildBrevitate([[para('s-1-1', 100, 90, 130)]])).toThrow(GateError);
    expect(() => buildBrevitate([[para('s-1-1', 100, 210, 130)]])).toThrow(GateError);
  });

  it('wirft bei en/la außerhalb [1.1, 1.7]', () => {
    expect(() => buildBrevitate([[para('s-1-1', 100, 150, 180)]])).toThrow(GateError);
  });

  it('wirft bei ID-Sprung in der Paragraphenfolge', () => {
    expect(() =>
      buildBrevitate([[para('s-1-1', 100, 150, 130), para('s-1-3', 100, 150, 130)]]),
    ).toThrow(GateError);
  });
});
