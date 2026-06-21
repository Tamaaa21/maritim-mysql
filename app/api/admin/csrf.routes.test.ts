import { describe, it, expect, vi, beforeEach } from "vitest";

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
  getClientIp: vi.fn(() => "127.0.0.1"),
  getUserAgent: vi.fn(() => "Mozilla/5.0"),
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: vi.fn(),
}));

import { POST as loginPOST } from "./login/route";
import { POST as logoutPOST } from "./logout/route";
import { createMockRequest, createAdminHeaders } from "../test-utils";

describe("CSRF Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Login sets CSRF cookie", () => {
    it("should set csrf_token cookie on successful login", async () => {
      const { login } = await import("@/services/auth.service");
      vi.mocked(login).mockResolvedValue({
        success: true,
        token: "test-token",
        user: { id: "user-1", username: "admin", role: "super_admin", nama: "Admin" },
      });

      const req = createMockRequest({
        method: "POST",
        body: { username: "admin", password: "admin123" },
        headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
      });

      const response = await loginPOST(req);
      expect(response.status).toBe(200);

      const cookies = response.headers.getSetCookie?.() || [];
      const csrfCookie = cookies.find(c => c.startsWith("csrf_token="));
      expect(csrfCookie).toBeDefined();
    });
  });

  describe("Logout clears CSRF cookie", () => {
    it("should clear csrf_token cookie on logout", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: {
          ...createAdminHeaders(),
          "x-auth-user-id": "user-1",
          "x-auth-user-role": "admin",
          "x-auth-user-username": "admin",
        },
      });

      const response = await logoutPOST(req);
      expect(response.status).toBe(200);

      const cookies = response.headers.getSetCookie?.() || [];
      const csrfCookie = cookies.find(c => c.startsWith("csrf_token="));
      expect(csrfCookie).toBeDefined();
      expect(csrfCookie).toContain("Max-Age=0");
    });
  });

  describe("CSRF utilities exist", () => {
    it("CSRF_COOKIE_NAME is exported from auth-edge", async () => {
      const { CSRF_COOKIE_NAME } = await import("@/lib/auth-edge");
      expect(CSRF_COOKIE_NAME).toBe("csrf_token");
    });

    it("setCsrfCookie is exported from auth", async () => {
      const { setCsrfCookie } = await import("@/lib/auth");
      expect(typeof setCsrfCookie).toBe("function");
    });

    it("clearCsrfCookie is exported from auth", async () => {
      const { clearCsrfCookie } = await import("@/lib/auth");
      expect(typeof clearCsrfCookie).toBe("function");
    });

    it("csrfFetch is exported from csrf", async () => {
      const { csrfFetch } = await import("@/lib/csrf");
      expect(typeof csrfFetch).toBe("function");
    });
  });
});
