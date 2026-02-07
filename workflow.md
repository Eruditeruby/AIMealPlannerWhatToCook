# AI Meal Planner — TDD Implementation Workflow

> **Methodology**: Test-Driven Development (Red → Green → Refactor)
> **Reference**: [design.md](./design.md)

---

## Phase 0: Project Scaffolding & Test Infrastructure

### 0.1 Initialize Server Project
- [ ] `mkdir server && cd server && npm init -y`
- [ ] Install production deps: `express mongoose passport passport-google-oauth20 jsonwebtoken cookie-parser cors dotenv`
- [ ] Install dev deps: `jest supertest mongodb-memory-server @types/jest nodemon`
- [ ] Create `jest.config.js` with test environment settings
- [ ] Create `.env.example` with all env vars from design doc
- [ ] Create `server/index.js` entry point (empty Express app, export for testing)

### 0.2 Initialize Client Project
- [ ] `npx create-next-app@14 client --app --tailwind --eslint`
- [ ] Install deps: `framer-motion lucide-react`
- [ ] Install dev deps: `@testing-library/react @testing-library/jest-dom jest jest-environment-jsdom`
- [ ] Create `jest.config.js` for Next.js
- [ ] Set up Tailwind CSS variables for dark/light theming in `globals.css`

### 0.3 Git & Config
- [ ] Create `.gitignore` (node_modules, .env, .DS_Store, coverage/)
- [ ] Create `.env.example` at root
- [ ] Initial commit

---

## Phase 1: Database Models (Server)

### 1.1 MongoDB Connection

**Test first** (`server/__tests__/config/db.test.js`):
- [ ] Test: `connectDB()` connects to in-memory MongoDB successfully
- [ ] Test: `connectDB()` throws on invalid URI
- [ ] **Implement**: `server/config/db.js` — Mongoose connect function
- [ ] Refactor: extract connection options to config

### 1.2 User Model

**Test first** (`server/__tests__/models/User.test.js`):
- [ ] Test: creates a valid user with googleId, email, name, avatar
- [ ] Test: `googleId` is required
- [ ] Test: `email` is required
- [ ] Test: `createdAt` defaults to now
- [ ] Test: `preferences.dietaryRestrictions` defaults to empty array
- [ ] Test: `preferences.familySize` defaults to null
- [ ] Test: rejects duplicate `googleId`
- [ ] **Implement**: `server/models/User.js` — Mongoose schema + model
- [ ] Refactor: add index on `googleId`

### 1.3 Pantry Model

**Test first** (`server/__tests__/models/Pantry.test.js`):
- [ ] Test: creates a pantry with userId and items array
- [ ] Test: `userId` is required
- [ ] Test: `items` defaults to empty array
- [ ] Test: `items` only accepts strings
- [ ] Test: `createdAt` and `updatedAt` are auto-set
- [ ] Test: one pantry per user (unique userId)
- [ ] **Implement**: `server/models/Pantry.js` — Mongoose schema + model
- [ ] Refactor: add index on `userId`

### 1.4 SavedRecipe Model

**Test first** (`server/__tests__/models/SavedRecipe.test.js`):
- [ ] Test: creates a saved recipe with all required fields (userId, title, source, ingredients)
- [ ] Test: `source` only accepts "spoonacular" or "ai"
- [ ] Test: `nutrition` sub-document has calories, protein, carbs, fat
- [ ] Test: `tags` defaults to empty array
- [ ] Test: `savedAt` defaults to now
- [ ] Test: `sourceId` is optional (null for AI recipes)
- [ ] Test: user can save multiple recipes
- [ ] **Implement**: `server/models/SavedRecipe.js` — Mongoose schema + model
- [ ] Refactor: add compound index on `userId` + `savedAt`

---

## Phase 2: Auth Middleware & JWT (Server)

### 2.1 JWT Auth Middleware

**Test first** (`server/__tests__/middleware/auth.test.js`):
- [ ] Test: returns 401 if no token cookie present
- [ ] Test: returns 401 if token is invalid/expired
- [ ] Test: sets `req.user` with decoded payload on valid token
- [ ] Test: calls `next()` on valid token
- [ ] Test: handles malformed JWT gracefully (no crash)
- [ ] **Implement**: `server/middleware/auth.js` — verify JWT from httpOnly cookie
- [ ] Refactor: extract token extraction logic

### 2.2 JWT Token Utility

**Test first** (`server/__tests__/utils/token.test.js`):
- [ ] Test: `generateToken(user)` returns a valid JWT string
- [ ] Test: token contains userId and email in payload
- [ ] Test: token expires in configured time (e.g. 7 days)
- [ ] Test: `verifyToken(token)` returns decoded payload
- [ ] Test: `verifyToken(invalidToken)` throws error
- [ ] **Implement**: `server/utils/token.js` — generateToken, verifyToken
- [ ] Refactor: make expiry configurable via env

---

## Phase 3: Auth Routes (Server)

### 3.1 Passport Google Strategy Config

**Test first** (`server/__tests__/config/passport.test.js`):
- [ ] Test: strategy is registered as "google"
- [ ] Test: callback creates new user if googleId not found
- [ ] Test: callback returns existing user if googleId found
- [ ] Test: user object has id, email, name, avatar
- [ ] **Implement**: `server/config/passport.js` — Google OAuth strategy
- [ ] Refactor: extract user upsert logic

### 3.2 Auth Route Endpoints

**Test first** (`server/__tests__/routes/auth.test.js`):
- [ ] Test: `GET /api/auth/google` redirects to Google (status 302)
- [ ] Test: `GET /api/auth/me` returns 401 without token
- [ ] Test: `GET /api/auth/me` returns user profile with valid token
- [ ] Test: `GET /api/auth/me` response shape: `{ id, email, name, avatar, preferences }`
- [ ] Test: `POST /api/auth/logout` clears the JWT cookie
- [ ] **Implement**: `server/routes/auth.js` — auth router
- [ ] Refactor: add logout endpoint

---

## Phase 4: Pantry Routes (Server)

### 4.1 GET /api/pantry

**Test first** (`server/__tests__/routes/pantry.test.js`):
- [ ] Test: returns 401 without auth
- [ ] Test: returns empty pantry `{ items: [] }` for new user
- [ ] Test: returns existing pantry items for authenticated user
- [ ] Test: response shape: `{ items: [...], updatedAt }`
- [ ] **Implement**: GET handler in `server/routes/pantry.js`

### 4.2 PUT /api/pantry

**Test first** (same file):
- [ ] Test: returns 401 without auth
- [ ] Test: creates pantry if none exists, sets items
- [ ] Test: updates existing pantry items (full replace)
- [ ] Test: accepts `{ items: ["chicken", "rice"] }`
- [ ] Test: rejects non-array items (400)
- [ ] Test: rejects non-string items in array (400)
- [ ] Test: trims and lowercases item names
- [ ] Test: removes duplicate items
- [ ] Test: updates `updatedAt` timestamp
- [ ] **Implement**: PUT handler in `server/routes/pantry.js`
- [ ] Refactor: extract input validation to middleware/helper

---

## Phase 5: External Service Clients (Server)

### 5.1 Spoonacular Client

**Test first** (`server/__tests__/services/spoonacular.test.js`):
- [ ] Test: `findByIngredients(["chicken", "rice"])` calls correct Spoonacular URL
- [ ] Test: returns normalized recipe array `[{ id, title, image, usedIngredients, missedIngredients }]`
- [ ] Test: `getRecipeDetails(id)` returns full recipe (instructions, nutrition, etc.)
- [ ] Test: handles Spoonacular API error (returns empty array, logs error)
- [ ] Test: handles rate limit (402) gracefully
- [ ] Test: handles empty ingredients list (returns empty array)
- [ ] **Implement**: `server/services/spoonacular.js` — API client with fetch
- [ ] Refactor: add response caching (in-memory, 1 hour TTL)

### 5.2 OpenRouter AI Client

**Test first** (`server/__tests__/services/openrouter.test.js`):
- [ ] Test: `suggestRecipes(["chicken", "rice"])` sends correct prompt to OpenRouter
- [ ] Test: prompt includes "family-friendly" instruction
- [ ] Test: returns normalized recipe array matching app schema
- [ ] Test: parses AI JSON response correctly
- [ ] Test: handles malformed AI response (returns empty array)
- [ ] Test: handles API error (returns empty array, logs error)
- [ ] Test: handles empty ingredients list (returns empty array)
- [ ] **Implement**: `server/services/openrouter.js` — OpenRouter chat completions client
- [ ] Refactor: extract prompt template, make model configurable

---

## Phase 6: Recipe Routes (Server)

### 6.1 GET /api/recipes/suggest

**Test first** (`server/__tests__/routes/recipes.test.js`):
- [ ] Test: returns 401 without auth
- [ ] Test: returns 400 if no `ingredients` query param
- [ ] Test: calls Spoonacular with parsed ingredients
- [ ] Test: if Spoonacular returns 3+ results, returns them without AI call
- [ ] Test: if Spoonacular returns < 3 results, also calls OpenRouter
- [ ] Test: merges Spoonacular + AI results, marks source on each
- [ ] Test: response shape: `{ recipes: [{ title, image, source, sourceId, ingredients, cookTime, servings }] }`
- [ ] Test: handles both services failing (returns empty array + message)
- [ ] **Implement**: GET handler in `server/routes/recipes.js`
- [ ] Refactor: extract suggestion logic to a service

### 6.2 GET /api/recipes/:id

**Test first** (same file):
- [ ] Test: returns 401 without auth
- [ ] Test: returns recipe detail from Spoonacular by sourceId
- [ ] Test: returns 404 for unknown recipe ID
- [ ] Test: response includes instructions, nutrition, full ingredients
- [ ] **Implement**: GET detail handler

### 6.3 POST /api/recipes/saved

**Test first** (same file):
- [ ] Test: returns 401 without auth
- [ ] Test: saves recipe to user's saved list
- [ ] Test: returns 400 if required fields missing (title, source, ingredients)
- [ ] Test: accepts valid recipe payload and returns saved document
- [ ] Test: does not duplicate if same sourceId already saved by user
- [ ] **Implement**: POST handler

### 6.4 GET /api/recipes/saved

**Test first** (same file):
- [ ] Test: returns 401 without auth
- [ ] Test: returns empty array for user with no saved recipes
- [ ] Test: returns all saved recipes for authenticated user
- [ ] Test: results sorted by `savedAt` descending
- [ ] **Implement**: GET saved handler

### 6.5 DELETE /api/recipes/saved/:id

**Test first** (same file):
- [ ] Test: returns 401 without auth
- [ ] Test: deletes saved recipe by ID
- [ ] Test: returns 404 if recipe not found or doesn't belong to user
- [ ] Test: cannot delete another user's saved recipe
- [ ] **Implement**: DELETE handler
- [ ] Refactor: ensure all recipe routes use consistent error format

---

## Phase 7: Server Integration & App Assembly

### 7.1 Express App Setup

**Test first** (`server/__tests__/app.test.js`):
- [ ] Test: app responds to `GET /api/health` with `{ status: "ok" }`
- [ ] Test: CORS allows configured client origin
- [ ] Test: unknown routes return 404 JSON
- [ ] Test: JSON parsing middleware works
- [ ] Test: cookie parser is configured
- [ ] **Implement**: `server/index.js` — assemble Express app with all routes
- [ ] Add unhandled rejection / uncaught exception handlers
- [ ] Refactor: separate app creation from server listen (for testability)

---

## Phase 8: Client — Theme System (Frontend)

### 8.1 ThemeContext

**Test first** (`client/__tests__/context/ThemeContext.test.js`):
- [ ] Test: provides default theme ("light")
- [ ] Test: `toggleTheme()` switches from light to dark
- [ ] Test: `toggleTheme()` switches from dark to light
- [ ] Test: persists theme preference in localStorage
- [ ] Test: reads initial theme from localStorage
- [ ] Test: sets `data-theme` attribute on document
- [ ] **Implement**: `client/context/ThemeContext.js`
- [ ] Refactor: respect system preference via `prefers-color-scheme`

### 8.2 ThemeToggle Component

**Test first** (`client/__tests__/components/ThemeToggle.test.js`):
- [ ] Test: renders sun icon in dark mode
- [ ] Test: renders moon icon in light mode
- [ ] Test: calls `toggleTheme` on click
- [ ] Test: has accessible label
- [ ] **Implement**: `client/components/ThemeToggle.jsx`

### 8.3 Global Styles & CSS Variables

- [ ] Set up Tailwind CSS variables in `globals.css` for light/dark tokens
- [ ] Test: verify color tokens match design spec (visual test)
- [ ] Configure Inter font via next/font

---

## Phase 9: Client — Auth System (Frontend)

### 9.1 API Client

**Test first** (`client/__tests__/lib/api.test.js`):
- [ ] Test: `api.get(url)` calls fetch with credentials: "include"
- [ ] Test: `api.post(url, data)` sends JSON body with correct headers
- [ ] Test: `api.put(url, data)` sends JSON body
- [ ] Test: `api.delete(url)` sends DELETE request
- [ ] Test: throws on non-OK response with error message
- [ ] Test: uses `NEXT_PUBLIC_API_URL` as base URL
- [ ] **Implement**: `client/lib/api.js` — fetch wrapper

### 9.2 AuthContext

**Test first** (`client/__tests__/context/AuthContext.test.js`):
- [ ] Test: provides `user: null` initially
- [ ] Test: `checkAuth()` calls `/api/auth/me` and sets user
- [ ] Test: `checkAuth()` sets user to null on 401
- [ ] Test: provides `isAuthenticated` boolean
- [ ] Test: provides `isLoading` state during auth check
- [ ] Test: `login()` redirects to `/api/auth/google`
- [ ] Test: `logout()` calls logout endpoint and clears user
- [ ] **Implement**: `client/context/AuthContext.js`

---

## Phase 10: Client — UI Components (Frontend)

### 10.1 Navbar

**Test first** (`client/__tests__/components/Navbar.test.js`):
- [ ] Test: renders app name/logo
- [ ] Test: shows "Sign in" button when not authenticated
- [ ] Test: shows user avatar + name when authenticated
- [ ] Test: shows navigation links (Pantry, Recipes, Favorites) when authenticated
- [ ] Test: includes ThemeToggle
- [ ] Test: is responsive (hamburger menu on mobile)
- [ ] **Implement**: `client/components/Navbar.jsx`

### 10.2 Button Component

**Test first** (`client/__tests__/components/ui/Button.test.js`):
- [ ] Test: renders children text
- [ ] Test: applies variant styles (primary, secondary, ghost)
- [ ] Test: handles click events
- [ ] Test: shows loading spinner when `isLoading`
- [ ] Test: is disabled when `disabled` prop set
- [ ] **Implement**: `client/components/ui/Button.jsx`

### 10.3 Card Component

**Test first** (`client/__tests__/components/ui/Card.test.js`):
- [ ] Test: renders children
- [ ] Test: applies hover animation class
- [ ] Test: accepts className prop for customization
- [ ] **Implement**: `client/components/ui/Card.jsx`

### 10.4 Input Component

**Test first** (`client/__tests__/components/ui/Input.test.js`):
- [ ] Test: renders with label
- [ ] Test: handles onChange events
- [ ] Test: shows error message when provided
- [ ] Test: supports placeholder
- [ ] **Implement**: `client/components/ui/Input.jsx`

---

## Phase 11: Client — Pantry Feature (Frontend)

### 11.1 IngredientInput Component

**Test first** (`client/__tests__/components/IngredientInput.test.js`):
- [ ] Test: renders input field with "Add ingredient" placeholder
- [ ] Test: calls `onAdd(ingredient)` on Enter key press
- [ ] Test: calls `onAdd(ingredient)` on "Add" button click
- [ ] Test: clears input after adding
- [ ] Test: does not add empty/whitespace-only strings
- [ ] Test: trims input before adding
- [ ] **Implement**: `client/components/IngredientInput.jsx`

### 11.2 PantryList Component

**Test first** (`client/__tests__/components/PantryList.test.js`):
- [ ] Test: renders list of ingredient items
- [ ] Test: each item has a remove button (X)
- [ ] Test: calls `onRemove(item)` when remove clicked
- [ ] Test: shows empty state message when no items
- [ ] Test: items animate in/out with Framer Motion
- [ ] **Implement**: `client/components/PantryList.jsx`

### 11.3 Pantry Page

**Test first** (`client/__tests__/app/pantry/page.test.js`):
- [ ] Test: redirects to auth if not logged in
- [ ] Test: loads and displays user's pantry on mount
- [ ] Test: adding an ingredient calls PUT /api/pantry with updated list
- [ ] Test: removing an ingredient calls PUT /api/pantry with updated list
- [ ] Test: shows loading skeleton while fetching
- [ ] Test: shows "What Can I Cook?" button when pantry has items
- [ ] Test: "What Can I Cook?" navigates to /recipes with ingredients param
- [ ] **Implement**: `client/app/pantry/page.js`

---

## Phase 12: Client — Recipe Feature (Frontend)

### 12.1 RecipeCard Component

**Test first** (`client/__tests__/components/RecipeCard.test.js`):
- [ ] Test: renders recipe title
- [ ] Test: renders recipe image (with fallback if none)
- [ ] Test: shows cook time and servings
- [ ] Test: shows source badge ("Spoonacular" or "AI")
- [ ] Test: shows save/heart button
- [ ] Test: calls `onSave(recipe)` on heart click
- [ ] Test: navigates to recipe detail on card click
- [ ] Test: has hover animation
- [ ] **Implement**: `client/components/RecipeCard.jsx`

### 12.2 RecipeDetail Component

**Test first** (`client/__tests__/components/RecipeDetail.test.js`):
- [ ] Test: renders recipe title and image
- [ ] Test: renders ingredients list
- [ ] Test: renders step-by-step instructions
- [ ] Test: renders cook time and servings
- [ ] Test: renders nutrition info (calories, protein, carbs, fat)
- [ ] Test: renders tags (kid-friendly, etc.)
- [ ] Test: shows save button
- [ ] **Implement**: `client/components/RecipeDetail.jsx`

### 12.3 Recipes Page (Suggestions)

**Test first** (`client/__tests__/app/recipes/page.test.js`):
- [ ] Test: redirects to auth if not logged in
- [ ] Test: reads ingredients from query params
- [ ] Test: calls GET /api/recipes/suggest with ingredients
- [ ] Test: displays loading skeleton while fetching
- [ ] Test: renders grid of RecipeCards with results
- [ ] Test: shows "No recipes found" message on empty results
- [ ] Test: shows error message on API failure
- [ ] **Implement**: `client/app/recipes/page.js`

### 12.4 Recipe Detail Page

**Test first** (`client/__tests__/app/recipes/[id]/page.test.js`):
- [ ] Test: redirects to auth if not logged in
- [ ] Test: calls GET /api/recipes/:id on mount
- [ ] Test: renders RecipeDetail component with fetched data
- [ ] Test: shows loading skeleton while fetching
- [ ] Test: shows 404 message for invalid ID
- [ ] **Implement**: `client/app/recipes/[id]/page.js`

### 12.5 Favorites Page

**Test first** (`client/__tests__/app/favorites/page.test.js`):
- [ ] Test: redirects to auth if not logged in
- [ ] Test: calls GET /api/recipes/saved on mount
- [ ] Test: renders grid of saved RecipeCards
- [ ] Test: shows empty state when no favorites
- [ ] Test: unsave removes card from list (calls DELETE, updates UI)
- [ ] **Implement**: `client/app/favorites/page.js`

---

## Phase 13: Client — Landing Page & Layout

### 13.1 Root Layout

**Test first** (`client/__tests__/app/layout.test.js`):
- [ ] Test: wraps children with AuthContext provider
- [ ] Test: wraps children with ThemeContext provider
- [ ] Test: renders Navbar
- [ ] Test: applies Inter font
- [ ] **Implement**: `client/app/layout.js`

### 13.2 Landing Page

**Test first** (`client/__tests__/app/page.test.js`):
- [ ] Test: renders hero section with app title and tagline
- [ ] Test: shows "Get Started" button linking to auth
- [ ] Test: shows feature highlights (pantry, recipes, favorites)
- [ ] Test: has smooth entrance animations (Framer Motion)
- [ ] Test: redirects to /pantry if already authenticated
- [ ] **Implement**: `client/app/page.js`

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
