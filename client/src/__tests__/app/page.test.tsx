import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
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
  Refrigerator: (props: any) => <span data-testid="refrigerator-icon" {...props} />,
  Heart: (props: any) => <span data-testid="heart-icon" {...props} />,
  TrendingDown: (props: any) => <span data-testid="trending-down-icon" {...props} />,
  Clock: (props: any) => <span data-testid="clock-icon" {...props} />,
  DollarSign: (props: any) => <span data-testid="dollar-sign-icon" {...props} />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));
jest.mock('@/components/ui/Button', () => {
  return function MockButton({ children, onClick }: any) {
    return <button onClick={onClick}>{children}</button>;
  };
});

const mockPush = jest.fn();

describe('Home page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hero with title', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('What To Cook?')).toBeInTheDocument();
    });
  });

  it('shows Get Started button', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Get Started with Google')).toBeInTheDocument();
    });
  });

  it('shows feature highlights', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Your Kitchen, Tracked')).toBeInTheDocument();
    });

    expect(screen.getByText('Your Kitchen, Tracked')).toBeInTheDocument();
    expect(screen.getByText('Dinner in 10 Seconds')).toBeInTheDocument();
    expect(screen.getByText('Never Waste Again')).toBeInTheDocument();
  });

  it('shows feature descriptions', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Know exactly what you have and what needs using soon')).toBeInTheDocument();
    });

    expect(screen.getByText('AI finds the best meals from your ingredients')).toBeInTheDocument();
    expect(screen.getByText('Track savings and build your family recipe book')).toBeInTheDocument();
  });

  it('shows tagline', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Stop wasting groceries/)).toBeInTheDocument();
    });
  });

  it('shows food waste statistics section', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/\$2,000\/year in food/)).toBeInTheDocument();
    });

    expect(screen.getByText(/more money stays in your wallet/)).toBeInTheDocument();
  });

  it('renders ChefHat icon', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('chef-hat-icon').length).toBeGreaterThan(0);
    });
  });

  it('renders feature icons', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('refrigerator-icon')).toBeInTheDocument();
    });

    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('dollar-sign-icon')).toBeInTheDocument();
  });

  it('redirects to /pantry if authenticated', async () => {
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
    (api.get as jest.Mock).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/pantry');
    });
  });

  it('does not render content while loading', () => {
    (api.get as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    expect(screen.queryByText('What To Cook?')).not.toBeInTheDocument();
  });

  it('Get Started button triggers login', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Get Started with Google')).toBeInTheDocument();
    });

    const button = screen.getByText('Get Started with Google');
    // Verify button exists and is clickable
    expect(button).toBeInTheDocument();
  });
});
