import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.TOKEN_SECRET = "test-secret-key-for-unit-tests-only";

const mockInsertValues = vi.fn().mockResolvedValue([]);
const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  orderBy: vi.fn().mockResolvedValue([]),
  select: vi.fn().mockReturnThis(),
};
const mockUpdateChain = { set: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([]) };

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({ ...mockSelectChain })),
    from: vi.fn(() => mockSelectChain),
    where: vi.fn(() => mockSelectChain),
    limit: vi.fn(() => Promise.resolve([])),
    insert: vi.fn(() => ({ values: mockInsertValues })),
    update: vi.fn(() => mockUpdateChain),
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
  changePassword: vi.fn(),
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

import { login, recordLoginLog, getCurrentUser } from "@/services/auth.service";
import { POST as loginPOST } from "./login/route";
import { POST as logoutPOST } from "./logout/route";
import { GET as meGET } from "./me/route";
import { createMockRequest, createAdminHeaders, createKaryawanHeaders } from "../test-utils";

describe("API: /api/admin/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 on successful login", async () => {
    vi.mocked(login).mockResolvedValue({
      success: true,
      token: "test-token",
      user: { id: "user-1", username: "admin", role: "super_admin", nama: "Administrator" },
    });

    const req = createMockRequest({
      method: "POST",
      body: { username: "admin", password: "admin123" },
    });

    const response = await loginPOST(req);
    expect(response.status).toBe(200);
  });

  it("should return 400 on invalid input", async () => {
    const req = createMockRequest({
      method: "POST",
      body: { username: "", password: "" },
    });

    const response = await loginPOST(req);
    expect(response.status).toBe(400);
  });

  it("should return 401 on wrong credentials", async () => {
    vi.mocked(login).mockResolvedValue({
      success: false,
      response: new Response(JSON.stringify({ message: "Username atau password salah" }), { status: 401 }) as any,
    });

    const req = createMockRequest({
      method: "POST",
      body: { username: "admin", password: "wrong" },
    });

    const response = await loginPOST(req);
    expect(response.status).toBe(401);
  });

  it("should return 500 on server error", async () => {
    vi.mocked(login).mockRejectedValue(new Error("DB error"));

    const req = createMockRequest({
      method: "POST",
      body: { username: "admin", password: "admin123" },
    });

    const response = await loginPOST(req);
    expect(response.status).toBe(500);
  });
});

describe("API: /api/admin/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 on logout", async () => {
    const req = createMockRequest({ method: "POST", headers: createAdminHeaders() });
    const response = await logoutPOST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});

describe("API: /api/admin/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with user data", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-admin-1",
      username: "admin",
      password: "hashed",
      role: "admin",
      nama: "Administrator",
      is_active: true,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-01"),
    } as any);

    const req = createMockRequest({ method: "GET", headers: createAdminHeaders() });
    const response = await meGET(req);
    expect(response.status).toBe(200);
  });

  it("should return 401 when user not found", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any);

    const req = createMockRequest({ method: "GET", headers: createAdminHeaders() });
    const response = await meGET(req);
    expect(response.status).toBe(401);
  });
});
