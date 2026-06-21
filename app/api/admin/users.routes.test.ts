import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.TOKEN_SECRET = "test-secret-key-for-unit-tests-only";

const mockSelectResult = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  orderBy: vi.fn().mockResolvedValue([]),
};
const mockInsertValues = vi.fn().mockResolvedValue([]);
const mockUpdateSet = vi.fn().mockReturnThis();
const mockUpdateWhere = vi.fn().mockResolvedValue([]);
const mockDeleteWhere = vi.fn().mockResolvedValue([]);

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({ ...mockSelectResult })),
    from: vi.fn(() => mockSelectResult),
    where: vi.fn(() => mockSelectResult),
    limit: vi.fn(() => Promise.resolve([])),
    insert: vi.fn(() => ({ values: mockInsertValues })),
    update: vi.fn(() => ({ set: mockUpdateSet, where: mockUpdateWhere })),
    delete: vi.fn(() => ({ where: mockDeleteWhere })),
  },
  schema: {
    users: { id: "id", username: "username", password: "password", role: "role", nama: "nama", is_active: "is_active", created_at: "created_at" },
  },
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: vi.fn(),
}));

import { GET as usersGET, POST as usersPOST } from "./users/route";
import { PATCH as userPATCH, DELETE as userDELETE } from "./users/[id]/route";
import { POST as changePasswordPOST } from "./change-password/route";
import { createMockRequest, createAdminHeaders, createSuperAdminHeaders, createKaryawanHeaders } from "../test-utils";

describe("API: /api/admin/users GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 for admin role", async () => {
    mockSelectResult.orderBy.mockResolvedValue([
      { id: "u1", username: "user1", role: "karyawan", nama: "User 1", is_active: true, created_at: "2024-01-01" },
    ]);

    const req = createMockRequest({ method: "GET", headers: createAdminHeaders() });
    const response = await usersGET(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should return 403 for karyawan role", async () => {
    const req = createMockRequest({ method: "GET", headers: createKaryawanHeaders() });
    const response = await usersGET(req);
    expect(response.status).toBe(403);
  });
});

describe("API: /api/admin/users POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 403 for karyawan role", async () => {
    const req = createMockRequest({
      method: "POST",
      headers: createKaryawanHeaders(),
      body: { username: "newuser", password: "Admin123", role: "karyawan" },
    });
    const response = await usersPOST(req);
    expect(response.status).toBe(403);
  });

  it("should return 400 on invalid data", async () => {
    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: { username: "", password: "" },
    });
    const response = await usersPOST(req);
    expect(response.status).toBe(400);
  });

  it("should return 409 when username exists", async () => {
    mockSelectResult.limit.mockResolvedValueOnce([{ id: "existing" }]);

    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: { username: "existing", password: "Admin123", role: "karyawan" },
    });
    const response = await usersPOST(req);
    expect(response.status).toBe(409);
  });

  it("should return 403 when admin tries to create super_admin", async () => {
    mockSelectResult.limit.mockResolvedValueOnce([]);
    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: { username: "newadmin", password: "Admin123", role: "super_admin" },
    });
    const response = await usersPOST(req);
    expect(response.status).toBe(403);
  });

  it("should return 200 on successful create", async () => {
    mockSelectResult.limit
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "new-id", username: "newuser", role: "karyawan", nama: "newuser", is_active: true, created_at: "2024-01-01" }]);

    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: { username: "newuser", password: "Admin123", role: "karyawan" },
    });
    const response = await usersPOST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});

describe("API: /api/admin/users/[id] PATCH", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 403 for karyawan role", async () => {
    const req = createMockRequest({
      method: "PATCH",
      url: "http://localhost:3000/api/admin/users/user-1",
      headers: createKaryawanHeaders(),
      body: { nama: "Updated Name" },
    });
    const response = await userPATCH(req);
    expect(response.status).toBe(403);
  });

  it("should return 400 with empty update data", async () => {
    const req = createMockRequest({
      method: "PATCH",
      url: "http://localhost:3000/api/admin/users/user-1",
      headers: createAdminHeaders(),
      body: {},
    });
    const response = await userPATCH(req);
    expect(response.status).toBe(400);
  });

  it("should return 403 when admin tries to set super_admin role", async () => {
    const req = createMockRequest({
      method: "PATCH",
      url: "http://localhost:3000/api/admin/users/user-1",
      headers: createAdminHeaders(),
      body: { role: "super_admin" },
    });
    const response = await userPATCH(req);
    expect(response.status).toBe(403);
  });

  it("should return 200 on successful update", async () => {
    mockUpdateWhere.mockResolvedValue([]);
    mockSelectResult.limit.mockResolvedValue([{
      id: "user-1", username: "user1", role: "karyawan", nama: "Updated", is_active: true, created_at: "2024-01-01"
    }]);

    const req = createMockRequest({
      method: "PATCH",
      url: "http://localhost:3000/api/admin/users/user-1",
      headers: createSuperAdminHeaders(),
      body: { role: "super_admin" },
    });
    const response = await userPATCH(req);
    expect(response.status).toBe(200);
  });
});

describe("API: /api/admin/users/[id] DELETE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 403 for karyawan role", async () => {
    const req = createMockRequest({
      method: "DELETE",
      url: "http://localhost:3000/api/admin/users/user-1",
      headers: createKaryawanHeaders(),
    });
    const response = await userDELETE(req);
    expect(response.status).toBe(403);
  });

  it("should return 200 on successful delete", async () => {
    mockSelectResult.limit.mockResolvedValue([{ id: "user-1", username: "user1" }]);
    mockDeleteWhere.mockResolvedValue([]);

    const req = createMockRequest({
      method: "DELETE",
      url: "http://localhost:3000/api/admin/users/user-1",
      headers: createAdminHeaders(),
    });
    const response = await userDELETE(req);
    expect(response.status).toBe(200);
  });
});

describe("API: /api/admin/change-password POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when no user id header", async () => {
    const req = createMockRequest({
      method: "POST",
      headers: { "content-type": "application/json" },
      body: { currentPassword: "old123", newPassword: "NewPass123" },
    });
    const response = await changePasswordPOST(req);
    expect(response.status).toBe(401);
  });

  it("should return 400 on invalid input", async () => {
    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: { currentPassword: "", newPassword: "weak" },
    });
    const response = await changePasswordPOST(req);
    expect(response.status).toBe(400);
  });
});
