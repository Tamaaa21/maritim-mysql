import { describe, it, expect, beforeEach } from "vitest";
import { createSessionToken, verifySessionToken, COOKIE_NAME, SESSION_DURATION_MS } from "./auth-edge";

describe("auth-edge", () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = "test-secret-key-for-unit-tests-only";
  });

  describe("createSessionToken", () => {
    it("should return a base64url string", async () => {
      const token = await createSessionToken("user-1", "admin", "testuser");
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should contain userId, role, username in payload", async () => {
      const token = await createSessionToken("user-123", "super_admin", "admin");
      const decoded = Buffer.from(token, "base64url").toString();
      expect(decoded).toContain("user-123");
      expect(decoded).toContain("super_admin");
      expect(decoded).toContain("admin");
    });
  });

  describe("verifySessionToken", () => {
    it("should return valid result for a valid token", async () => {
      const token = await createSessionToken("user-1", "admin", "testuser");
      const result = await verifySessionToken(token);
      expect(result.valid).toBe(true);
      expect(result.userId).toBe("user-1");
      expect(result.role).toBe("admin");
      expect(result.username).toBe("testuser");
    });

    it("should return invalid for tampered token", async () => {
      const token = await createSessionToken("user-1", "admin", "testuser");
      const tampered = token.slice(0, -5) + "XXXXX";
      const result = await verifySessionToken(tampered);
      expect(result.valid).toBe(false);
    });

    it("should return invalid for empty token", async () => {
      const result = await verifySessionToken("");
      expect(result.valid).toBe(false);
    });

    it("should return invalid for malformed token", async () => {
      const result = await verifySessionToken("not-a-valid-token");
      expect(result.valid).toBe(false);
    });

    it("should reject token with different signature length (timing-safe)", async () => {
      const token = await createSessionToken("user-1", "admin", "testuser");
      const parts = Buffer.from(token, "base64url").toString().split(":");
      const tampered = Buffer.from(parts.slice(0, -1).join(":") + ":short").toString("base64url");
      const result = await verifySessionToken(tampered);
      expect(result.valid).toBe(false);
    });

    it("should reject token with completely different signature", async () => {
      const token = await createSessionToken("user-1", "admin", "testuser");
      const parts = Buffer.from(token, "base64url").toString().split(":");
      const fakeSig = "a".repeat(parts[parts.length - 1].length);
      const tampered = Buffer.from(parts.slice(0, -1).join(":") + ":" + fakeSig).toString("base64url");
      const result = await verifySessionToken(tampered);
      expect(result.valid).toBe(false);
    });
  });

  describe("constants", () => {
    it("should have correct cookie name", () => {
      expect(COOKIE_NAME).toBe("admin_token");
    });

    it("should have 24h session duration", () => {
      expect(SESSION_DURATION_MS).toBe(24 * 60 * 60 * 1000);
    });
  });
});
