import { translate, translateServerMessage } from "../i18n";

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** An HTTP error with a readable message (already in the interface language). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

// Token of the current session; managed by AuthProvider.
let token: string | null = null;
let onExpired: () => void = () => {};

export function setSessionToken(next: string | null, whenExpired?: () => void) {
  token = next;
  if (whenExpired) onExpired = whenExpired;
}

export const authHeader = (): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {});

/** An invalid or expired token signs the user out (except on the login itself, which has no token). */
export function handleUnauthorized(status: number) {
  if (status === 401 && token) onExpired();
}

// Render's free plan puts the API to sleep after 15 min and it takes ~50 s to
// wake up: the limit covers that, but no request waits forever.
const TIMEOUT_MS = 75_000;
const RETRYABLE_STATUS = [502, 503, 504];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const noResponseMessage = () => translate("connection.noResponse");
export const noNetworkMessage = () => translate("connection.noNetwork");

/** Readable error from the answer's body. For validation errors, the first detail is shown. */
export function errorMessageFrom(body: unknown, status: number): string {
  const b = body as { error?: string; detalles?: Record<string, string[] | undefined> } | null;
  const detail = b?.detalles ? Object.values(b.detalles).flat().find(Boolean) : undefined;
  const message = detail ?? b?.error;
  return message ? translateServerMessage(message) : `Error ${status}`;
}

/** Combines the caller's cancellation (if any) with the timeout. */
function withTimeout(external?: AbortSignal | null): AbortSignal {
  const limit = AbortSignal.timeout(TIMEOUT_MS);
  if (!external) return limit;
  return "any" in AbortSignal ? AbortSignal.any([external, limit]) : external;
}

/**
 * Sends a request to the API. Reads (GET) retry by themselves on temporary
 * network or proxy failures; writes do not, so an action is never repeated.
 */
export async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const canRetry = (init.method ?? "GET").toUpperCase() === "GET";

  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${API_URL}${path}`, { ...init, headers: { ...authHeader(), ...init.headers }, signal: withTimeout(init.signal) });
    } catch (err) {
      if (init.signal?.aborted) throw err; // cancelled by the caller (e.g. leaving the page)
      const timedOut = err instanceof DOMException && err.name === "TimeoutError";
      if (!timedOut && canRetry && attempt < 2) {
        await sleep(2_000 * (attempt + 1));
        continue;
      }
      throw new ApiError(timedOut ? noResponseMessage() : noNetworkMessage(), 0);
    }

    if (canRetry && attempt < 2 && RETRYABLE_STATUS.includes(res.status)) {
      await sleep(2_000 * (attempt + 1));
      continue;
    }
    handleUnauthorized(res.status);
    if (!res.ok) throw new ApiError(errorMessageFrom(await res.json().catch(() => null), res.status), res.status);
    return res;
  }
}

export const getJson = async <T,>(path: string, init?: RequestInit) => (await request(path, init)).json() as Promise<T>;

/** JSON request with a body. */
export const sendJson = <T,>(path: string, method: string, body: unknown) =>
  getJson<T>(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

/** Downloads a file from the API with the name the server gives it (the request needs the auth header). */
export async function downloadFromApi(path: string, fallbackName: string) {
  const res = await request(path);
  const name = /filename="?([^";]+)"?/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  link.click();
  URL.revokeObjectURL(url);
}
