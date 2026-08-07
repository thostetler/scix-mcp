import { getAPIKey, SCIX_API_BASE, REQUEST_TIMEOUT, RATE_LIMIT } from './config.js';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  params?: Record<string, unknown>;
  body?: unknown;
}

function formatRateLimitReset(resetHeader: string | null): string | undefined {
  if (!resetHeader) {
    return undefined;
  }
  const seconds = Number(resetHeader);
  if (!Number.isFinite(seconds)) {
    return undefined;
  }
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

function extractAdsErrorMessage(body: unknown): string | undefined {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.error === 'string') {
      return record.error;
    }
    if (typeof record.message === 'string') {
      return record.message;
    }
  }
  return undefined;
}

export class SciXAPIError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'SciXAPIError';
    this.status = status;
    this.body = body;
  }
}

export class SciXAPIClient {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = getAPIKey();
    this.baseURL = SCIX_API_BASE;
  }

  async get<T = unknown>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>('GET', endpoint, { params });
  }

  async post<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, { body: data });
  }

  async put<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>('PUT', endpoint, { body: data });
  }

  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint, {});
  }

  private buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const url = new URL(`${this.baseURL}/${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            url.searchParams.append(key, value.join(','));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  private async request<T = unknown>(
    method: HttpMethod,
    endpoint: string,
    { params, body }: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeout);

      const text = await response.text();

      if (!response.ok) {
        const parsedErrorBody = this.safeParseJson(text);
        const rateLimitReset = response.headers?.get(RATE_LIMIT.HEADERS.RESET) ?? null;
        throw this.buildError(
          response.status,
          response.statusText,
          method,
          endpoint,
          parsedErrorBody,
          rateLimitReset
        );
      }

      const trimmed = text.trim();
      // Single deserialization boundary: ADS responses are not runtime-
      // validated, so the caller's generic T is trusted here (see types.ts
      // response shapes). Keep the parse result `unknown` and assert at the
      // return so `any` never leaks into local inference.
      const parsed: unknown = trimmed ? JSON.parse(trimmed) : {};
      return parsed as T;
    } catch (error: unknown) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${REQUEST_TIMEOUT / 1000} seconds`);
      }
      throw error;
    }
  }

  private safeParseJson(text: string): unknown {
    if (!text) {
      return undefined;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private buildError(
    status: number,
    statusText: string,
    method: HttpMethod,
    endpoint: string,
    body: unknown,
    rateLimitReset: string | null = null
  ): SciXAPIError {
    const context = `for ${method} ${endpoint}`;
    const adsMessage = extractAdsErrorMessage(body);

    let message: string;
    if (status === 401) {
      message = `Authentication failed ${context}. Check SCIX_API_TOKEN environment variable. ` +
        `Get your key from https://scixplorer.org/user/settings/token`;
    } else if (status === 404) {
      message = `Resource not found ${context}.`;
    } else if (status === 429) {
      message = `Rate limit exceeded (5000 requests/day) ${context}. Please try again later.`;
      const resetTime = formatRateLimitReset(rateLimitReset);
      if (resetTime) {
        message += ` Retry after ${resetTime}.`;
      }
    } else {
      message = `SciX API error: ${status} ${statusText} ${context}`;
    }

    if (adsMessage) {
      message += ` — ${adsMessage}`;
    }

    return new SciXAPIError(message, status, body);
  }
}
