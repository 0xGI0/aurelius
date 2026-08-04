import { buildExplainPrompt, EXPLAIN_SYSTEM } from '../prompt';

describe('buildExplainPrompt', () => {
  it('enthält Text und Stellenangabe', () => {
    const p = buildExplainPrompt('Der Text.', 'Buch IV, 7');
    expect(p).toContain('Der Text.');
    expect(p).toContain('Buch IV, 7');
    expect(p).toMatch(/120–180 Wörtern/);
  });
  it('System-Prompt ist deutsch und nicht leer', () => {
    expect(EXPLAIN_SYSTEM.length).toBeGreaterThan(20);
  });
});
