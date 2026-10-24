import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './fixtures/accessibility';

test.use({ locale: 'en-US' });

test('displays the site page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Joan Roucoux');
  await expectNoAccessibilityViolations(page);
});

test('serves French at the root whatever the browser language, without cookies', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  expect(await page.evaluate(() => document.cookie)).toBe('');
});

test('switches to English through the language link', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'English' }).click();

  await expect(page).toHaveURL('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('link', { name: 'Français' })).toHaveAttribute('href', '/');
});

test('serves the legal notice routes in their language', async ({ page }) => {
  await page.goto('/mentions-legales');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

  await page.goto('/en/legal');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
