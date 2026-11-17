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

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  const sections = {
    '/': ['competences', 'projets', 'experiences', 'certifications', 'articles', 'contact'],
    '/en': ['skills', 'projects', 'experience', 'certifications', 'articles', 'contact'],
  };

  for (const [path, ids] of Object.entries(sections)) {
    test(`serves a readable page on ${path}`, async ({ page }) => {
      await page.goto(path);

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('[data-testid="stage"] app-site-home-fluid-backdrop')).toHaveCSS(
        'background-color',
        'rgb(4, 4, 26)',
      );
      for (const id of ids) {
        await expect(page.locator(`#${id}`)).toHaveCount(1);
      }
    });
  }
});
