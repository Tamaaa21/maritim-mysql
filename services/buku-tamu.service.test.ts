import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([]),
  },
  schema: {
    buku_tamu: {
      id: "id",
      nama: "nama",
      email: "email",
      no_telepon: "no_telepon",
      instansi: "instansi",
      keperluan: "keperluan",
      foto_url: "foto_url",
      foto_data: "foto_data",
      created_at: "created_at",
      updated_at: "updated_at",
    },
  },
}));

import { getAllBukuTamu, deleteBukuTamu, deleteAllBukuTamu, submitBukuTamu } from "./buku-tamu.service";
import { db, schema } from "@/db";

function resetMocks() {
  vi.clearAllMocks();
  const mockOrderBy = vi.fn().mockResolvedValue([]);
  const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
  (db.select as any).mockReturnValue({ from: mockFrom });

  const mockValues = vi.fn().mockResolvedValue([]);
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });
  (db.insert as any).mockReturnValue({ values: mockValues });

  const mockWhere = vi.fn().mockResolvedValue([{ affectedRows: 0 }]);
  const mockDeleteFrom = vi.fn().mockReturnValue({ where: mockWhere });
  (db.delete as any).mockReturnValue({ where: mockWhere });

  return { mockOrderBy, mockFrom, mockValues, mockInsert, mockWhere, mockDeleteFrom };
}

describe("buku-tamu.service", () => {
  beforeEach(() => {
    resetMocks();
  });

  describe("getAllBukuTamu", () => {
    it("should return all buku tamu", async () => {
      const mockData = [
        { id: "1", nama: "John", email: "john@test.com" },
        { id: "2", nama: "Jane", email: "jane@test.com" },
      ];
      const mockOrderBy = vi.fn().mockResolvedValue(mockData);
      const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await getAllBukuTamu();
      expect(result).toEqual(mockData);
    });

    it("should return empty array when no data", async () => {
      const mockOrderBy = vi.fn().mockResolvedValue([]);
      const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      (db.select as any).mockReturnValue({ from: mockFrom });

      const result = await getAllBukuTamu();
      expect(result).toEqual([]);
    });
  });

  describe("deleteBukuTamu", () => {
    it("should delete buku tamu by ids", async () => {
      const mockWhere = vi.fn().mockResolvedValue([{ affectedRows: 2 }]);
      (db.delete as any).mockReturnValue({ where: mockWhere });

      const result = await deleteBukuTamu(["id-1", "id-2"]);
      expect(result).toBe(2);
    });

    it("should return 0 when no rows affected", async () => {
      const mockWhere = vi.fn().mockResolvedValue([]);
      (db.delete as any).mockReturnValue({ where: mockWhere });

      const result = await deleteBukuTamu(["nonexistent"]);
      expect(result).toBe(0);
    });
  });

  describe("deleteAllBukuTamu", () => {
    it("should delete all buku tamu", async () => {
      const mockWhere = vi.fn().mockResolvedValue([]);
      (db.delete as any).mockReturnValue({ where: mockWhere });

      const result = await deleteAllBukuTamu();
      expect(result).toBe(0);
    });
  });

  describe("submitBukuTamu", () => {
    it("should insert buku tamu and return id", async () => {
      const mockValues = vi.fn().mockResolvedValue([]);
      (db.insert as any).mockReturnValue({ values: mockValues });

      const data = {
        nama: "John",
        email: "john@test.com",
        no_telepon: "08123456789",
        keperluan: "Konsultasi",
      };

      const result = await submitBukuTamu(data);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(mockValues).toHaveBeenCalled();
    });

    it("should handle optional instansi", async () => {
      const mockValues = vi.fn().mockResolvedValue([]);
      (db.insert as any).mockReturnValue({ values: mockValues });

      const data = {
        nama: "John",
        email: "john@test.com",
        no_telepon: "08123456789",
        instansi: "BMKG",
        keperluan: "Konsultasi",
      };

      const result = await submitBukuTamu(data);
      expect(typeof result).toBe("string");
    });
  });
});
