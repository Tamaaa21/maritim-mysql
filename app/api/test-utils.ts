import { NextRequest } from "next/server";

export function createMockRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
  formData?: FormData;
} = {}) {
  const { method = "GET", url = "http://localhost:3000", body, headers = {}, formData } = options;

  const init: Record<string, any> = {
    method,
    headers: new Headers(headers),
  };

  if (body && !formData) {
    init.body = JSON.stringify(body);
    if (!headers["content-type"]) {
      (init.headers as Headers).set("content-type", "application/json");
    }
  }

  if (formData) {
    init.body = formData;
  }

  return new NextRequest(url, init as any);
}

export function createAdminHeaders(overrides: Record<string, string> = {}) {
  return {
    "x-auth-user-id": "user-admin-1",
    "x-auth-user-role": "admin",
    "x-auth-user-username": "admin",
    "content-type": "application/json",
    ...overrides,
  };
}

export function createSuperAdminHeaders(overrides: Record<string, string> = {}) {
  return createAdminHeaders({
    "x-auth-user-role": "super_admin",
    ...overrides,
  });
}

export function createKaryawanHeaders(overrides: Record<string, string> = {}) {
  return createAdminHeaders({
    "x-auth-user-role": "user",
    ...overrides,
  });
}

export async function parseResponse(response: Response) {
  return response.json();
}
