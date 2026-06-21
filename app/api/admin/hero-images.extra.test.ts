import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.TOKEN_SECRET = "test-secret-key-for-unit-tests-only";

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
};
const mockInsertValues = vi.fn().mockResolvedValue([]);

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({ ...mockSelectChain })),
    from: vi.fn(() => mockSelectChain),
    where: vi.fn(() => mockSelectChain),
    orderBy: vi.fn(() => mockSelectChain),
    limit: vi.fn(() => Promise.resolve([])),
    insert: vi.fn(() => ({ values: mockInsertValues })),
  },
  schema: {
    hero_images: { id: "id", name: "name", url: "url", order_index: "order_index", is_active: "is_active", created_at: "created_at" },
  },
}));

vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn().mockResolvedValue({ url: "/uploads/hero.webp", path: "hero.webp" }),
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: vi.fn(),
}));

import { GET as heroGET, POST as heroPOST } from "./hero-images/route";
import { createMockRequest, createAdminHeaders } from "../test-utils";

describe("API: /api/admin/hero-images - extended", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return 200 with empty data", async () => {
      mockSelectChain.orderBy.mockResolvedValue([]);
      const response = await heroGET();
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it("should return 200 with hero images", async () => {
      mockSelectChain.orderBy.mockResolvedValue([
        { id: "1", name: "Banner 1", url: "/uploads/hero1.webp", order_index: 1, is_active: true },
        { id: "2", name: "Banner 2", url: "/uploads/hero2.webp", order_index: 2, is_active: false },
      ]);
      const response = await heroGET();
      expect(response.status).toBe(200);
    });
  });
});
