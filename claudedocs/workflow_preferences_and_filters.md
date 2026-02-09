# Workflow: Make User Preferences Work & Add Recipe Filters

**Generated**: 2026-02-09
**Strategy**: Systematic
**Depth**: Deep
**Status**: PLANNED — pending approval

---

## Problem Statement

The app collects user preferences during onboarding (dietary restrictions, budget goal, household type) but **none of this data is used anywhere**. A vegetarian user will see meat recipes. There's no way to edit preferences after onboarding, and no way to filter recipes by meal type, cooking time, or cuisine.

This breaks user trust and contradicts the onboarding wizard's own promises:
- "This helps us suggest the right portion sizes" → **lie** (portions not adjusted)
- "We'll prioritize recipes that match your budget" → **lie** (budget ignored)
- "Any dietary needs?" → **lie** (restrictions not filtered)

### What This Workflow Fixes

| Problem | Solution | Phase |
|---------|----------|-------|
| Dietary restrictions ignored in recipes | Pass to Spoonacular `diet` + `intolerances` params | 1 |
| Preferences not used in AI fallback | Include in OpenRouter prompt | 1 |
| No way to edit preferences | Settings page with form | 2 |
| No recipe filters (meal type, time, cuisine) | Filter bar on recipes page | 3 |
| No feedback after "Cooked!" button | Toast notification with savings | 4 |
| No cooking history UI | History page consuming existing API | 4 |

---

## Technical Foundation

### Spoonacular API: `complexSearch` vs `findByIngredients`

**Current**: `findByIngredients` — only accepts `ingredients`, `number`, `ranking`. No filtering.

**Target**: `complexSearch` — accepts ALL of the following:

| Parameter | Type | Maps From |
|-----------|------|-----------|
| `includeIngredients` | string | Pantry items (same as today) |
| `diet` | string | User's dietaryRestrictions (vegetarian, vegan) |
| `intolerances` | string | User's dietaryRestrictions (gluten, dairy, tree nut) |
| `cuisine` | string | User-selected filter |
| `type` | string | User-selected filter (main course, breakfast, etc.) |
| `maxReadyTime` | number | User-selected filter (minutes) |
| `number` | number | 10 (same as today) |
| `addRecipeInformation` | boolean | `true` — returns full details in ONE call |
| `fillIngredients` | boolean | `true` — includes used/missed ingredients |

**Key benefit**: `addRecipeInformation=true` returns cookTime, servings, nutrition, instructions — **all in one API call** instead of the current 1+N calls. This actually **saves API quota**.

### Dietary Restriction Mapping (Critical)

Spoonacular separates `diet` (lifestyle) from `intolerances` (allergies):

| Our Value | Spoonacular Param | Spoonacular Value |
|-----------|-------------------|-------------------|
| `vegetarian` | `diet` | `vegetarian` |
| `vegan` | `diet` | `vegan` |
| `gluten-free` | `intolerances` | `gluten` |
| `dairy-free` | `intolerances` | `dairy` |
| `nut-free` | `intolerances` | `tree nut` |

If user has both `vegetarian` and `gluten-free`: `diet=vegetarian&intolerances=gluten`

---

## Phase 1: Preferences-Aware Recipe Engine (Backend)

> *Make the data we already collect actually DO something.*

### Task 1.1: Add `searchRecipes()` to Spoonacular Service

**File**: `server/services/spoonacular.js`

Add new function alongside existing `findByIngredients` (don't remove it — `getRecipeDetails` still needed for `/recipes/:id`):

```js
async function searchRecipes(ingredients, options = {}) {
  // options: { diet, intolerances, cuisine, type, maxReadyTime }
  const params = new URLSearchParams({
    includeIngredients: ingredients.join(','),
    number: '10',
    addRecipeInformation: 'true',
    fillIngredients: 'true',
    sort: 'max-used-ingredients',
    apiKey: process.env.SPOONACULAR_API_KEY,
  });

  if (options.diet) params.set('diet', options.diet);
  if (options.intolerances) params.set('intolerances', options.intolerances);
  if (options.cuisine) params.set('cuisine', options.cuisine);
  if (options.type) params.set('type', options.type);
  if (options.maxReadyTime) params.set('maxReadyTime', String(options.maxReadyTime));

  // Cache key includes all params
  const cacheKey = `search:${params.toString()}`;
  // ... fetch, normalize response to match existing RecipeCard format
}
```

**Response normalization** (complexSearch → our format):
```js
// Spoonacular complexSearch result item:
{ id, title, image, readyInMinutes, servings, usedIngredients, missedIngredients, ... }

// Our normalized format (matches what RecipeCard expects):
{
  id: result.id,
  title: result.title,
  image: result.image,
  source: 'spoonacular',
  sourceId: String(result.id),
  cookTime: result.readyInMinutes,
  servings: result.servings,
  usedIngredients: result.usedIngredients?.map(i => i.name) || [],
  missedIngredients: result.missedIngredients?.map(i => i.name) || [],
  nutrition: result.nutrition ? {
    calories: result.nutrition.nutrients?.find(n => n.name === 'Calories')?.amount,
    protein: result.nutrition.nutrients?.find(n => n.name === 'Protein')?.amount,
    carbs: result.nutrition.nutrients?.find(n => n.name === 'Carbohydrates')?.amount,
    fat: result.nutrition.nutrients?.find(n => n.name === 'Fat')?.amount,
  } : null,
}
```

### Task 1.2: Add Dietary Restriction Mapper Utility

**New file**: `server/utils/dietaryMapper.js`

```js
// Maps our dietaryRestrictions array → Spoonacular diet + intolerances params
function mapDietaryRestrictions(restrictions = []) {
  const DIET_MAP = { vegetarian: 'vegetarian', vegan: 'vegan' };
  const INTOLERANCE_MAP = {
    'gluten-free': 'gluten',
    'dairy-free': 'dairy',
    'nut-free': 'tree nut',
  };

  const diets = restrictions.filter(r => DIET_MAP[r]).map(r => DIET_MAP[r]);
  const intolerances = restrictions.filter(r => INTOLERANCE_MAP[r]).map(r => INTOLERANCE_MAP[r]);

  return {
    diet: diets.join(',') || undefined,           // Spoonacular accepts comma-separated
    intolerances: intolerances.join(',') || undefined,
  };
}
```

### Task 1.3: Update Recipe Route to Use Preferences + Filters

**File**: `server/routes/recipes.js`

Modify `GET /api/recipes/suggest`:

```
Current:  GET /suggest?ingredients=chicken,rice
Target:   GET /suggest?ingredients=chicken,rice&mealType=dinner&maxTime=30&cuisine=italian
```

Changes:
1. Load user with `req.user` → get `preferences.dietaryRestrictions`
2. Read optional query params: `mealType`, `maxTime`, `cuisine`
3. Map dietary restrictions using `dietaryMapper`
4. Call `searchRecipes()` with combined params
5. Fallback to `findByIngredients()` if `searchRecipes()` fails
6. Keep perishable-first sorting logic

### Task 1.4: Update OpenRouter Prompt with Preferences

**File**: `server/services/openrouter.js`

Modify `suggestRecipes()` to accept preferences:

```
Current: suggestRecipes(ingredients)
Target:  suggestRecipes(ingredients, preferences = {})
```

Prompt changes:
```
Current: "Focus on simple, kid-friendly, family-friendly meals."
Target:  "Focus on simple, family-friendly meals.
         Dietary requirements: [vegetarian, gluten-free] (STRICT — never violate these).
         Household: [family-small] — suggest portions for 3-4 people.
         Budget: [low] — prioritize affordable ingredients."
```

Only include lines where user has set preferences. If no restrictions, omit dietary line.

### Task 1.5: Tests for Phase 1

| Test File | New Tests |
|-----------|-----------|
| `spoonacular.test.js` | `searchRecipes` with no filters, with diet, with intolerances, with all filters, cache key includes params |
| `utils/dietaryMapper.test.js` (new) | Maps vegetarian→diet, gluten-free→intolerance, combo, empty array |
| `recipes.test.js` | Route reads user preferences, passes to service; accepts mealType/maxTime/cuisine params |
| `openrouter.test.js` | Prompt includes dietary restrictions when present, omits when empty |

**Checkpoint 1**: Recipes now respect dietary restrictions. Vegetarians see vegetarian recipes. Existing behavior preserved when no preferences set.

---

## Phase 2: Settings Page (Frontend)

> *Let users edit what they told us during onboarding.*

### Task 2.1: Create Settings Page

**New file**: `client/src/app/settings/page.tsx`

Layout:
```
┌──────────────────────────────────┐
│ ⚙ My Preferences                │
│                                  │
│ Household Type                   │
│ [Single] [Couple] [Family] [5+] │
│                                  │
│ Grocery Budget                   │
│ [Budget] [Moderate] [No limit]   │
│                                  │
│ Dietary Needs                    │
│ [✓ Vegetarian] [  Vegan]        │
│ [✓ Gluten-free] [  Dairy-free]  │
│ [  Nut-free]                     │
│                                  │
│        [ Save Changes ]          │
│                                  │
│ ✓ Saved successfully            │
└──────────────────────────────────┘
```

- Pre-populate from `user.preferences` via AuthContext
- Same option values as OnboardingWizard (reuse constants)
- Save calls `PUT /api/auth/preferences`
- Success message on save (inline, not a separate toast system)
- Call `refreshUser()` after save so navbar/other components see updated data
- Auth guard: redirect to `/` if not authenticated

### Task 2.2: Add Settings Link to Navbar

**File**: `client/src/components/Navbar.tsx`

Add to `navLinks` array (auth-only):
```js
{ href: '/settings', label: 'Settings' }
```

Place after "Favorites" in the nav. Use `Settings` icon from Lucide.

### Task 2.3: Extract Shared Preference Options

**New file**: `client/src/data/preferenceOptions.ts`

Extract the step options from OnboardingWizard into a shared constant file so both OnboardingWizard and Settings page use the same options. This prevents drift.

```ts
export const HOUSEHOLD_OPTIONS = [
  { value: 'single', label: 'Just me', emoji: '🧑' },
  { value: 'couple', label: 'Two of us', emoji: '👫' },
  { value: 'family-small', label: 'Family (3-4)', emoji: '👨‍👩‍👧' },
  { value: 'family-large', label: 'Family (5+)', emoji: '👨‍👩‍👧‍👦' },
];
// ... same for BUDGET_OPTIONS, DIETARY_OPTIONS
```

Update OnboardingWizard to import from this file instead of inline constants.

### Task 2.4: Tests for Phase 2

| Test File | New Tests |
|-----------|-----------|
| `app/settings/page.test.tsx` (new) | Renders form, pre-fills from user preferences, submits PUT request, shows success, redirects when unauthenticated |
| `components/Navbar.test.tsx` | Settings link visible when authenticated, not visible when logged out |

**Checkpoint 2**: Users can view and edit all preferences from a dedicated Settings page.

---

## Phase 3: Recipe Filters (Frontend + Backend Wiring)

> *Let users control what kind of recipes they see.*

### Task 3.1: Create RecipeFilters Component

**New file**: `client/src/components/RecipeFilters.tsx`

Compact horizontal filter bar:
```
┌──────────────────────────────────────────────────┐
│ Meal: [Any ▾]  Time: [Any ▾]  Cuisine: [Any ▾]  │
└──────────────────────────────────────────────────┘
```

Props:
```ts
interface RecipeFiltersProps {
  filters: { mealType: string; maxTime: string; cuisine: string };
  onChange: (filters: RecipeFiltersProps['filters']) => void;
}
```

Options:
- **Meal Type**: Any, Breakfast, Lunch, Dinner, Snack, Dessert
- **Max Time**: Any, 15 min, 30 min, 60 min
- **Cuisine**: Any, Italian, Mexican, Asian, American, Mediterranean, Indian

Use `<select>` elements — simple, accessible, no extra dependencies.

### Task 3.2: Integrate Filters into Recipes Page

**File**: `client/src/app/recipes/page.tsx`

Changes:
1. Add `filters` state with defaults `{ mealType: '', maxTime: '', cuisine: '' }`
2. Render `<RecipeFilters>` above recipe grid
3. When filters change, re-fetch recipes with filter params:
   ```
   /recipes/suggest?ingredients=chicken,rice&mealType=dinner&maxTime=30&cuisine=italian
   ```
4. Store last-used filters in `localStorage` for persistence across sessions
5. Clear filters button to reset all

### Task 3.3: Tests for Phase 3

| Test File | New Tests |
|-----------|-----------|
| `components/RecipeFilters.test.tsx` (new) | Renders 3 dropdowns, emits onChange with correct values, defaults to "Any" |
| `app/recipes/page.test.tsx` | Filters rendered, API called with filter params when changed |

**Checkpoint 3**: Users can filter recipes by meal type, cooking time, and cuisine. Filters persist across page visits.

---

## Phase 4: UX Polish (Close Partial Stories)

> *Fix the two incomplete user stories from the original workflow.*

### Task 4.1: Celebratory Toast After "Cooked!"

**File**: `client/src/app/recipes/page.tsx`

After successful `api.post('/cooking/log')`:
1. Show a toast notification at bottom of screen:
   ```
   ┌─────────────────────────────────┐
   │ 🎉 Nice! You saved ~$5 cooking  │
   │    [recipe title] at home!      │
   └─────────────────────────────────┘
   ```
2. Auto-dismiss after 3 seconds
3. Framer Motion: slide up + fade in/out
4. Simple inline implementation — no toast library needed

Implementation: Add `toast` state to recipes page. Set on cook success. Render `AnimatePresence` toast at bottom. `setTimeout` to clear.

### Task 4.2: Cooking History Page

**New file**: `client/src/app/history/page.tsx`

Simple list view:
```
┌──────────────────────────────────┐
│ 📖 Cooking History               │
│                                  │
│ Today                            │
│ ├─ Chicken Stir Fry    $5 saved │
│ └─ Pasta Primavera     $5 saved │
│                                  │
│ Yesterday                        │
│ └─ Bean Tacos          $5 saved │
│                                  │
│ Empty state: "No cooking history │
│ yet. Cook a recipe to start      │
│ tracking!"                       │
└──────────────────────────────────┘
```

- Fetches `GET /api/cooking/history`
- Groups by date
- Shows recipe title + savings amount
- Auth guard
- Add "History" link to Navbar (after Settings)

### Task 4.3: Tests for Phase 4

| Test File | New Tests |
|-----------|-----------|
| `app/recipes/page.test.tsx` | Toast appears after cook, shows recipe title and savings, auto-dismisses |
| `app/history/page.test.tsx` (new) | Renders history list, groups by date, handles empty state, auth redirect |
| `components/Navbar.test.tsx` | History link visible when authenticated |

**Checkpoint 4**: "Cooked!" gives celebratory feedback. Cooking history is browsable.

---

## Dependency Map

```
Phase 1 (Backend: Preferences → Recipes)  ← No dependencies
    │
Phase 2 (Settings Page)                   ← Can start in PARALLEL with Phase 1
    │
Phase 3 (Recipe Filters)                  ← DEPENDS on Phase 1 (backend must accept filter params)
    │
Phase 4 (UX Polish)                       ← No dependencies, can start ANYTIME
```

**Parallelizable**: Phase 1 + Phase 2 + Phase 4
**Sequential**: Phase 1 → Phase 3

---

## Files Changed / Created

| Phase | New Files | Modified Files |
|-------|-----------|----------------|
| 1 | `server/utils/dietaryMapper.js`, `server/__tests__/utils/dietaryMapper.test.js` | `server/services/spoonacular.js`, `server/services/openrouter.js`, `server/routes/recipes.js`, + their test files |
| 2 | `client/src/app/settings/page.tsx`, `client/src/data/preferenceOptions.ts`, `client/src/__tests__/app/settings/page.test.tsx` | `client/src/components/Navbar.tsx`, `client/src/components/OnboardingWizard.tsx`, + their test files |
| 3 | `client/src/components/RecipeFilters.tsx`, `client/src/__tests__/components/RecipeFilters.test.tsx` | `client/src/app/recipes/page.tsx`, + its test file |
| 4 | `client/src/app/history/page.tsx`, `client/src/__tests__/app/history/page.test.tsx` | `client/src/app/recipes/page.tsx`, `client/src/components/Navbar.tsx`, + their test files |

**Total**: ~8 new files, ~10 modified files, ~40-50 new tests

---

## Effort Estimate

| Phase | Tasks | Complexity | Est. New Tests |
|-------|-------|------------|----------------|
| 1 — Backend Engine | 5 | Medium-High | ~20 |
| 2 — Settings Page | 4 | Medium | ~10 |
| 3 — Recipe Filters | 3 | Medium | ~8 |
| 4 — UX Polish | 3 | Low | ~8 |
| **Total** | **15** | | **~46** |

---

## Risk Register

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `complexSearch` has different response format than `findByIngredients` | Medium | Normalize to existing shape; keep `findByIngredients` for `/recipes/:id` |
| Spoonacular free tier only allows certain `diet` values | Low | Only map values we know Spoonacular accepts; test with actual API |
| Existing 382 tests break from service changes | Medium | Phase 1 updates mocks carefully; run full suite after each task |
| Cache keys now need filter params | Low | Include all params in cache key string |
| OnboardingWizard refactor (extracting options) breaks existing tests | Low | Extract constants first, verify tests pass, then use in Settings |
| `complexSearch` returns fewer results than `findByIngredients` when diet is strict (e.g., vegan + limited pantry) | Medium | Fall back to `findByIngredients` if complexSearch returns 0; show "try relaxing filters" message |

---

## Success Metrics

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Dietary restrictions filter recipes | Vegetarian user sees NO meat recipes | Manual test with vegetarian preference |
| Preferences editable post-onboarding | User can change diet on Settings page and see different recipes | Manual test |
| Recipe filters work | Selecting "Breakfast" shows breakfast recipes | Manual test |
| All existing tests pass | 382+ tests green | `cd server && npx jest && cd ../client && npx jest` |
| New tests added | ~46 new tests, total ~428+ | Test count after implementation |
| No API quota regression | Same or fewer Spoonacular calls per user session | `complexSearch` with `addRecipeInformation=true` = fewer calls |

---

## What This Workflow Does NOT Include

| Out of Scope | Reason |
|-------------|--------|
| Recipe keyword search | Contradicts "cook what you HAVE" positioning |
| Browse without pantry | Same as above |
| familySize / cookingSkill collection in wizard | Don't collect what we won't use; can add later if needed |
| Meal planning / calendar | Entirely new feature, not a gap fix |
| Social sharing features | Phase 5 OG tags already handle this |
| Cost-per-recipe estimates | Would need price data we don't have reliably |
| Manual perishable overrides | Auto-detection covers 358 items; edge cases are rare |

---

## Next Steps

1. **Review and approve** this workflow
2. Execute Phase 1 first (backend) — this is the trust-critical fix
3. Phase 2 (Settings) can start in parallel
4. Phase 3 after Phase 1 is complete
5. Phase 4 anytime (independent)

---

*This document is the implementation plan only. No code has been written or modified.*
