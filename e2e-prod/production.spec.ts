import { expect, test } from '@playwright/test';

for (const path of ['/', '/en', '/projets']) {
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

    const expected =
      path === '/projets' ? ['Failed to load resource: the server responded with a status of 404 (Not Found)'] : [];
    expect(errors).toEqual(expected);
  });
}

test('navigates through the language switch', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    (window as unknown as { __hydrated: boolean }).__hydrated = true;
  });

  await page.getByRole('link', { name: 'English' }).click();

  await expect(page).toHaveURL('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await page.evaluate(() => (window as unknown as { __hydrated?: boolean }).__hydrated)).toBe(true);
});
