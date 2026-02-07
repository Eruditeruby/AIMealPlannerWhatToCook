# AI Meal Planner ("What To Cook") — Project Instructions

## Project Overview

Family-focused AI meal planner that suggests recipes based on available ingredients, with persistent pantry tracking and nutritional insights.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Framer Motion
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
├── client/          # Next.js 14 App Router frontend
│   ├── app/         # Pages (auth, pantry, recipes, favorites)
│   ├── components/  # UI components + feature components
│   ├── context/     # AuthContext, ThemeContext
│   ├── lib/         # API client (fetch wrapper)
│   └── styles/      # Tailwind + CSS variables
├── server/          # Express API backend
│   ├── config/      # db.js, passport.js
│   ├── middleware/   # auth.js (JWT verification)
│   ├── models/      # User, Pantry, SavedRecipe (Mongoose)
│   ├── routes/      # auth, pantry, recipes
│   ├── services/    # spoonacular.js, openrouter.js
│   └── utils/       # token.js
├── design.md        # Full architecture & design spec
├── workflow.md      # TDD implementation workflow (15 phases)
└── CLAUDE.md        # This file
```

## Key Design Decisions

- Pantry tracks **item names only** (no quantities)
- Recipe flow: Spoonacular first → OpenRouter AI fallback if < 3 results
- Dark/light mode via CSS variables + `data-theme` attribute
- Minimalist UI with smooth Framer Motion transitions
- State management: React Context (sufficient for MVP)

## Database Collections

- **Users**: googleId, email, name, avatar, preferences (dietaryRestrictions, familySize)
- **Pantries**: userId, items (string array), timestamps
- **SavedRecipes**: userId, title, image, source, instructions, ingredients, cookTime, servings, tags, nutrition

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

## Environment Variables

See `.env.example` for full list. Required:
- `MONGODB_URI`, `JWT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `SPOONACULAR_API_KEY`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_API_URL`

## Development Methodology

**TDD (Test-Driven Development)**: Red → Green → Refactor for every feature. See `workflow.md` for the full 15-phase plan. Actual test count: 264 tests (exceeded the ~140 estimate).

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
- [x] Phase 0: Scaffolding & test infrastructure
- [x] Phase 1-7: Server implementation (83 tests, 13 suites, 83% coverage)
- [x] Phase 8-13: Client implementation (181 tests, 18 suites, 94% coverage)
- [ ] Phase 14: Integration testing
- [ ] Phase 15: Polish & deployment

**Total: 264 tests across 31 suites — all passing**

## Conventions

- Conventional commits: `type(scope): description`
- Test files: `__tests__/` directories mirroring source structure
- Components: PascalCase `.jsx` files
- Utils/services: camelCase `.js` files
- All secrets in `.env`, never committed
