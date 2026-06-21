"use client";

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = getCsrfToken();
    const headers = new Headers(options.headers);
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
    options.headers = headers;
  }

  return fetch(url, options);
}
