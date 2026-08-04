export type ExplainErrorKind = 'offline' | 'auth' | 'rate_limited' | 'server';

export class ExplainError extends Error {
  constructor(public kind: ExplainErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'ExplainError';
  }
}
