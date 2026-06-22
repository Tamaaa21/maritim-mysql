import { test, expect } from "@playwright/test";

test("beranda page memuat dengan benar", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("nav")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await expect(page).toHaveTitle(/Beranda/);
});

test("navigasi ke halaman prakiraan", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /prakiraan/i }).first().click();
  await expect(page).toHaveURL(/\/prakiraan/);
});
