# Workflow: Sharpen Positioning to One Specific Family Segment

**Generated**: 2026-02-09
**Strategy**: Systematic
**Depth**: Deep
**Status**: PLAN ONLY — awaiting approval before implementation

---

## Executive Summary

### Chosen Segment: Budget-Conscious Parents (30-49) Who Hate Wasting Food

**Positioning Statement:**
> "What To Cook helps busy parents cook what they already have — saving money, reducing waste, and ending the nightly 'what's for dinner?' stress."

### Why This Segment?

| Factor | Evidence |
|--------|----------|
| **Market Size** | Meal planning: $2.45B (2025), AI-driven: $972M → $11.5B (28% CAGR) |
| **Food Waste Market** | $1.3B (2025) → $5B (2035), 25.85% CAGR |
| **Demographics** | Parents 30-49 = 40%+ of meal planning revenue by 2028 |
| **Pain Point** | Avg US family wastes $2,000/yr in food; #1 daily question: "what's for dinner?" |
| **Competitive Gap** | PlateJoy discontinued July 2025; no one owns "waste reduction + AI + family" |
| **Technical Fit** | Pantry tracking already built — needs waste/savings framing, not new infrastructure |
| **Narrative Strength** | "Stop throwing away groceries" is a story worth telling (Godin test: PASS) |

### What Changes

| Dimension | Current (Generic) | Target (Sharpened) |
|-----------|-------------------|-------------------|
| **Tagline** | "AI meal planner for families" | "Cook what you have. Save what you'd waste." |
| **Hero message** | "Tell us what's in your kitchen and we'll suggest meals" | "Stop wasting $2,000/year in groceries. We'll show you what to cook tonight." |
| **Core value** | Recipe suggestions | Money saved + waste reduced + dinner solved |
| **Emotional hook** | Convenience | Relief from guilt + financial savings + simplicity |
| **Target user** | "Families" (everyone) | Parents 30-49, 2-4 person household, budget-aware |
| **Key metric** | Recipes served | Dollars saved / food waste prevented |

---

## Implementation Phases

### Phase 1: Messaging & Brand Pivot (LOW effort, HIGH impact)
> *No backend changes. Pure copy + design.*

#### Task 1.1: Rewrite Landing Page Copy
**File**: `client/src/app/page.tsx`

**Current:**
```
"What To Cook?"
"Tell us what's in your kitchen and we'll suggest delicious family-friendly meals."
```

**Target:**
```
"What To Cook?"
"Stop wasting groceries. Tell us what you have — we'll tell you what to cook."

Features:
- "Use What You Have" → Cook meals from ingredients already in your kitchen
- "Save Money" → Track how much you save by reducing food waste
- "Dinner Solved" → End the nightly "what's for dinner?" stress in 10 seconds
```

#### Task 1.2: Update Feature Cards
**File**: `client/src/app/page.tsx`

| Current | Target |
|---------|--------|
| Track Your Pantry / Add ingredients you have | Your Kitchen, Tracked / Know exactly what you have and what needs using |
| AI Recipe Suggestions / Get recipes based on what you have | Dinner in 10 Seconds / AI finds the best meals from your ingredients |
| Save Favorites / Keep your best recipes for later | Never Waste Again / Track savings and build your family recipe book |

#### Task 1.3: Update Meta/SEO
**Files**: `client/src/app/layout.tsx`

- Title: "What To Cook — Save Money by Cooking What You Already Have"
- Description: "AI-powered meal suggestions from your pantry ingredients. Reduce food waste, save money, and end the nightly dinner stress. Free for families."
- Keywords target: "what to cook with ingredients I have", "reduce food waste app", "family meal planner", "budget cooking app"

#### Task 1.4: Update README & Project Docs
**Files**: `README.md`, `design.md`

- Align project description with new positioning
- Update "Vision" section in design.md to reflect waste-reduction narrative

**Checkpoint 1**: Landing page reflects sharpened positioning. No functional changes.

---

### Phase 2: User Preferences & Family Profile (MEDIUM effort, HIGH impact)
> *Backend + frontend. Captures the data needed for personalization.*

#### Task 2.1: Extend User Model — Family Profile
**File**: `server/models/User.js`

Add to `preferences` schema:
```js
preferences: {
  dietaryRestrictions: [String],  // existing
  familySize: Number,             // existing
  // NEW fields:
  budgetGoal: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  cookingSkill: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  householdType: { type: String, enum: ['single', 'couple', 'family-small', 'family-large'], default: 'family-small' },
}
```

#### Task 2.2: Preferences API Endpoint
**File**: `server/routes/auth.js` (or new `server/routes/preferences.js`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/preferences` | Get user preferences |
| PUT | `/api/auth/preferences` | Update user preferences |

#### Task 2.3: Onboarding Flow (Frontend)
**New file**: `client/src/components/OnboardingWizard.tsx`

3-step wizard shown on first login:
1. **Family Size** — "How many people are you cooking for?" (1/2/3-4/5+)
2. **Budget** — "What's your weekly grocery budget?" (Low/$50 / Medium/$100 / High/$150+)
3. **Dietary** — "Any dietary restrictions?" (multi-select: vegetarian, vegan, gluten-free, dairy-free, nut-free, none)

Skip option available. Saves to `/api/auth/preferences`.

#### Task 2.4: Tests for Phase 2
- User model: test new preference fields (validation, defaults)
- Preferences API: GET/PUT with auth, validation errors
- OnboardingWizard: render, step navigation, submit, skip

**Checkpoint 2**: Users can set family profile. Data captured for future personalization.

---

### Phase 3: Pantry Enhancement — Freshness & Urgency (MEDIUM effort, HIGH impact)
> *The key differentiator: "use it before it goes bad"*

#### Task 3.1: Extend Pantry Model — Item Metadata
**File**: `server/models/Pantry.js`

Change `items` from `[String]` to:
```js
items: [{
  name: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
  category: { type: String, enum: ['vegetable', 'fruit', 'protein', 'dairy', 'grain', 'pantry-staple', 'other'] },
  perishable: { type: Boolean, default: false },
}]
```

#### Task 3.2: Ingredient Category & Perishability Mapping
**File**: `client/src/data/ingredients.ts` (extend) + new `server/data/ingredientMeta.js`

Static mapping of ~350 ingredients to:
- Category (vegetable, fruit, protein, dairy, grain, pantry-staple)
- Perishable flag (true/false)
- Typical shelf life in days (for "use soon" indicators)

Example:
```js
{ name: 'chicken breast', category: 'protein', perishable: true, shelfLifeDays: 3 }
{ name: 'rice', category: 'grain', perishable: false, shelfLifeDays: 365 }
```

#### Task 3.3: "Use Soon" Indicators (Frontend)
**File**: `client/src/components/PantryList.tsx`

- Items added 2+ days ago that are perishable → amber "Use soon" badge
- Items added 4+ days ago that are perishable → red "Use today!" badge
- Sort pantry: perishable/urgent items first by default

#### Task 3.4: "Prioritize Expiring" in Recipe Suggestions
**File**: `server/routes/recipes.js` + `server/services/spoonacular.js`

When requesting recipes, weight perishable items that were added earliest.
- Send perishable items first in the ingredients list to Spoonacular
- In OpenRouter prompt, add: "Prioritize using these perishable ingredients: [list]"

#### Task 3.5: Tests for Phase 3
- Pantry model: item metadata, addedAt auto-set, category validation
- Ingredient metadata: mapping coverage, perishability accuracy
- PantryList: "use soon" badges render correctly for age thresholds
- Recipe route: perishable items prioritized in API calls

**Checkpoint 3**: Pantry shows freshness urgency. Recipes prioritize expiring items.

---

### Phase 4: Savings Tracker — The Money Narrative (MEDIUM effort, HIGH impact)
> *Make the value visible. "You saved $X this month."*

#### Task 4.1: CookingLog Model (New)
**New file**: `server/models/CookingLog.js`

```js
{
  userId: ObjectId,
  recipeTitle: String,
  ingredientsUsed: [String],
  estimatedSavings: Number,     // calculated from avg ingredient cost
  cookedAt: { type: Date, default: Date.now },
}
```

#### Task 4.2: Cooking Log API
**New file or extend**: `server/routes/recipes.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recipes/cooked` | Log a cooked recipe |
| GET | `/api/recipes/history` | Get cooking history with savings |
| GET | `/api/recipes/savings` | Get savings summary (weekly/monthly/total) |

#### Task 4.3: "I Cooked This!" Button
**File**: `client/src/components/RecipeDetail.tsx` (or RecipeCard)

After viewing a recipe, user can tap "I Cooked This!" which:
- Logs the recipe + ingredients used
- Calculates estimated savings (basic: $3-8 per meal vs. eating out/takeout)
- Shows a celebratory animation + running savings total

#### Task 4.4: Savings Dashboard Widget
**New file**: `client/src/components/SavingsDashboard.tsx`

Simple widget on pantry page or separate `/savings` page:
- "This week: $XX saved"
- "This month: $XX saved"
- "Total: $XX saved by cooking at home"
- Meals cooked counter
- Simple bar chart (last 4 weeks)

#### Task 4.5: Tests for Phase 4
- CookingLog model: creation, validation, userId required
- Cooked API: POST logs correctly, GET returns history, savings calculation
- "I Cooked This" button: renders, logs on click, shows animation
- SavingsDashboard: renders savings data, handles empty state

**Checkpoint 4**: Users can track savings. The money narrative is visible and shareable.

---

### Phase 5: Content & SEO Strategy (LOW effort, MEDIUM impact)
> *Not code — marketing positioning for organic growth.*

#### Task 5.1: SEO Keyword Targeting
Primary keywords (integrate into pages, meta tags, headings):
- "what to cook with ingredients I have" (high volume, low competition)
- "reduce food waste at home" (growing trend)
- "family meal planner free" (high intent)
- "budget cooking app" (underserved)
- "use up leftover ingredients" (long-tail, high intent)

#### Task 5.2: Landing Page Social Proof Section
**File**: `client/src/app/page.tsx`

Add after features grid:
- Food waste statistics: "The average family wastes $2,000/year in food"
- Value proposition reinforcement: "What To Cook users save an average of $X/week"
- (Placeholder for future testimonials)

#### Task 5.3: Open Graph / Social Sharing Meta
**File**: `client/src/app/layout.tsx`

- OG title: "What To Cook — Save Money by Cooking What You Have"
- OG description: compelling one-liner about waste reduction
- OG image: branded card showing savings/waste reduction theme

**Checkpoint 5**: SEO foundation set. Social sharing optimized. Content strategy documented.

---

## Dependency Map

```
Phase 1 (Messaging)          ← No dependencies, start immediately
    │
Phase 2 (User Preferences)   ← Can start in parallel with Phase 1
    │
Phase 3 (Pantry Freshness)   ← Depends on Phase 2 (category data)
    │
Phase 4 (Savings Tracker)    ← Depends on Phase 3 (ingredient tracking)
    │
Phase 5 (Content & SEO)      ← Can start in parallel with Phase 1
```

**Parallelizable**: Phase 1 + Phase 2 + Phase 5 can all start simultaneously.
**Sequential**: Phase 3 → Phase 4 (freshness data feeds savings calculations).

---

## Effort Estimate

| Phase | Tasks | New Files | Modified Files | New Tests (est.) |
|-------|-------|-----------|----------------|------------------|
| 1 | 4 | 0 | 3-4 | 0 (copy changes) |
| 2 | 4 | 1-2 | 3-4 | ~15-20 |
| 3 | 5 | 1 | 4-5 | ~20-25 |
| 4 | 5 | 2-3 | 2-3 | ~15-20 |
| 5 | 3 | 0 | 2 | 0 (content) |
| **Total** | **21** | **4-6** | **14-18** | **~50-65** |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Positioning clarity** | "So What?" test passes for landing page | Qualitative review |
| **First-value time** | < 60 seconds from landing to seeing a recipe | Manual testing |
| **User retention signal** | Users return within 7 days | Analytics (post-deploy) |
| **Savings engagement** | > 30% of users log at least 1 "I Cooked This" | Analytics (post-deploy) |
| **SEO ranking** | Page 1 for "what to cook with ingredients" | Google Search Console |
| **Organic signups** | 50 users in first month post-launch | Analytics |

---

## Risk Register

| Risk | Mitigation |
|------|-----------|
| Pantry schema migration breaks existing data | Write migration script; items array backward-compatible |
| Savings estimates feel inaccurate | Use conservative estimates; cite sources; let users adjust |
| "Use soon" badges annoy users | Make dismissible; add user preference to toggle |
| Positioning too narrow for investor pitch | Frame as "starting wedge" — expand after validating segment |
| Phase 3 pantry changes break 86 server tests | Run tests after each model change; update fixtures |

---

## Next Steps

1. **Review this workflow** and approve/adjust phases
2. Use `/sc:implement` to execute Phase 1 (messaging pivot — no backend changes)
3. Deploy Phase 1 immediately for user feedback
4. Execute Phases 2-4 iteratively with user validation between each

---

*This document contains the implementation plan only. No code has been written or modified.*

**Sources:**
- [Meal Planning App Market Size 2025-2033](https://www.marketreportanalytics.com/reports/meal-planning-app-75266)
- [AI-driven Meal Planning Apps Market (28.1% CAGR)](https://market.us/report/ai-driven-meal-planning-apps-market/)
- [Food Waste App Market Growth 2025](https://www.forinsightsconsultancy.com/reports/food-waste-app-market)
- [Best Meal Planning Apps 2026 — Ollie](https://ollie.ai/2025/10/21/best-meal-planning-apps-in-2025/)
- [Meal Planning App Market (10.5% CAGR)](https://www.businessresearchinsights.com/market-reports/meal-planning-app-market-113013)
- [Food Waste Reduction Market Analysis 2025-2035](https://www.factmr.com/report/food-waste-reduction-market)
