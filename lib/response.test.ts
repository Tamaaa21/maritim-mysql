import { describe, it, expect } from "vitest";
import { ok, okCached, created, badRequest, notFound, conflict, serverError, paginated } from "./response";

describe("response helpers", () => {
  describe("ok", () => {
    it("should return 200 with data", async () => {
      const response = ok({ name: "test" });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ name: "test" });
    });

    it("should include message", async () => {
      const response = ok({ name: "test" }, "Success");
      const body = await response.json();
      expect(body.message).toBe("Success");
    });

    it("should include cache headers", async () => {
      const response = ok({ name: "test" }, undefined, 60);
      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toContain("s-maxage=60");
    });
  });

  describe("okCached", () => {
    it("should return 200 with cache headers", async () => {
      const response = okCached({ name: "test" });
      const body = await response.json();
      expect(body.success).toBe(true);
      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toContain("s-maxage=60");
    });
  });

  describe("created", () => {
    it("should return 201", async () => {
      const response = created({ id: "1" });
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.success).toBe(true);
    });
  });

  describe("badRequest", () => {
    it("should return 400", async () => {
      const response = badRequest("Invalid input");
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe("Invalid input");
    });
  });

  describe("notFound", () => {
    it("should return 404", async () => {
      const response = notFound();
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.success).toBe(false);
    });

    it("should accept custom message", async () => {
      const response = notFound("Custom not found");
      const body = await response.json();
      expect(body.message).toBe("Custom not found");
    });
  });

  describe("conflict", () => {
    it("should return 409", async () => {
      const response = conflict("Already exists");
      expect(response.status).toBe(409);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe("Already exists");
    });
  });

  describe("serverError", () => {
    it("should return 500", async () => {
      const response = serverError();
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
    });

    it("should log error", async () => {
      const consoleSpy = { error: (...args: any[]) => {} };
      const original = console.error;
      console.error = consoleSpy.error;
      serverError(new Error("test error"));
      console.error = original;
    });
  });

  describe("paginated", () => {
    it("should return paginated data", async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = paginated(data, 100, 1, 10);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.pagination).toEqual({
        total: 100,
        page: 1,
        perPage: 10,
        totalPages: 10,
      });
    });
  });
});
