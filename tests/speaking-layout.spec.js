import { test, expect } from '@playwright/test';

/**
 * LAYOUT VALIDATION TEST - Speaking Section (single-page landing)
 *
 * Purpose: Validate spatial relationships using geometric measurements
 * Strategy: Use getBoundingClientRect() to get exact positions and sizes
 *
 * Why this works:
 * - Objective measurements don't lie
 * - Same assertions work across viewports
 * - Catches layout regressions immediately
 * - No visual diff complexity
 */

/**
 * Helper: Get bounding box for an element
 * Returns: { x, y, width, height, top, right, bottom, left }
 */
async function getBoundingBox(page, selector) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  return await element.evaluate(el => el.getBoundingClientRect().toJSON());
}

/**
 * Helper: Log layout information for debugging
 */
function logLayout(carousel, title, container, talks) {
  console.log('\n=== Layout Measurements ===');
  console.log(`Carousel: x=${carousel.x.toFixed(0)}, right=${carousel.right.toFixed(0)}, width=${carousel.width.toFixed(0)}`);
  console.log(`Title: x=${title.x.toFixed(0)}, left=${title.left.toFixed(0)}, width=${title.width.toFixed(0)}`);
  console.log(`Container: width=${container.width.toFixed(0)}`);
  console.log(`Talks: width=${talks.width.toFixed(0)}, usage=${(talks.width/container.width*100).toFixed(1)}%`);
  console.log('===========================\n');
}

test.describe('Speaking Section Layout Requirements', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to the speaking section so it is within the measured viewport
    await page.locator('#speaking').scrollIntoViewIfNeeded();
    // Wait for carousel to be visible (ensures page is fully loaded)
    await page.locator('.photo-carousel').waitFor({ state: 'visible' });
  });

  /**
   * REQUIREMENT 1: Carousel must be to the RIGHT of the section title
   *
   * Validation: carousel.left > title.left
   * Why: "To the right" means higher X coordinate (further right on screen)
   *
   * Note: With float layouts, the title can WRAP around the carousel,
   * so title.right may be greater than carousel.left. That's OK.
   * What matters is that the carousel STARTS further right than the title.
   */
  test('carousel is positioned to the right of title', async ({ page }) => {
    const carousel = await getBoundingBox(page, '.photo-carousel');
    const title = await getBoundingBox(page, '#speaking h2');
    const talks = await getBoundingBox(page, '.talks-list-inline');
    const container = await getBoundingBox(page, '#speaking');

    logLayout(carousel, title, container, talks);

    // Carousel should be to the RIGHT side (higher X coordinate)
    expect(carousel.left, 'Carousel should be to the right').toBeGreaterThan(title.left);

    // Carousel should be close to the right edge of container
    const distanceFromRightEdge = container.right - carousel.right;
    console.log(`Distance from right edge: ${distanceFromRightEdge.toFixed(0)}px`);
    expect(distanceFromRightEdge).toBeLessThan(100);

    // Log positioning for debugging
    console.log(`Title bottom: ${title.bottom.toFixed(0)}, Carousel top: ${carousel.top.toFixed(0)}, Talks top: ${talks.top.toFixed(0)}`);

    // Talks should use available width (wrapping around carousel if necessary)
    const talksUsage = (talks.width / container.width) * 100;
    console.log(`Talks width usage: ${talksUsage.toFixed(1)}%`);
  });

  /**
   * REQUIREMENT 2: Carousel must stay within the container boundaries
   *
   * Validation: carousel.right <= container.right
   * Why: Prevents carousel from overflowing outside the content area
   */
  test('carousel stays within container boundaries', async ({ page }) => {
    const carousel = await getBoundingBox(page, '.photo-carousel');
    const container = await getBoundingBox(page, '#speaking');

    console.log(`Carousel right: ${carousel.right.toFixed(0)}, Container right: ${container.right.toFixed(0)}`);

    // Carousel must not overflow container (allow 1px tolerance for rounding)
    expect(carousel.right).toBeLessThanOrEqual(container.right + 1);
  });

  /**
   * REQUIREMENT 3: Talks list must use available width effectively
   *
   * Validation: talks.width >= containerWidth * threshold
   * Why: Ensures text uses the space not occupied by the carousel
   *
   * Thresholds:
   * - Desktop: >= 50% (carousel takes ~30%, margins take ~10%, text takes 50%+)
   * - Mobile: >= 40% (carousel floats right at 180px, text wraps beside it)
   */
  test('talks list uses available width', async ({ page }) => {
    const talks = await getBoundingBox(page, '.talks-list-inline');
    const container = await getBoundingBox(page, '#speaking');

    const usagePercent = (talks.width / container.width) * 100;
    console.log(`Talks width usage: ${usagePercent.toFixed(1)}%`);

    // Get viewport width to determine mobile vs desktop
    const viewport = page.viewportSize();
    const isMobile = viewport.width < 768;

    if (isMobile) {
      // Mobile: talks should use the available width (after carousel float)
      // At least 40% of container (since carousel takes up ~50%)
      expect(talks.width).toBeGreaterThanOrEqual(container.width * 0.40);
    } else {
      // Desktop: talks should use at least half the width
      expect(talks.width).toBeGreaterThanOrEqual(container.width * 0.50);
    }
  });

  /**
   * REQUIREMENT 4: No horizontal overflow/scrolling
   *
   * Validation: body.scrollWidth <= viewport.width
   * Why: Ensures the page doesn't cause horizontal scrolling
   */
  test('page has no horizontal overflow', async ({ page }) => {
    const viewport = page.viewportSize();
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);

    console.log(`Viewport width: ${viewport.width}px, Scroll width: ${scrollWidth}px`);

    // Allow 1px tolerance for subpixel rounding
    expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 1);
  });

  /**
   * COMPREHENSIVE TEST: All spatial relationships together
   *
   * This test validates the complete layout in one go.
   * It's useful for understanding the full spatial picture.
   */
  test('complete layout spatial validation', async ({ page }) => {
    const carousel = await getBoundingBox(page, '.photo-carousel');
    const title = await getBoundingBox(page, '#speaking h2');
    const intro = await getBoundingBox(page, '#speaking .section-intro');
    const talks = await getBoundingBox(page, '.talks-list-inline');
    const container = await getBoundingBox(page, '#speaking');

    logLayout(carousel, title, container, talks);

    // 1. Carousel is to the RIGHT (higher x coordinates)
    expect(carousel.left, 'Carousel should be to the right of title').toBeGreaterThan(title.left);

    // 2. Carousel should be near the right edge (allowing some padding)
    const distanceFromRight = container.right - carousel.right;
    expect(distanceFromRight, 'Carousel should be close to right edge').toBeLessThan(100);

    // 3. Title and intro should start from the left (allowing container padding)
    expect(title.left, 'Title should start from left').toBeLessThan(carousel.left);
    expect(intro.left, 'Intro should start from left').toBeLessThan(carousel.left);

    // 4. Talks list starts from the left edge of container
    expect(Math.abs(talks.left - container.left), 'Talks should start from container left').toBeLessThan(10);

    // 5. Everything is within container
    expect(carousel.right, 'Carousel within container').toBeLessThanOrEqual(container.right + 1);
    expect(title.right, 'Title within container').toBeLessThanOrEqual(container.right + 1);
    expect(talks.right, 'Talks within container').toBeLessThanOrEqual(container.right + 1);

    // 6. No element has zero or negative dimensions
    expect(carousel.width, 'Carousel has width').toBeGreaterThan(0);
    expect(title.width, 'Title has width').toBeGreaterThan(0);
    expect(talks.width, 'Talks has width').toBeGreaterThan(0);
  });
});
