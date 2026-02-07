# AIMealPlannerWhatToCook - Project Index

Generated: 2026-02-07

## Project Overview
Family-focused AI meal planner that suggests recipes based on pantry ingredients using Spoonacular API and OpenRouter AI.

## Project Structure

```
AIMealPlannerWhatToCook/
├── server/                 # Node.js/Express backend
│   ├── config/            # db.js, passport.js
│   ├── models/            # User, Pantry, SavedRecipe (Mongoose)
│   ├── routes/            # auth, pantry, recipes
│   ├── services/          # spoonacular.js, openrouter.js
│   ├── middleware/        # auth.js (JWT verification)
│   ├── utils/             # token.js
│   ├── __tests__/         # 13 test files, 83 tests
│   ├── index.js           # Express app entry point
│   └── jest.config.js     # Test configuration
├── client/                # Next.js 14 frontend
│   ├── src/
│   │   ├── app/           # Pages: home, pantry, recipes, favorites
│   │   ├── components/    # Navbar, RecipeCard, PantryList, UI primitives
│   │   ├── context/       # AuthContext, ThemeContext
│   │   └── lib/           # api.ts (fetch wrapper)
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── design.md              # Full architecture spec
├── workflow.md            # TDD workflow (15 phases)
├── CLAUDE.md              # Project instructions
└── PROJECT_INDEX.md       # This file
```

## Entry Points

- **Server**: `server/index.js` — Express app on PORT 5000
- **Client**: `client/src/app/layout.tsx` — Root layout with providers

## Core Modules

### Server
| Module | Path | Purpose |
|--------|------|---------|
| User | `server/models/User.js` | Google OAuth user with preferences |
| Pantry | `server/models/Pantry.js` | User's ingredient list (strings only) |
| SavedRecipe | `server/models/SavedRecipe.js` | Saved recipe with nutrition |
| Auth routes | `server/routes/auth.js` | Google OAuth, /me, /logout |
| Pantry routes | `server/routes/pantry.js` | GET/PUT pantry items |
| Recipe routes | `server/routes/recipes.js` | Suggest, saved CRUD, detail |
| Spoonacular | `server/services/spoonacular.js` | Recipe API client (primary) |
| OpenRouter | `server/services/openrouter.js` | AI recipe fallback |
| Auth middleware | `server/middleware/auth.js` | JWT cookie verification |
| Token utils | `server/utils/token.js` | JWT generate/verify |
| DB config | `server/config/db.js` | MongoDB connection |
| Passport | `server/config/passport.js` | Google OAuth strategy |

### Client
| Module | Path | Purpose |
|--------|------|---------|
| AuthContext | `client/src/context/AuthContext.tsx` | Auth state + Google login |
| ThemeContext | `client/src/context/ThemeContext.tsx` | Dark/light mode toggle |
| API client | `client/src/lib/api.ts` | Fetch wrapper with credentials |
| Navbar | `client/src/components/Navbar.tsx` | Navigation + theme + auth |
| RecipeCard | `client/src/components/RecipeCard.tsx` | Recipe preview card |
| RecipeDetail | `client/src/components/RecipeDetail.tsx` | Full recipe view |
| PantryList | `client/src/components/PantryList.tsx` | Ingredient chips |
| IngredientInput | `client/src/components/IngredientInput.tsx` | Add ingredient input |
| Button/Card/Input | `client/src/components/ui/` | Reusable UI primitives |

## Test Coverage

**Server: 83 tests, 13 suites — all passing**

| Suite | Tests |
|-------|-------|
| DB connection | 2 |
| User model | 7 |
| Pantry model | 6 |
| SavedRecipe model | 7 |
| Token utils | 5 |
| Auth middleware | 5 |
| Passport config | 3 |
| Auth routes | 4 |
| Pantry routes | 12 |
| Recipe routes | 16 |
| Spoonacular client | 7 |
| OpenRouter client | 6 |
| App integration | 3 |

**Client: No unit tests yet (build verified)**

## Key Dependencies

### Server
express 5, mongoose 9, passport + google-oauth20, jsonwebtoken, cors, cookie-parser, dotenv

**Dev:** jest 30, supertest, mongodb-memory-server, nodemon

### Client
next 14, react 18, framer-motion, lucide-react, tailwindcss

**Dev:** jest, @testing-library/react, typescript

## Environment Variables

`PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `SPOONACULAR_API_KEY`, `OPENROUTER_API_KEY`, `CLIENT_URL`, `NEXT_PUBLIC_API_URL`

## Quick Start

```bash
# Server
cd server && npm install && npm run dev

# Client (new terminal)
cd client && npm install && npm run dev

# Tests
cd server && npm test
```
