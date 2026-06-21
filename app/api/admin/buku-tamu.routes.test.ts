import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.TOKEN_SECRET = "test-secret-key-for-unit-tests-only";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) }),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
  },
  schema: {
    buku_tamu: { id: "id", created_at: "created_at" },
  },
}));

vi.mock("@/services/buku-tamu.service", () => ({
  getAllBukuTamu: vi.fn(),
  deleteBukuTamu: vi.fn(),
  deleteAllBukuTamu: vi.fn(),
  submitBukuTamu: vi.fn(),
}));

vi.mock("@/services/admin.service", () => ({
  getUserId: vi.fn(() => "user-admin-1"),
  getUsername: vi.fn(() => "admin"),
  isAdmin: vi.fn(() => true),
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: vi.fn(),
}));

import { getAllBukuTamu, deleteBukuTamu, deleteAllBukuTamu, submitBukuTamu } from "@/services/buku-tamu.service";
import * as adminService from "@/services/admin.service";
import { GET as bukuTamuGET, DELETE as bukuTamuDELETE } from "./buku-tamu/route";
import { POST as submitPOST } from "../submit/buku-tamu/route";
import { createMockRequest, createAdminHeaders, createKaryawanHeaders } from "../test-utils";

describe("API: /api/admin/buku-tamu GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with data", async () => {
    vi.mocked(getAllBukuTamu).mockResolvedValue([
      { id: "1", nama: "John", email: "john@test.com", no_telepon: "08123", instansi: "BMKG", keperluan: "Konsultasi", foto_url: null, foto_data: null, created_at: "2024-01-01" as any, updated_at: "2024-01-01" as any },
    ]);

    const response = await bukuTamuGET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should return 200 with empty data", async () => {
    vi.mocked(getAllBukuTamu).mockResolvedValue([]);

    const response = await bukuTamuGET();
    expect(response.status).toBe(200);
  });
});

describe("API: /api/admin/buku-tamu DELETE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminService.isAdmin).mockReturnValue(true);
  });

  it("should return 400 for non-admin", async () => {
    vi.mocked(adminService.isAdmin).mockReturnValue(false);

    const req = createMockRequest({
      method: "DELETE",
      headers: createKaryawanHeaders(),
      body: { ids: ["1"] },
    });

    const response = await bukuTamuDELETE(req);
    expect(response.status).toBe(400);
  });

  it("should delete specific items", async () => {
    vi.mocked(deleteBukuTamu).mockResolvedValue(2);

    const req = createMockRequest({
      method: "DELETE",
      headers: createAdminHeaders(),
      body: { ids: ["1", "2"] },
    });

    const response = await bukuTamuDELETE(req);
    expect(response.status).toBe(200);
    expect(deleteBukuTamu).toHaveBeenCalledWith(["1", "2"]);
  });

  it("should delete all when no ids provided", async () => {
    vi.mocked(deleteAllBukuTamu).mockResolvedValue(0);

    const req = createMockRequest({
      method: "DELETE",
      headers: createAdminHeaders(),
    });

    const response = await bukuTamuDELETE(req);
    expect(response.status).toBe(200);
    expect(deleteAllBukuTamu).toHaveBeenCalled();
  });
});

describe("API: /api/submit/buku-tamu POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 on successful submit", async () => {
    vi.mocked(submitBukuTamu).mockResolvedValue("new-id" as any);

    const req = createMockRequest({
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: {
        nama: "John",
        email: "john@test.com",
        no_telepon: "08123456789",
        keperluan: "Konsultasi",
      },
    });

    const response = await submitPOST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should return 400 on invalid data", async () => {
    const req = createMockRequest({
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
      body: { nama: "", email: "invalid" },
    });

    const response = await submitPOST(req);
    expect(response.status).toBe(400);
  });
});
