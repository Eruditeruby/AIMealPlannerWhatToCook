# Project Index: AI Meal Planner (What To Cook)

**Generated**: 2026-02-07
**Status**: Backend & Frontend Complete — Integration Testing Pending
**Test Coverage**: 279 tests (86 server + 193 client) across 31 suites — 100% passing

---

## 📁 Project Structure

```
AIMealPlannerWhatToCook/
├── server/                 # Express 5 API Backend (83% coverage)
│   ├── config/            # Database & Passport configuration
│   ├── middleware/        # JWT auth middleware
│   ├── models/            # Mongoose schemas (User, Pantry, SavedRecipe)
│   ├── routes/            # API endpoints (auth, pantry, recipes)
│   ├── services/          # External APIs (Spoonacular, OpenRouter)
│   ├── utils/             # Token generation, debug utilities
│   ├── __tests__/         # 13 test suites, 86 tests
│   └── index.js           # Express app entry point
│
├── client/                # Next.js 15 Frontend (94% coverage)
│   └── src/
│       ├── app/           # App Router pages (home, pantry, recipes, favorites)
│       ├── components/    # UI & feature components
│       ├── context/       # React Context (Auth, Theme)
│       ├── data/          # Static data (~350 ingredients)
│       ├── lib/           # API client, debug utilities
│       └── __tests__/     # 18 test suites, 193 tests
│
├── .github/workflows/     # CI/CD (future)
├── .serena/               # Serena MCP cache
├── .claude/               # Claude Code memory
├── design.md              # Architecture & design specification
├── workflow.md            # TDD implementation workflow (15 phases)
├── CLAUDE.md              # Project instructions
├── DEPLOYMENT.md          # Railway deployment guide
└── PROJECT_INDEX.md       # This file
```

---

## 🚀 Entry Points

| Component | Path | Purpose |
|-----------|------|---------|
| **Server** | `server/index.js` | Express app with auth, pantry, recipes routes |
| **Client** | `client/src/app/layout.tsx` | Next.js root layout with providers |
| **Landing** | `client/src/app/page.tsx` | Home page (unauthenticated) |
| **Server Tests** | `server/__tests__/` | Jest test suites (13 suites) |
| **Client Tests** | `client/src/__tests__/` | Jest + Testing Library (18 suites) |

---

## 📦 Core Modules

### Server Modules

#### `server/config/`
- **db.js**: MongoDB connection with Mongoose 9
- **passport.js**: Google OAuth strategy configuration

#### `server/middleware/`
- **auth.js**: JWT verification middleware (protects routes)

#### `server/models/`
- **User.js**: User schema (googleId, email, name, avatar, preferences)
- **Pantry.js**: Pantry schema (userId, items array, timestamps)
- **SavedRecipe.js**: SavedRecipe schema (userId, title, image, ingredients, etc.)

#### `server/routes/`
- **auth.js**: `/api/auth` — Google OAuth flow, `/me`, `/logout`
- **pantry.js**: `/api/pantry` — GET/PUT pantry items
- **recipes.js**: `/api/recipes` — Suggest, detail, saved CRUD

#### `server/services/`
- **spoonacular.js**: Spoonacular API client (recipe search, details)
- **openrouter.js**: OpenRouter AI client (fallback recipe generation)

#### `server/utils/`
- **token.js**: JWT generation/verification
- **debug.js**: Conditional debug logging

### Client Modules

#### `client/src/context/`
- **AuthContext.tsx**: User state, login/logout, auth persistence
- **ThemeContext.tsx**: Dark/light mode state, persistence

#### `client/src/components/ui/`
- **Button.tsx**: Reusable button with variants
- **Card.tsx**: Content container
- **Input.tsx**: Form input with label

#### `client/src/components/`
- **Navbar.tsx**: Navigation bar with auth actions
- **ThemeToggle.tsx**: Theme switcher (moon/sun icons)
- **IngredientInput.tsx**: Autocomplete ingredient selector
- **PantryList.tsx**: Display/manage pantry items
- **RecipeCard.tsx**: Recipe preview with save/unsave
- **RecipeDetail.tsx**: Full recipe view with instructions

#### `client/src/app/`
- **layout.tsx**: Root layout (providers, metadata)
- **page.tsx**: Landing page (hero, CTA)
- **pantry/page.tsx**: Pantry management page
- **recipes/page.tsx**: Recipe search/suggestions
- **recipes/[id]/page.tsx**: Recipe detail page
- **favorites/page.tsx**: Saved recipes page

#### `client/src/lib/`
- **api.ts**: Centralized API client (auth, pantry, recipes)
- **debug.ts**: Conditional client debug logging

#### `client/src/data/`
- **ingredients.ts**: Static list of ~350 common ingredients

---

## 🔧 Configuration

| File | Purpose |
|------|---------|
| `server/package.json` | Server dependencies (Express 5, Mongoose 9, Passport) |
| `client/package.json` | Client dependencies (Next.js 15, React 19, Tailwind) |
| `server/jest.config.js` | Jest config (MongoDB Memory Server) |
| `client/jest.config.js` | Jest config (jsdom, Testing Library) |
| `client/tailwind.config.js` | Tailwind CSS config |
| `client/next.config.js` | Next.js config |
| `.env.example` | Environment variable template |
| `.gitignore` | Git ignore rules |
| `railway.toml` | Railway deployment config |
| `server/Dockerfile` | Server containerization |
| `client/Dockerfile` | Client containerization |

---

## 📚 Documentation

| File | Topic |
|------|-------|
| `README.md` | Setup, features, API reference, testing |
| `design.md` | Architecture, tech stack, design decisions |
| `workflow.md` | TDD methodology, 15-phase implementation plan |
| `CLAUDE.md` | Project instructions for Claude Code |
| `DEPLOYMENT.md` | Railway deployment guide |
| `PROJECT_INDEX.md` | This index (session bootstrapping) |
| `LICENSE` | MIT License |

---

## 🧪 Test Coverage

### Server (`server/__tests__/`)
- **13 test suites, 86 tests** — 100% passing
- **Coverage**: 83% statements, 80% branches, 83% functions, 82% lines
- Test categories:
  - Config: Database connection, Passport strategy
  - Models: User, Pantry, SavedRecipe validation & uniqueness
  - Utils: JWT generation/verification
  - Middleware: Auth middleware (JWT verification)
  - Routes: Auth (OAuth, /me, logout), Pantry (CRUD), Recipes (suggest, detail, saved)
  - App: Server integration, health check

### Client (`client/src/__tests__/`)
- **18 test suites, 193 tests** — 100% passing
- **Coverage**: 94% statements, 95% lines, 87% functions, 94% branches
- Test categories:
  - Context: AuthContext (login, logout, persistence), ThemeContext (toggle, persistence)
  - UI Components: Button, Card, Input (variants, states)
  - Feature Components: Navbar, ThemeToggle, IngredientInput, PantryList, RecipeCard, RecipeDetail
  - Pages: Home, Pantry, Recipes, Recipe Detail, Favorites
  - Lib: API client (auth, pantry, recipes endpoints)

### Total: **31 test suites, 279 tests**

---

## 🔗 Key Dependencies

### Server
- **express**: ^5.2.1 — Web framework
- **mongoose**: ^9.1.6 — MongoDB ODM
- **passport**: ^0.7.0 — Auth framework
- **passport-google-oauth20**: ^2.0.0 — Google OAuth strategy
- **jsonwebtoken**: ^9.0.3 — JWT generation/verification
- **cors**: ^2.8.6 — CORS middleware
- **helmet**: ^8.1.0 — Security headers
- **express-rate-limit**: ^8.2.1 — Rate limiting
- **dotenv**: ^17.2.4 — Environment variables
- **jest**: ^30.2.0 — Testing framework
- **supertest**: ^7.2.2 — HTTP testing
- **mongodb-memory-server**: ^11.0.1 — In-memory MongoDB for tests

### Client
- **next**: 15.5.12 — React framework
- **react**: ^19 — UI library
- **react-dom**: ^19 — React DOM renderer
- **framer-motion**: ^12.33.0 — Animation library
- **lucide-react**: ^0.563.0 — Icon library
- **tailwindcss**: ^3.4.1 — Utility-first CSS
- **jest**: ^30.2.0 — Testing framework
- **@testing-library/react**: ^16.3.2 — React testing utilities
- **@testing-library/jest-dom**: ^6.9.1 — DOM matchers
- **typescript**: ^5 — Type checking

---

## 📝 Quick Start

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with actual credentials:
# - MONGODB_URI
# - JWT_SECRET
# - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
# - SPOONACULAR_API_KEY
# - OPENROUTER_API_KEY
# - NEXT_PUBLIC_API_URL
```

### 2. Server
```bash
cd server
npm install
npm run dev          # Port 5000
npm test             # Run 86 tests
```

### 3. Client
```bash
cd client
npm install
npm run dev          # Port 3000
npm test             # Run 193 tests
```

---

## 🎯 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/auth/google` | No | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | No | OAuth callback |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout (clear cookie) |
| GET | `/api/pantry` | Yes | Get pantry items |
| PUT | `/api/pantry` | Yes | Update pantry items |
| GET | `/api/recipes/suggest?ingredients=...` | Yes | Get recipe suggestions |
| GET | `/api/recipes/:id` | Yes | Get recipe details |
| GET | `/api/recipes/saved` | Yes | Get saved recipes |
| POST | `/api/recipes/saved` | Yes | Save a recipe |
| DELETE | `/api/recipes/saved/:id` | Yes | Remove saved recipe |

---

## 🚀 Deployment

Both server and client are containerized (Dockerfiles in respective dirs).

**Railway Quick Deploy**:
1. Create Railway project
2. Add MongoDB plugin
3. Add two services (server/ and client/)
4. Set environment variables
5. Update Google OAuth callback URL

See `DEPLOYMENT.md` for detailed instructions.

---

## 🔐 Security Features

- JWT tokens in httpOnly cookies (XSS protection)
- Helmet security headers
- CORS configured
- Rate limiting on API
- MongoDB NoSQL injection prevention (custom sanitizer)
- Input validation on models
- Passwords never stored (OAuth only)

---

## 🎨 Design Patterns

- **TDD**: All features test-driven (279 tests)
- **Monorepo**: Separate server/client with shared conventions
- **Context API**: Auth & theme state management
- **Service Layer**: External API clients (Spoonacular, OpenRouter)
- **Middleware Pattern**: Auth, error handling
- **Component Composition**: Reusable UI components
- **CSS Variables**: Theme switching without JS
- **App Router**: Next.js 15 file-based routing

---

## 📊 Project Metrics

- **Total Lines of Code**: ~6,500 (excluding node_modules, tests)
- **Test Coverage**: 279 tests (86 server + 193 client)
- **Server Coverage**: 83% statements
- **Client Coverage**: 94% statements
- **Tech Debt**: Low (Phase 14-15 remaining)
- **Documentation**: Complete (design.md, workflow.md, README.md)

---

## 🛠️ Development Workflow

Project follows **TDD methodology** with 15 phases:

**Completed** (Phases 0-13):
- ✅ Scaffolding & test infrastructure
- ✅ Database models (User, Pantry, SavedRecipe)
- ✅ Auth middleware & JWT
- ✅ Auth routes (Google OAuth)
- ✅ Pantry routes
- ✅ External service clients
- ✅ Recipe routes
- ✅ Server integration
- ✅ Theme system
- ✅ Auth system (client)
- ✅ UI components
- ✅ Pantry feature (client)
- ✅ Recipe feature (client)
- ✅ Landing page & layout

**Remaining**:
- ⏳ Phase 14: Integration testing
- ⏳ Phase 15: Polish & deployment

See `workflow.md` for detailed phase breakdown.

---

## 🐛 Known Issues & Patterns

### Test Patterns
- MongoDB unique index tests need `await Model.ensureIndexes()` before duplicate test
- Mongoose connection timeout test needs `serverSelectionTimeoutMS: 1000` option
- Client tests mock `framer-motion` with passthrough divs/buttons
- Client tests mock `next/navigation` (useRouter, useSearchParams, useParams)
- jsdom doesn't support `window.location.href` assignment — can't test login redirect
- `type="password"` inputs don't have role `textbox` — use `container.querySelector` instead
- React 19 hoists `<html>`/`<body>` to document level — use `document.body` not `container.querySelector('body')`

### Express 5 Compatibility
- `express-mongo-sanitize` and `hpp` INCOMPATIBLE with Express 5 (req.query is read-only)
- Solution: Custom body sanitizer for NoSQL injection prevention

### Git Hooks
- Pre-commit hook blocks commands containing `.env` — stage `.env.example` separately

---

## 📖 Memory Patterns (from MEMORY.md)

- Run server tests: `cd server && npx jest`
- Run client tests: `cd client && npx jest`
- Remote URL switched from SSH to HTTPS (SSH key issue)
- Jest config: `setupFilesAfterSetup` is NOT a valid key — removed it

---

## 🎯 Use Cases

1. **New Session Setup**: Read this file to understand project structure
2. **Feature Development**: See workflow.md for TDD methodology
3. **Testing**: See test coverage section for patterns
4. **Deployment**: See DEPLOYMENT.md for Railway instructions
5. **Architecture**: See design.md for design decisions

---

**Token Efficiency**: This index is ~3KB, replacing ~58KB full codebase read (94% reduction).

**ROI**: Break-even after 1 session; 100-session savings: 5,500,000 tokens.
