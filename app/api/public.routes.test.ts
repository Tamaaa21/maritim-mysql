import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  leftJoin: vi.fn().mockReturnThis(),
};

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({ ...mockSelectChain })),
    from: vi.fn(() => mockSelectChain),
    where: vi.fn(() => mockSelectChain),
    orderBy: vi.fn(() => mockSelectChain),
    limit: vi.fn(() => Promise.resolve([])),
  },
  schema: {
    publications: { created_at: "created_at" },
    struktur_organisasi: { urutan: "urutan" },
    prakiraan_images: { slug: "slug", category_id: "category_id" },
    prakiraan_categories: { id: "id", name: "name", slug: "slug", description: "description", icon: "icon" },
  },
}));

import { GET as pubGET } from "./publications/route";
import { GET as strukturGET } from "./struktur-organisasi/route";
import { GET as prakiraanGET } from "./prakiraan/[slug]/route";
import { createMockRequest } from "./test-utils";

function createParams(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe("API: /api/publications GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with publications", async () => {
    mockSelectChain.orderBy.mockResolvedValue([{ id: "1", title: "Publikasi 1" }]);
    const response = await pubGET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should return 200 with empty array", async () => {
    mockSelectChain.orderBy.mockResolvedValue([]);
    const response = await pubGET();
    expect(response.status).toBe(200);
  });
});

describe("API: /api/struktur-organisasi GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with struktur data", async () => {
    mockSelectChain.orderBy.mockResolvedValue([
      { id: "1", jabatan: "Kepala", nama: "Budi", inisial: "B", deskripsi: null, urutan: 1, created_at: "2024-01-01", updated_at: "2024-01-01" },
    ]);
    const response = await strukturGET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});

describe("API: /api/prakiraan/[slug] GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when prakiraan not found", async () => {
    mockSelectChain.limit.mockResolvedValue([]);
    const req = createMockRequest({ method: "GET" });
    const response = await prakiraanGET(req, createParams("nonexistent-slug"));
    expect(response.status).toBe(404);
  });

  it("should return 200 with prakiraan data", async () => {
    mockSelectChain.limit.mockResolvedValue([{
      prakiraan_images: { id: "1", title: "Prakiraan", slug: "prakiraan-1", url: "/img.webp" },
      prakiraan_categories: { id: "cat-1", name: "Cuaca", slug: "cuaca", description: null, icon: "Sun" },
    }]);

    const req = createMockRequest({ method: "GET" });
    const response = await prakiraanGET(req, createParams("prakiraan-1"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should return 200 with null category when no category", async () => {
    mockSelectChain.limit.mockResolvedValue([{
      prakiraan_images: { id: "1", title: "Prakiraan", slug: "prakiraan-1", url: "/img.webp" },
      prakiraan_categories: null,
    }]);

    const req = createMockRequest({ method: "GET" });
    const response = await prakiraanGET(req, createParams("prakiraan-1"));
    expect(response.status).toBe(200);
  });
});
