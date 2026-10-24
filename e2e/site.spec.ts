import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from './fixtures/accessibility';

test('displays the site page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Joan Roucoux');
  await expectNoAccessibilityViolations(page);
});
