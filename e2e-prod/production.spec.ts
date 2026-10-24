import { expect, test } from '@playwright/test';

for (const path of ['/', '/en']) {
  test(`logs no console error on ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });
}

test('navigates through the language switch', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'English' }).click();

  await expect(page).toHaveURL('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
