export type ExplainErrorKind = 'offline' | 'auth' | 'rate_limited' | 'not_configured' | 'server';

export class ExplainError extends Error {
  constructor(public kind: ExplainErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'ExplainError';
  }
}
