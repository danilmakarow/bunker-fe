/**
 * Typed error raised by the api client for any non-2xx response.
 * Components can `instanceof ApiError` to render localized messages.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly body?: unknown;

  constructor(message: string, status: number, code?: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}
