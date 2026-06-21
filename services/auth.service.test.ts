import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.TOKEN_SECRET = "test-secret-key-for-unit-tests-only";

const { mockDb, mockInsertValues, mockUpdateWhere } = vi.hoisted(() => {
  const mockLimitFn = vi.fn().mockResolvedValue([]);
  const mockInsertValues = vi.fn().mockResolvedValue([]);
  const mockUpdateWhere = vi.fn().mockResolvedValue([]);
  const mockDeleteWhere = vi.fn().mockResolvedValue([]);

  const mockSelectResult: Record<string, any> = {
    limit: mockLimitFn,
  };

  const mockDb = {
    select: vi.fn(() => mockSelectResult),
    from: vi.fn(() => mockSelectResult),
    where: vi.fn(() => mockSelectResult),
    limit: mockLimitFn,
    insert: vi.fn(() => ({ values: mockInsertValues })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: mockUpdateWhere })), where: mockUpdateWhere })),
    delete: vi.fn(() => ({ where: mockDeleteWhere })),
  };

  return { mockDb, mockInsertValues, mockUpdateWhere };
});

vi.mock("@/db", () => ({
  db: mockDb,
  schema: {
    users: { id: "id", username: "username", password: "password", role: "role", nama: "nama", is_active: "is_active" },
    login_logs: { id: "id", user_id: "user_id", username: "username", ip_address: "ip_address", user_agent: "user_agent", aktivitas: "aktivitas" },
  },
}));

import { login, recordLoginLog, getCurrentUser, changePassword } from "./auth.service";
import { hashPassword } from "@/lib";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.select.mockClear();
    mockDb.from.mockClear();
    mockDb.where.mockClear();
    mockDb.limit.mockClear();
  });

  describe("login", () => {
    it("should return success with valid credentials", async () => {
      const hashedPassword = await hashPassword("admin123");
      const mockUser = {
        id: "user-1",
        username: "admin",
        password: hashedPassword,
        role: "super_admin",
        nama: "Administrator",
        is_active: true,
      };

      mockDb.limit.mockResolvedValue([mockUser]);
      mockDb.select.mockReturnValue({ from: () => ({ where: () => ({ limit: () => Promise.resolve([mockUser]) }) }) });

      const result = await login("admin", "admin123", "127.0.0.1");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.user.username).toBe("admin");
        expect(result.user.role).toBe("super_admin");
      }
    });

    it("should return failure for non-existent user", async () => {
      mockDb.select.mockReturnValue({ from: () => ({ where: () => ({ limit: () => Promise.resolve([]) }) }) });

      const result = await login("nonexistent", "pass", "127.0.0.1");
      expect(result.success).toBe(false);
    });

    it("should return failure for inactive user", async () => {
      const hashedPassword = await hashPassword("admin123");
      const mockUser = {
        id: "user-1",
        username: "admin",
        password: hashedPassword,
        role: "admin",
        nama: "Admin",
        is_active: false,
      };

      mockDb.select.mockReturnValue({ from: () => ({ where: () => ({ limit: () => Promise.resolve([mockUser]) }) }) });

      const result = await login("admin", "admin123", "127.0.0.1");
      expect(result.success).toBe(false);
    });

    it("should return failure for wrong password", async () => {
      const hashedPassword = await hashPassword("correct-password");
      const mockUser = {
        id: "user-1",
        username: "admin",
        password: hashedPassword,
        role: "admin",
        nama: "Admin",
        is_active: true,
      };

      mockDb.select.mockReturnValue({ from: () => ({ where: () => ({ limit: () => Promise.resolve([mockUser]) }) }) });

      const result = await login("admin", "wrong-password", "127.0.0.1");
      expect(result.success).toBe(false);
    });
  });

  describe("getCurrentUser", () => {
    it("should return user when found", async () => {
      const mockUser = { id: "user-1", username: "admin", role: "admin", nama: "Admin" };
      mockDb.select.mockReturnValue({ from: () => ({ where: () => ({ limit: () => Promise.resolve([mockUser]) }) }) });

      const user = await getCurrentUser("user-1");
      expect(user).toEqual(mockUser);
    });

    it("should return null when not found", async () => {
      mockDb.select.mockReturnValue({ from: () => ({ where: () => ({ limit: () => Promise.resolve([]) }) }) });

      const user = await getCurrentUser("nonexistent");
      expect(user).toBeNull();
    });
  });

  describe("recordLoginLog", () => {
    it("should insert login log", async () => {
      await recordLoginLog("user-1", "admin", "127.0.0.1", "Mozilla/5.0");
      expect(mockInsertValues).toHaveBeenCalled();
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const hashedPassword = await hashPassword("oldpass123");
      const mockUser = { password: hashedPassword };
      mockDb.select.mockReturnValue({ from: () => ({ where: () => ({ limit: () => Promise.resolve([mockUser]) }) }) });
      mockUpdateWhere.mockResolvedValue([]);

      const result = await changePassword("user-1", "oldpass123", "newpass456");
      expect(result.success).toBe(true);
    });

    it("should fail with wrong current password", async () => {
      const hashedPassword = await hashPassword("correctpass");
      const mockUser = { password: hashedPassword };
      mockDb.select.mockReturnValue({ from: () => ({ where: () => ({ limit: () => Promise.resolve([mockUser]) }) }) });

      const result = await changePassword("user-1", "wrongpass", "newpass456");
      expect(result.success).toBe(false);
      expect(result.message).toContain("salah");
    });

    it("should fail when user not found", async () => {
      mockDb.select.mockReturnValue({ from: () => ({ where: () => ({ limit: () => Promise.resolve([]) }) }) });

      const result = await changePassword("nonexistent", "oldpass", "newpass");
      expect(result.success).toBe(false);
    });
  });
});
