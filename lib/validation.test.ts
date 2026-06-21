import { describe, it, expect } from "vitest";
import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  prakiraanSchema,
  bukuTamuSchema,
  bukuTamuSubmitSchema,
  layananCardSchema,
  strukturOrganisasiSchema,
  changePasswordSchema,
  heroImageSchema,
  displaySchema,
  publicationSchema,
  kegiatanDocumentSchema,
} from "./validation";

describe("validation schemas", () => {
  describe("loginSchema", () => {
    it("should accept valid login data", () => {
      const result = loginSchema.safeParse({ username: "admin", password: "pass" });
      expect(result.success).toBe(true);
    });

    it("should reject empty username", () => {
      const result = loginSchema.safeParse({ username: "", password: "pass" });
      expect(result.success).toBe(false);
    });

    it("should reject missing password", () => {
      const result = loginSchema.safeParse({ username: "admin" });
      expect(result.success).toBe(false);
    });
  });

  describe("createUserSchema", () => {
    it("should accept valid user data", () => {
      const result = createUserSchema.safeParse({
        username: "admin",
        password: "Admin123",
        role: "admin",
      });
      expect(result.success).toBe(true);
    });

    it("should enforce minimum password rules", () => {
      const result = createUserSchema.safeParse({
        username: "admin",
        password: "weak",
      });
      expect(result.success).toBe(false);
    });

    it("should require uppercase in password", () => {
      const result = createUserSchema.safeParse({
        username: "admin",
        password: "alllowercase1",
      });
      expect(result.success).toBe(false);
    });

    it("should require lowercase in password", () => {
      const result = createUserSchema.safeParse({
        username: "admin",
        password: "ALLUPPERCASE1",
      });
      expect(result.success).toBe(false);
    });

    it("should require number in password", () => {
      const result = createUserSchema.safeParse({
        username: "admin",
        password: "NoNumbersHere",
      });
      expect(result.success).toBe(false);
    });

    it("should default role to karyawan", () => {
      const result = createUserSchema.safeParse({
        username: "admin",
        password: "Admin123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("karyawan");
      }
    });

    it("should accept valid roles", () => {
      for (const role of ["super_admin", "admin", "karyawan"]) {
        const result = createUserSchema.safeParse({
          username: "user",
          password: "Admin123",
          role,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("bukuTamuSchema", () => {
    it("should accept valid buku tamu data", () => {
      const result = bukuTamuSchema.safeParse({
        nama: "John",
        email: "john@test.com",
        no_telepon: "08123456789",
        keperluan: "Konsultasi",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = bukuTamuSchema.safeParse({
        nama: "John",
        email: "not-an-email",
        no_telepon: "08123456789",
        keperluan: "Konsultasi",
      });
      expect(result.success).toBe(false);
    });

    it("should accept optional instansi", () => {
      const result = bukuTamuSchema.safeParse({
        nama: "John",
        email: "john@test.com",
        no_telepon: "08123456789",
        keperluan: "Konsultasi",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bukuTamuSubmitSchema", () => {
    it("should accept valid data with foto_data", () => {
      const result = bukuTamuSubmitSchema.safeParse({
        nama: "John",
        email: "john@test.com",
        no_telepon: "08123456789",
        keperluan: "Konsultasi",
        foto_data: "data:image/png;base64,abc123",
      });
      expect(result.success).toBe(true);
    });

    it("should accept data without foto_data", () => {
      const result = bukuTamuSubmitSchema.safeParse({
        nama: "John",
        email: "john@test.com",
        no_telepon: "08123456789",
        keperluan: "Konsultasi",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("prakiraanSchema", () => {
    it("should accept valid prakiraan data", () => {
      const result = prakiraanSchema.safeParse({
        title: "Prakiraan Cuaca Hari Ini",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const result = prakiraanSchema.safeParse({ title: "" });
      expect(result.success).toBe(false);
    });

    it("should accept valid display_type", () => {
      const result = prakiraanSchema.safeParse({
        title: "Test",
        display_type: "gambar_saja",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid display_type", () => {
      const result = prakiraanSchema.safeParse({
        title: "Test",
        display_type: "invalid_type",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("changePasswordSchema", () => {
    it("should accept valid password change", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "old123",
        newPassword: "NewPass123",
      });
      expect(result.success).toBe(true);
    });

    it("should enforce password rules on new password", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "old123",
        newPassword: "weak",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("heroImageSchema", () => {
    it("should accept valid hero image", () => {
      const result = heroImageSchema.safeParse({
        name: "Banner 1",
        url: "/uploads/banner.webp",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing name", () => {
      const result = heroImageSchema.safeParse({ url: "/uploads/banner.webp" });
      expect(result.success).toBe(false);
    });
  });

  describe("displaySchema", () => {
    it("should accept valid display data", () => {
      const result = displaySchema.safeParse({
        title: "Display Slide",
        url: "/uploads/slide.webp",
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty display data", () => {
      const result = displaySchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("publicationSchema", () => {
    it("should accept valid publication", () => {
      const result = publicationSchema.safeParse({
        title: "Publicasi 2024",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const result = publicationSchema.safeParse({ title: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("layananCardSchema", () => {
    it("should accept valid layanan card", () => {
      const result = layananCardSchema.safeParse({
        nama_layanan: "Layanan Cuaca",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("strukturOrganisasiSchema", () => {
    it("should accept valid struktur", () => {
      const result = strukturOrganisasiSchema.safeParse({
        jabatan: "Kepala Stasiun",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("kegiatanDocumentSchema", () => {
    it("should accept valid kegiatan document", () => {
      const result = kegiatanDocumentSchema.safeParse({
        title: "Kegiatan Rapat",
      });
      expect(result.success).toBe(true);
    });
  });
});
