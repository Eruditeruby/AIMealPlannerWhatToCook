# AI Meal Planner — What To Cook?

A family-focused AI meal planner that suggests recipes based on available ingredients, with persistent pantry tracking and nutritional insights.

## Features

- **Google OAuth** — Secure login with Google
- **Pantry Management** — Track ingredients you have at home
- **Smart Recipe Suggestions** — Spoonacular API + OpenRouter AI fallback
- **Save Favorites** — Bookmark recipes for later
- **Dark/Light Mode** — Smooth theme switching with CSS variables
- **Responsive Design** — Mobile-first layout with Tailwind CSS
- **Framer Motion** — Smooth page transitions and animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router, TypeScript) + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express 5 |
| Database | MongoDB (Mongoose 9) |
| Auth | Google OAuth via Passport.js + JWT (httpOnly cookie) |
| AI | OpenRouter free models (recipe generation fallback) |
| Recipes | Spoonacular free tier (150 req/day) |
| Icons | Lucide React |
| Font | Inter (Google Fonts) |
| Testing | Jest 30 + Testing Library + Supertest |

## Project Structure

```
AIMealPlannerWhatToCook/
├── server/                 # Express API backend
│   ├── config/            # db.js, passport.js
│   ├── middleware/        # auth.js (JWT verification)
│   ├── models/            # User, Pantry, SavedRecipe
│   ├── routes/            # auth, pantry, recipes
│   ├── services/          # spoonacular.js, openrouter.js
│   ├── utils/             # token.js
│   ├── __tests__/         # 13 suites, 83 tests
│   └── index.js           # Entry point
├── client/                # Next.js 14 frontend
│   └── src/
│       ├── app/           # Pages (home, pantry, recipes, favorites)
│       ├── components/    # UI + feature components
│       ├── context/       # AuthContext, ThemeContext
│       ├── lib/           # API client (fetch wrapper)
│       └── __tests__/     # 18 suites, 181 tests
├── design.md              # Architecture & design spec
├── workflow.md            # TDD implementation workflow
└── PROJECT_INDEX.md       # Session bootstrapping index
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google OAuth credentials
- Spoonacular API key
- OpenRouter API key (free)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/Eruditeruby/AIMealPlannerWhatToCook.git
   cd AIMealPlannerWhatToCook
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Install & run server**
   ```bash
   cd server
   npm install
   npm run dev          # Runs on port 5000
   ```

4. **Install & run client** (new terminal)
   ```bash
   cd client
   npm install
   npm run dev          # Runs on port 3000
   ```

### Environment Variables

See `.env.example` for the full list. Required:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL |
| `SPOONACULAR_API_KEY` | Spoonacular API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `NEXT_PUBLIC_API_URL` | Client-side API base URL |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/google` | No | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | No | OAuth callback |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout (clear cookie) |
| GET | `/api/pantry` | Yes | Get pantry items |
| PUT | `/api/pantry` | Yes | Update pantry items |
| GET | `/api/recipes/suggest?ingredients=...` | Yes | Get recipe suggestions |
| GET | `/api/recipes/:id` | Yes | Get recipe detail |
| GET | `/api/recipes/saved` | Yes | Get saved recipes |
| POST | `/api/recipes/saved` | Yes | Save a recipe |
| DELETE | `/api/recipes/saved/:id` | Yes | Remove saved recipe |
| GET | `/api/health` | No | Health check |

## Testing

```bash
# Server tests (83 tests, 13 suites)
cd server && npm test

# Client tests (181 tests, 18 suites)
cd client && npm test

# With coverage
cd server && npm test -- --coverage    # 83% statements
cd client && npm test -- --coverage    # 94% statements, 95% lines
```

**Total: 264 tests across 31 suites — all passing**

## Development Status

- [x] Phase 0: Scaffolding & test infrastructure
- [x] Phase 1: Database models (User, Pantry, SavedRecipe)
- [x] Phase 2: Auth middleware & JWT
- [x] Phase 3: Auth routes (Google OAuth)
- [x] Phase 4: Pantry routes
- [x] Phase 5: External service clients (Spoonacular, OpenRouter)
- [x] Phase 6: Recipe routes
- [x] Phase 7: Server integration & app assembly
- [x] Phase 8: Theme system (ThemeContext, ThemeToggle, CSS variables)
- [x] Phase 9: Auth system (AuthContext, API client)
- [x] Phase 10: UI components (Button, Card, Input, Navbar)
- [x] Phase 11: Pantry feature (IngredientInput, PantryList, Pantry page)
- [x] Phase 12: Recipe feature (RecipeCard, RecipeDetail, pages)
- [x] Phase 13: Landing page & layout
- [ ] Phase 14: Integration testing
- [ ] Phase 15: Polish & deployment

## License

MIT

---

**Author**: Rubisha Saini
