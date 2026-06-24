import { test, expect } from '@playwright/test';

test.describe('SkyPulse weather flow', () => {
  test('landing page renders hero with search bar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('weather');
    await expect(page.getByPlaceholder(/search a city/i)).toBeVisible();
  });

  test('search for a city and see weather results', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder(/search a city/i);
    await input.fill('Paris');
    await page.getByRole('button', { name: /search/i }).click();

    await expect(page.getByText(/current conditions/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('text=/°C/')).toBeVisible();
  });

  test('quick search button triggers weather fetch', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Paris' }).click();
    await expect(page.getByText(/current conditions/i)).toBeVisible({ timeout: 15_000 });
  });

  test('save a search and see it in saved searches', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Paris' }).click();
    await expect(page.getByText(/current conditions/i)).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: /save search/i }).click();
    await expect(page.getByText(/saved paris/i)).toBeVisible({ timeout: 5_000 });
  });

  test('keyboard shortcut / focuses search', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('/');
    const input = page.getByPlaceholder(/search a city/i);
    await expect(input).toBeFocused();
  });

  test('invalid city shows error message', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder(/search a city/i);
    await input.fill('xyznonexistentplace12345');
    await page.getByRole('button', { name: /search/i }).click();
    await expect(page.getByText(/not found|error|failed/i)).toBeVisible({ timeout: 10_000 });
  });
});
