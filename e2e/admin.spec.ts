import { test, expect } from "@playwright/test";

const ADMIN = { username: "admin", password: "admin123" };

test.describe("Admin - Autentikasi", () => {
  test("redirect ke login jika belum login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("halaman login bisa diakses", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("form")).toBeVisible();
  });
});

test.describe("Admin - Halaman (sudah login)", () => {
  test.beforeAll(async ({ request }) => {
    const resp = await request.post("/api/admin/login", { data: ADMIN });
    expect(resp.status()).toBe(200);
  });

  const pages = [
    "/admin/dashboard",
    "/admin/prakiraan-manager",
    "/admin/publikasi-manager",
    "/admin/kegiatan-manager",
    "/admin/hero-manager",
    "/admin/struktur-organisasi",
    "/admin/buku-tamu",
    "/admin/layanan",
    "/admin/display-manager",
    "/admin/login-history",
    "/admin/pengaturan",
  ];

  for (const p of pages) {
    test(`${p} memuat dengan benar`, async ({ page }) => {
      const resp = await page.goto(p);
      expect(resp?.status()).toBe(200);
    });
  }
});
