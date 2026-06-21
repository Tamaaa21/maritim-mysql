import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.TOKEN_SECRET = "test-secret-key-for-unit-tests-only";

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
};
const mockInsertValues = vi.fn().mockResolvedValue([]);
const mockDeleteWhere = vi.fn().mockResolvedValue([]);

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({ ...mockSelectChain })),
    from: vi.fn(() => mockSelectChain),
    where: vi.fn(() => mockSelectChain),
    orderBy: vi.fn(() => mockSelectChain),
    limit: vi.fn(() => Promise.resolve([])),
    insert: vi.fn(() => ({ values: mockInsertValues })),
    delete: vi.fn(() => ({ where: mockDeleteWhere })),
  },
  schema: {
    publications: { id: "id", title: "title", description: "description", url: "url", file_path: "file_path", cover_url: "cover_url", uploader: "uploader", created_at: "created_at" },
  },
}));

vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn().mockResolvedValue({ url: "/uploads/test.webp", path: "test.webp" }),
  deleteFile: vi.fn(),
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: vi.fn(),
}));

import { GET as pubGET, POST as pubPOST, DELETE as pubDELETE } from "./publications/route";
import { createMockRequest, createAdminHeaders } from "../test-utils";

describe("API: /api/admin/publications - extended", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST", () => {
    it("should return 500 when FormData parsing fails", async () => {
      const req = createMockRequest({
        method: "POST",
        headers: createAdminHeaders(),
        body: {},
      });
      const response = await pubPOST(req);
      expect(response.status).toBe(500);
    });
  });

  describe("DELETE", () => {
    it("should delete publication with file_path", async () => {
      const publication = {
        id: "pub-1",
        title: "Test",
        file_path: "publications/test.pdf",
        description: null,
        url: "/uploads/test.pdf",
        cover_url: null,
        uploader: "admin",
        created_at: new Date(),
      };
      mockSelectChain.where.mockResolvedValueOnce([publication]);
      mockDeleteWhere.mockResolvedValue([]);

      const { deleteFile } = await import("@/lib/storage");
      const req = createMockRequest({
        method: "DELETE",
        url: "http://localhost:3000/api/admin/publications?id=pub-1",
        headers: createAdminHeaders(),
      });
      const response = await pubDELETE(req);
      expect(response.status).toBe(200);
      expect(deleteFile).toHaveBeenCalledWith("publications/test.pdf");
    });

    it("should delete publication without file_path", async () => {
      const publication = {
        id: "pub-2",
        title: "URL Pub",
        file_path: null,
        description: null,
        url: "https://example.com/doc.pdf",
        cover_url: null,
        uploader: "admin",
        created_at: new Date(),
      };
      mockSelectChain.where.mockResolvedValueOnce([publication]);
      mockDeleteWhere.mockResolvedValue([]);

      const { deleteFile } = await import("@/lib/storage");
      const req = createMockRequest({
        method: "DELETE",
        url: "http://localhost:3000/api/admin/publications?id=pub-2",
        headers: createAdminHeaders(),
      });
      const response = await pubDELETE(req);
      expect(response.status).toBe(200);
      expect(deleteFile).not.toHaveBeenCalled();
    });
  });
});
