import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.TOKEN_SECRET = "test-secret-key-for-unit-tests-only";

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
};
const mockUpdateSet = vi.fn().mockReturnThis();
const mockUpdateWhere = vi.fn().mockResolvedValue([]);

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({ ...mockSelectChain })),
    from: vi.fn(() => mockSelectChain),
    where: vi.fn(() => mockSelectChain),
    limit: vi.fn(() => Promise.resolve([])),
    update: vi.fn(() => ({ set: mockUpdateSet, where: mockUpdateWhere })),
  },
  schema: {
    users: { id: "id", password: "password" },
  },
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: vi.fn(),
}));

import { POST as changePasswordPOST } from "./change-password/route";
import { createMockRequest, createAdminHeaders } from "../test-utils";

describe("API: /api/admin/change-password POST - extended", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 on successful password change", async () => {
    const { hashPassword } = await import("@/lib/auth");
    const hashedPassword = await hashPassword("currentPass123");
    mockSelectChain.limit.mockResolvedValue([{ id: "user-1", password: hashedPassword }]);
    mockUpdateWhere.mockResolvedValue([]);

    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: { currentPassword: "currentPass123", newPassword: "NewPass456" },
    });
    const response = await changePasswordPOST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should return 400 when current password is wrong", async () => {
    const { hashPassword } = await import("@/lib/auth");
    const hashedPassword = await hashPassword("correctPass");
    mockSelectChain.limit.mockResolvedValue([{ id: "user-1", password: hashedPassword }]);

    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: { currentPassword: "wrongPass", newPassword: "NewPass456" },
    });
    const response = await changePasswordPOST(req);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.message).toContain("salah");
  });

  it("should return 404 when user not found", async () => {
    mockSelectChain.limit.mockResolvedValue([]);

    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: { currentPassword: "currentPass123", newPassword: "NewPass456" },
    });
    const response = await changePasswordPOST(req);
    expect(response.status).toBe(404);
  });

  it("should return 500 on server error", async () => {
    mockSelectChain.limit.mockRejectedValue(new Error("DB error"));

    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: { currentPassword: "currentPass123", newPassword: "NewPass456" },
    });
    const response = await changePasswordPOST(req);
    expect(response.status).toBe(500);
  });
});
