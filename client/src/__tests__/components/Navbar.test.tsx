import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import api from '@/lib/api';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: any) => <a href={href}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));
jest.mock('lucide-react', () => ({
  ChefHat: () => <span data-testid="chef-hat-icon" />,
  Menu: () => <span data-testid="menu-icon" />,
  X: () => <span data-testid="x-icon" />,
  Sun: () => <span data-testid="sun-icon" />,
  Moon: () => <span data-testid="moon-icon" />,
}));

// Mock ThemeToggle
jest.mock('@/components/ThemeToggle', () => {
  return function MockThemeToggle() {
    return <button data-testid="theme-toggle">Theme Toggle</button>;
  };
});

// Mock Button component
jest.mock('@/components/ui/Button', () => {
  return function MockButton({ children, onClick, variant }: any) {
    return (
      <button onClick={onClick} data-variant={variant}>
        {children}
      </button>
    );
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
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
  });

  it('renders app name "What To Cook"', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getByText('What To Cook')).toBeInTheDocument();
  });

  it('shows "Sign in with Google" when not authenticated', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </ThemeProvider>
    );

    // Wait for loading to complete
    await screen.findByText('Sign in with Google');
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('shows user name when authenticated', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      preferences: {
        dietaryRestrictions: [],
        familySize: null,
      },
    };
    (api.get as jest.Mock).mockResolvedValue(mockUser);

    render(
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </ThemeProvider>
    );

    await screen.findByText('Test User');
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('shows nav links (Pantry, Recipes, Favorites) when authenticated', async () => {
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
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </ThemeProvider>
    );

    await screen.findByText('Test User');

    expect(screen.getByText('Pantry')).toBeInTheDocument();
    expect(screen.getByText('Recipes')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('does not show nav links when not authenticated', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </ThemeProvider>
    );

    await screen.findByText('Sign in with Google');

    expect(screen.queryByText('Pantry')).not.toBeInTheDocument();
    expect(screen.queryByText('Recipes')).not.toBeInTheDocument();
    expect(screen.queryByText('Favorites')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('History')).not.toBeInTheDocument();
  });

  it('includes ThemeToggle', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </ThemeProvider>
    );

    await screen.findByText('Sign in with Google');
    expect(screen.getAllByTestId('theme-toggle').length).toBeGreaterThanOrEqual(1);
  });

  it('shows Logout button when authenticated', async () => {
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
    (api.post as jest.Mock).mockResolvedValue({});

    render(
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </ThemeProvider>
    );

    await screen.findByText('Test User');
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders user avatar when provided', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      preferences: {
        dietaryRestrictions: [],
        familySize: null,
      },
    };
    (api.get as jest.Mock).mockResolvedValue(mockUser);

    render(
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </ThemeProvider>
    );

    await screen.findByText('Test User');
    const avatar = screen.getByAltText('Test User') as HTMLImageElement;
    expect(avatar).toBeInTheDocument();
    expect(avatar.src).toBe('https://example.com/avatar.jpg');
  });
});
