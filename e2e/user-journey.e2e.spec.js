/**
 * E2E tests for complete user journey
 * Tests: Login → Pantry → Recipes → Save Favorite → Theme Toggle
 */

const { test, expect } = require('@playwright/test');

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authenticated user
    await context.addCookies([
      {
        name: 'token',
        value: 'mock-jwt-token-for-e2e',
        domain: 'localhost',
        path: '/',
        httpOnly: true
      }
    ]);

    // Mock localStorage for user data
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        _id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg'
      }));
    });

    await page.goto('/');
  });

  test('should complete full pantry to recipe workflow', async ({ page }) => {
    // Step 1: Navigate to Pantry
    await page.click('text=Pantry');
    await expect(page).toHaveURL(/\/pantry/);

    // Step 2: Add ingredients
    const ingredientInput = page.locator('input[placeholder*="ingredient"]');
    await ingredientInput.fill('chicken');
    await page.keyboard.press('Enter');

    await ingredientInput.fill('rice');
    await page.keyboard.press('Enter');

    await ingredientInput.fill('tomatoes');
    await page.keyboard.press('Enter');

    // Step 3: Verify ingredients added
    await expect(page.locator('text=chicken')).toBeVisible();
    await expect(page.locator('text=rice')).toBeVisible();
    await expect(page.locator('text=tomatoes')).toBeVisible();

    // Step 4: Navigate to Recipes
    await page.click('text=Recipes');
    await expect(page).toHaveURL(/\/recipes/);

    // Step 5: Get recipe suggestions
    await page.click('text=Get Suggestions');

    // Step 6: Wait for recipes to load
    await page.waitForSelector('[data-testid="recipe-card"]', { timeout: 10000 });

    // Step 7: Click on first recipe
    const firstRecipe = page.locator('[data-testid="recipe-card"]').first();
    await firstRecipe.click();

    // Step 8: Verify recipe detail page
    await expect(page).toHaveURL(/\/recipes\/\d+/);
    await expect(page.locator('h1')).not.toBeEmpty();

    // Step 9: Save recipe to favorites
    const saveButton = page.locator('button:has-text("Save")');
    await saveButton.click();

    // Step 10: Verify saved confirmation
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 });

    // Step 11: Navigate to Favorites
    await page.click('text=Favorites');
    await expect(page).toHaveURL(/\/favorites/);

    // Step 12: Verify saved recipe appears
    await expect(page.locator('[data-testid="recipe-card"]')).toHaveCount(1);
  });

  test('should persist pantry items across page reloads', async ({ page }) => {
    // Navigate to pantry
    await page.goto('/pantry');

    // Add ingredients
    const ingredientInput = page.locator('input[placeholder*="ingredient"]');
    await ingredientInput.fill('pasta');
    await page.keyboard.press('Enter');

    await ingredientInput.fill('sauce');
    await page.keyboard.press('Enter');

    // Verify ingredients visible
    await expect(page.locator('text=pasta')).toBeVisible();
    await expect(page.locator('text=sauce')).toBeVisible();

    // Reload page
    await page.reload();

    // Verify ingredients still visible
    await expect(page.locator('text=pasta')).toBeVisible();
    await expect(page.locator('text=sauce')).toBeVisible();
  });

  test('should toggle theme and persist preference', async ({ page }) => {
    // Check initial theme (default is light)
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');
    expect(initialTheme).toBe('light');

    // Toggle to dark mode
    const themeToggle = page.locator('[aria-label="Toggle theme"]');
    await themeToggle.click();

    // Verify dark mode applied
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Reload page
    await page.reload();

    // Verify dark mode persisted
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Toggle back to light
    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('should handle recipe removal from favorites', async ({ page }) => {
    // Navigate to favorites (assuming user has saved recipes)
    await page.goto('/favorites');

    // Check if recipes exist
    const recipeCards = page.locator('[data-testid="recipe-card"]');
    const initialCount = await recipeCards.count();

    if (initialCount > 0) {
      // Click remove button on first recipe
      const removeButton = recipeCards.first().locator('button:has-text("Remove")');
      await removeButton.click();

      // Verify recipe removed
      await expect(recipeCards).toHaveCount(initialCount - 1);
    }
  });

  test('should navigate between all pages', async ({ page }) => {
    // Test all navigation links
    const pages = [
      { link: 'Pantry', url: /\/pantry/ },
      { link: 'Recipes', url: /\/recipes/ },
      { link: 'Favorites', url: /\/favorites/ }
    ];

    for (const { link, url } of pages) {
      await page.click(`text=${link}`);
      await expect(page).toHaveURL(url);
    }

    // Navigate back to home
    await page.click('text=What To Cook');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Mobile User Journey', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should work on mobile viewport', async ({ page, context }) => {
    // Mock auth
    await context.addCookies([
      {
        name: 'token',
        value: 'mock-jwt-token-mobile',
        domain: 'localhost',
        path: '/',
        httpOnly: true
      }
    ]);

    await page.goto('/');

    // Verify responsive layout
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();

    // Navigate to pantry on mobile
    await page.click('text=Pantry');
    await expect(page).toHaveURL(/\/pantry/);

    // Verify pantry works on mobile
    const ingredientInput = page.locator('input[placeholder*="ingredient"]');
    await expect(ingredientInput).toBeVisible();
  });
});
