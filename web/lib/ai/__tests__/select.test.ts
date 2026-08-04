const mockKey = jest.fn();
jest.mock('../../settings', () => ({ getAnthropicKey: () => mockKey() }));

const mockClaude = jest.fn();
const mockGemini = jest.fn();
jest.mock('../anthropic', () => ({ explainWithClaude: (...a: unknown[]) => mockClaude(...a) }));
jest.mock('../gemini', () => ({ explainWithGemini: (...a: unknown[]) => mockGemini(...a) }));

import { getExplainStream } from '../index';

const quote = { id: '1-1', book: 1, section: 1, texts: { de: 'x', en: 'y', grc: 'z' } };

describe('getExplainStream', () => {
  it('nutzt Claude, wenn ein Key hinterlegt ist', async () => {
    mockKey.mockResolvedValue('sk-ant-abc');
    await getExplainStream(quote, 'de');
    expect(mockClaude).toHaveBeenCalledWith('sk-ant-abc', quote, 'de');
    expect(mockGemini).not.toHaveBeenCalled();
  });
  it('fällt ohne Key auf Gemini zurück', async () => {
    mockClaude.mockClear(); mockGemini.mockClear();
    mockKey.mockResolvedValue(null);
    await getExplainStream(quote, 'de');
    expect(mockGemini).toHaveBeenCalledWith(quote, 'de');
    expect(mockClaude).not.toHaveBeenCalled();
  });
});
