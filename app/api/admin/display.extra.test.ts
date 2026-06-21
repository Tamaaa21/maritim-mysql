import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.TOKEN_SECRET = "test-secret-key-for-unit-tests-only";

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
};
const mockInsertValues = vi.fn().mockResolvedValue([]);
const mockUpdateSet = vi.fn().mockReturnThis();
const mockUpdateWhere = vi.fn().mockResolvedValue([]);
const mockDeleteWhere = vi.fn().mockResolvedValue([]);

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({ ...mockSelectChain })),
    from: vi.fn(() => mockSelectChain),
    where: vi.fn(() => mockSelectChain),
    orderBy: vi.fn(() => mockSelectChain),
    limit: vi.fn(() => Promise.resolve([])),
    insert: vi.fn(() => ({ values: mockInsertValues })),
    update: vi.fn(() => ({ set: mockUpdateSet, where: mockUpdateWhere })),
    delete: vi.fn(() => ({ where: mockDeleteWhere })),
  },
  schema: {
    display_slides: { id: "id", title: "title", url: "url", order: "order", uploader: "uploader", waktu_berakhir: "waktu_berakhir", created_at: "created_at" },
  },
}));

vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn().mockResolvedValue({ url: "/uploads/slide.webp", path: "slide.webp" }),
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: vi.fn(),
}));

import { GET as displayGET, POST as displayPOST, DELETE as displayDELETE, PATCH as displayPATCH } from "./display/route";
import { createMockRequest, createAdminHeaders } from "../test-utils";

describe("API: /api/admin/display - extended", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return empty array", async () => {
      mockSelectChain.orderBy.mockResolvedValue([]);
      const response = await displayGET();
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it("should return display slides", async () => {
      mockSelectChain.orderBy.mockResolvedValue([
        { id: "1", title: "Slide 1", url: "/img1.webp", order: 1 },
        { id: "2", title: "Slide 2", url: "/img2.webp", order: 2 },
      ]);
      const response = await displayGET();
      expect(response.status).toBe(200);
    });
  });

  describe("POST", () => {
    it("should return 500 when FormData parsing fails", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: createAdminHeaders(),
        body: {},
      });
      const response = await displayPOST(req);
      expect(response.status).toBe(500);
    });
  });

  describe("PATCH", () => {
    it("should return 400 for missing id/direction", async () => {
      const req = createMockRequest({
        method: "PATCH",
        headers: createAdminHeaders(),
        body: { id: "1" },
      });
      const response = await displayPATCH(req);
      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid direction", async () => {
      const req = createMockRequest({
        method: "PATCH",
        headers: createAdminHeaders(),
        body: { id: "1", direction: "left" },
      });
      const response = await displayPATCH(req);
      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid body", async () => {
      const req = createMockRequest({
        method: "PATCH",
        headers: createAdminHeaders(),
        body: { items: "not-array" },
      });
      const response = await displayPATCH(req);
      expect(response.status).toBe(400);
    });
  });

  describe("DELETE", () => {
    it("should return 400 when no id", async () => {
      const req = createMockRequest({
        method: "DELETE",
        url: "http://localhost:3000/api/admin/display",
        headers: createAdminHeaders(),
      });
      const response = await displayDELETE(req);
      expect(response.status).toBe(400);
    });

    it("should return 404 when not found", async () => {
      mockSelectChain.where.mockResolvedValue([]);
      const req = createMockRequest({
        method: "DELETE",
        url: "http://localhost:3000/api/admin/display?id=nonexistent",
        headers: createAdminHeaders(),
      });
      const response = await displayDELETE(req);
      expect(response.status).toBe(404);
    });
  });
});
