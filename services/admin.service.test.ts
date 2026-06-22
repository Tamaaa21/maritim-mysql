import { describe, it, expect, vi } from "vitest";
import { getUserId, getUsername, getRole, isAdmin, isSuperAdmin, getClientIp, getUserAgent } from "./admin.service";

function createMockRequest(headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (name: string) => headers[name] || null,
    },
  } as any;
}

describe("admin.service", () => {
  describe("getUserId", () => {
    it("should return user id from headers", () => {
      const req = createMockRequest({ "x-auth-user-id": "user-123" });
      expect(getUserId(req)).toBe("user-123");
    });

    it("should return empty string when not present", () => {
      const req = createMockRequest({});
      expect(getUserId(req)).toBe("");
    });
  });

  describe("getUsername", () => {
    it("should return username from headers", () => {
      const req = createMockRequest({ "x-auth-user-username": "admin" });
      expect(getUsername(req)).toBe("admin");
    });

    it("should return empty string when not present", () => {
      const req = createMockRequest({});
      expect(getUsername(req)).toBe("");
    });
  });

  describe("getRole", () => {
    it("should return role from headers", () => {
      const req = createMockRequest({ "x-auth-user-role": "super_admin" });
      expect(getRole(req)).toBe("super_admin");
    });
  });

  describe("isAdmin", () => {
    it("should return true for admin role", () => {
      const req = createMockRequest({ "x-auth-user-role": "admin" });
      expect(isAdmin(req)).toBe(true);
    });

    it("should return true for super_admin role", () => {
      const req = createMockRequest({ "x-auth-user-role": "super_admin" });
      expect(isAdmin(req)).toBe(true);
    });

    it("should return false for user role", () => {
      const req = createMockRequest({ "x-auth-user-role": "user" });
      expect(isAdmin(req)).toBe(false);
    });

    it("should return false for empty role", () => {
      const req = createMockRequest({});
      expect(isAdmin(req)).toBe(false);
    });
  });

  describe("isSuperAdmin", () => {
    it("should return true for super_admin", () => {
      const req = createMockRequest({ "x-auth-user-role": "super_admin" });
      expect(isSuperAdmin(req)).toBe(true);
    });

    it("should return false for admin", () => {
      const req = createMockRequest({ "x-auth-user-role": "admin" });
      expect(isSuperAdmin(req)).toBe(false);
    });
  });

  describe("getClientIp", () => {
    it("should return x-forwarded-for IP", () => {
      const req = {
        headers: {
          get: (name: string) => {
            if (name === "x-forwarded-for") return "192.168.1.1, 10.0.0.1";
            return null;
          },
        },
      } as any;
      expect(getClientIp(req)).toBe("192.168.1.1");
    });

    it("should return x-real-ip when x-forwarded-for is missing", () => {
      const req = {
        headers: {
          get: (name: string) => {
            if (name === "x-real-ip") return "10.0.0.1";
            return null;
          },
        },
      } as any;
      expect(getClientIp(req)).toBe("10.0.0.1");
    });

    it("should return 'unknown' when no IP headers present", () => {
      const req = {
        headers: {
          get: () => null,
        },
      } as any;
      expect(getClientIp(req)).toBe("unknown");
    });
  });

  describe("getUserAgent", () => {
    it("should return user agent from headers", () => {
      const req = createMockRequest({ "user-agent": "Mozilla/5.0" });
      expect(getUserAgent(req)).toBe("Mozilla/5.0");
    });

    it("should return 'unknown' when not present", () => {
      const req = createMockRequest({});
      expect(getUserAgent(req)).toBe("unknown");
    });
  });
});
