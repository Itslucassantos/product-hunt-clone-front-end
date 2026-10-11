export class ApiRequestError extends Error {
  constructor(
    public readonly code: string | null, // null when there was no response (network failure)
    public readonly status: number | null,
    public readonly requestId: string | null,
    public readonly details?: unknown,
  ) {
    super(code ?? "NETWORK_ERROR");
    this.name = "ApiRequestError";
  }
}
