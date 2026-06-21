import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

process.env.TOKEN_SECRET = "test-secret-key-for-unit-tests-only";

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
};
const mockInsertValues = vi.fn().mockResolvedValue([]);

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({ ...mockSelectChain })),
    from: vi.fn(() => mockSelectChain),
    where: vi.fn(() => mockSelectChain),
    limit: vi.fn(() => Promise.resolve([])),
    insert: vi.fn(() => ({ values: mockInsertValues })),
  },
  schema: {
    users: { id: "id", username: "username", password: "password", role: "role", nama: "nama", is_active: "is_active", created_at: "created_at" },
    login_logs: { id: "id", user_id: "user_id", username: "username", ip_address: "ip_address", user_agent: "user_agent", aktivitas: "aktivitas" },
  },
}));

vi.mock("@/services/auth.service", () => ({
  login: vi.fn(),
  recordLoginLog: vi.fn(),
  getCurrentUser: vi.fn(),
}));

vi.mock("@/services/admin.service", () => ({
  getUserId: vi.fn(() => "user-admin-1"),
  getUsername: vi.fn(() => "admin"),
  getRole: vi.fn(() => "admin"),
  isAdmin: vi.fn(() => true),
  getClientIp: vi.fn(() => "test-ratelimit-ip"),
  getUserAgent: vi.fn(() => "Mozilla/5.0"),
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: vi.fn(),
}));

import { POST as loginPOST } from "./login/route";
import { createMockRequest } from "../test-utils";

function makeLoginRequest() {
  return createMockRequest({
    method: "POST",
    body: { username: "admin", password: "wrong" },
    headers: { "content-type": "application/json", "x-forwarded-for": "test-ratelimit-ip" },
  });
}

describe("Rate Limiting — Login Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow first 5 login attempts from same IP", async () => {
    const { login } = await import("@/services/auth.service");
    vi.mocked(login).mockResolvedValue({
      success: false,
      response: new Response(JSON.stringify({ message: "Username atau password salah" }), { status: 401 }) as any,
    });

    for (let i = 0; i < 5; i++) {
      const req = makeLoginRequest();
      const response = await loginPOST(req);
      expect(response.status).not.toBe(429);
    }
  });

  it("should return 429 after 6 attempts from same IP", async () => {
    const { login } = await import("@/services/auth.service");
    vi.mocked(login).mockResolvedValue({
      success: false,
      response: new Response(JSON.stringify({ message: "Username atau password salah" }), { status: 401 }) as any,
    });

    for (let i = 0; i < 5; i++) {
      const req = makeLoginRequest();
      await loginPOST(req);
    }

    const req = makeLoginRequest();
    const response = await loginPOST(req);
    expect(response.status).toBe(429);

    const body = await response.json();
    expect(body.message).toContain("Terlalu banyak");
  });

  it("should include rate limit headers on 429 response", async () => {
    const { login } = await import("@/services/auth.service");
    vi.mocked(login).mockResolvedValue({
      success: false,
      response: new Response(JSON.stringify({ message: "Username atau password salah" }), { status: 401 }) as any,
    });

    for (let i = 0; i < 6; i++) {
      const req = makeLoginRequest();
      await loginPOST(req);
    }

    const req = makeLoginRequest();
    const response = await loginPOST(req);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(response.headers.get("Retry-After")).toBe("60");
  });
});
