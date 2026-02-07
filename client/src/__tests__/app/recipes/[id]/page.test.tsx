import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RecipeDetailPage from '@/app/recipes/[id]/page';
import { AuthProvider } from '@/context/AuthContext';
import api from '@/lib/api';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    id: mockRecipeId,
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
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));
jest.mock('@/components/ui/Button', () => {
  return function MockButton({ children, onClick, variant }: any) {
    return (
      <button onClick={onClick} data-variant={variant}>
        {children}
      </button>
    );
  };
});

const mockPush = jest.fn();
let mockRecipeId = '123';

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

const mockRecipe = {
  title: 'Spaghetti Carbonara',
  image: 'https://example.com/carbonara.jpg',
  instructions: '<ol><li>Boil pasta</li><li>Cook bacon</li></ol>',
  ingredients: ['500g spaghetti', '200g bacon', '4 eggs'],
  cookTime: 25,
  servings: 4,
  nutrition: {
    calories: 650,
    protein: 28,
    carbs: 75,
    fat: 24,
  },
};

describe('Recipe Detail page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecipeId = '123';
  });

  it('redirects if not authenticated', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <RecipeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('fetches recipe by id', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockRecipe);

    render(
      <AuthProvider>
        <RecipeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/recipes/123');
    });
  });

  it('renders recipe details', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockRecipe);

    render(
      <AuthProvider>
        <RecipeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    expect(screen.getByText('500g spaghetti')).toBeInTheDocument();
    expect(screen.getByText('200g bacon')).toBeInTheDocument();
    expect(screen.getByText('4 eggs')).toBeInTheDocument();
  });

  it('shows recipe not found', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockRejectedValueOnce(new Error('Not found'));

    render(
      <AuthProvider>
        <RecipeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipe not found.')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    (api.get as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <AuthProvider>
        <RecipeDetailPage />
      </AuthProvider>
    );

    expect(screen.getByText('Loading recipe...')).toBeInTheDocument();
  });

  it('renders save button', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockRecipe);

    render(
      <AuthProvider>
        <RecipeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button');
    expect(saveButton).toBeInTheDocument();
  });

  it('saves recipe on button click', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockRecipe);
    (api.post as jest.Mock).mockResolvedValue({});

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RecipeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button');
    await user.click(saveButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/recipes/saved', {
        title: 'Spaghetti Carbonara',
        image: 'https://example.com/carbonara.jpg',
        source: 'spoonacular',
        sourceId: '123',
        instructions: '<ol><li>Boil pasta</li><li>Cook bacon</li></ol>',
        ingredients: ['500g spaghetti', '200g bacon', '4 eggs'],
        cookTime: 25,
        servings: 4,
        nutrition: mockRecipe.nutrition,
      });
    });
  });

  it('ignores save errors silently', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockRecipe);
    (api.post as jest.Mock).mockRejectedValue(new Error('Save failed'));

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RecipeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button');
    await user.click(saveButton);

    // Should not throw or show error
    expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
  });

  it('renders recipe image', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockRecipe);

    render(
      <AuthProvider>
        <RecipeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      const image = screen.getByAltText('Spaghetti Carbonara') as HTMLImageElement;
      expect(image).toBeInTheDocument();
      expect(image.src).toBe('https://example.com/carbonara.jpg');
    });
  });

  it('renders nutrition information', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockRecipe);

    render(
      <AuthProvider>
        <RecipeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    expect(screen.getByText('650')).toBeInTheDocument(); // Calories
    expect(screen.getByText('28g')).toBeInTheDocument(); // Protein
    expect(screen.getByText('75g')).toBeInTheDocument(); // Carbs
    expect(screen.getByText('24g')).toBeInTheDocument(); // Fat
  });

  it('uses correct sourceId format', async () => {
    mockRecipeId = '456';
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockRecipe);
    (api.post as jest.Mock).mockResolvedValue({});

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RecipeDetailPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button');
    await user.click(saveButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/recipes/saved', expect.objectContaining({
        sourceId: '456',
      }));
    });
  });
});
