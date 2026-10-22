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

test('lightbox navigates between photos with arrow keys and buttons', async ({ page }) => {
  await page.goto('/');
  await page.locator('#speaking').scrollIntoViewIfNeeded();
  await page.locator('.photo-enlarge').click();

  const caption = page.locator('.lightbox-caption');
  const first = await caption.textContent();

  await page.keyboard.press('ArrowRight');
  await expect(caption).not.toHaveText(first);

  await page.keyboard.press('ArrowLeft');
  await expect(caption).toHaveText(first);

  await page.locator('.lightbox-prev').click();
  await expect(caption).not.toHaveText(first);

  await page.locator('.lightbox-next').click();
  await expect(caption).toHaveText(first);
});
