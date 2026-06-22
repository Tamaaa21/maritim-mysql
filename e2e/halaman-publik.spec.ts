import { test, expect } from "@playwright/test";

test.describe("Halaman Publik", () => {
  const pages = [
    { path: "/", title: /beranda/i },
    { path: "/about", title: /tentang|about/i },
    { path: "/about/struktur-organisasi", title: /struktur organisasi/i },
    { path: "/about/visi-misi", title: /visi.*misi|misi.*visi/i },
    { path: "/buku_tamu", title: /buku tamu/i },
    { path: "/kegiatan", title: /kegiatan/i },
    { path: "/kontak", title: /kontak/i },
    { path: "/layanan", title: /layanan/i },
    { path: "/prakiraan", title: /prakiraan/i },
    { path: "/display", title: /bmkg|stasiun meteorologi maritim tegal/i },
  ];

  for (const { path, title } of pages) {
    test(`${path} memuat dengan benar`, async ({ page }) => {
      const resp = await page.goto(path);
      expect(resp?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
    });
  }
});
