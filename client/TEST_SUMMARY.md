# Client Frontend Test Suite Summary

## Overview
All test files for the Next.js client frontend have been created with comprehensive test coverage for Phases 8-13 of the workflow.

## Test Statistics
- **Total Test Files**: 18
- **Total Tests**: 181
- **Total Lines**: ~3,089

## Test Files by Category

### Context Tests (2 files, 15 tests)
1. **context/ThemeContext.test.tsx** (6 tests)
   - Provides default theme "light"
   - toggleTheme switches light→dark and dark→light
   - Persists to localStorage
   - Reads initial theme from localStorage
   - Sets data-theme attribute on document
   - Throws error when used outside provider

2. **context/AuthContext.test.tsx** (9 tests)
   - Provides user: null initially
   - checkAuth calls /api/auth/me and sets user
   - Sets user to null on 401
   - Provides isAuthenticated boolean
   - Provides isLoading state
   - Login redirects to Google auth
   - Logout calls endpoint and clears user
   - Logout clears user even if API call fails
   - Throws error when used outside provider

### Component Tests (11 files, 90 tests)

#### UI Components (3 files, 28 tests)
3. **components/ui/Button.test.tsx** (11 tests)
   - Renders children text
   - Applies variant styles (primary, secondary, ghost)
   - Handles click events
   - Shows loading spinner when isLoading
   - Is disabled when disabled prop
   - Is disabled when isLoading
   - Applies opacity when disabled/loading
   - Defaults to primary variant

4. **components/ui/Card.test.tsx** (6 tests)
   - Renders children
   - Accepts className prop
   - Has cursor-pointer when onClick provided
   - Does not have cursor-pointer when onClick not provided
   - Handles click events
   - Applies default styles

5. **components/ui/Input.test.tsx** (11 tests)
   - Renders with label
   - Renders without label
   - Handles onChange
   - Shows error message
   - Error message has red text
   - Supports placeholder
   - Accepts value prop
   - Accepts type prop
   - Accepts className prop
   - Associates label with input
   - Applies focus styles

#### Feature Components (8 files, 62 tests)
6. **components/ThemeToggle.test.tsx** (5 tests)
   - Renders Moon icon in light mode
   - Renders Sun icon in dark mode
   - Calls toggleTheme on click
   - Has accessible label
   - Updates aria-label when theme changes

7. **components/Navbar.test.tsx** (8 tests)
   - Renders app name "What To Cook"
   - Shows "Sign in with Google" when not authenticated
   - Shows user name when authenticated
   - Shows nav links (Pantry, Recipes, Favorites) when authenticated
   - Does not show nav links when not authenticated
   - Includes ThemeToggle
   - Shows Logout button when authenticated
   - Renders user avatar when provided

8. **components/IngredientInput.test.tsx** (9 tests)
   - Renders input with "Add ingredient..." placeholder
   - Calls onAdd on Enter
   - Calls onAdd on button click
   - Clears input after adding
   - Does not add empty strings
   - Does not add whitespace-only strings
   - Trims input before adding
   - Renders Plus icon button
   - Prevents default form submission on Enter

9. **components/PantryList.test.tsx** (8 tests)
   - Renders list of items
   - Each item has remove button
   - Calls onRemove when clicked
   - Shows empty state message
   - Does not show items when empty
   - Renders X icon for each item
   - Has accessible aria-label for remove buttons
   - Renders multiple items correctly

10. **components/RecipeCard.test.tsx** (14 tests)
    - Renders recipe title
    - Shows image when provided
    - Shows fallback when no image
    - Shows cook time and servings
    - Shows source badge (Spoonacular/AI)
    - Shows save button when onSave provided
    - Does not show save button when onSave not provided
    - Calls onSave on heart click
    - Shows filled/unfilled heart based on isSaved
    - Updates aria-label when saved
    - Does not show cook time/servings if not provided

11. **components/RecipeDetail.test.tsx** (18 tests)
    - Renders title, image, ingredients, instructions
    - Renders cook time and servings
    - Renders nutrition info (calories, protein, carbs, fat)
    - Renders tags
    - Does not render sections when data not provided
    - Renders save button when onSave provided
    - Calls onSave when save button clicked
    - Shows filled/unfilled heart based on isSaved
    - Shows dash for missing nutrition values

### Library Tests (1 file, 8 tests)
12. **lib/api.test.ts** (8 tests)
    - api.get calls fetch with credentials: "include"
    - api.post sends JSON body
    - api.put sends JSON body
    - api.delete sends DELETE
    - Throws on non-OK response with error message
    - Throws on non-OK response with HTTP status fallback
    - Throws generic error if JSON parsing fails
    - Uses NEXT_PUBLIC_API_URL as base

### Page Tests (6 files, 68 tests)
13. **app/page.test.tsx** (10 tests)
    - Renders hero with title
    - Shows Get Started button
    - Shows feature highlights
    - Shows feature descriptions
    - Shows tagline
    - Renders ChefHat icon
    - Renders feature icons
    - Redirects to /pantry if authenticated
    - Does not render content while loading
    - Get Started button triggers login

14. **app/pantry/page.test.tsx** (11 tests)
    - Redirects if not authenticated
    - Loads pantry on mount
    - Adding ingredient calls API
    - Removing ingredient calls API
    - Shows "What Can I Cook?" button when items exist
    - Does not show button when pantry is empty
    - Navigates to recipes page with ingredients
    - Shows loading state
    - Reverts pantry on API error
    - Prevents duplicate ingredients
    - Converts ingredients to lowercase

15. **app/recipes/page.test.tsx** (11 tests)
    - Redirects if not authenticated
    - Calls suggest API with ingredients
    - Renders RecipeCards
    - Shows no recipes message
    - Shows error on API failure
    - Displays ingredients being searched
    - Shows loading state
    - Renders page title
    - Handles empty ingredients parameter
    - Saves recipe via API
    - Handles generic error message

16. **app/recipes/[id]/page.test.tsx** (11 tests)
    - Redirects if not authenticated
    - Fetches recipe by id
    - Renders recipe details
    - Shows recipe not found
    - Shows loading state
    - Renders save button
    - Saves recipe on button click
    - Ignores save errors silently
    - Renders recipe image
    - Renders nutrition information
    - Uses correct sourceId format

17. **app/favorites/page.test.tsx** (12 tests)
    - Redirects if not authenticated
    - Loads saved recipes
    - Shows empty state
    - Unsave removes card
    - Shows loading state
    - Renders page title
    - Passes isSaved prop to RecipeCard
    - Handles unsave API call
    - Removes recipe from list after unsave
    - Ignores fetch errors silently
    - Ignores unsave errors silently
    - Renders multiple recipes in grid

18. **app/layout.test.tsx** (13 tests)
    - Wraps with providers
    - Renders Navbar
    - Applies Inter font
    - Renders children inside main
    - Applies background color class
    - Applies antialiased class
    - Applies min-h-screen class
    - Main has max-width container
    - Main has padding
    - HTML has lang attribute
    - HTML has suppressHydrationWarning
    - Renders multiple children
    - Maintains layout structure

## Mock Patterns Used

### Standard Mocks
```javascript
// Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
  useParams: () => ({ id: mockId }),
}));

// Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Lucide React icons
jest.mock('lucide-react', () => ({
  IconName: (props) => <span data-testid="icon-name" {...props} />,
}));

// API client
jest.mock('@/lib/api');

// Contexts
jest.mock('@/context/AuthContext');
jest.mock('@/context/ThemeContext');
```

## Running Tests

```bash
# Run all tests
cd client && npm test

# Run tests in watch mode
cd client && npm run test:watch

# Run tests with coverage
cd client && npm test -- --coverage
```

## Test Coverage Areas

### ✅ Complete Coverage
- Context providers (Theme, Auth)
- UI components (Button, Card, Input)
- Feature components (Navbar, RecipeCard, RecipeDetail, etc.)
- API client
- All pages (Home, Pantry, Recipes, RecipeDetail, Favorites)
- Layout

### Testing Approach
- **Unit tests**: Individual component and utility testing
- **Integration tests**: Component interaction with contexts
- **User interaction**: Testing with @testing-library/user-event
- **Accessibility**: ARIA labels and semantic HTML
- **Error handling**: API failures, edge cases
- **Loading states**: Async operations
- **Authentication**: Protected routes, redirects

## Dependencies
- `@testing-library/react`: ^16.3.2
- `@testing-library/jest-dom`: ^6.9.1
- `@testing-library/user-event`: ^14.6.1
- `jest`: ^30.2.0
- `jest-environment-jsdom`: ^30.2.0

## Notes
- All tests use `@testing-library/jest-dom` for enhanced assertions
- Comprehensive mocking ensures tests run without external dependencies
- Tests follow TDD principles with clear, descriptive test names
- All asynchronous operations properly handled with `waitFor`
- localStorage and window.matchMedia properly mocked for theme tests
- Proper cleanup between tests to prevent state leakage
