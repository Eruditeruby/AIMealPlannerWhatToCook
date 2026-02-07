# Testing Guide - AI Meal Planner

## 📋 Test Overview

**Total Coverage**: 279+ tests across 31+ suites

| Type | Location | Tests | Coverage |
|------|----------|-------|----------|
| **Unit Tests (Server)** | `server/__tests__/` | 86 | 83% statements |
| **Unit Tests (Client)** | `client/src/__tests__/` | 193 | 94% statements |
| **Integration Tests** | `server/__tests__/integration/` | 15+ | Full workflow |
| **E2E Tests** | `e2e/` | 10+ | User journeys |

---

## 🧪 Test Types

### 1. Unit Tests

**Purpose**: Test individual components/functions in isolation

**Server Unit Tests** (`server/__tests__/`)
```bash
cd server && npm test
```

Test categories:
- Config: Database connection, Passport strategy
- Models: User, Pantry, SavedRecipe validation
- Utils: JWT generation/verification
- Middleware: Auth middleware
- Routes: API endpoints (mocked external services)

**Client Unit Tests** (`client/src/__tests__/`)
```bash
cd client && npm test
```

Test categories:
- Context: AuthContext, ThemeContext
- UI Components: Button, Card, Input
- Feature Components: Navbar, RecipeCard, PantryList
- Pages: Home, Pantry, Recipes, Favorites
- Lib: API client

---

### 2. Integration Tests

**Purpose**: Test complete workflows across multiple components

**Server Integration Tests** (`server/__tests__/integration/`)
```bash
cd server && npm run test:integration
```

#### Auth Integration (`auth.integration.test.js`)
Tests complete OAuth flow:
- OAuth callback → JWT generation → Cookie creation
- JWT verification → Protected route access
- Token expiration and rejection
- Logout and cookie clearing
- Auth state persistence across requests

#### Pantry Integration (`pantry.integration.test.js`)
Tests pantry workflow:
- Login → Add items → Save → Retrieve → Update
- Pantry isolation between users
- Error scenarios (invalid format, no auth)
- Pantry → Recipe suggestions integration

#### Recipes Integration (`recipes.integration.test.js`)
Tests recipe workflow:
- Suggest recipes → View detail → Save favorite → Retrieve
- Spoonacular API → OpenRouter AI fallback
- Recipe isolation between users
- Duplicate prevention
- Error scenarios (API failures)

**Key Features**:
- Uses MongoDB Memory Server (no external DB needed)
- Mocks external APIs (Spoonacular, OpenRouter)
- Tests complete user workflows
- Verifies data persistence

---

### 3. End-to-End (E2E) Tests

**Purpose**: Test complete user journeys in real browser

**Setup**:
```bash
# Install Playwright browsers
npm run playwright:install

# Or manually:
npx playwright install
```

**Running E2E Tests**:
```bash
# Headless mode (CI)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Debug mode (step through tests)
npm run test:e2e:debug

# Headed mode (see browser)
npm run test:e2e:headed
```

#### Auth E2E (`e2e/auth.e2e.spec.js`)
- Landing page display
- Login button visibility
- OAuth redirect
- Auth state persistence across navigation
- Logout flow

#### User Journey E2E (`e2e/user-journey.e2e.spec.js`)
- Complete workflow: Login → Pantry → Recipes → Save → Favorites
- Pantry item persistence
- Recipe save/unsave
- Navigation between pages
- Mobile responsiveness

#### Theme E2E (`e2e/theme.e2e.spec.js`)
- Default light theme
- Theme toggle functionality
- localStorage persistence
- Theme consistency across pages
- CSS variable application
- No theme flash on load

**Browsers Tested**:
- ✅ Desktop Chrome
- ✅ Desktop Firefox
- ✅ Desktop Safari (WebKit)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

---

## 🚀 Running Tests

### Quick Commands

```bash
# Run all unit tests (server + client)
npm run test:all

# Run server tests only
npm run test:server

# Run client tests only
npm run test:client

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run E2E with UI (recommended for development)
npm run test:e2e:ui
```

### Development Workflow

**1. During Feature Development** (TDD):
```bash
# Start server tests in watch mode
cd server && npm run test:watch

# Start client tests in watch mode
cd client && npm run test:watch
```

**2. Before Committing**:
```bash
# Run all unit + integration tests
npm run test:all

# Run E2E tests (optional, slower)
npm run test:e2e
```

**3. Before Deployment**:
```bash
# Full test suite + coverage
cd server && npm run test:coverage
cd client && npm run test:coverage
npm run test:e2e
```

---

## 📊 Test Coverage

### Server Coverage (83%)

```bash
cd server && npm run test:coverage
```

Coverage breakdown:
- Statements: 83%
- Branches: 80%
- Functions: 83%
- Lines: 82%

**Uncovered areas**:
- OAuth callback (Google integration)
- Some error edge cases
- Rate limiting middleware

### Client Coverage (94%)

```bash
cd client && npm run test:coverage
```

Coverage breakdown:
- Statements: 94%
- Lines: 95%
- Functions: 87%
- Branches: 94%

**Uncovered areas**:
- OAuth redirect (browser-level)
- Some error boundaries
- Edge case animations

---

## 🐛 Testing Patterns & Tips

### Server Test Patterns

**1. MongoDB Memory Server**:
```javascript
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

**2. Auth Token for Protected Routes**:
```javascript
const token = generateToken(userId);

await request(app)
  .get('/api/pantry')
  .set('Cookie', [`token=${token}`])
  .expect(200);
```

**3. Mock External APIs**:
```javascript
jest.mock('../../services/spoonacular');
const spoonacularService = require('../../services/spoonacular');
spoonacularService.searchRecipes.mockResolvedValue(mockData);
```

### Client Test Patterns

**1. Mock Next.js Navigation**:
```javascript
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({})
}));
```

**2. Mock Framer Motion**:
```javascript
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button'
  }
}));
```

**3. Test Async State Updates**:
```javascript
await waitFor(() => {
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### E2E Test Patterns

**1. Mock Authenticated User**:
```javascript
await context.addCookies([
  { name: 'token', value: 'mock-jwt', domain: 'localhost', httpOnly: true }
]);

await page.addInitScript(() => {
  localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test' }));
});
```

**2. Wait for API Responses**:
```javascript
await page.waitForResponse(
  response => response.url().includes('/api/recipes') && response.status() === 200
);
```

**3. Test Across Pages**:
```javascript
await page.goto('/pantry');
await expect(page).toHaveURL(/\/pantry/);
```

---

## 🔧 Test Configuration

### Jest (Server)

**File**: `server/jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: true
};
```

### Jest (Client)

**File**: `client/jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Playwright

**File**: `playwright.config.js`

```javascript
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
    { name: 'Mobile Chrome', use: devices['Pixel 5'] },
    { name: 'Mobile Safari', use: devices['iPhone 12'] }
  ]
});
```

---

## 🎯 Phase 14 Checklist

**Integration Tests**:
- [x] Auth integration (OAuth → JWT → Protected routes)
- [x] Pantry workflow (CRUD + persistence)
- [x] Recipe workflow (Suggest → Detail → Save → Favorites)
- [x] API fallback behavior (Spoonacular → OpenRouter)
- [x] User isolation (pantry/recipes)

**E2E Tests**:
- [x] Authentication flow (login/logout)
- [x] Complete user journey (pantry → recipes → favorites)
- [x] Theme system (toggle + persistence)
- [x] Mobile responsiveness
- [x] Cross-browser testing (Chrome, Firefox, Safari)

**To Run** (after server/client are running):
- [ ] `npm run test:integration` (15+ tests should pass)
- [ ] `npm run test:e2e` (10+ tests should pass)

---

## 🚀 Next Steps (Phase 15)

After Phase 14 tests pass:

1. **Add CI/CD**: GitHub Actions for automated testing
2. **Performance testing**: Lighthouse, load testing
3. **Accessibility testing**: WCAG compliance
4. **Security testing**: OWASP checks
5. **Deployment testing**: Railway staging environment

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest GitHub](https://github.com/ladjs/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

**Last Updated**: 2026-02-07
