# AI Meal Planner ("What To Cook") — Project Instructions

## Project Overview

Family-focused AI meal planner that helps busy parents cook what they already have — saving money, reducing food waste, and ending the nightly "what's for dinner?" stress.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: Google OAuth via Passport.js + JWT (httpOnly cookie)
- **AI**: OpenRouter free models (recipe generation fallback)
- **Recipes**: Spoonacular free tier (primary source, 150 req/day)
- **Icons**: Lucide React
- **Font**: Inter

## Project Structure

```
AIMealPlannerWhatToCook/
├── client/          # Next.js 15 App Router frontend
│   ├── app/         # Pages (auth, pantry, recipes, favorites)
│   ├── components/  # UI components + feature components
│   ├── context/     # AuthContext, ThemeContext
│   ├── data/        # Static data (ingredients list)
│   ├── lib/         # API client, debug utility
│   └── styles/      # Tailwind + CSS variables
├── server/          # Express API backend
│   ├── config/      # db.js, passport.js
│   ├── middleware/   # auth.js (JWT verification)
│   ├── models/      # User, Pantry, SavedRecipe, CookingLog
│   ├── routes/      # auth, pantry, recipes, cooking
│   ├── services/    # spoonacular.js, openrouter.js
│   ├── data/        # ingredientMeta.js (300+ items)
│   └── utils/       # token.js, debug.js
├── design.md        # Full architecture & design spec
├── workflow.md      # TDD implementation workflow (15 phases)
└── CLAUDE.md        # This file
```

## Key Design Decisions

- Pantry tracks items with metadata (name, addedAt, category, perishable) and autocomplete (~350 ingredients)
- Recipe flow: Spoonacular first → OpenRouter AI fallback if < 3 results
- Dark/light mode via CSS variables + `data-theme` attribute
- Minimalist UI with smooth Framer Motion transitions
- State management: React Context (sufficient for MVP)

## Database Collections

- **Users**: googleId, email, name, avatar, preferences (dietaryRestrictions, familySize, budgetGoal, cookingSkill, householdType, onboardingComplete)
- **Pantries**: userId, items [{name, addedAt, category, perishable}], timestamps
- **SavedRecipes**: userId, title, image, source, instructions, ingredients, cookTime, servings, tags, nutrition
- **CookingLogs**: userId, recipeTitle, ingredientsUsed, estimatedSavings, cookedAt

## API Routes

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /api/auth/google | No |
| GET | /api/auth/google/callback | No |
| GET | /api/auth/me | Yes |
| GET | /api/pantry | Yes |
| PUT | /api/pantry | Yes |
| GET | /api/recipes/suggest?ingredients=... | Yes |
| GET | /api/recipes/:id | Yes |
| GET/POST/DELETE | /api/recipes/saved | Yes |
| GET/PUT | /api/auth/preferences | Yes |
| POST | /api/cooking/log | Yes |
| GET | /api/cooking/history | Yes |
| GET | /api/cooking/savings | Yes |

## Environment Variables

See `.env.example` for full list. Required:
- `MONGODB_URI`, `JWT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `SPOONACULAR_API_KEY`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_API_URL`

Optional:
- `DEBUG=true` — Enable server-side debug logging
- `NEXT_PUBLIC_DEBUG=true` — Enable client-side debug logging

## Development Methodology

**TDD (Test-Driven Development)**: Red → Green → Refactor for every feature. See `workflow.md` for the 15-phase core plan + `claudedocs/workflow_positioning.md` for the 5-phase positioning strategy.

## Commands

```bash
# Server
cd server && npm test              # Run tests
cd server && npm run dev           # Dev server (nodemon)

# Client
cd client && npm test              # Run tests
cd client && npm run dev           # Dev server (Next.js)
```

## Current Status

- [x] Project initialized (LICENSE, README)
- [x] Design spec complete (design.md)
- [x] TDD workflow defined (workflow.md)
- [x] Phase 0-15: Core app complete (production ready)
- [x] Positioning Phase 1: Messaging & brand pivot
- [x] Positioning Phase 2: User preferences & onboarding
- [x] Positioning Phase 3: Pantry freshness & urgency badges
- [x] Positioning Phase 4: Savings tracker & cooking log
- [x] Positioning Phase 5: Content, SEO & social sharing

**Total: 382 tests across 41 suites — all passing**

## Conventions

- Conventional commits: `type(scope): description`
- Test files: `__tests__/` directories mirroring source structure
- Components: PascalCase `.jsx` files
- Utils/services: camelCase `.js` files
- All secrets in `.env`, never committed
