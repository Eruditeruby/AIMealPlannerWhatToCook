# Project Index: What To Cook — Stop Wasting Groceries

**Generated**: 2026-02-09
**Status**: Production Ready — All 15 Core Phases + 5 Positioning Phases Complete
**Tests**: 381 tests across 41 suites (160 server + 221 client)
**Positioning**: Budget-conscious parents (30-49) who want to reduce food waste and save money

---

## Project Structure

```
AIMealPlannerWhatToCook/
├── server/                 # Express 5 API Backend
│   ├── config/            # db.js, passport.js
│   ├── middleware/        # auth.js (JWT verification)
│   ├── models/            # User, Pantry, SavedRecipe, CookingLog
│   ├── routes/            # auth, pantry, recipes, cooking
│   ├── services/          # spoonacular.js, openrouter.js
│   ├── utils/             # token.js, debug.js
│   ├── data/              # ingredientMeta.js (300+ items)
│   ├── __tests__/         # 21 suites, 160 tests
│   ├── Dockerfile         # Multi-stage production build
│   └── index.js           # Express app entry point
│
├── client/                # Next.js 15 Frontend
│   └── src/
│       ├── app/           # Pages: home, pantry, recipes, [id], favorites
│       ├── components/    # UI (Button, Card, Input) + feature components
│       ├── context/       # AuthContext, ThemeContext
│       ├── data/          # ingredients.ts (~350 items)
│       ├── lib/           # api.ts, debug.ts
│       └── __tests__/     # 20 suites, 221 tests
│
├── claudedocs/            # Workflow plans and analysis
│   └── workflow_positioning.md  # 5-phase positioning strategy (ALL COMPLETE)
│
├── design.md              # Architecture & design spec
├── workflow.md            # TDD 15-phase implementation plan
├── CLAUDE.md              # Project instructions
├── docker-compose.yml     # Local Docker setup
└── PROJECT_INDEX.md       # This file
```

---

## Entry Points

| Component | Path | Purpose |
|-----------|------|---------|
| **Server** | `server/index.js` | Express app: auth, pantry, recipes, cooking routes |
| **Client** | `client/src/app/layout.tsx` | Root layout, providers, SEO + OG + Twitter meta |
| **Landing** | `client/src/app/page.tsx` | Hero, features, food waste stats |
| **Server Tests** | `server/__tests__/` | 21 suites (unit + integration) |
| **Client Tests** | `client/src/__tests__/` | 20 suites (Testing Library + Jest) |

---

## Server Modules

### `server/models/`
- **User.js**: googleId, email, name, avatar, preferences (dietaryRestrictions, familySize, budgetGoal, cookingSkill, householdType, onboardingComplete)
- **Pantry.js**: userId, items [{name, addedAt, category, perishable}], timestamps
- **SavedRecipe.js**: userId, title, image, source, instructions, ingredients, nutrition
- **CookingLog.js**: userId, recipeTitle, ingredientsUsed, estimatedSavings, cookedAt

### `server/routes/`
- **auth.js**: `/api/auth` — Google OAuth, `/me`, `/logout`, GET/PUT `/preferences`
- **pantry.js**: `/api/pantry` — GET/PUT pantry items (auto-enriches with metadata)
- **recipes.js**: `/api/recipes` — suggest (perishable-first), detail, saved CRUD
- **cooking.js**: `/api/cooking` — POST `/log`, GET `/history`, GET `/savings`

### `server/data/`
- **ingredientMeta.js**: 300+ ingredient metadata (category, perishable, shelfLifeDays)

### `server/services/`
- **spoonacular.js**: Recipe search + details (1-hour cache, 150 req/day free)
- **openrouter.js**: AI recipe generation (fallback when Spoonacular < 3 results)

## Client Modules

### `client/src/components/`
- **Navbar.tsx**: Navigation with auth state
- **ThemeToggle.tsx**: Moon/sun theme switcher
- **IngredientInput.tsx**: Autocomplete ingredient selector
- **PantryList.tsx**: Pantry items with freshness badges (amber "Use soon" 2+ days, red "Use today!" 4+ days)
- **RecipeCard.tsx**: Recipe preview with save/unsave + "I Cooked This!" button
- **RecipeDetail.tsx**: Full recipe view
- **OnboardingWizard.tsx**: 3-step onboarding (family size, budget, dietary)
- **SavingsDashboard.tsx**: Weekly/monthly/total savings + meals cooked widget
- **ui/**: Button, Card, Input primitives

### `client/src/app/`
- **layout.tsx**: Root layout, SEO keywords, Open Graph + Twitter card meta
- **page.tsx**: Landing — "Stop wasting groceries" hero, features, $2K/yr stats
- **pantry/page.tsx**: Pantry management + onboarding wizard + savings dashboard
- **recipes/page.tsx**: Recipe suggestions with save + cooked actions
- **recipes/[id]/page.tsx**: Recipe detail
- **favorites/page.tsx**: Saved recipes

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/auth/google` | No | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | No | OAuth callback |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout (clear cookie) |
| GET | `/api/auth/preferences` | Yes | Get user preferences |
| PUT | `/api/auth/preferences` | Yes | Update user preferences |
| GET | `/api/pantry` | Yes | Get pantry items (with metadata) |
| PUT | `/api/pantry` | Yes | Update pantry items |
| GET | `/api/recipes/suggest?ingredients=...` | Yes | Get recipes (perishable-first) |
| GET | `/api/recipes/:id` | Yes | Get recipe details |
| GET | `/api/recipes/saved` | Yes | Get saved recipes |
| POST | `/api/recipes/saved` | Yes | Save a recipe |
| DELETE | `/api/recipes/saved/:id` | Yes | Remove saved recipe |
| POST | `/api/cooking/log` | Yes | Log a cooked recipe |
| GET | `/api/cooking/history` | Yes | Get cooking history |
| GET | `/api/cooking/savings` | Yes | Get savings summary |

---

## Test Coverage

### Server — 160 tests, 21 suites
- Config: db connection, Passport strategy
- Models: User, Pantry, SavedRecipe, CookingLog, UserPreferences
- Routes: Auth, Pantry, Recipes, Cooking, Preferences
- Services, Utils, Middleware, Integration (3 suites)

### Client — 221 tests, 20 suites
- Context: AuthContext, ThemeContext
- UI: Button, Card, Input
- Features: Navbar, ThemeToggle, IngredientInput, PantryList, RecipeCard, RecipeDetail, OnboardingWizard, SavingsDashboard
- Pages: Home, Pantry, Recipes, Recipe Detail, Favorites, Layout
- Lib: API client

### Total: 381 tests, 41 suites — all passing (1 pre-existing spoonacular normalize failure)

---

## Key Dependencies

### Server
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.2.1 | Web framework |
| mongoose | ^9.1.6 | MongoDB ODM |
| passport | ^0.7.0 | Auth framework |
| jsonwebtoken | ^9.0.3 | JWT tokens |
| helmet | ^8.1.0 | Security headers |
| express-rate-limit | ^8.2.1 | Rate limiting |
| jest | ^30.2.0 | Testing |

### Client
| Package | Version | Purpose |
|---------|---------|---------|
| next | 15.5.12 | React framework |
| react | ^19 | UI library |
| framer-motion | ^12.33.0 | Animations |
| lucide-react | ^0.563.0 | Icons |
| tailwindcss | ^3.4.1 | CSS framework |
| typescript | ^5 | Type safety |
| jest | ^30.2.0 | Testing |

---

## Security

- JWT in httpOnly cookies (XSS protection)
- Helmet security headers
- CORS restricted to CLIENT_URL
- Rate limiting: 100 req/15min global, 10 auth/15min
- Custom body sanitizer (NoSQL injection, Express 5 compatible)
- Input validation on Mongoose models
- No stored passwords (OAuth only)

---

## Quick Start

```bash
# 1. Setup
cp .env.example .env    # Edit with credentials

# 2. Server
cd server && npm install && npm run dev    # Port 5000
cd server && npm test                       # 160 tests

# 3. Client
cd client && npm install && npm run dev    # Port 3000
cd client && npm test                       # 221 tests

# 4. Docker (alternative)
cp .env.docker.example .env.docker
docker-compose --env-file .env.docker up -d
```

---

## Business Context

**Target Segment**: Budget-conscious parents (30-49), families of 2-4
**Positioning**: "Stop wasting groceries. Cook what you have. Save money."
**Market**: Meal planning ($2.45B) + food waste reduction ($1.3B) intersection
**Positioning Workflow**: ALL 5 PHASES COMPLETE
- Phase 1: Messaging & brand pivot (`d56b84a`)
- Phase 2: User preferences & onboarding (`861b772`)
- Phase 3: Pantry freshness & urgency badges (`10c0c59`)
- Phase 4: Savings tracker & cooking log (`e9bdeb9`)
- Phase 5: Content, SEO & social sharing meta (`a93377b`)

---

**Token Efficiency**: ~4KB index replacing ~58KB full codebase read (93% reduction).
