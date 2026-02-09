# AI Meal Planner — TDD Implementation Workflow

> **Methodology**: Test-Driven Development (Red → Green → Refactor)
> **Reference**: [design.md](./design.md)
> **Status**: ALL 15 PHASES COMPLETE. 381 tests across 41 suites.

---

## Phase 0: Project Scaffolding & Test Infrastructure

### 0.1 Initialize Server Project
- [x] `mkdir server && cd server && npm init -y`
- [x] Install production deps: `express mongoose passport passport-google-oauth20 jsonwebtoken cookie-parser cors dotenv`
- [x] Install dev deps: `jest supertest mongodb-memory-server @types/jest nodemon`
- [x] Create `jest.config.js` with test environment settings
- [x] Create `.env.example` with all env vars from design doc
- [x] Create `server/index.js` entry point (empty Express app, export for testing)

### 0.2 Initialize Client Project
- [x] `npx create-next-app@14 client --app --tailwind --eslint`
- [x] Install deps: `framer-motion lucide-react`
- [x] Install dev deps: `@testing-library/react @testing-library/jest-dom jest jest-environment-jsdom`
- [x] Create `jest.config.js` for Next.js
- [x] Set up Tailwind CSS variables for dark/light theming in `globals.css`

### 0.3 Git & Config
- [x] Create `.gitignore` (node_modules, .env, .DS_Store, coverage/)
- [x] Create `.env.example` at root
- [x] Initial commit

---

## Phase 1: Database Models (Server)

### 1.1 MongoDB Connection

**Test first** (`server/__tests__/config/db.test.js`):
- [x] Test: `connectDB()` connects to in-memory MongoDB successfully
- [x] Test: `connectDB()` throws on invalid URI
- [x] **Implement**: `server/config/db.js` — Mongoose connect function
- [x] Refactor: extract connection options to config

### 1.2 User Model

**Test first** (`server/__tests__/models/User.test.js`):
- [x] Test: creates a valid user with googleId, email, name, avatar
- [x] Test: `googleId` is required
- [x] Test: `email` is required
- [x] Test: `createdAt` defaults to now
- [x] Test: `preferences.dietaryRestrictions` defaults to empty array
- [x] Test: `preferences.familySize` defaults to null
- [x] Test: rejects duplicate `googleId`
- [x] **Implement**: `server/models/User.js` — Mongoose schema + model
- [x] Refactor: add index on `googleId`

### 1.3 Pantry Model

**Test first** (`server/__tests__/models/Pantry.test.js`):
- [x] Test: creates a pantry with userId and items array
- [x] Test: `userId` is required
- [x] Test: `items` defaults to empty array
- [x] Test: `items` only accepts strings
- [x] Test: `createdAt` and `updatedAt` are auto-set
- [x] Test: one pantry per user (unique userId)
- [x] **Implement**: `server/models/Pantry.js` — Mongoose schema + model
- [x] Refactor: add index on `userId`

### 1.4 SavedRecipe Model

**Test first** (`server/__tests__/models/SavedRecipe.test.js`):
- [x] Test: creates a saved recipe with all required fields (userId, title, source, ingredients)
- [x] Test: `source` only accepts "spoonacular" or "ai"
- [x] Test: `nutrition` sub-document has calories, protein, carbs, fat
- [x] Test: `tags` defaults to empty array
- [x] Test: `savedAt` defaults to now
- [x] Test: `sourceId` is optional (null for AI recipes)
- [x] Test: user can save multiple recipes
- [x] **Implement**: `server/models/SavedRecipe.js` — Mongoose schema + model
- [x] Refactor: add compound index on `userId` + `savedAt`

---

## Phase 2: Auth Middleware & JWT (Server)

### 2.1 JWT Auth Middleware

**Test first** (`server/__tests__/middleware/auth.test.js`):
- [x] Test: returns 401 if no token cookie present
- [x] Test: returns 401 if token is invalid/expired
- [x] Test: sets `req.user` with decoded payload on valid token
- [x] Test: calls `next()` on valid token
- [x] Test: handles malformed JWT gracefully (no crash)
- [x] **Implement**: `server/middleware/auth.js` — verify JWT from httpOnly cookie
- [x] Refactor: extract token extraction logic

### 2.2 JWT Token Utility

**Test first** (`server/__tests__/utils/token.test.js`):
- [x] Test: `generateToken(user)` returns a valid JWT string
- [x] Test: token contains userId and email in payload
- [x] Test: token expires in configured time (e.g. 7 days)
- [x] Test: `verifyToken(token)` returns decoded payload
- [x] Test: `verifyToken(invalidToken)` throws error
- [x] **Implement**: `server/utils/token.js` — generateToken, verifyToken
- [x] Refactor: make expiry configurable via env

---

## Phase 3: Auth Routes (Server)

### 3.1 Passport Google Strategy Config

**Test first** (`server/__tests__/config/passport.test.js`):
- [x] Test: strategy is registered as "google"
- [x] Test: callback creates new user if googleId not found
- [x] Test: callback returns existing user if googleId found
- [x] Test: user object has id, email, name, avatar
- [x] **Implement**: `server/config/passport.js` — Google OAuth strategy
- [x] Refactor: extract user upsert logic

### 3.2 Auth Route Endpoints

**Test first** (`server/__tests__/routes/auth.test.js`):
- [x] Test: `GET /api/auth/google` redirects to Google (status 302)
- [x] Test: `GET /api/auth/me` returns 401 without token
- [x] Test: `GET /api/auth/me` returns user profile with valid token
- [x] Test: `GET /api/auth/me` response shape: `{ id, email, name, avatar, preferences }`
- [x] Test: `POST /api/auth/logout` clears the JWT cookie
- [x] **Implement**: `server/routes/auth.js` — auth router
- [x] Refactor: add logout endpoint

---

## Phase 4: Pantry Routes (Server)

### 4.1 GET /api/pantry

**Test first** (`server/__tests__/routes/pantry.test.js`):
- [x] Test: returns 401 without auth
- [x] Test: returns empty pantry `{ items: [] }` for new user
- [x] Test: returns existing pantry items for authenticated user
- [x] Test: response shape: `{ items: [...], updatedAt }`
- [x] **Implement**: GET handler in `server/routes/pantry.js`

### 4.2 PUT /api/pantry

**Test first** (same file):
- [x] Test: returns 401 without auth
- [x] Test: creates pantry if none exists, sets items
- [x] Test: updates existing pantry items (full replace)
- [x] Test: accepts `{ items: ["chicken", "rice"] }`
- [x] Test: rejects non-array items (400)
- [x] Test: rejects non-string items in array (400)
- [x] Test: trims and lowercases item names
- [x] Test: removes duplicate items
- [x] Test: updates `updatedAt` timestamp
- [x] **Implement**: PUT handler in `server/routes/pantry.js`
- [x] Refactor: extract input validation to middleware/helper

---

## Phase 5: External Service Clients (Server)

### 5.1 Spoonacular Client

**Test first** (`server/__tests__/services/spoonacular.test.js`):
- [x] Test: `findByIngredients(["chicken", "rice"])` calls correct Spoonacular URL
- [x] Test: returns normalized recipe array `[{ id, title, image, usedIngredients, missedIngredients }]`
- [x] Test: `getRecipeDetails(id)` returns full recipe (instructions, nutrition, etc.)
- [x] Test: handles Spoonacular API error (returns empty array, logs error)
- [x] Test: handles rate limit (402) gracefully
- [x] Test: handles empty ingredients list (returns empty array)
- [x] **Implement**: `server/services/spoonacular.js` — API client with fetch
- [x] Refactor: add response caching (in-memory, 1 hour TTL)

### 5.2 OpenRouter AI Client

**Test first** (`server/__tests__/services/openrouter.test.js`):
- [x] Test: `suggestRecipes(["chicken", "rice"])` sends correct prompt to OpenRouter
- [x] Test: prompt includes "family-friendly" instruction
- [x] Test: returns normalized recipe array matching app schema
- [x] Test: parses AI JSON response correctly
- [x] Test: handles malformed AI response (returns empty array)
- [x] Test: handles API error (returns empty array, logs error)
- [x] Test: handles empty ingredients list (returns empty array)
- [x] **Implement**: `server/services/openrouter.js` — OpenRouter chat completions client
- [x] Refactor: extract prompt template, make model configurable

---

## Phase 6: Recipe Routes (Server)

### 6.1 GET /api/recipes/suggest

**Test first** (`server/__tests__/routes/recipes.test.js`):
- [x] Test: returns 401 without auth
- [x] Test: returns 400 if no `ingredients` query param
- [x] Test: calls Spoonacular with parsed ingredients
- [x] Test: if Spoonacular returns 3+ results, returns them without AI call
- [x] Test: if Spoonacular returns < 3 results, also calls OpenRouter
- [x] Test: merges Spoonacular + AI results, marks source on each
- [x] Test: response shape: `{ recipes: [{ title, image, source, sourceId, ingredients, cookTime, servings }] }`
- [x] Test: handles both services failing (returns empty array + message)
- [x] **Implement**: GET handler in `server/routes/recipes.js`
- [x] Refactor: extract suggestion logic to a service

### 6.2 GET /api/recipes/:id

**Test first** (same file):
- [x] Test: returns 401 without auth
- [x] Test: returns recipe detail from Spoonacular by sourceId
- [x] Test: returns 404 for unknown recipe ID
- [x] Test: response includes instructions, nutrition, full ingredients
- [x] **Implement**: GET detail handler

### 6.3 POST /api/recipes/saved

**Test first** (same file):
- [x] Test: returns 401 without auth
- [x] Test: saves recipe to user's saved list
- [x] Test: returns 400 if required fields missing (title, source, ingredients)
- [x] Test: accepts valid recipe payload and returns saved document
- [x] Test: does not duplicate if same sourceId already saved by user
- [x] **Implement**: POST handler

### 6.4 GET /api/recipes/saved

**Test first** (same file):
- [x] Test: returns 401 without auth
- [x] Test: returns empty array for user with no saved recipes
- [x] Test: returns all saved recipes for authenticated user
- [x] Test: results sorted by `savedAt` descending
- [x] **Implement**: GET saved handler

### 6.5 DELETE /api/recipes/saved/:id

**Test first** (same file):
- [x] Test: returns 401 without auth
- [x] Test: deletes saved recipe by ID
- [x] Test: returns 404 if recipe not found or doesn't belong to user
- [x] Test: cannot delete another user's saved recipe
- [x] **Implement**: DELETE handler
- [x] Refactor: ensure all recipe routes use consistent error format

---

## Phase 7: Server Integration & App Assembly

### 7.1 Express App Setup

**Test first** (`server/__tests__/app.test.js`):
- [x] Test: app responds to `GET /api/health` with `{ status: "ok" }`
- [x] Test: CORS allows configured client origin
- [x] Test: unknown routes return 404 JSON
- [x] Test: JSON parsing middleware works
- [x] Test: cookie parser is configured
- [x] **Implement**: `server/index.js` — assemble Express app with all routes
- [x] Add unhandled rejection / uncaught exception handlers
- [x] Refactor: separate app creation from server listen (for testability)

---

## Phase 8: Client — Theme System (Frontend)

### 8.1 ThemeContext

**Test first** (`client/__tests__/context/ThemeContext.test.js`):
- [x] Test: provides default theme ("light")
- [x] Test: `toggleTheme()` switches from light to dark
- [x] Test: `toggleTheme()` switches from dark to light
- [x] Test: persists theme preference in localStorage
- [x] Test: reads initial theme from localStorage
- [x] Test: sets `data-theme` attribute on document
- [x] **Implement**: `client/context/ThemeContext.js`
- [x] Refactor: respect system preference via `prefers-color-scheme`

### 8.2 ThemeToggle Component

**Test first** (`client/__tests__/components/ThemeToggle.test.js`):
- [x] Test: renders sun icon in dark mode
- [x] Test: renders moon icon in light mode
- [x] Test: calls `toggleTheme` on click
- [x] Test: has accessible label
- [x] **Implement**: `client/components/ThemeToggle.jsx`

### 8.3 Global Styles & CSS Variables

- [x] Set up Tailwind CSS variables in `globals.css` for light/dark tokens
- [x] Test: verify color tokens match design spec (visual test)
- [x] Configure Inter font via next/font

---

## Phase 9: Client — Auth System (Frontend)

### 9.1 API Client

**Test first** (`client/__tests__/lib/api.test.js`):
- [x] Test: `api.get(url)` calls fetch with credentials: "include"
- [x] Test: `api.post(url, data)` sends JSON body with correct headers
- [x] Test: `api.put(url, data)` sends JSON body
- [x] Test: `api.delete(url)` sends DELETE request
- [x] Test: throws on non-OK response with error message
- [x] Test: uses `NEXT_PUBLIC_API_URL` as base URL
- [x] **Implement**: `client/lib/api.js` — fetch wrapper

### 9.2 AuthContext

**Test first** (`client/__tests__/context/AuthContext.test.js`):
- [x] Test: provides `user: null` initially
- [x] Test: `checkAuth()` calls `/api/auth/me` and sets user
- [x] Test: `checkAuth()` sets user to null on 401
- [x] Test: provides `isAuthenticated` boolean
- [x] Test: provides `isLoading` state during auth check
- [x] Test: `login()` redirects to `/api/auth/google`
- [x] Test: `logout()` calls logout endpoint and clears user
- [x] **Implement**: `client/context/AuthContext.js`

---

## Phase 10: Client — UI Components (Frontend)

### 10.1 Navbar

**Test first** (`client/__tests__/components/Navbar.test.js`):
- [x] Test: renders app name/logo
- [x] Test: shows "Sign in" button when not authenticated
- [x] Test: shows user avatar + name when authenticated
- [x] Test: shows navigation links (Pantry, Recipes, Favorites) when authenticated
- [x] Test: includes ThemeToggle
- [x] Test: is responsive (hamburger menu on mobile)
- [x] **Implement**: `client/components/Navbar.jsx`

### 10.2 Button Component

**Test first** (`client/__tests__/components/ui/Button.test.js`):
- [x] Test: renders children text
- [x] Test: applies variant styles (primary, secondary, ghost)
- [x] Test: handles click events
- [x] Test: shows loading spinner when `isLoading`
- [x] Test: is disabled when `disabled` prop set
- [x] **Implement**: `client/components/ui/Button.jsx`

### 10.3 Card Component

**Test first** (`client/__tests__/components/ui/Card.test.js`):
- [x] Test: renders children
- [x] Test: applies hover animation class
- [x] Test: accepts className prop for customization
- [x] **Implement**: `client/components/ui/Card.jsx`

### 10.4 Input Component

**Test first** (`client/__tests__/components/ui/Input.test.js`):
- [x] Test: renders with label
- [x] Test: handles onChange events
- [x] Test: shows error message when provided
- [x] Test: supports placeholder
- [x] **Implement**: `client/components/ui/Input.jsx`

---

## Phase 11: Client — Pantry Feature (Frontend)

### 11.1 IngredientInput Component

**Test first** (`client/__tests__/components/IngredientInput.test.js`):
- [x] Test: renders input field with "Add ingredient" placeholder
- [x] Test: calls `onAdd(ingredient)` on Enter key press
- [x] Test: calls `onAdd(ingredient)` on "Add" button click
- [x] Test: clears input after adding
- [x] Test: does not add empty/whitespace-only strings
- [x] Test: trims input before adding
- [x] **Implement**: `client/components/IngredientInput.jsx`

### 11.2 PantryList Component

**Test first** (`client/__tests__/components/PantryList.test.js`):
- [x] Test: renders list of ingredient items
- [x] Test: each item has a remove button (X)
- [x] Test: calls `onRemove(item)` when remove clicked
- [x] Test: shows empty state message when no items
- [x] Test: items animate in/out with Framer Motion
- [x] **Implement**: `client/components/PantryList.jsx`

### 11.3 Pantry Page

**Test first** (`client/__tests__/app/pantry/page.test.js`):
- [x] Test: redirects to auth if not logged in
- [x] Test: loads and displays user's pantry on mount
- [x] Test: adding an ingredient calls PUT /api/pantry with updated list
- [x] Test: removing an ingredient calls PUT /api/pantry with updated list
- [x] Test: shows loading skeleton while fetching
- [x] Test: shows "What Can I Cook?" button when pantry has items
- [x] Test: "What Can I Cook?" navigates to /recipes with ingredients param
- [x] **Implement**: `client/app/pantry/page.js`

---

## Phase 12: Client — Recipe Feature (Frontend)

### 12.1 RecipeCard Component

**Test first** (`client/__tests__/components/RecipeCard.test.js`):
- [x] Test: renders recipe title
- [x] Test: renders recipe image (with fallback if none)
- [x] Test: shows cook time and servings
- [x] Test: shows source badge ("Spoonacular" or "AI")
- [x] Test: shows save/heart button
- [x] Test: calls `onSave(recipe)` on heart click
- [x] Test: navigates to recipe detail on card click
- [x] Test: has hover animation
- [x] **Implement**: `client/components/RecipeCard.jsx`

### 12.2 RecipeDetail Component

**Test first** (`client/__tests__/components/RecipeDetail.test.js`):
- [x] Test: renders recipe title and image
- [x] Test: renders ingredients list
- [x] Test: renders step-by-step instructions
- [x] Test: renders cook time and servings
- [x] Test: renders nutrition info (calories, protein, carbs, fat)
- [x] Test: renders tags (kid-friendly, etc.)
- [x] Test: shows save button
- [x] **Implement**: `client/components/RecipeDetail.jsx`

### 12.3 Recipes Page (Suggestions)

**Test first** (`client/__tests__/app/recipes/page.test.js`):
- [x] Test: redirects to auth if not logged in
- [x] Test: reads ingredients from query params
- [x] Test: calls GET /api/recipes/suggest with ingredients
- [x] Test: displays loading skeleton while fetching
- [x] Test: renders grid of RecipeCards with results
- [x] Test: shows "No recipes found" message on empty results
- [x] Test: shows error message on API failure
- [x] **Implement**: `client/app/recipes/page.js`

### 12.4 Recipe Detail Page

**Test first** (`client/__tests__/app/recipes/[id]/page.test.js`):
- [x] Test: redirects to auth if not logged in
- [x] Test: calls GET /api/recipes/:id on mount
- [x] Test: renders RecipeDetail component with fetched data
- [x] Test: shows loading skeleton while fetching
- [x] Test: shows 404 message for invalid ID
- [x] **Implement**: `client/app/recipes/[id]/page.js`

### 12.5 Favorites Page

**Test first** (`client/__tests__/app/favorites/page.test.js`):
- [x] Test: redirects to auth if not logged in
- [x] Test: calls GET /api/recipes/saved on mount
- [x] Test: renders grid of saved RecipeCards
- [x] Test: shows empty state when no favorites
- [x] Test: unsave removes card from list (calls DELETE, updates UI)
- [x] **Implement**: `client/app/favorites/page.js`

---

## Phase 13: Client — Landing Page & Layout

### 13.1 Root Layout

**Test first** (`client/__tests__/app/layout.test.js`):
- [x] Test: wraps children with AuthContext provider
- [x] Test: wraps children with ThemeContext provider
- [x] Test: renders Navbar
- [x] Test: applies Inter font
- [x] **Implement**: `client/app/layout.js`

### 13.2 Landing Page

**Test first** (`client/__tests__/app/page.test.js`):
- [x] Test: renders hero section with app title and tagline
- [x] Test: shows "Get Started" button linking to auth
- [x] Test: shows feature highlights (pantry, recipes, favorites)
- [x] Test: has smooth entrance animations (Framer Motion)
- [x] Test: redirects to /pantry if already authenticated
- [x] **Implement**: `client/app/page.js`

---

## Phase 14: Integration Testing

### 14.1 Server E2E Flow

**Test** (`server/__tests__/integration/full-flow.test.js`):
- [ ] Test: create user → add pantry items → get suggestions → save recipe → get saved → delete saved
- [ ] Test: full auth flow with mocked Google OAuth
- [ ] Test: Spoonacular failure gracefully falls back to AI
- [ ] Test: both services fail returns empty with message

### 14.2 Client E2E Flow (Optional — Playwright)

- [ ] Test: unauthenticated user sees landing page
- [ ] Test: login → redirected to pantry
- [ ] Test: add ingredients → click "What Can I Cook?" → see recipes
- [ ] Test: click recipe card → see detail
- [ ] Test: save recipe → appears in favorites
- [ ] Test: toggle dark/light mode persists
- [ ] Test: responsive layout on mobile viewport

---

## Phase 15: Polish & Deployment Prep

### 15.1 Error Handling
- [ ] Add global error boundary in Next.js layout
- [ ] Add unhandled rejection/exception handlers in server
- [ ] Consistent error response format across all API routes

### 15.2 Performance
- [ ] Add in-memory cache for Spoonacular responses
- [ ] Lazy load recipe images
- [ ] Optimize bundle with next/dynamic for heavy components

### 15.3 Security
- [ ] Verify JWT is httpOnly, secure, sameSite
- [ ] Rate limit API routes (express-rate-limit)
- [ ] Sanitize user inputs (ingredient names)
- [ ] CORS restricted to client origin only

### 15.4 Deployment
- [ ] Create `docker-compose.yml` (server + MongoDB + client)
- [ ] Configure production env vars
- [ ] Build and test production bundles
- [ ] Write deployment instructions in README

---

## Test Execution Commands

```bash
# Server tests
cd server && npm test                    # Run all tests
cd server && npm test -- --watch         # Watch mode
cd server && npm test -- --coverage      # Coverage report

# Client tests
cd client && npm test                    # Run all tests
cd client && npm test -- --watch         # Watch mode
cd client && npm test -- --coverage      # Coverage report
```

---

## TDD Checklist Per Step

For every step above, follow this cycle:

1. **RED** — Write the failing test first
2. **GREEN** — Write the minimum code to make it pass
3. **REFACTOR** — Clean up without changing behavior, ensure tests still pass

---

## Dependency Order

```
Phase 0 (scaffolding)
  └→ Phase 1 (models)
       └→ Phase 2 (auth middleware)
            └→ Phase 3 (auth routes)
            └→ Phase 4 (pantry routes)
       └→ Phase 5 (service clients)
            └→ Phase 6 (recipe routes)
  └→ Phase 7 (server assembly)
  └→ Phase 8 (theme) ──────────────┐
  └→ Phase 9 (client auth) ────────┤
  └→ Phase 10 (UI components) ─────┤
       └→ Phase 11 (pantry feature) ┤
       └→ Phase 12 (recipe feature) ┤
       └→ Phase 13 (layout/landing) ┘
            └→ Phase 14 (integration)
                 └→ Phase 15 (polish)
```

> **Total estimated test count**: ~140 unit/integration tests
