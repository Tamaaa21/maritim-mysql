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
    hero_images: { id: "id", name: "name", url: "url", order_index: "order_index", is_active: "is_active", created_at: "created_at" },
    publications: { id: "id", title: "title", description: "description", url: "url", file_path: "file_path", cover_url: "cover_url", uploader: "uploader", created_at: "created_at" },
    layanan_cards: { id: "id", nama_layanan: "nama_layanan", deskripsi: "deskripsi", url_google_form: "url_google_form", cover_url: "cover_url", created_at: "created_at" },
    display_slides: { id: "id", title: "title", url: "url", order: "order", uploader: "uploader", waktu_berakhir: "waktu_berakhir", created_at: "created_at" },
  },
}));

vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn().mockResolvedValue({ url: "/uploads/test.webp", path: "test.webp" }),
  deleteFile: vi.fn(),
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: vi.fn(),
}));

import { GET as heroGET, POST as heroPOST } from "./hero-images/route";
import { GET as pubGET, POST as pubPOST, DELETE as pubDELETE } from "./publications/route";
import { GET as layananGET, POST as layananPOST } from "./layanan-cards/route";
import { GET as displayGET, POST as displayPOST, DELETE as displayDELETE } from "./display/route";
import { createMockRequest, createAdminHeaders } from "../test-utils";

describe("API: /api/admin/hero-images", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET should return 200 with cached data", async () => {
    mockSelectChain.orderBy.mockResolvedValue([{ id: "1", name: "Banner", url: "/img.webp" }]);
    const response = await heroGET();
    expect(response.status).toBe(200);
  });

  it("POST should return 400 when no file or URL provided", async () => {
    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: {},
    });
    const response = await heroPOST(req);
    expect(response.status).toBe(400);
  });
});

describe("API: /api/admin/publications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET should return 200", async () => {
    mockSelectChain.orderBy.mockResolvedValue([]);
    const response = await pubGET();
    expect(response.status).toBe(200);
  });

  it("DELETE should return 400 when no id", async () => {
    const req = createMockRequest({ method: "DELETE", url: "http://localhost:3000/api/admin/publications", headers: createAdminHeaders() });
    const response = await pubDELETE(req);
    expect(response.status).toBe(400);
  });

  it("DELETE should return 404 when publication not found", async () => {
    mockSelectChain.where.mockResolvedValue([]);
    const req = createMockRequest({ method: "DELETE", url: "http://localhost:3000/api/admin/publications?id=nonexistent", headers: createAdminHeaders() });
    const response = await pubDELETE(req);
    expect(response.status).toBe(404);
  });
});

describe("API: /api/admin/layanan-cards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET should return 200", async () => {
    mockSelectChain.orderBy.mockResolvedValue([]);
    const response = await layananGET();
    expect(response.status).toBe(200);
  });

  it("POST should return 400 on invalid data", async () => {
    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: { nama_layanan: "" },
    });
    const response = await layananPOST(req);
    expect(response.status).toBe(400);
  });

  it("POST should return 200 on valid data", async () => {
    mockSelectChain.where.mockResolvedValue([{ id: "new-id", nama_layanan: "Test Layanan", deskripsi: null, url_google_form: null, cover_url: null, created_at: "2024-01-01" }]);

    const req = createMockRequest({
      method: "POST",
      headers: createAdminHeaders(),
      body: { nama_layanan: "Test Layanan" },
    });
    const response = await layananPOST(req);
    expect(response.status).toBe(200);
  });
});

describe("API: /api/admin/display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET should return 200", async () => {
    mockSelectChain.orderBy.mockResolvedValue([]);
    const response = await displayGET();
    expect(response.status).toBe(200);
  });

  it("DELETE should return 400 when no id", async () => {
    const req = createMockRequest({ method: "DELETE", url: "http://localhost:3000/api/admin/display", headers: createAdminHeaders() });
    const response = await displayDELETE(req);
    expect(response.status).toBe(400);
  });

  it("DELETE should return 404 when not found", async () => {
    mockSelectChain.where.mockResolvedValue([]);
    const req = createMockRequest({ method: "DELETE", url: "http://localhost:3000/api/admin/display?id=nonexistent", headers: createAdminHeaders() });
    const response = await displayDELETE(req);
    expect(response.status).toBe(404);
  });
});
