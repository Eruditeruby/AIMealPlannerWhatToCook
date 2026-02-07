# AI Meal Planner - Project Status

## Completion
- Server backend: COMPLETE (Phases 0-7, 83 tests, 13 suites, 83% coverage)
- Client frontend: COMPLETE (Phases 8-13, 181 tests, 18 suites, 94% coverage)
- Total: 264 tests, 31 suites — all passing
- Remaining: Phase 14 (integration testing), Phase 15 (polish & deployment)

## Tech Stack
- Server: Express 5 + Mongoose 9 + Passport + JWT + Jest 30
- Client: Next.js 14 (App Router, TypeScript) + Tailwind + Framer Motion
- DB: MongoDB, AI: OpenRouter free, Recipes: Spoonacular free tier

## Commands
- Server tests: `cd server && npx jest`
- Client tests: `cd client && npx jest`
- Server dev: `cd server && npm run dev`
- Client dev: `cd client && npm run dev`

## Key Patterns & Gotchas
- Git hook blocks commands containing `.env` — stage `.env.example` separately
- MongoDB unique index tests need `await Model.ensureIndexes()` before duplicate test
- Mongoose connection timeout test needs `serverSelectionTimeoutMS: 1000`
- Jest config: `setupFilesAfterSetup` is NOT valid — use `setupFilesAfterSetup` removed
- Client tests mock framer-motion with passthrough divs/buttons
- Client tests mock next/navigation (useRouter, useSearchParams, useParams)
- jsdom doesn't support `window.location.href` assignment
- `type="password"` inputs don't have role `textbox` — use container.querySelector
- Remote URL switched from SSH to HTTPS (SSH key issue)

## Architecture
- Pantry tracks item names only (no quantities)
- Recipe flow: Spoonacular first → OpenRouter AI fallback if < 3 results
- Dark/light mode via CSS variables + `data-theme` attribute
- State management: React Context (sufficient for MVP)
