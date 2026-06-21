import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./auth";

describe("auth", () => {
  describe("hashPassword", () => {
    it("should return a bcrypt hash", async () => {
      const hash = await hashPassword("password123");
      expect(hash).toMatch(/^\$2[aby]?\$\d{2}\$/);
    });

    it("should produce different hashes for same input", async () => {
      const hash1 = await hashPassword("password123");
      const hash2 = await hashPassword("password123");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const hash = await hashPassword("mypassword");
      const result = await verifyPassword("mypassword", hash);
      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const hash = await hashPassword("mypassword");
      const result = await verifyPassword("wrongpassword", hash);
      expect(result).toBe(false);
    });
  });
});
