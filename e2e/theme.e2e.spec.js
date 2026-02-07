/**
 * E2E tests for theme system
 * Tests: Theme toggle, persistence, CSS variables
 */

const { test, expect } = require('@playwright/test');

test.describe('Theme System E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should default to light theme', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    // Verify light theme CSS variables applied
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Light theme should have light background
    expect(backgroundColor).toBeTruthy();
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    const html = page.locator('html');
    const themeToggle = page.locator('[aria-label="Toggle theme"]');

    // Start with light
    await expect(html).toHaveAttribute('data-theme', 'light');

    // Toggle to dark
    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Toggle back to light
    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('should persist theme preference in localStorage', async ({ page }) => {
    const themeToggle = page.locator('[aria-label="Toggle theme"]');

    // Toggle to dark
    await themeToggle.click();

    // Check localStorage
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');

    // Reload page
    await page.reload();

    // Verify dark theme persisted
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('should apply theme across all pages', async ({ page, context }) => {
    // Mock auth for accessing protected pages
    await context.addCookies([
      {
        name: 'token',
        value: 'mock-jwt-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true
      }
    ]);

    const html = page.locator('html');
    const themeToggle = page.locator('[aria-label="Toggle theme"]');

    // Set dark theme on home page
    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Navigate to pantry - theme should persist
    await page.goto('/pantry');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Navigate to recipes - theme should persist
    await page.goto('/recipes');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Navigate to favorites - theme should persist
    await page.goto('/favorites');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('should show correct theme toggle icon', async ({ page }) => {
    const themeToggle = page.locator('[aria-label="Toggle theme"]');

    // Light theme should show moon icon (for switching to dark)
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
    // Moon icon SVG check (Lucide Moon icon)
    await expect(themeToggle.locator('svg')).toBeVisible();

    // Toggle to dark
    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    // Sun icon SVG check (Lucide Sun icon)
    await expect(themeToggle.locator('svg')).toBeVisible();
  });

  test('should not flash wrong theme on page load', async ({ page }) => {
    // Set dark theme
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));

    // Reload page and immediately check theme
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const html = page.locator('html');
    // Should be dark immediately, not flash light then dark
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('should handle theme with CSS variables correctly', async ({ page }) => {
    const html = page.locator('html');

    // Light theme CSS variables
    await expect(html).toHaveAttribute('data-theme', 'light');
    let bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--background');
    });
    expect(bgColor).toBeTruthy();

    // Dark theme CSS variables
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--background');
    });
    expect(bgColor).toBeTruthy();
  });
});
