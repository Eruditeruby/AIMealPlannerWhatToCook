# AI Meal Planner ("What To Cook") — System Design

## Vision

Help busy families cook what they already have — saving money, reducing the $2,000/year the average household wastes in food, and ending the nightly "what's for dinner?" stress. Powered by AI recipe suggestions that prioritize your existing pantry ingredients.

## Target Users

- **Budget-conscious parents (30-49)** — families of 2-4 who want to reduce grocery waste, save money, and solve dinner quickly

## MVP Scope (Lean)

Ingredient input → AI recipe suggestions, with Google auth and persistent pantry. Positioned around food waste reduction and family savings.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                         │
│              Next.js 14 (App Router)             │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Auth Page │ │  Pantry  │ │ Recipe Results  │  │
│  │ (Google)  │ │  Manager │ │ & Detail View   │  │
│  └───────────┘ └──────────┘ └────────────────┘  │
│  ┌──────────────────────────────────────────┐    │
│  │ Theme Provider (dark/light) + Framer Motion│   │
│  └──────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────────┐
│                   SERVER                         │
│            Node.js + Express API                 │
│  ┌──────────┐ ┌───────────┐ ┌───────────────┐   │
│  │ Auth     │ │  Pantry   │ │  Recipe       │   │
│  │ Routes   │ │  Routes   │ │  Routes       │   │
│  └────┬─────┘ └─────┬─────┘ └──┬────────┬──┘   │
│       │             │           │        │       │
│  ┌────▼─────┐ ┌─────▼─────┐ ┌──▼────┐ ┌─▼────┐ │
│  │ Passport │ │  Pantry   │ │Spoona-│ │Open- │ │
│  │ Google   │ │  Service  │ │cular  │ │Router│ │
│  │ OAuth    │ │           │ │Client │ │Client│ │
│  └──────────┘ └───────────┘ └───────┘ └──────┘ │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│               MongoDB                            │
│  ┌──────┐ ┌────────┐ ┌──────────────────┐       │
│  │Users │ │Pantries│ │SavedRecipes│ │CookingLogs│  │
│  └──────┘ └────────┘ └────────────┘ └───────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Project Structure

```
AIMealPlannerWhatToCook/
├── client/                    # Next.js 14 (App Router)
│   ├── app/
│   │   ├── layout.js          # Root layout + ThemeProvider
│   │   ├── page.js            # Landing/home
│   │   ├── auth/
│   │   │   └── page.js        # Login with Google
│   │   ├── pantry/
│   │   │   └── page.js        # Pantry management
│   │   ├── recipes/
│   │   │   ├── page.js        # Recipe suggestions
│   │   │   └── [id]/page.js   # Recipe detail
│   │   └── favorites/
│   │       └── page.js        # Saved recipes
│   ├── components/
│   │   ├── ui/                # Reusable UI (Button, Card, Input, Modal)
│   │   ├── Navbar.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── PantryList.jsx
│   │   ├── IngredientInput.jsx
│   │   ├── RecipeCard.jsx
│   │   └── RecipeDetail.jsx
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── lib/
│   │   └── api.js             # API client (fetch wrapper)
│   └── styles/
│       └── globals.css        # Tailwind + CSS variables for theming
│
├── server/                    # Express API
│   ├── index.js               # Entry point
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── passport.js        # Google OAuth config
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── models/
│   │   ├── User.js
│   │   ├── Pantry.js
│   │   ├── SavedRecipe.js
│   │   └── CookingLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── pantry.js
│   │   ├── recipes.js
│   │   └── cooking.js
│   ├── data/
│   │   └── ingredientMeta.js
│   └── services/
│       ├── spoonacular.js     # Spoonacular API client
│       └── openrouter.js      # OpenRouter AI client
│
├── .env.example
├── .gitignore
├── design.md
└── README.md
```

---

## Database Schemas

### Users

```js
{
  _id: ObjectId,
  googleId: String,          // Google OAuth ID
  email: String,
  name: String,
  avatar: String,            // Google profile picture
  preferences: {             // future-ready
    dietaryRestrictions: [String],  // e.g. ["vegetarian", "nut-free"]
    familySize: Number
  },
  createdAt: Date
}
```

### Pantries

```js
{
  _id: ObjectId,
  userId: ObjectId,          // ref → Users
  items: [String],           // ["chicken", "rice", "garlic", ...]
  createdAt: Date,
  updatedAt: Date
}
```

### SavedRecipes

```js
{
  _id: ObjectId,
  userId: ObjectId,          // ref → Users
  title: String,
  image: String,
  source: "spoonacular" | "ai",
  sourceId: String,          // Spoonacular ID or null
  instructions: String,
  ingredients: [String],
  cookTime: Number,          // minutes
  servings: Number,
  tags: [String],            // ["kid-friendly", "quick", ...]
  nutrition: {               // basic info
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  savedAt: Date
}
```

---

## API Endpoints

| Method   | Endpoint                              | Description              | Auth Required |
|----------|---------------------------------------|--------------------------|---------------|
| `GET`    | `/api/auth/google`                    | Initiate Google OAuth    | No            |
| `GET`    | `/api/auth/google/callback`           | OAuth callback → JWT     | No            |
| `GET`    | `/api/auth/me`                        | Get current user         | Yes           |
| `GET`    | `/api/pantry`                         | Get user's pantry        | Yes           |
| `PUT`    | `/api/pantry`                         | Update pantry items      | Yes           |
| `GET`    | `/api/recipes/suggest?ingredients=...`| Get recipe suggestions   | Yes           |
| `GET`    | `/api/recipes/:id`                    | Get recipe detail        | Yes           |
| `GET`    | `/api/recipes/saved`                  | Get saved recipes        | Yes           |
| `POST`   | `/api/recipes/saved`                  | Save a recipe            | Yes           |
| `DELETE` | `/api/recipes/saved/:id`              | Remove saved recipe      | Yes           |

---

## Recipe Suggestion Flow

```
User clicks "What Can I Cook?"
        │
        ▼
GET /api/recipes/suggest?ingredients=chicken,rice,garlic
        │
        ▼
┌─ Step 1: Query Spoonacular ──────────────────┐
│  findByIngredients(chicken, rice, garlic)     │
│  → Returns matched recipes (if any)           │
└──────────┬───────────────────────────────────┘
           │
     Has results?
      ╱         ╲
    Yes          No/Few
     │            │
     │     ┌──────▼─────────────────────────────┐
     │     │ Step 2: OpenRouter AI Fallback      │
     │     │ Prompt: "Suggest family-friendly     │
     │     │ recipes using: chicken, rice, garlic"│
     │     └──────┬─────────────────────────────┘
     │            │
     ▼            ▼
  Merge & return combined results
```

---

## Authentication Flow

```
Client                    Server                  Google
  │  Click "Sign in"        │                       │
  │──GET /auth/google──────▶│                       │
  │                         │──OAuth redirect──────▶│
  │                         │                       │
  │                         │◀──Profile + token─────│
  │                         │                       │
  │                         │ Create/find user       │
  │                         │ Generate JWT           │
  │◀─Redirect + JWT cookie──│                       │
  │                         │                       │
  │──GET /auth/me (JWT)────▶│                       │
  │◀─User profile───────────│                       │
```

---

## UI / Theme Design

| Aspect         | Decision                                                        |
|----------------|-----------------------------------------------------------------|
| CSS Framework  | Tailwind CSS                                                    |
| Theming        | CSS variables toggled via `ThemeContext` + `data-theme` attribute|
| Animations     | Framer Motion (page transitions, card hover, list add/remove)   |
| Icons          | Lucide React (lightweight, consistent)                          |
| Layout         | Single-column mobile, 2-3 column grid on desktop                |
| Typography     | Inter (clean, minimalist)                                       |

### Color Tokens

```
Light Mode:
  background:  #FAFAFA
  surface:     #FFFFFF
  text:        #1A1A1A
  accent:      #10B981 (green)

Dark Mode:
  background:  #0F0F0F
  surface:     #1A1A1A
  text:        #F5F5F5
  accent:      #34D399 (green)
```

---

## Key Technical Decisions

| Decision       | Choice                          | Reason                          |
|----------------|---------------------------------|---------------------------------|
| Auth           | Passport.js + JWT (httpOnly)    | Secure, stateless               |
| State mgmt    | React Context                   | Simple enough for MVP           |
| API client     | Native fetch wrapper            | No extra dependencies           |
| AI fallback    | OpenRouter free models          | Cost-free, flexible             |
| Primary recipes| Spoonacular free tier           | 150 req/day, rich data          |
| Animations     | Framer Motion                   | Best React animation library    |
| Styling        | Tailwind CSS                    | Fast, utility-first, easy theme |

---

## Functional Requirements

| #  | Requirement                                          | Priority |
|----|------------------------------------------------------|----------|
| F1 | Google OAuth login/signup                             | Must     |
| F2 | Manual ingredient input (search/type)                 | Must     |
| F3 | Persistent pantry list (add/remove items by name)     | Must     |
| F4 | AI-powered recipe suggestions based on pantry contents| Must     |
| F5 | Recipe detail view (instructions, cook time, servings)| Must     |
| F6 | Save/favorite recipes                                 | Should   |
| F7 | Basic nutritional info per recipe                     | Should   |
| F8 | Family-friendly recipe filtering (kid-friendly tag)   | Should   |

## Non-Functional Requirements

| #   | Requirement                                    |
|-----|------------------------------------------------|
| NF1 | Next.js 14 frontend + Node.js/Express API      |
| NF2 | MongoDB for data persistence                   |
| NF3 | OpenRouter (free models) for AI generation      |
| NF4 | Spoonacular free tier as primary recipe source  |
| NF5 | Google OAuth via Passport.js                    |
| NF6 | Self-hosted deployment                          |
| NF7 | Mobile-responsive, minimalist design            |
| NF8 | Dark/light mode with smooth transitions         |
| NF9 | Recipe responses under 5 seconds                |

---

## Future Phases (Post-MVP)

- Weekly meal planning with calendar view
- Grocery list generation from meal plans
- Expiration date tracking for waste reduction
- Full nutritional/macro analysis
- Receipt scanning for pantry auto-population
- Batch cooking suggestions

---

## Environment Variables

```env
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mealplanner
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Spoonacular
SPOONACULAR_API_KEY=your_spoonacular_api_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key

# Client
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
