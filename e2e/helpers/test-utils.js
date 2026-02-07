/**
 * E2E Test Utilities
 * Helper functions for Playwright tests
 */

/**
 * Mock authenticated user with cookie and localStorage
 */
async function mockAuthenticatedUser(page, context, userData = {}) {
  const defaultUser = {
    _id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    ...userData
  };

  // Set auth cookie
  await context.addCookies([
    {
      name: 'token',
      value: 'mock-jwt-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax'
    }
  ]);

  // Set user data in localStorage
  await page.addInitScript((user) => {
    localStorage.setItem('user', JSON.stringify(user));
  }, defaultUser);

  return defaultUser;
}

/**
 * Mock pantry items in localStorage
 */
async function mockPantryItems(page, items = []) {
  await page.addInitScript((pantryItems) => {
    localStorage.setItem('pantry', JSON.stringify(pantryItems));
  }, items);
}

/**
 * Mock theme preference
 */
async function mockTheme(page, theme = 'light') {
  await page.addInitScript((themeValue) => {
    localStorage.setItem('theme', themeValue);
  }, theme);
}

/**
 * Wait for API request to complete
 */
async function waitForApiResponse(page, urlPattern) {
  return page.waitForResponse(
    response => response.url().includes(urlPattern) && response.status() === 200,
    { timeout: 10000 }
  );
}

/**
 * Mock API responses
 */
async function mockApiResponse(page, urlPattern, responseData) {
  await page.route(`**/${urlPattern}`, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });
}

/**
 * Clear all localStorage
 */
async function clearLocalStorage(page) {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Clear all cookies
 */
async function clearCookies(context) {
  await context.clearCookies();
}

/**
 * Take screenshot on failure
 */
async function screenshotOnFailure(page, testInfo) {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshot = await page.screenshot();
    await testInfo.attach('failure-screenshot', {
      body: screenshot,
      contentType: 'image/png'
    });
  }
}

/**
 * Get computed CSS variable value
 */
async function getCssVariable(page, variableName) {
  return page.evaluate((varName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName);
  }, variableName);
}

/**
 * Fill ingredient input with autocomplete
 */
async function addIngredient(page, ingredient) {
  const input = page.locator('input[placeholder*="ingredient"]');
  await input.fill(ingredient);
  await page.keyboard.press('Enter');
  // Wait for ingredient to appear
  await page.waitForSelector(`text=${ingredient}`, { timeout: 5000 });
}

/**
 * Navigate to page with auth check
 */
async function navigateAuthenticated(page, path) {
  await page.goto(path);
  // Verify not redirected to login
  await page.waitForURL(new RegExp(path), { timeout: 5000 });
}

module.exports = {
  mockAuthenticatedUser,
  mockPantryItems,
  mockTheme,
  waitForApiResponse,
  mockApiResponse,
  clearLocalStorage,
  clearCookies,
  screenshotOnFailure,
  getCssVariable,
  addIngredient,
  navigateAuthenticated
};
