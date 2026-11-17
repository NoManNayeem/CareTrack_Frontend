import { expect, test as setup } from "@playwright/test";

export const ADMIN = {
  email: process.env.E2E_EMAIL ?? "admin@caretrack.dev",
  password: process.env.E2E_PASSWORD ?? "CareTrack@2026",
};

setup("sign in as admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Work email").fill(ADMIN.email);
  await page.getByLabel("Password", { exact: true }).fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: "e2e/.auth/admin.json" });
});
