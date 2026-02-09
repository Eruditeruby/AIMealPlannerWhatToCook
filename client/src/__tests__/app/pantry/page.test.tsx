import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PantryPage from '@/app/pantry/page';
import { AuthProvider } from '@/context/AuthContext';
import api from '@/lib/api';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));
jest.mock('lucide-react', () => ({
  ChefHat: (props: any) => <span data-testid="chef-hat-icon" {...props} />,
  Plus: (props: any) => <span data-testid="plus-icon" {...props} />,
  X: (props: any) => <span data-testid="x-icon" {...props} />,
  Refrigerator: (props: any) => <span data-testid="fridge-icon" {...props} />,
  Sparkles: (props: any) => <span data-testid="sparkles-icon" {...props} />,
  ShoppingBasket: (props: any) => <span data-testid="basket-icon" {...props} />,
  Users: (props: any) => <span data-testid="users-icon" {...props} />,
  Wallet: (props: any) => <span data-testid="wallet-icon" {...props} />,
  Leaf: (props: any) => <span data-testid="leaf-icon" {...props} />,
  ChevronRight: (props: any) => <span data-testid="chevron-right" {...props} />,
  ChevronLeft: (props: any) => <span data-testid="chevron-left" {...props} />,
  Clock: (props: any) => <span data-testid="clock-icon" {...props} />,
  AlertTriangle: (props: any) => <span data-testid="alert-icon" {...props} />,
  DollarSign: (props: any) => <span data-testid="dollar-icon" {...props} />,
  TrendingUp: (props: any) => <span data-testid="trending-icon" {...props} />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockPush = jest.fn();
const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  preferences: {
    dietaryRestrictions: [],
    familySize: null,
    budgetGoal: 'medium' as const,
    cookingSkill: 'intermediate' as const,
    householdType: 'family-small' as const,
    onboardingComplete: true,
  },
};

describe('Pantry page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects if not authenticated', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <PantryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('loads pantry on mount', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ items: ['tomato', 'onion'] });

    render(
      <AuthProvider>
        <PantryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/pantry');
    });

    expect(await screen.findByText('tomato')).toBeInTheDocument();
    expect(screen.getByText('onion')).toBeInTheDocument();
  });

  it('adding ingredient calls API', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ items: [] });
    (api.put as jest.Mock).mockResolvedValue({});

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <PantryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add ingredient...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Add ingredient...');
    await user.type(input, 'carrot{Enter}');

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/pantry', { items: ['carrot'] });
    });

    expect(screen.getByText('carrot')).toBeInTheDocument();
  });

  it('removing ingredient calls API', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ items: ['tomato', 'onion'] });
    (api.put as jest.Mock).mockResolvedValue({});

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <PantryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('tomato')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: 'Remove tomato' });
    await user.click(removeButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/pantry', { items: ['onion'] });
    });

    expect(screen.queryByText('tomato')).not.toBeInTheDocument();
  });

  it('shows "What Can I Cook?" button when items exist', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ items: ['tomato'] });

    render(
      <AuthProvider>
        <PantryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('What Can I Cook?')).toBeInTheDocument();
    });
  });

  it('does not show "What Can I Cook?" button when pantry is empty', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ items: [] });

    render(
      <AuthProvider>
        <PantryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Your pantry is empty. Add some ingredients to get started!')).toBeInTheDocument();
    });

    expect(screen.queryByText('What Can I Cook?')).not.toBeInTheDocument();
  });

  it('navigates to recipes page with ingredients', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ items: ['tomato', 'onion', 'garlic'] });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <PantryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('What Can I Cook?')).toBeInTheDocument();
    });

    const button = screen.getByText('What Can I Cook?');
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith('/recipes?ingredients=tomato,onion,garlic');
  });

  it('shows loading state', () => {
    (api.get as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <AuthProvider>
        <PantryPage />
      </AuthProvider>
    );

    expect(screen.getByText('Loading your pantry...')).toBeInTheDocument();
  });

  it('calls PUT API when adding ingredient', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ items: ['tomato'] });
    (api.put as jest.Mock).mockResolvedValue({ items: ['tomato', 'onion'] });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <PantryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('tomato')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Add ingredient...');
    await user.type(input, 'onion{Enter}');

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/pantry', { items: ['tomato', 'onion'] });
    });
  });

  it('prevents duplicate ingredients', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ items: ['tomato'] });
    (api.put as jest.Mock).mockResolvedValue({});

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <PantryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('tomato')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Add ingredient...');
    await user.type(input, 'Tomato{Enter}'); // Different case

    // Should not add duplicate (case-insensitive)
    expect(api.put).not.toHaveBeenCalled();
  });

  it('converts ingredients to lowercase', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce({ items: [] });
    (api.put as jest.Mock).mockResolvedValue({});

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <PantryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add ingredient...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Add ingredient...');
    await user.type(input, 'POTATO{Enter}');

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/pantry', { items: ['potato'] });
    });
  });
});
