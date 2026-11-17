/**
 * Generates the README "Visual evidence" images:
 *   npm run screenshots   →   docs/screenshots/{desktop,mobile}-{page}-{theme}.png
 */
import { test, type Page } from "@playwright/test";

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 2 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
} as const;

const THEMES = ["light", "dark"] as const;

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(900); // let entrance animations finish
}

for (const [device, viewport] of Object.entries(VIEWPORTS)) {
  for (const theme of THEMES) {
    test.describe(`${device} · ${theme}`, () => {
      test.use({ viewport, colorScheme: theme, ...("isMobile" in viewport ? { isMobile: true, hasTouch: true } : {}) });

      test("pages", async ({ page, browser }) => {
        const shot = (name: string, fullPage = false) =>
          page.screenshot({ path: `docs/screenshots/${device}-${name}-${theme}.png`, fullPage });

        await page.goto("/dashboard");
        await settle(page);
        await shot("dashboard", device === "desktop");

        await page.goto("/doctors");
        await settle(page);
        await shot("doctors");

        await page.locator('a[href^="/doctors/"]:visible').first().click();
        await page.waitForURL(/\/doctors\/[a-f0-9]{24}/);
        await settle(page);
        await shot("doctor-detail");

        await page.goto("/patients?condition=critical,under_observation");
        await settle(page);
        await shot("patients");

        // Login page needs a signed-out context
        const anon = await browser.newContext({
          viewport,
          colorScheme: theme,
          storageState: { cookies: [], origins: [] },
        });
        const login = await anon.newPage();
        await login.goto("/login");
        await settle(login);
        await login.screenshot({ path: `docs/screenshots/${device}-login-${theme}.png` });
        await anon.close();
      });
    });
  }
}
