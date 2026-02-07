# Frontend Testing Guide

## Quick Start

```bash
# Install dependencies (if not already done)
cd client
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- ThemeContext.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="renders"
```

## Test Organization

```
client/src/__tests__/
├── context/              # Context provider tests
│   ├── AuthContext.test.tsx
│   └── ThemeContext.test.tsx
├── components/           # Component tests
│   ├── ui/              # Base UI components
│   │   ├── Button.test.tsx
│   │   ├── Card.test.tsx
│   │   └── Input.test.tsx
│   ├── IngredientInput.test.tsx
│   ├── Navbar.test.tsx
│   ├── PantryList.test.tsx
│   ├── RecipeCard.test.tsx
│   ├── RecipeDetail.test.tsx
│   └── ThemeToggle.test.tsx
├── lib/                 # Utility tests
│   └── api.test.ts
└── app/                 # Page tests
    ├── page.test.tsx              # Home page
    ├── layout.test.tsx            # Root layout
    ├── pantry/
    │   └── page.test.tsx
    ├── recipes/
    │   ├── page.test.tsx          # Recipes list
    │   └── [id]/
    │       └── page.test.tsx      # Recipe detail
    └── favorites/
        └── page.test.tsx
```

## Writing New Tests

### Basic Test Structure

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import YourComponent from '@/components/YourComponent';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('YourComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

### Testing with Contexts

```typescript
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

render(
  <ThemeProvider>
    <AuthProvider>
      <YourComponent />
    </AuthProvider>
  </ThemeProvider>
);
```

### Testing Async Operations

```typescript
it('fetches data on mount', async () => {
  (api.get as jest.Mock).mockResolvedValue({ data: 'test' });
  
  render(<YourComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('test')).toBeInTheDocument();
  });
  
  expect(api.get).toHaveBeenCalledWith('/endpoint');
});
```

### Testing User Events

```typescript
it('submits form on enter', async () => {
  const handleSubmit = jest.fn();
  const user = userEvent.setup();
  
  render(<Form onSubmit={handleSubmit} />);
  
  const input = screen.getByRole('textbox');
  await user.type(input, 'test{Enter}');
  
  expect(handleSubmit).toHaveBeenCalledWith('test');
});
```

## Common Mock Patterns

### Mock Next.js Navigation

```typescript
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: jest.fn() }),
  useParams: () => ({ id: '123' }),
}));
```

### Mock Framer Motion

```typescript
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));
```

### Mock Lucide React Icons

```typescript
jest.mock('lucide-react', () => ({
  ChefHat: (props: any) => <span data-testid="chef-hat-icon" {...props} />,
  Heart: (props: any) => <span data-testid="heart-icon" {...props} />,
  Plus: (props: any) => <span data-testid="plus-icon" {...props} />,
}));
```

### Mock API Client

```typescript
import api from '@/lib/api';
jest.mock('@/lib/api');

// In test
(api.get as jest.Mock).mockResolvedValue({ data: 'test' });
(api.post as jest.Mock).mockRejectedValue(new Error('Failed'));
```

### Mock localStorage

```typescript
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('theme', 'dark');
});
```

### Mock window.matchMedia

```typescript
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Testing Checklist

When writing tests for a new component, ensure you test:

- [ ] Component renders without crashing
- [ ] All props are handled correctly
- [ ] User interactions (clicks, typing, etc.)
- [ ] Conditional rendering
- [ ] Error states
- [ ] Loading states
- [ ] API calls (if applicable)
- [ ] Navigation (if applicable)
- [ ] Accessibility (ARIA labels, semantic HTML)
- [ ] Edge cases (empty arrays, null values, etc.)

## Best Practices

1. **Use data-testid sparingly**: Prefer semantic queries (getByRole, getByLabelText)
2. **Test user behavior, not implementation**: Focus on what users see and do
3. **Avoid snapshot tests**: They're brittle and hard to maintain
4. **Mock external dependencies**: Keep tests isolated
5. **Clean up after tests**: Use beforeEach/afterEach
6. **Use async/await**: Properly handle async operations
7. **Test error cases**: Don't just test the happy path
8. **Keep tests focused**: One assertion per test when possible
9. **Use descriptive test names**: "it renders the user's name when authenticated"
10. **Group related tests**: Use describe blocks

## Debugging Tests

### Common Issues

**Test times out:**
```typescript
// Add waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

**Element not found:**
```typescript
// Use screen.debug() to see what's rendered
screen.debug();

// Or debug a specific element
screen.debug(screen.getByTestId('my-element'));
```

**Act warning:**
```typescript
// Wrap state updates in act
await act(async () => {
  await user.click(button);
});
```

**Mock not working:**
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Useful Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run only failed tests
npm test -- --onlyFailures

# Update snapshots (if using)
npm test -- -u

# Run with coverage
npm test -- --coverage --watchAll=false

# Run specific test suite
npm test -- Button.test.tsx
```

## Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Common Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
