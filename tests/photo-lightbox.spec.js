import { test, expect } from '@playwright/test';

/**
 * LIGHTBOX TEST - Photo carousel
 *
 * Clicking the carousel opens the visible photo enlarged in a <dialog>,
 * and Escape closes it.
 */

test('carousel photo opens in a lightbox and closes with Escape', async ({ page }) => {
  await page.goto('/');
  await page.locator('#speaking').scrollIntoViewIfNeeded();

  const lightbox = page.locator('.lightbox');
  await expect(lightbox).not.toBeVisible();

  await page.locator('.photo-enlarge').click();
  await expect(lightbox).toBeVisible();
  await expect(lightbox.locator('img')).toHaveAttribute('src', /.+/);
  await expect(lightbox.locator('.lightbox-caption')).not.toBeEmpty();

  await page.keyboard.press('Escape');
  await expect(lightbox).not.toBeVisible();
});
