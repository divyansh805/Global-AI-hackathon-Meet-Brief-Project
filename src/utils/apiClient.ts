/**
 * Safe API client for MeetBrief.
 * Ensures response.json() is never called on HTML or malformed payloads,
 * preventing "Unexpected token '<', '<!doctype ...' is not valid JSON" errors.
 */

export interface ApiSuccess<T> {
  ok: true;
  status: number;
  data: T;
}

export interface ApiFailure {
  ok: false;
  status: number;
  error: string;
  errorType?: string;
  isHtml?: boolean;
  raw?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export async function safeFetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';

    const isJson =
      /\bapplication\/(?:[\w.-]+\+)?json\b/i.test(contentType);
    if (!isJson) {
      const isHtml =
        contentType.includes('text/html') ||
        contentType.includes('application/xhtml+xml');
      return {
        ok: false,
        status: response.status,
        isHtml,
        error: isHtml
          ? `The server returned an HTML page (${response.status}) for ${url} instead of API data. Check that the backend server is running and the API route is configured.`
          : `The server returned an unexpected content type (${contentType || 'missing'}) for ${url}. Expected JSON.`,
      };
    }

    // Attempt to parse JSON safely
    let data: unknown;
    try {
      const text = await response.text();
      if (!text.trim()) {
        return {
          ok: false,
          status: response.status,
          error: `The server returned an empty JSON response (${response.status}) for ${url}.`,
        };
      }
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error(`[safeFetchJson] JSON parse failure for ${url}:`, parseErr);
      return {
        ok: false,
        status: response.status,
        error: `Invalid response format from server (${response.status}). Expected JSON.`,
      };
    }

    if (!response.ok) {
      const errorObj = data as Record<string, unknown> | undefined;
      const errorMsg =
        (typeof errorObj?.error === 'string' && errorObj.error) ||
        `Request failed with status ${response.status}`;
      const errorType =
        typeof errorObj?.errorType === 'string' ? errorObj.errorType : undefined;

      return {
        ok: false,
        status: response.status,
        error: errorMsg,
        errorType,
        raw: data,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: data as T,
    };
  } catch (networkErr: unknown) {
    const msg =
      networkErr instanceof Error
        ? networkErr.message
        : 'Network connection failed';
    console.error(`[safeFetchJson] Network error for ${url}:`, msg);

    return {
      ok: false,
      status: 0,
      error: `Could not connect to MeetBrief research server (${msg}). Please verify your connection.`,
    };
  }
}
