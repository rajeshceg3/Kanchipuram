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
