import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
  },
  schema: {
    struktur_organisasi: { urutan: "urutan" },
    layanan_cards: { created_at: "created_at" },
    kegiatan_documents: { created_at: "created_at" },
    hero_images: { is_active: "is_active", order_index: "order_index" },
    publications: { created_at: "created_at" },
    prakiraan_categories: { created_at: "created_at" },
    display_slides: { order: "order" },
  },
}));

import {
  getStrukturOrganisasi,
  getLayananCards,
  getKegiatanDocuments,
  getHeroImages,
  getPublikasi,
  getPrakiraanCategories,
  getDisplaySlides,
} from "./public.service";
import { db, schema } from "@/db";

function resetMocks() {
  vi.clearAllMocks();
  const mockOrderBy = vi.fn().mockResolvedValue([]);
  const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere, orderBy: mockOrderBy });
  (db.select as any).mockReturnValue({ from: mockFrom });
  return { mockOrderBy, mockFrom, mockWhere };
}

describe("public.service", () => {
  beforeEach(() => {
    resetMocks();
  });

  describe("getStrukturOrganisasi", () => {
    it("should return struktur organisasi data", async () => {
      const mockData = [
        { id: "1", jabatan: "Kepala", nama: "Budi", urutan: 1 },
        { id: "2", jabatan: "Sekretaris", nama: "Ani", urutan: 2 },
      ];
      const mockOrderBy = vi.fn().mockResolvedValue(mockData);
      const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await getStrukturOrganisasi();
      expect(result).toEqual(mockData);
    });
  });

  describe("getLayananCards", () => {
    it("should return layanan cards data", async () => {
      const mockData = [{ id: "1", nama_layanan: "Layanan A" }];
      const mockOrderBy = vi.fn().mockResolvedValue(mockData);
      const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await getLayananCards();
      expect(result).toEqual(mockData);
    });
  });

  describe("getKegiatanDocuments", () => {
    it("should return kegiatan documents data", async () => {
      const mockData = [{ id: "1", title: "Kegiatan 1" }];
      const mockOrderBy = vi.fn().mockResolvedValue(mockData);
      const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await getKegiatanDocuments();
      expect(result).toEqual(mockData);
    });
  });

  describe("getHeroImages", () => {
    it("should return active hero images", async () => {
      const mockData = [{ id: "1", name: "Banner 1", is_active: true }];
      const mockOrderBy = vi.fn().mockResolvedValue(mockData);
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await getHeroImages();
      expect(result).toEqual(mockData);
    });
  });

  describe("getPublikasi", () => {
    it("should return publications data", async () => {
      const mockData = [{ id: "1", title: "Publikasi 1" }];
      const mockOrderBy = vi.fn().mockResolvedValue(mockData);
      const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await getPublikasi();
      expect(result).toEqual(mockData);
    });
  });

  describe("getPrakiraanCategories", () => {
    it("should return prakiraan categories", async () => {
      const mockData = [{ id: "1", name: "Cuaca" }];
      const mockOrderBy = vi.fn().mockResolvedValue(mockData);
      const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await getPrakiraanCategories();
      expect(result).toEqual(mockData);
    });
  });

  describe("getDisplaySlides", () => {
    it("should return display slides", async () => {
      const mockData = [{ id: "1", title: "Slide 1", order: 1 }];
      const mockOrderBy = vi.fn().mockResolvedValue(mockData);
      const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await getDisplaySlides();
      expect(result).toEqual(mockData);
    });
  });
});
