import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HistoryPage from '@/app/history/page';
import { AuthProvider } from '@/context/AuthContext';
import api from '@/lib/api';

jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));
jest.mock('lucide-react', () => ({
  BookOpen: () => <span data-testid="book-icon" />,
}));

const mockPush = jest.fn();

const mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  preferences: { dietaryRestrictions: [], familySize: null },
};

describe('History page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false, media: query, onchange: null,
        addListener: jest.fn(), removeListener: jest.fn(),
        addEventListener: jest.fn(), removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('redirects if not authenticated', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <HistoryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('renders page title', async () => {
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/auth/me') return Promise.resolve(mockUser);
      if (url === '/cooking/history') return Promise.resolve([]);
      return Promise.reject(new Error('Unknown'));
    });

    render(
      <AuthProvider>
        <HistoryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cooking History')).toBeInTheDocument();
    });
  });

  it('shows empty state when no history', async () => {
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/auth/me') return Promise.resolve(mockUser);
      if (url === '/cooking/history') return Promise.resolve([]);
      return Promise.reject(new Error('Unknown'));
    });

    render(
      <AuthProvider>
        <HistoryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No cooking history yet. Cook a recipe to start tracking!')).toBeInTheDocument();
    });
  });

  it('renders cooking history entries', async () => {
    const today = new Date().toISOString();
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/auth/me') return Promise.resolve(mockUser);
      if (url === '/cooking/history') return Promise.resolve([
        { _id: '1', recipeTitle: 'Chicken Stir Fry', estimatedSavings: 5, cookedAt: today },
        { _id: '2', recipeTitle: 'Pasta Primavera', estimatedSavings: 7, cookedAt: today },
      ]);
      return Promise.reject(new Error('Unknown'));
    });

    render(
      <AuthProvider>
        <HistoryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Chicken Stir Fry')).toBeInTheDocument();
    });
    expect(screen.getByText('Pasta Primavera')).toBeInTheDocument();
    expect(screen.getByText('$5 saved')).toBeInTheDocument();
    expect(screen.getByText('$7 saved')).toBeInTheDocument();
  });

  it('groups entries by date with Today label', async () => {
    const today = new Date().toISOString();
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/auth/me') return Promise.resolve(mockUser);
      if (url === '/cooking/history') return Promise.resolve([
        { _id: '1', recipeTitle: 'Test Recipe', estimatedSavings: 5, cookedAt: today },
      ]);
      return Promise.reject(new Error('Unknown'));
    });

    render(
      <AuthProvider>
        <HistoryPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
    });
  });
});
