import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Kanchipuram/);
});

test('map is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#map')).toBeVisible();
});

test('temple list is populated', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#temple-list li')).toHaveCount(6);
});

for (const width of [320, 390, 1280]) {
  test(`warm map renders real features at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.waitForFunction(() => {
      const map = document.querySelector('#map')._warmMap;
      return map && map.queryRenderedFeatures().length > 0;
    });
    await expect(page.locator('.maplibregl-canvas')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
