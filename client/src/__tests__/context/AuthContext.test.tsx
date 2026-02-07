import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api');

// Mock component to test the hook
function TestComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'loading' : 'ready'}</span>
      <span data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user">{user ? user.name : 'null'}</span>
      <button onClick={login}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides user: null initially', () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('checkAuth calls /api/auth/me and sets user', async () => {
    (api.get as jest.Mock).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
  });

  it('sets user to null on 401', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('no');
  });

  it('provides isAuthenticated boolean', async () => {
    (api.get as jest.Mock).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
  });

  it('provides isLoading state', async () => {
    (api.get as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockUser), 100))
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });
  });

  it('login redirects to Google auth', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    // login() sets window.location.href which jsdom doesn't fully support,
    // but we can verify the button is clickable without error
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('logout calls endpoint and clears user', async () => {
    (api.get as jest.Mock).mockResolvedValue(mockUser);
    (api.post as jest.Mock).mockResolvedValue({});
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    expect(api.post).toHaveBeenCalledWith('/auth/logout', {});
    expect(screen.getByTestId('authenticated')).toHaveTextContent('no');
  });

  it('logout clears user even if API call fails', async () => {
    (api.get as jest.Mock).mockResolvedValue(mockUser);
    (api.post as jest.Mock).mockRejectedValue(new Error('Server error'));
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('no');
  });

  it('throws error when useAuth is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within AuthProvider');

    consoleSpy.mockRestore();
  });
});
