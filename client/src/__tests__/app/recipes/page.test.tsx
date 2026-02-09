import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  Heart: ({ fill, ...props }: any) => <span data-testid="heart-icon" data-fill={fill} {...props} />,
  ChefHat: (props: any) => <span data-testid="chef-icon" {...props} />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));
jest.mock('@/components/RecipeFilters', () => {
  return function MockRecipeFilters({ filters, onChange }: any) {
    return (
      <div data-testid="recipe-filters">
        <select
          data-testid="meal-filter"
          value={filters.mealType}
          onChange={(e) => onChange({ ...filters, mealType: e.target.value })}
        >
          <option value="">Any</option>
          <option value="dinner">Dinner</option>
        </select>
      </div>
    );
  };
});
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
      .mockResolvedValueOnce(mockUser)        // auth/me
      .mockResolvedValueOnce({ recipes: mockRecipes }) // suggest
      .mockResolvedValueOnce([]);              // saved

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
      .mockResolvedValueOnce({ recipes: mockRecipes })
      .mockResolvedValueOnce([]);

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
      .mockResolvedValueOnce({ recipes: [] })
      .mockResolvedValueOnce([]);

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
      .mockResolvedValueOnce({ recipes: mockRecipes })
      .mockResolvedValueOnce([]);

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
      .mockResolvedValueOnce({ recipes: mockRecipes })
      .mockResolvedValueOnce([]);

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

  it('fetches saved recipes on mount to track saved state', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ recipes: mockRecipes })
      .mockResolvedValueOnce([]);

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/recipes/saved');
    });
  });

  it('shows filled heart for already-saved recipes', async () => {
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/auth/me') return Promise.resolve(mockUser);
      if (url.startsWith('/recipes/suggest')) return Promise.resolve({ recipes: mockRecipes });
      if (url === '/recipes/saved') return Promise.resolve([{ _id: 'saved1', sourceId: '1', title: 'Tomato Soup' }]);
      return Promise.reject(new Error('Unknown URL'));
    });

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
    });

    const hearts = screen.getAllByTestId('heart-icon');
    // First recipe (Tomato Soup, id=1) is saved, second (Onion Rings) is not
    expect(hearts[0]).toHaveAttribute('data-fill', 'currentColor');
    expect(hearts[1]).toHaveAttribute('data-fill', 'none');
  });

  it('saves a recipe and updates heart on click', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ recipes: mockRecipes })
      .mockResolvedValueOnce([]);
    (api.post as jest.Mock).mockResolvedValue({ _id: 'new-saved-id' });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
    });

    const saveButtons = screen.getAllByRole('button', { name: 'Save recipe' });
    await user.click(saveButtons[0]);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/recipes/saved', expect.objectContaining({
        title: 'Tomato Soup',
        source: 'spoonacular',
      }));
    });
  });

  it('renders RecipeFilters component', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ recipes: mockRecipes })
      .mockResolvedValueOnce([]);

    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('recipe-filters')).toBeInTheDocument();
    });
  });

  it('includes filter params in API call when filter changes', async () => {
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/auth/me') return Promise.resolve(mockUser);
      if (url.startsWith('/recipes/suggest')) return Promise.resolve({ recipes: mockRecipes });
      if (url === '/recipes/saved') return Promise.resolve([]);
      return Promise.reject(new Error('Unknown URL'));
    });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
    });

    // Change the meal filter
    await user.selectOptions(screen.getByTestId('meal-filter'), 'dinner');

    await waitFor(() => {
      const calls = (api.get as jest.Mock).mock.calls.map((c: any) => c[0]);
      expect(calls.some((url: string) => url.includes('mealType=dinner'))).toBe(true);
    });
  });

  it('shows toast after cooking a recipe', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ recipes: mockRecipes })
      .mockResolvedValueOnce([]);
    (api.post as jest.Mock).mockResolvedValue({ estimatedSavings: 8 });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
    });

    const cookButtons = screen.getAllByRole('button', { name: /cooked/i });
    await user.click(cookButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/saved ~\$8/i)).toBeInTheDocument();
    });
  });

  it('unsaves a recipe when clicking filled heart', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ recipes: mockRecipes })
      .mockResolvedValueOnce([{ _id: 'saved1', sourceId: '1', title: 'Tomato Soup' }]);
    (api.delete as jest.Mock).mockResolvedValue({});

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RecipesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tomato Soup')).toBeInTheDocument();
    });

    // First recipe is saved, so its button says "Unsave recipe"
    const unsaveButton = screen.getByRole('button', { name: 'Unsave recipe' });
    await user.click(unsaveButton);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/recipes/saved/saved1');
    });
  });
});
