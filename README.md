# What To Cook? — Stop Wasting Groceries

A meal planner for busy families that helps you cook what you already have — saving money, reducing food waste, and ending the nightly "what's for dinner?" stress. Powered by AI recipe suggestions from your pantry ingredients.

## Features

- **Cook What You Have** — AI-powered recipe suggestions from your pantry ingredients
- **Reduce Food Waste** — Freshness badges ("Use soon", "Use today!") so nothing expires unused
- **Track Savings** — Log cooked meals and see weekly/monthly/total savings ($5/meal estimate)
- **Pantry Management** — Track ingredients with autocomplete (~350 items), auto-enriched with category & perishability
- **Onboarding Wizard** — 3-step setup (family size, budget, dietary restrictions)
- **Save Favorites** — Build your family recipe book
- **Google OAuth** — Secure login with Google
- **Dark/Light Mode** — Smooth theme switching with CSS variables
- **Responsive Design** — Mobile-first layout with Tailwind CSS
- **SEO Optimized** — Open Graph, Twitter cards, food-waste-reduction keywords

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router, TypeScript) + Tailwind CSS + Framer Motion |
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
│   ├── models/            # User, Pantry, SavedRecipe, CookingLog
│   ├── routes/            # auth, pantry, recipes, cooking
│   ├── data/              # ingredientMeta.js (300+ items)
│   ├── services/          # spoonacular.js, openrouter.js
│   ├── utils/             # token.js, debug.js
│   ├── __tests__/         # 21 suites, 160 tests
│   └── index.js           # Entry point
├── client/                # Next.js 15 frontend
│   └── src/
│       ├── app/           # Pages (home, pantry, recipes, favorites)
│       ├── components/    # UI + feature components
│       ├── context/       # AuthContext, ThemeContext
│       ├── data/          # Static data (ingredients list)
│       ├── lib/           # API client, debug utility
│       └── __tests__/     # 20 suites, 221 tests
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
| `DEBUG` | Set to `true` to enable server debug logging (optional) |
| `NEXT_PUBLIC_DEBUG` | Set to `true` to enable client debug logging (optional) |

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
| GET | `/api/auth/preferences` | Yes | Get user preferences |
| PUT | `/api/auth/preferences` | Yes | Update user preferences |
| POST | `/api/cooking/log` | Yes | Log a cooked recipe |
| GET | `/api/cooking/history` | Yes | Get cooking history |
| GET | `/api/cooking/savings` | Yes | Get savings summary |
| GET | `/api/health` | No | Health check |

## Testing

```bash
# Server tests (160 tests, 21 suites)
cd server && npm test

# Client tests (221 tests, 20 suites)
cd client && npm test

# Integration tests
npm run test:integration

# E2E tests (requires live servers)
npm run test:e2e
```

**Total: 381 tests across 41 suites — all passing**

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
- [x] Phase 14: Integration testing (18/18 passing, E2E infrastructure complete)
- [x] Phase 15: Polish & deployment ready

### Positioning Workflow (Post-MVP)
- [x] Phase 1: Messaging & brand pivot — food waste reduction narrative
- [x] Phase 2: User preferences & onboarding wizard
- [x] Phase 3: Pantry freshness tracking & urgency badges
- [x] Phase 4: Savings tracker & "I Cooked This!" feature
- [x] Phase 5: Content, SEO & social sharing meta

## Deployment

### Option 1: Docker Compose (Local/VPS)

**Prerequisites**: Docker & Docker Compose installed

1. **Configure environment**
   ```bash
   cp .env.docker.example .env.docker
   # Edit .env.docker with your credentials
   ```

2. **Build and run**
   ```bash
   docker-compose --env-file .env.docker up -d
   ```

3. **Access the app**
   - Client: http://localhost:3000
   - Server: http://localhost:5000
   - MongoDB: localhost:27017

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

### Option 2: Railway (Cloud Platform)

Both services are containerized and ready for Railway deployment.

1. Create a [Railway](https://railway.app) project
2. Add MongoDB plugin ("New" → "Database" → "MongoDB")
3. Add two services from GitHub, setting root directories to `server/` and `client/`
4. Configure environment variables (see table above) on each service
5. Set `GOOGLE_CALLBACK_URL` to `https://<server>.up.railway.app/api/auth/google/callback`
6. Set `NEXT_PUBLIC_API_URL` to `https://<server>.up.railway.app`
7. Set `CLIENT_URL` to `https://<client>.up.railway.app`
8. Update Google Cloud Console with the Railway callback URL

### Option 3: Manual Deployment

**Server**:
```bash
cd server
npm ci --omit=dev
NODE_ENV=production node index.js
```

**Client**:
```bash
cd client
npm ci
npm run build
npm start
```

### Production Checklist

- [ ] Update all environment variables for production URLs
- [ ] Generate a strong JWT_SECRET (min 32 characters)
- [ ] Update Google OAuth callback URL in Google Cloud Console
- [ ] Configure MongoDB connection string (Atlas recommended)
- [ ] Test authentication flow end-to-end
- [ ] Verify CORS settings allow client domain
- [ ] Test Spoonacular and OpenRouter API keys
- [ ] Monitor rate limits on external APIs
- [ ] Set up error monitoring (optional: Sentry, LogRocket)
- [ ] Configure SSL/TLS certificates (if not using Railway/Render)

## License

MIT

---

**Author**: Rubisha Saini
