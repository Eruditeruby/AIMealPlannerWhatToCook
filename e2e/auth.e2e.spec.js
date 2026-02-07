/**
 * E2E tests for authentication flow
 * Tests complete user journey: Landing → Login → Authenticated state
 */

const { test, expect } = require('@playwright/test');

test.describe('Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page with login button', async ({ page }) => {
    // Verify landing page loads
    await expect(page.locator('h1')).toContainText('What To Cook');

    // Verify login button exists
    const loginButton = page.locator('text=Login with Google');
    await expect(loginButton).toBeVisible();
  });

  test('should show unauthenticated state initially', async ({ page }) => {
    // Navbar should show "Login with Google"
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    await expect(navbar.locator('text=Login with Google')).toBeVisible();

    // Should NOT show user profile or logout
    await expect(navbar.locator('text=Logout')).not.toBeVisible();
  });

  test('should redirect to Google OAuth when clicking login', async ({ page }) => {
    // Click login button
    const loginButton = page.locator('text=Login with Google');

    // Listen for navigation
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      loginButton.click()
    ]);

    // Verify redirect to Google OAuth
    // Note: In real test, this would redirect to Google
    // In test environment, we can mock this or test against staging
    expect(popup.url()).toContain('google.com/auth') ||
    expect(popup.url()).toContain('localhost:5000/api/auth/google');
  });

  test('should maintain auth state across page navigation', async ({ page, context }) => {
    // Mock authenticated state by setting cookie
    await context.addCookies([
      {
        name: 'token',
        value: 'mock-jwt-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true
      }
    ]);

    // Navigate to pantry page
    await page.goto('/pantry');

    // Should remain authenticated (not redirect to home)
    await expect(page).toHaveURL(/\/pantry/);
  });

  test('should clear auth on logout', async ({ page, context }) => {
    // Set authenticated state
    await context.addCookies([
      {
        name: 'token',
        value: 'mock-jwt-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true
      }
    ]);

    await page.goto('/pantry');

    // Click logout
    const logoutButton = page.locator('text=Logout');
    await logoutButton.click();

    // Should redirect to home
    await expect(page).toHaveURL('/');

    // Cookie should be cleared
    const cookies = await context.cookies();
    const tokenCookie = cookies.find(c => c.name === 'token');
    expect(tokenCookie).toBeUndefined();
  });
});
