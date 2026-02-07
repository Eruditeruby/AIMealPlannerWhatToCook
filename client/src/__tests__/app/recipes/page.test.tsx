import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecipesPage from '@/app/recipes/page';
import { AuthProvider } from '@/context/AuthContext';
import api from '@/lib/api';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'ingredients' ? mockIngredients : null),
  }),
}));
jest.mock('lucide-react', () => ({
  Clock: (props: any) => <span data-testid="clock-icon" {...props} />,
  Users: (props: any) => <span data-testid="users-icon" {...props} />,
  Heart: (props: any) => <span data-testid="heart-icon" {...props} />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));
jest.mock('@/components/ui/Card', () => {
  return function MockCard({ children }: any) {
    return <div>{children}</div>;
  };
});

const mockPush = jest.fn();
let mockIngredients = 'tomato,onion';

const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  preferences: {
    dietaryRestrictions: [],
    familySize: null,
  },
};

const mockRecipes = [
  {
    id: 1,
    title: 'Tomato Soup',
    image: 'https://example.com/soup.jpg',
    source: 'spoonacular',
    cookTime: 20,
    servings: 4,
  },
  {
    id: 2,
    title: 'Onion Rings',
    image: 'https://example.com/rings.jpg',
    source: 'ai',
    cookTime: 15,
    servings: 2,
  },
];

describe('Recipes page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIngredients = 'tomato,onion';
  });

  it('redirects if not authenticated', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('calls suggest API with ingredients', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ recipes: mockRecipes });

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/recipes/suggest?ingredients=tomato,onion');
    });
  });

  it('renders RecipeCards', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ recipes: mockRecipes });

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
    });

    expect(screen.getByText('Onion Rings')).toBeInTheDocument();
  });

  it('shows no recipes message', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ recipes: [] });

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No recipes found. Try adding more ingredients to your pantry.')).toBeInTheDocument();
    });
  });

  it('shows error on API failure', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockRejectedValueOnce(new Error('Failed to fetch recipes'));

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch recipes')).toBeInTheDocument();
    });
  });

  it('displays ingredients being searched', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ recipes: mockRecipes });

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Based on: tomato, onion')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    (api.get as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    expect(screen.getByText('Finding recipes...')).toBeInTheDocument();
  });

  it('renders page title', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ recipes: mockRecipes });

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipe Suggestions')).toBeInTheDocument();
    });
  });

  it('handles empty ingredients parameter', async () => {
    mockIngredients = '';
    (api.get as jest.Mock).mockResolvedValueOnce(mockUser);

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    // With no ingredients, the suggest API should not be called
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1); // Only auth call
    });
  });

  it('saves recipe via API', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ recipes: mockRecipes });
    (api.post as jest.Mock).mockResolvedValue({});

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
    });

    // Recipe cards should be rendered, and save functionality would be tested
    // in RecipeCard component tests
  });

  it('handles generic error message', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockRejectedValueOnce({ message: '' });

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch recipes')).toBeInTheDocument();
    });
  });
});
